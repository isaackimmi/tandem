import { Suspense } from "react";
import { WorkspaceShell } from "@/components/workspace-shell";
import { InitialCatalog, CatalogFallback } from "@/components/initial-catalog";
export default function Recommender() {
  return <WorkspaceShell catalog={<Suspense fallback={<CatalogFallback />}><InitialCatalog /></Suspense>} />;
}
