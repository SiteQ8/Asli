# Asli | أَصْلي

Kuwait's open scam shield: a verified registry of the genuine official channels and a reviewed feed of confirmed scam links and numbers, so anyone can check a message in seconds and any bank, telco or app can plug it in.

**Status: version 0.4, September 2026.** The registry of genuine official channels is live with 36 Kuwaiti bodies, including the ministries, nine banks, the telcos, the couriers and customs. The check page runs in the browser against it and keeps working with no connection, the report page cleans a message on the device, a scheduled job watches certificate transparency for lookalikes, and an MCP server gives assistants the same answers. The scam feed exists in all eight formats and is deliberately empty: nothing is listed until two reviewers approve it with evidence.

- Check a message: [asli.3li.info/check.html](https://asli.3li.info/check.html)
- Report a scam: [asli.3li.info/report.html](https://asli.3li.info/report.html), which cleans your own details off the message before anything leaves your device
- About the project: [asli.3li.info](https://asli.3li.info/)
- Install it on a phone: open the check page and add it to the home screen, then it works offline
- The data: [registry.json](https://asli.3li.info/data/registry.json), [feed.json](https://asli.3li.info/data/feed.json), [meta.json](https://asli.3li.info/data/meta.json)
- The same text to read offline: [PROJECT.md](PROJECT.md) in English, [PROJECT.ar.md](PROJECT.ar.md) in Arabic
- Rules: [listing policy](LISTING-POLICY.md), [appeals](APPEALS.md), [privacy](PRIVACY.md), [security](SECURITY.md), [contributing](CONTRIBUTING.md)
- Licence: [MIT](LICENSE) for the code, CC BY 4.0 for the registry, the feed and the awareness content

## The idea in one line

Verify the genuine, do not only chase the fake. Scam domains never run out, but Kuwait's official channels are few and knowable, so Asli publishes both lists and starts every check from the genuine one.

## What the site covers

| Section | What it answers |
| --- | --- |
| The problem | Evidence from official statements and published reports, each line with its source |
| The idea | Why a registry beats a blocklist, and why it has to be open source |
| See it work | Four sample messages checked step by step, in the browser, with no network call |
| How it works | Signals, review, open data and reach, and which existing repository each part reuses |
| Why this project was chosen | Six candidates scored against five criteria, with weights you can move yourself |
| Roadmap | Five phases over twelve months, each with an exit test |
| Trust and governance | Evidence, two approvals, expiry, appeals, privacy and neutrality |
| Measures, risks, audiences | First-year targets, what can go wrong and who this serves |

## Built on existing work

Asli is new, but most of its engine already exists in these public repositories: [KWTCyberWatch](https://github.com/SiteQ8/KWTCyberWatch), [PhishWatch](https://github.com/SiteQ8/PhishWatch), [PhishBOT](https://github.com/SiteQ8/PhishBOT), [PhishHunter](https://github.com/SiteQ8/PhishHunter), [Ghirbal](https://github.com/SiteQ8/Ghirbal), [Kashif](https://github.com/SiteQ8/Kashif), [Wa3i](https://github.com/SiteQ8/Wa3i), [KaliMCP](https://github.com/SiteQ8/KaliMCP) and [KW-OS](https://github.com/SiteQ8/KW-OS).

## What is in the repository

| Path | What it holds |
| --- | --- |
| `registry/bodies/` | One JSON file per official body: domains, apps, channel policies, sources, verification date. See [registry/README.md](registry/README.md) |
| `feed/entries/` | One JSON file per confirmed scam indicator, with evidence and two approvals. See [feed/README.md](feed/README.md) |
| `docs/` | The site: the write-up, the check page, and the published data under `docs/data/` |
| `docs/checker.js` | The checking logic itself, the same code in the browser and in the tests |
| `docs/redact.js` | On-device redaction for reports: civil ID, IBAN, card and account numbers and email addresses go, the scam's own links and numbers stay |
| `watch/` | The certificate watch: how it works, and a public state file that holds hashes rather than names |
| `mcp/` | An MCP server so assistants can check messages and domains against the registry. See [mcp/README.md](mcp/README.md) |
| `tools/` | Builders, the watcher, the scorer and the verifiers, all on the Node standard library |
| `tests/` | 80 checks that fail the build on a bad entry, a stale file or a broken translation |

## Detection

Every public TLS certificate is written to a certificate transparency log, so a
scam site announces itself hours before the first message goes out. A scheduled
job reads those logs, scores each name against the registry, and raises the ones
that borrow a Kuwaiti brand.

The scoring is conservative on purpose: a name scores nothing unless it carries a
brand the registry knows, so `nbkkuwait.example` and `b0ubyan-kw.example` are
raised while `nbkwealth.ch` and `kibble.example` are left alone. An official
domain always scores zero, so the watch can never flag the channels it protects.

Candidate names are not published. A name that borrows a brand is not yet a scam,
and an unreviewed accusation would harm whoever owns it. The public state file
keeps a hash per name so the watcher does not repeat itself, logs carry counts
only, and candidates go to a private review queue if one is configured. What
becomes public is a listing, after two reviewers approve it with evidence. The
whole method, including every threshold and word list, is in this repository and
covered by tests. See [watch/README.md](watch/README.md).

## Working on it

Every word on the site and in both PROJECT files comes from one file, `docs/content.js`, as an Arabic and English pair. The tests enforce that pairing, so the two languages cannot drift apart. The published data under `docs/data/` is generated, never hand edited.

```sh
node --test                             # everything: content, registry, feed, checker, offline shell, generated files
node tools/build-data.mjs               # rebuild docs/data after editing registry/ or feed/
node tools/build-project-md.mjs         # rebuild PROJECT.md and PROJECT.ar.md after editing content.js
node tools/ct-watch.mjs --days 2         # read the certificate logs and score what is new
node mcp/asli-mcp.mjs --local           # run the MCP server against the local data
node tools/verify-domains.mjs           # confirm every listed official domain still answers
node tools/find-contacts.mjs            # collect contact numbers bodies publish, as proposals to review
node tools/check-links.mjs              # confirm every cited source is still reachable
```

The site itself is plain HTML, CSS and JavaScript in `docs/`, with no build step and no dependencies. Rendering the share image needs a headless browser: `npm i playwright && node tools/render-og.mjs`.

## Contributing

Comments are open now. Corrections to the evidence are the most useful contribution: open an issue with the claim, the source and the date. Listing policy, appeals and the privacy notice land in Phase 0, before the first entry goes in.

## Author

Ali AlEnezi, Kuwait. [github.com/SiteQ8](https://github.com/SiteQ8)
