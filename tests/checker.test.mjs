/*
  Checker and data tests. Run with: node --test

  These run the same checker.js the browser runs, against the same registry
  files the site publishes, so a registry mistake fails the build.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { ROOT, read } from "../tools/lib.mjs";
import { build, readRegistry, readFeed } from "../tools/build-data.mjs";

function loadChecker() {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(join(ROOT, "docs/checker.js"), "utf8"), sandbox, { filename: "docs/checker.js" });
  return sandbox.AsliChecker;
}

const Checker = loadChecker();
const bodies = readRegistry();
const feedEntries = readFeed();
const data = { bodies, feed: { domains: [], numbers: [] } };
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SECTORS = new Set(["government", "bank", "telecom", "association", "courier", "utility", "airline"]);

test("every registry body has the fields the schema requires", () => {
  assert.ok(bodies.length >= 36, `expected at least 36 bodies, found ${bodies.length}`);
  for (const b of bodies) {
    assert.match(b.id, /^[a-z0-9-]+$/, `bad id ${b.id}`);
    assert.ok(SECTORS.has(b.sector), `${b.id}: unknown sector ${b.sector}`);
    for (const lang of ["ar", "en"]) {
      assert.ok(b.name[lang] && b.name[lang].trim(), `${b.id}: missing ${lang} name`);
      assert.ok(Array.isArray(b.claims[lang]) && b.claims[lang].length, `${b.id}: missing ${lang} claims`);
    }
    assert.ok(Array.isArray(b.tokens) && b.tokens.length, `${b.id}: needs at least one brand token`);
    assert.ok(Array.isArray(b.domains) && b.domains.length, `${b.id}: needs at least one domain`);
    assert.ok(Array.isArray(b.sources) && b.sources.length, `${b.id}: needs at least one source`);
    assert.match(b.verified, DATE, `${b.id}: verified must be a date`);
  }
});

test("registry ids and domains are unique across bodies", () => {
  const ids = bodies.map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate body id");
  const domains = bodies.flatMap((b) => b.domains);
  assert.equal(new Set(domains).size, domains.length, "the same domain is claimed by two bodies");
});

test("every domain, source and app link is a plain https host or url", () => {
  for (const b of bodies) {
    for (const d of b.domains) {
      assert.match(d, /^[a-z0-9.-]+\.[a-z]{2,}$/, `${b.id}: ${d} should be a bare host, with no scheme or path`);
    }
    for (const url of b.sources) assert.match(url, /^https:\/\//, `${b.id}: source ${url}`);
    for (const app of b.apps || []) {
      assert.ok(app.publisher, `${b.id}: app needs a publisher`);
      for (const link of [app.ios, app.android].filter(Boolean)) {
        assert.match(link, /^https:\/\/(apps\.apple\.com|play\.google\.com)\//, `${b.id}: app link ${link}`);
      }
      assert.ok(app.ios || app.android, `${b.id}: app needs at least one store link`);
    }
  }
});

test("every policy is bilingual, scoped to channels and backed by a source", () => {
  let count = 0;
  for (const b of bodies) {
    for (const p of b.policies || []) {
      count++;
      assert.ok(p.id, `${b.id}: policy needs an id`);
      for (const lang of ["ar", "en"]) {
        assert.ok(p.text[lang] && p.text[lang].trim(), `${b.id}/${p.id}: missing ${lang} text`);
        assert.ok(Array.isArray(p.words[lang]) && p.words[lang].length, `${b.id}/${p.id}: missing ${lang} trigger words`);
      }
      assert.ok(Array.isArray(p.channels) && p.channels.length, `${b.id}/${p.id}: needs channels`);
      assert.match(p.source, /^https:\/\//, `${b.id}/${p.id}: needs an https source`);
    }
  }
  assert.ok(count >= 10, `expected policies on the seeded bodies, found ${count}`);
});

test("arabic registry text carries no Latin digits and no mid sentence period", () => {
  const texts = [];
  for (const b of bodies) {
    texts.push(b.name.ar, ...(b.claims.ar || []));
    for (const p of b.policies || []) texts.push(p.text.ar);
    if (b.note) texts.push(b.note.ar);
  }
  for (const text of texts) {
    const stripped = text.replace(/[A-Za-z0-9.]+/g, "");
    assert.doesNotMatch(stripped, /[,;?]/, `use Arabic punctuation in: ${text}`);
    const withoutTokens = text.replace(/[A-Za-z0-9]+(?:[.\-][A-Za-z0-9]+)*/g, "");
    assert.ok(!withoutTokens.trim().replace(/\.$/, "").includes("."), `period in the middle of: ${text}`);
  }
});

