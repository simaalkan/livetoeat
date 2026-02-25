"use client";

import * as React from 'react';
import Image from 'next/image';

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
  isCustom: boolean;
};

type ImageOption = {
  id: number;
  url: string;
  order: number;
  restaurantId: number;
};

type RestaurantEditFormProps = {
  restaurant: {
    id: number;
    name: string;
    note: string | null;
    categories: CategoryOption[];
    images: ImageOption[];
  };
  categories: CategoryOption[];
  defaultCategoryNames: string[];
  isSubmitting: boolean;
  onSubmit: (formData: FormData) => void | Promise<void>;
};

export function RestaurantEditForm({
  restaurant,
  categories,
  defaultCategoryNames,
  isSubmitting,
  onSubmit
}: RestaurantEditFormProps) {
  const [searchCategory, setSearchCategory] = React.useState('');
  const [customCategoryInput, setCustomCategoryInput] = React.useState('');
  const [localCategories, setLocalCategories] =
    React.useState<CategoryOption[]>(categories);
  const [selectedCategoryNames, setSelectedCategoryNames] = React.useState<
    string[]
  >(() => restaurant.categories.map((category) => category.name));
  const [removedImageIds, setRemovedImageIds] = React.useState<number[]>([]);

  const toggleCategory = (name: string) => {
    setSelectedCategoryNames((current) =>
      current.includes(name)
        ? current.filter((value) => value !== name)
        : [...current, name]
    );
  };

  const handleAddCustomCategory = () => {
    const raw = customCategoryInput.trim();
    if (!raw) return;

    const exists = localCategories.some(
      (category) => category.name.toLowerCase() === raw.toLowerCase()
    );
    if (exists) {
      setCustomCategoryInput('');
      return;
    }

    const newCategory: CategoryOption = {
      id: Math.floor(Math.random() * -1_000_000),
      name: raw,
      isCustom: true
    };

    setLocalCategories((previous) => [...previous, newCategory]);
    setSelectedCategoryNames((previous) => [...previous, raw]);
    setCustomCategoryInput('');
  };

  const handleRemoveCustomCategory = (name: string) => {
    const isDefault = defaultCategoryNames.includes(name);
    if (isDefault) return;

    setLocalCategories((previous) =>
      previous.filter((category) => category.name !== name)
    );
    setSelectedCategoryNames((previous) =>
      previous.filter((value) => value !== name)
    );
  };

  const filteredCategories = localCategories.filter((category) =>
    category.name.toLowerCase().includes(searchCategory.toLowerCase())
  );

  const toggleRemoveImage = (id: number) => {
    setRemovedImageIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    formData.set('id', restaurant.id.toString());

    selectedCategoryNames.forEach((name) => {
      formData.append('categories', name);
    });

    removedImageIds.forEach((id) => {
      formData.append('deleteImageIds', id.toString());
    });

    await onSubmit(formData);
  };

  const remainingImages = restaurant.images.filter(
    (image) => !removedImageIds.includes(image.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit restaurant</CardTitle>
        <CardDescription>
          Update the details, categories, and images for this restaurant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          encType="multipart/form-data"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="edit-name">
              Name
            </label>
            <Input
              id="edit-name"
              name="name"
              required
              defaultValue={restaurant.name}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="edit-note">
              Notes
            </label>
            <textarea
              id="edit-note"
              name="note"
              rows={3}
              defaultValue={restaurant.note ?? ''}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Existing images</p>
              <p className="text-xs text-muted-foreground">
                Remove images you no longer need. You can also upload new ones
                below.
              </p>
            </div>
            {remainingImages.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No images currently attached.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {remainingImages.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => toggleRemoveImage(image.id)}
                    className="group relative overflow-hidden rounded-md border bg-muted"
                  >
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={image.url}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                      <span className="text-xs font-medium text-white">
                        Remove
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Add new images</p>
            <p className="text-xs text-muted-foreground">
              Up to 5 images total per restaurant. New uploads will fill the
              next available slots.
            </p>
            <div className="grid gap-2">
              {Array.from({ length: 5 }, (_, index) => {
                const indexDisplay = index + 1;
                return (
                  <div key={indexDisplay} className="space-y-1">
                    <label
                      className="text-xs font-medium text-muted-foreground"
                      htmlFor={`newImage_${indexDisplay}`}
                    >
                      New image {indexDisplay}
                    </label>
                    <Input
                      id={`newImage_${indexDisplay}`}
                      name={`newImage_${indexDisplay}`}
                      type="file"
                      accept="image/*"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Categories</p>
              <p className="text-xs text-muted-foreground">
                Choose one or more tags. Defaults like Cafe, Pub, and
                Restaurant cannot be deleted.
              </p>
            </div>

            <Input
              placeholder="Search categories..."
              value={searchCategory}
              onChange={(event) => setSearchCategory(event.target.value)}
            />

            <div className="flex flex-wrap gap-1">
              {filteredCategories.map((category) => {
                const isSelected = selectedCategoryNames.includes(category.name);
                const isDefault = defaultCategoryNames.includes(category.name);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.name)}
                    className="group"
                  >
                    <Badge
                      variant={isSelected ? 'default' : 'outline'}
                      className="flex items-center gap-1"
                    >
                      <span>{category.name}</span>
                      {!isDefault && isSelected && (
                        <span
                          className="text-[10px] opacity-70"
                          aria-hidden="true"
                        >
                          ×
                        </span>
                      )}
                    </Badge>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder="New custom category"
                value={customCategoryInput}
                onChange={(event) =>
                  setCustomCategoryInput(event.target.value)
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCustomCategory}
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-1">
              {localCategories
                .filter(
                  (category) =>
                    category.isCustom &&
                    selectedCategoryNames.includes(category.name)
                )
                .map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleRemoveCustomCategory(category.name)}
                  >
                    <Badge variant="outline" className="flex items-center gap-1">
                      <span>{category.name}</span>
                      <span
                        className="text-[10px] opacity-70"
                        aria-hidden="true"
                      >
                        Remove
                      </span>
                    </Badge>
                  </button>
                ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

