import { test, expect, type Page } from '@playwright/test';

const catalog = (page: Page) => page.getByRole('region', { name: 'Catalog', exact: true });
const basket = (page: Page) => page.getByRole('region', { name: /^Your basket/ });
const recommendations = (page: Page) => page.getByRole('region', { name: 'Recommendations', exact: true });
const search = (page: Page) => page.getByRole('searchbox', { name: 'Search products' });

async function selectSku(page: Page, sku: string) {
  await search(page).fill(sku.toLowerCase());
  const row = catalog(page).getByTestId(`product-${sku}`);
  await row.getByRole('button', { name: /^Add / }).click();
  await expect(row.getByRole('button', { name: / added$/ })).toBeDisabled();
}

test('all 40 products remain reachable, searchable, and unique in the basket', async ({ page }) => {
  await page.goto('/recommender');
  const rows = catalog(page).getByTestId(/^product-/);
  await expect(rows).toHaveCount(20);
  const firstIds = await rows.evaluateAll(elements => elements.map(element => element.getAttribute('data-testid')));
  const firstName = await rows.first().getByRole('button').getAttribute('aria-label');
  await rows.first().getByRole('button', { name: /^Add / }).click();
  await expect(basket(page).getByRole('button', { name: /^Remove / })).toHaveCount(1);
  await expect(rows.first().getByRole('button')).toBeDisabled();
  await catalog(page).getByRole('button', { name: 'Next page' }).click();
  await expect(rows).toHaveCount(20);
  await expect(rows.first()).not.toHaveAttribute('data-testid', firstIds[0]!);
  const secondIds = await rows.evaluateAll(elements => elements.map(element => element.getAttribute('data-testid')));
  expect(new Set([...firstIds, ...secondIds]).size).toBe(40);
  await expect(catalog(page).getByRole('button', { name: 'Next page' })).toBeDisabled();
  await expect(basket(page).getByRole('button', { name: /^Remove / })).toHaveCount(1);

  await search(page).fill('no-such-tandem-product');
  await expect(rows).toHaveCount(0);
  await expect(catalog(page)).toContainText(/no products|no matches/i);
  await expect(basket(page).getByRole('button', { name: /^Remove / })).toHaveCount(1);
  await search(page).fill(firstName!.replace(/^Add /, '').toLowerCase());
  await expect(rows).toHaveCount(1);
  await expect(rows.first().getByRole('button', { name: / added$/ })).toBeDisabled();
  await basket(page).getByRole('button', { name: /^Remove / }).click();
  await expect(rows.first().getByRole('button', { name: /^Add / })).toBeEnabled();
});

test('real CSV full-basket recommendations clear for an unsupported addition and restore on removal', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /build your basket/i }).first().click();
  await selectSku(page, '60-652-95R');
  await selectSku(page, 'DH-IPC-HDBW4431R-ZS');
  const suggested = recommendations(page).getByTestId('product-DS-2CD2142FWD-I');
  await expect(suggested).toBeVisible();
  await selectSku(page, '0806-001');
  await expect(recommendations(page).getByTestId(/^product-/)).toHaveCount(0);
  await expect(recommendations(page)).toContainText(/no (qualifying|recommendations|suggestions|match)|no recommendation/i);
  await basket(page).getByTestId('product-0806-001').getByRole('button', { name: /^Remove / }).click();
  await expect(suggested).toBeVisible();
  await suggested.getByRole('button', { name: /^Add / }).click();
  await expect(basket(page).getByRole('button', { name: /^Remove / })).toHaveCount(3);
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();
  await expect(basket(page).getByRole('button', { name: /^Remove / })).toHaveCount(0);
  await expect(recommendations(page).getByTestId(/^product-/)).toHaveCount(0);
  await expect(recommendations(page)).toContainText(/add.*(item|product)|start.*basket/i);
});

test('keyboard selection on a narrow screen is unique, accessible, and resets on refresh', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/recommender');
  const first = catalog(page).getByTestId(/^product-/).first();
  const add = first.getByRole('button', { name: /^Add / });
  await add.focus();
  await expect(add).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(first.getByRole('button')).toBeDisabled();
  await page.keyboard.press('Enter');
  await expect(basket(page).getByRole('button', { name: /^Remove / })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await basket(page).getByRole('button', { name: /^Remove / }).focus();
  await page.keyboard.press('Enter');
  await expect(first.getByRole('button', { name: /^Add / })).toBeEnabled();
  await first.getByRole('button', { name: /^Add / }).click();
  await page.reload();
  await expect(basket(page).getByRole('button', { name: /^Remove / })).toHaveCount(0);
  await expect(catalog(page).getByTestId(/^product-/).first().getByRole('button')).toBeEnabled();
});
