// Copies the Monaco editor's prebuilt files into public/monaco/vs so the
// snippet editor loads them from this site instead of a CDN (office firewalls
// often block CDNs). Runs after `npm install` (so it happens whatever build
// command the host uses) and again before `next dev` and `next build`; the
// copy is git-ignored. With --if-present a missing package is only a warning.
import { cpSync, existsSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "public", "monaco", "vs");
const optional = process.argv.includes("--if-present");

let source = null;
try {
  source = join(dirname(require.resolve("monaco-editor/package.json")), "min", "vs");
} catch {
  source = null;
}

if (!source || !existsSync(source)) {
  const message = "copy-monaco: monaco-editor/min/vs not found. Is monaco-editor installed?";
  if (optional) {
    console.warn(message);
    process.exit(0);
  }
  console.error(message);
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
console.log("copy-monaco: editor files copied to public/monaco/vs");
