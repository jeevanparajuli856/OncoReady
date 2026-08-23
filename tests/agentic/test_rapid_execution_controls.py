import json
import subprocess
from conftest import run


def _git(repo, *args):
    return subprocess.run(['git', *args], cwd=repo, text=True, capture_output=True, check=True)


def _complete_arch(repo, task_id, *, contract=False, test_depth='SMOKE', risk='LOW', security_review=False):
    p = repo / f'.ai/tasks/{task_id}/architecture-report.json'
    report = json.loads(p.read_text())
    report['status'] = 'COMPLETE'
    report['summary'] = 'Minimum architecture complete.'
    for key in report['impacts']:
        report['impacts'][key] = False
    report['execution']['contract_required'] = contract
    report['execution']['test_depth'] = test_depth
    report['execution']['security_risk'] = risk
    report['execution']['security_review_required'] = security_review
    p.write_text(json.dumps(report, indent=2) + '\n')


def test_low_risk_smoke_task_reaches_build_ready_without_contract_or_security_review(repo):
    task_id = 'RAPID-001'
    run(repo, 'scripts/new-task.py', task_id, 'Rapid slice')
    run(repo, 'scripts/agentctl.py', 'task', 'advance', task_id)
    _complete_arch(repo, task_id)
    result = run(repo, 'scripts/agentctl.py', 'task', 'advance', task_id)
    assert 'BUILD_READY' in result.stdout


def test_contract_required_needs_explicit_task_contract(repo):
    task_id = 'RAPID-002'
    run(repo, 'scripts/new-task.py', task_id, 'Contracted slice')
    run(repo, 'scripts/agentctl.py', 'task', 'advance', task_id)
    _complete_arch(repo, task_id, contract=True)
    failed = run(repo, 'scripts/agentctl.py', 'task', 'advance', task_id, check=False)
    assert failed.returncode != 0
    assert 'task.contracts is empty' in (failed.stdout + failed.stderr)


def test_high_security_risk_cannot_skip_security_review(repo):
    task_id = 'RAPID-003'
    run(repo, 'scripts/new-task.py', task_id, 'High risk slice')
    run(repo, 'scripts/agentctl.py', 'task', 'advance', task_id)
    _complete_arch(repo, task_id, risk='HIGH', security_review=False)
    failed = run(repo, 'scripts/agentctl.py', 'task', 'advance', task_id, check=False)
    assert failed.returncode != 0
    assert 'HIGH security risk requires' in (failed.stdout + failed.stderr)


def test_targeted_testing_requires_independent_test_report_before_review(repo):
    task_id = 'RAPID-004'
    run(repo, 'scripts/new-task.py', task_id, 'Targeted test slice')
    _complete_arch(repo, task_id, test_depth='TARGETED')

    task_path = repo / f'.ai/tasks/{task_id}/task.json'
    task = json.loads(task_path.read_text())
    task['status'] = 'INTEGRATION'
    task_path.write_text(json.dumps(task, indent=2) + '\n')

    _git(repo, 'init')
    _git(repo, 'config', 'user.email', 'agentic-test@example.invalid')
    _git(repo, 'config', 'user.name', 'Agentic Test')
    _git(repo, 'add', '.')
    _git(repo, 'commit', '-m', 'integrated')
    head = _git(repo, 'rev-parse', 'HEAD').stdout.strip()

    vr = repo / f'.ai/tasks/{task_id}/verification-report.json'
    verification = json.loads(vr.read_text())
    verification['status'] = 'PASSED'
    verification['commit'] = head
    verification['checks'] = []
    vr.write_text(json.dumps(verification, indent=2) + '\n')

    failed = run(repo, 'scripts/agentctl.py', 'task', 'advance', task_id, check=False)
    assert failed.returncode != 0
    assert 'test-report.json' in (failed.stdout + failed.stderr)


def test_required_security_review_blocks_integration_until_approved(repo):
    task_id = 'RAPID-005'
    run(repo, 'scripts/new-task.py', task_id, 'Security reviewed slice')
    _complete_arch(repo, task_id, risk='STANDARD', security_review=True)

    task_path = repo / f'.ai/tasks/{task_id}/task.json'
    task = json.loads(task_path.read_text())
    task['status'] = 'INTEGRATION'
    task_path.write_text(json.dumps(task, indent=2) + '\n')

    _git(repo, 'init')
    _git(repo, 'config', 'user.email', 'agentic-test@example.invalid')
    _git(repo, 'config', 'user.name', 'Agentic Test')
    _git(repo, 'add', '.')
    _git(repo, 'commit', '-m', 'integrated security-sensitive slice')
    head = _git(repo, 'rev-parse', 'HEAD').stdout.strip()

    vr = repo / f'.ai/tasks/{task_id}/verification-report.json'
    verification = json.loads(vr.read_text())
    verification['status'] = 'PASSED'
    verification['commit'] = head
    verification['checks'] = []
    vr.write_text(json.dumps(verification, indent=2) + '\n')

    failed = run(repo, 'scripts/agentctl.py', 'task', 'advance', task_id, check=False)
    assert failed.returncode != 0
    assert 'security-report.json' in (failed.stdout + failed.stderr)
