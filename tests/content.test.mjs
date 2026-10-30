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
import { pages as shellPages, stamp } from "../tools/build-shell.mjs";

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
    assert.doesNotMatch(pair.en, ARABIC_LETTERS, `${path}: Arabic letters in the English text`);
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

test("there is one detection engine, and every page that checks loads it", () => {
  const engine = read("docs/engine.js");
  assert.ok(!/function analyze|function check\b/.test(engine), "engine.js must not decide verdicts");
  for (const page of ["index.html", "check.html", "about.html", "report.html"]) {
    assert.ok(read("docs/" + page).includes('src="checker.js"'), `${page} must load the real checker`);
  }
  for (const page of ["index.html", "check.html"]) {
    assert.ok(read("docs/" + page).includes('src="check.js"'), `${page} must use the shared check component`);
  }
  const component = read("docs/check.js");
  assert.ok(component.includes("root.AsliChecker") && component.includes("C.check("), "the check component must call the real checker");
  assert.ok(component.includes("data/registry.json") && component.includes("data/feed.json"), "the check component must read the real registry and feed");
  assert.ok(read("docs/home.js").includes("AsliCheckUI.mount"), "the home page must mount the real check, not a picture of it");
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

test("the pages use every text key and only keys that exist", () => {
  const html = read("docs/index.html") + read("docs/about.html");
  const app = read("docs/app.js") + read("docs/home.js");
  const builder = read("tools/build-project-md.mjs");
  const keys = new Set(Object.keys(C.t));

  const attrKeys = [...html.matchAll(/data-t(?:-aria)?="([^"]+)"/g)].map((m) => m[1]);
  const callKeys = [...(app + builder).matchAll(/\bT\("([^"]+)"[,)]/g)].map((m) => m[1]);
  for (const k of [...attrKeys, ...callKeys]) assert.ok(keys.has(k), `missing text key ${k}`);

  const literals = new Set([...(html + app + builder).matchAll(/"([a-z]+\.[A-Za-z]+)"/g)].map((m) => m[1]));
  attrKeys.forEach((k) => literals.add(k));
  for (const k of keys) assert.ok(literals.has(k), `text key ${k} is never used`);
});

test("the about page index links to every section and nothing else", () => {
  const html = read("docs/about.html");
  const start = html.indexOf('<nav class="toc"');
  assert.ok(start >= 0, "the about page needs its index");
  const toc = html.slice(start, html.indexOf("</nav>", start));
  const links = [...toc.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
  const sections = [...html.matchAll(/<section class="part" id="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(links, sections);
});

test("PROJECT.md and PROJECT.ar.md match the content byte for byte", () => {
  for (const [lang, file] of Object.entries(FILES)) {
    assert.equal(read(file), buildText(lang), `${file} is stale. Run: node tools/build-project-md.mjs`);
  }
});

test("every page carries the shared header and footer, unchanged", () => {
  const list = shellPages();
  assert.ok(list.length >= 6, `expected every page, found ${list.length}`);
  for (const page of list) {
    const html = read("docs/" + page);
    assert.equal(stamp(html, page), html, `docs/${page} differs from the shared shell. Run: node tools/build-shell.mjs`);
    assert.ok(html.includes('src="site.js"'), `${page} must load the shared shell script`);
    assert.ok(html.includes('<main id="main"'), `${page} needs <main id="main"> for the skip link`);
  }
});

test("every page the shell links to exists", () => {
  const shell = read("tools/shell/header.html") + read("tools/shell/footer.html");
  const local = [...shell.matchAll(/href="([a-z]+\.html)(?:#[^"]*)?"/g)].map((m) => m[1]);
  assert.ok(local.length >= 5, "the shell should link the site's pages");
  for (const page of local) assert.ok(shellPages().includes(page), `the shell links ${page}, which does not exist`);
});

test("the roadmap and the progress list say where things stand, in order", () => {
  const order = { done: 0, active: 1, ahead: 2 };
  let last = 0;
  for (const p of C.phases) {
    assert.ok(p.status in order, `phase ${p.n} has an unknown status ${p.status}`);
    assert.ok(order[p.status] >= last, `phase ${p.n} cannot be ${p.status} after a later phase`);
    last = order[p.status];
    for (const g of p.goals) assert.ok(g.text && (g.done === undefined || g.done === true), `phase ${p.n} has a malformed goal`);
    if (p.status === "done") assert.ok(p.goals.every((g) => g.done), `phase ${p.n} is complete, so every goal must be done`);
  }
  assert.ok(C.phases.filter((p) => p.status === "active").length <= 1, "only one phase can be under way");
  for (const s of C.steps) assert.ok(["done", "active", "todo"].includes(s.status), `a step has an unknown status ${s.status}`);
});
