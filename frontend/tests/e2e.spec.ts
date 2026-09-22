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

  test('production preview serves the SPA shell on a direct deep-link refresh', async ({ page }) => {
    const response = await page.goto('/workspace/deep-link');

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: /Tomorrow’s treatment.*Every blocker owned/i })).toBeVisible();
    await expect(page.locator('.foundation-status')).toHaveAttribute('data-state', /persisted|unavailable/);
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

  test('public access stays record-free and enters all prepared workspaces through one gateway', async ({ page }) => {
    const publicCopy = await page.locator('body').innerText();
    for (const privateTerm of ['Camila Lopez', 'OR-882914', 'Colorectal Adenocarcinoma', 'mFOLFOX6']) {
      expect(publicCopy).not.toContain(privateTerm);
    }

    const plans = page.getByTestId('pricing-plans');
    await expect(plans.getByRole('article')).toHaveCount(2);
    await expect(plans.getByText('$1,500/month')).toBeVisible();
    await expect(plans.getByText('5 staff seats')).toBeVisible();
    await expect(plans.getByText('1 site')).toBeVisible();
    await expect(plans.getByRole('button', { name: 'Buy now' })).toBeDisabled();
    await expect(plans.getByRole('link', { name: 'Contact us' })).toHaveAttribute('href', 'mailto:support@oncoready.me');

    const heroEntry = page.getByRole('button', { name: /Access workspace/i }).first();
    await heroEntry.click();
    const dialog = page.getByRole('dialog', { name: 'Prepared workspaces' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/does not sign you in or grant provider access/i)).toBeVisible();
    await expect(dialog.getByRole('button')).toHaveCount(5);
    await expect(dialog.getByTestId('auth-care-team-card')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(heroEntry).toBeFocused();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('navigation', { name: 'Workspace dock' }).getByRole('button', { name: 'Patient' }).click();
    await expect(dialog).toBeVisible();
    await dialog.getByTestId('auth-care-navigator-card').click();
    await expect(page.getByRole('heading', { name: /Prepared reply has not opened work yet/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Graph/i })).toBeVisible();

    await page.getByTitle(/Reset Workspace/i).click();
    await expect(page.getByRole('heading', { name: /Tomorrow’s treatment.*Every blocker owned/i })).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Camila Lopez');
  });

  test('workspace routes and the complete Camila journey remain connected', async ({ page }) => {
    await page.getByRole('button', { name: /Access workspace/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByTestId('auth-patient-card').click();

    await page.getByRole('button', { name: /Start Readiness Check/i }).click();
    await page.getByRole('button', { name: /Submit Readiness Report/i }).click();
    await expect(page.getByText(/Your Reported Barriers are Being Resolved/i)).toBeVisible();
    await page.getByRole('button', { name: /View Care Team Workbench/i }).click();

    const routeChecks = [
      ['Command Center', /Command Center/i],
      ['Exceptions', /Pre-Treatment Exception Queue/i],
      ['Patients', /Patient Directory/i],
      ['Insights', /Operational Insights/i],
      ['Epic context', /Epic Sandbox capture/i],
      ['Admin', /Local Configuration/i],
    ] as const;

    for (const [route, heading] of routeChecks) {
      await page.getByRole('button', { name: route, exact: true }).click();
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
    }

    await page.getByRole('button', { name: 'Exceptions', exact: true }).click();
    await page.getByRole('button', { name: /Open Case Workspace/i }).click();
    await expect(page.getByRole('heading', { name: /Clinical contact/i })).toBeVisible();
    await expect(page.getByText('“My ride was cancelled—and I’m not feeling well today.”')).toBeVisible();
    await expect(page.getByText('Treatment at risk').first()).toBeVisible();
    await page.getByRole('button', { name: /Accept ownership/i }).click();
    await expect(page.getByText('Ownership accepted')).toBeVisible();
    await page.getByRole('button', { name: /Record human disposition/i }).click();
    await page.getByRole('button', { name: /Sarah Jenkins, RN/i }).click();
    await page.getByText(/Care Navigator \(Marcus Vance, MSW\)/i).click();
    await page.getByRole('button', { name: 'Exceptions', exact: true }).click();
    await page.getByRole('button', { name: /Open Case Workspace/i }).click();
    await page.getByRole('button', { name: /Complete current transport plan/i }).click();

    await page.getByRole('button', { name: /Marcus Vance, MSW/i }).click();
    await page.getByText(/Caregiver Portal \(Ana Hernandez\)/i).click();
    await expect(page.getByText(/Current plan v1/i)).toBeVisible();
    const caregiverCopy = (await page.locator('body').innerText()).toLowerCase();
    expect(caregiverCopy).not.toContain('fever 100.4');
    expect(caregiverCopy).not.toContain('tingling in fingers');

    await page.getByRole('button', { name: /Ana Hernandez/i }).click();
    await page.getByText(/Patient Portal \(Camila Lopez\)/i).click();
    await page.getByRole('button', { name: /Review & Confirm Plan/i }).click();
    await page.getByRole('checkbox', { name: /I acknowledge current transportation plan v1/i }).check();
    await page.getByRole('button', { name: /Acknowledge & Confirm Treatment Plan/i }).click();
    await expect(page.getByRole('heading', { name: 'Continuity Plan Confirmed' })).toBeVisible();

    await page.getByRole('button', { name: /Camila Lopez/i }).click();
    await page.getByRole('button', { name: /Care Team \(Readiness Team\)/i }).click();
    await page.getByRole('button', { name: 'Exceptions', exact: true }).click();
    await page.getByRole('button', { name: /Open Case Workspace/i }).click();
    await page.getByRole('tab', { name: /Graph/i }).click();
    await expect(page.getByRole('heading', { name: 'Treatment Readiness Graph' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upcoming Infusion Target Node' }).getByText('CONTINUITY PLAN CONFIRMED')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Prepared Scenario Timeline' })).toBeVisible();
    await expect(page.getByText('Current transport plan v1 acknowledged')).toBeVisible();

    await page.getByTitle(/Reset Workspace/i).click();
    await expect(page.getByRole('heading', { name: /Tomorrow’s treatment.*Every blocker owned/i })).toBeVisible();
  });

  test('reviewed Epic capture stays source-separated and keyboard accessible on desktop and mobile', async ({ page }) => {
    const liveEpicRequests: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).hostname === 'fhir.epic.com') liveEpicRequests.push(request.url());
    });

    await page.getByRole('button', { name: /Access workspace/i }).first().click();
    await page.getByTestId('auth-care-team-card').click();

    const epicTab = page.getByRole('tab', { name: /Epic/i });
    await epicTab.click();
    const epicPanel = page.getByRole('tabpanel', { name: /Epic/i });
    await expect(epicPanel.getByRole('heading', { name: 'Epic Sandbox · Read-only captured data' })).toBeVisible();
    await expect(epicPanel.getByAltText('Epic')).toBeVisible();
    await expect(epicPanel).toContainText('Camila Maria Lopez');
    await expect(epicPanel).toContainText('drospirenone-ethinyl estradiol');
    await expect(epicPanel).toContainText('Captured once · no live sync');
    await expect(epicPanel).not.toContainText('mFOLFOX6');
    const originalCapturedAt = await epicPanel.locator('time').first().getAttribute('datetime');
    expect(originalCapturedAt).toBe('2026-09-22T07:01:25Z');

    const sourceButton = epicPanel.getByRole('button', { name: 'View source details' });
    await sourceButton.click();
    const drawer = page.getByRole('dialog', { name: /Epic source details/i });
    await expect(drawer).toContainText('epic-sandbox-20260922T070125Z-0dac7d6b');
    await expect(drawer).toContainText('Patient/erXuFYUfucBZaryVksYEcMg3');
    await expect(drawer.getByRole('button', { name: /Close Epic source details/i })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden();
    await expect(sourceButton).toBeFocused();

    await page.reload();
    await page.getByRole('tab', { name: /Epic/i }).click();
    await expect(page.getByRole('tabpanel', { name: /Epic/i }).locator('time').first()).toHaveAttribute('datetime', originalCapturedAt!);
    expect(liveEpicRequests).toEqual([]);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('body')).not.toContainText('Epic capture unavailable');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
