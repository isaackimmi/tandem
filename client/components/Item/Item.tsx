import type { ReactNode } from "react";
import type { Product } from "@/lib/api";
import { ProductGlyph } from "./ProductGlyph";
import styles from "./Item.module.css";

export function Item({
  product,
  action,
  variant = "row",
}: {
  product: Product;
  action: ReactNode;
  variant?: "row" | "suggestion" | "basket";
}) {
  const basket = variant === "basket";
  const suggestion = variant === "suggestion";
  return (
    <li
      className={`flex min-h-20 justify-between border-b border-[var(--line)] bg-white ${suggestion ? "flex-col items-stretch gap-3 pt-[17px] pb-[18px] last:border-b-0" : basket ? `${styles.enter} items-center gap-[18px] py-[15px] last:border-b-0 max-[1100px]:gap-2.5` : "items-center gap-[18px] px-2 py-3.5 max-[1100px]:gap-2.5 max-[1100px]:px-0"}`}
      data-testid={`product-${product.id}`}
    >
      <div
        className={`flex min-w-0 items-center ${basket ? "gap-3" : "gap-4 max-[1100px]:gap-2.5"}`}
      >
        <ProductGlyph basket={basket} suggestion={suggestion} />
        <div className="min-w-0">
          <h3 className="text-sm leading-[1.35] font-medium wrap-anywhere text-base-content">
            {product.name}
          </h3>
          <p className="mt-[5px] text-xs leading-[1.4] wrap-anywhere text-[#7b7b75]">
            SKU: {product.sku}
          </p>
        </div>
      </div>
      <div
        className={`shrink-0 [&>.btn]:w-full max-[380px]:[&>.btn]:p-[9px] max-[380px]:[&>.btn]:text-xs ${suggestion ? "w-full" : basket ? "w-9" : "w-25 max-[1100px]:w-21 max-[380px]:w-[73px]"}`}
      >
        {action}
      </div>
    </li>
  );
}
