import styles from "./RowsSkeleton.module.css";

export function RowsSkeleton({
  count = 5,
  label = "Loading products",
}: {
  count?: number;
  label?: string;
}) {
  return (
    <div className={styles.rows} role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
      <div aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <div
            className="flex min-h-[78px] items-center gap-4 border-b border-[var(--line)]"
            key={index}
          >
            <div className="skeleton size-12 rounded-[10px]" />
            <div className="flex-1">
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="skeleton mt-[9px] h-2.5 w-[35%] rounded" />
            </div>
            <div className="skeleton h-9 w-[72px] rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
