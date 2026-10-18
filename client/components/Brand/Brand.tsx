import Link from "next/link";
import { LuCopy } from "react-icons/lu";

export function Brand({ linked = true }: { linked?: boolean }) {
  const mark = (
    <>
      <LuCopy aria-hidden="true" />
      <span>tandem</span>
    </>
  );
  return linked ? (
    <Link
      className="inline-flex items-center gap-3 text-[30px] font-[720] tracking-[-1.2px] text-[#111] no-underline [&_svg]:size-[35px] [&_svg]:stroke-[1.5] max-[640px]:gap-[9px] max-[640px]:text-[25px] max-[640px]:[&_svg]:size-[30px]"
      href="/"
      aria-label="Tandem home"
    >
      {mark}
    </Link>
  ) : (
    <span className="inline-flex items-center gap-3 text-[30px] font-[720] tracking-[-1.2px] text-[#111] no-underline [&_svg]:size-[35px] [&_svg]:stroke-[1.5] max-[640px]:gap-[9px] max-[640px]:text-[25px] max-[640px]:[&_svg]:size-[30px]">
      {mark}
    </span>
  );
}
