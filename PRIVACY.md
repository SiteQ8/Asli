# Privacy notice

Short version: Asli is built so that there is almost nothing to protect, because
almost nothing is collected.

## The site and the checker

- The check page runs entirely in your browser. The message you paste is never
  sent anywhere, and Asli has no server that could receive it.
- That promise is enforced by the browser, not only stated here. Every page
  carries a Content Security Policy that lets scripts come only from the site
  itself and lets them fetch only the site's own data files. A bug, a browser
  extension injecting code, or a tampered copy of a script could not send your
  message anywhere the policy does not list, and the policy lists nowhere.
- There are no analytics, no advertising and no tracking scripts on any page.
- The only outside request the pages make is to Google Fonts for two typefaces.
  If you block it, everything still works with your system fonts.
- A message you share into Asli from your messaging app arrives on the check
  page through the address bar. The offline worker serves the page from your
  device without sending that address to any server, and the page removes the
  message from the address bar as soon as it has read it, so it does not stay
  in your history or in a bookmark.
- The optional sender field is checked on your device like the rest of the
  message.
- One thing is stored on your own device: your language choice, under the key
  `asli.lang`. Clearing site data removes it.
- The site is hosted on GitHub Pages, so GitHub sees the request that fetches the
  page, as it does for any site hosted there.

## Reports people send

Reports are redacted on the device before they go anywhere: civil ID numbers,
IBANs, card and account numbers and email addresses are stripped, phone numbers
are listed so the person can drop their own, and the person reads the cleaned
text before sending it. A report is opened by the person themselves, as a public
issue on GitHub, and there is no account with Asli to create.

## What the published data contains

The registry holds public institutional channels. The feed holds scam domains,
scam numbers and scam sender names. Neither contains personal data about
victims, reporters or anyone else, and a report is never republished as received.

## Legal basis and standards

The project follows the principles of CITRA's Data Privacy Protection Regulation,
Resolution No. 26 of 2024: collect the minimum, say what it is for, keep it only
as long as needed, and let people ask what is held about them.

## Questions

Ask in a GitHub issue, or use the contact in [SECURITY.md](SECURITY.md) if the
question involves anything sensitive.
