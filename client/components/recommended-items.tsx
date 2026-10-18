"use client";
import { useEffect, useMemo, useState } from "react";
import { LuCopy } from "react-icons/lu";
import { getRecommendations, type RecommendationResponse } from "@/lib/api";
import { useBasket } from "./basket-provider";
import { AddAction, ItemList } from "./item";
import { EmptyState, PanelError, RowsSkeleton } from "./feedback";

type Result = { key: string; data: RecommendationResponse | null; error: boolean };

export function RecommendedItems() {
  const { items, add } = useBasket();
  const ids = useMemo(() => items.map(item => item.id).sort(), [items]);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const key = JSON.stringify([ids, retry]);
  const empty = ids.length === 0;
  const pending = !empty && result?.key !== key;
  const data = result?.key === key ? result.data : null;
  const failed = !empty && result?.key === key && result.error;
  const recommendations = data?.recommendations.filter(product => !ids.includes(product.id)) ?? [];

  useEffect(() => {
    if (!ids.length) return;
    const controller = new AbortController();
    let current = true;
    getRecommendations(ids, controller.signal).then(
      data => {
        if (!current) return;
        const matches = JSON.stringify([...data.selectedItemIds].sort()) === JSON.stringify(ids);
        setResult({ key, data: matches ? data : null, error: !matches });
      },
      () => { if (current) setResult({ key, data: null, error: true }); },
    );
    return () => { current = false; controller.abort(); };
  }, [ids, key]);

  const announcement = empty ? "Add a product to see recommendations." : pending ? "Loading recommendations" : failed ? "Recommendations unavailable" : recommendations.length ? `${recommendations.length} recommendations for your whole basket` : "No recommendations for this basket";
  return <>
    <div className="recommendations-heading"><LuCopy aria-hidden="true" /><div><p className="eyebrow">Based on your whole basket</p><h2 id="recommendations-heading">Recommendations</h2></div></div>
    <div className="recommendations-body" aria-busy={pending}>
      {empty ? <EmptyState title="Discover what goes together">Add a product to your basket to find patterns in past purchases.</EmptyState>
        : pending ? <RowsSkeleton count={2} label="Loading recommendations" />
        : failed ? <PanelError title="Recommendations couldn’t load" onRetry={() => setRetry(value => value + 1)} />
        : recommendations.length ? <div className="current-recommendations" key={key}><ItemList items={recommendations} variant="suggestion" renderAction={product => <AddAction product={product} selected={ids.includes(product.id)} onAdd={add} prominent />} /></div>
        : <EmptyState title="No recommendations for this basket" backToCatalog>Try removing an item or building a different basket.</EmptyState>}
      <p className="recommendations-note">Suggestions update whenever your basket changes.</p>
    </div>
    <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
  </>;
}
