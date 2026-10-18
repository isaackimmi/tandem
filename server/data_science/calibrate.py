"""Reproduce descriptive calibration; this is not a held-out accuracy estimate."""

import argparse
import json
import platform
from dataclasses import asdict
from importlib.metadata import version
from itertools import combinations
from pathlib import Path
from statistics import quantiles
from time import perf_counter

from data_science.data import DEFAULT_CSV, load_data
from data_science.model import mine_model
from data_science.model_types import ModelConfig


def calibration_report(path: Path) -> dict:
    data = load_data(path)
    # Probe every distinct observed sub-basket, including complete transactions.
    probes = {
        frozenset(subset)
        for basket in data.transactions
        for size in range(1, len(basket) + 1)
        for subset in combinations(sorted(basket), size)
    }
    experiments = []
    for config in (
        ModelConfig(0.01, 0.15, 1),
        ModelConfig(0.005, 0.15, 1),
        ModelConfig(0.005, 0.10, 1),
        ModelConfig(0.002, 0.15, 1),
        ModelConfig(0.002, 0.10, 1),
        ModelConfig(0.001, 0.10, 1),
    ):
        model = mine_model(data, config)
        coverage = {}
        for size in range(1, 6):
            group = [basket for basket in probes if len(basket) == size]
            coverage[str(size)] = {
                "supported": sum(bool(model.recommend(tuple(b))) for b in group),
                "probed": len(group),
            }
        counts = [
            r.supporting_transaction_count
            for rules in model.rules.values()
            for r in rules
        ]
        displayed_counts = [
            r.supporting_transaction_count
            for basket in model.rules
            for r in model.recommend(tuple(basket))
        ]
        experiments.append(
            {
                "config": asdict(config),
                "itemsets": model.itemset_count,
                "rules": model.rule_count,
                "minimumSupportingCount": min(counts, default=0),
                "oneTransactionRules": counts.count(1),
                "displayedRecommendations": len(displayed_counts),
                "oneTransactionDisplayedRecommendations": displayed_counts.count(1),
                "coverage": coverage,
                "miningSeconds": model.mining_seconds,
            }
        )
    selected = mine_model(data)
    pairs = sorted((tuple(sorted(key)) for key in selected.rules if len(key) == 2))
    supported = pairs[0] if pairs else tuple(sorted(next(iter(selected.rules), ())))
    unsupported = next(
        (
            (*supported, p.id)
            for p in data.products
            if p.id not in supported and not selected.recommend([*supported, p.id])
        ),
        (),
    )
    latencies = []
    for _ in range(1000):
        start = perf_counter()
        selected.recommend(supported)
        latencies.append((perf_counter() - start) * 1000)
    return {
        "source": {
            "sha256": data.fingerprint,
            "transactions": len(data.transactions),
            "products": len(data.products),
            "basketSizes": dict(data.basket_sizes),
            "duplicateItemsRemoved": data.duplicate_items,
        },
        "environment": {
            "python": platform.python_version(),
            "platform": platform.platform(),
            "packages": {
                p: version(p) for p in ["mlxtend", "pandas", "numpy", "fastapi"]
            },
        },
        "probeDefinition": "Every distinct nonempty subset of an observed transaction, grouped by size; coverage is descriptive, not predictive accuracy.",
        "experiments": experiments,
        "selectedConfig": asdict(selected.config),
        "modelVersion": selected.version,
        "supportedBasket": supported,
        "unsupportedExtension": unsupported,
        "recommendations": [asdict(r) for r in selected.recommend(supported)],
        "warmLookupP95Ms": quantiles(latencies, n=100)[94],
        "warmLookupMeasurements": 1000,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--csv", type=Path, default=DEFAULT_CSV)
    print(json.dumps(calibration_report(parser.parse_args().csv), indent=2))
