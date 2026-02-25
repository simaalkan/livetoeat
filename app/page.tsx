import { prisma } from '@/lib/prisma';
import { RestaurantsDashboard } from '@/components/restaurants/dashboard';

export const runtime = 'nodejs';

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  // 1. Sayfa numarasını al (varsayılan 1)
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);
  const pageSize = 20;

  // 2. Toplam restoran sayısını ve verileri çek
  const [restaurants, totalCount, categories] = await Promise.all([
    prisma.restaurant.findMany({
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        categories: true,
        images: true
      }
    }),
    prisma.restaurant.count(),
    prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  // 3. Verileri arayüze uygun formata çevir
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

  return (
    <div className="space-y-8">
      <RestaurantsDashboard 
        initialRestaurants={initialRestaurants} 
        allCategories={allCategories} 
      />
      
      {/* Basit Sayfalama Navigasyonu */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pb-10">
          <a
            href={`/?page=${currentPage - 1}`}
            className={`px-4 py-2 border rounded-md ${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100'}`}
          >
            Geri
          </a>
          <span className="text-sm font-medium">
            Sayfa {currentPage} / {totalPages}
          </span>
          <a
            href={`/?page=${currentPage + 1}`}
            className={`px-4 py-2 border rounded-md ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-100'}`}
          >
            İleri
          </a>
        </div>
      )}
    </div>
  );
}