import { expect, test, type Page } from '@playwright/test';

const treatment = {
  treatment_id: '22222222-2222-4222-8222-222222222222',
  starts_at: '2026-09-24T14:00:00.000Z',
  arrival_window: {
    starts_at: '2026-09-24T13:15:00.000Z',
    ends_at: '2026-09-24T13:45:00.000Z',
  },
  location_display_name: 'Benson Cancer Center',
  transport_notice_cutoff: '2026-09-22T17:00:00.000Z',
};

const reconciliation = {
  state: 'not_required',
  last_attempt_at: null,
  attempt_reference: null,
  provenance: 'none',
  permitted_recovery: 'none',
};

const projections = {
  patient: {
    scenario_id: '11111111-1111-4111-8111-111111111111',
    scenario_version: 0,
    role: 'patient',
    as_of: '2026-09-20T18:00:00.000Z',
    treatment,
    readiness_status: 'not_started',
    patient: { patient_id: '33333333-3333-4333-8333-333333333333', display_name: 'Maria Santos' },
    blockers: [],
    next_action: 'Complete the T-3 readiness check-in.',
    communications: [],
    transport: {
      transport_request_id: '44444444-4444-4444-8444-444444444444',
      aggregate_version: 0,
      status: 'need_detected',
      provider_display_name: 'CareLink Partner Dispatch',
      plan_version: 1,
      acknowledgment_required: false,
    },
  },
  caregiver: {
    scenario_id: '11111111-1111-4111-8111-111111111111',
    scenario_version: 0,
    role: 'caregiver',
    as_of: '2026-09-20T18:00:00.000Z',
    treatment,
    readiness_status: 'at_risk',
    caregiver: { display_name: 'Ana Santos' },
    permission: { transport_logistics_allowed: false },
  },
  staff: {
    scenario_id: '11111111-1111-4111-8111-111111111111',
    scenario_version: 3,
    role: 'staff',
    as_of: '2026-09-20T18:00:00.000Z',
    treatment,
    readiness_status: 'action_in_progress',
    patient: { patient_id: '33333333-3333-4333-8333-333333333333', display_name: 'Maria Santos' },
    barriers: [],
    work_items: [],
    communications: [],
    transport: {
      status: 'need_detected',
      provider_display_name: 'CareLink Partner Dispatch',
      plan_version: 1,
      acknowledgment_required: false,
      transport_request_id: '44444444-4444-4444-8444-444444444444',
      aggregate_version: 0,
      eligibility: 'not_reviewed',
      outbound_plan_complete: false,
      return_plan_complete: false,
      reconciliation,
    },
    timeline: [],
  },
  transport_coordinator: {
    scenario_id: '11111111-1111-4111-8111-111111111111',
    scenario_version: 0,
    role: 'transport_coordinator',
    as_of: '2026-09-20T18:00:00.000Z',
    treatment,
    readiness_status: 'at_risk',
    request: {
      transport_request_id: '44444444-4444-4444-8444-444444444444',
      aggregate_version: 0,
      status: 'need_detected',
      arrival_window: treatment.arrival_window,
      notice_cutoff: treatment.transport_notice_cutoff,
      funding_path: 'pilot_sponsored',
      service_area: 'Greater New Orleans',
      mobility: { wheelchair: false, transfer_assistance: false, escort_required: false, notes: null },
      outbound_plan: { location_alias: 'maria_home', window: treatment.arrival_window, duration_uncertain: false },
      return_plan: { location_alias: 'benson_cancer_center', window: treatment.arrival_window, duration_uncertain: true },
      notification_permission: true,
      contact_alias: 'finals_allowlisted_phone',
      acknowledgment_status: 'not_requested',
      driver_alias: null,
      vehicle_description: null,
      reconciliation,
    },
  },
};

const mockProjectionApi = async (page: Page, overrides: Partial<Record<keyof typeof projections, unknown>> = {}) => {
  await page.route('**/api/v1/scenarios/finals?role=*', async (route) => {
    const role = new URL(route.request().url()).searchParams.get('role') as keyof typeof projections;
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(overrides[role] ?? projections[role]),
    });
  });
};

