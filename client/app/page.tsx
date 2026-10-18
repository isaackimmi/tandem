import Link from "next/link";
import { LuArrowDown, LuArrowRight, LuBox, LuCopy, LuPlus, LuSearch, LuShoppingBasket } from "react-icons/lu";
import { Header } from "@/components/header";

const steps = [
  { icon: LuSearch, title: "Explore the catalog", description: "Search products by name or SKU." },
  { icon: LuShoppingBasket, title: "Build your basket", description: "Choose each product once." },
  { icon: LuCopy, title: "See what follows", description: "Recommendations reflect your whole basket." },
];

export default function Home() {
  return <><Header /><main id="main" className="landing">
    <section className="hero-layout" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">Patterns, found together</p>
        <h1 id="hero-title">Every basket<br />tells a story.</h1>
        <p className="hero-description">Explore products and discover what is purchased together.</p>
        <Link className="btn btn-primary hero-cta" href="/recommender">Build your basket <LuArrowRight aria-hidden="true" /></Link>
        <p className="hero-note">One product. One selection. New possibilities.</p>
      </div>
      <figure className="hero-figure" aria-label="Illustration of products A and B in a basket leading to a suggestion for product C">
        <div className="illustration-grid" aria-hidden="true">
          <div className="illustration-backdrop backdrop-one" /><div className="illustration-backdrop backdrop-two" />
          <div className="preview-card card">
            <h2><LuShoppingBasket /> Your basket</h2>
            <div className="preview-items">{["Product A", "Product B"].map(name => <div className="preview-row" key={name}><span className="product-glyph"><LuBox /></span><span>{name}</span><span className="preview-check">✓</span></div>)}</div>
          </div>
          <div className="flow-connector"><LuArrowDown /></div>
          <div className="preview-card preview-recommendation card"><h2><LuCopy /> Recommendations</h2><div className="preview-row"><span className="product-glyph"><LuBox /></span><span>Product C</span><span className="preview-plus"><LuPlus /></span></div></div>
        </div>
        <figcaption>Illustrative purchase pattern</figcaption>
      </figure>
    </section>
    <section id="how-it-works" className="how-it-works" aria-labelledby="how-title">
      <h2 id="how-title">A simple flow. A changing basket.</h2>
      <ol className="steps-grid">{steps.map(({ icon: Icon, title, description }, i) => <li key={title}>
        <span className="step-number">0{i + 1}</span><div><Icon className="step-icon" aria-hidden="true" /><h3>{title}</h3><p>{description}</p></div>
      </li>)}</ol>
    </section>
    <footer className="landing-footer">Purchase patterns, not compatibility guarantees.</footer>
  </main></>;
}
