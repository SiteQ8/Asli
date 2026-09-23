#!/usr/bin/env node
/*
  Asli MCP server.

  Lets an assistant check a message, look up a domain, or read Kuwait's registry
  of genuine official channels, without a browser and without an account.

  Run it over stdio:

    node mcp/asli-mcp.mjs

  Or point any MCP client at this file. It speaks JSON-RPC 2.0 over stdin and
  stdout, implements the Model Context Protocol handshake, and depends on
  nothing outside the Node standard library.

  Data comes from the published files at asli.3li.info, fetched once and cached
  for an hour. Pass --local, or set ASLI_DATA=local, to read the repository's own
  docs/data instead. If the network fails, it falls back to those files rather
  than answering with nothing, and says so.

  The checking logic is the same docs/checker.js the website runs. One engine,
  one set of answers.
*/
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline";
import vm from "node:vm";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const SITE = "https://asli.3li.info";
const CACHE_MS = 60 * 60 * 1000;
const isLocal = () => process.argv.includes("--local") || process.env.ASLI_DATA === "local";

export function loadChecker() {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(join(ROOT, "docs/checker.js"), "utf8"), sandbox, { filename: "checker.js" });
  return sandbox.AsliChecker;
}

const Checker = loadChecker();
let cache = { at: 0, bodies: [], feed: { domains: [], numbers: [], senders: [] }, meta: null };

function readLocal(name) {
  return JSON.parse(readFileSync(join(ROOT, "docs/data", name), "utf8"));
}

export async function data(force = false) {
  if (!force && cache.at && Date.now() - cache.at < CACHE_MS) return cache;
  const fromDisk = () => ({
    at: Date.now(),
    bodies: readLocal("registry.json").bodies,
    feed: readLocal("feed.json"),
    meta: readLocal("meta.json"),
    source: "local files"
  });

  if (isLocal()) {
    cache = fromDisk();
    return cache;
  }

  try {
    const [registry, feed, meta] = await Promise.all(
      ["registry.json", "feed.json", "meta.json"].map((f) =>
        fetch(`${SITE}/data/${f}`, { headers: { accept: "application/json" } }).then((r) => {
          if (!r.ok) throw new Error(`${f}: http ${r.status}`);
          return r.json();
        })
      )
    );
    cache = { at: Date.now(), bodies: registry.bodies, feed, meta, source: SITE };
  } catch {
    cache = fromDisk();
  }
  return cache;
}

/* Tools */

const TOOLS = [
  {
    name: "check_message",
    description:
      "Check whether a message claims to be from a Kuwaiti official body, bank or telco that the registry does not recognise. Returns a verdict of listed, impersonation, official or unverified, with the findings behind it. Use this for any suspicious SMS, WhatsApp message, email or call transcript aimed at someone in Kuwait.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "The message, exactly as it was received, in any language" },
        channel: {
          type: "string",
          enum: ["sms", "imessage", "whatsapp", "email", "call", "social", "app", "web", "unknown"],
          description: "How it arrived, which decides whether a channel policy applies"
        }
      },
      required: ["text"]
    }
  },
  {
    name: "check_domain",
    description:
      "Look up a single domain or host. Says whether it belongs to a Kuwaiti official body, whether it is in the confirmed scam feed, or whether the registry has never heard of it.",
    inputSchema: {
      type: "object",
      properties: { domain: { type: "string", description: "A host such as moi.gov.kw, with no scheme and no path" } },
      required: ["domain"]
    }
  },
  {
    name: "official_channels",
    description:
      "List the genuine channels of a Kuwaiti official body: its domains, official apps, and the policies it has published about what it will never ask for. Omit the query to list every body in the registry.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Part of a body's name or id, such as interior, nbk or zain" },
        sector: { type: "string", enum: ["government", "bank", "telecom", "association", "courier", "utility"] }
      }
    }
  },
  {
    name: "registry_status",
    description: "How much is in the registry and the scam feed right now, when they were built, and where to download each published format.",
    inputSchema: { type: "object", properties: {} }
  }
];

function text(value) {
  return { content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] };
}

function feedIndex(feed) {
  return {
    domains: (feed.domains || []).map((d) => ({ domain: d.domain, reason: d.reason, expires: d.expires })),
    numbers: (feed.numbers || []).map((n) => ({ number: n.number, reason: n.reason, expires: n.expires }))
  };
}

function summarise(result) {
  return {
    verdict: result.verdict,
    meaning: {
      listed: "In the confirmed scam feed, reviewed by two people",
      impersonation: "Claims an official identity the registry does not confirm",
      official: "The links belong to an official channel the registry knows",
      unverified: "The registry has never heard of this sender, which does not make it safe"
    }[result.verdict],
    claims_to_be: result.claimed ? result.claimed.name.en : null,
    links: result.hosts,
    numbers: result.phones,
    official_links: result.official.map((o) => ({ host: o.host, body: o.body.name.en })),
    lookalike_links: result.lookalike.map((l) => ({ host: l.host, imitates: l.body.name.en })),
    unknown_links: result.unknown,
    in_scam_feed: result.listed,
    broken_policies: result.broken.map((b) => ({ body: b.body.name.en, policy: b.policy.text.en, source: b.policy.source })),
    numbers_the_body_publishes: result.published,
    numbers_in_message_not_published_by_it: result.unpublishedNumbers,
    pressure_tactics: result.pressure,
    advice:
      result.verdict === "official"
        ? "Use the official app or site directly, and never share a one-time code."
        : result.verdict === "unverified"
          ? "Verify through a channel you already trust, such as the number printed on your card."
          : "Do not open the links, do not pay and do not send any code. If you already did, call your bank now and report it to the Ministry of Interior."
  };
}

