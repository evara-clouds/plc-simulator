// The files in lib/ use extensionless imports (Next.js resolves those, plain Node does not).
// This copies them to a temp folder with ".js" added to relative imports so the test scripts can import them without a build step.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function loadLib(names) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "plc-lib-"));
  process.on("exit", () => fs.rmSync(tmp, { recursive: true, force: true }));
  fs.writeFileSync(path.join(tmp, "package.json"), '{"type":"module"}');
  for (const n of names) {
    const src = fs.readFileSync(path.join(root, "lib", n + ".js"), "utf8");
    fs.writeFileSync(path.join(tmp, n + ".js"), src.replace(/from "(\.\/[\w]+)"/g, 'from "$1.js"'));
  }
  const out = {};
  for (const n of names) out[n] = await import(pathToFileURL(path.join(tmp, n + ".js")).href);
  return out;
}
