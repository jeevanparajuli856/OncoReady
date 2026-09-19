#!/usr/bin/env python3
import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
STATUSES = ["PROPOSED","PLANNING","BUILD_READY","IMPLEMENTATION","INTEGRATION","REVIEW","DONE","BLOCKED","CANCELLED"]

# Evidence files that may legitimately be created after a reviewed source commit.
# Anything else in the task workspace (architecture/implementation/test reports, task
# requirements, etc.) is source/evidence that must invalidate downstream review.
FOLLOWUP_EVIDENCE = {
    "verification-report.json": {"verification-report.json", "security-report.json", "review-report.json"},
    "security-report.json": {"security-report.json", "review-report.json"},
    "review-report.json": {"review-report.json"},
}


def run_script(name, args):
    return subprocess.call([sys.executable, str(SCRIPTS / name), *args], cwd=ROOT)


def task_path(task_id):
    return ROOT / ".ai" / "tasks" / task_id / "task.json"


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def load_task(task_id):
    path = task_path(task_id)
    if not path.exists():
        raise SystemExit(f"Task {task_id} does not exist.")
    return path, load_json(path)


def save_task(path, data):
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")


def head_commit():
    proc = subprocess.run(["git","rev-parse","HEAD"], cwd=ROOT, text=True, capture_output=True)
    if proc.returncode != 0:
        raise SystemExit("Git repository/commit required for this gate.")
    return proc.stdout.strip()


def git_json_at(commit, relpath):
    proc = subprocess.run(["git", "show", f"{commit}:{relpath}"], cwd=ROOT, text=True, capture_output=True)
    if proc.returncode != 0:
        return None
    try:
        return json.loads(proc.stdout)
    except json.JSONDecodeError:
        return None


def task_change_is_status_only(task_id, reviewed_commit):
    rel = f".ai/tasks/{task_id}/task.json"
    before = git_json_at(reviewed_commit, rel)
    path = ROOT / rel
    if before is None or not path.exists():
        return False
    try:
        after = load_json(path)
    except (OSError, json.JSONDecodeError):
        return False
    before = dict(before)
    after = dict(after)
    before.pop("status", None)
    after.pop("status", None)
    return before == after


def evidence_is_current(task_id, reviewed_commit, evidence_file):
    if not reviewed_commit:
        return False, "no reviewed commit recorded"
    head = head_commit()
    ancestor = subprocess.run(
        ["git", "merge-base", "--is-ancestor", reviewed_commit, head],
        cwd=ROOT, capture_output=True
    )
    if ancestor.returncode != 0:
        return False, f"{reviewed_commit} is not an ancestor of current HEAD {head}"

    changed = set()
    commands = [
        ["git", "diff", "--name-only", f"{reviewed_commit}..HEAD"],
        ["git", "diff", "--name-only"],
        ["git", "diff", "--cached", "--name-only"],
        ["git", "ls-files", "--others", "--exclude-standard"],
    ]
    for command in commands:
        proc = subprocess.run(command, cwd=ROOT, text=True, capture_output=True)
        if proc.returncode == 0:
            changed.update(x.strip().replace("\\", "/") for x in proc.stdout.splitlines() if x.strip())

    task_prefix = f".ai/tasks/{task_id}/"
    task_file = f"{task_prefix}task.json"
    allowed_reports = {f"{task_prefix}{name}" for name in FOLLOWUP_EVIDENCE.get(evidence_file, {evidence_file})}
    invalidating = []

    for path in sorted(changed):
        if path in allowed_reports:
            continue
        if path == task_file and task_change_is_status_only(task_id, reviewed_commit):
            continue
        invalidating.append(path)

    if invalidating:
        return False, "implementation/source-of-truth changed after review: " + ", ".join(invalidating)
    return True, ""


def require_report(task_id, filename, statuses, current_commit=False):
    path = ROOT / ".ai" / "tasks" / task_id / filename
    if not path.exists():
        raise SystemExit(f"Gate failed: missing {filename}")
    data = load_json(path)
    if data.get("task_id") != task_id:
        raise SystemExit(f"Gate failed: {filename} task_id={data.get('task_id')!r}; expected {task_id!r}")
    if data.get("status") not in statuses:
        raise SystemExit(f"Gate failed: {filename} status={data.get('status')!r}; expected {sorted(statuses)}")
    if data.get("blockers"):
        raise SystemExit(f"Gate failed: {filename} contains blockers.")
    blocking_findings = [f for f in data.get("findings", []) if f.get("blocking") is True]
    if blocking_findings:
        raise SystemExit(f"Gate failed: {filename} contains unresolved blocking findings.")
    if current_commit:
        reviewed = data.get("reviewed_commit") or data.get("commit")
        ok, reason = evidence_is_current(task_id, reviewed, filename)
        if not ok:
            raise SystemExit(f"Gate failed: {filename} is stale: {reason}")
    return data


