import { test, expect } from '@playwright/test';

const proxy = 'http://127.0.0.1:8001';

test.afterEach(async ({ request }) => {
  await request.post(`${proxy}/__test/reset`);
});

test('initial server catalog Suspense leaves the shell and basket usable', async ({ page, request }) => {
  await request.post(`${proxy}/__test/hold`);
  let clientCatalogRequests = 0;
  page.on('request', req => { if (req.url().includes('/api/v1/items')) clientCatalogRequests += 1; });
  // DOMContentLoaded waits on the streamed response. Commit lets us inspect the
  // visible shell while the server-side catalog promise is intentionally held.
  await page.goto('/recommender', { waitUntil: 'commit' });
  await expect.poll(async () => (await (await request.get(`${proxy}/__test/status`)).json()).held).toBe(true);
  await expect(page.getByRole('heading', { level: 1, name: 'Build your basket.' })).toBeVisible();
  await expect(page.getByRole('region', { name: /^Your basket/ })).toBeVisible();
  await expect(page.getByRole('status', { name: 'Loading catalog' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore the catalog', exact: true })).toBeEnabled();
  await request.post(`${proxy}/__test/release`);
  await expect(page.getByRole('region', { name: 'Catalog', exact: true }).getByTestId(/^product-/)).toHaveCount(20);
  await expect(page.getByRole('status', { name: 'Loading catalog' })).toHaveCount(0);
  expect(clientCatalogRequests).toBe(0);
});

test('initial server catalog failure can retry in place without replacing the shell', async ({ page, request }) => {
  await request.post(`${proxy}/__test/fail`);
  await page.goto('/recommender');
  const catalog = page.getByRole('region', { name: 'Catalog', exact: true });
  await expect(catalog.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('region', { name: /^Your basket/ })).toBeVisible();
  await catalog.getByRole('button', { name: /retry/i }).click();
  await expect(catalog.getByTestId(/^product-/)).toHaveCount(20);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Build your basket.');
});

test('reduced motion preserves keyboard selection without decorative transforms', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/recommender');
  const first = page.getByRole('region', { name: 'Catalog', exact: true }).getByTestId(/^product-/).first();
  const button = first.getByRole('button', { name: /^Add / });
  await button.focus();
  await expect(button).toBeFocused();
  await page.keyboard.down('Space');
  const motion = await button.evaluate(element => {
    const style = getComputedStyle(element);
    return { transform: style.transform, scale: style.scale,
      durations: style.transitionDuration.split(',').map(value => parseFloat(value)) };
  });
  expect(motion.transform).toBe('none');
  expect(['none', '1']).toContain(motion.scale);
  expect(motion.durations.every(duration => duration <= 0.01)).toBe(true);
  await page.keyboard.up('Space');
  await expect(first.getByRole('button')).toBeDisabled();
  await expect(page.getByRole('region', { name: /^Your basket/ }).getByRole('button', { name: /^Remove / })).toHaveCount(1);
});
