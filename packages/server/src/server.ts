import {createServer, type IncomingMessage, type ServerResponse} from "node:http";
import {WorkflowApplication} from "./application.js";
import {assertRuntimeConfig, loadConfig} from "./config.js";
import {createHttpHandler} from "./http.js";
import {PostgresWorkflowRepository} from "./postgres-repository.js";
import {createScheduler} from "./scheduler.js";

const MAX_REQUEST_BYTES = 300 * 1024;

async function requestBody(request: IncomingMessage): Promise<Uint8Array | undefined> {
  if (request.method === "GET" || request.method === "HEAD") return undefined;
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.byteLength;
    if (size > MAX_REQUEST_BYTES) throw new Error("payload_too_large");
    chunks.push(buffer);
  }
  return new Uint8Array(Buffer.concat(chunks));
}

function requestHeaders(request: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) value.forEach((entry) => headers.append(name, entry));
    else if (value !== undefined) headers.set(name, value);
  }
  return headers;
}

async function writeResponse(response: ServerResponse, result: Response): Promise<void> {
  response.statusCode = result.status;
  result.headers.forEach((value, name) => response.setHeader(name, value));
  response.end(Buffer.from(await result.arrayBuffer()));
}

const config = loadConfig();
assertRuntimeConfig(config);
const repository = new PostgresWorkflowRepository(config.databaseUrl);
const application = new WorkflowApplication(repository, config);
const handler = createHttpHandler(repository, config);
const log = (level: "info" | "error", event: string, detail: Record<string, unknown> = {}) => {
  const line = JSON.stringify({level, event, ...detail});
  if (level === "error") console.error(line); else console.log(line);
};
const scheduler = createScheduler(application, config.scheduler, log);

const server = createServer(async (incoming, outgoing) => {
  try {
    const body = await requestBody(incoming);
    const url = new URL(incoming.url ?? "/", config.publicOrigin);
    const init: RequestInit = {headers: requestHeaders(incoming)};
    if (incoming.method) init.method = incoming.method;
    if (body) {
      const copy = new Uint8Array(body.byteLength);
      copy.set(body);
      init.body = copy.buffer;
    }
    const request = new Request(url, init);
    await writeResponse(outgoing, await handler(request));
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === "payload_too_large";
    outgoing.statusCode = tooLarge ? 413 : 500;
    outgoing.setHeader("content-type", "application/json; charset=utf-8");
    outgoing.end(JSON.stringify({status: outgoing.statusCode, code: tooLarge ? "payload_too_large" : "internal_error"}));
  }
});

server.listen(config.port, config.host, () => {
  log("info", "server_started", {host: config.host, port: config.port, scheduler_enabled: config.scheduler.enabled});
  scheduler.start();
});

let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  log("info", "server_stopping", {signal});
  await scheduler.stop();
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await repository.close();
  log("info", "server_stopped");
}

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.once(signal, () => {
    void shutdown(signal).catch(() => {
      process.exitCode = 1;
    });
  });
}
