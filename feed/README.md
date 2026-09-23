# The scam feed

Confirmed scam indicators: domains, phone numbers and sender names that have
been reviewed by two people and published with their evidence. One JSON file per
indicator in `entries/`, built into eight formats under
[asli.3li.info/data](https://asli.3li.info/data/feed.json) under CC BY 4.0.

**The feed is empty today.** It stays empty until the review process described in
[LISTING-POLICY.md](../LISTING-POLICY.md) has produced its first listing. An
empty feed that is honest is worth more than a full one that is not, because
every consumer of this data acts on it: a bank blocks, a resolver refuses, a
person decides whether to pay.

## An entry

```json
{
  "type": "domain",
  "value": "example-scam.test",
  "listed": "2026-10-20",
  "expires": "2027-01-18",
  "reason": "Copies the Ministry of Interior fine payment page and collects card details",
  "evidence": [
    { "kind": "screenshot", "sha256": "...", "captured": "2026-10-20T08:14:00Z" },
    { "kind": "certificate", "note": "Issued 2026-10-19, seen in certificate transparency" }
  ],
  "approvals": ["reviewer-a", "reviewer-b"],
  "appeal": "https://github.com/SiteQ8/Asli/issues/00"
}
```

Rules the tests enforce:

- `expires` must be after `listed`. Nothing is listed forever, because domains
  change hands and a stale listing punishes whoever owns the name next.
- Two approvals are required. One person, or one agent, cannot list anything.
- Evidence is required, and it is what an appeal is judged against.
- An official domain from the registry can never appear here.

## Formats

`feed.json`, `feed.csv`, `feed.txt`, `hosts.txt`, `adguard.txt`, `rpz.zone`,
`feed.stix2.json` and `feed.misp.json`, all rebuilt by
`node tools/build-data.mjs`. Pick whichever your tool already speaks.