def architecture(task_id):
    data = require_report(task_id, "architecture-report.json", {"COMPLETE"})
    impacts = data.get("impacts", {})
    for key in ["database", "backend", "frontend", "frontend_design_required", "infrastructure"]:
        if not isinstance(impacts.get(key), bool):
            raise SystemExit(f"Gate failed: architecture impact {key!r} must be true/false before completion.")
    if impacts["frontend_design_required"] and not impacts["frontend"]:
        raise SystemExit("Gate failed: frontend_design_required=true requires frontend=true.")

    execution = data.get("execution", {})
    if not isinstance(execution.get("contract_required"), bool):
        raise SystemExit("Gate failed: execution.contract_required must be true/false before completion.")
    if execution.get("test_depth") not in {"NONE", "SMOKE", "TARGETED", "FULL"}:
        raise SystemExit("Gate failed: execution.test_depth must be NONE, SMOKE, TARGETED, or FULL.")
    if execution.get("security_risk") not in {"LOW", "STANDARD", "HIGH"}:
        raise SystemExit("Gate failed: execution.security_risk must be LOW, STANDARD, or HIGH.")
    if not isinstance(execution.get("security_review_required"), bool):
        raise SystemExit("Gate failed: execution.security_review_required must be true/false before completion.")
    if execution["security_risk"] == "HIGH" and not execution["security_review_required"]:
        raise SystemExit("Gate failed: HIGH security risk requires security_review_required=true.")
    return data


def require_contracts_if_needed(task_id, arch):
    if not arch["execution"]["contract_required"]:
        return
    _, task = load_task(task_id)
    if not task.get("contracts"):
        raise SystemExit("Gate failed: execution.contract_required=true but task.contracts is empty.")
    validate_contracts()


def independent_test_required(arch):
    return arch["execution"]["test_depth"] in {"TARGETED", "FULL"}


