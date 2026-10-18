"""Validate a complete basket and return its qualifying association rules."""

from fastapi import APIRouter, HTTPException, Request

from app.schemas.recommendations import RecommendationRequest, RecommendationResponse

router = APIRouter()


@router.post("/api/v1/recommendations", response_model=RecommendationResponse)
def recommendations(body: RecommendationRequest, request: Request):
    model, data = request.app.state.model, request.app.state.data
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
