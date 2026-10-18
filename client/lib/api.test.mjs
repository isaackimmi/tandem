import assert from "node:assert/strict";
import { after, test } from "node:test";

process.env.NEXT_PUBLIC_API_ORIGIN = "";
const { apiUrl, getCatalog, getRecommendations } = await import("./api.ts");
const originalFetch = globalThis.fetch;
after(() => { globalThis.fetch = originalFetch; });

test("same-origin catalog query preserves user input and browser-relative URL", async () => {
  globalThis.fetch = async (url) => {
    assert.equal(url, "/api/v1/items?q=A%26B+%2F+camera&page=2&pageSize=20");
    return Response.json({ items: [], page: 2, pageSize: 20, total: 40, totalPages: 2 });
  };
  assert.equal((await getCatalog({ query: "A&B / camera", page: 2 })).page, 2);
});

test("recommendations use the same deployment and retain the request contract", async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "/api/v1/recommendations");
    assert.equal(options.method, "POST");
    assert.deepEqual(JSON.parse(options.body), { selectedItemIds: ["A", "B"], limit: 5 });
    return Response.json({ selectedItemIds: ["A", "B"], recommendations: [], reason: "no_qualifying_rules", modelVersion: "test" });
  };
  assert.equal((await getRecommendations(["A", "B"], new AbortController().signal)).reason, "no_qualifying_rules");
});

test("server binding URLs preserve a deployment-specific path prefix", () => {
  assert.equal(apiUrl("/api/v1/items", "https://internal.example/service/backend/"), "https://internal.example/service/backend/api/v1/items");
  assert.equal(apiUrl("/api/v1/items", "http://127.0.0.1:8000"), "http://127.0.0.1:8000/api/v1/items");
});
