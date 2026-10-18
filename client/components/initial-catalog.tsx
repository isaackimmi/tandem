import { connection } from "next/server";
import { getCatalog } from "@/lib/api";
import { AvailableItems } from "./available-items";
import { RowsSkeleton } from "./feedback";

export async function InitialCatalog() {
  await connection();
  const initialData = await getCatalog({ origin: process.env.API_ORIGIN ?? "http://127.0.0.1:8000" }).catch(() => null);
  return <AvailableItems initialData={initialData} />;
}
export function CatalogFallback() {
  return <><div className="panel-title-row"><h2 id="catalog-heading">Catalog</h2></div><RowsSkeleton label="Loading catalog" /></>;
}
