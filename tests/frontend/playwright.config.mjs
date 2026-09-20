import {resolve} from "node:path";
import {defineConfig, devices} from "../../frontend/node_modules/@playwright/test/index.mjs";

const port = 5187;

export default defineConfig({
  testDir: ".",
  testMatch: "transport-workspace.spec.mjs",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "on-first-retry",
  },
  projects: [{name: "chromium", use: {...devices["Desktop Chrome"]}}],
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${port}`,
    cwd: resolve(import.meta.dirname, "../../frontend"),
    port,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
