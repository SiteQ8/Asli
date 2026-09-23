/*
  Watch tests. Run with: node --test

  Two things matter here. The scoring must catch real squats without flagging
  innocent names, and nothing the watcher writes into this repository may reveal
  a name before it has been reviewed.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../tools/lib.mjs";
import { readRegistry } from "../tools/build-data.mjs";
import { score, rank, deleet, tokenHit, isUnder } from "../tools/lookalike.mjs";
import { evaluate, hashName, queriesFor, loadSeen } from "../tools/ct-watch.mjs";

const bodies = readRegistry();
const scoreOf = (name) => score(name, bodies);

test("an official domain never becomes a candidate", () => {
  for (const body of bodies) {
    for (const domain of body.domains) {
      for (const name of [domain, "www." + domain, "login." + domain]) {
        const r = scoreOf(name);
        assert.equal(r.candidate, false, `${name} must never be a candidate`);
        assert.equal(r.score, 0, `${name} scored ${r.score}`);
      }
    }
  }
});

test("names that borrow a brand are caught, with the right body", () => {
  const cases = [
    ["moi-kw-fines.example", "moi"],
    ["moi.gov.kw.pay.example", "moi"],
    ["secure-boubyan-login.top", "boubyan"],
    ["nbkkuwait.example", "nbk"],
    ["nbk0nline.example", "nbk"],
    ["my-kfh-account.example", "kfh"],
    ["gulfbank-verify.xyz", "gulf-bank"],
    ["sahel-gov-kw.xyz", "paci"],
    ["zain-recharge-kw.top", "zain"],
    ["kuwaitpost-fees.example", "moc"]
  ];
  for (const [name, expected] of cases) {
    const r = scoreOf(name);
    assert.equal(r.candidate, true, `${name} should be a candidate, scored ${r.score}`);
    assert.equal(r.body.id, expected, `${name} was attributed to ${r.body && r.body.id}`);
    assert.ok(r.reasons.length, `${name} must come with reasons`);
  }
});

test("innocent names that merely share letters are left alone", () => {
  const innocent = [
    "thinkingcap.example",
    "stickers.example",
    "kibble.example",
    "nbkwealth.ch",
    "compost-heap.example",
    "random-site.example",
    "mofongo-recipes.example"
  ];
  for (const name of innocent) {
    const r = scoreOf(name);
    assert.equal(r.candidate, false, `${name} should not be a candidate, scored ${r.score}: ${r.reasons.join("; ")}`);
  }
});

test("the strongest signal is an official domain used as a label", () => {
  const r = scoreOf("moi.gov.kw.secure-pay.example");
  assert.ok(r.score >= 90, `expected a high score, got ${r.score}`);
  assert.ok(r.reasons.some((x) => x.includes("carries the official domain")));
});

test("swapped characters are read back to the brand", () => {
  assert.equal(deleet("nbk0nline"), "nbkonline");
  assert.equal(deleet("b0ubyan"), "boubyan");
  assert.equal(deleet("rnoi"), "moi");
  assert.equal(tokenHit("b0ubyan-kw.example", "boubyan").how, "character-swap");
});

test("scoring is pure and repeatable", () => {
  const first = scoreOf("gulfbank-verify.xyz");
  const second = scoreOf("gulfbank-verify.xyz");
  assert.deepEqual(first.reasons, second.reasons);
  assert.equal(first.score, second.score);
  const ordered = rank([scoreOf("nbkkuwait.example"), scoreOf("moi.gov.kw.pay.example")]);
  assert.equal(ordered[0].name, "moi.gov.kw.pay.example");
});

test("subdomains are matched against their parent domain", () => {
  assert.ok(isUnder("services.moi.gov.kw", "moi.gov.kw"));
  assert.ok(!isUnder("moi.gov.kw.example", "moi.gov.kw"));
});

test("the watcher skips names it has already looked at", () => {
  const found = [{ name: "moi-kw-fines.example" }, { name: "gulfbank-verify.xyz" }];
  const first = evaluate(found, bodies, []);
  assert.equal(first.candidates.length, 2);
  const second = evaluate(found, bodies, first.seen);
  assert.equal(second.candidates.length, 0, "a name must not be raised twice");
});

test("queries cover every brand in the registry", () => {
  const queries = queriesFor(bodies);
  for (const body of bodies) {
    for (const token of body.tokens) {
      assert.ok(
        queries.some((q) => q.includes(token)),
        `no query covers the brand ${token} of ${body.id}`
      );
    }
  }
});

test("the public state file holds hashes and nothing else", () => {
  const seen = loadSeen();
  assert.equal(seen.schema, "asli.seen.v1");
  assert.ok(Array.isArray(seen.hashes));
  for (const hash of seen.hashes) {
    assert.match(hash, /^[0-9a-f]{16}$/, `${hash} is not a plain hash`);
  }
  const raw = readFileSync(join(ROOT, "watch/seen.json"), "utf8");
  assert.doesNotMatch(raw, /[a-z0-9-]+\.(com|net|org|kw|example|top|xyz|dev|app|info)/i, "a name leaked into the public state file");
});

test("hashing a name gives a short stable value that hides it", () => {
  const hash = hashName("moi-kw-fines.example");
  assert.match(hash, /^[0-9a-f]{16}$/);
  assert.equal(hash, hashName("MOI-KW-FINES.EXAMPLE."), "hashing must ignore case and a trailing dot");
  assert.ok(!hash.includes("moi"));
});
