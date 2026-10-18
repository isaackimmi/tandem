# Tandem implementation contract

Authoritative plan: https://app.notion.com/p/3fce7d562b818022b9e4f6752f0e3d7a
Design: https://app.notion.com/p/3fde7d562b818163a880ec86a955225f
Tasks: https://app.notion.com/p/3fce7d562b81801cae96d40e81e18806

## Product

Use the supplied 1,000-transaction, 40-product CSV exclusively. Products are unique SKU-backed identities; repeated basket rows remain separate observations, duplicates within a basket count once. Parse labels and reject inconsistent SKU/name data. No external product data, prices, quantities, accounts, payments, or compatibility claims.

Mine with packaged mlxtend Apriori at backend startup. Rules have one consequent and require the entire current basket as antecedent. No subset/popularity fallback. Exclude selected products, rank confidence then lift then support descending and SKU ascending. Initial support .01, confidence .15, lift >1 are provisional; calibrate nearby settings, document evidence, then freeze configuration. Empty or unsupported baskets return no recommendations. Backend evidence remains in the API; a detailed evidence UI and held-out predictive evaluation are excluded.

GET /api/v1/items accepts q/page/pageSize (20 default, 100 max) and returns items, page, pageSize, total, totalPages. Search name/SKU case-insensitively, sort name/SKU. POST /api/v1/recommendations accepts selectedItemIds (raw bound100, normalize duplicates, reject unknown) and limit (default5, max10). Return canonical selectedItemIds, recommendations, reason, modelVersion. Recommendation evidence: antecedentIds, supportingTransactionCount, support, confidence, lift. Success reason null; valid empty reasons empty_basket/no_qualifying_rules; validation422, unready503. Health/readiness distinguish process and model availability.

## Interface

Next.js App Router / landing and /recommender workspace, daisyUI + Tailwind + named react-icons/lu imports. Native fetch. Composable Item/ItemList reused by AvailableItems/RecommendedItems. Match approved design: warm-gray canvas, white surfaces, charcoal text, restrained shadows, generous spacing, system type, landing preview and three-step explanation. Mobile catalog/basket/recommendation anchors and no horizontal overflow.

Catalog search/pagination stays independent of basket and recommendations. One selection per product; refresh resets. Selected row stays white, no highlight/stripe/status pill; borderless disabled check + Added in fixed action slot. Basket remove restores Add; clear resets immediately. Old recommendations disappear synchronously on basket change, late responses cannot win, clear cannot resurrect results. Debounced search ignores late results and retries current query/page.

Stable shell and basket provider outside initial catalog Suspense. Runtime Server Component fetch under local boundary, finite timeout, no backend dependency during build, no duplicate hydration fetch. Route loading/error plus local request errors and regional render boundaries. Keep unrelated controls usable during loading/errors; retry preserves basket. Smooth small CSS press/fade feedback, disabled decorative motion under prefers-reduced-motion, persistent keyboard focus, polite status, accessible product-specific control names.

## Verification and delivery

Test-first seams: CSV/catalog public functions, rule policy, FastAPI endpoints/lifespan, browser user interactions. Fixtures independently specify edge cases; actual CSV/backend browser journey proves integration. Cover all40 products, search/SKU, pagination, unique add/remove/clear, full-basket unsupported state/restoration, malformed requests, deterministic ties, stale search/recommendation races, failures/retry, boundary isolation with server-side delay fixture, keyboard/mobile/reducedmotion, production build without backend and production startup.

Separate dependency setup; npm run dev at repo root starts both services and Ctrl+C cleans them up. Lock dependencies. One shared running app, one Playwright worker, heavy checks serialized. Required PRs need review + relevant BE/Playwright + manual browser MP4 before merging. Every delivered recording is real MP4 with decode/playback verification. Preserve source data when renaming reference/ to references/.

Required task mapping: foundation TASK-14, data TASK-13, catalog API TASK-11, model TASK-21, recommendation API TASK-9, landing/components TASK-16, catalog/basket TASK-19, live recommendations TASK-10, Playwright/CI TASK-15, handoff TASK-12. Each task has linked PRs, acceptance evidence, and running Notion Logs. Existing native IDs remain unchanged.

Deliver concise README, calibration report and limitations, source ZIP preparation, verified demo MP4, exact tested commit, and executive summary (features, tests, resolved issues/root causes, deviations, remaining concerns). After local milestone and summary, prepare TASK-17 optional Vercel deployment PR: same monorepo, Next.js + FastAPI/pandas/mlxtend. Validate Vercel Services for a single project/domain; two Vercel projects from the same repository remain the fallback if beta limitations prevent it. Leave deployment PR unmerged for Isaac. Deployment configuration must account for bundled CSV, per-instance initialization, cold/warm latency, bundle/memory limits, environment origins, previews, and coordinated rollback.

Final handoff also includes a polished Notion presentation, a timed read-aloud demo script with action cues, and an editable architecture diagram with image export. Explain purpose, Apriori, support/confidence/lift, actual calibrated thresholds and full-basket behavior. Match the Apple/Notion visual direction and distinguish completed local work from proposed deployment. Subagents create and independently review these artifacts at the end; verify the actual Notion presentation workflow and rehearse it. Link them from the master plan, handoff task, and executive summary; every rehearsal recording must be playable MP4.
