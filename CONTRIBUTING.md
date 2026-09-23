# Contributing

The most useful contributions right now, in order:

1. **Corrections to the registry.** A wrong official domain is the worst bug this
   project can have. If an entry is wrong or out of date, say so with a source.
2. **Missing official bodies.** Ministries, banks, telcos, couriers and utilities
   that get impersonated and are not listed yet.
3. **Channel policies.** Public statements of the form "we never ask for X" or
   "notices only arrive through Y", with a link to where the body said it.
4. **Translations.** The site speaks Arabic and English today. Hindi, Urdu,
   Malayalam, Bengali and Tagalog come in Phase 2.

## Ground rules

- Every fact carries a source. No exceptions, including for things everyone knows.
- Arabic is not an afterthought: it is the default language of the site, and
  every string exists in both languages or the tests fail.
- No dashes in prose, plain human wording, and Arabic sentences link with
  connectives rather than breaking mid sentence with a full stop.
- Do not add dependencies. The site is plain HTML, CSS and JavaScript; the tools
  run on the Node standard library.

## Before you open a pull request

```sh
node --test                             # everything
node tools/build-data.mjs               # rebuild docs/data after editing registry or feed
node tools/build-project-md.mjs         # rebuild PROJECT.md and PROJECT.ar.md after editing content
node tools/check-links.mjs              # confirm cited sources are reachable
```

CI runs the same checks. A pull request that leaves a generated file stale will
fail, which is deliberate: the published data must always match its source.

## Reporting a scam

Do not open a public issue with a live scam link and nothing else. Use the report
form, which asks for the evidence the review needs, and remember that listing
requires two approvals and stored evidence.
