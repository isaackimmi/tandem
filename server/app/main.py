"""One startup lifecycle shares the validated catalog and mined model."""

import os
from contextlib import asynccontextmanager
from pathlib import Path
from time import perf_counter

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.endpoints import health, items, recommendations
from data_science.data import DEFAULT_CSV, load_data
from data_science.model import mine_model
from data_science.model_types import ModelConfig


def create_app(
    csv_path: Path | None = None, allowed_origins: tuple[str, ...] | None = None
) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        started = perf_counter()
        app.state.data = load_data(
            csv_path or Path(os.getenv("TANDEM_CSV_PATH", str(DEFAULT_CSV)))
        )
        defaults = ModelConfig()
        app.state.model = mine_model(
            app.state.data,
            ModelConfig(
                float(os.getenv("MIN_SUPPORT", str(defaults.support))),
                float(os.getenv("MIN_CONFIDENCE", str(defaults.confidence))),
                float(os.getenv("MIN_LIFT", str(defaults.lift))),
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

    app.include_router(items.router)
    app.include_router(recommendations.router)
    app.include_router(health.router)

    return app


app = create_app()
