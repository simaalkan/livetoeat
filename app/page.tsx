import { prisma } from '@/lib/prisma';
import { RestaurantsDashboard } from '@/components/restaurants/dashboard';

export const runtime = 'nodejs';

export default async function HomePage() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      categories: true,
      images: true
    }
  });

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  const initialRestaurants = restaurants.map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    note: restaurant.note,
    createdAt: restaurant.createdAt.toISOString(),
    rating: restaurant.rating,
    categories: restaurant.categories.map((category) => ({
      id: category.id,
      name: category.name,
      isCustom: category.isCustom
    })),
    images: restaurant.images.map((image) => ({
      id: image.id,
      url: image.url,
      order: image.order,
      restaurantId: image.restaurantId
    }))
  }));

  const allCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    isCustom: category.isCustom
  }));

  return <RestaurantsDashboard initialRestaurants={initialRestaurants} allCategories={allCategories} />;
}


