import Link from 'next/link';

import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

type RestaurantItem = {
  id: number;
  name: string;
  note: string | null;
  createdAt: Date;
};

async function getRestaurants(): Promise<RestaurantItem[]> {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: 'desc' }
  });

  if (restaurants.length > 0) {
    return restaurants;
  }

  const now = new Date();

  const mock: RestaurantItem[] = [
    {
      id: -1,
      name: 'Mock Cafe Aurora',
      note: 'Cozy spot with great cappuccinos and pastries.',
      createdAt: now
    },
    {
      id: -2,
      name: 'Mock Sakura Sushi',
      note: 'Fresh nigiri and omakase-style tasting menu.',
      createdAt: now
    },
    {
      id: -3,
      name: 'Mock Night Owl Pub',
      note: 'Late-night bites, craft beers, and live music.',
      createdAt: now
    }
  ];

  return mock;
}

export const runtime = 'nodejs';

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants();

  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Restaurants
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse your favorite places. This list pulls from the Restaurant
          database and falls back to mock data if empty.
        </p>
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="flex flex-col overflow-hidden">
              <div className="flex h-32 items-center justify-center bg-muted text-sm text-muted-foreground">
                Placeholder image
              </div>
              <CardHeader>
                <CardTitle className="truncate">{restaurant.name}</CardTitle>
                {restaurant.note && (
                  <CardDescription className="line-clamp-2">
                    {restaurant.note}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  Added on{' '}
                  {restaurant.createdAt.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link href={`/restaurants/${restaurant.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

