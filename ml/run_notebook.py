"""Tiny stdlib notebook executor for the offline ML demonstration."""
from __future__ import annotations

import contextlib
import io
import json
import sys
from pathlib import Path
from typing import Any


def execute_notebook(notebook_path: Path, pipeline_root: Path | None = None) -> dict[str, Any]:
    notebook_path = Path(notebook_path)
    root = Path(pipeline_root or notebook_path.parent)
    root.mkdir(parents=True, exist_ok=True)
    with notebook_path.open(encoding="utf-8") as handle:
        notebook = json.load(handle)
    repo_root = Path(__file__).resolve().parents[1]
    if str(repo_root) not in sys.path:
        sys.path.insert(0, str(repo_root))
    for cell in notebook.get("cells", []):
        if cell.get("cell_type") != "code":
            continue
        source = "".join(cell.get("source", []))
        output = io.StringIO()
        try:
            with contextlib.redirect_stdout(output):
                exec(compile(source, str(notebook_path), "exec"), {"PIPELINE_ROOT": root, "__name__": "__notebook__"})
        except Exception as exc:
            cell["outputs"] = [{"output_type": "error", "ename": type(exc).__name__, "evalue": str(exc), "traceback": []}]
            raise
        text = output.getvalue()
        cell["outputs"] = [{"output_type": "stream", "name": "stdout", "text": text}] if text else []
    notebook["metadata"]["executed_by"] = "ml.run_notebook"
    notebook["metadata"]["pipeline_root"] = str(root)
    notebook_path.write_text(json.dumps(notebook, indent=1) + "\n", encoding="utf-8")
    return notebook
