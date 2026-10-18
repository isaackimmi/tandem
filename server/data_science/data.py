"""Read the authoritative CSV without depending on HTTP or the mining library."""

import csv
import hashlib
import io
import re
from collections import Counter
from pathlib import Path

from data_science.data_types import DataError, Dataset, Product

DEFAULT_CSV = (
    Path(__file__).resolve().parents[2]
    / "references"
    / "CMPE256_Hackathon_market_basket_analysis_Release.csv"
)
COLUMNS = ("transaction_id", "item_1", "item_2", "item_3", "item_4", "item_5")
LABEL = re.compile(r"(.+?)\s+\(SKU:\s*([^()\s]+)\)")


def load_data(path: Path = DEFAULT_CSV) -> Dataset:
    path = Path(path)
    try:
        raw = path.read_bytes()
        reader = csv.DictReader(io.StringIO(raw.decode("utf-8-sig")), strict=True)
        if (
            reader.fieldnames is None
            or len(set(reader.fieldnames)) != len(reader.fieldnames)
            or set(reader.fieldnames) != set(COLUMNS)
        ):
            raise DataError(f'{path}: expected columns {", ".join(COLUMNS)}')
        products: dict[str, Product] = {}
        transaction_ids: set[str] = set()
        transactions = []
        duplicates = 0
        for row in reader:
            context = f"{path}: row {reader.line_num}"
            if None in row or any(value is None for value in row.values()):
                raise DataError(f"{context}: incorrect column count")
            transaction_id = row["transaction_id"].strip()
            if not transaction_id or transaction_id in transaction_ids:
                raise DataError(f"{context}: blank or duplicate transaction_id")
            transaction_ids.add(transaction_id)
            basket: set[str] = set()
            for column in COLUMNS[1:]:
                label = row[column].strip()
                if not label:
                    continue
                match = LABEL.fullmatch(label)
                if match is None:
                    raise DataError(
                        f"{context}, {column}: expected name (SKU: identifier)"
                    )
                name, sku = match.group(1).strip(), match.group(2)
                if not name:
                    raise DataError(f"{context}, {column}: product name is blank")
                if sku in products and products[sku].name != name:
                    raise DataError(
                        f"{context}, {column}: conflicting name for SKU {sku}"
                    )
                products[sku] = Product(sku, name, sku)
                duplicates += sku in basket
                basket.add(sku)
            if not basket:
                raise DataError(f"{context}: empty basket")
            transactions.append(frozenset(basket))
        if not transactions:
            raise DataError(f"{path}: no transactions")
    except (OSError, UnicodeError, csv.Error) as error:
        raise DataError(f"{path}: cannot read CSV: {error}") from error
    return Dataset(
        tuple(sorted(products.values(), key=lambda p: (p.name.casefold(), p.sku))),
        tuple(transactions),
        hashlib.sha256(raw).hexdigest(),
        duplicates,
        tuple(sorted(Counter(map(len, transactions)).items())),
    )
