#!/usr/bin/env node
/*
  Builds everything under docs/data from the source data in registry/ and feed/.

  node tools/build-data.mjs          writes the files
  node tools/build-data.mjs --check  fails if any published file is out of date

  Outputs:
    registry.json      the official channels, one array of bodies
    feed.json          confirmed scam indicators with their evidence
    feed.csv           the same, one row per indicator
    feed.txt           plain list, one indicator per line
    hosts.txt          hosts file format, for a phone or a laptop
    adguard.txt        AdGuard and uBlock Origin filter list
    rpz.zone           DNS response policy zone, for a resolver
    feed.stix2.json    STIX 2.1 bundle, for a threat intelligence platform
    feed.misp.json     MISP event, for sharing communities
    meta.json          counts and build time, for the site to read
*/
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { ROOT } from "./lib.mjs";

const OUT = join(ROOT, "docs/data");
const SITE = "https://asli.3li.info";

export function readRegistry() {
  const dir = join(ROOT, "registry/bodies");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")));
}

export function readWatch() {
  const path = join(ROOT, "watch/seen.json");
  if (!existsSync(path)) return { hashes: [], updated: null };
  return JSON.parse(readFileSync(path, "utf8"));
}

export function readFeed() {
  const dir = join(ROOT, "feed/entries");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")));
}

/* A stable id so consumers can track an indicator across releases. */
function indicatorId(entry) {
  return createHash("sha256").update(`${entry.type}:${entry.value}`).digest("hex").slice(0, 16);
}

function csvCell(value) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/*
  The build date decides two things: what "generated" says, and which listings
  are still active. A listing is published while the build date is before its
  expiry, so an expired entry drops out of every format on the next build
  without anyone having to remember to remove it.
*/
export function today() {
  return new Date().toISOString().slice(0, 10);
}

/* The date the committed files were built on, so a check compares like with like. */
export function committedDate() {
  const path = join(OUT, "meta.json");
  if (!existsSync(path)) return today();
  const meta = JSON.parse(readFileSync(path, "utf8"));
  return String(meta.generated || "").slice(0, 10) || today();
}

