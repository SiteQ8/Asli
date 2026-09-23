/*
  Asli engine: the logic behind the site, kept free of any DOM code so the
  tests and the text builder run exactly what the browser runs.
*/
(function (root) {
  "use strict";

  var AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
  var HOST_RE = /(?:https?:\/\/)?((?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,})(?![a-z0-9-])/gi;
  var LATIN_RE = /[a-z]/i;

  function formatNumber(value, lang, decimals) {
    var s = typeof decimals === "number" ? Number(value).toFixed(decimals) : String(value);
    if (lang !== "ar") return s;
    return s.replace(/[0-9]/g, function (d) { return AR_DIGITS[+d]; }).replace(/\./g, "٫");
  }

  function extractHosts(text) {
    var out = [];
    var m;
    HOST_RE.lastIndex = 0;
    while ((m = HOST_RE.exec(text))) {
      var host = m[1].toLowerCase();
      if (out.indexOf(host) < 0) out.push(host);
    }
    return out;
  }

  /* Split text into plain runs and host runs, for display. */
  function splitHosts(text) {
    var parts = [];
    var last = 0;
    var m;
    HOST_RE.lastIndex = 0;
    while ((m = HOST_RE.exec(text))) {
      if (m.index > last) parts.push({ text: text.slice(last, m.index), host: false });
      parts.push({ text: m[0], host: true });
      last = HOST_RE.lastIndex;
    }
    if (last < text.length) parts.push({ text: text.slice(last), host: false });
    return parts;
  }

  function stripHosts(text) {
    return text.replace(HOST_RE, " ");
  }

  function isOfficial(host, domains) {
    return domains.some(function (d) {
      return host === d || host.slice(-(d.length + 1)) === "." + d;
    });
  }

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /* Latin words match on word boundaries, Arabic phrases match as substrings. */
  function hasWord(text, word) {
    var w = word.toLowerCase();
    if (LATIN_RE.test(w)) {
      return new RegExp("(^|[^a-z0-9])" + escapeRe(w) + "([^a-z0-9]|$)", "i").test(text);
    }
    return text.indexOf(w) >= 0;
  }

  function hasAny(text, words) {
    return words.some(function (w) { return hasWord(text, w); });
  }

  /*
    Read a sample the way the Phase 1 checker will and return structured findings.
    Wording is left to the caller so both languages share one result.
  */
  function analyze(sample, demo) {
    var text = sample.text;
    var lower = text.toLowerCase();
    var hosts = extractHosts(text);
    var claimText = stripHosts(lower);

    var entity = null;
    demo.registry.some(function (e) {
      if (hasAny(claimText, e.claims)) { entity = e; return true; }
      return false;
    });

    var registry = { status: "none", host: null, channel: null };
    if (entity) {
      var unknown = hosts.filter(function (h) { return !isOfficial(h, entity.domains); });
      if (unknown.length) {
        registry = { status: "miss", host: unknown[0], channel: null };
      } else if (hosts.length) {
        registry = { status: "hit", host: hosts[0], channel: null };
      } else {
        var ch = entity.channels.filter(function (c) { return c.id === sample.channel; })[0];
        if (ch) registry = { status: "channel", host: null, channel: ch };
      }
    }

    var lookalike = [];
    hosts.forEach(function (h) {
      demo.registry.forEach(function (e) {
        if (isOfficial(h, e.domains)) return;
        var hit = e.tokens.some(function (tok) { return h.indexOf(tok) >= 0; });
        if (hit && !lookalike.some(function (l) { return l.host === h; })) {
          lookalike.push({ host: h, entity: e });
        }
      });
    });

    var policy = { status: "none", policy: null };
    if (entity) {
      var broken = entity.policies.filter(function (p) {
        return p.channels.indexOf(sample.channel) >= 0 && hasAny(lower, p.words);
      })[0];
      policy = broken ? { status: "broken", policy: broken } : { status: "ok", policy: null };
    }

    var pressure = hasAny(lower, demo.pressure);

    var verdict;
    if (entity && (registry.status === "miss" || policy.status === "broken" || lookalike.length)) {
      verdict = "impersonation";
    } else if (entity && (registry.status === "hit" || registry.status === "channel")) {
      verdict = "official";
    } else {
      verdict = "unverified";
    }

    return {
      hosts: hosts,
      entity: entity,
      registry: registry,
      lookalike: lookalike,
      policy: policy,
      pressure: pressure,
      verdict: verdict
    };
  }

  function weightedScore(candidate, weights, criteria) {
    var total = 0;
    var sum = 0;
    criteria.forEach(function (c) {
      var w = Math.max(0, Number(weights[c.id]) || 0);
      sum += w;
      total += w * candidate.scores[c.id];
    });
    return sum > 0 ? total / sum : 0;
  }

  function rank(candidates, weights, criteria) {
    return candidates
      .map(function (c, i) { return { id: c.id, index: i, score: weightedScore(c, weights, criteria) }; })
      .sort(function (a, b) {
        var d = Math.round((b.score - a.score) * 1e9);
        return d !== 0 ? d : a.index - b.index;
      });
  }

  function weightSum(weights) {
    return Object.keys(weights).reduce(function (s, k) { return s + Math.max(0, Number(weights[k]) || 0); }, 0);
  }

  root.AsliEngine = {
    formatNumber: formatNumber,
    extractHosts: extractHosts,
    splitHosts: splitHosts,
    isOfficial: isOfficial,
    analyze: analyze,
    weightedScore: weightedScore,
    rank: rank,
    weightSum: weightSum
  };
})(typeof window !== "undefined" ? window : globalThis);
