import { test, expect, type Page, type Route } from '@playwright/test';

type Item = { id: string; name: string; sku: string };
const api = process.env.NEXT_PUBLIC_API_ORIGIN || 'http://127.0.0.1:8000';
const catalog = (page: Page) => page.getByRole('region', { name: 'Catalog', exact: true });
const basket = (page: Page) => page.getByRole('region', { name: /^Your basket/ });
const recs = (page: Page) => page.getByRole('region', { name: 'Recommendations', exact: true });

function gate() {
  let release!: () => void;
  const promise = new Promise<void>(resolve => { release = resolve; });
  return { promise, release };
}

function result(selectedItemIds: string[], item: Item) {
  return { selectedItemIds, recommendations: [{ ...item, antecedentIds: selectedItemIds,
    supportingTransactionCount: 10, support: 0.01, confidence: 0.5, lift: 2 }],
    reason: null, modelVersion: 'controlled-http-fixture' };
}

async function reply(route: Route, json: unknown, status = 200) {
  // A correctly cancelled request can close before its deliberately late response.
  // The UI assertions below still prove that late data/errors cannot win.
  try { await route.fulfill({ status, json, headers: { 'access-control-allow-origin': 'http://127.0.0.1:3000' } }); }
  catch (error) {
    if (!/Target.*closed|Route is already handled|Invalid InterceptionId|has been closed/.test(String(error))) throw error;
  }
}

test('recommendation loading and retry stay local and preserve the basket', async ({ page, request }) => {
  const { items } = await (await request.get(`${api}/api/v1/items?pageSize=100`)).json() as { items: Item[] };
  const pending = gate();
  let calls = 0;
  await page.route('**/api/v1/recommendations', async route => {
    calls += 1;
    const selected = route.request().postDataJSON().selectedItemIds;
    if (calls === 1) { await pending.promise; await reply(route, { detail: 'Temporarily unavailable' }, 503); }
    else await reply(route, result(selected, items[2]));
  });
  try {
    await page.goto('/recommender');
    await catalog(page).getByRole('button', { name: `Add ${items[0].name}`, exact: true }).click();
    await expect.poll(() => calls).toBe(1);
    await expect(recs(page).getByRole('status', { name: 'Loading recommendations' })).toBeVisible();
    await expect(page.getByRole('searchbox', { name: 'Search products' })).toBeEnabled();
    await expect(basket(page).getByRole('button', { name: /^Remove / })).toHaveCount(1);
    pending.release();
    await expect(recs(page).getByRole('button', { name: /retry/i })).toBeVisible();
    await recs(page).getByRole('button', { name: /retry/i }).click();
    await expect(recs(page).getByTestId(`product-${items[2].id}`)).toBeVisible();
    await expect(basket(page).getByRole('button', { name: /^Remove / })).toHaveCount(1);
  } finally { pending.release(); }
});

for (const lateFailure of [false, true]) {
  test(`an earlier ${lateFailure ? 'error' : 'success'} cannot replace a newer basket response`, async ({ page, request }) => {
    const { items } = await (await request.get(`${api}/api/v1/items?pageSize=100`)).json() as { items: Item[] };
    const pending = gate();
    let calls = 0;
    let earlierFinished = false;
    await page.route('**/api/v1/recommendations', async route => {
      const selected = route.request().postDataJSON().selectedItemIds;
      calls += 1;
      if (calls === 1) {
        await pending.promise;
        await reply(route, lateFailure ? { detail: 'Stale failure' } : result(selected, items[3]), lateFailure ? 503 : 200);
        earlierFinished = true;
      } else await reply(route, result(selected, items[2]));
    });
    try {
      await page.goto('/recommender');
      await catalog(page).getByRole('button', { name: `Add ${items[0].name}`, exact: true }).click();
      await expect.poll(() => calls).toBe(1);
      await catalog(page).getByRole('button', { name: `Add ${items[1].name}`, exact: true }).click();
      await expect(recs(page).getByTestId(`product-${items[2].id}`)).toBeVisible();
      pending.release();
      await expect.poll(() => earlierFinished).toBe(true);
      // A user action after the old reply also proves the current panel stays usable.
      await recs(page).getByRole('button', { name: `Add ${items[2].name}`, exact: true }).click();
      await expect(basket(page).getByRole('button', { name: /^Remove / })).toHaveCount(3);
      await expect(recs(page).getByTestId(`product-${items[3].id}`)).toHaveCount(0);
      await expect(recs(page).getByRole('button', { name: /retry/i })).toHaveCount(0);
    } finally { pending.release(); }
  });
}

