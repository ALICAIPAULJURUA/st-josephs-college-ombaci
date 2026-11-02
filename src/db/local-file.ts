import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export async function ensureLocalDatabaseDirectory(url: string) {
  if (!url.startsWith("file:")) return;

  const filePath = url.slice("file:".length);
  if (!filePath || filePath.startsWith(":")) return;

  await mkdir(dirname(resolve(filePath)), { recursive: true });
}
