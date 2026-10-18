"use client";
import { PanelError } from "@/components/feedback";
export default function Error({ reset }: { reset: () => void }) { return <main id="main" className="workspace"><div className="card panel"><PanelError title="The workspace couldn’t load" onRetry={reset} /></div></main>; }
