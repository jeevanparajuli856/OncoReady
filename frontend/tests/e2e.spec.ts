import { expect, test } from '@playwright/test';

/** Camila reports the cancelled ride, then the Care Navigator opens Transportation with that ride task. */
async function openNavigatorTransportation(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /Access workspace/i }).first().click();
  await page.getByLabel('Email').fill('abcp@oncoready.me');
  await page.getByLabel('Password').fill('1234');
  await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();
  await page.getByRole('button', { name: /Start Readiness Check/i }).click();
  await page.getByRole('button', { name: /Submit Readiness Report/i }).click();
  await page.getByRole('button', { name: /Camila Lopez/ }).first().click();
  await page.getByRole('button', { name: /Care Navigator \(Marcus Vance, MSW\)/ }).click();
  await page.getByRole('button', { name: 'Transportation', exact: true }).first().click();
}

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

  test('mobile workspace navigation keeps 44px targets without horizontal overflow', async ({ page }) => {
    for (const viewport of [
      { width: 320, height: 568 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.evaluate(() => localStorage.clear());
      await page.reload();

      await page.getByRole('button', { name: /Access workspace/i }).first().click();
      await page.getByLabel('Email').fill('abcn@oncoready.me');
      await page.getByLabel('Password').fill('1234');
      await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();

      const dock = page.locator('.staff-sidebar nav');
      await expect(dock).toBeVisible();

      const targets = dock.getByRole('button');
      await expect(targets).toHaveCount(4);
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
      expect(controlBounds).not.toBeNull();

      const focusAndHitTest = await motionControl.evaluate((button) => {
        const bounds = button.getBoundingClientRect();
        const samples = [
          [bounds.left + bounds.width * 0.25, bounds.top + bounds.height * 0.25],
          [bounds.left + bounds.width * 0.75, bounds.top + bounds.height * 0.25],
          [bounds.left + bounds.width / 2, bounds.top + bounds.height / 2],
          [bounds.left + bounds.width * 0.25, bounds.top + bounds.height * 0.75],
          [bounds.left + bounds.width * 0.75, bounds.top + bounds.height * 0.75],
          [bounds.left + bounds.width / 2, bounds.bottom - 1],
        ];

        return {
          isFocused: document.activeElement === button,
          targetOwnsEveryPoint: samples.every(([x, y]) => {
            const hit = document.elementFromPoint(x, y);
            return hit === button || button.contains(hit);
          }),
        };
      });

      expect(focusAndHitTest.isFocused).toBe(true);
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
    await page.getByLabel('Email').fill('abcn@oncoready.me');
    await page.getByLabel('Password').fill('1234');
    await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();
    await expect(page.getByText(/Care Navigator Workspace/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Patient reply has not opened work yet/i })).toBeVisible();

    await page.getByTitle(/Reset Workspace/i).click();
    await expect(page.getByRole('heading', { name: /Tomorrow’s treatment.*Every blocker owned/i })).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Camila Lopez');
  });

  test('care navigator Transportation opens the working CareLink dashboard with truthful provider readiness', async ({ page }) => {
    const uberRequests: string[] = [];
    const consoleErrors: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).hostname.toLowerCase().includes('uber')) uberRequests.push(request.url());
    });
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await openNavigatorTransportation(page);

    await expect(page.getByRole('heading', { name: 'Transportation Workspace' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'CareLink', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Uber Health', exact: true })).toBeVisible();
    await expect(page.getByText('Adapter built · Awaiting connection')).toBeVisible();
    await expect(page.getByRole('img', { name: 'Uber' })).toBeVisible();

    await page.getByRole('button', { name: /Request ride/i }).click();
    await page.getByRole('button', { name: /Assign Crescent Lantern Medical Rides · via CareLink/i }).click();
    await page.getByRole('button', { name: /Record primary unavailable/i }).click();
    await page.getByRole('button', { name: /Select Magnolia Wayfare Transport · via CareLink/i }).click();
    await page.getByRole('button', { name: /Save recovered logistics/i }).click();

    await expect(page.getByText('Crescent Lantern Medical Rides', { exact: true })).toBeVisible();
    await expect(page.getByText('Magnolia Wayfare Transport', { exact: true })).toBeVisible();
    await expect(page.getByText(/Current ride · plan v2/i)).toBeVisible();
    await expect(page.getByText(/Return coordination 1:00–4:00 PM CT/i)).toBeVisible();
    expect((await page.locator('body').innerText()).toLowerCase()).not.toContain('not feeling well');
    expect(uberRequests).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);

    await page.screenshot({ path: 'artifacts/RIDE-001-transport-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.getByRole('heading', { name: 'Transportation Workspace' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
    await page.screenshot({ path: 'artifacts/RIDE-001-transport-mobile.png', fullPage: true });
  });

  test('workspace routes and the complete Camila journey remain connected', async ({ page }) => {
    await page.getByRole('button', { name: /Access workspace/i }).first().click();
    await page.getByLabel('Email').fill('abcp@oncoready.me');
    await page.getByLabel('Password').fill('1234');
    await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();

    await page.getByRole('button', { name: /Start Readiness Check/i }).click();
    await page.getByRole('button', { name: /Submit Readiness Report/i }).click();
    await expect(page.getByText(/Your Reported Barriers are Being Resolved/i)).toBeVisible();
    await page.getByRole('button', { name: /View Care Team Workbench/i }).click();

    const routeChecks = [
      ['Command Center', /Command Center/i],
      ['Exceptions', /Pre-Treatment Exception Queue/i],
      ['Patients', /Patient Directory/i],
      ['Insights', /Operational Insights/i],
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
    await page.getByRole('button', { name: /Request ride/i }).click();
    await page.getByRole('button', { name: /Assign Crescent Lantern Medical Rides · via CareLink/i }).click();
    await page.getByRole('button', { name: /Record primary unavailable/i }).click();
    await page.getByRole('button', { name: /Select Magnolia Wayfare Transport · via CareLink/i }).click();
    await page.getByRole('button', { name: /Save recovered logistics/i }).click();

    await page.getByRole('button', { name: /Marcus Vance, MSW/i }).click();
    await page.getByText(/Caregiver Portal \(Ana Hernandez\)/i).click();
    await expect(page.getByText(/Current plan v2/i)).toBeVisible();
    const caregiverCopy = (await page.locator('body').innerText()).toLowerCase();
    expect(caregiverCopy).not.toContain('fever 100.4');
    expect(caregiverCopy).not.toContain('tingling in fingers');
    await page.getByRole('button', { name: /Mark logistics seen/i }).click();
    await expect(page.getByText(/Seen by Ana Hernandez for plan v2/i)).toBeVisible();

    await page.getByRole('button', { name: /Ana Hernandez/i }).click();
    await page.getByText(/Patient Portal \(Camila Lopez\)/i).click();
    await page.getByRole('button', { name: /Review & Confirm Plan/i }).click();
    await page.getByRole('checkbox', { name: /I acknowledge current transportation plan v2/i }).check();
    await page.getByRole('button', { name: /Acknowledge current plan v2/i }).click();
    await expect(page.getByRole('heading', { name: 'Continuity Plan Confirmed' })).toBeVisible();

    await page.getByRole('button', { name: /Camila Lopez/i }).click();
    await page.getByRole('button', { name: /Care Team \(Readiness Team\)/i }).click();
    await page.getByRole('button', { name: 'Exceptions', exact: true }).click();
    await page.getByRole('button', { name: /Open Case Workspace/i }).click();
    await page.getByRole('tab', { name: /Graph/i }).click();
    await expect(page.getByRole('heading', { name: 'Treatment Readiness Graph' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upcoming Infusion Target Node' }).getByText('CONTINUITY PLAN CONFIRMED')).toBeVisible();
    const receipt = page.getByRole('region', { name: 'Continuity plan receipt' });
    await expect(receipt.getByText('3 of 3 recorded')).toBeVisible();
    await receipt.getByRole('button', { name: 'Open timeline evidence' }).nth(1).click();
    await expect(receipt.getByText('EVT-RIDE-RECOVERED-V2', { exact: false })).toBeVisible();
    await receipt.getByRole('link', { name: 'Jump to timeline' }).click();
    await expect(page.locator('#timeline-EVT-RIDE-RECOVERED-V2')).toBeInViewport();
    await expect(page.getByRole('heading', { name: 'Care timeline' })).toBeVisible();
    await expect(page.getByText('Current transport plan v2 acknowledged')).toBeVisible();

    await page.getByTitle(/Reset Workspace/i).click();
    await expect(page.getByRole('heading', { name: /Tomorrow’s treatment.*Every blocker owned/i })).toBeVisible();
  });

  test('staff roles keep shared sections and reset unavailable sections to Command Center', async ({ page }) => {
    await page.setViewportSize({ width: 1470, height: 800 });
    await page.getByRole('button', { name: /Access workspace/i }).first().click();
    await page.getByLabel('Email').fill('abcn@oncoready.me');
    await page.getByLabel('Password').fill('1234');
    await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();

    const nav = page.locator('.staff-sidebar');
    await expect(nav.getByRole('button', { name: 'Appointments' })).toHaveCount(0);
    await nav.getByRole('button', { name: 'Transportation' }).click();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.getByRole('button', { name: /Marcus Vance, MSW/i }).click();
    await page.getByText(/Care Team \(Readiness Team\)/i).click();
    await expect(page).toHaveURL(/\/care-team$/);
    await expect(page.getByRole('heading', { name: 'Command Center' }).first()).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Command Center' })).toHaveCSS('background-color', 'rgb(79, 70, 229)');
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await expect(nav.getByRole('button', { name: 'Epic context' })).toHaveCount(0);
    await expect(nav.getByRole('button', { name: 'Admin' })).toHaveCount(0);
    await page.screenshot({ path: 'artifacts/NAV-001-care-team-after.png' });

    await nav.getByRole('button', { name: 'Insights' }).click();
    await page.getByRole('button', { name: /Sarah Jenkins, RN/i }).click();
    await page.getByText(/Care Navigator \(Marcus Vance, MSW\)/i).click();
    await expect(page).toHaveURL(/\/care-navigator$/);
    await expect(page.getByRole('heading', { name: 'Command Center' }).first()).toBeVisible();
    await page.screenshot({ path: 'artifacts/NAV-001-care-navigator-after.png' });

    await nav.getByRole('button', { name: 'Exceptions' }).click();
    await page.getByRole('button', { name: /Marcus Vance, MSW/i }).click();
    await page.getByText(/Care Team \(Readiness Team\)/i).click();
    await expect(page.getByRole('heading', { name: 'Exceptions' }).first()).toBeVisible();
  });

  test('reviewed Epic capture stays source-separated and keyboard accessible on desktop and mobile', async ({ page }) => {
    const liveEpicRequests: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).hostname === 'fhir.epic.com') liveEpicRequests.push(request.url());
    });

    await page.getByRole('button', { name: /Access workspace/i }).first().click();
    await page.getByLabel('Email').fill('abcs@oncoready.me');
    await page.getByLabel('Password').fill('1234');
    await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();

    const epicTab = page.getByRole('tab', { name: /Epic/i });
    await epicTab.click();
    const epicPanel = page.getByRole('tabpanel', { name: /Epic/i });
    await expect(epicPanel.getByRole('heading', { name: 'Epic FHIR R4 record · read-only' })).toBeVisible();
    await expect(epicPanel.getByAltText('Epic')).toBeVisible();
    await expect(epicPanel).toContainText('Camila Maria Lopez');
    await expect(epicPanel).toContainText('drospirenone-ethinyl estradiol');
    await expect(epicPanel).toContainText('Connected to Hospital Epic Sandbox');
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

  test('CareLink vendor tab and Transportation tab stay in sync', async ({ page, context }) => {
    const uberRequests: string[] = [];
    context.on('request', (request) => {
      if (new URL(request.url()).hostname.includes('uber')) uberRequests.push(request.url());
    });

    await openNavigatorTransportation(page);
    await expect(page.getByRole('heading', { name: 'Transportation Workspace' })).toBeVisible();

    const vendor = await context.newPage();
    await vendor.goto('/carelink');
    await expect(vendor).toHaveURL(/\/login$/);
    await vendor.getByLabel('Email').fill('abct@oncoready.me');
    await vendor.getByLabel('Password').fill('1234');
    await vendor.getByRole('button', { name: 'Sign in', exact: true }).last().click();
    await expect(vendor).toHaveURL(/\/carelink$/);
    await expect(vendor.getByRole('heading', { name: 'No open trips' })).toBeVisible();
    await expect(vendor).toHaveTitle('CareLink by OncoReady · Trip board');
    await expect(vendor.locator('.workspace-header')).toHaveCount(0);
    await expect(vendor.locator('.app-footer')).toHaveCount(0);
    await expect(vendor.getByRole('img', { name: 'CareLink by OncoReady' }).first()).toBeVisible();
    await expect(vendor.getByText('Colorectal')).toHaveCount(0);

    await page.getByRole('button', { name: /Request ride/i }).click();
    await page.getByRole('button', { name: /Assign Crescent Lantern Medical Rides · via CareLink/i }).click();
    await expect(page.getByText('Waiting for Crescent Lantern Medical Rides to accept in CareLink')).toBeVisible();

    await expect(vendor.getByText('New trip offer')).toBeVisible();
    await vendor.getByRole('button', { name: 'Accept trip' }).click();
    await expect(page.getByText('Accepted in CareLink', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Transportation Workspace' })).toBeVisible();

    await vendor.screenshot({ path: 'artifacts/RIDE-002-carelink-desktop.png', fullPage: true });
    await vendor.setViewportSize({ width: 375, height: 812 });
    expect(await vendor.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
    await vendor.screenshot({ path: 'artifacts/RIDE-002-carelink-mobile.png', fullPage: true });
    await vendor.setViewportSize({ width: 1280, height: 900 });

    await vendor.getByRole('button', { name: 'Report unavailable' }).click();
    await vendor.getByLabel('What changed?').selectOption('Vehicle out of service');
    await vendor.getByRole('button', { name: 'Report unavailable' }).click();
    await expect(vendor.getByText('Released', { exact: true })).toBeVisible();

    await expect(page.getByText('Ride status: Primary unavailable')).toBeVisible();
    await expect(page.getByRole('button', { name: /Select Magnolia Wayfare Transport · via CareLink/i })).toBeVisible();
    await page.getByRole('button', { name: 'Play previous trip' }).click();
    await expect(page.getByText('Replay complete · Completed')).toBeVisible({ timeout: 15000 });
    await page.getByRole('heading', { name: 'Previous trip' }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: 'artifacts/RIDE-002-transport-route.png', fullPage: true });
    expect(uberRequests).toHaveLength(0);
  });

  test('CareLink launches from the workspace menu as its own sub-brand page and switches back', async ({ page }) => {
    await page.getByRole('button', { name: /Access workspace/i }).first().click();
    await page.getByLabel('Email').fill('abcn@oncoready.me');
    await page.getByLabel('Password').fill('1234');
    await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();
    await expect(page.locator('.workspace-header')).toBeVisible();

    await page.getByRole('button', { name: /Marcus Vance, MSW/ }).click();
    await page.getByRole('button', { name: /CareLink by OncoReady \(Crescent Lantern Medical Rides\)/ }).click();
    await expect(page).toHaveURL(/\/carelink$/);
    await expect(page).toHaveTitle('CareLink by OncoReady · Trip board');
    await expect(page.locator('.workspace-header')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: "Today's trips" })).toBeVisible();

    await page.getByRole('button', { name: /Switch workspace/ }).click();
    await page.getByRole('button', { name: /Care Navigator \(Marcus Vance, MSW\)/ }).click();
    await expect(page).toHaveURL(/\/care-navigator$/);
    await expect(page.locator('.workspace-header')).toBeVisible();
    await expect(page).not.toHaveTitle(/CareLink/);
  });
});

test('presenter rehearsal follows the prepared story without live delivery', async ({ page }) => {
  test.setTimeout(60000);
  const consoleErrors: string[] = [];
  const providerPosts: string[] = [];
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/operator/outreach/')) providerPosts.push(request.url());
  });
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: /Access workspace/i }).first().click();
  await page.getByLabel('Email').fill('abcs@oncoready.me');
  await page.getByLabel('Password').fill('1234');
  await page.getByRole('button', { name: 'Sign in', exact: true }).last().click();

  await page.getByRole('tab', { name: 'Graph' }).click();
  await expect(page.getByText('Treatment at risk').first()).toBeVisible();
  await page.getByRole('button', { name: 'Open message thread' }).first().click();
  await expect(page.getByText('Message history')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Continuity plan receipt' }).getByText('0 of 3 recorded')).toBeVisible();

  await page.getByRole('tab', { name: 'Epic' }).click();
  await page.getByRole('button', { name: 'View source details' }).click();
  await expect(page.getByRole('dialog', { name: /Epic source details/i })).toContainText('Epic FHIR Sandbox');
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'Insights' }).click();
  await page.getByRole('button', { name: 'Why flagged at T-1?' }).click();
  await page.getByRole('button', { name: /Transportation available · model score/i }).click();
  await expect(page.getByText(/Comparison only: transportation availability/i)).toBeVisible();

  await page.getByRole('button', { name: /Sarah Jenkins, RN/i }).click();
  await page.getByText(/Patient Portal \(Camila Lopez\)/i).click();
  await page.getByRole('button', { name: /Start Readiness Check/i }).click();
  await page.getByRole('button', { name: /Submit Readiness Report/i }).click();
  await page.getByRole('button', { name: /View Care Team Workbench/i }).click();
  await page.getByRole('button', { name: /Accept ownership/i }).click();
  await page.getByRole('button', { name: /Record human disposition/i }).click();

  await page.getByRole('button', { name: /Sarah Jenkins, RN/i }).click();
  await page.getByText(/Care Navigator \(Marcus Vance, MSW\)/i).click();
  await page.getByRole('button', { name: 'Play previous trip' }).click();
  await expect(page.getByText('Requested', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pause previous trip' }).click();
  await page.getByRole('button', { name: 'Restart previous trip' }).click();
  await expect(page.getByText('Completed', { exact: true })).toBeVisible({ timeout: 8000 });
  await page.getByRole('button', { name: 'Exit previous trip' }).click();

  await page.getByRole('button', { name: /Request ride/i }).click();
  await page.getByRole('button', { name: /Assign Crescent Lantern Medical Rides · via CareLink/i }).click();
  await page.getByRole('button', { name: /Record primary unavailable/i }).click();
  await page.getByRole('button', { name: /Select Magnolia Wayfare Transport · via CareLink/i }).click();
  await page.getByRole('button', { name: /Save recovered logistics/i }).click();
  await page.getByRole('button', { name: /Marcus Vance, MSW/i }).click();
  await page.getByText(/Caregiver Portal \(Ana Hernandez\)/i).click();
  await page.getByRole('button', { name: /Mark logistics seen/i }).click();
  await page.getByRole('button', { name: /Ana Hernandez/i }).click();
  await page.getByText(/Patient Portal \(Camila Lopez\)/i).click();
  await page.getByRole('button', { name: /Review & Confirm Plan/i }).click();
  await page.getByRole('checkbox', { name: /I acknowledge current transportation plan v2/i }).check();
  await page.getByRole('button', { name: /Acknowledge current plan v2/i }).click();
  await expect(page.getByRole('heading', { name: 'Continuity Plan Confirmed' })).toBeVisible();
  await page.getByRole('button', { name: /Camila Lopez/i }).click();
  await page.getByText(/Care Team \(Readiness Team\)/i).click();
  await page.getByRole('tab', { name: 'Graph' }).click();
  const receipt = page.getByRole('region', { name: 'Continuity plan receipt' });
  await expect(receipt.getByText('3 of 3 recorded')).toBeVisible();
  await receipt.getByRole('button', { name: 'Open timeline evidence' }).last().click();
  await expect(receipt.getByText('EVT-FLOW-PATIENT-ACK-V2', { exact: false })).toBeVisible();
  expect(providerPosts).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
