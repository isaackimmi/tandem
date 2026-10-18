import { Suspense } from "react";
import { RecommendedItems } from "@/components/Recommendations/RecommendedItems";
import { WorkspaceShell } from "@/components/Workspace/WorkspaceShell";
import { InitialCatalog } from "@/components/Catalog/InitialCatalog";
import { CatalogFallback } from "@/components/Catalog/CatalogFallback";
export default function Recommender() {
  return (
    <WorkspaceShell
      recommendations={<RecommendedItems />}
      catalog={
        <Suspense fallback={<CatalogFallback />}>
          <InitialCatalog />
        </Suspense>
      }
    />
  );
}
