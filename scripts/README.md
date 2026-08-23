# Agent control scripts

`agentctl.py` is the public interface. Other scripts are implementation details.

```bash
python scripts/agentctl.py --help
python scripts/agentctl.py bootstrap
python scripts/agentctl.py project validate
python scripts/agentctl.py task create CORE-001 "Primary user journey"
python scripts/agentctl.py git prepare CORE-001
python scripts/agentctl.py task advance CORE-001
python scripts/agentctl.py task validate CORE-001
python scripts/agentctl.py worktree create CORE-001 backend
python scripts/agentctl.py worktree create CORE-001 frontend
python scripts/agentctl.py worktree sync CORE-001 frontend
python scripts/agentctl.py frontend design-digest CORE-001 --ref agent/CORE-001-frontend
python scripts/agentctl.py frontend design-gate CORE-001
python scripts/agentctl.py scope check CORE-001 backend
python scripts/agentctl.py verify CORE-001
```

Lifecycle:

```text
PROPOSED → PLANNING → BUILD_READY → IMPLEMENTATION → INTEGRATION → REVIEW → DONE
```

Architecture controls whether contracts, independent testing, and dedicated security review are required. Normal progression uses `task advance`; `task status --force` is recovery only.
