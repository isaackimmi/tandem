# Tandem

A market basket recommender built with Next.js, Tailwind CSS, daisyUI, and FastAPI. Browse 40 products from the supplied retail dataset, build a basket, and explore co-purchase suggestions supported by the **entire basket**.

## Setup

Prerequisites: Node.js 22.9 or newer, Python 3.12, and npm 11.6.2 (the lockfile/CI version). From the repository root:

```sh
npm ci
npm --prefix client ci
python3.12 -m venv server/.venv
server/.venv/bin/python -m pip install -r server/requirements.txt
```

Then start both services with one command:

```sh
npm run dev
```

Open http://127.0.0.1:3000. The API runs on port 8000. **Ctrl+C stops both services.** If either port is occupied, the runner exits rather than starting a duplicate app. Dependency installation is separate from startup.

For production mode locally, stop the development app, then run `npm run build` followed by `npm start`. The frontend build does not require a running backend.

## Using Tandem

- Open **Build your basket**, browse both catalog pages, or search by name/SKU.
- Add a product once. Its catalog action becomes **✓ Added**; remove it through the basket.
- Suggestions update on every basket change. An unsupported full basket shows no recommendations, even if a smaller subset has a match.
- Clear the basket to start over. Refreshing the page also resets it.

An observed dataset example: select SKUs `60-652-95R` and `DH-IPC-HDBW4431R-ZS`. Tandem recommends `DS-2CD2142FWD-I`. Adding `0806-001` produces no qualifying rule; removing it restores the suggestion. These are co-purchase patterns, not device-compatibility guarantees.

## Verification

```sh
npm run test:backend
npm --prefix client run lint
npm run typecheck
npm --prefix client test
npm run build
npx playwright install --no-shell chromium
npm run test:e2e
```

Stop the app before the default browser test command. The harness owns one app pair and a small server-side network fixture, runs one browser worker, and cleans them up afterward. For a deliberately shared test instance, start it with `API_ORIGIN=http://127.0.0.1:8001 npm start` and use `TANDEM_REUSE_APP=1 npm run test:e2e`; the test harness supplies the proxy. Ordinary app instances are not suitable for fixture-controlled server-fetch tests.

Browser results are in `test-results/results.json`, with playable MP4 videos indexed in `test-results/videos.md`. Failed tests also retain screenshots and Playwright traces. The wrapper converts captures to H.264 MP4, verifies decoding, and removes intermediate WebM files. CI runs backend tests, lint/types, a backend-independent production build, and browser acceptance sequentially, uploading MP4 evidence and diagnostics.

## Configuration and structure

Optional root `.env` and `server/.env` files are loaded by both root build and run commands; see the corresponding `.env.example` files. Shell variables take precedence. `PORT`/`BACKEND_PORT` default to 3000/8000. `API_ORIGIN` is the server-side API origin; `NEXT_PUBLIC_API_ORIGIN` is public and baked into the browser bundle, so rebuild after changing it. Configure `CORS_ORIGINS` explicitly for hosted origins.

- `client/`: landing page and streamed, responsive shopping workspace.
- `server/`: CSV validation, packaged mlxtend Apriori, FastAPI, and pytest.
- `references/`: sole authoritative runtime CSV and assignment example.
- `tests/`: real-backend browser journeys and controlled network-boundary tests.

API: `GET /api/v1/items`, `POST /api/v1/recommendations`, `GET /health`, and `GET /ready`. See [API contract](server/API.md).

## Model and limitations

Each backend instance mines once at startup and reuses its rules. The frozen configuration is support **0.002**, confidence **0.10**, and lift **strictly greater than 1**. The dataset yields 2,188 rules for 40 single-item baskets, 624 pairs and 59 triples. Each rule has at least two supporting transactions. Ranking is confidence, lift, support, then SKU. See the [calibration report](server/MODEL_REPORT.md) for measured coverage, timings, supporting counts, and the 1% support comparison.

The CSV contains unordered transactions, not individual purchase histories or quantities. Coverage is sparse; no recommendation is often the correct outcome. There is no popularity fallback, external catalog, database, predictive-accuracy claim, or compatibility inference.

## Delivery

The local app is the required milestone. Deployment is a separate optional PR targeting **Vercel from this monorepo**, retaining Next.js and FastAPI/Python. The prepared configuration uses single-project Vercel Services, with two projects from the same repository as a fallback. See [deployment setup, validation limits, and rollback](docs/deployment.md). That PR is reserved for Isaac's review and will not be merged automatically.

See the [acceptance evidence](docs/acceptance.md), [executive summary](https://app.notion.com/p/3fde7d562b8181c4b7d2cc90094096a3), [Notion presentation](https://app.notion.com/p/3fde7d562b8181fa9a30e1a95cc96090), and [read-aloud script](https://app.notion.com/p/3fde7d562b81815ea5e0c15dad02c293). The presentation works in native Notion Presentation Mode (Command–Option–P). Editable architecture diagrams and a verified MP4 navigation rehearsal are in [docs/presentation](docs/presentation).

UI icons use the Lucide family through `react-icons/lu` (ISC license); see installed dependency license notices. Dependency lockfiles preserve the selected versions.
