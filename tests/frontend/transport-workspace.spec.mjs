import {expect, test} from "../../frontend/node_modules/@playwright/test/index.mjs";

const window = {
  starts_at: "2026-09-24T13:15:00.000Z",
  ends_at: "2026-09-24T13:45:00.000Z",
};

const projection = {
  scenario_id: "11111111-1111-4111-8111-111111111111",
  scenario_version: 4,
  role: "transport_coordinator",
  as_of: "2026-09-20T18:00:00.000Z",
  treatment: {
    treatment_id: "22222222-2222-4222-8222-222222222222",
    starts_at: "2026-09-24T14:00:00.000Z",
    arrival_window: window,
    location_display_name: "Benson Cancer Center",
    transport_notice_cutoff: "2026-09-22T17:00:00.000Z",
  },
  readiness_status: "action_in_progress",
  request: {
    transport_request_id: "44444444-4444-4444-8444-444444444444",
    aggregate_version: 3,
    status: "accepted",
    arrival_window: window,
    notice_cutoff: "2026-09-22T17:00:00.000Z",
    funding_path: "pilot_sponsored",
    service_area: "New Orleans pilot service area",
    mobility: {wheelchair: false, transfer_assistance: false, escort_required: false, notes: null},
    outbound_plan: {location_alias: "maria_home", window, duration_uncertain: false},
    return_plan: {location_alias: "benson_cancer_center", window, duration_uncertain: true},
    notification_permission: true,
    contact_alias: "finals_allowlisted_phone",
    acknowledgment_status: "not_requested",
    driver_alias: null,
    vehicle_description: null,
    reconciliation: {
      state: "not_required",
      last_attempt_at: null,
      attempt_reference: null,
      provenance: "none",
      permitted_recovery: "none",
    },
  },
};

test("transport role reaches its minimized responsive workspace without browser credentials", async ({page}) => {
  const apiRequests = [];
  await page.route("**/api/v1/scenarios/finals?role=*", async (route) => {
    apiRequests.push(route.request());
    await route.fulfill({contentType: "application/json", body: JSON.stringify(projection)});
  });

  await page.setViewportSize({width: 390, height: 844});
  await page.goto("/access");
  await page.getByRole("button", {name: /Continue with Email/i}).click();

  await expect(page).toHaveURL(/\/transport$/);
  await expect(page.getByRole("heading", {name: "CareLink transportation operations"})).toBeVisible();
  await expect(page.getByRole("heading", {name: "One active fulfillment path"})).toBeVisible();
  await expect(page.getByText("Uber Health")).toBeVisible();
  await expect(page.getByText("Lyft Concierge")).toBeVisible();
  await expect(page.getByText("Disabled")).toHaveCount(2);
  await expect(page.getByRole("button", {name: "Assign allowlisted driver"})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  expect(apiRequests).toHaveLength(1);
  expect(new URL(apiRequests[0].url()).searchParams.get("role")).toBe("transport_coordinator");
  const headers = await apiRequests[0].allHeaders();
  for (const forbidden of ["authorization", "x-oncoready-operator-token", "x-finals-scenario-token"]) {
    expect(headers[forbidden]).toBeUndefined();
  }
});
