'use client';

import Image from 'next/image';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export type RestaurantCategory = {
  id: number;
  name: string;
  isCustom: boolean;
};

export type RestaurantImage = {
  id: number;
  url: string;
  order: number;
  restaurantId: number;
};

export type RestaurantWithRelations = {
  id: number;
  name: string;
  note: string | null;
  createdAt: string;
  rating: number | null | undefined;
  categories: RestaurantCategory[];
  images: RestaurantImage[];
};

type RestaurantCardProps = {
  restaurant: RestaurantWithRelations;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
  onEdit?: (restaurant: RestaurantWithRelations) => void;
};

export function RestaurantCard({
  restaurant,
  onDelete,
  isDeleting,
  onEdit
}: RestaurantCardProps) {
  const coverImage =
    restaurant.images.find((img) => img.order === 1) ?? restaurant.images[0];

  const createdLabel = new Date(restaurant.createdAt).toLocaleDateString();
  const ratingLabel =
    typeof restaurant.rating === 'number' && restaurant.rating > 0
      ? `⭐ ${restaurant.rating.toFixed(1)}`
      : null;

  return (
    <Card className="overflow-hidden flex flex-col">
      {coverImage ? (
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={coverImage.url}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-40 w-full items-center justify-center bg-muted text-sm text-muted-foreground">
          No image
        </div>
      )}
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-start justify-between gap-2">
          <span className="truncate">{restaurant.name}</span>
          <span className="flex flex-col items-end gap-0.5 text-[10px] font-normal text-muted-foreground">
            <span>{createdLabel}</span>
            {ratingLabel && (
              <span className="text-[10px] text-foreground">{ratingLabel}</span>
            )}
          </span>
        </CardTitle>
        {restaurant.note && (
          <CardDescription className="line-clamp-2">
            {restaurant.note}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {restaurant.categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {restaurant.categories.map((category) => (
              <Badge key={category.id} variant="outline">
                {category.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto flex justify-end gap-2">
        {onEdit && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit(restaurant)}
          >
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDelete(restaurant.id)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

