import json
import subprocess
from conftest import run


def _git(repo, *args):
    return subprocess.run(['git', *args], cwd=repo, text=True, capture_output=True, check=True)


def test_worker_cannot_branch_from_another_worker_branch(repo, tmp_path):
    task_id = 'BASE-001'
    run(repo, 'scripts/new-task.py', task_id, 'Worker base isolation')
    _git(repo, 'init')
    _git(repo, 'config', 'user.email', 'agentic-test@example.invalid')
    _git(repo, 'config', 'user.name', 'Agentic Test')
    _git(repo, 'add', '.')
    _git(repo, 'commit', '-m', 'baseline')
    _git(repo, 'switch', '-c', 'feature/BASE-001-worker-base-isolation')

    task_path = repo / f'.ai/tasks/{task_id}/task.json'
    task = json.loads(task_path.read_text())
    task['status'] = 'IMPLEMENTATION'
    task_path.write_text(json.dumps(task, indent=2) + '\n')
    _git(repo, 'add', str(task_path.relative_to(repo)))
    _git(repo, 'commit', '-m', 'task ready')
    _git(repo, 'branch', 'agent/BASE-001-backend')

    target = tmp_path / 'frontend-worker'
    failed = run(
        repo,
        'scripts/create-worktree.py', task_id, 'frontend',
        '--base', 'agent/BASE-001-backend', '--dir', str(target),
        check=False,
    )
    assert failed.returncode != 0
    assert 'must be the task feature branch' in (failed.stderr + failed.stdout)
    assert not target.exists()