export function build(date = today(), overrides = {}) {
  const bodies = overrides.bodies || readRegistry();
  const watch = overrides.watch || readWatch();
  const all = (overrides.feed || readFeed()).map((e) => ({ ...e, id: indicatorId(e) }));
  const feed = all.filter((e) => e.listed <= date && date < e.expires);
  const expired = all.filter((e) => e.expires <= date).length;
  const domains = feed.filter((e) => e.type === "domain");
  const numbers = feed.filter((e) => e.type === "number");
  const senders = feed.filter((e) => e.type === "sender");
  const stamp = `${date}T00:00:00Z`;
  const files = {};

  files["registry.json"] = JSON.stringify(
    {
      schema: "asli.registry.v1",
      site: SITE,
      licence: "CC BY 4.0",
      bodies
    },
    null,
    2
  ) + "\n";

  files["feed.json"] = JSON.stringify(
    {
      schema: "asli.feed.v1",
      site: SITE,
      licence: "CC BY 4.0",
      generated: stamp,
      count: feed.length,
      domains: domains.map((e) => ({ id: e.id, domain: e.value, listed: e.listed, expires: e.expires, reason: e.reason, evidence: e.evidence })),
      numbers: numbers.map((e) => ({ id: e.id, number: e.value, listed: e.listed, expires: e.expires, reason: e.reason, evidence: e.evidence })),
      senders: senders.map((e) => ({ id: e.id, sender: e.value, listed: e.listed, expires: e.expires, reason: e.reason, evidence: e.evidence }))
    },
    null,
    2
  ) + "\n";

  const csv = ["id,type,value,listed,expires,reason"];
  feed.forEach((e) => csv.push([e.id, e.type, e.value, e.listed, e.expires, e.reason].map(csvCell).join(",")));
  files["feed.csv"] = csv.join("\n") + "\n";

  const header = (what) => [
    `# Asli ${what}`,
    `# Kuwait's open scam shield. ${SITE}`,
    "# Licence: CC BY 4.0",
    `# Generated: ${stamp}`,
    `# Entries: ${feed.length}`,
    ""
  ];

  files["feed.txt"] = header("scam feed, plain list").concat(feed.map((e) => `${e.type}\t${e.value}`)).join("\n") + "\n";
  files["hosts.txt"] = header("scam feed, hosts format").concat(domains.map((e) => `0.0.0.0 ${e.value}`)).join("\n") + "\n";
  files["adguard.txt"] = header("scam feed, AdGuard and uBlock Origin").concat(domains.map((e) => `||${e.value}^`)).join("\n") + "\n";
  files["rpz.zone"] = [
    "$TTL 300",
    `@ SOA asli.3li.info. abuse.asli.3li.info. ${stamp.slice(0, 10).replace(/-/g, "")}01 3600 600 86400 300`,
    "  NS localhost.",
    ...domains.flatMap((e) => [`${e.value} CNAME .`, `*.${e.value} CNAME .`])
  ].join("\n") + "\n";

  files["feed.stix2.json"] = JSON.stringify(
    {
      type: "bundle",
      id: "bundle--" + createHash("sha256").update("asli-feed-" + stamp).digest("hex").slice(0, 32).replace(/^(.{8})(.{4})(.{4})(.{4})(.{12}).*$/, "$1-$2-$3-$4-$5"),
      objects: feed.map((e) => ({
        type: "indicator",
        spec_version: "2.1",
        id: `indicator--${e.id.slice(0, 8)}-${e.id.slice(8, 12)}-4${e.id.slice(12, 15)}-a${e.id.slice(0, 3)}-${e.id.slice(0, 12)}`,
        created: e.listed,
        modified: e.listed,
        name: `Kuwait scam ${e.type}: ${e.value}`,
        description: e.reason,
        indicator_types: ["phishing"],
        pattern_type: "stix",
        pattern: e.type === "domain" ? `[domain-name:value = '${e.value}']` : `[user-account:account_login = '${e.value}']`,
        valid_from: e.listed,
        valid_until: e.expires
      }))
    },
    null,
    2
  ) + "\n";

  files["feed.misp.json"] = JSON.stringify(
    {
      Event: {
        info: "Asli: confirmed scam indicators, Kuwait",
        date: stamp.slice(0, 10),
        analysis: "2",
        threat_level_id: "2",
        distribution: "3",
        Attribute: feed.map((e) => ({
          type: e.type === "domain" ? "domain" : "phone-number",
          category: "Network activity",
          to_ids: e.type === "domain",
          value: e.value,
          comment: e.reason
        }))
      }
    },
    null,
    2
  ) + "\n";

  files["meta.json"] = JSON.stringify(
    {
      schema: "asli.meta.v1",
      generated: stamp,
      site: SITE,
      registry: {
        bodies: bodies.length,
        domains: bodies.reduce((n, b) => n + b.domains.length, 0),
        apps: bodies.reduce((n, b) => n + (b.apps || []).length, 0),
        policies: bodies.reduce((n, b) => n + (b.policies || []).length, 0),
        sectors: [...new Set(bodies.map((b) => b.sector))].sort()
      },
      feed: { total: feed.length, domains: domains.length, numbers: numbers.length, senders: senders.length, expiredAndRemoved: expired },
      watch: { namesChecked: watch.hashes.length, updated: watch.updated, lastRun: watch.lastRun || null },
      formats: ["feed.json", "feed.csv", "feed.txt", "hosts.txt", "adguard.txt", "rpz.zone", "feed.stix2.json", "feed.misp.json"]
    },
    null,
    2
  ) + "\n";

  return files;
}

function main() {
  const check = process.argv.includes("--check");
  const flag = process.argv.indexOf("--date");
  const given = flag > -1 ? process.argv[flag + 1] : process.env.ASLI_BUILD_DATE;
  /* A check rebuilds as of the committed build date, so a listing expiring overnight
     does not fail an unrelated change. The scheduled job rebuilds as of today. */
  const date = given || (check ? committedDate() : today());
  const files = build(date);
  mkdirSync(OUT, { recursive: true });
  let stale = 0;
  for (const [name, content] of Object.entries(files)) {
    const path = join(OUT, name);
    const current = existsSync(path) ? readFileSync(path, "utf8") : null;
    if (check) {
      if (current !== content) {
        console.error(`docs/data/${name} is out of date. Run: node tools/build-data.mjs`);
        stale++;
      }
    } else if (current !== content) {
      writeFileSync(path, content);
      console.log(`wrote docs/data/${name}`);
    }
  }
  if (!check && !stale) console.log("data is current");
  if (stale) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
