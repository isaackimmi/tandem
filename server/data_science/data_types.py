"""Shared catalog and transaction types, independent of HTTP and mining."""

from dataclasses import dataclass


class DataError(ValueError):
    """The source cannot supply an unambiguous catalog and transaction set."""


@dataclass(frozen=True)
class Product:
    id: str
    name: str
    sku: str


@dataclass(frozen=True)
class Dataset:
    products: tuple[Product, ...]
    transactions: tuple[frozenset[str], ...]
    fingerprint: str
    duplicate_items: int
    basket_sizes: tuple[tuple[int, int], ...]
