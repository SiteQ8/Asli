#!/usr/bin/env node
/*
  Watches certificate transparency for names that borrow a Kuwaiti brand.

  Every public TLS certificate is logged, so a scam site announces itself the
  moment it gets a certificate, usually hours before the first message goes out.
  This reads those logs through crt.sh, scores each name against the registry,
  and writes the ones worth a human's time.

    node tools/ct-watch.mjs                      one run, writes candidates.json
    node tools/ct-watch.mjs --out /tmp/c.json    write somewhere else
    node tools/ct-watch.mjs --days 3             how far back to look
    node tools/ct-watch.mjs --fixture file.json  no network, read names from a file
    node tools/ct-watch.mjs --dry-run            do not update the seen list
    node tools/ct-watch.mjs --budget 480         stop querying after this many seconds

  What is published and what is not:

  Candidate names are NOT written to this repository. A name that borrows a brand
  is not yet a scam, and publishing an unreviewed accusation is unfair to whoever
  owns it. The public state file keeps only a hash of each name already seen, so
  runs do not repeat themselves and nobody learns a name from it. The candidate
  file itself stays on the runner, and goes to the private review queue when the
  workflow has one configured.
*/
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./lib.mjs";
import { readRegistry } from "./build-data.mjs";
import { score, rank, clean } from "./lookalike.mjs";

const SEEN_FILE = join(ROOT, "watch/seen.json");
const UA = "asli-watch/0.1 (+https://asli.3li.info)";

/* Short tokens match half the internet, so they are queried with Kuwait attached. */
const SHORT = 4;
const EXTRA_QUERIES = ["kuwait-bank", "kuwaitgov", "q8-pay"];

const STOP_AFTER = 4;

export function rotate(list, start) {
  if (!list.length) return [];
  const at = ((start % list.length) + list.length) % list.length;
  return list.slice(at).concat(list.slice(0, at));
}

export function hashName(name) {
  return createHash("sha256").update(clean(name)).digest("hex").slice(0, 16);
}

export function loadSeen() {
  if (!existsSync(SEEN_FILE)) return { schema: "asli.seen.v1", note: "", updated: null, hashes: [] };
  return JSON.parse(readFileSync(SEEN_FILE, "utf8"));
}

export function queriesFor(bodies) {
  const out = new Set();
  for (const body of bodies) {
    for (const token of body.tokens) {
      if (token.length >= SHORT) out.add("%" + token + "%");
      else out.add("%" + token + "%kuwait%");
    }
  }
  EXTRA_QUERIES.forEach((q) => out.add("%" + q + "%"));
  return [...out].sort();
}

/* crt.sh answers 502 and 503 under load, so a single failure means nothing. */
async function fetchRows(url, attempt = 1) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" }, signal: controller.signal });
    if (res.ok) return { ok: true, rows: await res.json() };
    if ([429, 500, 502, 503, 504].includes(res.status) && attempt < 3) {
      clearTimeout(timer);
      await sleep(attempt * 8000);
      return fetchRows(url, attempt + 1);
    }
    return { ok: false, rows: [], why: "http " + res.status };
  } catch (error) {
    if (attempt < 3) {
      clearTimeout(timer);
      await sleep(attempt * 8000);
      return fetchRows(url, attempt + 1);
    }
    return { ok: false, rows: [], why: String(error.message || error).slice(0, 60) };
  } finally {
    clearTimeout(timer);
  }
}

