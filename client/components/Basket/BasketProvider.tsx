"use client";
import { useReducer, type ReactNode } from "react";
import type { Product } from "@/lib/api";

type BasketState = { items: Product[]; announcement: string; revision: number };
type BasketAction =
  | { type: "add"; product: Product }
  | { type: "remove"; id: string }
  | { type: "clear" };
function reducer(state: BasketState, action: BasketAction): BasketState {
  if (action.type === "clear")
    return {
      items: [],
      announcement: "Basket cleared.",
      revision: state.revision + 1,
    };
  if (action.type === "add") {
    if (state.items.some((item) => item.id === action.product.id)) return state;
    const items = [...state.items, action.product];
    return {
      items,
      revision: state.revision + 1,
      announcement: `${action.product.name} added. ${items.length} ${items.length === 1 ? "product" : "products"} in your basket.`,
    };
  }
  const product = state.items.find((item) => item.id === action.id);
  return {
    items: state.items.filter((item) => item.id !== action.id),
    revision: state.revision + 1,
    announcement: `${product?.name ?? "Product"} removed from your basket.`,
  };
}
import { BasketContext } from "./basket-context";

export function BasketProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    announcement: "",
    revision: 0,
  });
  return (
    <BasketContext
      value={{
        items: state.items,
        revision: state.revision,
        add: (product) => dispatch({ type: "add", product }),
        remove: (id) => dispatch({ type: "remove", id }),
        clear: () => dispatch({ type: "clear" }),
      }}
    >
      {children}
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {state.announcement}
      </p>
    </BasketContext>
  );
}
