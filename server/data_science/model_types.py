"""Configuration and immutable recommendation types shared by API and analysis."""

import math
from dataclasses import dataclass
from typing import Mapping

from data_science.data_types import Product


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
