#!/usr/bin/env node
/*
  Finds the contact numbers each body publishes on its own site.

    node tools/find-contacts.mjs                  print what it finds
    node tools/find-contacts.mjs --out props.json write a proposal file
    node tools/find-contacts.mjs --id nbk         one body only

  It writes a proposal, never the registry. A number that reaches people in a
  scam emergency has to be right, so a human reads the page, decides what the
  number is for, and edits registry/bodies/<id>.json by hand.

  Only explicit tel: links count. A number typed in running text can be a
  branch, a supplier, a form placeholder or a person, while a tel: link is the
  body publishing a number for people to call. Everything else is noise, and
  noise in this field is dangerous rather than merely untidy.
*/
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { readRegistry } from "./build-data.mjs";

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const LINK = /<a\b[^>]*href=["']tel:([+\d\s()-]{6,20})["'][^>]*>([\s\S]{0,140}?)<\/a>/gi;
/* Kuwaiti numbers: a 7 digit short line starting with 1, or 8 digits. */
const KUWAITI = /^(1\d{6}|[2569]\d{7})$/;

export function numbersIn(html) {
  const found = [];
  for (const match of html.matchAll(LINK)) {
    const number = match[1].replace(/[^\d+]/g, "").replace(/^\+?965/, "");
    if (!KUWAITI.test(number)) continue;
    const label = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 70);
    if (!found.some((f) => f.number === number)) found.push({ number, label });
  }
  return found;
}

async function page(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(url, { headers: { "user-agent": UA, accept: "text/html" }, redirect: "follow", signal: controller.signal });
    if (!res.ok) return null;
    return { html: await res.text(), url: res.url };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function arg(flag, fallback = null) {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

async function main() {
  const only = arg("--id");
  const out = arg("--out");
  const bodies = readRegistry().filter((b) => !only || b.id === only);
  const proposals = [];

  for (const body of bodies) {
    const known = (body.hotlines || []).map((h) => h.number);
    let hit = null;
    for (const domain of body.domains) {
      for (const url of [`https://${domain}/`, `https://www.${domain}/`, `https://${domain}/contact-us`, `https://${domain}/en/contact-us`]) {
        const got = await page(url);
        if (!got) continue;
        const numbers = numbersIn(got.html).filter((n) => !known.includes(n.number));
        if (numbers.length) {
          hit = { source: got.url, numbers };
          break;
        }
      }
      if (hit) break;
    }
    const line = hit
      ? hit.numbers.map((n) => `${n.number}${n.label ? ` (${n.label})` : ""}`).join("  ")
      : "nothing published as a tel link";
    console.log(`${body.id.padEnd(16)} ${line}`);
    if (hit) {
      proposals.push({
        id: body.id,
        source: hit.source,
        verified: new Date().toISOString().slice(0, 10),
        method: "published as a tel link on the body's own site",
        numbers: hit.numbers
      });
    }
  }

  if (out) {
    writeFileSync(out, JSON.stringify({ schema: "asli.contact-proposals.v1", proposals }, null, 2) + "\n");
    console.log(`\nWrote ${proposals.length} proposals to ${out}. Read each page, decide what each number is for, then edit the registry by hand.`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
