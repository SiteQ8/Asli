/*
  Content tests. Run with: node --test
  They fail the build on broken translations, drifting numbers, Arabic punctuation
  mistakes, Unicode dashes, stale generated files and dishonest demo logic.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { ROOT, read, loadContent, loadChecker } from "../tools/lib.mjs";
import { readRegistry } from "../tools/build-data.mjs";
import { buildText, FILES } from "../tools/build-project-md.mjs";

const { C, E } = loadContent();

const ARABIC_LETTERS = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/* Latin words allowed inside Arabic text: product names, formats and standards. */
const LATIN_ALLOWED = new Set([
  "GitHub", "Pages", "Actions", "Git", "SiteQ8", "MCP", "REST", "JSON", "CSV", "hosts",
  "AdGuard", "DNS", "RPZ", "STIX", "MISP", "TLS", "MIT", "CC", "BY", "Chromium", "Firefox",
  "CertStream", "OpenSquat", "KWTCyberWatch", "MEA", "Tech", "Watch", "ARY", "News",
  "example", "English"
]);

/* Keys whose English value is deliberately written in Arabic: the language switch label. */
const EN_MAY_BE_ARABIC = new Set(["t.nav.lang"]);

function pairs() {
  const found = [];
  const walk = (value, path) => {
    if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, `${path}[${i}]`));
      return;
    }
    if (value && typeof value === "object") {
      if ("ar" in value || "en" in value) {
        found.push({ path, pair: value });
        return;
      }
      for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k);
    }
  };
  walk(C, "");
  return found;
}

const ALL = pairs();

function numbersIn(text) {
  let s = text.replace(/\{\w+\}/g, " ");
  s = s.replace(/[A-Za-z][A-Za-z0-9]*[0-9][A-Za-z0-9]*/g, " ");
  s = s.replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
  s = s.replace(/٫/g, ".");
  s = s.replace(/(\d)[٬,](?=\d{3}(?!\d))/g, "$1");
  return (s.match(/\d+(?:\.\d+)?/g) || []).map((n) => String(Number(n))).sort();
}

function placeholders(text) {
  return (text.match(/\{\w+\}/g) || []).sort();
}

function trackedFiles(dir = ROOT) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === ".git" || name === "node_modules") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...trackedFiles(full));
    else if (!/\.(png|jpg|jpeg|gif|webp|ico|woff2?)$/i.test(name)) out.push(full);
  }
  return out;
}

test("every text has a non-empty Arabic and English value and nothing else", () => {
  assert.ok(ALL.length > 200, `expected many text pairs, found ${ALL.length}`);
  for (const { path, pair } of ALL) {
    assert.deepEqual(Object.keys(pair).sort(), ["ar", "en"], `${path} must have exactly ar and en`);
    for (const lang of ["ar", "en"]) {
      assert.equal(typeof pair[lang], "string", `${path}.${lang} must be a string`);
      assert.ok(pair[lang].trim().length > 0, `${path}.${lang} is empty`);
    }
  }
});

test("numbers survive translation", () => {
  for (const { path, pair } of ALL) {
    assert.deepEqual(numbersIn(pair.ar), numbersIn(pair.en), `${path}: numbers differ between Arabic and English`);
  }
});

test("templates keep the same placeholders in both languages", () => {
  for (const { path, pair } of ALL) {
    assert.deepEqual(placeholders(pair.ar), placeholders(pair.en), `${path}: placeholders differ`);
  }
});

