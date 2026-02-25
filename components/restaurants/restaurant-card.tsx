'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star } from "lucide-react";
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

// --- STATİK RATING BİLEŞENİ ---
export function Rating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={18}
          className={`${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          } transition-colors`}
        />
      ))}
    </div>
  );
}

// --- TİPLER ---
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

// --- ANA KART BİLEŞENİ ---
export function RestaurantCard({
  restaurant,
  onDelete,
  isDeleting,
  onEdit
}: RestaurantCardProps) {
  const coverImage =
    restaurant.images.find((img) => img.order === 1) ?? restaurant.images[0];

  const createdLabel = new Date(restaurant.createdAt).toLocaleDateString();

  return (
    <Link href={`/restaurants/${restaurant.id}`} className="block h-full group">
      <Card className="overflow-hidden flex flex-col h-full shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:border-primary/20">
        {coverImage ? (
          <div className="relative h-40 w-full overflow-hidden mb-1"> {/* mb-1: Resmin altına çok hafif boşluk */}
            <Image
              src={coverImage.url}
              alt={restaurant.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-muted text-sm text-muted-foreground mb-1">
            No image
          </div>
        )}
        
        {/* pt-5 eklenerek isim resimden uzaklaştırıldı */}
        <CardHeader className="space-y-1 pt-5"> 
          <CardTitle className="flex items-start justify-between gap-2 text-lg">
            <span className="truncate group-hover:text-primary transition-colors">
              {restaurant.name}
            </span>
            <span className="text-[10px] font-normal text-muted-foreground pt-1 flex-shrink-0">
              {createdLabel}
            </span>
          </CardTitle>
          {restaurant.note && (
            <CardDescription className="line-clamp-2 italic text-xs">
              &quot;{restaurant.note}&quot;
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="pt-2 flex-1 space-y-4"> {/* pt-2 ile header ile içerik arası dengelendi */}
          {/* Kategoriler */}
          {restaurant.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {restaurant.categories.map((category) => (
                <Badge key={category.id} variant="outline" className="text-[10px] px-1.5 py-0 bg-background/50">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}

          {/* --- STATİK PUAN ALANI --- */}
          <div className="pt-3 border-t mt-auto">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Rating
            </p>
            <Rating rating={restaurant.rating || 0} />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 bg-muted/20 py-3 border-t mt-auto relative z-20">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs bg-background hover:bg-background/80 shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(restaurant);
              }}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-destructive bg-background hover:bg-destructive/10 shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(restaurant.id);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}