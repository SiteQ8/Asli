#!/usr/bin/env node
/*
  Checks that every external link the site cites is still reachable.
  Run before publishing a change to the evidence: node tools/check-links.mjs
  Kept out of the test suite on purpose, because tests must pass offline.
*/
import { loadContent } from "./lib.mjs";
import { readRegistry } from "./build-data.mjs";

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function collect() {
  const { C } = loadContent();
  const urls = new Set([C.site, C.repo]);
  C.evidence.forEach((e) => urls.add(e.url));
  C.trust.forEach((t) => t.url && urls.add(t.url));
  readRegistry().forEach((b) => {
    (b.policies || []).forEach((p) => urls.add(p.source));
    (b.hotlines || []).forEach((h) => urls.add(h.source));
  });
  C.reuse.forEach((r) => urls.add(`https://github.com/SiteQ8/${r.repo}`));
  return [...urls];
}

async function hit(url, method) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml,*/*" }
    });
    return res.status;
  } finally {
    clearTimeout(timer);
  }
}

async function check(url) {
  try {
    let status = await hit(url, "HEAD");
    if (status === 403 || status === 405 || status === 404) status = await hit(url, "GET");
    return { url, status, ok: status >= 200 && status < 400 };
  } catch (error) {
    return { url, status: String(error.message || error), ok: false };
  }
}

const results = [];
for (const url of collect()) {
  const result = await check(url);
  results.push(result);
  console.log(`${result.ok ? "ok  " : "FAIL"} ${result.status}\t${url}`);
}

const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length - bad.length} of ${results.length} links reachable`);
if (bad.length) process.exit(1);
