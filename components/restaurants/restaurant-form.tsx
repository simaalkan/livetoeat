"use client";

import * as React from 'react';

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

type RestaurantFormProps = {
  onSubmit: (formData: FormData) => void | Promise<void>;
  isSubmitting: boolean;
  categories: CategoryOption[];
  defaultCategoryNames: string[];
};

export function RestaurantForm({
  onSubmit,
  isSubmitting,
  categories,
  defaultCategoryNames
}: RestaurantFormProps) {
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const [searchCategory, setSearchCategory] = React.useState('');
  const [customCategoryInput, setCustomCategoryInput] = React.useState('');
  const [localCategories, setLocalCategories] =
    React.useState<CategoryOption[]>(categories);
  const [selectedCategoryNames, setSelectedCategoryNames] = React.useState<
    string[]
  >([]);

  const toggleCategory = (name: string) => {
    setSelectedCategoryNames((current) =>
      current.includes(name)
        ? current.filter((n) => n !== name)
        : [...current, name]
    );
  };

  const handleAddCustomCategory = () => {
    const raw = customCategoryInput.trim();
    if (!raw) return;

    const exists = localCategories.some(
      (cat) => cat.name.toLowerCase() === raw.toLowerCase()
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

    setLocalCategories((prev) => [...prev, newCategory]);
    setSelectedCategoryNames((prev) => [...prev, raw]);
    setCustomCategoryInput('');
  };

  const handleRemoveCustomCategory = (name: string) => {
    const isDefault = defaultCategoryNames.includes(name);
    if (isDefault) return;

    setLocalCategories((prev) => prev.filter((cat) => cat.name !== name));
    setSelectedCategoryNames((prev) => prev.filter((n) => n !== name));
  };

  const filteredCategories = localCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchCategory.toLowerCase())
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    selectedCategoryNames.forEach((name) => {
      formData.append('categories', name);
    });

    await onSubmit(formData);
    form.reset();
    setSelectedCategoryNames([]);
    setSearchCategory('');
    setCustomCategoryInput('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add restaurant</CardTitle>
        <CardDescription>
          Name, images, and categories for your favorite spot.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-4"
          encType="multipart/form-data"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">
              Name
            </label>
            <Input
              id="name"
              name="name"
              required
              placeholder="e.g. Sushi Kaito"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="note">
              Notes
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="What do you like here? Favorite dishes, vibes, etc."
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Images</p>
            <p className="text-xs text-muted-foreground">
              Up to 5 images. The first slot is used as the cover image.
            </p>
            <div className="grid gap-2">
              {Array.from({ length: 5 }, (_, index) => {
                const order = index + 1;
                const label =
                  order === 1 ? 'Cover Image (optional)' : `Image ${order}`;
                return (
                  <div key={order} className="space-y-1">
                    <label
                      className="text-xs font-medium text-muted-foreground"
                      htmlFor={`image_${order}`}
                    >
                      {label}
                    </label>
                    <Input
                      id={`image_${order}`}
                      name={`image_${order}`}
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
            {isSubmitting ? 'Saving...' : 'Save restaurant'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

