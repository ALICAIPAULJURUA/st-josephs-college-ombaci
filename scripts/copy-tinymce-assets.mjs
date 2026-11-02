import { cp, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "node_modules", "tinymce");
const destination = path.join(root, "public", "tinymce");

await mkdir(destination, { recursive: true });
await cp(
  path.join(source, "tinymce.min.js"),
  path.join(destination, "tinymce.min.js"),
);

for (const directory of ["icons", "models", "plugins", "skins", "themes"]) {
  await cp(path.join(source, directory), path.join(destination, directory), {
    recursive: true,
    force: true,
  });
}
