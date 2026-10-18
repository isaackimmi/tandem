import { connection } from "next/server";
import { getCatalog } from "@/lib/api";
import { AvailableItems } from "@/components/Catalog/AvailableItems";

export async function InitialCatalog() {
  await connection();
  const initialData = await getCatalog({
    origin: process.env.API_ORIGIN ?? "http://127.0.0.1:8000",
  }).catch(() => null);
  return <AvailableItems initialData={initialData} />;
}
