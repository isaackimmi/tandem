> Historical research snapshot, retained to explain the decision. The approved 0.2% support / 10% confidence configuration is now implemented; see [current calibration report](../server/MODEL_REPORT.md). References below to research-only or proposed settings describe the earlier research stage.

# Calibration methodology for a more useful Tandem demo

Research only, 2026-10-17. No model, application, deployment, or test configuration changed. The numerical sweep is a separate analysis; this note explains how to interpret it.

## What the current implementation measures

For selected basket A and candidate product C, support is count(A∪C)/N; confidence is count(A∪C)/count(A); lift is confidence divided by count(C)/N. These are the definitions in the [official mlxtend association-rules documentation](https://rasbt.github.io/mlxtend/user_guide/frequent_patterns/association_rules/). Lift above one indicates positive association relative to the candidate's overall frequency, not a statistical significance test or a hardware compatibility test.

[Apriori's official documentation](https://rasbt.github.io/mlxtend/user_guide/frequent_patterns/apriori/) defines minimum support on the mined itemsets. Therefore lowering the downstream confidence cutoff cannot recover an itemset already excluded during mining. Both thresholds must be considered when assessing basket coverage.

Local source: `server/data_science/model.py` uses support ≥ configuration value, confidence ≥ configuration value, and lift **strictly greater than** configuration value. It keeps only singleton consequents and performs exact full-basket lookup. Ranking is confidence, then lift, then support, then SKU; the default response limit is five. Changing the response limit changes the number displayed, not whether a basket has any eligible rule.

## Evidence ceilings imposed by this CSV

Independently counted every nonempty subset of every authoritative transaction, without modifying the data. Source SHA-256: `3d48b2480bee2ca3942f7add047233eb69461d210b996733c3eff3ee0bf5cbe6`. There are 1,000 transactions and 40 SKUs; transaction sizes are 237 pairs, 228 triples, 258 quadruples, and 277 quintuples. Counts match `server/calibration.json` and `server/MODEL_REPORT.md`.

| Co-purchased itemset size | Distinct observed sets | Maximum repeat count | Important frequency detail |
| --- | ---: | ---: | --- |
| 1 | 40 | 105 | Each individual product appears 75–105 times |
| 2 | 778 | 16 | Five pairs appear once |
| 3 | 3,333 | 5 | 2,722 once; 531 twice; 75 three times; 4 four times; 1 five times |
| 4 | 1,628 | 2 | 1,613 once; only 15 twice |
| 5 | 277 | 1 | Every five-item set appears exactly once |

These imply hard limits independent of confidence:

- With a support floor of three transactions or more (≥0.3%), no three-item selected basket can yield a recommendation: that requires a four-item union, whose maximum count is two.
- A two-transaction floor (0.2%) permits some triple-basket recommendations, but excludes every quadruple-basket recommendation.
- A one-transaction floor (0.1%) is necessary for any quadruple-basket recommendation. All such rules are supported by exactly one purchase, regardless of how high their confidence or lift looks.
- No five-item selected basket can yield a recommendation under exact full-basket matching. No six-item union exists. Lower thresholds cannot change this.
- No threshold can support an unobserved selected basket without changing the agreed matching policy or data.

## Why lower support can make confidence look deceptively strong

A basket seen once, with C included on that occasion, gives confidence 1/1 = 100%. A basket seen twice, both times with C, also gives 100%. These point estimates do not contain a minimum sample-size guarantee. Because Tandem sorts confidence first, low-count rules can rise to the top; raising confidence is not a substitute for retaining a minimum observation count.

For intuition, a 95% Wilson interval for 1/1 is approximately 20.7%–100%, compared with 34.2%–100% for 2/2. These are illustrative binomial calculations, not validated uncertainty intervals for rules selected after searching thousands of candidates. The [NIST proportion-interval guidance](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm) explains Wilson intervals and why small samples need care. Mining many candidate rules and selecting the largest observed scores adds selection effects; no significance or future-purchase guarantee should be inferred from the displayed association metrics.

## How to judge whether a configuration is demo-able

Use several explicit descriptive measures, not just total rules:

1. **Catalog coverage:** how many of the 40 singleton baskets yield recommendations. This directly captures the user's first-click experience.
2. **Coverage by basket size:** qualifying baskets divided by all possible catalog combinations, alongside the denominator of observed subsets. For pairs those denominators are 780 and 778; for triples, 9,880 and 3,333. Never call either denominator prediction accuracy.
3. **Evidence distribution:** number and percentage of rules supported by one, two, three, four, and five-or-more transactions. Inspect the evidence of the top five returned items, not only all eligible rules.
4. **Journey continuity:** count and exhibit genuine paths A → A+B → A+B+C, selecting recommendations at each step, and identify where recommendations stop. Include adding an unsupported item, then removing it to restore results.
5. **Representative first selections:** Bosch and several other products should work without requiring the presenter to memorize the one successful pair. Also retain honest empty states.

These measure how an exploration of this fixed file behaves. They do not show whether future customers will purchase the recommendations, whether recommendations increase sales, or whether hardware is compatible. Do not infer that the CSV is randomly generated solely from sparse associations; provenance has not established that claim.

If predictive evaluation is later brought back into scope, split transactions **before mining**, hide items only within held-out transactions, mine only training transactions, and compare top-k hit/recall and coverage against a popularity baseline. Keep threshold selection separate from the final test set. The general leakage rule follows [scikit-learn's official common-pitfalls guidance](https://scikit-learn.org/stable/common_pitfalls.html#data-leakage): evaluation data must not influence fitting. This is a proposed evaluation design, not an evaluation performed here; held-out evaluation remains outside the approved implementation scope.

## Decision lens

Prefer the simplest fixed configuration that materially improves first selections and supports a believable multi-step demonstration without relying on one-off purchases. A confidence floor of 10% merits comparison with 15%; a support floor of 0.2% merits comparison with 0.3% and 0.5%. Retain lift >1 and exact full-basket matching during comparison. A 0.1% profile can illustrate the maximum descriptive coverage, but should be clearly identified as accepting single-observation evidence, not presented as a stronger model.

The final choice should come from the measured sweep and demonstrated paths. Do not promise arbitrary four- or five-item baskets will have recommendations: the authoritative data cannot support that promise under the agreed rules.
