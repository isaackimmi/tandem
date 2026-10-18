import { LuArrowDown } from "react-icons/lu";

export function FlowConnector() {
  return (
    <div
      className="relative flex h-[54px] items-center justify-center before:absolute before:h-full before:w-px before:bg-[#cacac4]"
      aria-hidden="true"
    >
      <LuArrowDown className="z-1 size-[34px] rounded-full border border-[#dededb] bg-white p-2 shadow-[0_2px_6px_#00000008]" />
    </div>
  );
}
