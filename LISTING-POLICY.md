# Listing policy

This is the rule set that decides what Asli publishes. It exists before the first
listing, not after the first complaint.

## What can be listed

An indicator goes in the scam feed only when all of these hold:

1. It impersonates a Kuwaiti official body, bank, telco or courier, or it targets
   people in Kuwait with a fraudulent payment, credential or document request.
2. There is evidence: a capture of the page or message, the time it was captured,
   and where it came from.
3. Two reviewers have independently approved it. An automated score, or an agent,
   can propose a listing. It cannot publish one.
4. The reason is written in plain words, as a fact rather than an opinion.

## What is never listed

- A site that is merely unpopular, poorly built, or a competitor of someone.
- A site that criticises a person or an institution.
- Anything listed because someone paid, asked as a favour, or holds a position.
  Sponsorship funds the work and can never buy a listing or a removal.
- Personal data. The feed carries domains, numbers and sender names, nothing else.
- Any domain in the registry of genuine official channels. The tests block this.

## Expiry

Every listing expires after 90 days unless it is confirmed again. Domains change
hands, and a listing that outlives the scam punishes the next owner.

This is enforced by the build rather than left to memory: an expired entry drops
out of all eight published formats on the next daily rebuild, whether or not
anyone remembers it, and the removal is counted in `meta.json`.

The registry has a matching promise in the other direction. Every official entry
is re-verified within 90 days, and a weekly job opens an issue for any entry that
is overdue or any official domain that stops answering.

## Removal and appeal

Anyone can ask for a listing to be removed, including the owner of the domain.
The route and the timing are in [APPEALS.md](APPEALS.md). Every removal is
recorded in the public history with its reason, exactly like a listing.

## Mistakes

Asli will get some listings wrong. When that happens: remove it first, then
publish what went wrong and what changed, in the monthly report. No quiet edits.

## Who decides

Until the governance charter in Phase 4, the maintainer plus one reviewer form
the two approvals, and the maintainer is Ali AlEnezi. Reviewers are named in the
repository, and each approval is recorded against the entry.
