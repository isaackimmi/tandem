# Tandem execution rules

Build the agreed Next.js /client and FastAPI /server monorepo. The authoritative CSV is in /references. Use mlxtend Apriori, exact full-basket matching without fallback, unique products without quantities, and the approved neutral design. Detailed evidence UI and held-out evaluation are out of scope.

Read docs/requirements.md before changing behavior. Test public model/API boundaries and user flows in small red-green slices. Keep frontend components composable, use daisyUI/Tailwind and react-icons/lu, and preserve loading/error/reduced-motion behavior.

The coordinator owns app processes and browser-test scheduling. Use one shared frontend/backend pair and one Playwright worker; at most two app instances and five coding agents. Serialize builds and browser runs. If memory pressure rises, stop task-owned heavy work before continuing; leave unrelated user processes alone.

Keep PRs logically scoped (aim under 750 non-test lines). Before merging required work, obtain agent review, passing relevant backend and Playwright checks, and a recorded manual browser demo. All delivered videos must be real playable MP4. Record actual commands, commit, results, and evidence; never claim unrun checks.

Each task's Notion Logs database records meaningful progress, deviations and reasoning, independently resolved questions, verification, and remaining work. Preserve previous logs. Routine implementation decisions are autonomous.

After local acceptance, deliver an executive summary, then prepare the optional Vercel deployment PR for Next.js and FastAPI in this monorepo. Validate single-project Vercel Services; separate Vercel projects from the same repo remain a fallback. Leave that PR UNMERGED for Isaac's review. Do not deploy or purchase services as part of preparing it. Finish the requested Notion presentation, timed demo script, and editable architecture diagram with independent agent review.
