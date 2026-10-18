"""Mine with mlxtend once; answer requests with immutable full-basket lookups."""

import hashlib
import json
import math
from dataclasses import asdict, dataclass
from time import perf_counter
from types import MappingProxyType
from typing import Mapping

import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

from tandem.data import Dataset, Product


@dataclass(frozen=True)
class ModelConfig:
    support: float = 0.005
    confidence: float = 0.15
    lift: float = 1.0

    def __post_init__(self):
        if not (
            0 < self.support <= 1
            and 0 <= self.confidence <= 1
            and math.isfinite(self.lift)
            and self.lift >= 0
        ):
            raise ValueError(
                "Support must be in (0, 1], confidence in [0, 1], and lift finite and nonnegative"
            )


@dataclass(frozen=True)
class Recommendation:
    product: Product
    antecedent_ids: tuple[str, ...]
    supporting_transaction_count: int
    support: float
    confidence: float
    lift: float


@dataclass(frozen=True)
class RecommendationModel:
    rules: Mapping[frozenset[str], tuple[Recommendation, ...]]
    version: str
    config: ModelConfig
    itemset_count: int
    rule_count: int
    mining_seconds: float

    def recommend(
        self, selected_ids: list[str] | tuple[str, ...], limit: int = 5
    ) -> tuple[Recommendation, ...]:
        if not 1 <= limit <= 10:
            raise ValueError("limit must be between 1 and 10")
        return self.rules.get(frozenset(selected_ids), ())[:limit]


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
