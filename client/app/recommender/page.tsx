import { Suspense } from "react";
import { RecommendedItems } from "@/components/recommended-items";
import { WorkspaceShell } from "@/components/workspace-shell";
import { InitialCatalog, CatalogFallback } from "@/components/initial-catalog";
export default function Recommender() {
  return <WorkspaceShell recommendations={<RecommendedItems />} catalog={<Suspense fallback={<CatalogFallback />}><InitialCatalog /></Suspense>} />;
}
