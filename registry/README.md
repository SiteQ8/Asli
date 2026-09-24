# The registry

The registry answers one question: which channels genuinely belong to a Kuwaiti
official body? One JSON file per body, in `bodies/`, published as a single file
at [asli.3li.info/data/registry.json](https://asli.3li.info/data/registry.json)
under CC BY 4.0.

Nothing here is guessed. A field that has not been verified is left empty rather
than filled with a plausible value, because a wrong entry in this file is worse
than a missing one: it can make a scam look genuine.

## Fields

| Field | Meaning |
| --- | --- |
| `id` | Short slug, lowercase, also the file name |
| `sector` | `government`, `bank`, `telecom`, `association`, `courier`, `utility` or `airline` |
| `name` | Display name, Arabic and English |
| `claims` | Phrases a message uses to claim it comes from this body, per language, lowercase. The full name, and the short brand name a message actually uses, such as `nbk` or `zain`, when that name cannot mean anything else. A common word is left out even when it is also a brand, so that a parcel message mentioning customs still reads as claiming the courier |
| `tokens` | Brand words a squatting domain would borrow, lowercase Latin |
| `domains` | Bare hosts the body really owns, with no scheme and no path |
| `apps` | Official apps, each with a publisher and at least one store link |
| `senders` | Verified SMS sender names. Empty until each one is documented. The checker reports a match as information and nothing more, because a sender name can be faked, while a sender name in the scam feed is a listing |
| `hotlines` | Numbers the body publishes on its own site, each with a source, a date and how it was checked |
| `policies` | What this body will never do, each with trigger words and a source |
| `sources` | Where the entry was verified from |
| `verified` | Date of the last check, `YYYY-MM-DD` |

## How a domain gets in

1. The domain resolves and answers over HTTPS on the verification date.
2. It is reachable from the body's own published site, or the body states it.
3. The check date goes in `verified`, and the source goes in `sources`.

Re-verification is due every 90 days. A domain that stops resolving is not
deleted straight away: domains move, and a dropped entry can be a scam's opening.
It is marked and reviewed.

## How a number gets in

Only from an explicit `tel:` link on the body's own site. A number typed into
running text can be a branch, a supplier, a form placeholder or a person, while a
`tel:` link is the body publishing a number for people to call.

`node tools/find-contacts.mjs --out proposals.json` collects candidates. It
writes a proposal and never the registry, because a number that reaches somebody
mid panic has to be right. A human opens the page, decides what the number is
for, and edits the body file.

What the entry claims is narrow on purpose: these are numbers the body publishes,
not all of its numbers, and not a fraud hotline unless the body says so. The
checker words it the same way, so it can say "this is not among the numbers the
bank publishes" without ever claiming a number is fake, and when the number is
the one that called, it says the body publishes it without ever claiming that
is who called, because a caller id can be faked.

## How a policy gets in

A policy is a public promise about channels, such as "fines arrive only in
Sahel". It needs:

- `text` in both languages, written as the body stated it
- `channels`, the delivery paths where the promise applies
- `words`, the trigger words in both languages that put a message inside its scope
- `source`, a public statement from the body or a report of one

A policy that cannot cite a source does not go in. The checker uses these to say
"this message breaks a published policy", so an invented policy would be a lie
with an official face on it.

## Changing the registry

Open a pull request that edits one body file, or open an issue with the change
and the source. Tests enforce the schema, both languages, and that no official
domain can ever appear in the scam feed. Run them with `node --test`.
