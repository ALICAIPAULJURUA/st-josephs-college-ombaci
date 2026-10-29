import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("src");
const extensions = new Set([".ts", ".tsx", ".mdx", ".json"]);
const ignoredFiles = new Set(["Placeholder.tsx"]);

async function collect(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collect(fullPath)));
    } else if (
      extensions.has(path.extname(entry.name)) &&
      !ignoredFiles.has(entry.name)
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

const pattern = /\[Placeholder\b/g;
const hits = [];

for (const file of await collect(root)) {
  const text = await readFile(file, "utf8");

  for (const match of text.matchAll(pattern)) {
    const line = text.slice(0, match.index).split(/\r?\n/).length;
    hits.push(`${path.relative(process.cwd(), file)}:${line}`);
  }
}

if (hits.length > 0) {
  console.error("Placeholders found:");
  for (const hit of hits) console.error(`- ${hit}`);
  process.exit(1);
}

console.log("No placeholders found.");
