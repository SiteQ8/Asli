/*
  Redaction, done on the device.

  A scam report is only useful with the scam's own details in it: the link, the
  sender, the wording. It is only safe without the reporter's details: their
  civil ID, their card, their account. This strips the second kind and keeps the
  first, before anything is sent anywhere.

  Phone numbers are a special case. The number a scam tells you to call is
  evidence, so numbers are kept and listed instead, and the person can drop any
  that belong to them with one tap.
*/
(function (root) {
  "use strict";

  var MARK = {
    civilId: { ar: "[رقم مدني محذوف]", en: "[civil id removed]" },
    iban: { ar: "[آيبان محذوف]", en: "[iban removed]" },
    card: { ar: "[رقم بطاقة محذوف]", en: "[card number removed]" },
    account: { ar: "[رقم حساب محذوف]", en: "[account number removed]" },
    email: { ar: "[بريد إلكتروني محذوف]", en: "[email removed]" }
  };

  /* Kuwaiti civil ID: twelve digits that start with the century digit. */
  var CIVIL_ID = /(?<![\d])([123]\d{11})(?![\d])/g;
  var IBAN = /\b[A-Z]{2}\d{2}[A-Z]{4}[0-9A-Z]{10,22}\b/gi;
  var CARD = /(?<![\d])(?:\d[ -]?){12,18}\d(?![\d])/g;
  var LONG_DIGITS = /(?<![\d])\d{9,}(?![\d])/g;
  var EMAIL = /\b[\w.+-]+@[\w-]+\.[\w.-]{2,}\b/g;
  var PHONE = /(?:\+?965[\s-]?)?(?:\d[\s-]?){7,11}\d/g;
  var URL = /(?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s]*)?/gi;

  function luhn(digits) {
    var sum = 0;
    var alt = false;
    for (var i = digits.length - 1; i >= 0; i--) {
      var n = Number(digits[i]);
      if (alt) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  function mark(kind, lang) {
    return (MARK[kind] || MARK.account)[lang === "ar" ? "ar" : "en"];
  }

  /*
    redact(text, options)
      options.lang   ar or en, for the replacement wording
      options.keep   phone numbers to leave in place, digits only
      options.drop   phone numbers to remove, digits only
    Returns the cleaned text, what was removed, and the numbers found.
  */
  function redact(text, options) {
    var opts = options || {};
    var lang = opts.lang === "ar" ? "ar" : "en";
    var drop = (opts.drop || []).map(function (n) { return String(n).replace(/\D/g, ""); });
    var removed = [];
    var out = String(text || "");

    /* Email addresses go first, or the host half of one looks like a link. */
    out = out.replace(EMAIL, function () {
      removed.push("email");
      return mark("email", lang);
    });

    /* Links are then put aside so their digits are never mistaken for an account. */
    var links = [];
    out = out.replace(URL, function (match) {
      links.push(match);
      return "\u0000L" + (links.length - 1) + "\u0000";
    });

    out = out.replace(IBAN, function (match) {
      removed.push("iban");
      return mark("iban", lang);
    });

    out = out.replace(CIVIL_ID, function () {
      removed.push("civilId");
      return mark("civilId", lang);
    });

    out = out.replace(CARD, function (match) {
      var digits = match.replace(/\D/g, "");
      if (digits.length < 13 || digits.length > 19 || !luhn(digits)) return match;
      removed.push("card");
      return mark("card", lang);
    });

    /* Phone numbers are evidence, so they survive unless the person drops them. */
    var phones = [];
    out = out.replace(PHONE, function (match) {
      var digits = match.replace(/\D/g, "");
      if (digits.length < 8) return match;
      var normal = digits.length > 8 && digits.indexOf("965") === 0 ? digits.slice(3) : digits;
      if (drop.indexOf(normal) >= 0 || drop.indexOf(digits) >= 0) {
        removed.push("phone");
        return lang === "ar" ? "[رقم محذوف]" : "[number removed]";
      }
      if (phones.indexOf(normal) < 0) phones.push(normal);
      return match;
    });

    out = out.replace(LONG_DIGITS, function (match) {
      var normal = match.length > 8 && match.indexOf("965") === 0 ? match.slice(3) : match;
      if (phones.indexOf(normal) >= 0 || phones.indexOf(match) >= 0) return match;
      removed.push("account");
      return mark("account", lang);
    });

    out = out.replace(/\u0000L(\d+)\u0000/g, function (whole, index) {
      return links[Number(index)];
    });

    var counts = {};
    removed.forEach(function (kind) { counts[kind] = (counts[kind] || 0) + 1; });

    return { text: out, removed: counts, phones: phones, links: links };
  }

  var api = { redact: redact, luhn: luhn };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.AsliRedact = api;
})(typeof window !== "undefined" ? window : globalThis);
