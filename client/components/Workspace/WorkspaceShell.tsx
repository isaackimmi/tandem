"use client";
import { FlowConnector } from "@/components/FlowConnector/FlowConnector";
import { type ReactNode } from "react";
import { LuBox } from "react-icons/lu";
import { useBasket } from "@/components/Basket/useBasket";
import { Basket } from "@/components/Basket/Basket";
import { RegionBoundary } from "@/components/Feedback/RegionBoundary";

export function WorkspaceShell({
  catalog,
  recommendations,
}: {
  catalog: ReactNode;
  recommendations?: ReactNode;
}) {
  const { items } = useBasket();
  return (
    <main
      id="main"
      className="m-auto max-w-[1500px] px-8 py-[38px] max-[640px]:px-4 max-[640px]:py-7"
    >
      <div className="mx-2.5 mb-[30px] flex items-center justify-between gap-5 max-[640px]:mx-[7px] max-[640px]:mb-6">
        <div>
          <p className="mb-3 text-[11px] font-[550] tracking-[2px] uppercase">
            Workspace
          </p>
          <h1 className="mb-2 text-[44px] leading-[1.1] font-bold tracking-[-1.9px] text-[#111] max-[640px]:text-[34px] max-[640px]:tracking-[-1.2px]">
            Build your basket.
          </h1>
          <p className="text-xl tracking-[-.4px] text-[var(--muted)] max-[760px]:text-base max-[760px]:leading-normal">
            Explore the catalog. Discover patterns in past purchases.
          </p>
        </div>
        <span className="inline-flex items-center gap-[9px] rounded-[10px] border border-[#dededb] bg-[#fafafa] px-4 py-3 text-[13px] whitespace-nowrap shadow-[0_4px_12px_#00000004] max-[760px]:hidden">
          <LuBox className="text-[19px]" aria-hidden="true" />
          CSV-backed catalog
        </span>
      </div>
      <nav
        className="-mt-[5px] mb-6 hidden items-center justify-around gap-3.5 border-b border-[#dededb] max-[760px]:flex"
        aria-label="Workspace sections"
      >
        <a className="px-1.5 py-3 text-[13px]" href="#catalog">
          Catalog
        </a>
        <a className="px-1.5 py-3 text-[13px]" href="#basket">
          Basket{" "}
          <span className="ml-[3px] rounded bg-[#e8e8e4] px-[5px] py-px text-[11px]">
            {items.length}
          </span>
        </a>
        <a className="px-1.5 py-3 text-[13px]" href="#recommendations">
          Suggestions
        </a>
      </nav>
      <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] items-start gap-5 max-[1100px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] max-[1100px]:gap-3.5 max-[760px]:grid-cols-1 max-[760px]:gap-6">
        <section
          id="catalog"
          className="card rounded-2xl border border-[#ededeb] bg-white p-6 shadow-[0_7px_22px_#00000005] max-[1100px]:p-5 max-[380px]:p-4"
          aria-labelledby="catalog-heading"
        >
          <RegionBoundary label="Catalog">{catalog}</RegionBoundary>
        </section>
        <div className="min-[1100px]:sticky min-[1100px]:top-6">
          <section
            id="basket"
            className="card rounded-2xl border border-[#ededeb] bg-white p-6 shadow-[0_7px_22px_#00000005] max-[1100px]:p-5 max-[380px]:p-4"
            aria-labelledby="basket-heading"
          >
            <RegionBoundary label="Basket">
              <Basket />
            </RegionBoundary>
          </section>
          {recommendations && (
            <>
              <FlowConnector />
              <section
                id="recommendations"
                className="card overflow-hidden rounded-2xl border border-white bg-base-300 shadow-[0_6px_20px_#00000004]"
                aria-labelledby="recommendations-heading"
              >
                <RegionBoundary label="Recommendations">
                  {recommendations}
                </RegionBoundary>
              </section>
            </>
          )}
        </div>
      </div>
      <footer className="mt-6 text-center text-[11px] text-[#7b7b75]">
        Purchase patterns, not compatibility guarantees.
      </footer>
    </main>
  );
}
