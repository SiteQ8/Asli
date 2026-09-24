/*
  Asli checker.

  One engine, used by the check page in the browser and by the tests in Node.
  It answers a single question about a message: does anything in it claim to be
  an official Kuwaiti channel that the registry does not recognise?

  It never sends the message anywhere. Everything below runs where it is called.
*/
(function (root) {
  "use strict";

  var HOST_RE = /(?:https?:\/\/)?((?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[a-z]{2,}))(?![a-z0-9-])/gi;
  /* A link to a bare address rather than a name. No official body sends one. */
  var IP_RE = /(?:https?:\/\/)?((?:\d{1,3}\.){3}\d{1,3})(?::\d{1,5})?(?!\d|\.\d)/g;
  var PHONE_RE = /(?:\+?965[\s-]?)?(?:\d[\s-]?){7,12}\d/g;
  var LATIN = /[a-z]/i;

  /*
    Words a squatter glues onto a brand name. Used to catch nbkkuwait and moi-kw.
    The same list drives the certificate watch in tools/lookalike.mjs, and a test
    keeps the two identical.
  */
  var GLUE = [
    "kuwait", "kw", "q8", "online", "secure", "security", "login", "signin", "sign",
    "verify", "verification", "update", "confirm", "account", "accounts", "bank",
    "banking", "pay", "payment", "payments", "portal", "service", "services",
    "support", "help", "helpdesk", "alert", "alerts", "app", "apps", "mobile",
    "gov", "info", "center", "centre", "care", "net", "web", "my", "e", "new", "official"
  ];

  /* Characters swapped to fake a letter without owning the real name. */
  var LEET = { "0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b", "9": "g" };

  /*
    Services that turn a link into a short one. A short link is not a scam, but
    it hides where it goes, so the registry cannot vouch for it either way.
  */
  var SHORTENERS = [
    "bit.ly", "bitly.com", "tinyurl.com", "t.co", "goo.gl", "cutt.ly", "is.gd", "v.gd",
    "rb.gy", "shorturl.at", "tiny.cc", "t.ly", "ow.ly", "buff.ly", "rebrand.ly", "bl.ink",
    "short.io", "lnkd.in", "s.id", "surl.li", "clck.ru", "u.to", "shorte.st", "adf.ly",
    "urlz.fr", "1link.io", "tny.im", "qrco.de", "han.gl", "2u.pw", "lc.cx"
  ];

  var PRESSURE = {
    ar: [
      "خلال ٢٤ ساعة", "خلال 24 ساعة", "وإلا", "الآن", "فورًا", "فورا", "اليوم",
      "سيتم إيقاف", "سيتم تعليق", "تم تعليق", "تم إيقاف", "موقوف", "معلق", "معلّق",
      "آخر تحذير", "آخر فرصة", "تنتهي صلاحية", "تنتهي اليوم", "بادر", "سارع", "قبل فوات"
    ],
    en: [
      "within 24 hours", "or it will be", "will be blocked", "will be suspended",
      "is suspended", "has been suspended", "is blocked", "has been blocked", "locked",
      "immediately", "right now", "now", "today", "final warning", "last chance",
      "expires", "expired", "act now", "urgent", "reactivate", "avoid suspension"
    ]
  };

  var CREDENTIALS = {
    ar: ["رمز التحقق", "الرقم السري", "كلمة المرور", "رقم البطاقة", "بيانات البطاقة", "الرمز المرسل", "رمز التفعيل"],
    en: ["verification code", "one-time code", "one time code", "otp", "pin code", "password", "card number", "cvv", "code we sent", "security code"]
  };

  /*
    Mentioning a one-time code is not a scam: banks warn people about codes all
    the time. Asking for one is. Both halves have to be present.
  */
  var ASKS = {
    ar: ["أرسل", "ارسل", "شارك", "أدخل", "ادخل", "زودنا", "زوّدنا", "اكتب", "أعد إرسال", "زوّدني", "أخبرنا"],
    en: ["reply with", "send", "share", "enter", "provide", "confirm", "give us", "forward", "tell us", "type"]
  };

  function lower(text) {
    return String(text || "").toLowerCase();
  }

  function hosts(text) {
    var out = [];
    var m;
    HOST_RE.lastIndex = 0;
    while ((m = HOST_RE.exec(text))) {
      var host = m[1].toLowerCase().replace(/\.$/, "");
      if (out.indexOf(host) < 0) out.push(host);
    }
    return out;
  }

  function stripHosts(text) {
    return String(text || "").replace(HOST_RE, " ");
  }

  /* Bare addresses, read from the text once the names have been taken out. */
  function ipLinks(text) {
    var out = [];
    var m;
    var stripped = stripHosts(text);
    IP_RE.lastIndex = 0;
    while ((m = IP_RE.exec(stripped))) {
      var address = m[1];
      var valid = address.split(".").every(function (part) { return Number(part) <= 255; });
      if (valid && out.indexOf(address) < 0) out.push(address);
    }
    return out;
  }

  function stripAddresses(text) {
    return stripHosts(text).replace(IP_RE, " ");
  }

  function normalisePhone(digits) {
    return digits.length > 8 && digits.indexOf("965") === 0 ? digits.slice(3) : digits;
  }

  function phones(text) {
    var out = [];
    var m;
    PHONE_RE.lastIndex = 0;
    while ((m = PHONE_RE.exec(stripAddresses(text)))) {
      var digits = m[0].replace(/\D/g, "");
      if (digits.length < 8) continue;
      var normal = normalisePhone(digits);
      if (out.indexOf(normal) < 0) out.push(normal);
    }
    return out;
  }

  function registrableParts(host) {
    return host.split(".").filter(Boolean);
  }

  function isUnder(host, domain) {
    return host === domain || host.slice(-(domain.length + 1)) === "." + domain;
  }

  function officialOwner(host, bodies) {
    for (var i = 0; i < bodies.length; i++) {
      for (var j = 0; j < bodies[i].domains.length; j++) {
        if (isUnder(host, bodies[i].domains[j])) return bodies[i];
      }
    }
    return null;
  }

  function isShortener(host) {
    for (var i = 0; i < SHORTENERS.length; i++) {
      if (isUnder(host, SHORTENERS[i])) return true;
    }
    return false;
  }

  /* Punycode is how a name written in another script travels. It can also make one letter look like another. */
  function isPunycode(host) {
    return registrableParts(host).some(function (label) { return label.indexOf("xn--") === 0; });
  }

  /* Undo the usual digit for letter swaps so m0i reads as moi and rnoi reads as moi. */
  function deleet(part) {
    return part.replace(/[01345789]/g, function (c) { return LEET[c] || c; }).replace(/rn/g, "m").replace(/vv/g, "w");
  }

  /*
    Whether one label part carries a brand token: as the whole part, glued to a
    common word, or inside a longer part for brands long enough that a chance
    match is unlikely. Bare substring matching on short brands is deliberately
    avoided: it flags innocent names.
  */
  function carries(part, token, swapped) {
    if (part === token) return true;
    for (var g = 0; g < GLUE.length; g++) {
      if (part === token + GLUE[g] || part === GLUE[g] + token) return true;
    }
    var minimum = swapped ? 4 : 5;
    return token.length >= minimum && part.indexOf(token) >= 0;
  }

  /*
    A host imitates a brand when one of the brand's tokens turns up in the host
    as a whole label, as a part of a hyphenated label, glued to a common word, or
    written with swapped characters such as b0ubyan or rnoi.
  */
  function imitates(host, token) {
    var labels = registrableParts(host);
    for (var i = 0; i < labels.length; i++) {
      var parts = labels[i].split(/[^a-z0-9]+/).filter(Boolean);
      for (var j = 0; j < parts.length; j++) {
        if (carries(parts[j], token, false)) return true;
        var plain = deleet(parts[j]);
        if (plain !== parts[j] && carries(plain, token, true)) return true;
      }
    }
    return false;
  }

  function hasPhrase(text, phrase) {
    var p = lower(phrase);
    if (!p) return false;
    if (LATIN.test(p)) {
      var escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp("(^|[^a-z0-9])" + escaped + "([^a-z0-9]|$)", "i").test(text);
    }
    return text.indexOf(p) >= 0;
  }

  function hasAny(text, list) {
    for (var i = 0; i < (list || []).length; i++) {
      if (hasPhrase(text, list[i])) return true;
    }
    return false;
  }

  function bothLangs(pack) {
    if (!pack) return [];
    if (Array.isArray(pack)) return pack;
    return (pack.ar || []).concat(pack.en || []);
  }

  /*
    The sender, as the phone shows it: a number, or a name such as a bank's
    sender id. A name is read in lower case. A number is read as digits with
    the country code dropped, the same way numbers in the text are read.
  */
  function readSender(raw) {
    var s = String(raw || "").trim();
    if (!s) return null;
    /* Short codes such as 1804080 and 112 are numbers too, so three digits are enough. */
    if (/^\+?[\d\s()-]+$/.test(s)) {
      var digits = s.replace(/\D/g, "");
      if (digits.length >= 3) return { kind: "number", value: normalisePhone(digits) };
    }
    return { kind: "name", value: lower(s).replace(/\s+/g, " ") };
  }

  /*
    check(input, data)
      input.text     the message, as pasted
      input.channel  sms | imessage | whatsapp | email | call | social | app | web
      input.sender   optional, the number or sender name it came from
      data.bodies    registry entries
      data.feed      confirmed scam indicators
    Returns findings and a verdict. Wording is left to the caller.
  */
  function check(input, data) {
    var text = String(input.text || "");
    var body = lower(text);
    var claimText = lower(stripHosts(text));
    var channel = input.channel || "unknown";
    var bodies = (data && data.bodies) || [];
    var feed = (data && data.feed) || { domains: [], numbers: [], senders: [] };
    var sender = readSender(input.sender);

    var foundHosts = hosts(text);
    var foundIps = ipLinks(text);
    var foundPhones = phones(text);
    /* A number that sent the message is judged like a number written in it. */
    if (sender && sender.kind === "number" && foundPhones.indexOf(sender.value) < 0) foundPhones.push(sender.value);

    var claimed = null;
    for (var i = 0; i < bodies.length && !claimed; i++) {
      if (hasAny(claimText, bothLangs(bodies[i].claims))) claimed = bodies[i];
    }

    var listed = [];
    foundHosts.forEach(function (host) {
      (feed.domains || []).forEach(function (bad) {
        if (isUnder(host, bad.domain || bad) && listed.indexOf(host) < 0) listed.push(host);
      });
    });
    foundPhones.forEach(function (number) {
      (feed.numbers || []).forEach(function (bad) {
        var n = bad.number || bad;
        if (n === number && listed.indexOf(number) < 0) listed.push(number);
      });
    });

    /*
      A sender name in the feed is a listing like any other. One that matches a
      name the registry records for a body is only worth mentioning: sender
      names can be faked, so a match never makes a message official.
    */
    var senderListed = false;
    var senderOfficial = null;
    if (sender && sender.kind === "name") {
      (feed.senders || []).forEach(function (bad) {
        if (lower(bad.sender || bad) === sender.value) senderListed = true;
      });
      if (senderListed && listed.indexOf(sender.value) < 0) listed.push(sender.value);
      for (var s = 0; s < bodies.length && !senderOfficial; s++) {
        if ((bodies[s].senders || []).some(function (name) { return lower(name) === sender.value; })) senderOfficial = bodies[s];
      }
    } else if (sender) {
      senderListed = listed.indexOf(sender.value) >= 0;
      for (var p = 0; p < bodies.length && !senderOfficial; p++) {
        if ((bodies[p].hotlines || []).some(function (h) { return h.number === sender.value; })) senderOfficial = bodies[p];
      }
    }

    var official = [];
    var lookalike = [];
    var shortened = [];
    var unknown = [];
    foundHosts.forEach(function (host) {
      var owner = officialOwner(host, bodies);
      if (owner) {
        official.push({ host: host, body: owner });
        return;
      }
      if (isShortener(host)) {
        shortened.push(host);
        return;
      }
      var imitated = null;
      for (var b = 0; b < bodies.length && !imitated; b++) {
        for (var t = 0; t < bodies[b].tokens.length; t++) {
          if (imitates(host, bodies[b].tokens[t])) { imitated = bodies[b]; break; }
        }
      }
      if (imitated) lookalike.push({ host: host, body: imitated });
      else unknown.push(host);
    });
    var punycode = foundHosts.filter(function (host) { return isPunycode(host) && !officialOwner(host, bodies); });

    var broken = [];
    if (claimed) {
      (claimed.policies || []).forEach(function (policy) {
        var channelHit = (policy.channels || []).indexOf(channel) >= 0;
        var wordHit = hasAny(body, bothLangs(policy.words));
        if (channelHit && wordHit) broken.push({ body: claimed, policy: policy });
      });
    }
    /* Asking for credentials breaks the banking rule whoever is claiming to send it. */
    if (hasAny(body, bothLangs(CREDENTIALS)) && hasAny(body, bothLangs(ASKS))) {
      var bankRule = null;
      for (var k = 0; k < bodies.length && !bankRule; k++) {
        if (bodies[k].sector !== "bank") continue;
        (bodies[k].policies || []).forEach(function (p) {
          if (p.id === "no-credentials-by-message" && !bankRule) bankRule = { body: bodies[k], policy: p };
        });
      }
      var already = broken.some(function (b) { return b.policy.id === "no-credentials-by-message"; });
      if (bankRule && !already) broken.push(bankRule);
    }

    /*
      A number the body publishes itself is worth knowing about, in both
      directions: the one in the message may match, or the body may publish
      numbers and this is not one of them. Neither settles the verdict on its
      own, because a registry entry lists what a body publishes, not every
      number it owns.
    */
    var published = claimed && (claimed.hotlines || []).length ? claimed.hotlines.map(function (h) { return h.number; }) : [];
    var matchedNumbers = foundPhones.filter(function (n) { return published.indexOf(n) >= 0; });
    var unpublishedNumbers = published.length ? foundPhones.filter(function (n) { return published.indexOf(n) < 0; }) : [];

    var pressure = hasAny(body, PRESSURE.ar) || hasAny(body, PRESSURE.en);

    /*
      A broken policy is enough on its own. Nobody legitimate asks for a
      one-time code by message, whether or not they name who they are.

      A number the body does not publish is weak on its own: a real bank can
      call from a line that is not on its home page. Put it next to pressure
      wording and a claimed identity, and it is the shape of a scam call. A
      shortened link beside the same two things is the same shape.

      A link to a bare address under an official name needs no pressure. No
      ministry, bank or telco sends one.
    */
    var numberAndPressure = claimed && unpublishedNumbers.length && pressure;
    var hiddenAndPressure = claimed && shortened.length && pressure;
    var addressUnderName = claimed && foundIps.length;

    /*
      An official link vouches only for itself. A message that mixes one with a
      link the registry does not know, a shortened link or a bare address is
      not official: the genuine name may be there as decoration.
    */
    var everyLinkOfficial = official.length && !unknown.length && !shortened.length && !foundIps.length;

    var verdict;
    if (listed.length) verdict = "listed";
    else if (lookalike.length || broken.length || numberAndPressure || hiddenAndPressure || addressUnderName) verdict = "impersonation";
    else if (everyLinkOfficial) verdict = "official";
    else verdict = "unverified";

    return {
      channel: channel,
      hosts: foundHosts,
      ipLinks: foundIps,
      phones: foundPhones,
      sender: sender ? sender.value : null,
      senderKind: sender ? sender.kind : null,
      senderListed: senderListed,
      senderOfficial: senderOfficial,
      claimed: claimed,
      listed: listed,
      official: official,
      lookalike: lookalike,
      shortened: shortened,
      punycode: punycode,
      unknown: unknown,
      broken: broken,
      published: published,
      matchedNumbers: matchedNumbers,
      unpublishedNumbers: unpublishedNumbers,
      pressure: pressure,
      verdict: verdict
    };
  }

  var api = {
    check: check,
    hosts: hosts,
    ipLinks: ipLinks,
    phones: phones,
    imitates: imitates,
    deleet: deleet,
    isUnder: isUnder,
    isShortener: isShortener,
    isPunycode: isPunycode,
    readSender: readSender,
    GLUE: GLUE,
    SHORTENERS: SHORTENERS
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.AsliChecker = api;
})(typeof window !== "undefined" ? window : globalThis);