test('A to AB to A uses the latest request and clear cannot resurrect delayed recommendations', async ({ page, request }) => {
  const { items } = await (await request.get(`${api}/api/v1/items?pageSize=100`)).json() as { items: Item[] };
  const oldA = gate();
  const afterClear = gate();
  let calls = 0;
  let oldFinished = false;
  let clearedFinished = false;
  await page.route('**/api/v1/recommendations', async route => {
    const selected = route.request().postDataJSON().selectedItemIds;
    const index = ++calls;
    if (index === 1) await oldA.promise;
    if (index === 4) await afterClear.promise;
    await reply(route, result(selected, items[index === 1 ? 3 : 2]));
    if (index === 1) oldFinished = true;
    if (index === 4) clearedFinished = true;
  });
  try {
    await page.goto('/recommender');
    await catalog(page).getByRole('button', { name: `Add ${items[0].name}`, exact: true }).click();
    await expect.poll(() => calls).toBe(1);
    await catalog(page).getByRole('button', { name: `Add ${items[1].name}`, exact: true }).click();
    await expect.poll(() => calls).toBe(2);
    await basket(page).getByRole('button', { name: `Remove ${items[1].name}`, exact: true }).click();
    await expect.poll(() => calls).toBe(3);
    await expect(recs(page).getByTestId(`product-${items[2].id}`)).toBeVisible();
    oldA.release();
    await expect.poll(() => oldFinished).toBe(true);
    await expect(recs(page).getByTestId(`product-${items[3].id}`)).toHaveCount(0);
    await expect(recs(page).getByTestId(`product-${items[2].id}`)).toBeVisible();
    await catalog(page).getByRole('button', { name: `Add ${items[1].name}`, exact: true }).click();
    await expect.poll(() => calls).toBe(4);
    await expect(recs(page).getByTestId(/^product-/)).toHaveCount(0);
    await page.getByRole('button', { name: 'Clear all', exact: true }).click();
    afterClear.release();
    await expect.poll(() => clearedFinished).toBe(true);
    await expect(basket(page).getByRole('button', { name: /^Remove / })).toHaveCount(0);
    await expect(recs(page).getByTestId(/^product-/)).toHaveCount(0);
    await expect(recs(page).getByRole('status', { name: 'Loading recommendations' })).toHaveCount(0);
  } finally { oldA.release(); afterClear.release(); }
});

test('catalog failures retry the current search without losing selected items', async ({ page, request }) => {
  const { items } = await (await request.get(`${api}/api/v1/items?pageSize=100`)).json() as { items: Item[] };
  let calls = 0;
  await page.route('**/api/v1/items?*', async route => {
    expect(new URL(route.request().url()).searchParams.get('q')).toBe('controlled-query');
    calls += 1;
    await reply(route, calls === 1 ? { detail: 'Catalog unavailable' } :
      { items: [items[0]], page: 1, pageSize: 10, total: 1, totalPages: 1 }, calls === 1 ? 503 : 200);
  });
  await page.goto('/recommender');
  await catalog(page).getByRole('button', { name: `Add ${items[0].name}`, exact: true }).click();
  await page.getByRole('searchbox', { name: 'Search products' }).fill('controlled-query');
  await expect(catalog(page).getByRole('button', { name: /retry/i })).toBeVisible();
  await expect(basket(page).getByRole('button', { name: /^Remove / })).toHaveCount(1);
  await catalog(page).getByRole('button', { name: /retry/i }).click();
  await expect(catalog(page).getByTestId(/^product-/)).toHaveCount(1);
  await expect(catalog(page).getByRole('button', { name: / added$/ })).toBeDisabled();
});

test('returning to a previous basket still waits for its fresh recommendation request', async ({ page, request }) => {
  const { items } = await (await request.get(`${api}/api/v1/items?pageSize=100`)).json() as { items: Item[] };
  const pair = gate();
  const freshA = gate();
  let calls = 0;
  await page.route('**/api/v1/recommendations', async route => {
    const selected = route.request().postDataJSON().selectedItemIds;
    const index = ++calls;
    if (index === 2) await pair.promise;
    if (index === 3) await freshA.promise;
    await reply(route, result(selected, items[index === 1 ? 2 : 3]));
  });
  try {
    await page.goto('/recommender');
    await catalog(page).getByRole('button', { name: `Add ${items[0].name}`, exact: true }).click();
    await expect(recs(page).getByTestId(`product-${items[2].id}`)).toBeVisible();
    await catalog(page).getByRole('button', { name: `Add ${items[1].name}`, exact: true }).click();
    await expect.poll(() => calls).toBe(2);
    await basket(page).getByRole('button', { name: `Remove ${items[1].name}`, exact: true }).click();
    await expect.poll(() => calls).toBe(3);
    await expect(recs(page).getByRole('status', { name: 'Loading recommendations' })).toBeVisible();
    await expect(recs(page).getByTestId(/^product-/)).toHaveCount(0);
    freshA.release();
    await expect(recs(page).getByTestId(`product-${items[3].id}`)).toBeVisible();
  } finally { pair.release(); freshA.release(); }
});

test('late search results cannot replace the current query', async ({ page, request }) => {
  const { items } = await (await request.get(`${api}/api/v1/items?pageSize=100`)).json() as { items: Item[] };
  const pending = gate();
  let earlierStarted = false;
  let earlierFinished = false;
  await page.route('**/api/v1/items?*', async route => {
    const old = new URL(route.request().url()).searchParams.get('q') === 'earlier';
    if (old) { earlierStarted = true; await pending.promise; }
    await reply(route, { items: [items[old ? 0 : 1]], page: 1, pageSize: 10, total: 1, totalPages: 1 });
    if (old) earlierFinished = true;
  });
  try {
    await page.goto('/recommender');
    await page.getByRole('searchbox', { name: 'Search products' }).fill('earlier');
    await expect.poll(() => earlierStarted).toBe(true);
    await expect(catalog(page).getByRole('status', { name: 'Loading products', exact: true })).toBeVisible();
    await expect(page.getByRole('searchbox', { name: 'Search products' })).toBeEnabled();
    await expect(basket(page)).toBeVisible();
    await page.getByRole('searchbox', { name: 'Search products' }).fill('current');
    await expect(catalog(page).getByTestId(`product-${items[1].id}`)).toBeVisible();
    pending.release();
    await expect.poll(() => earlierFinished).toBe(true);
    await catalog(page).getByRole('button', { name: `Add ${items[1].name}`, exact: true }).click();
    await expect(basket(page).getByRole('button', { name: `Remove ${items[1].name}`, exact: true })).toBeVisible();
    await expect(catalog(page).getByTestId(`product-${items[0].id}`)).toHaveCount(0);
  } finally { pending.release(); }
});
