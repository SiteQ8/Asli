/*
  Privacy tests. Run with: node --test

  The site promises that a pasted message never leaves the device. A sentence in
  a notice is a promise; a Content Security Policy is machinery. These make sure
  every page carries the policy, that it allows the site's own origin and the two
  typefaces and nothing else, and that no page script talks to anything but the
  site's own data files.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { ROOT, read } from "../tools/lib.mjs";

const PAGES = ["index.html", "check.html", "report.html", "help.html"];
const FONT_HOSTS = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"];

function policyOf(page) {
  const m = read("docs/" + page).match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
  return m ? m[1] : null;
}

function directive(policy, name) {
  const found = policy.split(";").map((s) => s.trim()).find((s) => s === name || s.startsWith(name + " "));
  return found ? found.slice(name.length).trim().split(/\s+/).filter(Boolean) : null;
}

test("every page carries a Content Security Policy that keeps the message on the device", () => {
  for (const page of PAGES) {
    const policy = policyOf(page);
    assert.ok(policy, `${page} has no Content Security Policy`);
    assert.deepEqual(directive(policy, "default-src"), ["'none'"], `${page}: everything not listed must be refused`);
    assert.deepEqual(directive(policy, "script-src"), ["'self'"], `${page}: only the site's own scripts may run`);
    assert.deepEqual(directive(policy, "connect-src"), ["'self'"], `${page}: a script may only fetch from the site itself`);
    assert.deepEqual(directive(policy, "form-action"), ["'self'"], `${page}: a form may only submit to the site itself`);
    assert.deepEqual(directive(policy, "base-uri"), ["'none'"], `${page}: the base address cannot be changed`);
    assert.deepEqual(directive(policy, "worker-src"), ["'self'"], `${page}: the offline worker is the site's own`);
    for (const source of directive(policy, "style-src")) assert.ok(source === "'self'" || source === FONT_HOSTS[0], `${page}: unexpected style source ${source}`);
    for (const source of directive(policy, "font-src")) assert.ok(source === FONT_HOSTS[1], `${page}: unexpected font source ${source}`);
    for (const source of directive(policy, "img-src")) assert.ok(source === "'self'" || source === "data:", `${page}: unexpected image source ${source}`);
    assert.ok(!policy.includes("unsafe"), `${page}: the policy must not open a loophole`);
  }
});

test("the policy is the same on every page, so no page is the weak one", () => {
  const policies = new Set(PAGES.map(policyOf));
  assert.equal(policies.size, 1);
});

test("no page has an inline script, an inline style or an inline event handler", () => {
  for (const page of PAGES) {
    const html = read("docs/" + page);
    assert.doesNotMatch(html, /<script(?![^>]*\ssrc=)[^>]*>/, `${page} has an inline script`);
    assert.doesNotMatch(html, /\sstyle="/, `${page} has an inline style`);
    assert.doesNotMatch(html, /\son[a-z]+="/, `${page} has an inline event handler`);
  }
});

test("the only outside resources any page loads are the two typefaces", () => {
  for (const page of PAGES) {
    const html = read("docs/" + page);
    for (const m of html.matchAll(/<(link|script|img|iframe|source|video|audio)([^>]*?)(?:href|src)="(https?:[^"]+)"/g)) {
      /* A canonical link names the page's own address for crawlers. Nothing is fetched from it. */
      if (m[1] === "link" && /rel="(canonical|alternate)"/.test(m[2])) continue;
      const origin = new URL(m[3]).origin;
      assert.ok(FONT_HOSTS.includes(origin), `${page} loads ${m[3]}`);
    }
  }
});

test("page scripts fetch only the site's own data files, and nothing else talks to the network", () => {
  const scripts = readdirSync(join(ROOT, "docs")).filter((f) => f.endsWith(".js") && f !== "sw.js");
  assert.ok(scripts.length >= 8, `expected the page scripts, found ${scripts.length}`);
  for (const file of scripts) {
    const js = read("docs/" + file);
    for (const m of js.matchAll(/fetch\(\s*("[^"]*"|'[^']*'|[^,)]+)/g)) {
      assert.match(m[1], /^"data\/[a-z0-9.-]+"$/, `${file} fetches ${m[1]}, which is not one of the site's data files`);
    }
    for (const banned of ["XMLHttpRequest", "sendBeacon", "WebSocket", "EventSource", "new Image(", "importScripts", "import("]) {
      assert.ok(!js.includes(banned), `${file} uses ${banned}`);
    }
  }
});

test("the privacy notice describes the policy the pages enforce", () => {
  const notice = read("PRIVACY.md");
  assert.ok(notice.includes("Content Security Policy"), "the notice should say the promise is enforced by the browser");
  assert.ok(notice.includes("share"), "the notice should cover a message shared in from another app");
});
