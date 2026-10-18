import { connection } from "next/server";
import { getCatalog } from "@/lib/api";
import { AvailableItems } from "./available-items";
import { RowsSkeleton } from "./feedback";

export async function InitialCatalog({ scenario }: { scenario?: "hold" | "fail" }) {
  await connection();
  const origin = process.env.API_ORIGIN ?? "http://127.0.0.1:8000";
  const fixtureOrigin = scenario ? `${origin.replace(/\/$/, "")}/api/manual/${scenario}` : origin;
  const initialData = await getCatalog({ origin: fixtureOrigin }).catch(() => null);
  return <AvailableItems initialData={initialData} />;
}
export function CatalogFallback() {
  return <><div className="panel-title-row"><h2 id="catalog-heading">Catalog</h2></div><RowsSkeleton label="Loading catalog" /></>;
}
