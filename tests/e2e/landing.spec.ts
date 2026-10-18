import { test, expect } from '@playwright/test';

test('landing opens the catalog and preserves the shared navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('link', { name: /build your basket/i }).first().click();
  await expect(page).toHaveURL(/\/recommender$/);
  await expect(page.getByRole('heading', { name: 'Catalog', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: /your basket/i })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: /search products/i })).toBeVisible();
});
