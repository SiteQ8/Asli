# Security

## Reporting a vulnerability

Use GitHub's private vulnerability reporting on this repository, under the
Security tab. That route is private by default and reaches the maintainer.

Please include what you found, how to reproduce it, and what an attacker could do
with it. You will get an acknowledgement within 72 hours.

Please do not open a public issue for a vulnerability, and please do not test
against anyone else's systems: the registry lists other organisations' domains,
and they are not in scope for testing under any circumstances.

## Scope

In scope: this repository, the published site at asli.3li.info, the data files it
serves, and the workflows that build them.

Out of scope: the Kuwaiti institutions listed in the registry, GitHub itself, and
anything that requires access to a maintainer's account or device.

## What Asli does on its own side

- Releases are signed and versioned, and the data files are rebuilt from source
  by a workflow rather than uploaded by hand.
- Two approvals are needed before anything is listed in the feed.
- The site is static, with no server, no database and no user accounts, so there
  is no login to steal and no data store to breach.
- Dependencies are deliberately near zero: the site ships plain HTML, CSS and
  JavaScript, and the tests run on the Node standard library alone.
