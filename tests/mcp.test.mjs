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
    ["check_domain", "check_message", "check_number", "official_channels", "registry_status"]
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

test("check_message takes the sender and reports the hidden and bare links", async () => {
  const call = await json("check_message", {
    text: "Burgan Bank: your account is suspended, call back now",
    channel: "call",
    sender: "+965 5551 2345"
  });
  assert.equal(call.verdict, "impersonation");
  assert.equal(call.sender, "55512345");
  assert.ok(call.numbers_in_message_not_published_by_it.includes("55512345"));

  const links = await json("check_message", {
    text: "Ministry of Interior: see bit.ly/x1 or http://185.220.101.5/pay",
    channel: "sms"
  });
  assert.deepEqual(links.shortened_links, ["bit.ly"]);
  assert.deepEqual(links.bare_address_links, ["185.220.101.5"]);
  assert.equal(links.verdict, "impersonation");

  const published = await json("check_message", { text: "Burgan Bank: about your account", channel: "call", sender: "1804080" });
  assert.equal(published.sender_matches.body, "Burgan Bank");
  assert.ok(published.sender_matches.how.includes("fake"), "a matching number is never sold as proof");
  assert.notEqual(published.verdict, "official");
});

test("check_number says published, unknown or listed, and never fake", async () => {
  const burgan = await json("check_number", { number: "1804080" });
  assert.equal(burgan.status, "published");
  assert.equal(burgan.body, "Burgan Bank");
  assert.ok(burgan.source.startsWith("https://"));

  const cyber = await json("check_number", { number: "+965 9728 3939" });
  assert.equal(cyber.status, "published");
  assert.equal(cyber.body, "Ministry of Interior");

  const unknown = await json("check_number", { number: "55512345" });
  assert.equal(unknown.status, "unknown");
  assert.ok(unknown.note.includes("not fake"));

  await assert.rejects(() => callTool("check_number", {}), /number is required/);
  await assert.rejects(() => callTool("check_number", { number: "not a number" }), /digits/);
});

test("the sector list offered to assistants matches the sectors the registry uses", async () => {
  const tool = TOOLS.find((t) => t.name === "official_channels");
  const status = await json("registry_status", {});
  for (const sector of status.registry.sectors) {
    assert.ok(tool.inputSchema.properties.sector.enum.includes(sector), `the ${sector} sector cannot be asked for`);
  }
});
