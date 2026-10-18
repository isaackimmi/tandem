"use client";
import { buttonStyles } from "@/components/Button/buttonStyles";
import { useRef } from "react";
import { LuLink, LuShoppingBasket, LuX } from "react-icons/lu";
import { useBasket } from "@/components/Basket/useBasket";
import { ItemList } from "@/components/Item/ItemList";

export function Basket() {
  const { items, remove, clear } = useBasket();
  const heading = useRef<HTMLHeadingElement>(null);
  function focusHeading() {
    heading.current?.focus({ preventScroll: true });
  }
  return (
    <>
      <div className="mb-[18px] flex items-center justify-between gap-3">
        <h2
          className="flex items-center gap-3 text-[23px] font-[650] tracking-[-.7px] max-[1100px]:gap-2 max-[1100px]:text-[21px]"
          id="basket-heading"
          ref={heading}
          tabIndex={-1}
        >
          <LuShoppingBasket
            className="size-[29px] stroke-[1.6]"
            aria-hidden="true"
          />
          Your basket{" "}
          <span className="badge h-auto min-w-[31px] rounded-[20px] border-0 bg-[#f3f3f1] px-2.5 py-[5px] text-xs">
            {items.length}
          </span>
        </h2>
        {items.length > 0 && (
          <button
            className="min-h-11 cursor-pointer text-xs whitespace-nowrap underline underline-offset-3"
            onClick={() => {
              focusHeading();
              clear();
            }}
          >
            Clear all
          </button>
        )}
      </div>
      {items.length ? (
        <div className="rounded-[10px] border border-[var(--line)] px-3 py-0 max-[1100px]:px-2">
          <ItemList
            variant="basket"
            items={items}
            renderAction={(product) => (
              <button
                className={`${buttonStyles.remove}`}
                aria-label={`Remove ${product.name}`}
                onClick={() => {
                  focusHeading();
                  remove(product.id);
                }}
              >
                <LuX aria-hidden="true" />
              </button>
            )}
          />
        </div>
      ) : (
        <div className="px-2.5 pt-[22px] pb-7 text-center">
          <LuShoppingBasket
            className="mx-auto mb-3.5 size-8 stroke-[1.5] text-[#9a9a93]"
            aria-hidden="true"
          />
          <h3 className="mb-2 text-base font-semibold">
            Your basket starts here
          </h3>
          <p className="m-auto max-w-[250px] text-[13px] leading-normal text-[var(--muted)]">
            Add a product from the catalog to discover what goes together.
          </p>
          <a
            className={`${buttonStyles.small} ${buttonStyles.soft} mt-[17px]`}
            href="#catalog"
          >
            Explore the catalog
          </a>
        </div>
      )}
      <p className="mt-4 flex items-center gap-[9px] text-xs text-[#767670]">
        <LuLink className="size-[17px]" aria-hidden="true" />
        One selection per product
      </p>
    </>
  );
}
