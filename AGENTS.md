# Tandem execution rules

Build the agreed Next.js /client and FastAPI /server monorepo. The authoritative CSV is in /references. Use mlxtend Apriori, exact full-basket matching without fallback, unique products without quantities, and the approved neutral design. Detailed evidence UI and held-out evaluation are out of scope.

Read docs/requirements.md before changing behavior. Test public model/API boundaries and user flows in small red-green slices. Keep frontend components composable, use daisyUI/Tailwind and react-icons/lu, and preserve loading/error/reduced-motion behavior.

## Code organization

Keep each React component in its own file and group related components in a named directory (for example components/Item/Item.tsx, ItemList.tsx, AddAction.tsx). Use daisyUI component classes and Tailwind utilities for ordinary styling. Put necessary component-specific custom CSS in a colocated CSS Module; reserve globals.css for framework/theme setup and genuinely global base/accessibility rules.

Keep app/main.py focused on application composition and lifecycle. Put each endpoint family in its own module and shared request/response schemas in dedicated modules. Data-science logic belongs in server/data_science. Preserve API contracts when reorganizing.

The coordinator owns app processes and browser-test scheduling. Use one shared frontend/backend pair and one Playwright worker; at most two app instances and five coding agents. Serialize builds and browser runs. If memory pressure rises, stop task-owned heavy work before continuing; leave unrelated user processes alone.

Keep PRs logically scoped (aim under 750 non-test lines). Before merging required work, obtain agent review, passing relevant backend and Playwright checks, and a recorded manual browser demo. All delivered videos must be real playable MP4. Record actual commands, commit, results, and evidence; never claim unrun checks.

Each task's Notion Logs database records meaningful progress, deviations and reasoning, independently resolved questions, verification, and remaining work. Preserve previous logs. Routine implementation decisions are autonomous.

The required app and Vercel deployment are delivered. Authorized follow-up changes use the same review, CI, manual MP4 and hosted-verification workflow before completion. Keep Apriori configuration proposals separate from behavior-preserving cleanup; do not apply pending thresholds until approved. Maintain the Notion presentation, video script and architecture references when relevant behavior changes.
