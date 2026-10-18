# Model calibration and data validation

The committed source contains 1,000 purchases and 40 distinct SKUs. Its SHA-256 is
`3d48b2480bee2ca3942f7add047233eb69461d210b996733c3eff3ee0bf5cbe6`.
The validated basket-size distribution is 237 two-item, 228 three-item,
258 four-item, and 277 five-item transactions. No within-basket duplicates were
removed. Repeated purchases remain separate observations.

## Frozen configuration

Minimum support **0.005** (five purchases), minimum confidence **0.15**, and
lift **strictly greater than 1.0**. The originally proposed 0.01 support floor
produces 147 frequent itemsets and 12 eligible rules, all with singleton
antecedents. The approved five-occurrence comparison produces 673 itemsets
and 15 rules: the same 12 singleton rules plus three pair rules.

We selected the five-observation floor because it supports a small, real example
of the agreed whole-basket behavior while retaining an explicit minimum evidence
count. This is a demonstration configuration with sparse evidence, not proof of
predictive quality. There is no automatic threshold relaxation or fallback.

The probe denominator is every distinct, nonempty subset of a recorded basket,
including complete recorded baskets. At the selected floor, supported probes are:
12/40 singletons, 3/778 pairs, 0/3333 triples, 0/1628 quadruples, and 0/277 quintuples.
These are descriptive coverage counts, **not accuracy estimates**. Five-or-more
selected products cannot have an additional observed product in this source.

## Reproduce

From the repository root, after installing the locked server dependencies:

```sh
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 PYTHONPATH=server server/.venv/bin/python -m tandem.calibrate
```

The machine-readable `calibration.json` records package/environment versions,
actual timings, source hash, counts, chosen configuration, and examples. The
measurement's warm p95 uses 1,000 in-process lookup calls and excludes HTTP,
network, imports, and startup. The initial measured mining computation was about
21 ms for the selected configuration; this is not total process cold-start time.

## Genuine browser acceptance example

Select `60-652-95R` (GE Interlogix carbon monoxide detector) and
`DH-IPC-HDBW4431R-ZS` (Dahua IP camera). The recommendation is
`DS-2CD2142FWD-I` (Hikvision 4MP IP Camera). Five of the 14 transactions containing
that pair also contain the suggested camera: support 0.005, confidence 5/14,
lift approximately 3.536. Adding `0806-001` clears all suggestions. Removing it
restores the original recommendation.

These are co-purchase relationships, not electrical compatibility claims.