test.describe('OncoReady LAUNCH-001 frontend', () => {
  test('public landing stays buyer-safe, responsive, and centrally priced', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 760 });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Tomorrow’s treatment deserves a closed plan.' })).toBeVisible();
    await expect(page.getByText('$18,000/year')).toBeVisible();
    await expect(page.getByText('$1,500/month billed annually')).toBeVisible();
    await expect(page.getByText('Custom pricing')).toBeVisible();

    const publicCopy = (await page.locator('body').innerText()).toLowerCase();
    for (const term of ['maria santos', 'mrn', 'regimen', 'workspace preview', 'readiness graph']) {
      expect(publicCopy).not.toContain(term);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  });

  test('continuity field stays bounded and public entry works at desktop and mobile sizes', async ({ page }) => {
    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'mobile', width: 390, height: 844 },
    ] as const;

    for (const viewport of viewports) {
      await test.step(viewport.name, async () => {
        await page.setViewportSize(viewport);
        await page.goto('/');

        await expect(page.getByRole('heading', { name: 'Tomorrow’s treatment deserves a closed plan.' })).toBeVisible();
        const field = page.locator('.continuity-field');
        await expect(field).toBeVisible();

        const geometry = await field.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          const childGeometry = (selector: string) => {
            const child = element.querySelector<HTMLElement>(selector);
            if (!child) return null;
            const childBounds = child.getBoundingClientRect();
            return {
              left: childBounds.left,
              right: childBounds.right,
              top: childBounds.top,
              bottom: childBounds.bottom,
              position: getComputedStyle(child).position,
            };
          };

          return {
            bounds: {
              left: bounds.left,
              right: bounds.right,
              top: bounds.top,
              bottom: bounds.bottom,
              width: bounds.width,
              height: bounds.height,
            },
            position: getComputedStyle(element).position,
            overflow: getComputedStyle(element).overflow,
            canvas: childGeometry('.continuity-field__canvas'),
            fallback: childGeometry('.continuity-field__fallback'),
            labels: Array.from(element.querySelectorAll<HTMLElement>('.continuity-field__label')).map((label) => {
              const labelBounds = label.getBoundingClientRect();
              return {
                left: labelBounds.left,
                right: labelBounds.right,
                top: labelBounds.top,
                bottom: labelBounds.bottom,
                position: getComputedStyle(label).position,
              };
            }),
          };
        });

        expect(geometry.position).toBe('relative');
        expect(geometry.overflow).toBe('hidden');
        expect(geometry.bounds.width).toBeGreaterThan(300);
        expect(geometry.bounds.height).toBeGreaterThanOrEqual(440);
        expect(geometry.bounds.height).toBeLessThanOrEqual(700);
        expect(geometry.bounds.left).toBeGreaterThanOrEqual(0);
        expect(geometry.bounds.right).toBeLessThanOrEqual(viewport.width);

        for (const surface of [geometry.canvas, geometry.fallback]) {
          expect(surface).not.toBeNull();
          expect(surface?.position).toBe('absolute');
          expect(surface?.left).toBeGreaterThanOrEqual(geometry.bounds.left - 1);
          expect(surface?.right).toBeLessThanOrEqual(geometry.bounds.right + 1);
          expect(surface?.top).toBeGreaterThanOrEqual(geometry.bounds.top - 1);
          expect(surface?.bottom).toBeLessThanOrEqual(geometry.bounds.bottom + 1);
        }

        expect(geometry.labels).toHaveLength(4);
        for (const label of geometry.labels) {
          expect(label.position).toBe('absolute');
          expect(label.left).toBeGreaterThanOrEqual(geometry.bounds.left);
          expect(label.right).toBeLessThanOrEqual(geometry.bounds.right);
          expect(label.top).toBeGreaterThanOrEqual(geometry.bounds.top);
          expect(label.bottom).toBeLessThanOrEqual(geometry.bounds.bottom);
        }

        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);

        const navigation = viewport.name === 'desktop'
          ? page.getByRole('navigation', { name: 'Public navigation' })
          : page.getByRole('navigation', { name: 'Mobile public navigation' });
        if (viewport.name === 'mobile') {
          await page.getByRole('button', { name: 'Toggle navigation' }).click();
        }
        await expect(navigation.getByRole('link', { name: 'How it works' })).toBeVisible();
        await expect(navigation.getByRole('link', { name: 'Pricing' })).toBeVisible();
        await navigation.getByRole('link', { name: 'How it works' }).click();
        await expect(page).toHaveURL(/#how-it-works$/);
        await expect(page.locator('#how-it-works')).toBeInViewport();

        if (viewport.name === 'mobile') {
          await page.getByRole('button', { name: 'Toggle navigation' }).click();
        }
        await navigation.getByRole('button', { name: 'Workspace access' }).click();
        await expect(page).toHaveURL(/\/access$/);
        await expect(page.getByRole('heading', { name: 'Choose a role-based workspace.' })).toBeVisible();
      });
    }
  });

  test('staff communication view holds live actions until durable evidence exists', async ({ page }) => {
    await mockProjectionApi(page);
    await page.goto('/access');
    await page.getByRole('button', { name: /Continue with Apple/i }).click();
    await expect(page).toHaveURL(/\/staff$/);
    await page.getByRole('tab', { name: 'SMS & voice' }).click();

    await expect(page.getByRole('heading', { name: 'SMS readiness messages' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Voice readiness calls' })).toBeVisible();
    await expect(page.getByText('Live provider action held')).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'No live send' })).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'No live send' }).first()).toBeDisabled();

    await page.setViewportSize({ width: 390, height: 844 });
    const headerTargets = page.locator('.launch-header').getByRole('button');
    const targetSizes = await headerTargets.evaluateAll((buttons) => buttons.map((button) => {
      const bounds = button.getBoundingClientRect();
      return { width: bounds.width, height: bounds.height };
    }));
    expect(targetSizes.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test('verified delivery and outcome-unknown voice remain visually distinct', async ({ page }) => {
    const staff = {
      ...projections.staff,
      communications: [
        {
          communication_id: '55555555-5555-4555-8555-555555555555',
          channel: 'sms',
          purpose: 'readiness',
          status: 'delivered',
          provenance: 'provider_callback',
          occurred_at: '2026-09-20T18:01:00.000Z',
          reconciliation: { ...reconciliation, state: 'reconciled', provenance: 'provider_callback', attempt_reference: 'SM-redacted' },
        },
        {
          communication_id: '66666666-6666-4666-8666-666666666666',
          channel: 'voice',
          purpose: 'human_callback',
          status: 'outcome_unknown',
          provenance: 'deterministic_replay',
          occurred_at: '2026-09-20T18:02:00.000Z',
          reconciliation: { ...reconciliation, state: 'reconciliation_required', provenance: 'provider_lookup', permitted_recovery: 'reconcile_provider', attempt_reference: 'conversation-redacted' },
        },
      ],
    };
    await mockProjectionApi(page, { staff });
    await page.goto('/access');
    await page.getByRole('button', { name: /Continue with Apple/i }).click();
    await page.getByRole('tab', { name: 'SMS & voice' }).click();

    await expect(page.getByText('Verified provider callback', { exact: false })).toBeVisible();
    await expect(page.getByText('Outcome not confirmed. The original action will not be resent automatically.')).toBeVisible();
    await expect(page.getByText('Reconciled')).toBeVisible();
  });

  test('revoked caregiver projection mounts no clinical or prior transport detail', async ({ page }) => {
    await mockProjectionApi(page);
    await page.goto('/access');
    await page.getByRole('button', { name: /Continue with Microsoft/i }).click();

    await expect(page.getByRole('heading', { name: 'No logistics shared' })).toBeVisible();
    const caregiverCopy = (await page.locator('body').innerText()).toLowerCase();
    for (const term of ['fever', 'tingling', 'clinical review', 'nurse note', 'priority score', 'driver pending']) {
      expect(caregiverCopy).not.toContain(term);
    }
  });

  test('patient readiness dialog traps focus, closes with Escape, and honors reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockProjectionApi(page);
    await page.goto('/access');
    await page.getByRole('button', { name: /Continue with Google/i }).click();
    await page.getByRole('button', { name: /Start readiness check/i }).click();

    const dialog = page.getByRole('dialog', { name: /Tell your team what could affect tomorrow/i });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close readiness check' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page.locator('.launch-app')).toHaveClass(/motion-reduce/);
  });

  test('Maria acknowledges the complete ride plan while coordinator waits without a patient command', async ({ page }) => {
    const ride = {
      transport_request_id: '44444444-4444-4444-8444-444444444444',
      aggregate_version: 8,
      status: 'patient_notified',
      provider_display_name: 'CareLink Partner Dispatch',
      pickup_window: treatment.arrival_window,
      return_window: treatment.arrival_window,
      driver_alias: 'Driver C',
      vehicle_description: 'Accessible blue van',
      plan_version: 3,
      acknowledgment_required: true,
    };
    const patient = { ...projections.patient, readiness_status: 'action_in_progress', transport: ride };
    const transportCoordinator = {
      ...projections.transport_coordinator,
      request: { ...projections.transport_coordinator.request, aggregate_version: 8, status: 'patient_notified', acknowledgment_status: 'requested' },
    };
    let postedBody: Record<string, unknown> | null = null;
    await mockProjectionApi(page, { patient, transport_coordinator: transportCoordinator });
    await page.route('**/api/v1/transport/requests/*/commands', async (route) => {
      postedBody = route.request().postDataJSON();
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ command_id: crypto.randomUUID(), disposition: 'accepted', scenario_id: projections.patient.scenario_id, aggregate_id: ride.transport_request_id, aggregate_version: 9, emitted_events: [] }) });
    });

    await page.goto('/access');
    await page.getByRole('button', { name: /Continue with Email/i }).click();
    await expect(page.getByRole('heading', { name: 'Waiting for Maria' })).toBeVisible();
    await expect(page.getByText('Awaiting patient')).toBeVisible();
    await expect(page.getByRole('button', { name: /Record patient acknowledgment/i })).toHaveCount(0);

    await page.getByRole('button', { name: /Switch workspace/i }).click();
    await page.getByRole('button', { name: /Continue with Google/i }).click();
    await page.getByRole('button', { name: 'Acknowledge complete ride plan' }).click();
    await expect.poll(() => postedBody).toMatchObject({
      actor_role: 'patient',
      action: 'acknowledge_patient',
      expected_aggregate_version: 8,
    });
  });

  test('coordinator completes from pickup with evidence and escalates unresolved return state', async ({ page }) => {
    const posted: Array<Record<string, unknown>> = [];
    const pickedUp = { ...projections.transport_coordinator, request: { ...projections.transport_coordinator.request, aggregate_version: 10, status: 'picked_up' } };
    await mockProjectionApi(page, { transport_coordinator: pickedUp });
    await page.route('**/api/v1/transport/requests/*/commands', async (route) => {
      posted.push(route.request().postDataJSON());
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ command_id: crypto.randomUUID(), disposition: 'accepted', scenario_id: projections.patient.scenario_id, aggregate_id: pickedUp.request.transport_request_id, aggregate_version: 11, emitted_events: [] }) });
    });
    await page.goto('/access');
    await page.getByRole('button', { name: /Continue with Email/i }).click();
    await page.getByRole('button', { name: 'Complete both-leg fulfillment' }).focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => posted[0]).toMatchObject({ action: 'complete', closure_evidence: expect.any(String) });

    await page.unroute('**/api/v1/scenarios/finals?role=*');
    const returnPending = { ...pickedUp, request: { ...pickedUp.request, status: 'return_pending', aggregate_version: 11 } };
    await mockProjectionApi(page, { transport_coordinator: returnPending });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Return leg unresolved' })).toBeVisible();
    await page.getByRole('button', { name: 'Escalate to navigator' }).focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => posted[1]).toMatchObject({ action: 'escalate_to_navigator', reason: expect.any(String) });
  });
});
