"""Mine with mlxtend once; answer requests with immutable full-basket lookups."""

import hashlib
import json
from dataclasses import asdict
from time import perf_counter
from types import MappingProxyType

import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

from data_science.data_types import Dataset
from data_science.model_types import ModelConfig, Recommendation, RecommendationModel


def mine_model(
    data: Dataset, config: ModelConfig = ModelConfig()
) -> RecommendationModel:
    started = perf_counter()
    encoder = TransactionEncoder()
    table = pd.DataFrame(
        encoder.fit_transform(data.transactions), columns=encoder.columns_
    )
    itemsets = apriori(
        table,
        min_support=config.support,
        use_colnames=True,
        max_len=max(map(len, data.transactions)),
    )
    products = {product.id: product for product in data.products}
    index: dict[frozenset[str], list[Recommendation]] = {}
    if not itemsets.empty and any(len(items) > 1 for items in itemsets["itemsets"]):
        rules = association_rules(
            itemsets,
            num_itemsets=len(data.transactions),
            metric="confidence",
            min_threshold=config.confidence,
            return_metrics=["support", "confidence", "lift"],
        )
        for _, rule in rules.iterrows():
            antecedent, consequent = rule["antecedents"], rule["consequents"]
            if len(consequent) != 1 or rule["lift"] <= config.lift:
                continue
            sku = next(iter(consequent))
            # mlxtend support is count/N; recover the exact integer before displaying.
            count = round(rule["support"] * len(data.transactions))
            recommendation = Recommendation(
                products[sku],
                tuple(sorted(antecedent)),
                count,
                float(rule["support"]),
                float(rule["confidence"]),
                float(rule["lift"]),
            )
            index.setdefault(antecedent, []).append(recommendation)
    frozen = MappingProxyType(
        {
            key: tuple(
                sorted(
                    values,
                    key=lambda r: (-r.confidence, -r.lift, -r.support, r.product.sku),
                )
            )
            for key, values in index.items()
        }
    )
    identity = json.dumps(
        {"csv": data.fingerprint, "config": asdict(config), "policy": "full-basket-v1"},
        sort_keys=True,
    )
    version = hashlib.sha256(identity.encode()).hexdigest()
    return RecommendationModel(
        frozen,
        version,
        config,
        len(itemsets),
        sum(map(len, frozen.values())),
        perf_counter() - started,
    )
