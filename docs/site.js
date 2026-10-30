/*
  Asli site shell.

  One copy of what every page shares: the language switch, the header and
  footer wording, the current page marked in the navigation, the build line
  read from data/meta.json, icons drawn as SVG, and small helpers. Each page
  script registers its own renderer with AsliSite.onLang and draws only its own
  content.
*/
(function (root) {
  "use strict";

  var doc = root.document;
  var SVG_NS = "http://www.w3.org/2000/svg";
  var AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

  var S = {
    skip: { ar: "انتقل إلى المحتوى", en: "Skip to the content" },
    homeLabel: { ar: "أَصْلي، الصفحة الرئيسية", en: "Asli, home page" },
    navLabel: { ar: "أقسام الموقع", en: "Site sections" },
    navCheck: { ar: "افحص رسالة", en: "Check a message" },
    navReport: { ar: "أبلغ عن احتيال", en: "Report a scam" },
    navHelp: { ar: "وقع الاحتيال بالفعل", en: "It already happened" },
    navRegistry: { ar: "السجل", en: "Registry" },
    navAbout: { ar: "عن المشروع", en: "About" },
    lang: { ar: "English", en: "العربية" },
    langLabel: { ar: "اعرض الصفحة بالإنجليزية", en: "Show this page in Arabic" },
    footLine: { ar: "مشروع درع الكويت المفتوح ضد الاحتيال.", en: "Kuwait's open scam shield." },
    footBy: { ar: "مشروع مفتوح المصدر من علي العنزي.", en: "An open-source project by Ali AlEnezi." },
    footNavLabel: { ar: "روابط المشروع", en: "Project links" },
    footData: { ar: "البيانات المفتوحة", en: "Open data" },
    footText: { ar: "النص الكامل", en: "Full text" },
    footPolicy: { ar: "سياسة الإدراج", en: "Listing policy" },
    footAppeals: { ar: "الاعتراض على إدراج", en: "Appeals" },
    footPrivacy: { ar: "إشعار الخصوصية", en: "Privacy notice" },
    footSource: { ar: "الشيفرة المصدرية", en: "Source code" },
    footLicence: {
      ar: "الشيفرة منشورة بترخيص MIT، أما السجل والتغذية فمنشوران بترخيص CC BY 4.0.",
      en: "The code is released under the MIT licence. The registry and the feed are released under CC BY 4.0."
    },
    footBuild: { ar: "الإصدار {version}، وآخر بناء للبيانات في {date}.", en: "Version {version}. Data last built on {date}." },
    source: { ar: "المصدر", en: "Source" }
  };

  var listeners = [];
  var cache = {};
  var lang = initialLang();

  function initialLang() {
    try {
      var q = new URLSearchParams(root.location.search).get("lang");
      if (q === "ar" || q === "en") return q;
    } catch (e) { /* no query string support */ }
    try {
      var saved = root.localStorage.getItem("asli.lang");
      if (saved === "ar" || saved === "en") return saved;
    } catch (e) { /* storage can be unavailable */ }
    return "ar";
  }

  function t(key, map) {
    var pair = S[key];
    if (!pair) throw new Error("Missing shell text: " + key);
    return fill(glue(pair[lang]), map);
  }

  /* Text from content.js, for the pages that load it (home and about). */
  function c(key, map) {
    var dict = root.ASLI && root.ASLI.t;
    var pair = dict && dict[key];
    if (!pair) throw new Error("Missing text key: " + key);
    return fill(glue(pair[lang]), map);
  }

  /* In Arabic, keep Latin phrases such as GitHub Pages or CC BY 4.0 on one line. */
  function glue(s) {
    return lang === "ar" ? String(s).replace(/([A-Za-z0-9][A-Za-z0-9.+]*) (?=[A-Za-z0-9])/g, "$1\u00A0") : s;
  }

  function fill(template, map) {
    if (!map) return template;
    return template.replace(/\{(\w+)\}/g, function (whole, k) {
      return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : whole;
    });
  }

  function pick(pair) {
    if (!pair) return "";
    if (typeof pair === "string") return pair;
    return glue(pair[lang] || pair.en || pair.ar || "");
  }

  function num(value, decimals) {
    var s = typeof decimals === "number" ? Number(value).toFixed(decimals) : String(value);
    if (lang !== "ar") return s;
    return s.replace(/[0-9]/g, function (d) { return AR_DIGITS[+d]; }).replace(/\./g, "٫");
  }

  /*
    Counted nouns. Arabic agreement depends on the number: one and two have their
    own forms, 3 to 10 take a plural, 11 to 99 a singular. Forms are passed in
    by the caller so each noun is written by a person, not guessed.
  */
  function count(n, forms) {
    if (lang === "en") return n === 1 ? forms.en.one : num(n) + " " + forms.en.other;
    if (n === 0 && forms.ar.zero) return forms.ar.zero;
    if (n === 1) return forms.ar.one;
    if (n === 2) return forms.ar.two;
    var rest = n % 100;
    if (rest >= 3 && rest <= 10) return num(n) + " " + forms.ar.few;
    return num(n) + " " + forms.ar.many;
  }

  function date(iso) {
    if (!iso) return "";
    var d = new Date(String(iso).slice(0, 10) + "T12:00:00Z");
    if (isNaN(d.getTime())) return String(iso);
    try {
      return new Intl.DateTimeFormat(lang === "ar" ? "ar-KW-u-nu-arab" : "en-GB", {
        day: "numeric", month: "long", year: "numeric", timeZone: "UTC"
      }).format(d);
    } catch (e) {
      return String(iso).slice(0, 10);
    }
  }

  function h(tag, props, children) {
    var n = doc.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      var v = props[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "text") n.textContent = v;
      else if (k === "className") n.className = v;
      else if (k === "on") Object.keys(v).forEach(function (ev) { n.addEventListener(ev, v[ev]); });
      else n.setAttribute(k, v === true ? "" : String(v));
    });
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      n.appendChild(typeof c === "string" ? doc.createTextNode(c) : c);
    });
    return n;
  }

  /* Draws into an element or an id; a page without that region is left alone. */
  function mount(target, nodes) {
    var host = typeof target === "string" ? doc.getElementById(target) : target;
    if (!host) return null;
    host.textContent = "";
    (nodes || []).forEach(function (n) { if (n) host.appendChild(n); });
    return host;
  }

  var PATHS = {
    pass: "M4.5 8.5 7 11 11.5 5.5",
    flag: "M5 5 11 11M11 5 5 11",
    minus: "M4.5 8H11.5",
    arrow: "M6 4 10 8 6 12"
  };

  function icon(kind) {
    var svg = doc.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("class", "icon icon-" + kind);
    if (kind === "info" || kind === "none") {
      var c = doc.createElementNS(SVG_NS, "circle");
      c.setAttribute("cx", "8");
      c.setAttribute("cy", "8");
      c.setAttribute("r", kind === "info" ? "2.2" : "4.5");
      svg.appendChild(c);
    } else {
      var p = doc.createElementNS(SVG_NS, "path");
      p.setAttribute("d", PATHS[kind] || PATHS.minus);
      svg.appendChild(p);
    }
    return svg;
  }

  function sourceLink(url) {
    return h("p", { className: "src" }, [h("a", { href: url, rel: "noopener", text: t("source") })]);
  }

  function json(path) {
    if (!cache[path]) {
      cache[path] = fetch(path, { cache: "no-cache" }).then(function (res) {
        if (!res.ok) throw new Error(path + ": " + res.status);
        return res.json();
      });
    }
    return cache[path];
  }

  function applyShell() {
    var html = doc.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    doc.querySelectorAll("[data-s]").forEach(function (n) { n.textContent = t(n.getAttribute("data-s")); });
    doc.querySelectorAll("[data-s-aria]").forEach(function (n) { n.setAttribute("aria-label", t(n.getAttribute("data-s-aria"))); });
    doc.querySelectorAll("[data-href-" + lang + "]").forEach(function (n) { n.setAttribute("href", n.getAttribute("data-href-" + lang)); });
    var button = doc.getElementById("lang");
    if (button) button.setAttribute("lang", lang === "ar" ? "en" : "ar");
    markCurrent();
    fillBuildLine();
  }

  function pageName(path) {
    var last = String(path || "").split("/").pop() || "index.html";
    return last.split("?")[0].split("#")[0] || "index.html";
  }

  function markCurrent() {
    var here = pageName(root.location.pathname);
    doc.querySelectorAll(".site-nav a, .bar-action, .foot-nav a").forEach(function (a) {
      var target = pageName(a.getAttribute("href"));
      if (target === here) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function fillBuildLine() {
    var line = doc.querySelector("[data-meta='build']");
    if (!line) return;
    json("data/meta.json").then(function (meta) {
      if (!meta.version) return;
      line.textContent = t("footBuild", { version: num(meta.version), date: date(meta.generated) });
    }).catch(function () { /* the line stays empty offline on a first visit */ });
  }

  function setLang(next) {
    if (next !== "ar" && next !== "en") return;
    lang = next;
    try { root.localStorage.setItem("asli.lang", lang); } catch (e) { /* storage can be unavailable */ }
    try {
      var url = new URL(root.location.href);
      url.searchParams.set("lang", lang);
      root.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (e) { /* history can be unavailable */ }
    applyShell();
    listeners.forEach(function (fn) { fn(lang); });
  }

  function onLang(fn) {
    listeners.push(fn);
    fn(lang);
  }

  applyShell();
  var langButton = doc.getElementById("lang");
  if (langButton) langButton.addEventListener("click", function () { setLang(lang === "ar" ? "en" : "ar"); });

  root.AsliSite = {
    get lang() { return lang; },
    t: t,
    c: c,
    glue: glue,
    fill: fill,
    pick: pick,
    num: num,
    count: count,
    date: date,
    h: h,
    mount: mount,
    icon: icon,
    sourceLink: sourceLink,
    json: json,
    onLang: onLang,
    setLang: setLang,
    reduceMotion: !!(root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches)
  };
})(window);
