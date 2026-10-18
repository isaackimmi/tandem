import csv
from pathlib import Path

import pytest

from tandem.data import DataError, load_data


def write_csv(tmp_path, rows, header=None):
    path = tmp_path / 'transactions.csv'
    with path.open('w', newline='') as stream:
        writer = csv.writer(stream)
        writer.writerow(header or ['transaction_id', *[f'item_{i}' for i in range(1, 6)]])
        writer.writerows(rows)
    return path


def test_normalizes_products_but_preserves_separate_purchases(tmp_path):
    path = write_csv(tmp_path, [
        ['1', ' Alpha, Camera (SKU: A) ', 'Beta (SKU: B)', 'Alpha, Camera (SKU: A)', '', ''],
        ['2', 'Beta (SKU: B)', 'Alpha, Camera (SKU: A)', '', '', ''],
    ])
    data = load_data(path)
    assert [(p.id, p.name, p.sku) for p in data.products] == [('A', 'Alpha, Camera', 'A'), ('B', 'Beta', 'B')]
    assert data.transactions == (frozenset({'A', 'B'}), frozenset({'A', 'B'}))
    assert data.duplicate_items == 1
    assert dict(data.basket_sizes) == {2: 2}


@pytest.mark.parametrize('rows, message', [
    ([['', 'A (SKU: A)', '', '', '', '']], 'transaction_id'),
    ([['1', 'A (SKU: A)', '', '', '', ''], ['1', 'A (SKU: A)', '', '', '', '']], 'transaction_id'),
    ([['1', 'A (SKU: A)', '', '', '', ''], ['2', 'Different (SKU: A)', '', '', '', '']], 'conflicting name'),
    ([['1', 'invalid label', '', '', '', '']], 'item_1'),
    ([['1', '', '', '', '', '']], 'empty basket'),
    ([['1', 'A (SKU: A)']], 'column count'),
    ([], 'no transactions'),
])
def test_rejects_ambiguous_or_invalid_records(tmp_path, rows, message):
    with pytest.raises(DataError, match=message):
        load_data(write_csv(tmp_path, rows))


def test_missing_or_malformed_file_is_actionable(tmp_path):
    with pytest.raises(DataError, match='cannot read CSV'):
        load_data(tmp_path / 'missing.csv')
    with pytest.raises(DataError, match='expected columns'):
        load_data(write_csv(tmp_path, [], ['transaction_id', 'item_1']))
    invalid = tmp_path / 'invalid.csv'
    invalid.write_bytes(b'\xff\xff')
    with pytest.raises(DataError, match='cannot read CSV'):
        load_data(invalid)


def test_product_column_order_does_not_change_catalog_or_transactions(tmp_path):
    one = load_data(write_csv(tmp_path, [['1', 'Beta (SKU: B)', 'Alpha (SKU: A)', '', '', '']]))
    two = load_data(write_csv(tmp_path, [['1', 'Alpha (SKU: A)', 'Beta (SKU: B)', '', '', '']]))
    assert one.products == two.products
    assert one.transactions == two.transactions


def test_real_source_has_expected_provenance():
    root = Path(__file__).resolve().parents[2]
    # The temporary branch starts before the foundation's directory rename.
    directory = root / ('references' if (root / 'references').exists() else 'reference')
    data = load_data(directory / 'CMPE256_Hackathon_market_basket_analysis_Release.csv')
    assert len(data.products) == 40
    assert len(data.transactions) == 1000
    assert data.fingerprint == '3d48b2480bee2ca3942f7add047233eb69461d210b996733c3eff3ee0bf5cbe6'
