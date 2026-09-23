#!/usr/bin/env node
/*
  Builds PROJECT.md (English) and PROJECT.ar.md (Arabic) from docs/content.js.
  node tools/build-project-md.mjs          writes both files
  node tools/build-project-md.mjs --check  fails if either file is out of date
*/
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT, loadContent } from "./lib.mjs";

export const FILES = { en: "PROJECT.md", ar: "PROJECT.ar.md" };

export function buildText(lang) {
  const { C, E } = loadContent();
  const T = (key) => {
    const pair = C.t[key];
    if (!pair) throw new Error("Missing text key: " + key);
    return pair[lang];
  };
  const P = (pair) => pair[lang];
  const num = (v, d) => E.formatNumber(v, lang, d);
  const pct = (v) => num(v) + (lang === "ar" ? "٪" : "%");
  const fill = (tpl, map) => tpl.replace(/\{(\w+)\}/g, (w, k) => (k in map ? map[k] : w));
  const joinAnd = (items) => {
    if (items.length < 2) return items.join("");
    if (lang === "ar") return items.join(T("common.and"));
    return items.slice(0, -1).join(T("common.listSep")) + T("common.and") + items[items.length - 1];
  };
  const other = lang === "ar" ? "en" : "ar";
  const out = [];
  const line = (s = "") => out.push(s);

  line(`# ${T("meta.title")}`);
  line();
  line(T("hero.kicker"));
  line();
  line(`> ${T("md.generated")}`);
  line();
  line(`${T("md.live")}: ${C.site}?lang=${lang}`);
  line();
  line(`${T("md.otherLang")}: [${FILES[other]}](${FILES[other]})`);
  line();

  line(`## ${T("hero.title")}`);
  line();
  line(T("hero.lead"));
  line();
  line(T("hero.name"));
  line();

  line(`## ${T("problem.title")}`);
  line();
  line(T("problem.lead"));
  line();
  for (const e of C.evidence) {
    line(`- ${P(e.fact)}`);
    line();
    line(`  [${P(e.source)}](${e.url})`);
    line();
  }
  line(`> **${T("problem.analysisLabel")}**`);
  line(">");
  line(`> ${T("problem.analysis")}`);
  line();

  line(`## ${T("idea.title")}`);
  line();
  line(T("idea.lead"));
  line();
  line(`### ${T("idea.blockTitle")}`);
  line();
  for (const item of C.idea.block) line(`- ${P(item)}`);
  line();
  line(`### ${T("idea.regTitle")}`);
  line();
  for (const item of C.idea.registry) line(`- ${P(item)}`);
  line();
  line(`### ${T("idea.openTitle")}`);
  line();
  for (const item of C.idea.open) line(`- **${P(item.title)}**: ${P(item.body)}`);
  line();
  line(`### ${T("idea.localTitle")}`);
  line();
  line(T("idea.local"));
  line();

  line(`## ${T("demo.title")}`);
  line();
  line(T("demo.lead"));
  line();
  const verdicts = {
    impersonation: [T("v.impersonation"), T("v.impersonationWhy")],
    official: [T("v.official"), T("v.officialWhy")],
    unverified: [T("v.unverified"), T("v.unverifiedWhy")]
  };
  for (const s of C.demo.samples) {
    const r = E.analyze(s, C.demo);
    const [label, why] = verdicts[r.verdict];
    const sender = typeof s.from === "string" ? s.from : P(s.from);
    line(`### ${P(s.label)}`);
    line();
    line(`- **${T("demo.from")}**: ${sender}`);
    line(`- **${T("demo.channel")}**: ${P(s.channelName)}`);
    line(`- **${T("md.message")}**:`);
    line();
    line(`  > ${s.text}`);
    line();
    line(`- **${T("demo.verdict")}**: ${label}`);
    line();
    line(`  ${why}`);
    line();
    line(`- **${T("demo.todo")}**: ${P(s.advice)}`);
    line();
  }
  line(T("demo.note"));
  line();

  line(`## ${T("how.title")}`);
  line();
  line(T("how.lead"));
  line();
  for (const lane of C.lanes) {
    line(`### ${P(lane.title)}`);
    line();
    for (const n of lane.nodes) {
      line(`- **${P(n.title)}**: ${P(n.body)}`);
      if (n.reuses.length) {
        line();
        line(`  ${T("how.reuses")}: ${n.reuses.map((r) => `[${r}](https://github.com/SiteQ8/${r})`).join(T("common.listSep"))}`);
        line();
      }
    }
    line();
  }

  line(`## ${T("why.title")}`);
  line();
  line(T("why.lead"));
  line();
  line(T("why.note"));
  line();
  const weights = {};
  let sum = 0;
  for (const c of C.criteria) { weights[c.id] = c.weight; sum += c.weight; }
  line(`**${T("md.defaultWeights")}**: ${C.criteria.map((c) => `${P(c.name)} ${pct(Math.round((c.weight / sum) * 100))}`).join(T("common.listSep"))}`);
  line();
  const ranked = E.rank(C.candidates, weights, C.criteria);
  const byId = Object.fromEntries(C.candidates.map((c) => [c.id, c]));
  line(`| ${T("why.candidate")} | ${C.criteria.map((c) => P(c.name)).join(" | ")} | ${T("why.total")} |`);
  line(`| --- | ${C.criteria.map(() => "---").join(" | ")} | --- |`);
  for (const row of ranked) {
    const c = byId[row.id];
    const tag = c.id === C.chosen ? ` (${T("why.chosen")})` : "";
    line(`| **${P(c.name)}**${tag} | ${C.criteria.map((k) => num(c.scores[k.id])).join(" | ")} | ${num(row.score, 2)} |`);
  }
  line();
  const top = ranked[0].score;
  const winners = ranked.filter((r) => Math.abs(r.score - top) < 1e-9).map((r) => P(byId[r.id].short));
  line(fill(T(winners.length > 1 ? "why.tie" : "why.result"), { winner: joinAnd(winners), score: num(top, 2) }));
  line();
  for (const row of ranked) {
    const c = byId[row.id];
    line(`- **${P(c.name)}**: ${P(c.why)}`);
  }
  line();

  line(`## ${T("roadmap.title")}`);
  line();
  line(T("roadmap.lead"));
  line();
  for (const p of C.phases) {
    line(`### ${fill(T("roadmap.phase"), { n: num(p.n) })}: ${P(p.title)}`);
    line();
    line(`${P(p.when)} (${P(p.dates)})`);
    line();
    for (const g of p.goals) line(`- ${P(g)}`);
    line();
    line(`**${T("roadmap.exit")}**: ${P(p.exit)}`);
    line();
  }

  line(`## ${T("reuse.title")}`);
  line();
  line(T("reuse.lead"));
  line();
  for (const r of C.reuse) line(`- [${r.repo}](https://github.com/SiteQ8/${r.repo}): ${P(r.role)}`);
  line();

  line(`## ${T("trust.title")}`);
  line();
  line(T("trust.lead"));
  line();
  for (const item of C.trust) {
    line(`- **${P(item.title)}**: ${P(item.body)}`);
    if (item.url) {
      line();
      line(`  [${T("common.source")}](${item.url})`);
      line();
    }
  }
  line();

  line(`## ${T("measures.title")}`);
  line();
  line(T("measures.lead"));
  line();
  line(`| ${T("measures.metric")} | ${T("measures.target")} |`);
  line("| --- | --- |");
  for (const m of C.measures) line(`| ${P(m.metric)} | ${P(m.target)} |`);
  line();

  line(`## ${T("risks.title")}`);
  line();
  line(`| ${T("risks.risk")} | ${T("risks.response")} |`);
  line("| --- | --- |");
  for (const r of C.risks) line(`| ${P(r.risk)} | ${P(r.response)} |`);
  line();

  line(`## ${T("serves.title")}`);
  line();
  line(T("serves.note"));
  line();
  for (const s of C.serves) line(`- **${P(s.title)}**: ${P(s.body)}`);
  line();

  line(`## ${T("next.title")}`);
  line();
  line(T("next.lead"));
  line();
  C.steps.forEach((s, i) => line(`${i + 1}. ${P(s)}`));
  line();
  line("---");
  line();
  line(T("footer.by"));
  line();
  line(`[${T("footer.source")}](${C.repo})`);

  let body = out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
  if (lang === "ar") body = `<div dir="rtl" lang="ar">\n\n${body}\n</div>\n`;
  return body;
}

function main() {
  const check = process.argv.includes("--check");
  let stale = 0;
  for (const [lang, file] of Object.entries(FILES)) {
    const path = join(ROOT, file);
    const next = buildText(lang);
    const current = existsSync(path) ? readFileSync(path, "utf8") : null;
    if (check) {
      if (current !== next) {
        console.error(`${file} is out of date. Run: node tools/build-project-md.mjs`);
        stale++;
      }
    } else if (current !== next) {
      writeFileSync(path, next);
      console.log(`wrote ${file}`);
    } else {
      console.log(`${file} is up to date`);
    }
  }
  if (stale) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
