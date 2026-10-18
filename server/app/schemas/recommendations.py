"""Recommendation request validation and response evidence."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, StrictInt, StrictStr

from app.schemas.catalog import Item


class RecommendationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    selectedItemIds: list[StrictStr] = Field(max_length=100)
    limit: StrictInt = Field(default=5, ge=1, le=10)


class RecommendationItem(Item):
    antecedentIds: list[str]
    supportingTransactionCount: int
    support: float
    confidence: float
    lift: float


class RecommendationResponse(BaseModel):
    selectedItemIds: list[str]
    recommendations: list[RecommendationItem]
    reason: Literal["empty_basket", "no_qualifying_rules"] | None
    modelVersion: str