test("Arabic text uses Arabic punctuation and digits, with a period only at the end", () => {
  for (const { path, pair } of ALL) {
    const ar = pair.ar;
    if (!ARABIC_LETTERS.test(ar)) continue;
    assert.doesNotMatch(ar, /[,;?%]/, `${path}: use Arabic punctuation (، ؛ ؟ ٪) instead of Latin marks`);
    const withoutTokens = ar
      .replace(/[A-Za-z][A-Za-z0-9]*[\s\u00A0]+\d+(?:\.\d+)?/g, "")
      .replace(/[A-Za-z0-9]+(?:[.\-][A-Za-z0-9]+)+/g, "");
    const inner = withoutTokens.trim().replace(/\.$/, "");
    assert.ok(!inner.includes("."), `${path}: a period appears in the middle of the Arabic text; link clauses with و، ف، ثم، لكن، إذ, and keep the period for the end`);
    assert.doesNotMatch(withoutTokens.replace(/[A-Za-z][A-Za-z0-9]*/g, ""), /[0-9]/, `${path}: use Arabic-Indic digits in Arabic text`);
  }
});

test("each language stays pure", () => {
  for (const { path, pair } of ALL) {
    if (!EN_MAY_BE_ARABIC.has(path)) {
      assert.doesNotMatch(pair.en, ARABIC_LETTERS, `${path}: Arabic letters in the English text`);
    }
    for (const word of pair.ar.replace(/\{\w+\}/g, "").match(/[A-Za-z][A-Za-z0-9]*/g) || []) {
      assert.ok(LATIN_ALLOWED.has(word), `${path}: unexpected Latin word "${word}" in the Arabic text`);
    }
  }
});

test("no Unicode dashes anywhere in the repository", () => {
  const dash = /[\u2010-\u2015\u2212]/;
  for (const file of trackedFiles()) {
    const text = readFileSync(file, "utf8");
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      assert.doesNotMatch(line, dash, `${relative(ROOT, file)}:${i + 1} contains a Unicode dash`);
    });
  }
});

test("no tool attribution, co-author trailers or credentials in the repository", () => {
  const banned = [
    new RegExp(["cla", "ude"].join(""), "i"),
    new RegExp(["anth", "ropic"].join(""), "i"),
    new RegExp(["co-auth", "ored-by"].join(""), "i"),
    new RegExp(["gh", "p_[A-Za-z0-9]{20,}"].join("")),
    new RegExp(["github", "_pat_"].join(""))
  ];
  for (const file of trackedFiles()) {
    const text = readFileSync(file, "utf8");
    for (const re of banned) {
      assert.doesNotMatch(text, re, `${relative(ROOT, file)} matches ${re}`);
    }
  }
});

/* The demo runs the real checker on the real registry, exactly as the check page does. */
const Checker = loadChecker();
const registry = { bodies: readRegistry(), feed: { domains: [], numbers: [] } };
const run = (s) => Checker.check({ text: s.text, channel: s.channel }, registry);

test("demo samples reach the verdicts the site promises, on the real engine", () => {
  for (const s of C.demo.samples) {
    assert.equal(run(s).verdict, s.expect, `sample ${s.id}`);
  }
  const verdicts = new Set(C.demo.samples.map((s) => s.expect));
  assert.ok(verdicts.has("impersonation") && verdicts.has("official"), "the demo must show a fake and a genuine case");
});

test("there is one detection engine, and the home page loads it", () => {
  const engine = read("docs/engine.js");
  assert.ok(!/function analyze|function check\b/.test(engine), "engine.js must not decide verdicts");
  const html = read("docs/index.html");
  assert.ok(html.includes('src="checker.js"'), "the home page must load the real checker");
  const app = read("docs/app.js");
  assert.ok(app.includes("window.AsliChecker.check"), "the demo must call the real checker");
  assert.ok(app.includes("data/registry.json"), "the demo must read the real registry");
});

test("an unknown sender stays unverified instead of looking safe", () => {
  assert.equal(run({ channel: "sms", text: "Your exam results are ready." }).verdict, "unverified");
});

test("demo links point only at official domains or the reserved example domain", () => {
  const official = registry.bodies.flatMap((b) => b.domains);
  for (const s of C.demo.samples) {
    const sender = typeof s.from === "string" ? s.from : "";
    for (const host of [...Checker.hosts(s.text), ...Checker.hosts(sender)]) {
      const isOfficial = official.some((d) => Checker.isUnder(host, d));
      assert.ok(isOfficial || host.endsWith(".example"), `sample ${s.id} links to ${host}`);
    }
  }
});

