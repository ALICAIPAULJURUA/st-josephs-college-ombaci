import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

export async function ensureLocalDatabaseDirectory(url: string) {
  if (!url.startsWith("pglite:")) return;

  const dataDirectory = url.slice("pglite:".length);
  if (!dataDirectory || dataDirectory === ":memory:") return;

  await mkdir(resolve(dataDirectory), { recursive: true });
}
