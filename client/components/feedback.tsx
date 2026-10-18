"use client";
import { Component, type ReactNode } from "react";
import { LuArrowUp, LuRotateCcw, LuSearchX, LuUnplug } from "react-icons/lu";

export function PanelError({ title = "This panel couldn’t load", onRetry }: { title?: string; onRetry: () => void }) {
  return <div className="panel-message" role="alert"><LuUnplug className="state-icon" aria-hidden="true" /><h3>{title}</h3><p>Your basket is still here. Please try again.</p><button className="btn btn-outline" onClick={onRetry}><LuRotateCcw aria-hidden="true" /> Retry</button></div>;
}

export function EmptyState({ title, children, backToCatalog = false }: { title: string; children: ReactNode; backToCatalog?: boolean }) {
  return <div className="panel-message"><LuSearchX className="state-icon" aria-hidden="true" /><h3>{title}</h3><p>{children}</p>{backToCatalog && <a className="btn btn-soft" href="#catalog">Back to catalog <LuArrowUp aria-hidden="true" /></a>}</div>;
}

export function RowsSkeleton({ count = 5, label = "Loading products" }: { count?: number; label?: string }) {
  return <div className="rows-skeleton" role="status" aria-label={label}><span className="sr-only">{label}</span><div aria-hidden="true">{Array.from({ length: count }, (_, index) => <div className="skeleton-row" key={index}><div className="skeleton skeleton-icon" /><div className="skeleton-lines"><div className="skeleton" /><div className="skeleton short" /></div><div className="skeleton skeleton-action" /></div>)}</div></div>;
}

export class RegionBoundary extends Component<{ children: ReactNode; label: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <PanelError title={`${this.props.label} couldn’t load`} onRetry={() => this.setState({ failed: false })} /> : this.props.children;
  }
}
