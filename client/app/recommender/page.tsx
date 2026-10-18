import { Suspense } from "react";
import { RecommendedItems } from "@/components/recommended-items";
import { WorkspaceShell } from "@/components/workspace-shell";
import { InitialCatalog, CatalogFallback } from "@/components/initial-catalog";
export default async function Recommender({ searchParams }: { searchParams: Promise<{ manual?: string }> }) {
  const { manual } = await searchParams;
  const scenario = manual === "hold" || manual === "fail" ? manual : undefined;
  return <WorkspaceShell recommendations={<RecommendedItems />} catalog={<Suspense fallback={<CatalogFallback />}><InitialCatalog scenario={scenario} /></Suspense>} />;
}
