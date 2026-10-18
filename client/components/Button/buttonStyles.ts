/** DaisyUI supplies button behavior; Tailwind supplies the shared neutral design. */
const base =
  "btn h-auto gap-[9px] font-medium shadow-none transition-[transform,background-color,border-color] duration-[140ms] ease-out motion-safe:enabled:active:transform-[scale(.98)] enabled:active:duration-[80ms] motion-reduce:translate-none [&_svg]:size-[18px]";

export const buttonStyles = {
  base: `${base} min-h-11 px-[17px] py-2.5 text-sm`,
  pagination: `${base} btn-square min-h-[38px] w-10 p-2 text-sm`,
  remove: `${base} btn-ghost min-h-10 p-2 text-sm text-[#70706b]`,
  small: `${base} min-h-11 px-[17px] py-2.5 text-xs`,
  header: `${base} min-h-11 px-[17px] py-2.5 text-sm max-[640px]:px-3 max-[640px]:text-xs`,
  hero: `${base} min-h-14 px-[25px] py-[17px] text-base`,
  primary:
    "btn-primary border-[#202020] bg-linear-to-b from-[#2b2b2b] to-[#202020] text-white shadow-[0_2px_3px_#0000000a] hover:from-[#383838] hover:to-[#383838]",
  outline:
    "btn-outline border-[#dededb] bg-white hover:border-[#c5c5c0] hover:bg-base-200",
  soft: "btn-soft bg-base-300",
};
