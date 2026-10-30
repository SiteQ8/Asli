/*
  The registry page. Draws every body in data/registry.json with its genuine
  domains, apps, published numbers and channel policies, each with its source,
  and lists the open data files from data/meta.json. A body added to the
  registry, or a new export format, appears here on the next build without
  anyone touching this page.
*/
(function (root) {
  "use strict";

  var S = root.AsliSite;
  var doc = root.document;
  var h = S.h;
  var REPO = "https://github.com/SiteQ8/Asli";

  var T = {
    title: { ar: "سجل القنوات الرسمية", en: "Registry of official channels" },
    lead: {
      ar: "كل جهة هنا مسجّلة بنطاقاتها الأصلية وما تنشره من أرقام وسياسات، مع مصدر وتاريخ تحقق لكل منها، فإن لم تجد القناة هنا فلا تعدّها رسمية حتى تتحقق منها بنفسك.",
      en: "Every body here is recorded with its genuine domains and the numbers and policies it publishes, each with a source and a verification date. If a channel is not here, do not treat it as official until you have checked it yourself."
    },
    searchLabel: { ar: "ابحث باسم الجهة أو النطاق أو الرقم", en: "Search by name, domain or number" },
    searchPlaceholder: { ar: "مثل الداخلية أو moi.gov.kw", en: "For example interior or moi.gov.kw" },
    sectorLabel: { ar: "القطاع", en: "Sector" },
    all: { ar: "الكل", en: "All" },
    count: { ar: "تعرض القائمة {shown} من أصل {total}", en: "Showing {shown} of {total}" },
    loading: { ar: "يجري تحميل السجل", en: "Loading the registry" },
    failed: {
      ar: "تعذّر تحميل السجل، ويمكنك فتح الملف نفسه من قائمة البيانات أدناه.",
      en: "The registry could not be loaded. You can open the file itself from the data list below."
    },
    none: {
      ar: "لا توجد جهة تطابق بحثك، ولا يعني ذلك أن القناة احتيال بل يعني أنها ليست في السجل بعد.",
      en: "No body matches your search. That does not make the channel a scam, it means it is not in the registry yet."
    },
    domains: { ar: "النطاقات الرسمية", en: "Official domains" },
    apps: { ar: "التطبيقات الرسمية", en: "Official apps" },
    numbers: { ar: "أرقام تنشرها الجهة", en: "Numbers it publishes" },
    policies: { ar: "ما تقوله الجهة عن قنواتها", en: "What it says about its channels" },
    verified: { ar: "آخر تحقق في {date}", en: "Last verified on {date}" },
    sources: { ar: "المصادر", en: "Sources" },
    source: { ar: "المصدر", en: "Source" },
    correct: { ar: "اقترح تصحيحًا", en: "Suggest a correction" },
    appStore: { ar: "آب ستور", en: "App Store" },
    playStore: { ar: "جوجل بلاي", en: "Google Play" },
    dataTitle: { ar: "البيانات المفتوحة", en: "The open data" },
    dataLead: {
      ar: "يعمل الموقع كله بهذه الملفات المنشورة، ويستطيع أي بنك أو شركة اتصالات أو مطوّر أن يستهلكها مجانًا بترخيص CC BY 4.0، ويُعاد بناؤها آليًا عند كل تغيير.",
      en: "The whole site runs on these published files. Any bank, telco or developer can consume them for free under CC BY 4.0, and they are rebuilt automatically on every change."
    },
    mcp: {
      ar: "ويمكن للمساعدات الذكية أن تستعلم السجل والتغذية عبر خادم MCP المنشور في المستودع.",
      en: "AI assistants can query the registry and the feed through the MCP server published in the repository."
    },
    mcpLink: { ar: "اقرأ عن خادم MCP", en: "Read about the MCP server" }
  };

  var SECTORS = {
    government: { ar: "جهات حكومية", en: "Government" },
    bank: { ar: "بنوك", en: "Banks" },
    telecom: { ar: "شركات اتصالات", en: "Telecoms" },
    courier: { ar: "شركات شحن", en: "Couriers" },
    airline: { ar: "طيران", en: "Airlines" },
    association: { ar: "اتحادات", en: "Associations" },
    utility: { ar: "خدمات عامة", en: "Utilities" }
  };

  /* What each published file is. A file the build adds later still appears, under its own name. */
  var FILES = {
    "registry.json": { ar: "سجل القنوات الرسمية", en: "Registry of official channels" },
    "feed.json": { ar: "تغذية الاحتيال بصيغة JSON", en: "Scam feed, JSON" },
    "feed.csv": { ar: "تغذية الاحتيال بصيغة CSV", en: "Scam feed, CSV" },
    "feed.txt": { ar: "قائمة نصية بالمؤشرات", en: "Plain list of indicators" },
    "hosts.txt": { ar: "ملف hosts للحجب", en: "hosts file for blocking" },
    "adguard.txt": { ar: "قائمة AdGuard", en: "AdGuard list" },
    "rpz.zone": { ar: "منطقة DNS RPZ", en: "DNS RPZ zone" },
    "feed.stix2.json": { ar: "حزمة STIX 2.1", en: "STIX 2.1 bundle" },
    "feed.misp.json": { ar: "حدث MISP", en: "MISP event" },
    "meta.json": { ar: "الأعداد ووقت البناء", en: "Counts and build time" },
    "changes.json": { ar: "الجديد في كل إصدار", en: "What is new in each release" },
    "ecosystem.json": { ar: "أدوات SiteQ8 ذات الصلة", en: "Related SiteQ8 tools" }
  };
  var ALWAYS = ["registry.json", "meta.json", "changes.json", "ecosystem.json"];

  var BODIES = {
    ar: { zero: "لا جهة", one: "جهة رسمية واحدة", two: "جهتين رسميتين", few: "جهات رسمية", many: "جهة رسمية" },
    en: { one: "one official body", other: "official bodies" }
  };

  var state = { bodies: null, failed: false, meta: null, query: "", sector: "all", commonNote: null };
  var input;

  function t(key, map) {
    var pair = T[key];
    if (!pair) throw new Error("Missing registry text: " + key);
    return S.fill(S.glue(pair[S.lang]), map);
  }

  function listSep() { return S.lang === "ar" ? "، " : ", "; }

  function normalise(s) {
    return String(s || "").toLowerCase()
      .replace(/[ً-ْـ]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/[٠-٩]/g, function (d) { return String("٠١٢٣٤٥٦٧٨٩".indexOf(d)); });
  }

  function haystack(b) {
    var parts = [b.id, b.name.ar, b.name.en].concat(b.domains || []);
    (b.hotlines || []).forEach(function (l) { parts.push(l.number); });
    if (b.claims) parts = parts.concat(b.claims.ar || [], b.claims.en || []);
    (b.apps || []).forEach(function (a) { parts.push(a.name.ar, a.name.en); });
    return normalise(parts.join(" "));
  }

  function telHref(number) {
    return number.length <= 4 ? "tel:" + number : "tel:+965" + number;
  }

  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return url; }
  }

  function sourceLink(url) {
    return h("a", { className: "src-link", href: url, rel: "noopener", text: t("source") });
  }

  function renderBody(b) {
    var other = S.lang === "ar" ? "en" : "ar";
    var facts = [];

    facts.push(h("dt", { text: t("domains") }));
    facts.push(h("dd", {}, [h("ul", { className: "inline-list" }, (b.domains || []).map(function (d) {
      return h("li", {}, [h("bdi", { className: "domain", dir: "ltr", text: d })]);
    }))]));

    if ((b.apps || []).length) {
      facts.push(h("dt", { text: t("apps") }));
      facts.push(h("dd", {}, [h("ul", { className: "plain-list" }, b.apps.map(function (a) {
        return h("li", {}, [
          h("span", { className: "app-name", text: S.pick(a.name) }),
          a.ios ? h("a", { href: a.ios, rel: "noopener", text: t("appStore") }) : null,
          a.android ? h("a", { href: a.android, rel: "noopener", text: t("playStore") }) : null
        ]);
      }))]));
    }

    if ((b.hotlines || []).length) {
      facts.push(h("dt", { text: t("numbers") }));
      facts.push(h("dd", {}, [h("ul", { className: "plain-list" }, b.hotlines.map(function (l) {
        return h("li", {}, [
          h("a", { className: "number", href: telHref(l.number), dir: "ltr", text: l.number }),
          l.label ? h("span", { text: S.pick(l.label) }) : null,
          l.source ? sourceLink(l.source) : null
        ]);
      }))]));
    }

    if ((b.policies || []).length) {
      facts.push(h("dt", { text: t("policies") }));
      facts.push(h("dd", {}, [h("ul", { className: "plain-list" }, b.policies.map(function (p) {
        return h("li", {}, [h("span", { text: S.pick(p.text) }), p.source ? sourceLink(p.source) : null]);
      }))]));
    }

    var sources = (b.sources || []).map(function (url) {
      return h("a", { href: url, rel: "noopener", dir: "ltr", text: hostOf(url) });
    });

    return h("article", { className: "entry", id: "body-" + b.id, "aria-labelledby": "body-" + b.id + "-name" }, [
      h("header", { className: "entry-head" }, [
        h("h3", { id: "body-" + b.id + "-name", text: S.pick(b.name) }),
        h("p", { className: "entry-alt", lang: other, dir: other === "ar" ? "rtl" : "ltr", text: b.name[other] })
      ]),
      h("dl", { className: "entry-facts" }, facts),
      h("p", { className: "entry-meta" }, [
        h("span", { text: t("verified", { date: S.date(b.verified) }) }),
        sources.length ? h("span", {}, [t("sources") + " "].concat(sources.reduce(function (acc, a, i) {
          if (i) acc.push(listSep());
          acc.push(a);
          return acc;
        }, []))) : null,
        h("a", { href: REPO + "/blob/main/registry/bodies/" + b.id + ".json", rel: "noopener", text: t("correct") })
      ]),
      b.note && !sameNote(b.note, state.commonNote) ? h("p", { className: "entry-note", text: S.pick(b.note) }) : null
    ]);
  }

  /* Most entries share one note about how they were checked; it is said once above the list instead of in every entry. */
  function sameNote(a, b) { return !!(a && b && a.en === b.en); }

  function findCommonNote(bodies) {
    var counts = {};
    var best = null;
    bodies.forEach(function (b) {
      if (!b.note || !b.note.en) return;
      counts[b.note.en] = (counts[b.note.en] || 0) + 1;
      if (!best || counts[b.note.en] > counts[best.en]) best = b.note;
    });
    return best && counts[best.en] * 3 > bodies.length ? best : null;
  }

  function visible() {
    var q = normalise(state.query.trim());
    return state.bodies.filter(function (b) {
      if (state.sector !== "all" && b.sector !== state.sector) return false;
      return !q || b._hay.indexOf(q) >= 0;
    });
  }

  function sectorsInOrder() {
    var counts = {};
    state.bodies.forEach(function (b) { counts[b.sector] = (counts[b.sector] || 0) + 1; });
    return Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); });
  }

  function sectorName(id) { return SECTORS[id] ? S.pick(SECTORS[id]) : id; }

  function renderFilters() {
    var chips = [{ id: "all", label: t("all") }].concat(sectorsInOrder().map(function (id) { return { id: id, label: sectorName(id) }; }));
    S.mount("reg-sectors", chips.map(function (c) {
      return h("button", {
        type: "button",
        className: "chip",
        "aria-pressed": state.sector === c.id ? "true" : "false",
        text: c.label,
        on: { click: function () { state.sector = c.id; renderFilters(); renderList(); } }
      });
    }));
  }

  function renderList() {
    var countEl = doc.getElementById("reg-count");
    if (state.failed) {
      countEl.textContent = t("failed");
      countEl.classList.add("is-warn");
      S.mount("reg-list", []);
      return;
    }
    if (!state.bodies) {
      countEl.textContent = t("loading");
      return;
    }
    var shown = visible();
    var noteEl = doc.getElementById("reg-note");
    if (noteEl) {
      noteEl.hidden = !state.commonNote;
      noteEl.textContent = state.commonNote ? S.pick(state.commonNote) : "";
    }
    countEl.classList.remove("is-warn");
    countEl.textContent = t("count", { shown: S.num(shown.length), total: S.count(state.bodies.length, BODIES) });
    if (!shown.length) {
      S.mount("reg-list", [h("p", { className: "empty", text: t("none") })]);
      return;
    }
    var bySector = {};
    shown.forEach(function (b) { (bySector[b.sector] = bySector[b.sector] || []).push(b); });
    S.mount("reg-list", sectorsInOrder().filter(function (id) { return bySector[id]; }).map(function (id) {
      var list = bySector[id].slice().sort(function (a, b) { return S.pick(a.name).localeCompare(S.pick(b.name), S.lang); });
      return h("section", { className: "sector", id: "sector-" + id, "aria-labelledby": "sector-" + id + "-title" }, [
        h("h2", { id: "sector-" + id + "-title" }, [
          h("span", { text: sectorName(id) }),
          h("span", { className: "sector-count", text: S.num(list.length) })
        ]),
        h("div", { className: "entries" }, list.map(renderBody))
      ]);
    }));
  }

  function renderFiles() {
    var formats = state.meta && state.meta.formats ? state.meta.formats.slice() : [];
    var names = ALWAYS.slice(0, 1).concat(formats.filter(function (f) { return ALWAYS.indexOf(f) < 0; }), ALWAYS.slice(1));
    S.mount("data-files", names.map(function (name) {
      return h("li", {}, [
        h("a", { href: "data/" + name, dir: "ltr", text: name }),
        h("span", { text: FILES[name] ? S.pick(FILES[name]) : name })
      ]);
    }));
  }

  /* A link such as registry.html#body-moi or #sector-bank lands on its entry once the list exists. */
  function jumpToHash() {
    if (!root.location.hash || !state.bodies) return;
    var id = decodeURIComponent(root.location.hash.slice(1));
    var target = doc.getElementById(id);
    if (!target && /^(body|sector)-/.test(id) && (state.query || state.sector !== "all")) {
      state.query = "";
      state.sector = "all";
      if (input) input.value = "";
      renderFilters();
      renderList();
      target = doc.getElementById(id);
    }
    if (!target) return;
    target.scrollIntoView({ block: "start" });
  }

  function applyLang() {
    doc.title = t("title") + " | " + (S.lang === "ar" ? "أَصْلي" : "Asli");
    doc.querySelectorAll("[data-r]").forEach(function (n) { n.textContent = t(n.getAttribute("data-r")); });
    if (input) input.setAttribute("placeholder", t("searchPlaceholder"));
    if (state.bodies) renderFilters();
    renderList();
    renderFiles();
  }

  function init() {
    input = doc.getElementById("reg-q");
    input.addEventListener("input", function () { state.query = input.value; renderList(); });
    root.addEventListener("hashchange", jumpToHash);
    S.onLang(applyLang);
    Promise.all([
      S.json("data/registry.json").then(function (d) {
        state.bodies = (d.bodies || []).map(function (b) { b._hay = haystack(b); return b; });
        state.commonNote = findCommonNote(state.bodies);
      }).catch(function () { state.failed = true; }),
      S.json("data/meta.json").then(function (m) { state.meta = m; }).catch(function () { state.meta = null; })
    ]).then(function () {
      if (state.bodies) renderFilters();
      renderList();
      renderFiles();
      jumpToHash();
    });
  }

  init();
})(window);
