"use client";
import { buttonStyles } from "@/components/Button/buttonStyles";
import { useEffect, useState } from "react";
import {
  LuCheck,
  LuChevronLeft,
  LuChevronRight,
  LuSearch,
  LuX,
} from "react-icons/lu";
import { getCatalog, PAGE_SIZE, type CatalogPage } from "@/lib/api";
import { useBasket } from "@/components/Basket/useBasket";
import { AddAction } from "@/components/Item/AddAction";
import { ItemList } from "@/components/Item/ItemList";
import { EmptyState } from "@/components/Feedback/EmptyState";
import { PanelError } from "@/components/Feedback/PanelError";
import { RowsSkeleton } from "@/components/Feedback/RowsSkeleton";

type CatalogState = { key: string; data: CatalogPage | null; error: boolean };
const initialKey = JSON.stringify(["", 1, PAGE_SIZE, 0]);

export function AvailableItems({
  initialData,
}: {
  initialData: CatalogPage | null;
}) {
  const { items, add } = useBasket();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<CatalogState>({
    key: initialKey,
    data: initialData,
    error: !initialData,
  });
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
    getCatalog({
      query: debouncedQuery,
      page,
      pageSize,
      signal: controller.signal,
    }).then(
      (data) => {
        if (current) setResult({ key: requestKey, data, error: false });
      },
      () => {
        if (current) setResult({ key: requestKey, data: null, error: true });
      },
    );
    return () => {
      current = false;
      controller.abort();
    };
  }, [debouncedQuery, query, page, pageSize, retry, requestKey, result.key]);

  function changeQuery(value: string) {
    setQuery(value);
    setPage(1);
  }
  return (
    <>
      <div className="mb-[18px] flex items-center justify-between gap-3">
        <h2
          className="flex items-center gap-3 text-[23px] font-[650] tracking-[-.7px] max-[1100px]:gap-2 max-[1100px]:text-[21px]"
          id="catalog-heading"
        >
          Catalog
        </h2>
        <span className="badge inline-flex h-auto gap-[7px] rounded-[10px] border-0 bg-base-200 px-3 py-[9px] text-xs whitespace-nowrap">
          <LuCheck className="text-base" aria-hidden="true" />
          {items.length} selected
        </span>
      </div>
      <div className="mb-[17px]">
        <label
          className="mb-[7px] block text-sm text-[#53534f]"
          htmlFor="product-search"
        >
          Search products
        </label>
        <div className="input w-full min-h-11 gap-3 rounded-[10px] border-[#dededb] bg-[#fafafa] px-3.5 py-0 shadow-none">
          <LuSearch
            className="size-5 shrink-0 text-[#74746f]"
            aria-hidden="true"
          />
          <input
            className="w-full min-w-0 text-sm outline-none focus-visible:outline-none! placeholder:text-[#93938c] [&::-webkit-search-cancel-button]:appearance-none"
            id="product-search"
            type="search"
            maxLength={200}
            placeholder="Search by name or SKU"
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
            autoComplete="off"
          />
          {query && (
            <button
              className="grid min-h-10 min-w-9 cursor-pointer place-items-center text-[var(--muted)]"
              aria-label="Clear search"
              onClick={() => changeQuery("")}
            >
              <LuX aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 mb-1 flex items-center justify-end gap-2.5 text-xs text-[var(--muted)]">
        <label htmlFor="catalog-page-size">Items per page</label>
        <select
          id="catalog-page-size"
          className="select select-sm min-h-10 w-[76px] rounded-lg border border-[var(--line)] bg-white text-base-content"
          value={pageSize}
          onChange={(event) => {
            setPageSize(Number(event.target.value));
            setPage(1);
          }}
        >
          {[5, 10, 20, 40].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <div
        className="flex justify-between border-y border-[var(--line)] px-2.5 py-3 text-[10px] tracking-[1.1px] text-[#64645e] uppercase"
        aria-hidden="true"
      >
        <span>Product</span>
        <span className="w-25 text-center">Selection</span>
      </div>
      <div aria-busy={pending}>
        {pending ? (
          <RowsSkeleton />
        ) : result.error ? (
          <PanelError
            title="The catalog couldn’t load"
            onRetry={() => setRetry((value) => value + 1)}
          />
        ) : data?.items.length ? (
          <ItemList
            items={data.items}
            renderAction={(product) => (
              <AddAction
                product={product}
                selected={items.some((item) => item.id === product.id)}
                onAdd={add}
              />
            )}
          />
        ) : (
          <EmptyState title="No products found">
            Try a different product name or SKU.
          </EmptyState>
        )}
      </div>
      {data && (
        <div className="flex items-center justify-between gap-[15px] pt-[18px] text-xs">
          <p>
            Page {data.totalPages === 0 ? 0 : data.page} of {data.totalPages}
            <span className="text-[var(--muted)] max-[760px]:hidden">
              {" "}
              · {data.total} {data.total === 1 ? "product" : "products"}
            </span>
          </p>
          <div className="flex gap-2">
            <button
              className={`${buttonStyles.pagination} ${buttonStyles.outline}`}
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              <LuChevronLeft aria-hidden="true" />
            </button>
            <button
              className={`${buttonStyles.pagination} ${buttonStyles.outline}`}
              aria-label="Next page"
              disabled={page >= data.totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              <LuChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      <p role="status" className="sr-only">
        {pending
          ? "Loading products"
          : result.error
            ? "Catalog unavailable"
            : `${data?.total ?? 0} products found`}
      </p>
    </>
  );
}
