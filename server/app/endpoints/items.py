"""Search and paginate the startup-validated catalog."""

from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, Request

from app.schemas.catalog import CatalogResponse

router = APIRouter()


@router.get("/api/v1/items", response_model=CatalogResponse)
def items(
    request: Request,
    q: Annotated[str, Query(max_length=200)] = "",
    page: Annotated[int, Query(ge=1)] = 1,
    pageSize: Annotated[int, Query(ge=1, le=100)] = 20,
):
    if request.app.state.data is None:
        raise HTTPException(503, "Catalog is not ready")
    query = q.strip().casefold()
    products = [
        p
        for p in request.app.state.data.products
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
