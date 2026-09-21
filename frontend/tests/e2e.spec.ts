import { expect, test } from '@playwright/test';

test.describe('OncoReady UI-001 product experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('landing reveals once, presents the SaaS model, and stays horizontally safe', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Tomorrow’s treatment.*Every blocker owned/i })).toBeVisible();
    await expect(page.getByText('SaaS business model')).toBeVisible();
    await expect(page.getByRole('heading', { name: /One readiness capability, shaped around the oncology operation/i })).toBeVisible();

    const landingCopy = (await page.locator('body').innerText()).toLowerCase();
    for (const term of ['demo', 'prototype', 'preview', 'portfolio', 'training environment']) {
      expect(landingCopy).not.toContain(term);
    }

    const roleGrid = page.locator('.landing-role-grid');
    await roleGrid.scrollIntoViewIfNeeded();
    const roleReveals = page.locator('.landing-role-grid [data-reveal-variant]');
    await expect(roleReveals).toHaveCount(3);
    await expect(roleReveals.nth(0)).toHaveAttribute('data-reveal-variant', 'patient');
    await expect(roleReveals.nth(1)).toHaveAttribute('data-reveal-variant', 'staff');
    await expect(roleReveals.nth(2)).toHaveAttribute('data-reveal-variant', 'caregiver');
    await expect(roleReveals.nth(0)).toHaveAttribute('data-reveal-state', 'revealed');
    await expect(roleReveals.nth(1)).toHaveAttribute('data-reveal-state', 'revealed');
    await expect(roleReveals.nth(2)).toHaveAttribute('data-reveal-state', 'revealed');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#pricing-section').scrollIntoViewIfNeeded();
    const pageWidths = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
      attachment: getComputedStyle(document.body).backgroundAttachment,
      headerBlur: getComputedStyle(document.querySelector('.landing-header') as HTMLElement).backdropFilter,
    }));
    expect(pageWidths.content).toBeLessThanOrEqual(pageWidths.viewport);
    expect(pageWidths.attachment).not.toBe('fixed');
    expect(pageWidths.headerBlur).toBe('none');
  });

  test('system reduced motion exposes final reveal content immediately', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();

    const revealStates = await page.locator('[data-reveal-state]').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-reveal-state')),
    );
    expect(revealStates.length).toBeGreaterThan(0);
    expect(revealStates.every((state) => state === 'visible')).toBe(true);
  });

  test('landing uses static fallbacks when IntersectionObserver is unavailable', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await page.addInitScript(() => {
      Object.defineProperty(window, 'IntersectionObserver', {
        configurable: true,
        value: undefined,
      });
    });
    await page.reload();

    await expect(page.getByRole('heading', { name: /Tomorrow’s treatment.*Every blocker owned/i })).toBeVisible();
    await expect(page.getByRole('img', { name: /continuity ribbon connects patient signals/i })).toBeVisible();
    await expect(page.getByText('Treatment-day corridor')).toBeVisible();
    await expect(page.locator('.ride-map-boundary svg[viewBox="0 0 640 320"]')).toBeVisible();

    const revealStates = await page.locator('[data-reveal-state]').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('data-reveal-state')),
    );
    expect(revealStates.length).toBeGreaterThan(0);
    expect(revealStates.every((state) => state === 'visible')).toBe(true);
    expect(pageErrors).toEqual([]);
  });

  test('mobile workspace dock keeps 44px targets without horizontal overflow', async ({ page }) => {
    for (const viewport of [
      { width: 320, height: 568 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);

      const dock = page.getByRole('navigation', { name: 'Workspace dock' });
      await expect(dock).toBeVisible();

      const targets = dock.getByRole('button');
      await expect(targets).toHaveCount(5);
      const targetSizes = await targets.evaluateAll((buttons) =>
        buttons.map((button) => {
          const bounds = button.getBoundingClientRect();
          return { width: bounds.width, height: bounds.height };
        }),
      );

      expect(targetSizes.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);

      const motionControl = page.locator('footer').getByRole('button', { name: 'Reduce motion' });
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await motionControl.focus();

      const foundationStatus = page.locator('.foundation-status');
      const foundationRefresh = foundationStatus.locator('.foundation-status__refresh');
      await expect(foundationStatus).toBeVisible();
      await expect(foundationStatus).toHaveAttribute('data-state', /persisted|unavailable/);
      const foundationTarget = await foundationRefresh.boundingBox();
      expect(foundationTarget).not.toBeNull();
      expect(foundationTarget!.width).toBeGreaterThanOrEqual(44);
      expect(foundationTarget!.height).toBeGreaterThanOrEqual(44);

      const controlBounds = await motionControl.boundingBox();
      const dockBounds = await dock.boundingBox();
      expect(controlBounds).not.toBeNull();
      expect(dockBounds).not.toBeNull();
      expect(controlBounds!.y + controlBounds!.height + 8).toBeLessThanOrEqual(dockBounds!.y);

      const focusAndHitTest = await motionControl.evaluate((button) => {
        const bounds = button.getBoundingClientRect();
        const style = getComputedStyle(button);
        const samples = [
          [bounds.left + bounds.width * 0.25, bounds.top + bounds.height * 0.25],
          [bounds.left + bounds.width * 0.75, bounds.top + bounds.height * 0.25],
          [bounds.left + bounds.width / 2, bounds.top + bounds.height / 2],
          [bounds.left + bounds.width * 0.25, bounds.top + bounds.height * 0.75],
          [bounds.left + bounds.width * 0.75, bounds.top + bounds.height * 0.75],
          [bounds.left + bounds.width / 2, bounds.bottom - 1],
        ];

        return {
          outlineStyle: style.outlineStyle,
          outlineWidth: style.outlineWidth,
          targetOwnsEveryPoint: samples.every(([x, y]) => {
            const hit = document.elementFromPoint(x, y);
            return hit === button || button.contains(hit);
          }),
        };
      });

      expect(focusAndHitTest.outlineStyle).toBe('solid');
      expect(focusAndHitTest.outlineWidth).toBe('2px');
      expect(focusAndHitTest.targetOwnsEveryPoint).toBe(true);
    }
  });

  test('workspace routes and the complete Maria journey remain connected', async ({ page }) => {
    await page.getByRole('button', { name: /Explore the workspace/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByTestId('auth-patient-card').click();

    await page.getByRole('button', { name: /Start Readiness Check/i }).click();
    await page.getByRole('button', { name: /Submit Readiness Report/i }).click();
    await expect(page.getByText(/Your Reported Barriers are Being Resolved/i)).toBeVisible();
    await page.getByRole('button', { name: /View Staff Workbench/i }).click();

    const routeChecks = [
      ['Command Center', /Command Center/i],
      ['Exceptions', /Pre-Treatment Exception Queue/i],
      ['Patients', /Patient Directory/i],
      ['Resources', /Resource Directory/i],
      ['Insights', /Operational Insights/i],
      ['Integrations', /Proposed Data Flow Mapping/i],
      ['Admin', /Local Configuration/i],
    ] as const;

    for (const [route, heading] of routeChecks) {
      await page.getByRole('button', { name: route, exact: true }).click();
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
    }

    await page.getByRole('button', { name: 'Exceptions', exact: true }).click();
    await page.getByRole('button', { name: /Open Case Workspace/i }).click();
    await expect(page.getByText(/Task 1: Clinical Symptom Review/i)).toBeVisible();
    await page.getByRole('button', { name: /Acknowledge Review & Record Disposition/i }).click();
    await page.getByRole('button', { name: /Confirm & Dispatch Med-Van/i }).click();

    await page.getByRole('button', { name: /Sarah Jenkins, RN/i }).click();
    await page.getByText(/Caregiver Portal \(Ana Hernandez\)/i).click();
    await expect(page.getByText(/Ride Confirmed/i)).toBeVisible();
    const caregiverCopy = (await page.locator('body').innerText()).toLowerCase();
    expect(caregiverCopy).not.toContain('fever 100.4');
    expect(caregiverCopy).not.toContain('tingling in fingers');

    await page.getByRole('button', { name: /Ana Hernandez/i }).click();
    await page.getByText(/Patient Portal \(Maria Hernandez\)/i).click();
    await page.getByRole('button', { name: /Review & Confirm Plan/i }).click();
    await page.getByRole('checkbox', { name: /I acknowledge the 7:45 AM Med-Van/i }).check();
    await page.getByRole('button', { name: /Acknowledge & Confirm Treatment Plan/i }).click();
    await expect(page.getByText(/Everything is Set for Tomorrow Morning/i)).toBeVisible();

    await page.getByTitle(/Reset Workspace/i).click();
    await expect(page.getByRole('heading', { name: /Tomorrow’s treatment.*Every blocker owned/i })).toBeVisible();
  });
});
