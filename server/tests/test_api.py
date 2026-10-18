from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from tandem.data import DataError

from app.main import create_app
from test_model import fixture_data
from test_data import write_csv


def test_catalog_search_and_pagination(tmp_path):
    path = write_csv(
        tmp_path, [["1", "Zeta (SKU: Z)", "alpha (SKU: A)", "Beta (SKU: B)", "", ""]]
    )
    with TestClient(create_app(csv_path=path)) as client:
        payload = client.get("/api/v1/items", params={"pageSize": 2}).json()
        assert payload == {
            "items": [
                {"id": "A", "name": "alpha", "sku": "A"},
                {"id": "B", "name": "Beta", "sku": "B"},
            ],
            "page": 1,
            "pageSize": 2,
            "total": 3,
            "totalPages": 2,
        }
        assert client.get("/api/v1/items", params={"q": " Z "}).json()["items"] == [
            {"id": "Z", "name": "Zeta", "sku": "Z"}
        ]
        assert (
            client.get("/api/v1/items", params={"q": "absent"}).json()["totalPages"]
            == 0
        )
        assert client.get("/api/v1/items", params={"page": 3}).json()["items"] == []


def test_recommendation_contract_and_whole_basket_restore(tmp_path):
    fixture_data(tmp_path)
    with TestClient(create_app(csv_path=tmp_path / "transactions.csv")) as client:
        response = client.post(
            "/api/v1/recommendations", json={"selectedItemIds": ["B", "A", "A"]}
        )
        assert response.status_code == 200
        result = response.json()
        assert result["selectedItemIds"] == ["A", "B"]
        assert result["reason"] is None
        assert result["recommendations"][0]["id"] == "C"
        assert result["recommendations"][0]["antecedentIds"] == ["A", "B"]
        assert result["recommendations"][0]["supportingTransactionCount"] == 2
        assert len(result["modelVersion"]) == 64
        unsupported = client.post(
            "/api/v1/recommendations", json={"selectedItemIds": ["A", "B", "D"]}
        ).json()
        assert unsupported["recommendations"] == []
        assert unsupported["reason"] == "no_qualifying_rules"
        assert (
            client.post(
                "/api/v1/recommendations", json={"selectedItemIds": ["A", "B"]}
            ).json()
            == result
        )
        assert (
            client.post("/api/v1/recommendations", json={"selectedItemIds": []}).json()[
                "reason"
            ]
            == "empty_basket"
        )


@pytest.fixture
def client(tmp_path):
    fixture_data(tmp_path)
    with TestClient(
        create_app(
            csv_path=tmp_path / "transactions.csv",
            allowed_origins=("http://localhost:3000",),
        )
    ) as client:
        yield client


@pytest.mark.parametrize(
    "params",
    [
        {"page": 0},
        {"page": -1},
        {"page": 1.5},
        {"page": "no"},
        {"pageSize": 0},
        {"pageSize": 101},
        {"pageSize": 1.5},
        {"q": "a" * 201},
    ],
)
def test_invalid_catalog_queries_return_validation_error(client, params):
    assert client.get("/api/v1/items", params=params).status_code == 422


@pytest.mark.parametrize(
    "body",
    [
        {},
        {"selectedItemIds": "A"},
        {"selectedItemIds": [1]},
        {"selectedItemIds": [None]},
        {"selectedItemIds": ["UNKNOWN"]},
        {"selectedItemIds": ["A"] * 101},
        {"selectedItemIds": [], "limit": 0},
        {"selectedItemIds": [], "limit": 11},
        {"selectedItemIds": [], "limit": 1.5},
        {"selectedItemIds": [], "limit": True},
        {"selectedItemIds": [], "limit": "1"},
        {"selectedItemIds": [], "unexpected": True},
    ],
)
def test_invalid_recommendation_bodies_are_rejected(client, body):
    assert client.post("/api/v1/recommendations", json=body).status_code == 422


def test_malformed_json_and_method(client):
    assert (
        client.post(
            "/api/v1/recommendations",
            content="{",
            headers={"Content-Type": "application/json"},
        ).status_code
        == 422
    )
    assert client.get("/api/v1/recommendations").status_code == 405