test("the chosen project ranks first with the default weights", () => {
  const weights = Object.fromEntries(C.criteria.map((c) => [c.id, c.weight]));
  const ranked = E.rank(C.candidates, weights, C.criteria);
  assert.equal(ranked[0].id, C.chosen);
  assert.ok(ranked[0].score > ranked[1].score, "the default ranking must not be a tie");
});

test("the matrix is not rigged: weighting only feasibility changes the winner", () => {
  const weights = Object.fromEntries(C.criteria.map((c) => [c.id, c.id === "feas" ? 1 : 0]));
  assert.notEqual(E.rank(C.candidates, weights, C.criteria)[0].id, C.chosen);
});

test("scores and weights are well formed", () => {
  for (const c of C.criteria) {
    assert.ok(Number.isInteger(c.weight) && c.weight >= 0 && c.weight <= 10, `weight ${c.id}`);
  }
  for (const cand of C.candidates) {
    for (const k of C.criteria) {
      const v = cand.scores[k.id];
      assert.ok(Number.isInteger(v) && v >= 1 && v <= 5, `${cand.id}.${k.id} must be an integer from 1 to 5`);
    }
    assert.deepEqual(Object.keys(cand.scores).sort(), C.criteria.map((k) => k.id).sort(), `${cand.id} scores`);
  }
});

test("ids are unique and phases run in order", () => {
  const unique = (list, label) => assert.equal(new Set(list).size, list.length, `duplicate ${label}`);
  unique(C.demo.samples.map((s) => s.id), "sample ids");
  unique(C.lanes.flatMap((l) => l.nodes.map((n) => n.id)), "architecture node ids");
  unique(C.reuse.map((r) => r.repo), "reused repositories");
  unique(C.candidates.map((c) => c.id), "candidate ids");
  assert.deepEqual(C.phases.map((p) => p.n), C.phases.map((p, i) => i));
});

test("architecture reuses only repositories listed in the reuse section", () => {
  const listed = new Set(C.reuse.map((r) => r.repo));
  for (const lane of C.lanes) {
    for (const n of lane.nodes) {
      for (const repo of n.reuses) assert.ok(listed.has(repo), `${n.id} reuses unlisted ${repo}`);
    }
  }
});

test("every external link uses https", () => {
  const urls = [
    ...C.evidence.map((e) => e.url),
    ...C.trust.filter((t) => t.url).map((t) => t.url),
    C.site,
    C.repo
  ];
  for (const url of urls) assert.match(url, /^https:\/\//, url);
});

test("the page uses every text key and only keys that exist", () => {
  const html = read("docs/index.html");
  const app = read("docs/app.js");
  const builder = read("tools/build-project-md.mjs");
  const keys = new Set(Object.keys(C.t));

  const attrKeys = [...html.matchAll(/data-t(?:-aria)?="([^"]+)"/g)].map((m) => m[1]);
  const callKeys = [...(app + builder).matchAll(/\bT\("([^"]+)"\)/g)].map((m) => m[1]);
  for (const k of [...attrKeys, ...callKeys]) assert.ok(keys.has(k), `missing text key ${k}`);

  const literals = new Set([...(html + app + builder).matchAll(/"([a-z]+\.[A-Za-z]+)"/g)].map((m) => m[1]));
  attrKeys.forEach((k) => literals.add(k));
  for (const k of keys) assert.ok(literals.has(k), `text key ${k} is never used`);
});

test("the index links to every section and nothing else", () => {
  const html = read("docs/index.html");
  const toc = html.slice(html.indexOf('<nav class="toc"'), html.indexOf("</nav>"));
  const links = [...toc.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  const sections = [...html.matchAll(/<section class="part" id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(links, sections);
});

test("PROJECT.md and PROJECT.ar.md match the content byte for byte", () => {
  for (const [lang, file] of Object.entries(FILES)) {
    assert.equal(read(file), buildText(lang), `${file} is stale. Run: node tools/build-project-md.mjs`);
  }
});
