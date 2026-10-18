import { LuCheck, LuPlus } from "react-icons/lu";
import type { Product } from "@/lib/api";
import { buttonStyles } from "../Button/buttonStyles";
import styles from "./AddAction.module.css";

export function AddAction({
  product,
  selected,
  onAdd,
  prominent = false,
}: {
  product: Product;
  selected: boolean;
  onAdd: (product: Product) => void;
  prominent?: boolean;
}) {
  return (
    <button
      className={`${buttonStyles.base} ${selected ? "disabled:border-transparent disabled:bg-transparent disabled:text-[#494945] disabled:opacity-100 disabled:shadow-none" : prominent ? buttonStyles.primary : buttonStyles.outline}`}
      disabled={selected}
      aria-label={selected ? `${product.name} added` : `Add ${product.name}`}
      onClick={() => onAdd(product)}
    >
      <span
        className={`${styles.label} inline-flex items-center justify-center gap-2`}
        key={selected ? "added" : "add"}
      >
        {selected ? (
          <LuCheck aria-hidden="true" />
        ) : (
          <LuPlus aria-hidden="true" />
        )}
        {selected ? "Added" : prominent ? "Add to basket" : "Add"}
      </span>
    </button>
  );
}
