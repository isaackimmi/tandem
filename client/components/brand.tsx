import Link from "next/link";
import { LuCopy } from "react-icons/lu";

export function Brand({ linked = true }: { linked?: boolean }) {
  const mark = <><LuCopy aria-hidden="true" /><span>tandem</span></>;
  return linked ? <Link className="brand" href="/" aria-label="Tandem home">{mark}</Link>
    : <span className="brand">{mark}</span>;
}
