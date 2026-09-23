# Asli | Kuwait's open scam shield

Version 0.1, September 2026. Nothing is built yet, and Phase 0 starts on 4 October 2026

> This file is generated from the site's content file. Do not edit it by hand.

Interactive site: https://asli.3li.info/?lang=en

Arabic version: [PROJECT.ar.md](PROJECT.ar.md)

## Is this message genuine?

Asli is an open, community-reviewed shield against scams in Kuwait. It publishes a verified registry of every genuine official channel and a live feed of confirmed scam links and numbers, so anyone can check a message in seconds and any bank, telco or app can plug it in.

Asli means genuine in Arabic, and the same word means the same thing in Hindi and Urdu.

## Scams reach everyone in Kuwait, in every language

The evidence below comes from official statements and published reports. Each line links to its source.

- About 3,000 cybercrime cases were reported in Kuwait in 2024, and fake text messages impersonating official bodies and banks were the most common type of fraud.

  [Ministry of Interior Cybercrime Department, reported by MEA Tech Watch, July 2025](https://meatechwatch.com/?p=26822)

- Since 2023, a dedicated coordination unit has shut down more than 2,300 scam websites and disconnected more than 2,200 fake WhatsApp numbers.

  [Ministry of Interior Cybercrime Department, reported by MEA Tech Watch, July 2025](https://meatechwatch.com/?p=26822)

- The Ministry of Interior sends traffic violation notices only through the Sahel app, never by text message, yet scam texts demanding payment of fines keep circulating.

  [Ministry of Interior statement, reported by Kuwait Times, 27 January 2026](https://kuwaittimes.com/article/39064/kuwait/other-news/moi-warns-against-scammers/)

- In August 2026 CITRA warned iPhone users about an iMessage phishing campaign posing as delivery and postal companies.

  [CITRA alert, reported by ARY News, 18 August 2026](https://arynews.tv/kuwait-warns-iphone-users)

- Kuwait Finance House notes that most of the fake sites behind these messages are hosted outside Kuwait.

  [Kuwait Finance House fraud warning, 2026](https://www.kfh.com/en/home/Personal/news/2026/fraudulent.html)

- More than 7 in 10 residents are expatriates: 71.5% at the end of 2025, with Indians alone above one million.

  [Public Authority for Civil Information, reported by Kuwait Times, 28 January 2026](https://kuwaittimes.com/article/39124/kuwait/other-news/kuwaits-population-grows-5/)

- 99% of the population uses the internet: 5.00 million people at the end of 2025.

  [DataReportal, Digital 2026: Kuwait](https://datareportal.com/reports/digital-2026-kuwait)

- Awareness work already exists: the Central Bank of Kuwait and the Kuwait Banking Association have run the Diraya campaign with every Kuwaiti bank since 2021.

  [Central Bank of Kuwait press release, 3 February 2021](https://www.cbk.gov.kw/en/cbk-news/announcements-and-press-releases/press-releases/2021/02/202102031030-diraya-campaign-launches-video-addressing-e-crimes)

> **Our analysis**
>
> What is missing is a public layer that machines can read: which channels are genuine, which links are confirmed scams, and what each official body will never ask you to do. Today warnings travel as images on social media in one or two languages, so they cannot be plugged into a bank app, a telco filter or a browser.

## Verify the genuine, not only chase the fake

Scam domains never run out, but Kuwait's official channels are few and knowable. Asli publishes both lists and starts every check from the genuine one.

### A blocklist alone

- Always a step behind: a new scam domain looks clean until someone reports it.
- It can only say “known bad” or stay silent.

### Registry first

- It knows every genuine domain, sender name, app and hotline of each official body, with a source for each.
- It knows each body's channel policy, such as “traffic fine notices come only through Sahel”.
- It flags anything that claims to be an official body but sits outside its registry entry, even before anyone reports it.

### Why it must be open source

- **Trust**: Every listing carries its evidence, and the Git history is a public audit trail of each decision.
- **Reuse**: Banks, telcos, schools and app makers can adopt it in standard formats without a contract.
- **Reach**: Community translators carry it to residents in their own languages.
- **Durability**: It outlives any single sponsor, and anyone can fork it.
- **Cost**: It runs on free public infrastructure: GitHub Pages and GitHub Actions.

### What global checkers miss

Global scam checkers do not know that the Ministry of Interior never sends traffic fines by text message, that Kuwaiti banks never ask for your one-time code, or how a fake fine reads in Arabic, Malayalam or Tagalog. Asli is built around that local knowledge.

## See a message checked

Pick a sample. Asli reads it the way the Phase 1 checker will: it pulls out links and claims, compares them with the registry and explains the verdict.

### Fine by text message

- **From**: Unknown number
- **Channel**: Text message
- **Message**:

  > وزارة الداخلية: عليك مخالفة مرورية بقيمة ٢٠ دينارًا يجب سدادها خلال ٢٤ ساعة وإلا تُضاعف إلى ٢٠٠ دينار، ادفع الآن عبر moi-kw-fines.example

- **Verdict**: Impersonation

  It claims an official identity it cannot back up.

- **What to do**: Do not open the link. Check your fines in the Sahel app. If you already paid, call your bank now, then report the message to the Ministry of Interior.

### Parcel fee on iMessage

- **From**: kwpost-help@mail.example
- **Channel**: iMessage
- **Message**:

  > Kuwait Post: your parcel is on hold at customs. Pay the 0.350 KD fee within 24 hours at kwpost-delivery.example or it will be returned.

- **Verdict**: Impersonation

  It claims an official identity it cannot back up.

- **What to do**: Do not pay through the link. Track the parcel in the courier's official app or verified website, then report the message as junk and delete it.

### Notice in the Sahel app

- **From**: Ministry of Interior
- **Channel**: Sahel app
- **Message**:

  > وزارة الداخلية: سُجّلت عليك مخالفة مرورية، ويمكنك الاطلاع عليها وسدادها من خدمات الوزارة داخل التطبيق

- **Verdict**: Official channel

  The registry confirms the channel. Still, never share a one-time code with anyone.

- **What to do**: Pay inside the app itself, do not follow outside links, and never share a one-time code with anyone.

### Code request on WhatsApp

- **From**: +965 0000 0000
- **Channel**: WhatsApp
- **Message**:

  > Dear customer, your card will be blocked today. Reply with the verification code we just sent to keep it active.

- **Verdict**: Impersonation

  It claims an official identity it cannot back up.

- **What to do**: Do not send the code to anyone. Call your bank on the number printed on the back of your card.

The samples are illustrative. Their links use the reserved example domain and lead nowhere. The demo registry holds three entries, and each policy links to its source.

## How it works

Signals come in, machines and people review them, and signed open data goes out to every channel that reaches residents.

### Signals

- **Certificate logs**: Every new TLS certificate is public. Asli watches for names that borrow Kuwaiti brands the moment a certificate is issued.

  Reuses: [KWTCyberWatch](https://github.com/SiteQ8/KWTCyberWatch), [PhishWatch](https://github.com/SiteQ8/PhishWatch)

- **New domains**: Newly registered domains are scored for Kuwaiti brand words, their Latin spellings and lookalike characters.

  Reuses: [PhishWatch](https://github.com/SiteQ8/PhishWatch)

- **Community reports**: Residents forward suspicious messages. Personal details are removed on the device before anything is sent.

  Reuses: [Kashif](https://github.com/SiteQ8/Kashif), [Ghirbal](https://github.com/SiteQ8/Ghirbal)

- **Partner signals**: Banks and telcos can share confirmed indicators through a simple, documented format.

### Review

- **Detection engine**: Scores each candidate on brand words, lookalike characters, domain age, hosting and the fingerprints of known fake payment pages.

  Reuses: [PhishBOT](https://github.com/SiteQ8/PhishBOT), [PhishHunter](https://github.com/SiteQ8/PhishHunter)

- **Triage agent**: An AI agent gathers evidence, captures the page, drafts the verdict and prepares a takedown packet. It cannot publish anything on its own.

  Reuses: [Ghirbal](https://github.com/SiteQ8/Ghirbal)

- **Two reviewers**: Every listing needs two independent human approvals, and each approval is recorded in the public history.

### Open data

- **Official registry**: Genuine domains, sender names, apps, hotlines and channel policies of Kuwaiti official bodies, each with a source and a verification date.
- **Scam feed**: Confirmed scam links, numbers and sender names, updated every hour in 8 formats: JSON, CSV, plain text, hosts, AdGuard, DNS RPZ, STIX 2.1 and MISP.

  Reuses: [Ghirbal](https://github.com/SiteQ8/Ghirbal)

- **Signed releases**: Every release is signed and versioned, so anyone who consumes it can prove what they received and roll back.

### Reach

- **Check page**: Paste a link, number or message and get a verdict with its reason. The check runs in your browser and works offline.

  Reuses: [Ghirbal](https://github.com/SiteQ8/Ghirbal)

- **Browser extension**: Warns before a scam page loads and marks genuine official sites.
- **Messaging bot**: Forward a message and get the verdict in your language. Telegram comes first, and WhatsApp follows when a sponsor covers its cost.
- **MCP server**: Lets AI assistants check links and numbers against Kuwait's registry and feed.

  Reuses: [KaliMCP](https://github.com/SiteQ8/KaliMCP)

- **Bank and telco API**: Static, cacheable endpoints that fraud teams and SMS filters can poll.
- **Awareness kit**: A monthly brief of new scam patterns in 7 languages, free to reuse in campaigns such as Diraya.

  Reuses: [Wa3i](https://github.com/SiteQ8/Wa3i)

## Why this project was chosen

Six candidates were scored against five criteria. Move the weights to test the choice yourself.

Scores are the maintainer's editorial judgment, not measured data.

**Default weights**: Reach 25%, Harm reduced 25%, Open-source fit 20%, Feasibility 15%, Builds on existing work 15%

| Candidate | Reach | Harm reduced | Open-source fit | Feasibility | Builds on existing work | Score |
| --- | --- | --- | --- | --- | --- | --- |
| **Asli, the open scam shield** (Chosen) | 5 | 5 | 5 | 4 | 5 | 4.85 |
| **Cyber baseline scanner for small businesses** | 2 | 3 | 4 | 4 | 5 | 3.40 |
| **Kuwait developer kit for civil ID, IBAN, address and holiday checks** | 2 | 2 | 5 | 5 | 3 | 3.20 |
| **Open corpus of Kuwaiti legislation** | 3 | 2 | 4 | 3 | 4 | 3.10 |
| **Heat and power resilience dashboard** | 4 | 3 | 3 | 3 | 1 | 2.95 |
| **Open Kuwaiti Arabic language data and models** | 3 | 2 | 5 | 2 | 2 | 2.85 |

With these weights, Asli ranks first with 4.85 out of 5.

- **Asli, the open scam shield**: Touches every resident, turns openness into trust and reuses nine SiteQ8 projects.
- **Cyber baseline scanner for small businesses**: Strong fit with existing tools, but it reaches businesses rather than residents.
- **Kuwait developer kit for civil ID, IBAN, address and holiday checks**: Quick to build, but it helps people only indirectly.
- **Open corpus of Kuwaiti legislation**: Valuable to lawyers and researchers, but collecting and consolidating texts is slow.
- **Heat and power resilience dashboard**: A real need, but it depends on data that is not published.
- **Open Kuwaiti Arabic language data and models**: High value, but it needs large licensed datasets and years of work.

## Roadmap

Five phases over twelve months. A phase ends only when its exit test passes.

### Phase 0: Foundations

Weeks 1 and 2 (4 to 15 October 2026)

- Approve the name, scope and licences
- Publish the listing policy and the privacy notice
- Registry schema version 1, enforced by tests
- Seed the first 25 official bodies with sources

**Exit test**: Schema tests pass, and every seeded entry has a source and a verification date.

### Phase 1: Feed and check page

Weeks 3 to 8 (18 October to 26 November 2026)

- Hourly detection from certificate logs and new domains
- A review queue with two approvals per listing
- The feed published and signed in 8 formats
- The check page in Arabic and English

**Exit test**: Median time from detection to listing is under 6 hours, and reviewed false positives are under 1%.

### Phase 2: Reach

Weeks 9 to 16 (29 November 2026 to 21 January 2027)

- A browser extension for Chromium and Firefox
- A Telegram bot
- 7 languages, with completeness enforced by tests
- A report form that puts privacy first

**Exit test**: All seven languages pass the completeness tests, and the extension is live in both stores.

### Phase 3: Agents and integrations

Months 5 to 9 (February to June 2027)

- A triage agent with human sign-off
- The MCP server and the bank and telco API
- Takedown packets for registrars and hosting providers
- Readiness for charity scams before Ramadan 2027

**Exit test**: At least two institutions consume the feed in production.

### Phase 4: Stewardship

Months 10 to 12 (July to September 2027)

- A governance charter and a neutral steward
- A sponsorship model that cannot buy listings or removals
- The first annual transparency report

**Exit test**: The transparency report is published, and the project runs for a full month without its founder.

## Built on nine SiteQ8 projects

Asli is new, but most of its engine already exists in public repositories.

- [KWTCyberWatch](https://github.com/SiteQ8/KWTCyberWatch): Certificate Transparency monitoring and lookalike domain detection
- [PhishWatch](https://github.com/SiteQ8/PhishWatch): Lookalike candidates from CertStream and OpenSquat
- [PhishBOT](https://github.com/SiteQ8/PhishBOT): Page analysis engine with a REST API
- [PhishHunter](https://github.com/SiteQ8/PhishHunter): Phishing site detection from multiple signals
- [Ghirbal](https://github.com/SiteQ8/Ghirbal): Indicator extraction from messages, with STIX 2.1 export
- [Kashif](https://github.com/SiteQ8/Kashif): In-browser detection of sensitive data, reused to redact reports
- [Wa3i](https://github.com/SiteQ8/Wa3i): Arabic awareness content
- [KaliMCP](https://github.com/SiteQ8/KaliMCP): Experience building MCP servers, for the assistant integration
- [KW-OS](https://github.com/SiteQ8/KW-OS): Kuwait's open-source directory, for listing and community

## Trust and governance

A scam list is only as good as it is fair, so these rules come before the first listing.

- **Evidence**: Every listing stores the link, the capture time, a screenshot hash and the reason.
- **Two keys**: No single person or agent can list or delist. Two reviewers must agree.
- **Expiry**: Entries expire after 90 days unless confirmed again, because domains change hands.
- **Appeals**: Anyone can appeal a listing. The target is a decision within 72 hours, and every delisting is logged.
- **Privacy**: No personal data enters the feed. Reports are anonymous by default and redacted on the device, following the principles of CITRA's Data Privacy Protection Regulation, Resolution No. 26 of 2024.

  [Source](https://www.tamimi.com/news/kuwait-data-privacy-protection-regulations)

- **Licences**: Code is released under the MIT licence. The registry, the feed and the awareness content are released under CC BY 4.0.
- **Neutrality**: No ads, no tracking and no paid placement. Sponsors fund the work, never a listing or a removal.
- **Security**: Releases are signed, branches are protected, and at least two maintainers use hardware security keys.
- **Its place**: Asli complements official work such as the Ministry of Interior's takedown unit and the Aman virtual room that links banks, the Public Prosecution and the financial crimes unit. It routes victims to their bank and to the ministry, and it never replaces any of them.

  [Source](https://meatechwatch.com/?p=26822)

## Measures of success

First-year targets, with progress reported every month on a public dashboard.

| Measure | Target |
| --- | --- |
| Median time from detection to listing | Under 6 hours in Phase 1 and under an hour in Phase 3 |
| Reviewed false positive rate | Under 1% |
| Official bodies in the registry | 25 in Phase 0 and 100 by the end of Phase 2 |
| Languages | 7 by the end of Phase 2 |
| Institutions consuming the feed | 5 by the end of the first year |
| Check page weight | Under 100 KB compressed, usable on a weak connection |
| Open metrics | Published every month |

## Risks and how we handle them

| Risk | Response |
| --- | --- |
| A legitimate site is listed by mistake | Two reviewers, stored evidence, a 90-day expiry and a public appeal path. |
| Scammers study the open code to evade it | The method is open, but watch terms and unconfirmed candidates stay private until a listing is confirmed. |
| Fake copies of Asli itself | Asli lists its own genuine channels in the registry, signs every release and never asks for money or personal data. |
| Official bodies feel exposed | The registry lists only public channels with their sources and makes no claim about any body's security. |
| Maintainer burnout | Automation first, rotating reviewers, and the Phase 4 test of a month without the founder. |
| Legal exposure | Counsel reviews the listing policy in Phase 0, and every listing states facts with evidence, not opinions. |

## Who it serves

These audiences and partners are proposals. No partnership exists yet, and outreach starts in Phase 1.

- **Residents**: A clear answer in their own language, with nothing to install.
- **Banks**: A feed their fraud teams can plug in, and content that fits the Diraya campaign.
- **Telcos**: Lists ready for SMS and DNS filtering.
- **Regulators and law enforcement**: Early warning and ready takedown packets for the National Cyber Security Center, CITRA and the Ministry of Interior.
- **Developers**: Static endpoints and an MCP server to build on.
- **Educators**: A monthly brief of real patterns for schools and workplaces.

## The first two weeks

What happens next, in order.

1. Approve the name Asli, the scope and the licences.
2. Publish the listing policy, the appeal process and the privacy notice.
3. Define registry schema version 1 and the tests that enforce it.
4. Seed the first 25 official bodies, with a source and a date for every field.
5. Move the KWTCyberWatch certificate watcher into a scheduled GitHub Actions job.
6. Open the review queue with GitHub issue forms and invite two reviewers.
7. Ask counsel to review the listing policy.

---

An open-source project by Ali AlEnezi. Version 0.1, September 2026, released under the MIT licence.

[Source code](https://github.com/SiteQ8/Asli)
