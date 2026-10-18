export interface Product { id: string; name: string; sku: string }
export interface CatalogPage {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
export interface Recommendation extends Product {
  antecedentIds: string[];
  supportingTransactionCount: number;
  support: number;
  confidence: number;
  lift: number;
}
export interface RecommendationResponse {
  selectedItemIds: string[];
  recommendations: Recommendation[];
  reason: "empty_basket" | "no_qualifying_rules" | null;
  modelVersion: string;
}
export const PAGE_SIZE = 20;
export const browserOrigin = process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://127.0.0.1:8000";

// Empty origin means the browser uses the current deployment domain. A service
// binding may carry a path prefix, so preserve that prefix for server requests.
export function apiUrl(path: string, origin = browserOrigin): string {
  return origin ? new URL(path.replace(/^\//, ""), `${origin.replace(/\/$/, "")}/`).toString() : path;
}

function isProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) return false;
  return "id" in value && typeof value.id === "string" && "name" in value && typeof value.name === "string" && "sku" in value && typeof value.sku === "string";
}
export async function getCatalog({ query = "", page = 1, origin = browserOrigin, signal }: { query?: string; page?: number; origin?: string; signal?: AbortSignal } = {}): Promise<CatalogPage> {
  const search = new URLSearchParams({ q: query, page: String(page), pageSize: String(PAGE_SIZE) });
  const url = `${apiUrl("/api/v1/items", origin)}?${search}`;
  const response = await fetch(url, { cache: "no-store", signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(5000)]) : AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error("Catalog unavailable");
  const data: CatalogPage = await response.json();
  if (!Array.isArray(data.items) || !data.items.every(isProduct) || !Number.isInteger(data.total) || !Number.isInteger(data.totalPages) || !Number.isInteger(data.page) || !Number.isInteger(data.pageSize)) throw new Error("Invalid catalog response");
  return data;
}
export async function getRecommendations(selectedItemIds: string[], signal: AbortSignal): Promise<RecommendationResponse> {
  const response = await fetch(apiUrl("/api/v1/recommendations"), {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selectedItemIds, limit: 5 }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(5000)]),
  });
  if (!response.ok) throw new Error("Recommendations unavailable");
  const data: RecommendationResponse = await response.json();
  if (!Array.isArray(data.recommendations) || !data.recommendations.every(isProduct) || !Array.isArray(data.selectedItemIds) || ![null, "empty_basket", "no_qualifying_rules"].includes(data.reason)) throw new Error("Invalid recommendation response");
  return data;
}
