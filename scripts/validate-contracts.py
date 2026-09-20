#!/usr/bin/env python3
import json
import subprocess
import sys
from pathlib import Path
from urllib.parse import urldefrag, urljoin

try:
    from jsonschema import Draft202012Validator
    from referencing import Registry, Resource
except ImportError:
    raise SystemExit("Missing jsonschema. Install: python -m pip install -r requirements-agent.txt")

ROOT = Path(__file__).resolve().parents[1]


def iter_refs(value):
    if isinstance(value, dict):
        ref = value.get("$ref")
        if isinstance(ref, str):
            yield ref
        for nested in value.values():
            yield from iter_refs(nested)
    elif isinstance(value, list):
        for nested in value:
            yield from iter_refs(nested)


def validate_event_schemas():
    event_dir = ROOT / "contracts" / "events"
    paths = sorted(event_dir.glob("*.schema.json"))
    if not paths:
        raise SystemExit("[FAIL] no contracts/events/*.schema.json files")

    documents = {}
    for path in paths:
        try:
            schema = json.loads(path.read_text(encoding="utf-8"))
            Draft202012Validator.check_schema(schema)
        except (OSError, json.JSONDecodeError, Exception) as exc:
            raise SystemExit(f"[FAIL] {path.relative_to(ROOT)}: {exc}") from exc
        schema_id = schema.get("$id")
        if not isinstance(schema_id, str) or not schema_id:
            raise SystemExit(f"[FAIL] {path.relative_to(ROOT)}: missing non-empty $id")
        if schema_id in documents:
            raise SystemExit(f"[FAIL] duplicate event schema $id: {schema_id}")
        documents[schema_id] = (path, schema)

    registry = Registry().with_resources(
        (schema_id, Resource.from_contents(schema))
        for schema_id, (_path, schema) in documents.items()
    )
    ids = set(documents)
    for schema_id, (path, schema) in documents.items():
        for ref in iter_refs(schema):
            if ref.startswith("#"):
                try:
                    registry.resolver(schema_id).lookup(ref)
                except Exception as exc:
                    raise SystemExit(
                        f"[FAIL] {path.relative_to(ROOT)}: unresolved event schema reference {ref!r}: {exc}"
                    ) from exc
                continue
            resolved, _fragment = urldefrag(urljoin(schema_id, ref))
            if resolved not in ids:
                raise SystemExit(
                    f"[FAIL] {path.relative_to(ROOT)}: unresolved event schema reference {ref!r}"
                )
            try:
                registry.resolver(schema_id).lookup(ref)
            except Exception as exc:
                raise SystemExit(
                    f"[FAIL] {path.relative_to(ROOT)}: unresolved event schema reference {ref!r}: {exc}"
                ) from exc
        print(f"[OK] {path.relative_to(ROOT)}")


def main():
    path = ROOT / "contracts" / "openapi.yaml"
    if not path.exists():
        raise SystemExit("[FAIL] missing contracts/openapi.yaml")

    # Use the package's documented CLI entry point instead of an internal Python
    # shortcut API. This keeps validation behavior aligned with the installed
    # openapi-spec-validator release and preserves file-based reference context.
    proc = subprocess.run(
        [sys.executable, "-m", "openapi_spec_validator", str(path)],
        cwd=ROOT,
        text=True,
    )
    if proc.returncode != 0:
        raise SystemExit("[FAIL] contracts/openapi.yaml")
    print("[OK] contracts/openapi.yaml")
    validate_event_schemas()


if __name__ == "__main__":
    main()
