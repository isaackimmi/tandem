> Historical research snapshot, retained to explain the decision. The approved 0.2% support / 10% confidence configuration is now implemented; see [current calibration report](../server/MODEL_REPORT.md). References below to research-only or proposed settings describe the earlier research stage.

# Tandem demo calibration — research only

Research date: October 17, 2026 (Pacific/Honolulu). No configuration, app code, tests, or deployment changed. The live model still uses support 0.005, confidence 0.15, and lift strictly above 1.

## Confirmed demo scope

Isaac confirmed on October 17, 2026 (Pacific/Honolulu) that the demo should focus on one, two, or three selected products. Four- and five-item basket coverage is no longer an objective. This does not impose an app basket cap or change the five-suggestion display limit. Configuration implementation remains on hold.

## Recommendation

For a useful classroom demo while avoiding rules based on only one transaction, propose **support 0.002 (0.2%), confidence 0.10 (10%), and lift strictly above 1**. Preserve exact full-basket matching and the existing five-result limit/ranking. These settings already have backend environment-variable support:

```dotenv
# Proposal only — NOT applied
MIN_SUPPORT=0.002
MIN_CONFIDENCE=0.10
MIN_LIFT=1
```

This is a demo-oriented compromise, not an empirically established optimum or predictive-quality claim. It makes every individual product useful as a starting point and covers 80% of all possible pairs. Three-item recommendations remain rare without a guided path. Four- and five-item baskets still return no results.

If the priority is a longer, more permissive live interaction, support 0.001 is an available alternative, but it relies heavily on single observations. It should be described as exploratory rather than strong evidence. Neither configuration can promise suggestions after arbitrary additions.

## Experiment and provenance

Used the unchanged authoritative CSV (1,000 transactions; 40 products), SHA-256 `3d48b2480bee2ca3942f7add047233eb69461d210b996733c3eff3ee0bf5cbe6`, and actual `mine_model`/`recommend` functions at source commit `aa7a110ca47008e284dc187c12e4758c31c1f354`.

Evaluated 90 configurations: support 1%, 0.5%, 0.4%, 0.3%, 0.2%, 0.1%; confidence 20%, 15%, 12%, 10%, 5%; lift strictly above 1, 1.2, or 1.5. Each rule has exactly one consequent. Counts below are distinct selected baskets with at least one result, not the number of rules or distinct suggestions. Product selection order does not change matching.

Raw results and the analysis-only reproduction script are in `artifacts/calibration-research/results.json` and `artifacts/calibration-research/analyze.py`. Run from repository root with `PYTHONPATH=server OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 server/.venv/bin/python artifacts/calibration-research/analyze.py`. This instantiates models in a separate process; it does not configure the running app. No held-out accuracy evaluation was performed. An independent researcher reproduced the proposed configuration using raw transaction-subset counts and direct metric arithmetic without mlxtend: 40/624/59 qualifying baskets and 2,188 rules, with the same top-five Bosch demo path.

## Main comparison

All rows use lift strictly above 1. Denominators are all unique combinations from the 40-item catalog, including combinations absent from the CSV.

| Support | Minimum joint count | Confidence | Single /40 | Double /780 | Triple /9,880 | Quadruple /91,390 | Quintuple /658,008 | Rules |
|---|---:|---|---:|---:|---:|---:|---:|---:|
| 0.5% — current | 5 | 15% | 12 | 3 | 0 | 0 | 0 | 15 |
| 0.5% | 5 | 10% | 40 | 3 | 0 | 0 | 0 | 298 |
| 0.4% | 4 | 10% | 40 | 15 | 0 | 0 | 0 | 310 |
| 0.3% | 3 | 10% | 40 | 190 | 0 | 0 | 0 | 535 |
| **0.2% — proposed** | **2** | **10%** | **40** | **624** | **59** | **0** | **0** | **2,188** |
| 0.1% — permissive | 1 | 10% | 40 | 777 | 3,172 | 1,373 | 0 | 17,276 |

At 0.2%, coverage is 100% of singles, 80% of possible pairs, and 0.60% of possible triples. Among observed sub-baskets only, it is 624/778 pairs (80.21%) and 59/3,333 triples (1.77%). Observed-subset percentages are not interchangeable with all-combination percentages.

At 0.1%, 3,172 triples is 32.11% of all possible triples, despite being 95.17% of observed triples. The 1,373 supported quadruples are only 1.50% of all possible quadruples (84.34% of observed quadruples). Even the permissive setting is not an always-on recommender for arbitrary larger selections.

## Why confidence alone cannot fix it

At 0.5% support, reducing confidence from 15% to 10% improves singles from 12 to 40 but leaves pairs at 3. Even 5% confidence leaves pairs at 3. Multi-item unions are excluded by support before they can produce qualifying rules.

At 0.2% support, 15% confidence gives 12/624/59 supported baskets of sizes 1/2/3; 10% gives 40/624/59. Lowering confidence to 5% does not increase this coverage. Therefore 10% has a clear coverage benefit over 15% without needing to go all the way to 5%.

Increasing lift to strictly above 1.2 preserves 40/624/59 coverage at 0.2% support and 10% confidence, but can remove lower-ranked suggestions. Raising it to above 1.5 cuts singleton coverage to 22/40 while leaving multi-item counts unchanged. High lift does not cure tiny supporting counts, so retain the existing >1 policy for this proposal.

## The structural limits in this CSV

Support applies to the selected basket **plus the new item**. A three-item selected basket requires a four-item union; a four-item basket requires a five-item union.

