"""Exercise the deployable entrypoint outside the original working directory."""

import shutil
import subprocess
import sys
from pathlib import Path


def test_repository_root_bundle_is_self_contained_and_reuses_model(tmp_path):
    root = Path(__file__).resolve().parents[2]
    shutil.copy(root / "vercel_backend.py", tmp_path)
    shutil.copytree(root / "server/app", tmp_path / "server/app")
    shutil.copytree(root / "server/data_science", tmp_path / "server/data_science")
    shutil.copytree(root / "references", tmp_path / "references")
    result = subprocess.run(
        [sys.executable, "-c", '''
from unittest.mock import patch
from fastapi.testclient import TestClient
from vercel_backend import app
import app.main as main
with patch.object(main, "mine_model", wraps=main.mine_model) as mine:
    with TestClient(app) as client:
        ready = client.get("/ready").json()
        assert ready["productCount"] == 40
        assert ready["ruleCount"] == 2188
        assert client.get("/api/v1/items").json()["total"] == 40
        body = {"selectedItemIds": ["60-652-95R", "DH-IPC-HDBW4431R-ZS"]}
        first = client.post("/api/v1/recommendations", json=body).json()
        second = client.post("/api/v1/recommendations", json=body).json()
        assert first == second
        assert first["recommendations"][0]["id"] == "DS-2CD2142FWD-I"
        assert mine.call_count == 1
'''],
        cwd=tmp_path,
        capture_output=True,
        text=True,
        timeout=30,
    )
    assert result.returncode == 0, result.stdout + result.stderr
