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
  await expect(rows).toHaveCount(10);
  await expect(catalog(page).getByLabel('Items per page')).toHaveValue('10');
  await catalog(page).getByLabel('Items per page').selectOption('20');
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

test('page size resets pagination, preserves search and selection, and works on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/recommender');
  const region = catalog(page);
  const rows = region.getByTestId(/^product-/);
  const size = region.getByLabel('Items per page');
  await expect(rows).toHaveCount(10);
  await rows.first().getByRole('button', { name: /^Add / }).click();
  await region.getByRole('button', { name: 'Next page' }).click();
  await expect(region).toContainText('Page 2 of 4');
  for (const value of ['5', '10', '20', '40']) {
    await size.selectOption(value);
    await expect(rows).toHaveCount(Number(value));
    await expect(region).toContainText(`Page 1 of ${40 / Number(value)}`);
    await expect(region.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await expect(rows.first().getByRole('button')).toBeDisabled();
    await expect(basket(page).getByRole('button', { name: /^Remove / })).toHaveCount(1);
  }
  await expect(region.getByRole('button', { name: 'Next page' })).toBeDisabled();
  await search(page).fill('bosch');
  await expect(rows).toHaveCount(8);
  await size.selectOption('5');
  await expect(rows).toHaveCount(5);
  await expect(search(page)).toHaveValue('bosch');
  await expect(region).toContainText('Page 1 of 2');
  await region.getByRole('button', { name: 'Next page' }).click();
  await expect(rows).toHaveCount(3);
  await search(page).fill('no-such-product');
  await expect(region).toContainText('No products found');
  await size.selectOption('10');
  await expect(region).toContainText('Page 0 of 0');
  await expect(region.getByRole('button', { name: 'Next page' })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
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

test('calibrated real CSV demo recommends for Bosch, a pair and a triple without subset fallback', async ({ page }) => {
  await page.goto('/recommender');
  const recs = recommendations(page);
  const ids = () => recs.getByTestId(/^product-/).evaluateAll(rows => rows.map(row => row.getAttribute('data-testid')));
  await selectSku(page, 'B5512');
  await expect.poll(ids).toEqual(['product-DS-7608NI-I2/8P', 'product-60-848-02-95R', 'product-6160']);
  await recs.getByTestId('product-6160').getByRole('button', { name: /^Add / }).click();
  await expect.poll(ids).toEqual(['product-DS-2CD2142FWD-I', 'product-HEN08104', 'product-QND-6010R', 'product-DS-7608NI-I2/8P']);
  await recs.getByTestId('product-DS-2CD2142FWD-I').getByRole('button', { name: /^Add / }).click();
  await expect.poll(ids).toEqual(['product-QND-6010R']);
  await expect(basket(page).getByRole('button', { name: /^Remove / })).toHaveCount(3);
  await basket(page).getByTestId('product-DS-2CD2142FWD-I').getByRole('button', { name: /^Remove / }).click();
  await selectSku(page, '0806-001');
  await expect(recs).toContainText(/no (qualifying|recommendations|suggestions|match)|no recommendation/i);
  await expect.poll(ids).toEqual([]);
  await basket(page).getByTestId('product-0806-001').getByRole('button', { name: /^Remove / }).click();
  await expect.poll(ids).toEqual(['product-DS-2CD2142FWD-I', 'product-HEN08104', 'product-QND-6010R', 'product-DS-7608NI-I2/8P']);
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
