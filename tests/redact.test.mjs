/*
  Redaction tests. Run with: node --test

  Two failure modes matter, in this order. Leaking a reporter's civil ID or card
  number would be a betrayal. Stripping the scam's own link or callback number
  would make the report useless. Both are checked here.
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import vm from "node:vm";
import { ROOT } from "../tools/lib.mjs";

function load() {
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(join(ROOT, "docs/redact.js"), "utf8"), sandbox, { filename: "docs/redact.js" });
  return sandbox.AsliRedact;
}

const R = load();
const plain = (value) => JSON.parse(JSON.stringify(value));
const redact = (text, options) => plain(R.redact(text, { lang: "en", ...(options || {}) }));

test("a Kuwaiti civil id never survives", () => {
  const out = redact("My civil id is 289010112345 and I paid already");
  assert.ok(!out.text.includes("289010112345"));
  assert.ok(out.text.includes("[civil id removed]"));
  assert.equal(out.removed.civilId, 1);
});

test("card numbers go, and only real ones are treated as cards", () => {
  const out = redact("I entered 4539578763621486 on the page");
  assert.ok(!out.text.includes("4539578763621486"), out.text);
  assert.equal(out.removed.card, 1);
  assert.ok(R.luhn("4539578763621486"));
  assert.ok(!R.luhn("4539578763621487"));
});

test("an iban and an email are removed", () => {
  const out = redact("Send to KW81CBKU0000000000001234560101 or mail me at ali@example.com");
  assert.ok(!out.text.includes("KW81CBKU0000000000001234560101"));
  assert.ok(!out.text.includes("ali@example.com"));
  assert.equal(out.removed.iban, 1);
  assert.equal(out.removed.email, 1);
});

test("the scam's link is evidence and stays exactly as it was", () => {
  const text = "Pay your fine at https://moi-kw-fines.example/pay?id=99887766 within 24 hours";
  const out = redact(text);
  assert.ok(out.text.includes("https://moi-kw-fines.example/pay?id=99887766"), out.text);
  assert.equal(out.links.length, 1);
});

test("digits inside a link are never mistaken for an account number", () => {
  const out = redact("go to pay-now.example/track/123456789012 today");
  assert.ok(out.text.includes("pay-now.example/track/123456789012"), out.text);
  assert.ok(!out.text.includes("[account number removed]"));
});

test("phone numbers are kept as evidence and listed for the person to judge", () => {
  const out = redact("Call +965 2222 3333 to release your parcel");
  assert.ok(out.text.includes("+965 2222 3333"), out.text);
  assert.deepEqual(out.phones, ["22223333"]);
});

test("a number the person says is theirs is dropped on request", () => {
  const text = "Call +965 2222 3333, my own number is 99887766";
  const out = redact(text, { drop: ["99887766"] });
  assert.ok(out.text.includes("+965 2222 3333"));
  assert.ok(!out.text.includes("99887766"));
  assert.equal(out.removed.phone, 1);
});

test("a long account number is removed even when it is not a card", () => {
  const out = redact("transfer to account 1234567890123 please");
  assert.ok(!out.text.includes("1234567890123"), out.text);
  assert.ok(out.text.includes("[account number removed]"));
});

test("Arabic text is cleaned with Arabic wording and keeps its evidence", () => {
  const out = plain(R.redact("رقمي المدني 289010112345 وادفع عبر moi-kw-fines.example", { lang: "ar" }));
  assert.ok(out.text.includes("[رقم مدني محذوف]"), out.text);
  assert.ok(out.text.includes("moi-kw-fines.example"));
});

test("a clean message comes back untouched", () => {
  const text = "Your parcel is on hold at customs, pay at kwpost-delivery.example";
  const out = redact(text);
  assert.equal(out.text, text);
  assert.deepEqual(out.removed, {});
});

test("redaction does not change the length of the evidence it keeps", () => {
  const out = redact("two links: a.example and b.example, and my id 289010112345");
  assert.ok(out.text.includes("a.example"));
  assert.ok(out.text.includes("b.example"));
  assert.equal(out.links.length, 2);
});
