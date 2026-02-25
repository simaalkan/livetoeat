"use client";

import * as React from 'react';
import { useActionState, useOptimistic, useState } from 'react';

import {
  addRestaurantAction,
  deleteRestaurantAction,
  updateRestaurantAction,
  type RestaurantFormState
} from '@/app/actions/restaurants';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  RestaurantCard,
  type RestaurantCategory,
  type RestaurantImage,
  type RestaurantWithRelations
} from '@/components/restaurants/restaurant-card';
import { RestaurantForm } from '@/components/restaurants/restaurant-form';
import { RestaurantEditForm } from '@/components/restaurants/restaurant-edit-form';
import { Badge } from '@/components/ui/badge';

type DashboardRestaurant = RestaurantWithRelations;

type DashboardCategory = RestaurantCategory;

type RestaurantsDashboardProps = {
  initialRestaurants: DashboardRestaurant[];
  allCategories: DashboardCategory[];
};

type OptimisticAction =
  | { type: 'add'; restaurant: DashboardRestaurant }
  | { type: 'delete'; id: number }
  | { type: 'update'; restaurant: DashboardRestaurant };

export function RestaurantsDashboard({
  initialRestaurants,
  allCategories
}: RestaurantsDashboardProps) {
  const [search, setSearch] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
   const [minRating, setMinRating] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] =
    useState<DashboardRestaurant | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [optimisticRestaurants, applyOptimistic] = useOptimistic<
    DashboardRestaurant[],
    OptimisticAction
  >(initialRestaurants, (current, action) => {
    switch (action.type) {
      case 'add':
        return [action.restaurant, ...current];
      case 'delete':
        return current.filter((restaurant) => restaurant.id !== action.id);
      case 'update':
        return current.map((restaurant) =>
          restaurant.id === action.restaurant.id ? action.restaurant : restaurant
        );
      default:
        return current;
    }
  });

  const [formState, formAction, isPending] = useActionState<
    RestaurantFormState,
    FormData
  >(addRestaurantAction, {});

  const [editState, editAction, isEditPending] = useActionState<
    RestaurantFormState,
    FormData
  >(updateRestaurantAction, {});

  const handleCreateRestaurant = async (formData: FormData) => {
    const name = formData.get('name')?.toString().trim() ?? '';
    const note = formData.get('note')?.toString().trim() || null;

    if (!name) {
      return;
    }

    const categoryNames = formData
      .getAll('categories')
      .map((value) => value.toString());

    const optimisticCategories: DashboardCategory[] = categoryNames.map(
      (catName, index) => {
        const existing = allCategories.find(
          (category) =>
            category.name.toLowerCase() === catName.toLowerCase()
        );
        if (existing) return existing;
        return {
          id: -1_000_000 - index,
          name: catName,
          isCustom: true
        };
      }
    );

    const optimisticRestaurant: DashboardRestaurant = {
      id: -Date.now(),
      name,
      note,
      createdAt: new Date().toISOString(),
      categories: optimisticCategories,
      images: []
    };

    applyOptimistic({ type: 'add', restaurant: optimisticRestaurant });

    await formAction(formData);
    setIsDialogOpen(false);
  };

  const handleStartEditRestaurant = (restaurant: DashboardRestaurant) => {
    setEditingRestaurant(restaurant);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRestaurant = async (formData: FormData) => {
    const idRaw = formData.get('id')?.toString();
    const id = idRaw ? Number(idRaw) : NaN;
    if (!id || Number.isNaN(id)) {
      return;
    }

    const name = formData.get('name')?.toString().trim() ?? '';
    const note = formData.get('note')?.toString().trim() || null;

    if (!name) {
      return;
    }

    const categoryNames = formData
      .getAll('categories')
      .map((value) => value.toString());

    const optimisticCategories: DashboardCategory[] = categoryNames.map(
      (catName, index) => {
        const existing = allCategories.find(
          (category) =>
            category.name.toLowerCase() === catName.toLowerCase()
        );
        if (existing) return existing;
        return {
          id: -2_000_000 - index,
          name: catName,
          isCustom: true
        };
      }
    );

    const previous =
      optimisticRestaurants.find((restaurant) => restaurant.id === id) ??
      editingRestaurant;

    const optimisticRestaurant: DashboardRestaurant = {
      id,
      name,
      note,
      createdAt: previous?.createdAt ?? new Date().toISOString(),
      categories: optimisticCategories,
      images: previous?.images ?? []
    };

    applyOptimistic({ type: 'update', restaurant: optimisticRestaurant });

    await editAction(formData);
    setIsEditDialogOpen(false);
    setEditingRestaurant(null);
  };

  const handleToggleFilterCategory = (id: number) => {
    setSelectedCategoryIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const handleDeleteRestaurant = async (id: number) => {
    setDeletingId(id);
    applyOptimistic({ type: 'delete', id });
    await deleteRestaurantAction(id);
    setDeletingId((current) => (current === id ? null : current));
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredRestaurants = optimisticRestaurants.filter((restaurant) => {
    const matchesSearch =
      !normalizedSearch ||
      restaurant.name.toLowerCase().includes(normalizedSearch);

    const matchesCategoryFilter =
      selectedCategoryIds.length === 0 ||
      restaurant.categories.some((category) =>
        selectedCategoryIds.includes(category.id)
      );

    const ratingValue =
      typeof restaurant.rating === 'number' ? restaurant.rating : 0;
    const matchesRatingFilter =
      minRating === null || ratingValue >= minRating;

    return matchesSearch && matchesCategoryFilter && matchesRatingFilter;
  });

  const hasFilters =
    normalizedSearch.length > 0 ||
    selectedCategoryIds.length > 0 ||
    minRating !== null;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">
            Favorite Restaurants
          </h2>
          <p className="text-sm text-muted-foreground">
            Search, filter, and add places you love.
          </p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="md:w-64"
          />

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="md:ml-3">Add Restaurant</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Restaurant</DialogTitle>
              </DialogHeader>
              <RestaurantForm
                onSubmit={handleCreateRestaurant}
                isSubmitting={isPending}
                categories={allCategories}
                defaultCategoryNames={['Cafe', 'Pub', 'Restaurant']}
              />
              {formState.error && (
                <p className="mt-2 text-sm text-destructive">
                  {formState.error}
                </p>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Filter by category:
            </span>
            {allCategories.map((category) => {
              const isActive = selectedCategoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleToggleFilterCategory(category.id)}
                >
                  <Badge variant={isActive ? 'default' : 'outline'}>
                    {category.name}
                  </Badge>
                </button>
              );
            })}
          </div>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('');
                setSelectedCategoryIds([]);
                setMinRating(null);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Filter by rating:
          </span>
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            value={minRating ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              setMinRating(value ? Number(value) : null);
            }}
          >
            <option value="">Any rating</option>
            <option value="3">⭐ 3.0 &amp; up</option>
            <option value="4">⭐ 4.0 &amp; up</option>
            <option value="4.5">⭐ 4.5 &amp; up</option>
          </select>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
            {hasFilters
              ? 'No restaurants match your current filters.'
              : 'No restaurants yet. Use “Add Restaurant” to create your first entry.'}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onDelete={handleDeleteRestaurant}
                isDeleting={deletingId === restaurant.id}
                onEdit={handleStartEditRestaurant}
              />
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditingRestaurant(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Restaurant</DialogTitle>
          </DialogHeader>
          {editingRestaurant && (
            <RestaurantEditForm
              restaurant={editingRestaurant}
              categories={allCategories}
              defaultCategoryNames={['Cafe', 'Pub', 'Restaurant']}
              isSubmitting={isEditPending}
              onSubmit={handleUpdateRestaurant}
            />
          )}
          {editState.error && (
            <p className="mt-2 text-sm text-destructive">{editState.error}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

