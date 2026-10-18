"use client";
import { useRef } from "react";
import { LuLink, LuShoppingBasket, LuX } from "react-icons/lu";
import { useBasket } from "./basket-provider";
import { ItemList } from "./item";

export function Basket() {
  const { items, remove, clear } = useBasket();
  const heading = useRef<HTMLHeadingElement>(null);
  function focusHeading() { heading.current?.focus({ preventScroll: true }); }
  return <>
    <div className="panel-title-row"><h2 id="basket-heading" ref={heading} tabIndex={-1}><LuShoppingBasket aria-hidden="true" />Your basket <span className="badge basket-count">{items.length}</span></h2>{items.length > 0 && <button className="clear-basket" onClick={() => { focusHeading(); clear(); }}>Clear all</button>}</div>
    {items.length ? <div className="basket-items"><ItemList items={items} renderAction={product => <button className="btn btn-ghost remove-action" aria-label={`Remove ${product.name}`} onClick={() => { focusHeading(); remove(product.id); }}><LuX aria-hidden="true" /></button>} /></div> : <div className="empty-basket"><LuShoppingBasket aria-hidden="true" /><h3>Your basket starts here</h3><p>Add a product from the catalog to discover what goes together.</p><a className="btn btn-soft" href="#catalog">Explore the catalog</a></div>}
    <p className="basket-note"><LuLink aria-hidden="true" />One selection per product</p>
  </>;
}
