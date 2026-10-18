import Link from "next/link";
import {
  LuArrowRight,
  LuCopy,
  LuPlus,
  LuSearch,
  LuShoppingBasket,
} from "react-icons/lu";
import { Header } from "@/components/Header/Header";
import { ProductGlyph } from "@/components/Item/ProductGlyph";
import { FlowConnector } from "@/components/FlowConnector/FlowConnector";
import { buttonStyles } from "@/components/Button/buttonStyles";
import styles from "./page.module.css";

const steps = [
  {
    icon: LuSearch,
    title: "Explore the catalog",
    description: "Search products by name or SKU.",
  },
  {
    icon: LuShoppingBasket,
    title: "Build your basket",
    description: "Choose each product once.",
  },
  {
    icon: LuCopy,
    title: "See what follows",
    description: "Recommendations reflect your whole basket.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main
        id="main"
        className="m-auto max-w-[1360px] px-[52px] max-[900px]:px-7 max-[640px]:px-6"
      >
        <section
          className="grid grid-cols-[1.05fr_1fr] items-center gap-[45px] pt-[68px] pb-[50px] max-[900px]:gap-3 max-[900px]:pt-[45px] max-[640px]:grid-cols-1 max-[640px]:gap-[35px] max-[640px]:pt-12 max-[640px]:pb-8"
          aria-labelledby="hero-title"
        >
          <div>
            <p className="mb-[18px] text-[11px] font-[550] tracking-[2px] uppercase">
              Patterns, found together
            </p>
            <h1
              id="hero-title"
              className="mb-6 text-[clamp(48px,5.9vw,82px)] leading-[1.02] font-[720] tracking-[-4px] text-[#111] max-[900px]:tracking-[-2.6px] max-[640px]:text-[55px]"
            >
              Every basket
              <br />
              tells a story.
            </h1>
            <p className="mb-[26px] max-w-[440px] text-[23px] leading-[1.45] tracking-[-.5px] text-[var(--muted)] max-[900px]:text-[19px] max-[640px]:text-[21px]">
              Explore products and discover what is purchased together.
            </p>
            <Link
              className={`${buttonStyles.hero} ${buttonStyles.primary}`}
              href="/recommender"
            >
              Build your basket <LuArrowRight aria-hidden="true" />
            </Link>
            <p className="mt-3.5 text-xs text-[var(--muted)]">
              One product. One selection. New possibilities.
            </p>
          </div>
          <figure
            className="m-0 px-3 max-[900px]:p-0 max-[640px]:m-auto max-[640px]:w-full max-[640px]:max-w-[420px]"
            aria-label="Illustration of products A and B in a basket leading to a suggestion for product C"
          >
            <div
              className={`${styles.illustrationGrid} relative isolate rounded-[28px] px-[30px] pt-8 pb-[15px] max-[900px]:px-3`}
              aria-hidden="true"
            >
              <div className="absolute top-20 left-0 -z-1 h-24 w-[150px] rounded-3xl bg-[#e8e8e49c]" />
              <div className="absolute right-0 bottom-[25px] -z-1 h-[170px] w-[150px] rounded-3xl bg-[#e8e8e49c]" />
              <div className="card m-auto max-w-[330px] rounded-2xl border border-[#eeeeeb] bg-white p-[22px] shadow-[0_15px_30px_#0000000c]">
                <h2 className="mb-4 flex items-center gap-3 text-lg font-[650] tracking-[-.5px]">
                  <LuShoppingBasket className="size-[25px]" /> Your basket
                </h2>
                <div className="rounded-lg border border-[var(--line)] px-2.5 py-0">
                  {["Product A", "Product B"].map((name) => (
                    <div
                      className="flex items-center gap-3.5 border-t border-[var(--line)] py-3 text-[13px] first:border-t-0"
                      key={name}
                    >
                      <ProductGlyph />
                      <span>{name}</span>
                      <span className="ml-auto text-[var(--muted)]">✓</span>
                    </div>
                  ))}
                </div>
              </div>
              <FlowConnector />
              <div className="card m-auto max-w-[330px] rounded-2xl border border-[#eeeeeb] bg-linear-to-b from-base-300 to-white to-60% px-[22px] pt-[22px] pb-2.5 shadow-[0_15px_30px_#0000000c]">
                <h2 className="mb-1.5 flex items-center gap-3 text-lg font-[650] tracking-[-.5px]">
                  <LuCopy className="size-[25px]" /> Recommendations
                </h2>
                <div className="flex items-center gap-3.5 py-3 text-[13px]">
                  <ProductGlyph />
                  <span>Product C</span>
                  <span className="ml-auto grid size-[38px] place-items-center rounded-lg bg-base-content text-[22px] text-white">
                    <LuPlus />
                  </span>
                </div>
              </div>
            </div>
            <figcaption className="mt-[18px] text-center text-[11px] text-[var(--muted)]">
              Illustrative purchase pattern
            </figcaption>
          </figure>
        </section>
        <section
          id="how-it-works"
          className="border-t border-[#dededb] pt-[34px] pb-[30px]"
          aria-labelledby="how-title"
        >
          <h2
            id="how-title"
            className="mb-[30px] text-[28px] font-[650] tracking-[-1px] max-[640px]:text-[25px]"
          >
            A simple flow. A changing basket.
          </h2>
          <ol className="m-0 grid list-none grid-cols-3 p-0 max-[640px]:grid-cols-1 max-[640px]:gap-6">
            {steps.map(({ icon: Icon, title, description }, i) => (
              <li
                key={title}
                className="flex gap-6 border-l border-[var(--line)] pr-[25px] pl-[30px] first:border-l-0 first:pl-0 max-[900px]:gap-3 max-[900px]:pr-[15px] max-[900px]:pl-4 max-[640px]:gap-5 max-[640px]:border-t max-[640px]:border-l-0 max-[640px]:px-0 max-[640px]:pt-6 max-[640px]:first:border-t-0 max-[640px]:first:pt-0"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-base-300 text-[13px]">
                  0{i + 1}
                </span>
                <div>
                  <Icon
                    className="mt-[7px] mb-5 size-[30px] stroke-[1.5] max-[640px]:mb-3"
                    aria-hidden="true"
                  />
                  <h3 className="mb-1.5 text-[17px] font-[650] tracking-[-.5px]">
                    {title}
                  </h3>
                  <p className="max-w-[200px] text-sm leading-normal text-[var(--muted)] max-[640px]:max-w-none">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <footer className="border-t border-[var(--line)] pt-4 pb-6 text-[11px] text-[var(--muted)]">
          Purchase patterns, not compatibility guarantees.
        </footer>
      </main>
    </>
  );
}
