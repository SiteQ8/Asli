/*
  Offline and weight tests. Run with: node --test

  The project promises two things a person on a weak connection can feel: the
  check works without a connection, and the page is small enough to arrive on a
  bad one. Both are measured here rather than hoped for.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { ROOT, read } from "../tools/lib.mjs";

const docs = (name) => join(ROOT, "docs", name);
const sw = read("docs/sw.js");
const manifest = JSON.parse(read("docs/manifest.webmanifest"));

/* The plan's own number: under 100 KB compressed, usable on a weak connection. */
const BUDGET = 100 * 1024;

function gzipped(files) {
  return files.reduce((total, file) => total + gzipSync(readFileSync(docs(file))).length, 0);
}

function pngSize(file) {
  const bytes = readFileSync(docs(file));
  assert.equal(bytes.slice(1, 4).toString(), "PNG", `${file} is not a png`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

test("every file the worker precaches actually exists", () => {
  const list = sw.match(/const PRECACHE = \[([\s\S]*?)\];/);
  assert.ok(list, "the precache list should be readable");
  const files = [...list[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]).filter((f) => f !== "./");
  assert.ok(files.length >= 15, `expected a full shell, found ${files.length}`);
  for (const file of files) {
    assert.ok(existsSync(docs(file)), `sw.js precaches ${file}, which does not exist`);
  }
});

test("the worker precaches the data the checker needs to answer offline", () => {
  for (const file of ["data/registry.json", "checker.js", "check.html", "check.js", "help.html", "help.js"]) {
    assert.ok(sw.includes(`"${file}"`), `${file} must be available offline`);
  }
});

test("data is served network first so a fresh listing is never held back", () => {
  assert.match(sw, /isData\(url\)/);
  assert.match(sw, /networkFirst/);
  assert.ok(sw.indexOf("async function networkFirst") < sw.indexOf("async function cacheFirst") + sw.length);
});

test("the cache name carries a version, and old versions are cleared", () => {
  const version = sw.match(/const VERSION = "([^"]+)"/);
  assert.ok(version, "the worker needs a versioned cache name");
  assert.match(version[1], /^asli-v\d+\.\d+\.\d+$/);
  assert.ok(sw.includes("caches.delete"), "old caches must be cleared on activate");
});

test("the worker leaves other origins alone", () => {
  assert.ok(sw.includes("url.origin !== self.location.origin"), "third party requests must pass through untouched");
});

test("every page registers the worker and links the manifest", () => {
  for (const page of ["index.html", "check.html", "report.html"]) {
    const html = read("docs/" + page);
    assert.ok(html.includes('href="manifest.webmanifest"'), `${page} does not link the manifest`);
    assert.ok(html.includes('src="offline.js"'), `${page} does not register the worker`);
  }
});

test("the manifest points at icons that exist at the sizes it claims", () => {
  assert.ok(manifest.name && manifest.short_name);
  assert.equal(manifest.dir, "rtl");
  assert.ok(manifest.start_url.includes("check.html"), "the app should open on the check page");
  for (const icon of manifest.icons) {
    assert.ok(existsSync(docs(icon.src)), `${icon.src} is missing`);
    if (!icon.src.endsWith(".png")) continue;
    const [width, height] = icon.sizes.split("x").map(Number);
    const real = pngSize(icon.src);
    assert.equal(real.width, width, `${icon.src} is ${real.width} wide, not ${width}`);
    assert.equal(real.height, height, `${icon.src} is ${real.height} tall, not ${height}`);
  }
  assert.ok(manifest.icons.some((i) => i.purpose === "maskable"), "a maskable icon is needed for Android");
  for (const shortcut of manifest.shortcuts || []) {
    assert.ok(existsSync(docs(shortcut.url.replace("./", ""))), `shortcut ${shortcut.url} goes nowhere`);
  }
});

test("the check page stays under the weight the project promised", () => {
  const weight = gzipped(["check.html", "style.css", "check.css", "checker.js", "check.js", "offline.js", "data/registry.json"]);
  assert.ok(weight < BUDGET, `the check page is ${Math.round(weight / 1024)} KB compressed, over the ${BUDGET / 1024} KB budget`);
});

test("the page for someone already scammed loads fast and works offline", () => {
  const weight = gzipped(["help.html", "style.css", "check.css", "help.js", "offline.js"]);
  assert.ok(weight < BUDGET, `the help page is ${Math.round(weight / 1024)} KB compressed, over the ${BUDGET / 1024} KB budget`);
  const html = read("docs/help.html");
  assert.ok(html.includes('src="offline.js"'), "it must survive a lost connection");
  const js = read("docs/help.js");
  assert.ok(js.includes("moi.gov.kw"), "the reporting number must come from the ministry's own page");
  assert.ok(js.includes("97283939"), "the cybercrime line must be on the page");
  assert.ok(js.includes("tel:+96597283939"), "the number must be tappable on a phone");
});

test("the report page stays under the same budget", () => {
  const weight = gzipped(["report.html", "style.css", "check.css", "checker.js", "redact.js", "report.js", "offline.js", "data/registry.json"]);
  assert.ok(weight < BUDGET, `the report page is ${Math.round(weight / 1024)} KB compressed, over the ${BUDGET / 1024} KB budget`);
});

test("no single shipped file is large enough to hurt a slow connection", () => {
  for (const file of ["style.css", "content.js", "app.js", "checker.js", "check.js", "report.js", "data/registry.json"]) {
    const raw = statSync(docs(file)).size;
    assert.ok(raw < 200 * 1024, `${file} is ${Math.round(raw / 1024)} KB, which is too much to ship as one file`);
  }
});
