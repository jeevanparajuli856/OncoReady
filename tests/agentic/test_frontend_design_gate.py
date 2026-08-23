import hashlib
import json
from conftest import run


def _canonical_digest(data):
    payload = json.dumps(data, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode('utf-8')
    return hashlib.sha256(payload).hexdigest()


def _set_architecture(repo, task_id, *, frontend=True, design_required=True):
    p = repo / f'.ai/tasks/{task_id}/architecture-report.json'
    report = json.loads(p.read_text())
    report['status'] = 'COMPLETE'
    report['summary'] = 'Architecture complete.'
    for key in report['impacts']:
        report['impacts'][key] = False
    report['impacts']['frontend'] = frontend
    report['impacts']['frontend_design_required'] = design_required
    report['execution']['contract_required'] = False
    report['execution']['test_depth'] = 'SMOKE'
    report['execution']['security_risk'] = 'LOW'
    report['execution']['security_review_required'] = False
    p.write_text(json.dumps(report, indent=2) + '\n')


def _set_implementation_state(repo, task_id):
    p = repo / f'.ai/tasks/{task_id}/task.json'
    task = json.loads(p.read_text())
    task['status'] = 'IMPLEMENTATION'
    p.write_text(json.dumps(task, indent=2) + '\n')


def _set_design_ready(repo, task_id, summary='Gemini design ready.'):
    p = repo / f'.ai/tasks/{task_id}/frontend-design-report.json'
    design = json.loads(p.read_text())
    design['status'] = 'DESIGN_READY'
    design['summary'] = summary
    design['design_system_action'] = 'REUSE'
    for key in design['visual_direction']:
        design['visual_direction'][key] = f'{key} defined'
    for key in design['motion']:
        design['motion'][key] = f'{key} defined'
    for key in design['responsive']:
        design['responsive'][key] = f'{key} defined'
    design['accessibility'] = ['Keyboard/focus behavior and reduced-motion behavior documented.']
    p.write_text(json.dumps(design, indent=2) + '\n')
    return design


def _approve_design(repo, task_id, design):
    p = repo / f'.ai/tasks/{task_id}/frontend-design-review.json'
    review = json.loads(p.read_text())
    review['status'] = 'APPROVED'
    review['summary'] = 'Compatible with upstream constraints.'
    review['reviewed_design_sha256'] = _canonical_digest(design)
    for key in review['checks']:
        review['checks'][key] = 'PASS'
    p.write_text(json.dumps(review, indent=2) + '\n')


def test_design_gate_requires_gemini_design_and_codex_approval(repo):
    task_id = 'DESIGN-001'
    run(repo, 'scripts/new-task.py', task_id, 'Design gate test')
    _set_architecture(repo, task_id)
    _set_implementation_state(repo, task_id)

    failed = run(repo, 'scripts/agentctl.py', 'frontend', 'design-gate', task_id, check=False)
    assert failed.returncode != 0

    design = _set_design_ready(repo, task_id)
    _approve_design(repo, task_id, design)

    passed = run(repo, 'scripts/agentctl.py', 'frontend', 'design-gate', task_id)
    assert 'APPROVED' in passed.stdout


def test_architecture_rejects_design_required_without_frontend(repo):
    task_id = 'DESIGN-002'
    run(repo, 'scripts/new-task.py', task_id, 'Invalid design impact')
    _set_architecture(repo, task_id, frontend=False, design_required=True)
    run(repo, 'scripts/agentctl.py', 'task', 'advance', task_id)
    failed = run(repo, 'scripts/agentctl.py', 'task', 'advance', task_id, check=False)
    assert failed.returncode != 0
    assert 'requires frontend=true' in (failed.stderr + failed.stdout)


def test_implementation_advance_enforces_design_gate(repo):
    task_id = 'DESIGN-003'
    run(repo, 'scripts/new-task.py', task_id, 'Implementation gate design test')
    _set_architecture(repo, task_id)
    _set_implementation_state(repo, task_id)

    frontend_path = repo / f'.ai/tasks/{task_id}/frontend-report.json'
    frontend = json.loads(frontend_path.read_text())
    frontend['status'] = 'COMPLETE'
    frontend['summary'] = 'Frontend implementation complete.'
    frontend['tests']['passed'] = True
    frontend_path.write_text(json.dumps(frontend, indent=2) + '\n')

    failed = run(repo, 'scripts/agentctl.py', 'task', 'advance', task_id, check=False)
    assert failed.returncode != 0
    assert 'frontend-design-report.json' in (failed.stderr + failed.stdout)

    design = _set_design_ready(repo, task_id)
    _approve_design(repo, task_id, design)

    passed = run(repo, 'scripts/agentctl.py', 'task', 'advance', task_id)
    assert 'INTEGRATION' in passed.stdout


def test_design_gate_rejects_design_changed_after_codex_approval(repo):
    task_id = 'DESIGN-004'
    run(repo, 'scripts/new-task.py', task_id, 'Stale design approval test')
    _set_architecture(repo, task_id)
    _set_implementation_state(repo, task_id)
    design = _set_design_ready(repo, task_id, 'Design version A')
    _approve_design(repo, task_id, design)

    design_path = repo / f'.ai/tasks/{task_id}/frontend-design-report.json'
    changed = json.loads(design_path.read_text())
    changed['summary'] = 'Design version B after approval'
    changed['visual_direction']['color'] = 'Changed palette after approval'
    design_path.write_text(json.dumps(changed, indent=2) + '\n')

    failed = run(repo, 'scripts/agentctl.py', 'frontend', 'design-gate', task_id, check=False)
    assert failed.returncode != 0
    assert 'changed since Codex approval' in (failed.stderr + failed.stdout)


def test_design_gate_rejects_empty_design_ready_evidence(repo):
    task_id = 'DESIGN-005'
    run(repo, 'scripts/new-task.py', task_id, 'Empty design evidence test')
    _set_architecture(repo, task_id)
    _set_implementation_state(repo, task_id)

    design_path = repo / f'.ai/tasks/{task_id}/frontend-design-report.json'
    design = json.loads(design_path.read_text())
    design['status'] = 'DESIGN_READY'
    design['summary'] = 'Marked ready without design details.'
    design['design_system_action'] = 'REUSE'
    design_path.write_text(json.dumps(design, indent=2) + '\n')
    _approve_design(repo, task_id, design)

    failed = run(repo, 'scripts/agentctl.py', 'frontend', 'design-gate', task_id, check=False)
    assert failed.returncode != 0
    assert 'empty visual_direction fields' in (failed.stderr + failed.stdout)
