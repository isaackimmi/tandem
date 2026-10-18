import { RowsSkeleton } from "../Feedback/RowsSkeleton";

export function CatalogFallback() {
  return (
    <>
      <div className="mb-[18px] flex items-center justify-between gap-3">
        <h2
          className="flex items-center gap-3 text-[23px] font-[650] tracking-[-.7px] max-[1100px]:gap-2 max-[1100px]:text-[21px]"
          id="catalog-heading"
        >
          Catalog
        </h2>
      </div>
      <RowsSkeleton label="Loading catalog" />
    </>
  );
}
