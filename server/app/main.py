"""One startup lifecycle shares the validated catalog and mined model."""

import os
from contextlib import asynccontextmanager
from pathlib import Path
from time import perf_counter
from typing import Annotated, Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, StrictInt, StrictStr

from tandem.data import DEFAULT_CSV, load_data
from tandem.model import ModelConfig, mine_model


class Item(BaseModel):
    id: str
    name: str
    sku: str


class CatalogResponse(BaseModel):
    items: list[Item]
    page: int
    pageSize: int
    total: int
    totalPages: int


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


def create_app(
    csv_path: Path | None = None, allowed_origins: tuple[str, ...] | None = None
) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        started = perf_counter()
        app.state.data = load_data(
            csv_path or Path(os.getenv("TANDEM_CSV_PATH", str(DEFAULT_CSV)))
        )
        app.state.model = mine_model(
            app.state.data,
            ModelConfig(
                float(os.getenv("MIN_SUPPORT", ".005")),
                float(os.getenv("MIN_CONFIDENCE", ".15")),
                float(os.getenv("MIN_LIFT", "1")),
            ),
        )
        app.state.startup_seconds = perf_counter() - started
        try:
            yield
        finally:
            app.state.data = None
            app.state.model = None

    app = FastAPI(title="Tandem API", version="1.0.0", lifespan=lifespan)
    app.state.data = None
    app.state.model = None
    origins = (
        allowed_origins
        if allowed_origins is not None
        else tuple(
            value.strip()
            for value in os.getenv(
                "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
            ).split(",")
            if value.strip()
        )
    )
    if "*" in origins:
        raise ValueError("CORS_ORIGINS must list explicit frontend origins")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(origins),
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    @app.get("/api/v1/items", response_model=CatalogResponse)
    def items(
        q: Annotated[str, Query(max_length=200)] = "",
        page: Annotated[int, Query(ge=1)] = 1,
        pageSize: Annotated[int, Query(ge=1, le=100)] = 20,
    ):
        if app.state.data is None:
            raise HTTPException(503, "Catalog is not ready")
        query = q.strip().casefold()
        products = [
            p
            for p in app.state.data.products
            if query in p.name.casefold() or query in p.sku.casefold()
        ]
        total = len(products)
        return {
            "items": [
                vars(p) for p in products[(page - 1) * pageSize : page * pageSize]
            ],
            "page": page,
            "pageSize": pageSize,
            "total": total,
            "totalPages": (total + pageSize - 1) // pageSize,
        }

    @app.post("/api/v1/recommendations", response_model=RecommendationResponse)
    def recommendations(body: RecommendationRequest):
        model, data = app.state.model, app.state.data
        if model is None or data is None:
            raise HTTPException(503, "Recommendation model is not ready")
        selected = sorted(set(body.selectedItemIds))
        unknown = sorted(set(selected) - {p.id for p in data.products})
        if unknown:
            raise HTTPException(
                422,
                [
                    {
                        "loc": ["body", "selectedItemIds"],
                        "msg": "Unknown product IDs",
                        "type": "unknown_item_ids",
                        "input": unknown,
                    }
                ],
            )
        matches = model.recommend(selected, body.limit)
        return {
            "selectedItemIds": selected,
            "recommendations": [
                dict(
                    vars(r.product),
                    antecedentIds=r.antecedent_ids,
                    supportingTransactionCount=r.supporting_transaction_count,
                    support=r.support,
                    confidence=r.confidence,
                    lift=r.lift,
                )
                for r in matches
            ],
            "reason": (
                None
                if matches
                else ("empty_basket" if not selected else "no_qualifying_rules")
            ),
            "modelVersion": model.version,
        }

    @app.get("/health")
    def health():
        return {"status": "ok"}

    @app.get("/ready")
    def ready():
        if app.state.model is None or app.state.data is None:
            raise HTTPException(503, "Model is not ready")
        return {
            "status": "ready",
            "modelVersion": app.state.model.version,
            "productCount": len(app.state.data.products),
            "ruleCount": app.state.model.rule_count,
            "startupSeconds": app.state.startup_seconds,
        }

    return app


app = create_app()
