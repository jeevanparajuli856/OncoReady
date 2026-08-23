import { test, expect } from '@playwright/test';

test.describe('OncoReady Treatment Readiness Golden Path E2E', () => {
  test('Complete end-to-end journey from screening to dual-task dispatch, caregiver privacy, and plan confirmation', async ({ page }) => {
    // 1. Visit Patient Treatment Home
    await page.goto('/');
    await expect(page).toHaveTitle(/OncoReady/);
    
    // Check initial patient hero elements
    await expect(page.locator('text=Upcoming Infusion: FOLFOX6 + Bevacizumab')).toBeVisible();
    await expect(page.locator('text=Time Proximity')).toBeVisible();
    await expect(page.locator('text=Complete Your Pre-Infusion Readiness Check')).toBeVisible();

    // 2. Open Readiness Check Modal
    const startBtn = page.getByRole('button', { name: /Start Readiness Check/i });
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // Verify modal is open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('text=2-Minute Pre-Infusion Readiness Check')).toBeVisible();

    // Submit readiness report (defaults to cancelled ride + symptoms)
    const submitBtn = page.getByRole('button', { name: /Submit Readiness Report/i });
    await submitBtn.click();

    // Verify modal closes and patient view updates
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.locator('text=Your Reported Barriers are Being Resolved')).toBeVisible();

    // 3. Switch to Staff Exception Queue
    const staffNavBtn = page.getByRole('button', { name: /Staff Exception Queue/i });
    await staffNavBtn.click();

    // Verify Maria's exception card is present
    await expect(page.locator('text=Pre-Treatment Exception Queue')).toBeVisible();
    await expect(page.locator('text=Maria Hernandez').first()).toBeVisible();

    // Open Case Workspace
    const openCaseBtn = page.getByRole('button', { name: /Open Case Workspace/i });
    await openCaseBtn.click();

    // Verify Workspace & Dual-Task Action Panels
    await expect(page.locator('text=Task 1: Clinical Symptom Review')).toBeVisible();
    await expect(page.locator('text=Task 2: Transportation Navigation')).toBeVisible();
    await expect(page.locator('text=Treatment Readiness Graph')).toBeVisible();

    // 4. Staff Action 1: Acknowledge Clinical Concern (Nurse Sarah)
    const ackClinicalBtn = page.getByRole('button', { name: /Acknowledge Concern & Authorize Pre-Med Labs/i });
    await expect(ackClinicalBtn).toBeVisible();
    await ackClinicalBtn.click();
    await expect(page.locator('text=Clinical Review & Disposition Recorded')).toBeVisible();

    // 5. Staff Action 2: Confirm Transportation Dispatch (Navigator Marcus)
    const confirmTransportBtn = page.getByRole('button', { name: /Confirm & Dispatch Med-Van/i });
    await expect(confirmTransportBtn).toBeVisible();
    await confirmTransportBtn.click();
    await expect(page.locator('text=Transportation Coordination Confirmed')).toBeVisible();

    // 6. Caregiver Perspective & Strict Privacy Check
    const caregiverNavBtn = page.getByRole('button', { name: /Caregiver \(Ana\)/i });
    await caregiverNavBtn.click();

    await expect(page.locator('text=Caregiver Portal • Ana Hernandez')).toBeVisible();
    await expect(page.locator('text=Ride Confirmed')).toBeVisible();
    await expect(page.locator('text=Ochsner Med-Van #402')).toBeVisible();
    await expect(page.locator('text=Patient Privacy Boundary Enforced')).toBeVisible();

    // Strict assertion: Clinical symptoms MUST NOT exist in caregiver DOM
    const bodyText = await page.innerText('body');
    expect(bodyText.toLowerCase()).not.toContain('fever 100.4');
    expect(bodyText.toLowerCase()).not.toContain('tingling in fingers');
    expect(bodyText.toLowerCase()).not.toContain('peripheral neuropathy');

    // 7. Return to Patient Perspective & Acknowledge Updated Plan
    const patientNavBtn = page.getByRole('button', { name: /Patient \(Maria\)/i });
    await patientNavBtn.click();

    await expect(page.locator('text=Your Updated Treatment Plan is Ready for Review')).toBeVisible();
    const reviewPlanBtn = page.getByRole('button', { name: /Review & Confirm Plan/i });
    await reviewPlanBtn.click();

    // Patient Resolution View
    await expect(page.locator('text=Review Updated Treatment Plan')).toBeVisible();
    await expect(page.locator('text=Clinical Symptom Clearance & Advice')).toBeVisible();
    await expect(page.locator('text=Confirmed Transportation Schedule')).toBeVisible();

    // Check agreement and confirm
    const agreeCheckbox = page.locator('#agree-checkbox');
    await agreeCheckbox.check();

    const finalizePlanBtn = page.getByRole('button', { name: /Acknowledge & Confirm Treatment Plan/i });
    await finalizePlanBtn.click();

    // Verify Plan Confirmed Victory State
    await expect(page.locator('text=Everything is Set for Tomorrow Morning!')).toBeVisible();
    await expect(page.locator('text=Treatment Plan Confirmed').first()).toBeVisible();

    // 8. System Overview & Timeline
    const systemNavBtn = page.getByRole('button', { name: /Readiness Graph & Audit/i });
    await systemNavBtn.click();

    await expect(page.locator('text=PLAN CONFIRMED & READY')).toBeVisible();
    await expect(page.locator('text=Append-Only Causal Event Timeline')).toBeVisible();
    await expect(page.locator('text=Treatment Plan Acknowledged by Patient')).toBeVisible();

    // 9. Reset Journey
    const resetBtn = page.getByRole('button', { name: /Reset Journey/i });
    await resetBtn.click();

    // Verify application resets back to initial state
    await patientNavBtn.click();
    await expect(page.locator('text=Complete Your Pre-Infusion Readiness Check')).toBeVisible();
  });
});
