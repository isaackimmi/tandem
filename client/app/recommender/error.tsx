"use client";
import { PanelError } from "@/components/Feedback/PanelError";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main
      id="main"
      className="m-auto max-w-[1500px] px-8 py-[38px] max-[640px]:px-4 max-[640px]:py-7"
    >
      <div className="card rounded-2xl border border-[#ededeb] bg-white p-6 shadow-[0_7px_22px_#00000005] max-[1100px]:p-5 max-[380px]:p-4">
        <PanelError title="The workspace couldn’t load" onRetry={reset} />
      </div>
    </main>
  );
}
