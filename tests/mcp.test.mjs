/*
  MCP server tests. Run with: node --test

  The server is exercised through the same entry points a client uses, against
  the repository's own published data, so a change that breaks an assistant
  integration fails here first.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
/* The tests read the repository's own data files, so they pass with no network. */
process.env.ASLI_DATA = "local";

const { TOOLS, callTool, handle } = await import("../mcp/asli-mcp.mjs");

const json = async (name, args) => JSON.parse((await callTool(name, args)).content[0].text);

test("the handshake answers with a protocol version and the tool list", async () => {
  const init = await handle({ id: 1, method: "initialize", params: {} });
  assert.match(init.protocolVersion, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(init.serverInfo.name, "asli");
  const list = await handle({ id: 2, method: "tools/list", params: {} });
  assert.deepEqual(
    list.tools.map((t) => t.name).sort(),
    ["check_domain", "check_message", "official_channels", "registry_status"]
  );
});

test("every tool describes itself well enough to be picked correctly", () => {
  for (const tool of TOOLS) {
    assert.ok(tool.description.length > 60, `${tool.name} needs a fuller description`);
    assert.equal(tool.inputSchema.type, "object");
    for (const required of tool.inputSchema.required || []) {
      assert.ok(tool.inputSchema.properties[required], `${tool.name}: ${required} is required but not described`);
    }
  }
});

test("an unknown method and an unknown tool both fail cleanly", async () => {
  await assert.rejects(() => handle({ id: 3, method: "nonsense", params: {} }), /method not found/);
  await assert.rejects(() => callTool("nonsense", {}), /unknown tool/);
  await assert.rejects(() => callTool("check_message", {}), /text is required/);
});

test("check_message returns a verdict with the reasoning behind it", async () => {
  const out = await json("check_message", {
    text: "وزارة الداخلية: مخالفة مرورية، ادفع خلال ٢٤ ساعة عبر moi-kw-fines.example",
    channel: "sms"
  });
  assert.equal(out.verdict, "impersonation");
  assert.equal(out.claims_to_be, "Ministry of Interior");
  assert.ok(out.lookalike_links.some((l) => l.host === "moi-kw-fines.example"));
  assert.ok(out.broken_policies.length, "the Sahel policy should be reported");
  assert.ok(out.advice.includes("bank"));
});

test("check_domain separates official, lookalike and unknown", async () => {
  assert.equal((await json("check_domain", { domain: "moi.gov.kw" })).status, "official");
  assert.equal((await json("check_domain", { domain: "services.moi.gov.kw" })).status, "official");
  assert.equal((await json("check_domain", { domain: "https://nbkkuwait.example/login" })).status, "lookalike");
  assert.equal((await json("check_domain", { domain: "some-shop.example" })).status, "unknown");
});

test("official_channels finds a body and never invents a channel", async () => {
  const found = await json("official_channels", { query: "interior" });
  assert.equal(found.length, 1);
  assert.deepEqual(found[0].domains, ["moi.gov.kw"]);
  assert.ok(found[0].policies[0].source.startsWith("https://"));
  assert.ok(found[0].note.includes("not documented yet"));

  const banks = await json("official_channels", { sector: "bank" });
  assert.ok(banks.length >= 9, `expected the banks, found ${banks.length}`);
  for (const bank of banks) assert.ok(bank.domains.length, `${bank.id} has no domain`);
});

test("registry_status reports the counts and where to download the data", async () => {
  const status = await json("registry_status", {});
  assert.ok(status.registry.bodies >= 25);
  assert.equal(typeof status.feed.total, "number");
  assert.ok(status.downloads.every((url) => url.startsWith("https://asli.3li.info/data/")));
  assert.ok(status.listing_rule.includes("two reviewers"));
  assert.equal(status.data_source, "local files");
});
