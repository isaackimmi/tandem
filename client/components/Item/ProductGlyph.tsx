import { LuBox } from "react-icons/lu";

export function ProductGlyph({
  basket = false,
  suggestion = false,
}: {
  basket?: boolean;
  suggestion?: boolean;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-[#f5f5f4] text-[#494945] ${basket ? "size-10 rounded-full min-[761px]:max-[1100px]:hidden" : suggestion ? "size-12 rounded-[10px] border border-[#efefed]" : "size-12 rounded-[10px] border border-[#efefed] max-[1100px]:size-10 max-[380px]:h-9 max-[380px]:w-8"}`}
    >
      <LuBox
        className="size-[26px] stroke-[1.5] max-[380px]:size-[22px]"
        aria-hidden="true"
      />
    </span>
  );
}
