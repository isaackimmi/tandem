import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { Brand } from "./brand";

export function Header({ workspace = false }: { workspace?: boolean }) {
  return <header className="site-header">
    <a href="#main" className="skip-link">Skip to content</a>
    <div className="header-inner">
      <Brand />
      {workspace ? <>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/recommender" aria-current="page">Workspace</Link>
        </nav>
        <span className="header-note">Market basket recommender</span>
        <Link className="mobile-home" href="/">Home</Link>
      </> : <>
        <a className="how-link" href="#how-it-works">How it works</a>
        <Link className="btn btn-primary header-cta" href="/recommender">Open workspace <LuArrowRight aria-hidden="true" /></Link>
      </>}
    </div>
  </header>;
}
