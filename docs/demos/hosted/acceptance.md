# Hosted manual acceptance

Public app: https://tandem-three-lyart.vercel.app

Verified application commit: `97d15e0db635b6fdd059ddeb2e0bd8c1470b6230` (PR9 plus the provider packaging fix in PR10). [Post-merge CI](https://github.com/isaackimmi/tandem/actions/runs/39089756260) passed 48 backend tests, three API request tests, lint/typecheck, production build, and all 14 automated Playwright tests with MP4 verification.

## What was manually checked

The coordinator operated the hosted browser step by step and inspected resulting UI states; this was separate from running the automated suite. Cases 1–12 below use the actual merged public app. Cases requiring controlled errors or response ordering use browser-local response interception, explicitly equivalent to the existing test fixtures. Those fabricated responses prove UI behavior, not recommendation quality or a backend outage.

[Recorded public-app manual checks, cases 1–12](manual-hosted-12-cases.mp4)

| Case | Manual result |
| --- | --- |
| 1. Landing navigation | Build your basket opens the workspace with catalog, basket, search and shared navigation. |
| 2. Catalog/search/unique selection | Two pages expose 40 distinct products. Next disables on page two. Empty search result and case-insensitive name/SKU search work. Selection persists across searches/pages; Added is disabled; removal restores Add. |
| 3. Real full-basket journey | GE 60-652-95R + Dahua DH-IPC-HDBW4431R-ZS recommends Hikvision DS-2CD2142FWD-I. Axis 0806-001 clears it; removal restores it. Adding the suggestion yields three unique items; clear empties both panels. No response mocking in this case. |
| 4. Mobile keyboard/reset | At 390×844, Enter selects once even when pressed again; keyboard removal restores Add. No horizontal overflow. Refresh resets the basket. |
| 5. Reduced motion | Space selects while computed transform/scale are none and transition duration is 0s. |
| 6. Recommendation loading/failure/retry | Delayed 503 displays local skeleton then Retry; search remains enabled and basket is preserved. Retry succeeds. |
| 7. Stale recommendation success | Earlier success released after newer result cannot replace it; current recommendation remains actionable. |
| 8. Stale recommendation error | Earlier 503 released after newer success cannot show a stale Retry state; current recommendation remains actionable. |
| 9. Catalog retry | Failed search preserves the basket; Retry requests the same query and restores the disabled Added state. |
| 10. Stale search | Earlier held search released after current search cannot replace current results; current product can be selected. |
| 11. A → AB → A and clear race | Fresh third request wins over original A response. Old suggestions clear synchronously. Clearing during a pending fourth request prevents results/loading from reappearing. |
| 12. Returning to a previous basket | Returning to A waits for a fresh response with skeleton and zero cached cards. Fresh result wins; delayed AB cannot replace it. |
| 13. Initial server Suspense | On the isolated fixture preview, a three-second backend delay leaves shell, basket and Loading catalog visible; 20 rows arrive afterward. |
| 14. Initial server failure/retry | On the isolated fixture preview, an initial server 503 leaves shell and basket intact; browser Retry loads 20 real catalog rows in place. |

## Isolated server-boundary preview

The two server cases need conditions a normal public browser cannot impose on a server-to-server request. They ran on a protected Vercel preview built from the same main commit with temporary fault controls on branch `codex/hosted-boundary-fixtures`, commit `3fc6a69a624a5757927b03177ac41ceffac9909c`. This branch is **not merged into main**. The controls affect only the initial server catalog request; browser retry still calls the real catalog endpoint. The hosted production app has no fault-control routes.

Preview: https://tandem-r0rhcj9nh-isaackimmis-projects.vercel.app

[Recorded server-boundary manual checks, cases 13–14](manual-server-boundaries.mp4)

## Deployment findings

The first actual Vercel build failed to parse a nested requirements include. PR10 moved the identical 34 runtime pins directly into root requirements.txt and made local setup include that canonical file. Independent review confirmed exact pin parity; local backend tests and both pip dry-runs passed. The next hosted build succeeded. Application behavior and thresholds did not change.

Production readiness returned 40 products,15 rules and modelVersion `18b05da9c57356864201bf5efd93f154374831026b32b23620762ca3e963591c`. Reported initialization was 0.103s; one observed workspace HTTP request completed in 1.712s. These are observations, not a latency benchmark or a guarantee about every cold start. Browser API requests stayed on the public HTTPS deployment domain; the initial catalog rendered without a duplicate browser API request. The authenticated preview also passed the genuine supported/unsupported basket journey.

Both delivered recordings are H.264 MP4, converted and fully decoded successfully. Visual UI states were inspected during the manual sessions. The local app pair remained the only locally running app; the additional browser was closed after recording.
