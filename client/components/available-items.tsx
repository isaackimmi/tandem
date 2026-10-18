"use client";
import { useEffect, useState } from "react";
import { LuCheck, LuChevronLeft, LuChevronRight, LuSearch, LuX } from "react-icons/lu";
import { getCatalog, PAGE_SIZE, type CatalogPage } from "@/lib/api";
import { useBasket } from "./basket-provider";
import { AddAction, ItemList } from "./item";
import { EmptyState, PanelError, RowsSkeleton } from "./feedback";

type CatalogState = { key: string; data: CatalogPage | null; error: boolean };
const initialKey = JSON.stringify(["", 1, PAGE_SIZE, 0]);

export function AvailableItems({ initialData }: { initialData: CatalogPage | null }) {
  const { items, add } = useBasket();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<CatalogState>({ key: initialKey, data: initialData, error: !initialData });
  const requestKey = JSON.stringify([query.trim(), page, pageSize, retry]);
  const pending = result.key !== requestKey;
  const data = pending ? null : result.data;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    if (requestKey === result.key || query.trim() !== debouncedQuery) return;
    const controller = new AbortController();
    let current = true;
    getCatalog({ query: debouncedQuery, page, pageSize, signal: controller.signal }).then(
      data => { if (current) setResult({ key: requestKey, data, error: false }); },
      () => { if (current) setResult({ key: requestKey, data: null, error: true }); },
    );
    return () => { current = false; controller.abort(); };
  }, [debouncedQuery, query, page, pageSize, retry, requestKey, result.key]);

  function changeQuery(value: string) {
    setQuery(value); setPage(1);
  }
  return <>
    <div className="panel-title-row"><h2 id="catalog-heading">Catalog</h2><span className="badge selection-count"><LuCheck aria-hidden="true" />{items.length} selected</span></div>
    <div className="search-field"><label htmlFor="product-search">Search products</label><div className="input search-control"><LuSearch aria-hidden="true" /><input id="product-search" type="search" maxLength={200} placeholder="Search by name or SKU" value={query} onChange={event => changeQuery(event.target.value)} autoComplete="off" />{query && <button className="search-clear" aria-label="Clear search" onClick={() => changeQuery("")}><LuX aria-hidden="true" /></button>}</div></div>
    <div className="catalog-options"><label htmlFor="catalog-page-size">Items per page</label><select id="catalog-page-size" className="select select-sm" value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}>{[5, 10, 20, 40].map(size => <option key={size} value={size}>{size}</option>)}</select></div>
    <div className="list-column-labels" aria-hidden="true"><span>Product</span><span>Selection</span></div>
    <div className="catalog-results" aria-busy={pending}>
      {pending ? <RowsSkeleton /> : result.error ? <PanelError title="The catalog couldn’t load" onRetry={() => setRetry(value => value + 1)} /> : data?.items.length ? <ItemList items={data.items} renderAction={product => <AddAction product={product} selected={items.some(item => item.id === product.id)} onAdd={add} />} /> : <EmptyState title="No products found">Try a different product name or SKU.</EmptyState>}
    </div>
    {data && <div className="pagination"><p>Page {data.totalPages === 0 ? 0 : data.page} of {data.totalPages}<span className="result-count"> · {data.total} {data.total === 1 ? "product" : "products"}</span></p><div className="pagination-buttons"><button className="btn btn-outline btn-square" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(value => value - 1)}><LuChevronLeft aria-hidden="true" /></button><button className="btn btn-outline btn-square" aria-label="Next page" disabled={page >= data.totalPages} onClick={() => setPage(value => value + 1)}><LuChevronRight aria-hidden="true" /></button></div></div>}
    <p role="status" className="sr-only">{pending ? "Loading products" : result.error ? "Catalog unavailable" : `${data?.total ?? 0} products found`}</p>
  </>;
}