| Co-purchased union size | Distinct observed sets | Maximum occurrences | Frequency distribution |
|---|---:|---:|---|
| 3 | 3,333 | 5 | 2,722 once; 531 twice; 75 three times; 4 four times; 1 five times |
| 4 | 1,628 | 2 | 1,613 once; 15 twice |
| 5 | 277 | 1 | All once |

Consequences:

- Any triple-basket recommendation requires a support floor no higher than 0.2%.
- Any quadruple-basket recommendation requires a floor no higher than 0.1% and therefore one-observation evidence.
- Quintuple-basket recommendations are impossible with this CSV and full-basket matching: no six-item union exists.
- Changing thresholds cannot manufacture additional observations or prove product compatibility.

## Evidence tradeoff and ranking

At the proposed configuration, all 40 single products show 3–5 suggestions. Their displayed rules have 8–16 supporting transactions. Across all supported pair baskets, 1,476 of 1,716 displayed recommendation entries (86.0%) have exactly two supporting transactions; all 60 displayed entries across the 59 supported triples have exactly two. Two observations are still weak evidence. This proposal avoids one-off rules, but must not be described as robust predictive validation.

At 0.1% support, 83.46% of recommendation entries displayed across all qualifying baskets are supported by just one transaction. This denominator counts each basket-to-suggestion entry in its top five, not visitors or clicks. A four-item basket seen once can produce 100% confidence from 1/1 and a large lift. Existing confidence-first ranking can rank this first; neither number establishes reliability.

Definitions and caution: [official mlxtend association-rule metrics](https://rasbt.github.io/mlxtend/user_guide/frequent_patterns/association_rules/) and [Apriori support](https://rasbt.github.io/mlxtend/user_guide/frequent_patterns/apriori/). Additional methodology is in [calibration-methodology.md](calibration-methodology.md).

## Interaction continuity

Starting separately from each of the 40 catalog products, repeatedly add the highest-ranked recommendation until no suggestion remains:

| Support (confidence 10%, lift >1) | Final basket sizes across the 40 starts |
|---|---|
| 0.5% | 39 stop at 2 items; 1 stops at 3 |
| 0.3% | 6 stop at 2; 34 stop at 3 |
| 0.2% | 29 stop at 3; 11 stop at 4 |
| 0.1% | 9 stop at 4; 31 stop at 5 |

These are deterministic, recommendation-following paths over the same training data, not success rates for real users. At 0.2%, every starting product supports at least two consecutive recommended additions. A guided path can demonstrate a third addition; arbitrary third products often clear suggestions.

## Concrete demo under the proposed configuration

Use a genuine path starting from the Bosch B5512 that motivated this research:

1. Select **Bosch B5512 Control Panel (`B5512`)**. Three suggestions appear: Hikvision NVR (`DS-7608NI-I2/8P`), GE smoke detector (`60-848-02-95R`), Honeywell keypad (`6160`).
2. Choose **Honeywell 6160 Keypad (`6160`)**, the third suggestion. The pair recommends Hikvision 4MP IP Camera (`DS-2CD2142FWD-I`) first, followed by Honeywell NVR (`HEN08104`), Hanwha camera (`QND-6010R`), and Hikvision NVR (`DS-7608NI-I2/8P`).
3. Choose **Hikvision 4MP IP Camera (`DS-2CD2142FWD-I`)**. The three-item basket recommends **Hanwha QND-6010R Network Camera (`QND-6010R`)**.
4. Stop with three selected products and point to the Hanwha recommendation; do not add it.
5. Alternative full-basket demonstration: from Bosch + Honeywell keypad, manually add Axis `0806-001`; suggestions disappear. Remove Axis to restore them.

| Rule in the selected path | Joint count / antecedent count | Support | Confidence | Lift |
|---|---|---:|---:|---:|
| Bosch → Honeywell keypad | 10/92 | 1.0% | 10.87% | 1.235 |
| Bosch + Honeywell keypad → Hikvision camera | 3/10 | 0.3% | 30.00% | 2.970 |
| Bosch + Honeywell keypad + Hikvision camera → Hanwha camera | 2/3 | 0.2% | 66.67% | 7.168 |

The last rule illustrates why confidence needs its denominator: 66.67% means two of three observations, not a strong estimate of future behavior. The path uses authentic CSV associations and selects only items currently offered among the top five. It is a proposed walkthrough evaluated in the model process, not a claim that these outputs are live today.

## Rejected larger-basket alternative — retained research

The 0.1% option supports this highest-ranked path: Bosch B5512 → Hikvision NVR `DS-7608NI-I2/8P` → Axis camera `0935-001` → Bosch camera `NDN-832V03-IP` → GE detector `60-652-95R`. The last two recommendation steps each have only one supporting transaction; the final step is confidence 1/1 = 100%. Selecting the fifth item ends recommendations.

Isaac has removed larger baskets from the demo objective. This alternative is retained only to explain why we chose not to pursue that coverage. It is not a stronger recommendation model merely because more results appear. The proposed default remains the two-observation floor.

## Follow-through if approved later

Apply the same explicit settings locally and on Vercel, and restart/redeploy backend instances because mining occurs at startup. Reconcile model defaults/configuration documentation and regenerate the model report, calibration snapshot, and expected-combinations Notion page; the current 15-rule reference would otherwise become stale. Update real-data regression expectations and demo fixtures where behavior depends on thresholds, preserve explicit unsupported-basket tests, rerun CI/Playwright, and record the chosen path as a verified MP4. Keep full-basket semantics, source data, ranking, UI result limit and pagination unchanged.

None of those implementation steps has been performed. The analysis itself required no app restart, deployment, new dependency, or change to the live model.
