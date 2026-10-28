// Copies the Monaco editor's prebuilt files into public/monaco/vs so the
// snippet editor loads them from this site instead of a CDN (office firewalls
// often block CDNs). Runs before `next dev` and `next build`; the copy is
// git-ignored.
import { cpSync, existsSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(dirname(require.resolve("monaco-editor/package.json")), "min", "vs");
const target = join(root, "public", "monaco", "vs");

if (!existsSync(source)) {
  console.error(`copy-monaco: ${source} not found. Is monaco-editor installed?`);
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
console.log("copy-monaco: editor files copied to public/monaco/vs");
