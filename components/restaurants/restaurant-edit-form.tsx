"use client";

import * as React from 'react';
import Image from 'next/image';
import { Star } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type CategoryOption = { id: number; name: string; };
type ImageOption = { id: number; url: string; order: number; restaurantId: number; };

type RestaurantEditFormProps = {
  restaurant: {
    id: number;
    name: string;
    note: string | null;
    rating: number | null | undefined;
    categories: CategoryOption[];
    images: ImageOption[];
  };
  categories: CategoryOption[];
  isSubmitting: boolean;
  onSubmit: (formData: FormData) => void | Promise<void>;
};

export function RestaurantEditForm({
  restaurant,
  categories,
  isSubmitting,
  onSubmit
}: RestaurantEditFormProps) {
  const [searchCategory, setSearchCategory] = React.useState('');
  const [selectedCategoryNames, setSelectedCategoryNames] = React.useState<string[]>(() => 
    restaurant.categories.map((c) => c.name)
  );
  const [removedImageIds, setRemovedImageIds] = React.useState<number[]>([]);
  const [rating, setRating] = React.useState<number>(restaurant.rating || 0);
  const [hover, setHover] = React.useState<number>(0);

  const toggleCategory = (name: string) => {
    setSelectedCategoryNames((current) =>
      current.includes(name) ? current.filter((v) => v !== name) : [...current, name]
    );
  };

  const toggleRemoveImage = (id: number) => {
    setRemovedImageIds((current) =>
      current.includes(id) ? current.filter((v) => v !== id) : [...current, id]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('id', restaurant.id.toString());
    formData.set('rating', rating.toString());

    selectedCategoryNames.forEach((name) => {
      formData.append('categories', name);
    });

    removedImageIds.forEach((id) => {
      formData.append('deleteImageIds', id.toString());
    });

    await onSubmit(formData);
  };

  return (
    <Card className="flex flex-col h-full max-h-[85vh] border-none shadow-none">
      <CardHeader className="flex-none px-0">
        <CardTitle>Edit restaurant</CardTitle>
        <CardDescription>Manage images and select categories.</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden px-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full" encType="multipart/form-data">
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input name="name" required defaultValue={restaurant.name} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}>
                    <Star size={24} className={star <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Existing images (Click to remove)</label>
              <div className="grid grid-cols-3 gap-2">
                {restaurant.images.filter(img => !removedImageIds.includes(img.id)).map((image) => (
                  <div key={image.id} className="relative aspect-square cursor-pointer" onClick={() => toggleRemoveImage(image.id)}>
                    <Image src={image.url} alt="" fill className="object-cover rounded-md border" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-[10px]">Remove</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Add new images</p>
              <div className="grid gap-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <Input key={i} name={`newImage_${i + 1}`} type="file" accept="image/*" />
                ))}
              </div>
            </div>

            <div className="space-y-3 pb-4">
              <p className="text-sm font-medium">Categories</p>
              <Input placeholder="Search..." value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} />
              <div className="flex flex-wrap gap-1">
                {categories.filter(c => c.name.toLowerCase().includes(searchCategory.toLowerCase())).map((category) => {
                  const isSelected = selectedCategoryNames.includes(category.name);
                  return (
                    <Badge 
                      key={category.id} 
                      variant={isSelected ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleCategory(category.name)}
                    >
                      {category.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-none pt-4 bg-background border-t mt-auto">
            <Button type="submit" className="w-full" disabled={isSubmitting}>Save changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}