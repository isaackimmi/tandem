# Model calibration and data validation

The committed source contains 1,000 purchases and 40 distinct SKUs. Its SHA-256 is
`3d48b2480bee2ca3942f7add047233eb69461d210b996733c3eff3ee0bf5cbe6`.
The validated basket-size distribution is 237 two-item, 228 three-item,
258 four-item, and 277 five-item transactions. No within-basket duplicates were
removed. Repeated purchases remain separate observations.

## Approved configuration — October 17, 2026

Minimum support **0.002** (two purchases), minimum confidence **0.10**, and
lift **strictly greater than 1.0**. These are now the application defaults,
replacing support 0.005 and confidence 0.15. Environment overrides remain
available; the API startup and direct model use share the same defaults.

The selected configuration produces 1,439 frequent itemsets and 2,188 eligible
single-consequent rules. Every recommendation requires at least two observations
of the complete selected basket plus the suggested item. Matching uses the exact
full basket, without subset fallback or automatic threshold relaxation.

The probe denominator is every distinct, nonempty subset of a recorded basket,
including complete recorded baskets: 40 singletons, 778 pairs, 3,333 triples,
1,628 quadruples, and 277 quintuples. Any unobserved basket cannot have a supported
rule. These are descriptive coverage counts, **not accuracy estimates**.

| Support | Confidence | Eligible rules | Singles | Pairs | Triples | Quadruples | Quintuples |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1% | 15% | 12 | 12 | 0 | 0 | 0 | 0 |
| 0.5% | 15% (previous app) | 15 | 12 | 3 | 0 | 0 | 0 |
| 0.5% | 10% | 298 | 40 | 3 | 0 | 0 | 0 |
| 0.2% | 15% | 1,877 | 12 | 624 | 59 | 0 | 0 |
| **0.2%** | **10% (selected)** | **2,188** | **40** | **624** | **59** | **0** | **0** |
| 0.1% | 10% | 17,276 | 40 | 777 | 3,172 | 1,373 | 0 |

Lowering confidence alone broadens single-item coverage but does not recover
triples at the old support floor. Lowering support permits repeated, less common
combinations; combining the two changes supports a useful one-to-three-item demo.
We rejected 0.1% support because it admits rules backed by only one transaction:
15,088 of its 17,276 rules have that weakness. With the UI's top-five limit,
83.46% of displayed recommendation entries under that setting have one observation.
Two observations still provide weak evidence; this is a demonstration of Apriori,
not a claim of predictive quality or product compatibility.

The agreed demo scope is **one to three selected products**, replacing the prior
five-product walkthrough. This is a presentation decision, not a new basket input
cap or a change to the API's five-result default. The current model has no
qualifying four- or five-product antecedents. A fifth selected product also cannot
have an additional observed product in a dataset whose transactions contain at
most five products.

## Reproduce

From the repository root, after installing the locked server dependencies:

```sh
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 PYTHONPATH=server server/.venv/bin/python -m data_science.calibrate
```

The committed `calibration.json` records package/environment versions, measured
timings, source hash, six reproducible comparisons, chosen configuration, and
examples. The warm p95 uses 1,000 in-process lookup calls and excludes HTTP,
network, imports, and startup. Mining duration is not total process cold-start time.
The previous 90-setting exploratory study remains historical research; this
focused report reproduces the comparisons that explain the approved decision.

## Genuine browser acceptance examples

Clear the basket before each independent case. Result order follows confidence,
then lift, then support descending, then SKU ascending. The approved demo path is:

| Selected SKUs | Expected displayed recommendation SKUs, in order |
| --- | --- |
| `B5512` | `DS-7608NI-I2/8P`, `60-848-02-95R`, `6160` |
| `B5512`, `6160` | `DS-2CD2142FWD-I`, `HEN08104`, `QND-6010R`, `DS-7608NI-I2/8P` |
| `B5512`, `6160`, `DS-2CD2142FWD-I` | `QND-6010R` |
| `60-652-95R`, `DH-IPC-HDBW4431R-ZS` | `DS-2CD2142FWD-I`, `PG9914`, `5808W3`, `HEN08104`, `VISTA-20P` |
| `60-652-95R`, `DH-IPC-HDBW4431R-ZS`, `0806-001` | None; removing Axis restores the previous pair results |

The Bosch + Honeywell + Hikvision triple appears in three purchases; two also
contain `QND-6010R`. Its recommendation has support 2/1,000, confidence 2/3,
and lift approximately 7.168. The raw transaction counts are independently
verified by regression tests, including each result's support, confidence, and
lift. Bosch `B5512` is now a positive example and must no longer be presented as
an empty-result control.
