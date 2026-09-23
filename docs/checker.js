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
  var PHONE_RE = /(?:\+?965[\s-]?)?(?:\d[\s-]?){7,12}\d/g;
  var LATIN = /[a-z]/i;

  /* Words a squatter glues onto a brand name. Used to catch nbkkuwait and moi-kw. */
  var GLUE = [
    "kuwait", "kw", "q8", "online", "secure", "security", "login", "signin", "verify",
    "verification", "update", "confirm", "account", "accounts", "bank", "banking", "pay",
    "payment", "payments", "portal", "service", "services", "support", "help", "alert",
    "alerts", "app", "mobile", "gov", "info", "center", "centre", "care", "net", "web"
  ];

  var PRESSURE = {
    ar: ["خلال ٢٤ ساعة", "خلال 24 ساعة", "وإلا", "الآن", "فورًا", "فورا", "اليوم", "سيتم إيقاف", "سيتم تعليق", "آخر تحذير", "تنتهي صلاحية"],
    en: ["within 24 hours", "or it will be", "will be blocked", "will be suspended", "immediately", "right now", "today", "final warning", "expires", "act now", "urgent"]
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

  function phones(text) {
    var out = [];
    var m;
    PHONE_RE.lastIndex = 0;
    while ((m = PHONE_RE.exec(stripHosts(text)))) {
      var digits = m[0].replace(/\D/g, "");
      if (digits.length < 8) continue;
      var normal = digits.length > 8 && digits.indexOf("965") === 0 ? digits.slice(3) : digits;
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

  /*
    A host imitates a brand when one of the brand's tokens turns up in the host
    as a whole label, as a part of a hyphenated label, or glued to a common word.
    Bare substring matching is deliberately avoided: it flags innocent names.
  */
  function imitates(host, token) {
    var labels = registrableParts(host);
    for (var i = 0; i < labels.length; i++) {
      var parts = labels[i].split(/[^a-z0-9]+/).filter(Boolean);
      for (var j = 0; j < parts.length; j++) {
        var part = parts[j];
        if (part === token) return true;
        for (var g = 0; g < GLUE.length; g++) {
          if (part === token + GLUE[g] || part === GLUE[g] + token) return true;
        }
        if (token.length >= 5 && part.indexOf(token) >= 0) return true;
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
    check(input, data)
      input.text     the message, as pasted
      input.channel  sms | imessage | whatsapp | email | call | social | app | web
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
    var feed = (data && data.feed) || { domains: [], numbers: [] };

    var foundHosts = hosts(text);
    var foundPhones = phones(text);

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

    var official = [];
    var lookalike = [];
    var unknown = [];
    foundHosts.forEach(function (host) {
      var owner = officialOwner(host, bodies);
      if (owner) {
        official.push({ host: host, body: owner });
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
    */
    var verdict;
    if (listed.length) verdict = "listed";
    else if (lookalike.length || broken.length) verdict = "impersonation";
    else if (claimed && official.length) verdict = "official";
    else if (official.length && !unknown.length) verdict = "official";
    else verdict = "unverified";

    return {
      channel: channel,
      hosts: foundHosts,
      phones: foundPhones,
      claimed: claimed,
      listed: listed,
      official: official,
      lookalike: lookalike,
      unknown: unknown,
      broken: broken,
      published: published,
      matchedNumbers: matchedNumbers,
      unpublishedNumbers: unpublishedNumbers,
      pressure: pressure,
      verdict: verdict
    };
  }

  var api = { check: check, hosts: hosts, phones: phones, imitates: imitates, isUnder: isUnder, GLUE: GLUE };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.AsliChecker = api;
})(typeof window !== "undefined" ? window : globalThis);
