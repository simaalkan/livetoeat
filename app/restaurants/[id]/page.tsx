import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RatingStars } from '@/components/restaurants/rating-stars';

type RestaurantPageProps = {
  params: {
    id: string;
  };
};

export const runtime = 'nodejs';

export default async function RestaurantDetailPage({
  params
}: RestaurantPageProps) {
  const id = Number(params.id);

  if (!id || Number.isNaN(id)) {
    notFound();
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      categories: true,
      images: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!restaurant) {
    notFound();
  }

  const hasImages = restaurant.images.length > 0;
  const [primaryImage, ...secondaryImages] = restaurant.images;

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="outline">
          <Link href="/restaurants">Back to list</Link>
        </Button>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)] items-start">
        <Card className="overflow-hidden">
          {hasImages ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {primaryImage && (
                <div className="relative aspect-[4/3] w-full sm:col-span-2">
                  <Image
                    src={primaryImage.url}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {secondaryImages.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-[4/3] w-full overflow-hidden rounded-md"
                >
                  <Image
                    src={image.url}
                    alt={restaurant.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center bg-muted text-sm text-muted-foreground">
              No images available for this restaurant.
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{restaurant.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RatingStars
                restaurantId={restaurant.id}
                initialRating={restaurant.rating}
              />

              {restaurant.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {restaurant.categories.map((category) => (
                    <Badge key={category.id} variant="outline">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              )}

              {restaurant.note && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {restaurant.note}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Added on{' '}
                {restaurant.createdAt.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

