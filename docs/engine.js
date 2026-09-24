/*
  Asli site helpers: number formatting, link highlighting and the weighted
  selection matrix. Deciding whether a message is genuine is not done here.
  That lives in checker.js alone, so the demo on the home page and the check
  page run exactly the same code and cannot disagree.
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
    splitHosts: splitHosts,
    weightedScore: weightedScore,
    rank: rank,
    weightSum: weightSum
  };
})(typeof window !== "undefined" ? window : globalThis);
