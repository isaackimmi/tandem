import { LuRotateCcw, LuUnplug } from "react-icons/lu";
import { buttonStyles } from "../Button/buttonStyles";

export function PanelError({
  title = "This panel couldn’t load",
  onRetry,
  compact = false,
}: {
  title?: string;
  onRetry: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`py-10 text-center ${compact ? "px-2" : "px-5"}`}
      role="alert"
    >
      <LuUnplug
        className="mx-auto mb-[22px] size-[38px] stroke-[1.5] text-[#92928c]"
        aria-hidden="true"
      />
      <h3 className="mx-auto mb-[9px] max-w-[280px] text-lg leading-[1.25] font-[650] tracking-[-.3px]">
        {title}
      </h3>
      <p className="m-auto max-w-[280px] text-sm leading-normal text-[var(--muted)]">
        Your basket is still here. Please try again.
      </p>
      <button
        className={`${buttonStyles.base} ${buttonStyles.outline} mt-[22px]`}
        onClick={onRetry}
      >
        <LuRotateCcw aria-hidden="true" /> Retry
      </button>
    </div>
  );
}
