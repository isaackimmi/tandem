"""Vercel entrypoint keeps the API and canonical CSV in one repository-root bundle."""

import sys
from pathlib import Path

# The local runner uses server/ as its working directory. Vercel uses the repo
# root so references/ is bundled; expose the same modules without copying data.
sys.path.insert(0, str(Path(__file__).resolve().parent / "server"))

from app.main import app  # noqa: E402,F401

# Temporary isolated-preview fixture. This branch must never merge into main.
import asyncio
from fastapi import HTTPException

@app.get("/api/manual/{scenario}/api/v1/items")
async def manual_catalog(scenario: str, q: str = "", page: int = 1, pageSize: int = 20):
    if scenario == "fail":
        raise HTTPException(503, "Deliberate initial catalog failure for manual acceptance")
    if scenario != "hold":
        raise HTTPException(404)
    await asyncio.sleep(3)
    endpoint = next(route.endpoint for route in app.routes if getattr(route, "path", None) == "/api/v1/items")
    return endpoint(q=q, page=page, pageSize=pageSize)
