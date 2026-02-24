import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Favorite Restaurants' })
  ).toBeVisible();

  await expect(
    page.getByText(/add a favorite restaurant/i)
  ).toBeVisible();
});

