import {execFileSync} from "node:child_process";
import {readdirSync, readFileSync, statSync} from "node:fs";
import {resolve} from "node:path";
import assert from "node:assert/strict";

const root = resolve(import.meta.dirname, "../..");
const frontend = resolve(root, "frontend");
const sentinel = "must-not-enter-browser-bundle-7b596d5e";
const publicOrigin = "https://api-independent-test.up.railway.app";

execFileSync("npm", ["run", "build"], {
  cwd: frontend,
  stdio: "inherit",
  env: {
    ...process.env,
    VITE_API_BASE_URL: publicOrigin,
    ONCOREADY_OPERATOR_TOKEN: sentinel,
    ONCOREADY_SCENARIO_TOKEN: sentinel,
    DATABASE_URL: `postgres://tester:${sentinel}@private.invalid/railway`,
    CRON_SECRET: sentinel,
    TWILIO_AUTH_TOKEN: sentinel,
    ELEVENLABS_API_KEY: sentinel,
    ELEVENLABS_WEBHOOK_SECRET: sentinel,
  },
});

const files = [];
const walk = (directory) => {
  for (const entry of readdirSync(directory)) {
    const path = resolve(directory, entry);
    if (statSync(path).isDirectory()) walk(path);
    else files.push(path);
  }
};
walk(resolve(frontend, "dist"));

const bundle = files.map((path) => readFileSync(path)).join("\n");
assert.match(bundle, new RegExp(publicOrigin.replaceAll(".", "\\.")), "the public API origin should be embedded");
assert.ok(!bundle.includes(sentinel), "server-only secret values must not enter the frontend bundle");
for (const name of [
  "ONCOREADY_OPERATOR_TOKEN",
  "ONCOREADY_SCENARIO_TOKEN",
  "DATABASE_URL",
  "CRON_SECRET",
  "TWILIO_AUTH_TOKEN",
  "ELEVENLABS_API_KEY",
  "ELEVENLABS_WEBHOOK_SECRET",
]) {
  assert.ok(!bundle.includes(name), `${name} must not enter the frontend bundle`);
}
assert.equal(files.some((path) => path.endsWith(".map")), false, "production source maps must remain disabled");
console.log(`[OK] inspected ${files.length} production files; only the public API origin was embedded`);
