#!/usr/bin/env node
/*
  Promotes a reviewed candidate into the scam feed.

    node tools/promote-candidate.mjs \
      --value pay-moi-kw.example \
      --type domain \
      --reason "Copies the traffic fine payment page and collects card details" \
      --approve reviewer-a --approve reviewer-b \
      --evidence "screenshot 2026-10-20T08:14:00Z sha256:abc..." \
      --evidence "crt.sh id 1234567"

  It refuses to write anything that the listing policy would not allow: fewer
  than two approvals, no evidence, no reason, or a domain that belongs to a body
  in the registry. After it writes, run node tools/build-data.mjs to republish.
*/
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./lib.mjs";
import { readRegistry } from "./build-data.mjs";
import { clean, isUnder } from "./lookalike.mjs";

const DAYS = 90;

function many(flag) {
  const out = [];
  process.argv.forEach((a, i) => {
    if (a === flag && process.argv[i + 1]) out.push(process.argv[i + 1]);
  });
  return out;
}

function one(flag, fallback = null) {
  return many(flag)[0] ?? fallback;
}

function fail(message) {
  console.error("Refused: " + message);
  process.exit(1);
}

const type = one("--type", "domain");
const value = type === "domain" ? clean(one("--value", "")) : String(one("--value", "")).trim();
const reason = one("--reason", "");
const approvals = many("--approve");
const evidence = many("--evidence");
const listed = one("--listed", new Date().toISOString().slice(0, 10));

if (!["domain", "number", "sender"].includes(type)) fail("type must be domain, number or sender");
if (!value) fail("a value is required");
if (!reason) fail("a reason is required, written as a fact rather than an opinion");
if (approvals.length < 2) fail("two approvals are required, and one person cannot be both");
if (new Set(approvals).size < 2) fail("the two approvals must come from two different people");
if (!evidence.length) fail("evidence is required, because an appeal is judged against it");

if (type === "domain") {
  const bodies = readRegistry();
  for (const body of bodies) {
    for (const domain of body.domains) {
      if (isUnder(value, domain)) fail(`${value} belongs to ${body.id} in the registry and can never be listed`);
    }
  }
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(value)) fail("a domain must be a bare host, with no scheme and no path");
}

const expires = new Date(Date.parse(listed + "T00:00:00Z") + DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const entry = {
  type,
  value,
  listed,
  expires,
  reason,
  evidence: evidence.map((text) => ({ kind: "note", note: text })),
  approvals,
  appeal: one("--appeal", "https://github.com/SiteQ8/Asli/blob/main/APPEALS.md")
};

const dir = join(ROOT, "feed/entries");
mkdirSync(dir, { recursive: true });
const file = join(dir, `${type}-${value.replace(/[^a-z0-9]+/gi, "-")}.json`);
if (existsSync(file)) fail(`${value} is already listed. Edit ${file} instead, and record why.`);

writeFileSync(file, JSON.stringify(entry, null, 2) + "\n");
console.log(`Listed ${value} until ${expires}.`);
console.log("Now run: node tools/build-data.mjs && node --test");
