"use client";
import { type ReactNode } from "react";
import { LuArrowDown, LuBox } from "react-icons/lu";
import { useBasket } from "./basket-provider";
import { Basket } from "./basket";
import { RegionBoundary } from "./feedback";

export function WorkspaceShell({ catalog, recommendations }: { catalog: ReactNode; recommendations?: ReactNode }) {
  const { items } = useBasket();
  return <main id="main" className="workspace">
    <div className="workspace-heading"><div><p className="eyebrow">Workspace</p><h1>Build your basket.</h1><p>Explore the catalog. Discover patterns in past purchases.</p></div><span className="catalog-chip"><LuBox aria-hidden="true" />CSV-backed catalog</span></div>
    <nav className="mobile-regions" aria-label="Workspace sections"><a href="#catalog">Catalog</a><a href="#basket">Basket <span>{items.length}</span></a><a href="#recommendations">Suggestions</a></nav>
    <div className="workspace-grid">
      <section id="catalog" className="card panel catalog-panel" aria-labelledby="catalog-heading"><RegionBoundary label="Catalog">{catalog}</RegionBoundary></section>
      <div className="basket-column"><section id="basket" className="card panel basket-panel" aria-labelledby="basket-heading"><RegionBoundary label="Basket"><Basket /></RegionBoundary></section>
        {recommendations && <><div className="flow-connector" aria-hidden="true"><LuArrowDown /></div><section id="recommendations" className="card recommendations-panel" aria-labelledby="recommendations-heading"><RegionBoundary label="Recommendations">{recommendations}</RegionBoundary></section></>}
      </div>
    </div>
    <footer className="workspace-footer">Purchase patterns, not compatibility guarantees.</footer>
  </main>;
}
