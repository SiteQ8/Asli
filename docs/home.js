/*
  The home page. The real checker sits in the first screen; below it, what
  Asli knows today, read live from the published files: the registry, the
  feed, the build metadata, the releases and the related tools. Nothing here
  is typed by hand, so a new body, a new release or a new related tool shows
  up as soon as the data is rebuilt.
*/
(function () {
  "use strict";

  /* The long write up used to live on this page. Old links to its sections still land on them. */
  var MOVED = ["content", "problem", "idea", "demo", "how", "why", "roadmap", "reuse", "trust", "measures", "risks", "serves", "next"];
  if (MOVED.indexOf(window.location.hash.slice(1)) >= 0) {
    window.location.replace("about.html" + window.location.search + window.location.hash);
    return;
  }

  var C = window.ASLI;
  var S = window.AsliSite;
  var doc = document;
  var h = S.h;

  var SECTOR = {
    government: "sector.government",
    bank: "sector.bank",
    telecom: "sector.telecom",
    courier: "sector.courier",
    airline: "sector.airline",
    association: "sector.association",
    utility: "sector.utility"
  };
  var WATCH = { ok: "home.watchOk", degraded: "home.watchDegraded", down: "home.watchDown" };
  var CHANGES_SHOWN = 3;

  var data = { registry: null, feed: null, meta: null, changes: null, ecosystem: null };

  function T(key, map) { return S.c(key, map); }
  function listSep() { return S.lang === "ar" ? "، " : ", "; }

  function load(name, path) {
    return S.json(path).then(function (value) { data[name] = value; }).catch(function () { data[name] = null; });
  }

  /* The question in the seven languages Asli will speak. */
  function renderTongues() {
    S.mount("tongues", C.questions.map(function (q) {
      return h("li", {}, [
        h("span", { className: "q", lang: q.lang, dir: q.dir, text: q.text }),
        h("span", { className: "qn", text: S.pick(q.name) })
      ]);
    }));
  }

  function fact(label, value, extra) {
    return [
      h("dt", { text: label }),
      h("dd", {}, [h("span", { className: "fact-value", text: value })].concat(extra || []))
    ];
  }

  function renderStatus() {
    var bodies = data.registry ? data.registry.bodies || [] : null;
    var rows = [];
    if (bodies) {
      var domains = 0;
      var numbers = 0;
      var policies = 0;
      bodies.forEach(function (b) {
        domains += (b.domains || []).length;
        numbers += (b.hotlines || []).length;
        policies += (b.policies || []).length;
      });
      rows = rows.concat(
        fact(T("home.statBodies"), S.num(bodies.length)),
        fact(T("home.statDomains"), S.num(domains)),
        fact(T("home.statNumbers"), S.num(numbers)),
        fact(T("home.statPolicies"), S.num(policies))
      );
    }
    if (data.feed) rows = rows.concat(fact(T("home.statFeed"), S.num(data.feed.count || 0)));
    var watch = data.meta && data.meta.watch;
    if (watch && typeof watch.held === "number") rows = rows.concat(fact(T("home.statHeld"), S.num(watch.held)));
    if (watch && watch.lastRun && watch.lastRun.date) {
      var key = WATCH[watch.lastRun.health] || WATCH.ok;
      rows = rows.concat(fact(T("home.statWatch"), T(key, { date: S.date(watch.lastRun.date) })));
    }
    var current = C.phases.filter(function (p) { return p.status === "active"; })[0];
    if (current) {
      rows = rows.concat(fact(T("roadmap.current"), T("roadmap.phase", { n: S.num(current.n) }) + listSep() + S.pick(current.title), [
        " ",
        h("a", { className: "fact-link", href: "about.html#roadmap", text: T("sec.roadmap") })
      ]));
    }
    S.mount("status-list", rows);
  }

  function renderSectors() {
    var bodies = data.registry ? data.registry.bodies || [] : [];
    var groups = {};
    bodies.forEach(function (b) {
      (groups[b.sector] = groups[b.sector] || []).push(b);
    });
    var order = Object.keys(groups).sort(function (a, b) {
      return groups[b].length - groups[a].length || a.localeCompare(b);
    });
    S.mount("sector-list", order.map(function (sector) {
      var names = groups[sector].map(function (b) { return S.pick(b.name); }).sort(function (a, b) { return a.localeCompare(b, S.lang); });
      return h("li", {}, [
        h("p", { className: "sector-head" }, [
          h("a", { href: "registry.html#sector-" + sector, text: SECTOR[sector] ? T(SECTOR[sector]) : sector }),
          h("span", { className: "sector-count", text: S.num(groups[sector].length) })
        ]),
        h("p", { className: "sector-names", text: names.join(listSep()) })
      ]);
    }));
  }

  function renderChanges() {
    var releases = data.changes && data.changes.releases ? data.changes.releases.slice(0, CHANGES_SHOWN) : [];
    if (!releases.length) {
      S.mount("change-list", [h("li", { className: "changes-empty", text: T("home.changesEmpty") })]);
      return;
    }
    var other = S.lang === "ar" ? "en" : "ar";
    S.mount("change-list", releases.map(function (r) {
      var items = (r.items && r.items[S.lang] && r.items[S.lang].length) ? r.items[S.lang] : (r.items && r.items[other]) || [];
      var itemLang = (r.items && r.items[S.lang] && r.items[S.lang].length) ? S.lang : other;
      return h("li", { className: "release" }, [
        h("p", { className: "release-head" }, [
          h("a", { href: r.url, rel: "noopener", dir: "ltr", text: r.tag }),
          h("span", { className: "release-date", text: S.date(r.date) })
        ]),
        h("ul", { className: "release-items", lang: itemLang, dir: itemLang === "ar" ? "rtl" : "ltr" }, items.map(function (item) {
          return h("li", { text: item });
        }))
      ]);
    }));
  }

  function renderRelated() {
    var section = doc.getElementById("related");
    var repos = data.ecosystem && data.ecosystem.repos ? data.ecosystem.repos : [];
    if (!section) return;
    section.hidden = !repos.length;
    S.mount("related-list", repos.map(function (r) {
      var description = r.description || "";
      var arabic = /[؀-ۿ]/.test(description);
      return h("li", {}, [
        h("p", { className: "related-name" }, [h("a", { href: r.homepage || r.url, rel: "noopener", dir: "ltr", text: r.name })]),
        description ? h("p", { className: "related-desc", lang: arabic ? "ar" : "en", dir: arabic ? "rtl" : "ltr", text: description }) : null,
        r.homepage ? h("p", { className: "related-repo" }, [h("a", { href: r.url, rel: "noopener", text: T("home.relatedRepo") })]) : null
      ]);
    }));
  }

  function renderData() {
    renderStatus();
    renderSectors();
    renderChanges();
    renderRelated();
  }

  function applyLang() {
    doc.title = T("meta.title");
    var desc = doc.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", T("meta.description"));
    doc.querySelectorAll("[data-t]").forEach(function (n) { n.textContent = T(n.getAttribute("data-t")); });
    doc.querySelectorAll("[data-t-aria]").forEach(function (n) { n.setAttribute("aria-label", T(n.getAttribute("data-t-aria"))); });
    renderTongues();
    renderData();
  }

  S.onLang(applyLang);

  var checkRoot = doc.getElementById("home-check");
  if (checkRoot && window.AsliCheckUI) window.AsliCheckUI.mount(checkRoot, { samples: C.demo.samples, headingLevel: 2 });

  var seal = doc.getElementById("seal");
  if (seal && window.AsliSeal) window.AsliSeal.draw(seal, { animate: !S.reduceMotion });

  Promise.all([
    load("registry", "data/registry.json"),
    load("feed", "data/feed.json"),
    load("meta", "data/meta.json"),
    load("changes", "data/changes.json"),
    load("ecosystem", "data/ecosystem.json")
  ]).then(renderData);
})();
