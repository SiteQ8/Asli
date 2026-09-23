#!/usr/bin/env node
/*
  Renders tools/og.html to docs/og.png at 1200x630.
  Needs a local checkout with a headless browser available:
  node tools/render-og.mjs
*/
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { ROOT } from "./lib.mjs";

const OUT = join(ROOT, "docs/og.png");

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(ROOT, "tools/og.html")).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
await page.screenshot({ path: OUT });
await browser.close();
console.log(`wrote ${OUT}`);
