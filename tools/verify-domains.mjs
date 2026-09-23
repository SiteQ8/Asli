#!/usr/bin/env node
/*
  Checks that every domain in the registry still resolves and answers over HTTPS.

  node tools/verify-domains.mjs
  node tools/verify-domains.mjs --report report.md

  A domain that stops answering is not deleted. It is reported, because a
  disappearing official domain is itself worth knowing about: it can be a
  migration, an outage, or a name about to be picked up by somebody else.
*/
import { writeFileSync } from "node:fs";
import { lookup } from "node:dns/promises";
import { readRegistry } from "./build-data.mjs";

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function reach(host) {
  try {
    await lookup(host);
  } catch {
    return { host, ok: false, how: "does not resolve" };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch("https://" + host + "/", {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": UA }
    });
    /* Bot protection answers 403 or 503. The host is alive, which is the point. */
    return { host, ok: true, how: "answers over https with " + res.status };
  } catch (error) {
    return { host, ok: false, how: "resolves but the request failed: " + String(error.message || error).slice(0, 60) };
  } finally {
    clearTimeout(timer);
  }
}

const bodies = readRegistry();
const jobs = bodies.flatMap((b) => b.domains.map((d) => ({ body: b, domain: d })));
const results = [];

for (const job of jobs) {
  const r = await reach(job.domain);
  results.push({ ...r, body: job.body.id });
  console.log(`${r.ok ? "ok  " : "FAIL"} ${job.body.id.padEnd(18)} ${r.host.padEnd(22)} ${r.how}`);
}

const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length - bad.length} of ${results.length} listed domains answered`);

const reportFlag = process.argv.indexOf("--report");
if (reportFlag > -1 && process.argv[reportFlag + 1]) {
  const lines = [
    "These domains are listed in the registry as genuine official channels, and they stopped answering:",
    "",
    ...bad.map((r) => `- \`${r.host}\` (${r.body}): ${r.how}`),
    "",
    "A domain that stops answering is reviewed, not deleted. Check whether the body moved, whether it is an outage, and whether the name is at risk of being taken over."
  ];
  writeFileSync(process.argv[reportFlag + 1], lines.join("\n") + "\n");
}

if (bad.length) process.exit(1);
