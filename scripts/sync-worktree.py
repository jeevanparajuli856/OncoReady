#!/usr/bin/env python3
import argparse
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def git(*args, capture=False, check=True):
    return subprocess.run(["git", *args], cwd=ROOT, text=True, capture_output=capture, check=check)


def find_feature_branch(task_id):
    proc = git("for-each-ref", "--format=%(refname:short)", f"refs/heads/feature/{task_id}-*", capture=True)
    branches = [x.strip() for x in proc.stdout.splitlines() if x.strip()]
    if len(branches) != 1:
        raise SystemExit(f"Expected exactly one feature/{task_id}-* branch; found {branches or 'none'}.")
    return branches[0]


def main():
    parser = argparse.ArgumentParser(description="Sync a private worker branch with its task feature branch.")
    parser.add_argument("task_id")
    parser.add_argument("role", choices=["backend", "frontend"])
    args = parser.parse_args()

    current = git("branch", "--show-current", capture=True).stdout.strip()
    expected = f"agent/{args.task_id}-{args.role}"
    if current != expected:
        raise SystemExit(f"Run this command from the {expected} worktree; current branch is {current!r}.")

    if git("status", "--porcelain", capture=True).stdout.strip():
        raise SystemExit("Worker worktree is dirty. Commit or deliberately discard changes before syncing.")

    feature = find_feature_branch(args.task_id)
    git("rebase", feature)
    print(f"Synced {expected} onto {feature}.")


if __name__ == "__main__":
    main()