test("feed entries carry evidence, a listing date and an expiry", () => {
  for (const e of feedEntries) {
    assert.ok(["domain", "number", "sender"].includes(e.type), `bad indicator type ${e.type}`);
    assert.ok(e.value && String(e.value).trim(), "indicator needs a value");
    assert.match(e.listed, DATE, `${e.value}: listed must be a date`);
    assert.match(e.expires, DATE, `${e.value}: expires must be a date`);
    assert.ok(e.expires > e.listed, `${e.value}: expiry must be after the listing date`);
    assert.ok(e.reason && e.reason.trim(), `${e.value}: needs a reason`);
    assert.ok(Array.isArray(e.evidence) && e.evidence.length, `${e.value}: needs evidence`);
    assert.ok(Array.isArray(e.approvals) && e.approvals.length >= 2, `${e.value}: needs two approvals before listing`);
  }
});

test("no official registry domain can ever be listed in the scam feed", () => {
  const official = new Set(bodies.flatMap((b) => b.domains));
  for (const e of feedEntries) {
    if (e.type !== "domain") continue;
    assert.ok(!official.has(e.value), `${e.value} is an official domain and must not be listed`);
    for (const d of official) {
      assert.ok(!Checker.isUnder(e.value, d), `${e.value} sits under the official domain ${d}`);
    }
  }
});

test("the published data files are up to date", () => {
  const files = build();
  for (const [name, content] of Object.entries(files)) {
    assert.equal(read(`docs/data/${name}`), content, `docs/data/${name} is stale. Run: node tools/build-data.mjs`);
  }
});

test("a fake ministry domain is caught as impersonation", () => {
  const r = Checker.check(
    { text: "وزارة الداخلية: عليك مخالفة مرورية يجب سدادها خلال ٢٤ ساعة عبر moi-kw-fines.example", channel: "sms" },
    data
  );
  assert.equal(r.verdict, "impersonation");
  assert.equal(r.claimed.id, "moi");
  assert.equal(r.lookalike[0].host, "moi-kw-fines.example");
  assert.ok(r.broken.some((b) => b.policy.id === "fines-only-in-sahel"));
  assert.ok(r.pressure);
});

test("a glued brand name is caught, and an innocent name is not", () => {
  assert.ok(Checker.imitates("nbkkuwait.example", "nbk"));
  assert.ok(Checker.imitates("secure-boubyan.example", "boubyan"));
  assert.ok(!Checker.imitates("thinkingcap.example", "kib"));
  assert.ok(!Checker.imitates("stickers.example", "stc"));
});

test("a real official domain reads as an official channel", () => {
  const r = Checker.check({ text: "Check your fines at https://moi.gov.kw/", channel: "web" }, data);
  assert.equal(r.verdict, "official");
  assert.equal(r.official[0].body.id, "moi");
});

test("a request for a one-time code breaks the banking rule whoever sends it", () => {
  const r = Checker.check({ text: "Dear customer, reply with the verification code we sent to keep your card active.", channel: "whatsapp" }, data);
  assert.ok(r.broken.some((b) => b.policy.id === "no-credentials-by-message"));
  assert.equal(r.verdict, "impersonation");
});

test("the same request in Arabic is caught too", () => {
  const r = Checker.check({ text: "عزيزي العميل، أرسل رمز التحقق الذي وصلك حتى لا تتوقف بطاقتك", channel: "sms" }, data);
  assert.ok(r.broken.some((b) => b.policy.id === "no-credentials-by-message"));
  assert.equal(r.verdict, "impersonation");
});

test("a warning that mentions a code without asking for it is not flagged", () => {
  const r = Checker.check(
    { text: "Reminder: we will never ask you for your one-time code. Keep it to yourself.", channel: "sms" },
    data
  );
  assert.equal(r.broken.length, 0, "an awareness message must not be treated as a scam");
  assert.equal(r.verdict, "unverified");
});

