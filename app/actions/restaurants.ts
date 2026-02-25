import { mkdir, unlink, writeFile } from 'fs/promises';
import path from 'path';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';

export type RestaurantFormState = {
  error?: string;
};

export type RatingFormState = {
  error?: string;
};

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

const DEFAULT_CATEGORY_NAMES = ['Cafe', 'Pub', 'Restaurant'] as const;

async function ensureDefaultCategories() {
  await Promise.all(
    DEFAULT_CATEGORY_NAMES.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name, isCustom: false }
      })
    )
  );
}

async function saveImageFile(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error('Empty image file.');
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const safeName = file.name.replace(/\s+/g, '-');
  const fileName = `${Date.now()}-${safeName}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  return `/uploads/${fileName}`;
}

async function deleteImageFile(url: string) {
  if (!url.startsWith('/')) return;

  const filePath = path.join(process.cwd(), 'public', url.replace(/^\/+/, ''));

  try {
    await unlink(filePath);
  } catch {
    // Ignore errors if the file does not exist.
  }
}

export async function addRestaurantAction(
  _prevState: RestaurantFormState,
  formData: FormData
): Promise<RestaurantFormState> {
  'use server';

  const name = formData.get('name')?.toString().trim() ?? '';
  const note = formData.get('note')?.toString().trim() || null;

  if (!name) {
    return { error: 'Name is required.' };
  }

  await ensureDefaultCategories();

  const categoryNames = formData
    .getAll('categories')
    .map((value) => value.toString().trim())
    .filter(Boolean);

  const categoryConnect = await Promise.all(
    categoryNames.map(async (catName) => {
      const isDefault = DEFAULT_CATEGORY_NAMES.includes(
        catName as (typeof DEFAULT_CATEGORY_NAMES)[number]
      );

      const category = await prisma.category.upsert({
        where: { name: catName },
        update: {},
        create: {
          name: catName,
          isCustom: !isDefault
        }
      });

      return { id: category.id };
    })
  );

  const restaurant = await prisma.restaurant.create({
    data: {
      name,
      note,
      categories: {
        connect: categoryConnect
      }
    }
  });

  for (let order = 1; order <= 5; order++) {
    const file = formData.get(`image_${order}`) as File | null;
    if (!file || file.size === 0) continue;

    const url = await saveImageFile(file);

    await prisma.image.create({
      data: {
        url,
        order,
        restaurantId: restaurant.id
      }
    });
  }

  revalidatePath('/');

  return {};
}

export async function rateRestaurantAction(
  _prevState: RatingFormState,
  formData: FormData
): Promise<RatingFormState> {
  'use server';

  const idRaw =
    formData.get('id')?.toString() ?? formData.get('restaurantId')?.toString();
  const ratingRaw = formData.get('rating')?.toString();

  const id = idRaw ? Number(idRaw) : NaN;
  const rating = ratingRaw ? Number(ratingRaw) : NaN;

  if (!id || Number.isNaN(id)) {
    return { error: 'Invalid restaurant id.' };
  }

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return { error: 'Rating must be between 1 and 5.' };
  }

  await prisma.restaurant.update({
    where: { id },
    data: {
      rating
    }
  });

  revalidatePath('/');
  revalidatePath('/restaurants');
  revalidatePath(`/restaurants/${id}`);

  return {};
}

export async function updateRestaurantAction(
  _prevState: RestaurantFormState,
  formData: FormData
): Promise<RestaurantFormState> {
  'use server';

  const idRaw = formData.get('id')?.toString();
  const id = idRaw ? Number(idRaw) : NaN;
  if (!id || Number.isNaN(id)) {
    return { error: 'Missing restaurant id.' };
  }

  const name = formData.get('name')?.toString().trim() ?? '';
  const note = formData.get('note')?.toString().trim() || null;

  if (!name) {
    return { error: 'Name is required.' };
  }

  await ensureDefaultCategories();

  const existingImages = await prisma.image.findMany({
    where: { restaurantId: id }
  });

  const deleteImageIds = formData
    .getAll('deleteImageIds')
    .map((value) => Number(value.toString()))
    .filter((value) => Number.isFinite(value) && value > 0);

  const categoryNames = formData
    .getAll('categories')
    .map((value) => value.toString().trim())
    .filter(Boolean);

  const categoryConnect = await Promise.all(
    categoryNames.map(async (catName) => {
      const isDefault = DEFAULT_CATEGORY_NAMES.includes(
        catName as (typeof DEFAULT_CATEGORY_NAMES)[number]
      );

      const category = await prisma.category.upsert({
        where: { name: catName },
        update: {},
        create: {
          name: catName,
          isCustom: !isDefault
        }
      });

      return { id: category.id };
    })
  );

  await prisma.restaurant.update({
    where: { id },
    data: {
      name,
      note,
      categories: {
        set: [],
        connect: categoryConnect
      }
    }
  });

  if (deleteImageIds.length > 0) {
    await prisma.image.deleteMany({
      where: {
        id: { in: deleteImageIds },
        restaurantId: id
      }
    });
  }

  const remainingImages = existingImages.filter(
    (image) => !deleteImageIds.includes(image.id)
  );

  const newFiles: File[] = [];
  for (let index = 1; index <= 5; index++) {
    const file = formData.get(`newImage_${index}`) as File | null;
    if (file && file.size > 0) {
      newFiles.push(file);
    }
  }

  const usedOrders = new Set(remainingImages.map((image) => image.order));

  for (const file of newFiles) {
    let order = 1;
    while (order <= 5 && usedOrders.has(order)) {
      order++;
    }
    if (order > 5) break;

    const url = await saveImageFile(file);

    await prisma.image.create({
      data: {
        url,
        order,
        restaurantId: id
      }
    });

    usedOrders.add(order);
  }

  revalidatePath('/');

  return {};
}

export async function deleteRestaurantAction(id: number): Promise<void> {
  'use server';

  if (!id) return;

  const images = await prisma.image.findMany({
    where: { restaurantId: id }
  });

  await prisma.$transaction([
    prisma.image.deleteMany({ where: { restaurantId: id } }),
    prisma.restaurant.delete({ where: { id } })
  ]);

  await Promise.all(images.map((image) => deleteImageFile(image.url)));

  revalidatePath('/');
}

