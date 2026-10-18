"""Public catalog response schemas shared with recommendations."""

from pydantic import BaseModel


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
