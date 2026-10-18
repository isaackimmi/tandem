import type { ReactNode } from "react";
import { LuArrowUp, LuSearchX } from "react-icons/lu";
import { buttonStyles } from "../Button/buttonStyles";

export function EmptyState({
  title,
  children,
  backToCatalog = false,
  compact = false,
}: {
  title: string;
  children: ReactNode;
  backToCatalog?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`py-10 text-center ${compact ? "px-2" : "px-5"}`}>
      <LuSearchX
        className="mx-auto mb-[22px] size-[38px] stroke-[1.5] text-[#92928c]"
        aria-hidden="true"
      />
      <h3 className="mx-auto mb-[9px] max-w-[280px] text-lg leading-[1.25] font-[650] tracking-[-.3px]">
        {title}
      </h3>
      <p className="m-auto max-w-[280px] text-sm leading-normal text-[var(--muted)]">
        {children}
      </p>
      {backToCatalog && (
        <a
          className={`${buttonStyles.base} ${buttonStyles.soft} mt-[22px]`}
          href="#catalog"
        >
          Back to catalog <LuArrowUp aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
