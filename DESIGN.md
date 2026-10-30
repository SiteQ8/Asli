# Asli design system

The site looks like security printing: cool security paper, teal intaglio line
work, a touch of gold foil, and verdicts that land like an official stamp. It is
Arabic first and right to left, with English one tap away, so every layout rule
is written with logical properties and holds in both directions.

The values below are the ones in `docs/style.css`. When this file and the
stylesheet disagree, the stylesheet is the truth and this file is out of date.

## Colour

Light is the default; dark follows the visitor's system setting.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--paper` | `#EEF3F1` | `#0D1B18` | Page background |
| `--paper-2` | `#F7FAF9` | `#132522` | Filled surfaces: forms, results, the footer, the language strip |
| `--ink` | `#10302A` | `#E4EFEB` | Text, primary buttons |
| `--ink-2` | `#45605A` | `#A7BCB6` | Secondary text, labels |
| `--rule` | `#C3D1CC` | `#27433D` | Lines inside registers, tables and form fields |
| `--line` | `#236B68` | `#5DB3AD` | Links, focus, selected states, the seal |
| `--foil` | `#9C7A2E` | `#CDA650` | Decorative accents only, never small text |
| `--fake` / `--fake-bg` | `#B42318` / `#FBE9E7` | `#FF7A6B` / `#3A1512` | Scam and impersonation verdicts, urgent help |
| `--genuine` / `--genuine-bg` | `#146B3F` / `#E1F2E8` | `#52C48D` / `#10301F` | Official verdicts, done |
| `--unknown` / `--unknown-bg` | `#8F5200` / `#FAEFD9` | `#F0B45A` / `#33240C` | Unverified verdicts, in progress |

A verdict is never told by colour alone: the stamp carries the word, and every
status in a list carries its label.

## Type

Two faces. Markazi Text for everything, Aref Ruqaa for the brand mark and the
word in the seal. Body text is 21px in Arabic and 19px in English. Headings are
bold and balanced; the home question runs from 40px to 72px, page titles from
34px to 54px, section headings from 26px to 40px. Reading width stays near 68
characters. Numbers in registers use tabular figures. Arabic text uses Arabic
digits and Arabic punctuation.

## Space, shape and motion

Spacing sits on a 4px base: `--s-1` 4px, `--s-2` 8px, `--s-3` 12px, `--s-4`
16px, `--s-5` 24px, `--s-6` 32px, `--s-7` 48px, `--s-8` 64px, `--s-9` 96px.
Corners are 3px; pills are only for chips. There are no shadows.

Motion uses two curves, `--ease-out` `cubic-bezier(0.23, 1, 0.32, 1)` and
`--ease-in-out` `cubic-bezier(0.77, 0, 0.175, 1)`. Anything a person triggers
finishes within 300ms. Buttons and chips press to 0.97. Hover effects only
apply to devices that hover. The seal draws itself once on the home page, and
the verdict stamp lands when a check finishes; nothing else moves on its own.
Reduced motion turns all of it off.

## Rules

- Sections are separated by space and tone. Lines belong to registers, tables
  and form fields.
- No label above a heading, no numbered sections unless the order is the
  advice (the help page steps), no coloured side stripes on boxes.
- No gradients, no blur, no glass, no shadows, no monospace.
- Icons are drawn as SVG or with CSS, never typed as characters.
- A surface is either filled or outlined, not both, except form fields and
  the urgent cards on the help page.
- The header and the footer sit on `--paper-2`, so they separate from the page
  by tone rather than by a line.

## Pages

| Page | Holds |
| --- | --- |
| `index.html` | The real check in the first screen, then what Asli knows today, read from the published data |
| `check.html` | The check alone, the start page of the installed app |
| `report.html` | A report cleaned of the reporter's details on the device |
| `help.html` | The first hour after a scam, in order |
| `registry.html` | Every official body with its domains, numbers and policies, and the open data files |
| `about.html` | How Asli works and why, the roadmap and the progress on the first steps |

Every page shares one header and one footer. They are written once in
`tools/shell/` and stamped into each page by `node tools/build-shell.mjs`; the
tests fail if a page drifts. `docs/site.js` handles the language, marks the
current page and fills the build line. A new page needs the two empty shell
markers, `site.js`, and an entry in the service worker's precache list.

## What updates itself

The home page and the registry page draw from `docs/data/`: the registry, the
feed, `meta.json`, `changes.json` (the releases) and `ecosystem.json` (related
SiteQ8 tools). A new body, a new release or a new related tool appears on the
site as soon as the data is rebuilt, with no edit to any page.
