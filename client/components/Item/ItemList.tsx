import type { ReactNode } from "react";
import type { Product } from "@/lib/api";
import { Item } from "@/components/Item/Item";

export function ItemList({
  items,
  renderAction,
  variant = "row",
}: {
  items: Product[];
  renderAction: (product: Product) => ReactNode;
  variant?: "row" | "suggestion" | "basket";
}) {
  return (
    <ul className="m-0 list-none p-0">
      {items.map((product) => (
        <Item
          key={product.id}
          product={product}
          action={renderAction(product)}
          variant={variant}
        />
      ))}
    </ul>
  );
}