def canonical_json_sha256(data):
    payload = json.dumps(data, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def frontend_design_digest(task_id, ref=None):
    rel = f".ai/tasks/{task_id}/frontend-design-report.json"
    if ref:
        proc = subprocess.run(["git", "show", f"{ref}:{rel}"], cwd=ROOT, text=True, capture_output=True)
        if proc.returncode != 0:
            detail = proc.stderr.strip() or proc.stdout.strip() or "design report not found"
            raise SystemExit(f"Cannot read frontend design report from {ref!r}: {detail}")
        try:
            data = json.loads(proc.stdout)
        except json.JSONDecodeError as exc:
            raise SystemExit(f"Frontend design report on {ref!r} is invalid JSON: {exc}")
    else:
        path = ROOT / rel
        if not path.exists():
            raise SystemExit(f"Missing {rel}")
        data = load_json(path)
    return canonical_json_sha256(data)


def validate_design_ready(data):
    if not isinstance(data.get("summary"), str) or not data["summary"].strip():
        raise SystemExit("Gate failed: DESIGN_READY frontend design report requires a non-empty summary.")
    if data.get("design_system_action") not in {"REUSE", "EXTEND", "ESTABLISH"}:
        raise SystemExit("Gate failed: DESIGN_READY frontend design report must declare REUSE, EXTEND, or ESTABLISH for design_system_action.")
    if not isinstance(data.get("existing_design_system"), str) or not data["existing_design_system"].strip():
        raise SystemExit("Gate failed: DESIGN_READY frontend design report must name the design-system source of truth.")
    for section in ("visual_direction", "motion", "responsive"):
        values = data.get(section)
        if not isinstance(values, dict) or not values:
            raise SystemExit(f"Gate failed: DESIGN_READY frontend design report requires {section} details.")
        empty = [key for key, value in values.items() if not isinstance(value, str) or not value.strip()]
        if empty:
            raise SystemExit(f"Gate failed: DESIGN_READY frontend design report has empty {section} fields: {', '.join(empty)}")
    accessibility = data.get("accessibility")
    if not isinstance(accessibility, list) or not any(isinstance(item, str) and item.strip() for item in accessibility):
        raise SystemExit("Gate failed: DESIGN_READY frontend design report must document accessibility/reduced-motion intent.")


def frontend_design_gate(task_id, validate_state=True):
    if validate_state:
        validate_task(task_id)
    _, task = load_task(task_id)
    if task.get("status") != "IMPLEMENTATION":
        raise SystemExit(f"Frontend design gate requires task status IMPLEMENTATION; found {task.get('status')!r}.")
    arch = architecture(task_id)
    impacts = arch["impacts"]
    if not impacts["frontend"]:
        raise SystemExit("Frontend design gate is not applicable because impacts.frontend=false.")
    if not impacts["frontend_design_required"]:
        print(f"{task_id}: frontend design gate not required; existing design system may be used.")
        return
    design = require_report(task_id, "frontend-design-report.json", {"DESIGN_READY"})
    validate_design_ready(design)
    review = require_report(task_id, "frontend-design-review.json", {"APPROVED"})
    reviewed_digest = review.get("reviewed_design_sha256", "")
    current_digest = canonical_json_sha256(design)
    if reviewed_digest != current_digest:
        raise SystemExit(
            "Gate failed: frontend design changed since orchestrator approval. "
            "Re-run compatibility review and record the current reviewed_design_sha256."
        )
    failed = [name for name, status in review.get("checks", {}).items() if status == "FAIL"]
    pending = [name for name, status in review.get("checks", {}).items() if status == "PENDING"]
    if failed or pending:
        raise SystemExit("Gate failed: frontend design review checks are not fully resolved.")
    if review.get("required_changes"):
        raise SystemExit("Gate failed: approved frontend design review still contains required_changes.")
    print(f"{task_id}: frontend design gate APPROVED; Codex frontend implementation may proceed.")


def validate_task(task_id):
    if run_script("validate-project.py", []) != 0:
        raise SystemExit("Project validation failed.")
    if run_script("validate-task.py", [task_id]) != 0:
        raise SystemExit("Task/report validation failed.")


def validate_contracts():
    if run_script("validate-contracts.py", []) != 0:
        raise SystemExit("Contract validation failed.")


def advance(args):
    path, task = load_task(args.task_id)
    current = task["status"]
    if current in {"DONE", "CANCELLED"}:
        raise SystemExit(f"Task is terminal: {current}")
    if current == "BLOCKED":
        raise SystemExit("Task is BLOCKED. Resolve the blocker, then use task status --force to restore the appropriate prior state.")

    # Every normal transition re-validates operational project/task/report structure.
    validate_task(args.task_id)

    target = None
    if current == "PROPOSED":
        target = "PLANNING"
    elif current == "PLANNING":
        arch = architecture(args.task_id)
        require_contracts_if_needed(args.task_id, arch)
        target = "BUILD_READY"
    elif current == "BUILD_READY":
        target = "IMPLEMENTATION"
    elif current == "IMPLEMENTATION":
        arch = architecture(args.task_id)
        impacts = arch["impacts"]
        if impacts["database"]:
            require_report(args.task_id, "database-report.json", {"COMPLETE"})
        if impacts["backend"]:
            require_report(args.task_id, "backend-report.json", {"COMPLETE"})
        if impacts["frontend"]:
            if impacts["frontend_design_required"]:
                frontend_design_gate(args.task_id, validate_state=False)
            require_report(args.task_id, "frontend-report.json", {"COMPLETE"})
        target = "INTEGRATION"
    elif current == "INTEGRATION":
        arch = architecture(args.task_id)
        if independent_test_required(arch):
            test = require_report(args.task_id, "test-report.json", {"COMPLETE"})
            if not test.get("tests", {}).get("passed"):
                raise SystemExit("Gate failed: independent test report did not pass.")
        require_report(args.task_id, "verification-report.json", {"PASSED"}, current_commit=True)
        if arch["execution"]["security_review_required"]:
            require_report(args.task_id, "security-report.json", {"APPROVED"}, current_commit=True)
        target = "REVIEW"
    elif current == "REVIEW":
        arch = architecture(args.task_id)
        require_report(args.task_id, "verification-report.json", {"PASSED"}, current_commit=True)
        if arch["execution"]["security_review_required"]:
            require_report(args.task_id, "security-report.json", {"APPROVED"}, current_commit=True)
        require_report(args.task_id, "review-report.json", {"APPROVED"}, current_commit=True)
        if not args.merged:
            raise SystemExit("Human merge is required. Re-run with --merged only after the feature branch/PR is actually merged.")
        target = "DONE"
    else:
        raise SystemExit(f"Unhandled status: {current}")

    task["status"] = target
    save_task(path, task)
    print(f"{args.task_id}: {current} -> {target}")


def manual_status(args):
    path, task = load_task(args.task_id)
    current = task["status"]
    if not args.force and args.status not in {"BLOCKED","CANCELLED"}:
        raise SystemExit("Normal progress uses `task advance`. Use --force only for deliberate recovery/administrative correction.")
    task["status"] = args.status
    save_task(path, task)
    print(f"{args.task_id}: {current} -> {args.status}")


def main():
    p = argparse.ArgumentParser(prog="agentctl", description="Control plane for the agentic development repository.")
    sub = p.add_subparsers(dest="command", required=True)
    sub.add_parser("bootstrap")

    project = sub.add_parser("project")
    ps = project.add_subparsers(dest="project_command", required=True)
    ps.add_parser("validate")

    task = sub.add_parser("task")
    ts = task.add_subparsers(dest="task_command", required=True)
    c = ts.add_parser("create"); c.add_argument("task_id"); c.add_argument("title"); c.add_argument("--type",default="feature",choices=["feature","bug","refactor","security","infra","research"]); c.add_argument("--priority",default="medium",choices=["low","medium","high","critical"])
    v = ts.add_parser("validate"); v.add_argument("task_id", nargs="?")
    s = ts.add_parser("show"); s.add_argument("task_id")
    a = ts.add_parser("advance"); a.add_argument("task_id"); a.add_argument("--merged", action="store_true")
    st = ts.add_parser("status"); st.add_argument("task_id"); st.add_argument("status", choices=STATUSES); st.add_argument("--force", action="store_true")

    gitp = sub.add_parser("git")
    gs = gitp.add_subparsers(dest="git_command", required=True)
    prep = gs.add_parser("prepare"); prep.add_argument("task_id"); prep.add_argument("--base")

    wt = sub.add_parser("worktree")
    ws = wt.add_subparsers(dest="worktree_command", required=True)
    wc = ws.add_parser("create"); wc.add_argument("task_id"); wc.add_argument("role", choices=["backend","frontend"]); wc.add_argument("--base"); wc.add_argument("--dir", dest="target_dir")
    wsync = ws.add_parser("sync"); wsync.add_argument("task_id"); wsync.add_argument("role", choices=["backend","frontend"])
    ws.add_parser("list")

    frontend = sub.add_parser("frontend")
    fs = frontend.add_subparsers(dest="frontend_command", required=True)
    fdg = fs.add_parser("design-gate"); fdg.add_argument("task_id")
    fdd = fs.add_parser("design-digest"); fdd.add_argument("task_id"); fdd.add_argument("--ref")

    scope = sub.add_parser("scope")
    ss = scope.add_subparsers(dest="scope_command", required=True)
    sc = ss.add_parser("check"); sc.add_argument("task_id"); sc.add_argument("role"); sc.add_argument("--base")

    verify = sub.add_parser("verify"); verify.add_argument("task_id", nargs="?"); verify.add_argument("--tests-only", action="store_true"); verify.add_argument("--security-only", action="store_true")

    args = p.parse_args()
    if args.command == "bootstrap": return run_script("bootstrap.py", [])
    if args.command == "project": return run_script("validate-project.py", [])
    if args.command == "task":
        if args.task_command == "create": return run_script("new-task.py", [args.task_id,args.title,"--type",args.type,"--priority",args.priority])
        if args.task_command == "validate": return run_script("validate-task.py", [args.task_id] if args.task_id else [])
        if args.task_command == "show": print(json.dumps(load_task(args.task_id)[1], indent=2)); return 0
        if args.task_command == "advance": advance(args); return 0
        if args.task_command == "status": manual_status(args); return 0
    if args.command == "git":
        forwarded=[args.task_id] + (["--base",args.base] if args.base else [])
        return run_script("prepare-branch.py", forwarded)
    if args.command == "worktree":
        if args.worktree_command == "list": return subprocess.call(["git","worktree","list"], cwd=ROOT)
        if args.worktree_command == "sync": return run_script("sync-worktree.py", [args.task_id,args.role])
        forwarded=[args.task_id,args.role]
        if args.base: forwarded += ["--base",args.base]
        if args.target_dir: forwarded += ["--dir",args.target_dir]
        return run_script("create-worktree.py", forwarded)
    if args.command == "frontend":
        if args.frontend_command == "design-gate": frontend_design_gate(args.task_id); return 0
        if args.frontend_command == "design-digest": print(frontend_design_digest(args.task_id, args.ref)); return 0
    if args.command == "scope":
        forwarded=[args.task_id,args.role] + (["--base",args.base] if args.base else [])
        return run_script("check-scope.py", forwarded)
    if args.command == "verify":
        forwarded=[]
        if args.task_id: forwarded.append(args.task_id)
        if args.tests_only: forwarded.append("--tests-only")
        if args.security_only: forwarded.append("--security-only")
        return run_script("verify.py", forwarded)
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
