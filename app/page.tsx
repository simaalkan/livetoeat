import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { revalidatePath } from 'next/cache';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

type Restaurant = {
  id: number;
  name: string;
  notes: string | null;
  imagePath: string | null;
  createdAt: Date;
};

async function getRestaurants(): Promise<Restaurant[]> {
  return prisma.restaurant.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

async function saveImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const filePath = path.join(uploadDir, fileName);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  await writeFile(filePath, buffer);

  return `/uploads/${fileName}`;
}

export default async function HomePage() {
  const restaurants = await getRestaurants();

  async function addRestaurant(formData: FormData) {
    'use server';

    const name = formData.get('name')?.toString().trim();
    const notes = formData.get('notes')?.toString().trim() || null;
    const image = formData.get('image') as File | null;

    if (!name) {
      return;
    }

    const imagePath = await saveImage(image);

    await prisma.restaurant.create({
      data: {
        name,
        notes,
        imagePath
      }
    });

    revalidatePath('/');
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40">
        <h2 className="text-xl font-semibold tracking-tight">
          Add a favorite restaurant
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Track places you love with an optional photo and notes.
        </p>

        <form
          action={addRestaurant}
          className="mt-6 grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start"
          encType="multipart/form-data"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-200"
              >
                Restaurant name
              </label>
              <input
                id="name"
                name="name"
                required
                placeholder="e.g. Sushi Kaito"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 shadow-inner shadow-black/40 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-slate-200"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                placeholder="What do you like here? Favorite dishes, vibes, etc."
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-500 shadow-inner shadow-black/40 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="image"
                className="block text-sm font-medium text-slate-200"
              >
                Photo (optional)
              </label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-sky-500 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-50 hover:file:bg-sky-400"
              />
              <p className="text-xs text-slate-500">
                Images are stored locally in the app&apos;s `public/uploads`
                folder.
              </p>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-md shadow-sky-500/30 transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Save restaurant
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold tracking-tight">
            Favorite Restaurants
          </h2>
          <span className="text-xs text-slate-500">
            {restaurants.length === 0
              ? 'No restaurants yet'
              : `${restaurants.length} saved`}
          </span>
        </div>

        {restaurants.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 px-6 py-10 text-center text-sm text-slate-400">
            Start by adding your first favorite spot. You can always edit the
            database later with Prisma if needed.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <article
                key={restaurant.id}
                className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-slate-950/40 transition hover:border-sky-500/70 hover:shadow-sky-950/40"
              >
                {restaurant.imagePath && (
                  <div className="relative h-40 w-full overflow-hidden border-b border-slate-800">
                    <Image
                      src={restaurant.imagePath}
                      alt={restaurant.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                )}
                <div className="flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-50">
                      {restaurant.name}
                    </h3>
                    <time
                      dateTime={restaurant.createdAt.toISOString()}
                      className="shrink-0 text-[10px] uppercase tracking-wide text-slate-500"
                    >
                      {restaurant.createdAt.toLocaleDateString()}
                    </time>
                  </div>
                  {restaurant.notes && (
                    <p className="text-xs text-slate-300">
                      {restaurant.notes}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

