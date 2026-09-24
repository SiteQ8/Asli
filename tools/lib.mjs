/*
  Loads docs/content.js and docs/engine.js exactly as the browser does, so the
  tests and the text builder check the same code that ships on the page.
*/
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export function read(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

export function loadContent() {
  const sandbox = {};
  vm.createContext(sandbox);
  for (const file of ["docs/content.js", "docs/engine.js"]) {
    vm.runInContext(read(file), sandbox, { filename: file });
  }
  /* A JSON round trip gives plain objects from this realm, which keeps deep equality checks honest. */
  const C = JSON.parse(JSON.stringify(sandbox.ASLI));
  return { C, E: sandbox.AsliEngine };
}

/* The one detection engine, loaded the way the browser loads it. */
export function loadChecker() {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(read("docs/checker.js"), sandbox, { filename: "docs/checker.js" });
  return sandbox.AsliChecker;
}
