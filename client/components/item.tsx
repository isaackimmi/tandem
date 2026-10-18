import type { ReactNode } from "react";
import { LuBox, LuCheck, LuPlus } from "react-icons/lu";
import type { Product } from "@/lib/api";

export function Item({ product, action, variant = "row" }: { product: Product; action: ReactNode; variant?: "row" | "suggestion" }) {
  return <li className={`product-item ${variant === "suggestion" ? "suggestion-item" : ""}`} data-testid={`product-${product.id}`}>
    <div className="product-summary"><span className="product-glyph"><LuBox aria-hidden="true" /></span><div className="product-copy"><h3>{product.name}</h3><p>SKU: {product.sku}</p></div></div>
    <div className="product-action">{action}</div>
  </li>;
}
export function AddAction({ product, selected, onAdd, prominent = false }: { product: Product; selected: boolean; onAdd: (product: Product) => void; prominent?: boolean }) {
  return <button className={`btn ${selected ? "added-action" : prominent ? "btn-primary" : "btn-outline"}`} disabled={selected} aria-label={selected ? `${product.name} added` : `Add ${product.name}`} onClick={() => onAdd(product)}>
    <span className="action-label" key={selected ? "added" : "add"}>{selected ? <LuCheck aria-hidden="true" /> : <LuPlus aria-hidden="true" />}{selected ? "Added" : prominent ? "Add to basket" : "Add"}</span>
  </button>;
}
export function ItemList({ items, renderAction, variant = "row" }: { items: Product[]; renderAction: (product: Product) => ReactNode; variant?: "row" | "suggestion" }) {
  return <ul className="product-list">{items.map(product => <Item key={product.id} product={product} action={renderAction(product)} variant={variant} />)}</ul>;
}
