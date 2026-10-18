"""Vercel entrypoint keeps the API and canonical CSV in one repository-root bundle."""

import sys
from pathlib import Path

# The local runner uses server/ as its working directory. Vercel uses the repo
# root so references/ is bundled; expose the same modules without copying data.
sys.path.insert(0, str(Path(__file__).resolve().parent / "server"))

from app.main import app  # noqa: E402,F401
