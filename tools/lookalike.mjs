/*
  Lookalike scoring.

  Given a DNS name and the registry, this says whether the name borrows the
  identity of a Kuwaiti official body, and how strongly. It is deliberately
  conservative: a name scores nothing unless it carries a brand the registry
  knows. Keyword noise alone never produces a candidate, because a queue full of
  false positives is a queue nobody reviews.

  Nothing here touches the network. The watcher feeds it names, the tests feed it
  examples, and both get the same answer.
*/

/* Words a squatter glues onto a brand name. */
export const GLUE = [
  "kuwait", "kw", "q8", "online", "secure", "security", "login", "signin", "sign",
  "verify", "verification", "update", "confirm", "account", "accounts", "bank",
  "banking", "pay", "payment", "payments", "portal", "service", "services",
  "support", "help", "helpdesk", "alert", "alerts", "app", "apps", "mobile",
  "gov", "info", "center", "centre", "care", "net", "web", "my", "e", "new", "official"
];

/* Words that show what the page is for. They raise a score, never create one. */
export const INTENT = [
  "login", "signin", "verify", "verification", "validate", "update", "secure",
  "account", "payment", "pay", "fine", "fines", "violation", "wallet", "otp",
  "refund", "customs", "delivery", "parcel", "shipment", "invoice", "recovery",
  "unlock", "reactivate", "suspended", "confirm", "identity", "kyc", "fee", "fees",
  "charge", "charges", "renew", "renewal", "tracking", "track", "claim"
];

/* Hosts that hand out free subdomains, which is where phishing kits tend to live. */
export const FREE_HOSTS = [
  "workers.dev", "pages.dev", "vercel.app", "netlify.app", "web.app",
  "firebaseapp.com", "glitch.me", "repl.co", "r2.dev", "ngrok.io", "ngrok-free.app",
  "github.io", "gitlab.io", "weebly.com", "wixsite.com", "blogspot.com",
  "000webhostapp.com", "onrender.com", "surge.sh", "webflow.io", "square.site"
];

/* Cheap top level domains that carry more than their share of scam names. */
export const RISKY_TLDS = [
  "top", "xyz", "icu", "live", "online", "click", "shop", "buy", "site", "cyou",
  "sbs", "rest", "cfd", "bond", "quest", "monster", "beauty", "autos", "lol", "fit"
];

/* Characters swapped to fake a letter without owning the real name. */
const LEET = { "0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "9": "g", "$": "s", "@": "a" };

export function clean(name) {
  return String(name || "").trim().toLowerCase().replace(/^\*\./, "").replace(/\.$/, "");
}

export function labels(host) {
  return clean(host).split(".").filter(Boolean);
}

export function isUnder(host, domain) {
  const h = clean(host);
  const d = clean(domain);
  return h === d || h.endsWith("." + d);
}

/* Undo the usual digit for letter swaps so moi1.example reads as moil.example. */
export function deleet(part) {
  return part.replace(/[013457890$@]/g, (c) => LEET[c] || c).replace(/rn/g, "m").replace(/vv/g, "w");
}

function partsOf(host) {
  return labels(host).flatMap((label) => label.split(/[^a-z0-9]+/).filter(Boolean));
}

/*
  How a name carries a token, from strongest to weakest.
  Returns null when it does not carry it at all.
*/
export function tokenHit(host, token) {
  const parts = partsOf(host);
  for (const part of parts) {
    if (part === token) return { how: "exact-label", weight: 40, glue: null };
  }
  for (const part of parts) {
    for (const glue of GLUE) {
      if (part === token + glue || part === glue + token) return { how: "glued-word", weight: 45, glue: glue };
    }
  }
  for (const part of parts) {
    const plain = deleet(part);
    if (plain !== part) {
      if (plain === token || (token.length >= 4 && plain.includes(token))) {
        return { how: "character-swap", weight: 50, glue: null };
      }
      for (const glue of GLUE) {
        if (plain === token + glue || plain === glue + token) return { how: "character-swap", weight: 50, glue: glue };
      }
    }
  }
  for (const part of parts) {
    if (token.length >= 5 && part.includes(token)) return { how: "inside-label", weight: 35, glue: null };
  }
  return null;
}

/*
  score(name, bodies) returns:
    { name, candidate, score, body, reasons[] }
  candidate is true only when a registry brand is involved and the score clears
  the threshold. An official domain always scores zero.
*/
export function score(name, bodies) {
  const host = clean(name);
  const out = { name: host, candidate: false, score: 0, body: null, reasons: [] };
  if (!host || !host.includes(".")) return out;

  for (const body of bodies) {
    for (const domain of body.domains) {
      if (isUnder(host, domain)) {
        out.reasons.push("official domain of " + body.id);
        return out;
      }
    }
  }

  let points = 0;
  let owner = null;

  /* An official domain used as a label inside another name is the clearest tell. */
  for (const body of bodies) {
    for (const domain of body.domains) {
      const at = ("." + host).indexOf("." + domain + ".");
      if (at < 0) continue;
      /*
        What follows matters. A country variant such as burgan.com.tr is the
        bank's own, while moi.gov.kw.pay.example puts the official name inside
        somebody else's domain, which is the trick worth catching.
      */
      const after = ("." + host).slice(at + domain.length + 2);
      if (!after.includes(".")) continue;
      points += 50;
      owner = owner || body;
      out.reasons.push(`carries the official domain ${domain} as a label`);
    }
  }

  let best = null;
  for (const body of bodies) {
    for (const token of body.tokens) {
      const hit = tokenHit(host, token);
      if (hit && (!best || hit.weight > best.hit.weight)) best = { body, token, hit };
    }
  }
  if (best) {
    points += best.hit.weight;
    owner = owner || best.body;
    out.reasons.push(`borrows the brand ${best.token} of ${best.body.id} as ${best.hit.how}`);
    if (best.hit.glue) {
      const country = ["kuwait", "kw", "q8"].includes(best.hit.glue);
      points += country ? 10 : 15;
      out.reasons.push(country ? `glued to ${best.hit.glue}, which points at Kuwait` : `glued to the action word ${best.hit.glue}`);
    }
  }

  if (!owner) return out;

  const parts = partsOf(host);
  const intent = [...new Set(parts.filter((p) => INTENT.includes(p)))];
  if (intent.length) {
    points += Math.min(30, intent.length * 15);
    out.reasons.push("uses action words: " + intent.join(", "));
  }

  if (parts.some((p) => ["kuwait", "kw", "q8"].includes(p))) {
    points += 10;
    out.reasons.push("points at Kuwait in the name");
  }

  const free = FREE_HOSTS.find((h) => isUnder(host, h));
  if (free) {
    points += 15;
    out.reasons.push("sits on free hosting at " + free);
  }

  const tld = labels(host).slice(-1)[0];
  if (RISKY_TLDS.includes(tld)) {
    points += 10;
    out.reasons.push("uses the cheap top level domain ." + tld);
  }

  if (host.includes("xn--")) {
    points += 20;
    out.reasons.push("uses punycode, so the name can look like other letters");
  }

  if (/\d/.test(labels(host).slice(0, -1).join(""))) {
    points += 5;
    out.reasons.push("mixes digits into the name");
  }

  out.score = Math.min(100, points);
  out.body = owner;
  out.candidate = out.score >= 50;
  return out;
}

/* Sort the strongest first, then alphabetically so runs are reproducible. */
export function rank(results) {
  return results.slice().sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}
