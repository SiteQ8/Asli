# The watch

Every public TLS certificate is written to a certificate transparency log. A scam
site usually gets its certificate hours before the first message goes out, so the
logs are where Asli looks first.

`tools/ct-watch.mjs` reads those logs through crt.sh, scores every name against
the registry with `tools/lookalike.mjs`, and writes the ones that borrow a
Kuwaiti brand. It runs on a schedule in GitHub Actions.

## What is public here, and what is not

A name that borrows a brand is not yet a scam. It might be the body's own new
service, a reseller, a fan page, or a company that happens to share three
letters. Publishing an unreviewed accusation would do real harm to whoever owns
the name, and it would also tell the scammer exactly what was spotted.

So:

- **Candidate names are never written to this repository.** They stay on the
  runner and go to a private review queue if one is configured.
- **`seen.json` holds hashes, not names.** It stops the watcher from looking at
  the same name twice. A hash tells you nothing about the name behind it.
- **A candidate is only marked seen once a queue has it.** An innocent name is
  recorded straight away, but a candidate stays unseen until the private queue
  confirms it received it. A candidate found on a day with no queue, or on a
  day the queue was down, comes back on the next run instead of being lost.
- **Logs and job summaries carry counts only.** How many queries ran, how many
  names were read, how many candidates came out.
- **The method is completely open.** The scoring, the thresholds, the queries and
  the word lists are all in this repository and covered by tests.

What eventually becomes public is a listing in the scam feed, after two reviewers
have approved it with evidence, under [the listing policy](../LISTING-POLICY.md).

## How a name is scored

A name scores nothing unless it carries a brand the registry knows. Keyword noise
on its own never produces a candidate, because a queue full of false positives is
a queue nobody reviews.

| Signal | Points |
| --- | --- |
| Carries an official domain as a label, such as `moi.gov.kw.pay.example` | 50 |
| Brand written with swapped characters, such as `nbk` as `nbk` with a zero | 45 |
| Brand as a whole label, or glued to a common word | 40 |
| Brand inside a longer label, for brands of five letters or more | 35 |
| Action words: login, verify, pay, fine, wallet, customs and so on | 15 each, up to 30 |
| Punycode, so the name can imitate other letters | 20 |
| Free hosting such as workers.dev or pages.dev | 15 |
| Points at Kuwait in the name | 10 |
| Cheap top level domain such as .top or .xyz | 10 |
| Digits mixed into the name | 5 |

50 points makes it a candidate. An official domain from the registry always
scores zero, so the watch can never flag the very channels it protects, and an
official domain that appears as a label only counts when other labels follow it,
so a country variant such as a bank's Turkish site stays clear while
`moi.gov.kw.pay.example` does not.

Signals are removed when they prove noisy. Counting hyphens was one: it flagged
long infrastructure hostnames belonging to the banks themselves, which is exactly
the kind of noise that makes a review queue useless.

## When the source is down

crt.sh is free and often busy, and it frequently refuses requests from GitHub's
runners. The watch is built around that rather than pretending otherwise:

- Each run works to a time budget and starts where the last run stopped, so
  every brand gets its turn over a day even when a run only reaches part of the
  list.
- If the first four queries all fail, the source is treated as down and the run
  stops instead of burning its budget on retries.
- The run records its health in `seen.json` and the site publishes it in
  `meta.json`: `ok`, `degraded` or `down`, with how many queries ran and failed.
  A run that could not reach the source commits a message saying so, never a
  message claiming it found nothing.

A second, independent source is the real fix. A small always on host running a
certificate stream would not depend on crt.sh at all, and it would feed the same
scorer and the same private queue.

## Running it by hand

```sh
node tools/ct-watch.mjs --days 2                    # a real run
node tools/ct-watch.mjs --fixture names.json --dry-run   # offline, no state change
```

The fixture form takes a JSON array of names and never touches the network, which
is how the tests exercise it.

## Turning on the private queue

The queue is the private repository `SiteQ8/asli-review`, already created with
the labels the workflow uses, and the repository variable `REVIEW_REPO` already
points at it. One thing is left, and it is deliberately left to the owner:

- a secret named `REVIEW_TOKEN` in this repository, holding a fine grained token
  that can do exactly one thing, open issues in `SiteQ8/asli-review`

Until that secret exists the workflow still runs, reports counts, and holds the
candidates: they come back on every run rather than being published or lost.