async function crtsh(query, days) {
  const url = `https://crt.sh/?q=${encodeURIComponent(query)}&output=json&exclude=expired`;
  try {
    const answer = await fetchRows(url);
    if (!answer.ok) return { query, ok: false, names: [], why: answer.why };
    const rows = answer.rows;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const names = new Map();
    for (const row of rows) {
      const seenAt = Date.parse(row.not_before || "");
      if (Number.isFinite(seenAt) && seenAt < cutoff) continue;
      for (const raw of String(row.name_value || "").split("\n")) {
        const name = clean(raw);
        if (!name || !name.includes(".") || name.includes(" ")) continue;
        if (!names.has(name)) {
          names.set(name, { first: row.not_before, issuer: row.issuer_name, crtId: row.id });
        }
      }
    }
    return { query, ok: true, names: [...names.entries()].map(([name, meta]) => ({ name, ...meta })), why: "" };
  } catch (error) {
    return { query, ok: false, names: [], why: String(error.message || error).slice(0, 60) };
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
  A name that is not a candidate is marked seen straight away, so it is never
  scored twice. A candidate is not: it stays unseen until a review queue has
  actually received it. Otherwise a candidate found on a day with no queue, or
  on a day the queue was down, would be marked seen and never raised again.
*/
export function evaluate(found, bodies, seenHashes) {
  const results = [];
  const seen = new Set(seenHashes);
  const raised = new Set();
  for (const entry of found) {
    const hash = hashName(entry.name);
    if (seen.has(hash) || raised.has(hash)) continue;
    const verdict = score(entry.name, bodies);
    if (!verdict.candidate) {
      seen.add(hash);
      continue;
    }
    raised.add(hash);
    results.push({
      name: verdict.name,
      hash,
      score: verdict.score,
      body: verdict.body.id,
      reasons: verdict.reasons,
      firstCertificate: entry.first || null,
      issuer: entry.issuer || null,
      crtId: entry.crtId || null,
      status: "unreviewed"
    });
  }
  return { candidates: rank(results), seen: [...seen] };
}

/* Called once a queue has confirmed it holds these candidates. */
export function markDelivered(seenHashes, delivered) {
  const seen = new Set(seenHashes);
  delivered.forEach((c) => seen.add(c.hash || hashName(c.name)));
  return [...seen].sort();
}

export function saveSeen(hashes, extra = {}) {
  const previous = loadSeen();
  writeFileSync(
    SEEN_FILE,
    JSON.stringify(
      {
        schema: "asli.seen.v1",
        note: "Hashes only. A name that has been looked at once is not looked at again, and no name is published here before it is reviewed.",
        updated: new Date().toISOString().slice(0, 10),
        cursor: extra.cursor ?? previous.cursor ?? 0,
        lastRun: extra.lastRun ?? previous.lastRun ?? null,
        hashes: [...hashes].sort()
      },
      null,
      2
    ) + "\n"
  );
}

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

async function main() {
  /*
    Fourteen days by default. These brands do not see a new certificate every
    day, and a name already looked at costs nothing because the seen list makes
    the second sighting free.
  */
  const days = Number(arg("--days", "14"));
  const out = arg("--out", join(process.cwd(), "candidates.json"));
  const fixture = arg("--fixture", null);
  const dryRun = process.argv.includes("--dry-run");

  const bodies = readRegistry();
  const seenFile = loadSeen();
  let found = [];
  let queriesRun = 0;
  let queriesFailed = 0;
  let queriesSkipped = 0;
  let cursor = seenFile.cursor || 0;

  if (fixture) {
    found = JSON.parse(readFileSync(fixture, "utf8")).map((n) => (typeof n === "string" ? { name: n } : n));
  } else {
    /*
      crt.sh is free and often busy, so a run works to a time budget rather than
      to a query list. Whatever is left over comes round on the next run, and the
      seen list means no name is examined twice.
    */
    const budget = Number(arg("--budget", "480")) * 1000;
    const started = Date.now();
    const queries = queriesFor(bodies);
    /* Start where the last run stopped, so every brand gets its turn even when
       a run only manages part of the list. */
    const order = rotate(queries, seenFile.cursor || 0);
    for (const query of order) {
      if (Date.now() - started > budget) break;
      const result = await crtsh(query, days);
      queriesRun++;
      if (!result.ok) queriesFailed++;
      found.push(...result.names);
      /* If the first few all fail, the source is down. Stop, rather than burn the
         budget on retries, and say so. */
      if (queriesRun >= STOP_AFTER && queriesFailed === queriesRun) break;
      await sleep(1500);
    }
    queriesSkipped = queries.length - queriesRun;
    cursor = ((seenFile.cursor || 0) + Math.max(queriesRun - queriesFailed, 0)) % Math.max(queries.length, 1);
    if (queriesRun && queriesFailed === queriesRun) cursor = seenFile.cursor || 0;
  }

  const { candidates, seen } = evaluate(found, bodies, seenFile.hashes || []);

  writeFileSync(out, JSON.stringify({ schema: "asli.candidates.v1", generated: new Date().toISOString(), candidates }, null, 2) + "\n");

  const health = fixture ? "fixture" : !queriesRun ? "idle" : queriesFailed === queriesRun ? "down" : queriesFailed ? "degraded" : "ok";
  const lastRun = {
    date: new Date().toISOString().slice(0, 10),
    source: "crt.sh",
    health,
    queriesRun,
    queriesFailed,
    namesRead: found.length
  };
  if (!dryRun) saveSeen(seen, { cursor, lastRun });

  /* Counts only. Names never go to a public log. */
  const summary = [
    `Certificate source: ${health === "down" ? "unreachable from this runner, nothing was checked" : health}`,
    `Queries run: ${queriesRun}${queriesFailed ? `, failed: ${queriesFailed}` : ""}${queriesSkipped ? `, left for the next run: ${queriesSkipped}` : ""}`,
    `Names seen in the logs: ${found.length}`,
    `Candidates for review: ${candidates.length}, held until a review queue receives them`,
    `Names already known: ${(seenFile.hashes || []).length} to ${seen.length}`
  ].join("\n");
  console.log(summary);

  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Certificate watch\n\n${summary.split("\n").map((l) => "- " + l).join("\n")}\n`);
  }
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `candidates=${candidates.length}\nhealth=${health}\n`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