test("an unknown sender stays unverified rather than looking safe", () => {
  const r = Checker.check({ text: "Your parcel is ready for collection.", channel: "sms" }, data);
  assert.equal(r.verdict, "unverified");
});

test("a listed indicator outranks everything else", () => {
  const withFeed = { bodies, feed: { domains: [{ domain: "bad.example" }], numbers: [] } };
  const r = Checker.check({ text: "https://bad.example/pay", channel: "sms" }, withFeed);
  assert.equal(r.verdict, "listed");
});

test("every recorded number carries its source, its date and how it was checked", () => {
  const KUWAITI = /^(1\d{6}|[2569]\d{7})$/;
  let recorded = 0;
  for (const b of bodies) {
    for (const h of b.hotlines || []) {
      recorded++;
      assert.match(h.number, KUWAITI, `${b.id}: ${h.number} is not a Kuwaiti number`);
      assert.match(h.source, /^https:\/\//, `${b.id}/${h.number}: needs an https source`);
      assert.ok(b.domains.some((d) => h.source.includes(d)), `${b.id}/${h.number}: the source must be the body's own site`);
      assert.match(h.verified, DATE, `${b.id}/${h.number}: needs a verification date`);
      assert.ok(h.method && h.method.length > 10, `${b.id}/${h.number}: say how it was verified`);
      for (const lang of ["ar", "en"]) assert.ok(h.label && h.label[lang], `${b.id}/${h.number}: missing ${lang} label`);
    }
  }
  assert.ok(recorded >= 4, `expected some recorded numbers, found ${recorded}`);
});

test("a number the body publishes is recognised, and an unknown one is pointed out", () => {
  const withNumbers = bodies.find((b) => (b.hotlines || []).length && b.id === "burgan");
  assert.ok(withNumbers, "burgan should carry published numbers");
  const good = Checker.check({ text: "Burgan Bank: call 1804080 about your account", channel: "sms" }, data);
  assert.ok(good.matchedNumbers.includes("1804080") || good.published.includes("1804080"));

  const bad = Checker.check({ text: "Burgan Bank: your account is suspended, call 55512345 now", channel: "sms" }, data);
  assert.ok(bad.unpublishedNumbers.includes("55512345"), `found ${bad.unpublishedNumbers.join(", ")}`);
  assert.ok(bad.published.includes("1804080"), "the genuine numbers must be offered back to the person");
});

test("an unpublished number next to pressure wording reads as impersonation", () => {
  const r = Checker.check({ text: "Burgan Bank: your account is suspended. Call 55512345 now to reactivate it.", channel: "sms" }, data);
  assert.equal(r.verdict, "impersonation");
  assert.ok(r.pressure, "suspended and reactivate are pressure");
  assert.ok(r.unpublishedNumbers.includes("55512345"));
});

test("an unpublished number on its own is not enough to call something a scam", () => {
  const r = Checker.check({ text: "Burgan Bank: our branch in Salmiya can be reached on 22334455.", channel: "sms" }, data);
  assert.ok(r.unpublishedNumbers.includes("22334455"));
  assert.equal(r.pressure, false);
  assert.notEqual(r.verdict, "impersonation");
});

test("a body with no recorded numbers never accuses a number of being wrong", () => {
  const result = Checker.check({ text: "Ministry of Interior: call 55512345 about your fine", channel: "sms" }, data);
  /* The array crosses a vm realm, so compare its contents rather than the object. */
  assert.equal(result.unpublishedNumbers.length, 0, "silence is the honest answer when nothing is on file");
});

test("phone numbers are read with or without the country code", () => {
  const r = Checker.check({ text: "Call +965 2222 3333 or 22223333 now", channel: "call" }, data);
  assert.ok(r.phones.includes("22223333"), `found ${r.phones.join(", ")}`);
});

test("the checker never mutates the registry it is given", () => {
  const before = JSON.stringify(bodies);
  Checker.check({ text: "وزارة الداخلية moi-kw.example", channel: "sms" }, data);
  assert.equal(JSON.stringify(bodies), before);
});
