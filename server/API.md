# Backend contract

Run from `server/` with `.venv/bin/python -m uvicorn app.main:app --port 8000`.
Normal local use is the repository-root `npm run dev` command. OpenAPI is at
`/openapi.json`, with interactive documentation at `/docs`.

`GET /api/v1/items` accepts `q` (maximum 200 characters), `page` (integer >=1,
default 1), and `pageSize` (integer 1–100, default 20). Whitespace-trimmed,
case-insensitive name/SKU substring search runs before pagination. Catalog order
is casefolded product name then SKU. No matches means `totalPages: 0`; a page
past the end returns an empty list and the requested page metadata.

```json
{"items":[{"id":"A","name":"Example","sku":"A"}],"page":1,"pageSize":20,"total":1,"totalPages":1}
```

`POST /api/v1/recommendations` requires a JSON object with `selectedItemIds` (up to
100 raw string entries) and optional integer `limit` (1–10, default 5). Duplicate
IDs normalize to a sorted unique basket. Unknown IDs, wrong types, extra fields,
and invalid limits return 422 validation details. No cart is persisted.

```json
{
  "selectedItemIds":["60-652-95R","DH-IPC-HDBW4431R-ZS"],
  "recommendations":[{
    "id":"DS-2CD2142FWD-I",
    "name":"Hikvision 4MP IP Camera",
    "sku":"DS-2CD2142FWD-I",
    "antecedentIds":["60-652-95R","DH-IPC-HDBW4431R-ZS"],
    "supportingTransactionCount":5,
    "support":0.005,
    "confidence":0.35714285714285715,
    "lift":3.536067892503536
  }],
  "reason":null,
  "modelVersion":"18b05da9c57356864201bf5efd93f154374831026b32b23620762ca3e963591c"
}
```

Empty basket: HTTP 200, `recommendations: []`, `reason: "empty_basket"`.
No qualifying complete-basket rule: HTTP 200, `recommendations: []`,
`reason: "no_qualifying_rules"`. A missing model is HTTP 503, never an empty
success. Read-only requests do not reread the CSV or remine rules.

`GET /health` reports a responding process. `GET /ready` returns status,
modelVersion, productCount, ruleCount, and initialization duration in seconds.
A valid zero-rule model is ready. Initialization blocks startup, so network
requests can fail to connect until it finishes; health is not claimed available
while startup is blocked.

## Configuration

- `TANDEM_CSV_PATH`: optional explicit CSV path. Default is computed relative to
  the installed source, at repository `references/`, independent of current directory.
- `CORS_ORIGINS`: comma-separated explicit frontend origins. Defaults to
  `http://localhost:3000,http://127.0.0.1:3000`; wildcard is rejected.
- `MIN_SUPPORT`, `MIN_CONFIDENCE`, `MIN_LIFT`: override frozen calibration defaults
  0.005, 0.15, 1.0. Lift comparison remains strict. Invalid config fails startup.
- One Uvicorn worker is sufficient. Each process initializes its own model once.
  Thread environment limits are set by the repository launcher.

## Validation

From repository root: `server/.venv/bin/python -m pytest -q server/tests`.
The tests use independent tiny fixtures and the actual committed CSV. Backend
TestClient checks do not replace the coordinator's real browser Playwright and
manual MP4 acceptance gates.

## Source organization

`app/main.py` composes startup, middleware, and routers. Each API resource has
its own module in `app/endpoints/`; HTTP request/response schemas live in
`app/schemas/`. The `data_science/` package owns CSV validation, Apriori mining,
and calibration. Its shared immutable domain classes live in `data_types.py`
and `model_types.py`, separate from parsing and mining. Run calibration with
`PYTHONPATH=server server/.venv/bin/python -m data_science.calibrate`.
