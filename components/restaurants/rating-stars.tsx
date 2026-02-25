"use client";

import * as React from 'react';
import { useActionState, useOptimistic } from 'react';

import { Star } from 'lucide-react';

import {
  rateRestaurantAction,
  type RatingFormState
} from '@/app/actions/restaurants';

type RatingStarsProps = {
  restaurantId: number;
  initialRating: number | null;
  compact?: boolean;
};

export function RatingStars({
  restaurantId,
  initialRating,
  compact
}: RatingStarsProps) {
  const [optimisticRating, applyOptimisticRating] = useOptimistic<
    number,
    number
  >(initialRating ?? 0, (_current, newRating) => newRating);

  const [_state, formAction, isPending] = useActionState<
    RatingFormState,
    FormData
  >(rateRestaurantAction, {});

  const handleSetRating = async (value: number) => {
    applyOptimisticRating(value);

    const formData = new FormData();
    formData.set('id', restaurantId.toString());
    formData.set('rating', value.toString());

    await formAction(formData);
  };

  const display = optimisticRating > 0 ? optimisticRating.toFixed(1) : null;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, index) => {
          const value = index + 1;
          const filled = value <= optimisticRating;
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleSetRating(value)}
              disabled={isPending}
              className="text-muted-foreground hover:text-yellow-500 disabled:opacity-60"
              aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
            >
              <Star
                className={
                  filled
                    ? 'h-4 w-4 fill-yellow-400 text-yellow-400'
                    : 'h-4 w-4'
                }
              />
            </button>
          );
        })}
      </div>
      {!compact && (
        <span className="text-xs text-muted-foreground">
          {display ? `⭐ ${display}` : 'Not rated'}
        </span>
      )}
    </div>
  );
}

