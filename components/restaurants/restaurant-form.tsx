"use client";

import * as React from 'react';
import { Star } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type CategoryOption = {
  id: number;
  name: string;
};

type RestaurantFormProps = {
  onSubmit: (formData: FormData) => void | Promise<void>;
  isSubmitting: boolean;
  categories: CategoryOption[];
};

export function RestaurantForm({
  onSubmit,
  isSubmitting,
  categories
}: RestaurantFormProps) {
  const [searchCategory, setSearchCategory] = React.useState('');
  const [selectedCategoryNames, setSelectedCategoryNames] = React.useState<string[]>([]);
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);

  const toggleCategory = (name: string) => {
    setSelectedCategoryNames((current) =>
      current.includes(name)
        ? current.filter((n) => n !== name)
        : [...current, name]
    );
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchCategory.toLowerCase())
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('rating', rating.toString());

    selectedCategoryNames.forEach((name) => {
      formData.append('categories', name);
    });

    await onSubmit(formData);
    
    event.currentTarget.reset();
    setSelectedCategoryNames([]);
    setRating(0);
  };

  return (
    <Card className="flex flex-col h-full max-h-[85vh] border-none shadow-none">
      <CardHeader className="flex-none px-0">
        <CardTitle>Add restaurant</CardTitle>
        <CardDescription>Select from existing categories and set details.</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden px-0">
        <form onSubmit={handleSubmit} className="flex flex-col h-full" encType="multipart/form-data">
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input name="name" required placeholder="e.g. Sushi Kaito" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-1 items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  >
                    <Star
                      size={24}
                      className={`${star <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea name="note" rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm" placeholder="What do you like here?" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Images</p>
              <div className="grid gap-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <Input key={i} name={`image_${i + 1}`} type="file" accept="image/*" />
                ))}
              </div>
            </div>

            <div className="space-y-3 pb-4">
              <p className="text-sm font-medium">Categories</p>
              <Input
                placeholder="Search categories..."
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
              />
              <div className="flex flex-wrap gap-1">
                {filteredCategories.map((category) => {
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
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save restaurant'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}