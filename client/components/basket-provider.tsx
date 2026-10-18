"use client";
import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { Product } from "@/lib/api";

type BasketState = { items: Product[]; announcement: string };
type BasketAction = { type: "add"; product: Product } | { type: "remove"; id: string } | { type: "clear" };
function reducer(state: BasketState, action: BasketAction): BasketState {
  if (action.type === "clear") return { items: [], announcement: "Basket cleared." };
  if (action.type === "add") {
    if (state.items.some(item => item.id === action.product.id)) return state;
    const items = [...state.items, action.product];
    return { items, announcement: `${action.product.name} added. ${items.length} ${items.length === 1 ? "product" : "products"} in your basket.` };
  }
  const product = state.items.find(item => item.id === action.id);
  return { items: state.items.filter(item => item.id !== action.id), announcement: `${product?.name ?? "Product"} removed from your basket.` };
}
const BasketContext = createContext<{ items: Product[]; add: (product: Product) => void; remove: (id: string) => void; clear: () => void } | null>(null);
export function BasketProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], announcement: "" });
  return <BasketContext value={{ items: state.items, add: product => dispatch({ type: "add", product }), remove: id => dispatch({ type: "remove", id }), clear: () => dispatch({ type: "clear" }) }}>
    {children}<p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{state.announcement}</p>
  </BasketContext>;
}
export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) throw new Error("Basket controls require BasketProvider");
  return context;
}
