"""Process health and initialized-model readiness."""

from fastapi import APIRouter, HTTPException, Request

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/ready")
def ready(request: Request):
    if request.app.state.model is None or request.app.state.data is None:
        raise HTTPException(503, "Model is not ready")
    return {
        "status": "ready",
        "modelVersion": request.app.state.model.version,
        "productCount": len(request.app.state.data.products),
        "ruleCount": request.app.state.model.rule_count,
        "startupSeconds": request.app.state.startup_seconds,
    }
