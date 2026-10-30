#!/usr/bin/env node
/*
  Stamps the shared header and footer into every page.

    node tools/build-shell.mjs          writes the pages
    node tools/build-shell.mjs --check  fails if any page differs from the shell

  The header and footer are written once, in tools/shell/, and copied between
  the markers <!-- shell:header --> and <!-- /shell:header --> (and the same
  for footer) in each docs/*.html page. A page cannot drift from the others,
  and a new page only needs the two empty markers.
*/
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./lib.mjs";

const DOCS = join(ROOT, "docs");
const PARTS = ["header", "footer"];

export function shellPart(name) {
  return readFileSync(join(ROOT, "tools/shell", name + ".html"), "utf8").trimEnd();
}

export function pages() {
  return readdirSync(DOCS).filter((f) => f.endsWith(".html")).sort();
}

export function stamp(html, file) {
  let out = html;
  for (const part of PARTS) {
    const open = `<!-- shell:${part} -->`;
    const close = `<!-- /shell:${part} -->`;
    const a = out.indexOf(open);
    const b = out.indexOf(close);
    if (a < 0 || b < 0 || b < a) throw new Error(`${file} is missing the ${part} markers`);
    out = out.slice(0, a + open.length) + "\n" + shellPart(part) + "\n" + out.slice(b);
  }
  return out;
}

function main() {
  const check = process.argv.includes("--check");
  let stale = 0;
  for (const file of pages()) {
    const path = join(DOCS, file);
    const current = readFileSync(path, "utf8");
    const next = stamp(current, file);
    if (next === current) continue;
    if (check) {
      console.error(`docs/${file} differs from the shared shell. Run: node tools/build-shell.mjs`);
      stale++;
    } else {
      writeFileSync(path, next);
      console.log(`stamped docs/${file}`);
    }
  }
  if (stale) process.exit(1);
  if (!check) console.log("shell is current on every page");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
