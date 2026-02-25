"use client";

import * as React from 'react';
import { useActionState, useOptimistic, useState } from 'react';
import { Settings2 } from "lucide-react"; // İkon için ekledik

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
import { CategoryManager } from '@/components/restaurants/category-manager'; // Yeni bileşen
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
  const [editingRestaurant, setEditingRestaurant] = useState<DashboardRestaurant | null>(null);
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

  const [formState, formAction, isPending] = useActionState<RestaurantFormState, FormData>(addRestaurantAction, {});
  const [editState, editAction, isEditPending] = useActionState<RestaurantFormState, FormData>(updateRestaurantAction, {});

  const handleCreateRestaurant = async (formData: FormData) => {
    const name = formData.get('name')?.toString().trim() ?? '';
    const note = formData.get('note')?.toString().trim() || null;
    const ratingRaw = formData.get('rating')?.toString();
    const rating = ratingRaw ? Number(ratingRaw) : 0;

    if (!name) return;

    const categoryNames = formData.getAll('categories').map((v) => v.toString());

    const optimisticRestaurant: DashboardRestaurant = {
      id: -Date.now(),
      name,
      note,
      rating,
      createdAt: new Date().toISOString(),
      categories: categoryNames.map((name, i) => ({ id: -i, name, isCustom: true })),
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
    const ratingRaw = formData.get('rating')?.toString();
    const rating = ratingRaw ? Number(ratingRaw) : 0;

    if (!id || Number.isNaN(id)) return;

    const name = formData.get('name')?.toString().trim() ?? '';
    const note = formData.get('note')?.toString().trim() || null;

    if (!name) return;

    const categoryNames = formData.getAll('categories').map((v) => v.toString());
    const previous = optimisticRestaurants.find((r) => r.id === id) ?? editingRestaurant;

    const optimisticRestaurant: DashboardRestaurant = {
      id,
      name,
      note,
      rating,
      createdAt: previous?.createdAt ?? new Date().toISOString(),
      categories: categoryNames.map((name, i) => ({ id: -2000 - i, name, isCustom: true })),
      images: previous?.images ?? []
    };

    applyOptimistic({ type: 'update', restaurant: optimisticRestaurant });
    await editAction(formData);
    setIsEditDialogOpen(false);
    setEditingRestaurant(null);
  };

  const handleToggleFilterCategory = (id: number) => {
    setSelectedCategoryIds((current) =>
      current.includes(id) ? current.filter((v) => v !== id) : [...current, id]
    );
  };

  const handleDeleteRestaurant = async (id: number) => {
    setDeletingId(id);
    applyOptimistic({ type: 'delete', id });
    await deleteRestaurantAction(id);
    setDeletingId(null);
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredRestaurants = optimisticRestaurants.filter((restaurant) => {
    const matchesSearch = !normalizedSearch || restaurant.name.toLowerCase().includes(normalizedSearch);
    const matchesCategoryFilter = selectedCategoryIds.length === 0 || 
      restaurant.categories.some((cat) => selectedCategoryIds.includes(cat.id));
    const ratingValue = typeof restaurant.rating === 'number' ? restaurant.rating : 0;
    const matchesRatingFilter = minRating === null || ratingValue >= minRating;

    return matchesSearch && matchesCategoryFilter && matchesRatingFilter;
  });

  const hasFilters = normalizedSearch.length > 0 || selectedCategoryIds.length > 0 || minRating !== null;

  return (
    <div className="space-y-6">
      {/* HEADER & SEARCH SECTION */}
      <section className="flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Favorite Restaurants</h2>
          <p className="text-sm text-muted-foreground">Search, filter, and add places you love.</p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:w-64"
          />

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="md:ml-3">Add Restaurant</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <RestaurantForm
                onSubmit={handleCreateRestaurant}
                isSubmitting={isPending}
                categories={allCategories}
                defaultCategoryNames={['Cafe', 'Pub', 'Restaurant']}
              />
              {formState.error && <p className="mt-2 text-sm text-destructive">{formState.error}</p>}
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* FILTERS SECTION */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 p-4 rounded-lg border bg-muted/20">
          {/* Category Filter Row */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category:</span>
            <div className="flex flex-wrap items-center gap-2">
              {allCategories.map((category) => {
                const isActive = selectedCategoryIds.includes(category.id);
                return (
                  <button key={category.id} onClick={() => handleToggleFilterCategory(category.id)}>
                    <Badge variant={isActive ? 'default' : 'outline'} className="cursor-pointer">
                      {category.name}
                    </Badge>
                  </button>
                );
              })}
              
              {/* MANAGE CATEGORIES BUTTON */}
              <div className="ml-2 border-l pl-3">
                <CategoryManager categories={allCategories} />
              </div>
            </div>
          </div>

          {/* Rating Filter Row */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Min Rating:</span>
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium"
              value={minRating ?? ''}
              onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Any rating</option>
              <option value="3">⭐ 3.0 & up</option>
              <option value="4">⭐ 4.0 & up</option>
              <option value="5">⭐ 5.0 only</option>
            </select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => {
                  setSearch('');
                  setSelectedCategoryIds([]);
                  setMinRating(null);
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        </div>

        {/* RESULTS GRID */}
        {filteredRestaurants.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
            {hasFilters ? 'No matches found.' : 'No restaurants yet.'}
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

      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setEditingRestaurant(null); }}>
        <DialogContent className="max-w-2xl">
          {editingRestaurant && (
            <RestaurantEditForm
              restaurant={editingRestaurant}
              categories={allCategories}
              defaultCategoryNames={['Cafe', 'Pub', 'Restaurant']}
              isSubmitting={isEditPending}
              onSubmit={handleUpdateRestaurant}
            />
          )}
          {editState.error && <p className="mt-2 text-sm text-destructive">{editState.error}</p>}
        </DialogContent>
      </Dialog>
    </div>
  );
}