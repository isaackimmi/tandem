"use client";
import styles from "./RecommendedItems.module.css";
import { useEffect, useMemo, useState } from "react";
import { LuCopy } from "react-icons/lu";
import { getRecommendations, type RecommendationResponse } from "@/lib/api";
import { useBasket } from "@/components/Basket/useBasket";
import { AddAction } from "@/components/Item/AddAction";
import { ItemList } from "@/components/Item/ItemList";
import { EmptyState } from "@/components/Feedback/EmptyState";
import { PanelError } from "@/components/Feedback/PanelError";
import { RowsSkeleton } from "@/components/Feedback/RowsSkeleton";

type Result = {
  key: string;
  data: RecommendationResponse | null;
  error: boolean;
};

export function RecommendedItems() {
  const { items, add, revision } = useBasket();
  const ids = useMemo(() => items.map((item) => item.id).sort(), [items]);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const key = JSON.stringify([ids, retry, revision]);
  const empty = ids.length === 0;
  const pending = !empty && result?.key !== key;
  const data = result?.key === key ? result.data : null;
  const failed = !empty && result?.key === key && result.error;
  const recommendations =
    data?.recommendations.filter((product) => !ids.includes(product.id)) ?? [];

  useEffect(() => {
    if (!ids.length) return;
    const controller = new AbortController();
    let current = true;
    getRecommendations(ids, controller.signal).then(
      (data) => {
        if (!current) return;
        const matches =
          JSON.stringify([...data.selectedItemIds].sort()) ===
          JSON.stringify(ids);
        setResult({ key, data: matches ? data : null, error: !matches });
      },
      () => {
        if (current) setResult({ key, data: null, error: true });
      },
    );
    return () => {
      current = false;
      controller.abort();
    };
  }, [ids, key]);

  const announcement = empty
    ? "Add a product to see recommendations."
    : pending
      ? "Loading recommendations"
      : failed
        ? "Recommendations unavailable"
        : recommendations.length
          ? `${recommendations.length} recommendations for your whole basket`
          : "No recommendations for this basket";
  return (
    <>
      <div className="flex items-center gap-3.5 px-6 pt-[22px] pb-[18px] max-[1100px]:gap-2.5 max-[1100px]:p-5">
        <LuCopy className="size-8 shrink-0 stroke-[1.5]" aria-hidden="true" />
        <div>
          <p className="mb-[5px] text-[9px] font-[550] tracking-[1.6px] uppercase max-[1100px]:text-[8px] max-[1100px]:tracking-[1px]">
            Based on your whole basket
          </p>
          <h2
            className="text-[23px] leading-[1.1] font-[650] tracking-[-.7px] max-[1100px]:text-[21px]"
            id="recommendations-heading"
          >
            Recommendations
          </h2>
        </div>
      </div>
      <div
        className="min-h-[215px] rounded-t-[13px] bg-white px-5 pt-1"
        aria-busy={pending}
      >
        {empty ? (
          <EmptyState compact title="Discover what goes together">
            Add a product to your basket to find patterns in past purchases.
          </EmptyState>
        ) : pending ? (
          <RowsSkeleton count={2} label="Loading recommendations" />
        ) : failed ? (
          <PanelError
            compact
            title="Recommendations couldn’t load"
            onRetry={() => setRetry((value) => value + 1)}
          />
        ) : recommendations.length ? (
          <div className={styles.results} key={key}>
            <ItemList
              items={recommendations}
              variant="suggestion"
              renderAction={(product) => (
                <AddAction
                  product={product}
                  selected={ids.includes(product.id)}
                  onAdd={add}
                  prominent
                />
              )}
            />
          </div>
        ) : (
          <EmptyState
            compact
            title="No recommendations for this basket"
            backToCatalog
          >
            Try removing an item or building a different basket.
          </EmptyState>
        )}
        <p className="border-t border-[var(--line)] px-0.5 pt-4 pb-5 text-[11px] leading-normal text-[#7b7b75]">
          Suggestions update whenever your basket changes.
        </p>
      </div>
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </p>
    </>
  );
}