def test_cors_preflight_only_allows_configured_origins(client):
    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    }
    allowed = client.options("/api/v1/recommendations", headers=headers)
    assert allowed.status_code == 200
    assert allowed.headers["access-control-allow-origin"] == "http://localhost:3000"
    denied = client.options(
        "/api/v1/recommendations",
        headers={**headers, "Origin": "https://untrusted.example"},
    )
    assert denied.status_code == 400
    assert "access-control-allow-origin" not in denied.headers
    with pytest.raises(ValueError, match="explicit"):
        create_app(allowed_origins=("*",))


def test_health_and_unready_are_distinct():
    client = TestClient(create_app())  # No context manager: lifespan has not begun.
    assert client.get("/health").json() == {"status": "ok"}
    assert client.get("/ready").status_code == 503
    assert client.get("/api/v1/items").status_code == 503
    assert (
        client.post("/api/v1/recommendations", json={"selectedItemIds": []}).status_code
        == 503
    )


def test_initialized_source_is_not_reread_per_request(tmp_path):
    fixture_data(tmp_path)
    path = tmp_path / "transactions.csv"
    with TestClient(create_app(csv_path=path)) as client:
        ready = client.get("/ready").json()
        assert ready["status"] == "ready"
        assert ready["ruleCount"] > 0
        path.unlink()
        for _ in range(3):
            assert client.get("/api/v1/items").json()["total"] == 4
            assert (
                client.post(
                    "/api/v1/recommendations", json={"selectedItemIds": ["A", "B"]}
                ).json()["modelVersion"]
                == ready["modelVersion"]
            )
    assert client.get("/ready").status_code == 503


def test_zero_rules_is_ready_and_bad_source_fails_startup(tmp_path):
    path = write_csv(tmp_path, [["1", "A (SKU: A)", "", "", "", ""]])
    with TestClient(create_app(csv_path=path)) as client:
        assert client.get("/ready").json()["ruleCount"] == 0
        assert (
            client.post(
                "/api/v1/recommendations", json={"selectedItemIds": ["A"]}
            ).json()["reason"]
            == "no_qualifying_rules"
        )
    with pytest.raises(DataError, match="cannot read CSV"):
        with TestClient(create_app(csv_path=tmp_path / "missing.csv")):
            pass


def test_real_csv_catalog_and_recommendation_contract():
    root = Path(__file__).resolve().parents[2]
    directory = root / ("references" if (root / "references").exists() else "reference")
    with TestClient(
        create_app(
            csv_path=directory / "CMPE256_Hackathon_market_basket_analysis_Release.csv"
        )
    ) as client:
        pages = [
            client.get("/api/v1/items", params={"page": page}).json() for page in (1, 2)
        ]
        ids = [item["id"] for page in pages for item in page["items"]]
        assert len(ids) == len(set(ids)) == 40
        assert pages[0]["total"] == 40
        pair = ["60-652-95R", "DH-IPC-HDBW4431R-ZS"]
        result = client.post(
            "/api/v1/recommendations", json={"selectedItemIds": pair}
        ).json()
        assert [item["id"] for item in result["recommendations"]] == ["DS-2CD2142FWD-I"]
        assert result["recommendations"][0]["supportingTransactionCount"] == 5
        assert (
            client.post(
                "/api/v1/recommendations", json={"selectedItemIds": pair + ["0806-001"]}
            ).json()["recommendations"]
            == []
        )
        assert (
            client.post(
                "/api/v1/recommendations", json={"selectedItemIds": ids}
            ).json()["reason"]
            == "no_qualifying_rules"
        )
        assert (
            client.post(
                "/api/v1/recommendations",
                json={"selectedItemIds": [pair[0]] * 100, "limit": 10},
            ).status_code
            == 200
        )
        assert (
            client.get("/api/v1/items", params={"pageSize": 100, "q": "  "}).json()[
                "total"
            ]
            == 40
        )
        assert (
            client.get("/api/v1/items", params={"q": "dH-iPc-hDbW4431r-zs"}).json()[
                "items"
            ][0]["id"]
            == pair[1]
        )
