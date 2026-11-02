import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { rm } from "node:fs/promises";

import globalSetup, { cleanupE2EDatabase } from "./global-setup";

await globalSetup();

const server = spawn(
  process.execPath,
  [
    "--import",
    pathToFileURL(resolve("tests/e2e/mock-turnstile.mjs")).href,
    resolve("node_modules/next/dist/bin/next"),
    "dev",
    "--port",
    "3187",
  ],
  { env: process.env, stdio: "inherit" },
);

let stopping = false;

function stopServer() {
  stopping = true;
  if (!server.killed) server.kill();
}

process.on("SIGINT", stopServer);
process.on("SIGTERM", stopServer);

try {
  process.exitCode = await new Promise<number>((resolveExit, reject) => {
    server.once("error", reject);
    server.once("exit", (code) => resolveExit(code ?? (stopping ? 0 : 1)));
  });
} finally {
  await cleanupE2EDatabase();
  const privateDirectory = process.env.E2E_PRIVATE_STORAGE_DIR;
  if (
    privateDirectory &&
    /^\.\/data\/private-applications-e2e-[0-9a-f-]{36}$/.test(
      privateDirectory,
    )
  ) {
    await rm(resolve(privateDirectory), { recursive: true, force: true });
  }
}
