import pytest

from data_science.data import load_data
from data_science.model import mine_model
from data_science.model_types import ModelConfig
from test_data import write_csv


def fixture_data(tmp_path):
    baskets = ["ABC", "ABC", "AB", "D", "D", "D"]
    return load_data(
        write_csv(
            tmp_path,
            [
                [
                    str(i),
                    *[f"Item {sku} (SKU: {sku})" for sku in basket],
                    *[""] * (5 - len(basket)),
                ]
                for i, basket in enumerate(baskets)
            ],
        )
    )


def test_full_basket_has_hand_computed_evidence_and_no_subset_fallback(tmp_path):
    model = mine_model(fixture_data(tmp_path), ModelConfig(0.3, 0.5, 1))
    result = model.recommend(["B", "A", "A"])
    assert len(result) == 1
    assert result[0].product.id == "C"
    assert result[0].antecedent_ids == ("A", "B")
    assert result[0].supporting_transaction_count == 2
    assert result[0].support == pytest.approx(1 / 3)
    assert result[0].confidence == pytest.approx(2 / 3)
    assert result[0].lift == pytest.approx(2)
    assert model.recommend(["A", "B", "D"]) == ()
    assert model.recommend(["A", "B"]) == result
    assert model.recommend([]) == ()


def test_strict_lift_and_empty_models(tmp_path):
    data = load_data(
        write_csv(
            tmp_path,
            [
                ["1", "A (SKU: A)", "B (SKU: B)", "", "", ""],
                ["2", "A (SKU: A)", "B (SKU: B)", "", "", ""],
            ],
        )
    )
    assert mine_model(data).recommend(["A"]) == ()
    assert mine_model(fixture_data(tmp_path), ModelConfig(1, 1, 1)).rule_count == 0


def test_ranking_is_stable_and_limit_applies(tmp_path):
    model = mine_model(fixture_data(tmp_path), ModelConfig(0.3, 0.5, 1))
    assert [r.product.id for r in model.recommend(["C"])] == ["A", "B"]
    assert [r.product.id for r in model.recommend(["C"], 1)] == ["A"]
    assert model.recommend(["A", "B", "C", "D", "E"]) == ()
    assert (
        model.version
        == mine_model(fixture_data(tmp_path), ModelConfig(0.3, 0.5, 1)).version
    )
    assert (
        model.version
        != mine_model(fixture_data(tmp_path), ModelConfig(0.4, 0.5, 1)).version
    )
    with pytest.raises(ValueError, match="limit"):
        model.recommend(["A"], 0)


@pytest.mark.parametrize(
    "args",
    [
        (0, 0.15, 1),
        (1.1, 0.15, 1),
        (0.01, -0.1, 1),
        (0.01, 1.1, 1),
        (0.01, 0.15, float("nan")),
    ],
)
def test_invalid_thresholds_fail_clearly(args):
    with pytest.raises(ValueError):
        ModelConfig(*args)