async function callTool(name, args) {
  const store = await data();
  if (name === "check_message") {
    if (!args || !args.text) throw new Error("text is required");
    const result = Checker.check({ text: args.text, channel: args.channel || "unknown" }, { bodies: store.bodies, feed: feedIndex(store.feed) });
    return text(summarise(result));
  }

  if (name === "check_domain") {
    if (!args || !args.domain) throw new Error("domain is required");
    const host = String(args.domain).trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0];
    for (const body of store.bodies) {
      for (const domain of body.domains) {
        if (Checker.isUnder(host, domain)) {
          return text({ host, status: "official", body: body.name.en, arabic: body.name.ar, sector: body.sector, verified: body.verified, sources: body.sources });
        }
      }
    }
    const listed = (store.feed.domains || []).find((d) => Checker.isUnder(host, d.domain));
    if (listed) return text({ host, status: "listed", reason: listed.reason, listed: listed.listed, expires: listed.expires });

    const imitated = [];
    for (const body of store.bodies) {
      for (const token of body.tokens) {
        if (Checker.imitates(host, token)) {
          imitated.push({ imitates: body.name.en, brand: token });
          break;
        }
      }
    }
    return text({
      host,
      status: imitated.length ? "lookalike" : "unknown",
      imitates: imitated,
      note: imitated.length
        ? "This host borrows an official brand and is not one of its domains. Treat it as impersonation until proven otherwise."
        : "The registry has never heard of this host. Unknown does not mean safe."
    });
  }

  if (name === "official_channels") {
    const query = (args && args.query ? String(args.query) : "").toLowerCase();
    const sector = args && args.sector;
    const found = store.bodies.filter((b) => {
      if (sector && b.sector !== sector) return false;
      if (!query) return true;
      return (
        b.id.includes(query) ||
        b.name.en.toLowerCase().includes(query) ||
        b.name.ar.includes(query) ||
        b.tokens.some((t) => t.includes(query)) ||
        (b.claims.en || []).some((c) => c.includes(query))
      );
    });
    return text(
      found.map((b) => ({
        id: b.id,
        name: b.name.en,
        arabic: b.name.ar,
        sector: b.sector,
        domains: b.domains,
        apps: (b.apps || []).map((a) => ({ name: a.name.en, publisher: a.publisher, ios: a.ios, android: a.android })),
        published_numbers: (b.hotlines || []).map((h) => ({ number: h.number, what: h.label ? h.label.en : null, source: h.source, verified: h.verified })),
        policies: (b.policies || []).map((p) => ({ policy: p.text.en, applies_to: p.channels, source: p.source })),
        verified: b.verified,
        note: "Listed numbers are what the body publishes on its own site, which does not mean they are all of its numbers. Sender names are not documented yet, so their absence means unverified rather than nonexistent."
      }))
    );
  }

  if (name === "registry_status") {
    const meta = store.meta || {};
    return text({
      site: SITE,
      registry: meta.registry,
      feed: meta.feed,
      watch: meta.watch,
      generated: meta.generated,
      downloads: (meta.formats || []).map((f) => `${SITE}/data/${f}`),
      data_source: store.source,
      licence: "CC BY 4.0",
      listing_rule: "Nothing enters the feed without two reviewers and stored evidence, and every listing expires after 90 days."
    });
  }

  throw new Error("unknown tool: " + name);
}

/* JSON-RPC over stdio */

function send(message) {
  process.stdout.write(JSON.stringify(message) + "\n");
}

async function handle(request) {
  const { id, method, params } = request;
  if (method === "initialize") {
    return {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "asli", version: "0.3.0", title: "Asli, Kuwait's open scam shield" }
    };
  }
  if (method === "tools/list") return { tools: TOOLS };
  if (method === "tools/call") return callTool(params.name, params.arguments || {});
  if (method === "ping") return {};
  throw Object.assign(new Error("method not found: " + method), { code: -32601 });
}

async function main() {
  const lines = createInterface({ input: process.stdin });
  for await (const line of lines) {
    const raw = line.trim();
    if (!raw) continue;
    let request;
    try {
      request = JSON.parse(raw);
    } catch {
      send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } });
      continue;
    }
    if (request.id === undefined) continue; /* a notification wants no answer */
    try {
      send({ jsonrpc: "2.0", id: request.id, result: await handle(request) });
    } catch (error) {
      send({ jsonrpc: "2.0", id: request.id, error: { code: error.code || -32000, message: String(error.message || error) } });
    }
  }
}

if (process.argv[1] && process.argv[1].endsWith("asli-mcp.mjs")) await main();

export { TOOLS, callTool, handle };
