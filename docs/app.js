/*
  Asli site. Renders every section from content.js in the chosen language
  and wires the interactive parts. Text is always set with textContent.
*/
(function () {
  "use strict";

  var C = window.ASLI;
  var E = window.AsliEngine;
  var doc = document;
  var SVG_NS = "http://www.w3.org/2000/svg";
  var reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var narrow = window.matchMedia ? window.matchMedia("(max-width: 640px)") : { matches: false };

  var lang = initialLang();
  var state = {
    sample: C.demo.samples[0].id,
    node: C.lanes[0].nodes[0].id,
    weights: defaultWeights(),
    stampMotion: false
  };

  /* Language */

  function initialLang() {
    var q = null;
    try { q = new URLSearchParams(window.location.search).get("lang"); } catch (e) { q = null; }
    if (q === "ar" || q === "en") return q;
    try {
      var saved = window.localStorage.getItem("asli.lang");
      if (saved === "ar" || saved === "en") return saved;
    } catch (e) { /* storage can be unavailable */ }
    return "ar";
  }

  /* In Arabic, keep Latin phrases such as GitHub Pages or CC BY 4.0 on one line. */
  function glue(s) {
    return lang === "ar" ? s.replace(/([A-Za-z0-9][A-Za-z0-9.+]*) (?=[A-Za-z0-9])/g, "$1\u00A0") : s;
  }

  function T(key) {
    var pair = C.t[key];
    if (!pair) throw new Error("Missing text key: " + key);
    return glue(pair[lang]);
  }

  function P(pair) { return glue(pair[lang]); }

  function num(value, decimals) { return E.formatNumber(value, lang, decimals); }

  function pct(value) { return num(value) + (lang === "ar" ? "٪" : "%"); }

  function fill(template, map) {
    return template.replace(/\{(\w+)\}/g, function (whole, key) {
      return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : whole;
    });
  }

  function joinAnd(items) {
    if (items.length < 2) return items.join("");
    if (lang === "ar") return items.join(T("common.and"));
    return items.slice(0, -1).join(T("common.listSep")) + T("common.and") + items[items.length - 1];
  }

  /* DOM helpers */

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

  function mount(id, nodes) {
    var host = doc.getElementById(id);
    host.textContent = "";
    nodes.forEach(function (n) { host.appendChild(n); });
    return host;
  }

  function icon(kind) {
    var paths = {
      pass: "M4.5 8.5 7 11 11.5 5.5",
      flag: "M5 5 11 11M11 5 5 11"
    };
    var svg = doc.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "icon icon-" + kind);
    if (kind === "info") {
      var dot = doc.createElementNS(SVG_NS, "circle");
      dot.setAttribute("cx", "8"); dot.setAttribute("cy", "8"); dot.setAttribute("r", "2.2");
      svg.appendChild(dot);
    } else if (kind === "none") {
      var ring = doc.createElementNS(SVG_NS, "circle");
      ring.setAttribute("cx", "8"); ring.setAttribute("cy", "8"); ring.setAttribute("r", "4.5");
      svg.appendChild(ring);
    } else {
      var p = doc.createElementNS(SVG_NS, "path");
      p.setAttribute("d", paths[kind]);
      svg.appendChild(p);
    }
    return svg;
  }

  function sourceLink(url) {
    return h("p", { className: "src" }, [h("a", { href: url, rel: "noopener", text: T("common.source") })]);
  }

  /* Sections */

  function renderTongues() {
    mount("tongues", C.questions.map(function (q) {
      return h("li", {}, [
        h("span", { className: "q", lang: q.lang, dir: q.dir, text: q.text }),
        h("span", { className: "qn", text: P(q.name) })
      ]);
    }));
  }

  function renderLedger() {
    mount("ledger", C.evidence.map(function (e) {
      return h("li", {}, [
        h("span", { className: "yr", text: num(e.year) }),
        h("div", {}, [
          h("p", { className: "fact", text: P(e.fact) }),
          h("p", { className: "src" }, [
            P(e.source) + " ",
            h("a", { href: e.url, rel: "noopener", text: T("common.source") })
          ])
        ])
      ]);
    }));
  }

  function renderIdea() {
    mount("idea-block", C.idea.block.map(function (item) {
      return h("li", {}, [icon("flag"), h("span", { text: P(item) })]);
    }));
    mount("idea-registry", C.idea.registry.map(function (item) {
      return h("li", {}, [icon("pass"), h("span", { text: P(item) })]);
    }));
    mount("idea-open", C.idea.open.map(function (item) {
      return h("li", {}, [h("h4", { text: P(item.title) }), h("p", { text: P(item.body) })]);
    }));
  }

  /* Demo */

  function currentSample() {
    return C.demo.samples.filter(function (s) { return s.id === state.sample; })[0];
  }

  function renderDemoPicker() {
    mount("demo-samples", C.demo.samples.map(function (s) {
      return h("button", {
        type: "button",
        className: "chip",
        "aria-pressed": s.id === state.sample ? "true" : "false",
        text: P(s.label),
        on: {
          click: function () {
            if (state.sample === s.id) return;
            state.sample = s.id;
            state.stampMotion = !reduceMotion;
            renderDemoPicker();
            renderDemo();
          }
        }
      });
    }));
  }

  function checkItem(status, name, lines, url) {
    var statusKey = { flag: "status.flag", pass: "status.pass", info: "status.info", none: "status.none" }[status];
    var body = lines.map(function (line) { return h("p", { text: line }); });
    if (url) body.push(sourceLink(url));
    return h("li", { className: "check st-" + status }, [
      h("span", { className: "check-icon" }, [icon(status), h("span", { className: "visually-hidden", text: T(statusKey) })]),
      h("span", { className: "check-name", text: name }),
      h("div", { className: "check-text" }, body)
    ]);
  }

  function officialList(entity) {
    var items = entity.domains.slice();
    entity.channels.forEach(function (c) { items.push(P(c.name)); });
    return joinAnd(items);
  }

  function renderDemo() {
    var s = currentSample();
    var r = E.analyze(s, C.demo);
    var sender = typeof s.from === "string" ? s.from : P(s.from);

    mount("demo-message", [
      h("div", { className: "phone-meta" }, [
        h("span", {}, [h("span", { className: "meta-k", text: T("demo.from") }), " ", h("bdi", { text: sender })]),
        h("span", {}, [h("span", { className: "meta-k", text: T("demo.channel") }), " ", h("span", { text: P(s.channelName) })])
      ]),
      h("p", { className: "bubble", lang: s.lang, dir: s.lang === "ar" ? "rtl" : "ltr" }, E.splitHosts(s.text).map(function (part) {
        return part.host ? h("span", { className: "msg-link", dir: "ltr", text: part.text }) : part.text;
      }))
    ]);

    var entityName = r.entity ? P(r.entity.name) : "";
    var items = [];

    var readLines = [r.hosts.length ? fill(T("f.links"), { links: r.hosts.join(T("common.listSep")) }) : T("f.noLinks")];
    readLines.push(r.entity ? fill(T("f.claim"), { entity: entityName }) : T("f.noClaim"));
    items.push(checkItem("info", T("step.read"), readLines));

    if (r.registry.status === "miss") {
      items.push(checkItem("flag", T("step.registry"), [fill(T("f.regMiss"), { host: r.registry.host, entity: entityName, official: officialList(r.entity) })]));
    } else if (r.registry.status === "hit") {
      items.push(checkItem("pass", T("step.registry"), [fill(T("f.regHit"), { host: r.registry.host, entity: entityName })]));
    } else if (r.registry.status === "channel") {
      items.push(checkItem("pass", T("step.registry"), [fill(T("f.regChannel"), { channel: P(r.registry.channel.name), entity: entityName })]));
    } else {
      items.push(checkItem("none", T("step.registry"), [T("f.regNone")]));
    }

    if (r.lookalike.length) {
      items.push(checkItem("flag", T("step.lookalike"), r.lookalike.map(function (l) {
        return fill(T("f.look"), { host: l.host, entity: P(l.entity.name) });
      })));
    } else {
      items.push(checkItem(r.hosts.length ? "pass" : "none", T("step.lookalike"), [T("f.noLook")]));
    }

    if (r.policy.status === "broken") {
      items.push(checkItem("flag", T("step.policy"), [fill(T("f.policyBreak"), { policy: P(r.policy.policy.text) })], r.policy.policy.url));
    } else if (r.policy.status === "ok") {
      items.push(checkItem("pass", T("step.policy"), [T("f.policyOk")]));
    } else {
      items.push(checkItem("none", T("step.policy"), [T("f.policyNone")]));
    }

    items.push(r.pressure ? checkItem("flag", T("step.pressure"), [T("f.pressure")]) : checkItem("pass", T("step.pressure"), [T("f.noPressure")]));
    mount("demo-steps", items);

    var verdictText = {
      impersonation: [T("v.impersonation"), T("v.impersonationWhy")],
      official: [T("v.official"), T("v.officialWhy")],
      unverified: [T("v.unverified"), T("v.unverifiedWhy")]
    }[r.verdict];

    var stamp = h("p", { className: "stamp v-" + r.verdict + (state.stampMotion ? " stamp-in" : ""), text: verdictText[0] });
    mount("demo-verdict", [
      h("div", { className: "verdict-head" }, [
        h("p", { className: "small-label", text: T("demo.verdict") }),
        stamp
      ]),
      h("div", { className: "verdict-body" }, [
        h("p", { className: "verdict-why", text: verdictText[1] }),
        h("p", { className: "small-label", text: T("demo.todo") }),
        h("p", { className: "todo", text: P(s.advice) })
      ])
    ]);
    state.stampMotion = false;
  }

  /* Architecture */

  function findNode(id) {
    var found = null;
    C.lanes.forEach(function (lane) {
      lane.nodes.forEach(function (n) { if (n.id === id) found = n; });
    });
    return found;
  }

  function renderLanes() {
    var detail = doc.getElementById("lane-detail");
    var lanesEl = doc.getElementById("lanes");
    if (detail.parentNode === lanesEl) lanesEl.parentNode.insertBefore(detail, lanesEl.nextSibling);
    mount("lanes", C.lanes.map(function (lane, i) {
      return h("div", { className: "lane" }, [
        h("h3", { className: "lane-title" }, [h("span", { className: "lane-n", text: num(i + 1) }), " ", h("span", { text: P(lane.title) })]),
        h("ul", {}, lane.nodes.map(function (n) {
          return h("li", {}, [h("button", {
            type: "button",
            className: "node",
            "aria-pressed": n.id === state.node ? "true" : "false",
            "aria-controls": "lane-detail",
            text: P(n.title),
            on: {
              click: function () {
                state.node = n.id;
                renderLanes();
                renderLaneDetail();
              }
            }
          })]);
        }))
      ]);
    }));
  }

  function renderLaneDetail() {
    var n = findNode(state.node);
    var reuse;
    if (n.reuses.length) {
      var links = [];
      n.reuses.forEach(function (repo, i) {
        if (i) links.push(T("common.listSep"));
        links.push(h("a", { href: "https://github.com/SiteQ8/" + repo, rel: "noopener", dir: "ltr", text: repo }));
      });
      reuse = h("p", { className: "reuses" }, [h("span", { className: "meta-k", text: T("how.reuses") }), " "].concat(links));
    } else {
      reuse = h("p", { className: "reuses", text: T("how.newPart") });
    }
    var detail = mount("lane-detail", [h("h3", { text: P(n.title) }), h("p", { text: P(n.body) }), reuse]);
    placeLaneDetail(detail);
  }

  /* On a phone the lanes stack, so the detail sits right under the lane that holds the selected part. */
  function placeLaneDetail(detail) {
    var lanes = doc.getElementById("lanes");
    if (narrow.matches) {
      var laneIndex = 0;
      C.lanes.forEach(function (lane, i) {
        lane.nodes.forEach(function (n) { if (n.id === state.node) laneIndex = i; });
      });
      var laneEl = lanes.children[laneIndex];
      if (laneEl && laneEl.nextSibling !== detail) lanes.insertBefore(detail, laneEl.nextSibling);
    } else if (lanes.nextSibling !== detail) {
      lanes.parentNode.insertBefore(detail, lanes.nextSibling);
    }
  }

  /* Selection matrix */

  function defaultWeights() {
    var w = {};
    C.criteria.forEach(function (c) { w[c.id] = c.weight; });
    return w;
  }

  function weightShare(id) {
    var sum = E.weightSum(state.weights);
    return sum > 0 ? Math.round((state.weights[id] / sum) * 100) : 0;
  }

  function renderWeights() {
    mount("weights", C.criteria.map(function (c) {
      var out = h("output", { className: "w-out", "data-for": c.id, text: pct(weightShare(c.id)) });
      var input = h("input", {
        type: "range", min: "0", max: "10", step: "1", value: String(state.weights[c.id]),
        "aria-label": fill(T("why.weightOf"), { name: P(c.name) }),
        on: {
          input: function (ev) {
            state.weights[c.id] = Number(ev.target.value);
            updateMatrix();
          }
        }
      });
      return h("div", { className: "weight" }, [
        h("span", { className: "c-title", text: P(c.name) }),
        h("span", { className: "c-desc", text: P(c.desc) }),
        h("span", { className: "w" }, [input, out])
      ]);
    }));
  }

  function renderMatrixHead() {
    var table = doc.getElementById("matrix");
    table.textContent = "";
    var head = h("tr", {}, [h("th", { scope: "col", className: "c-name", text: T("why.candidate") })]);
    C.criteria.forEach(function (c) {
      head.appendChild(h("th", { scope: "col", className: "c-crit", text: P(c.name) }));
    });
    head.appendChild(h("th", { scope: "col", className: "c-total", text: T("why.total") }));
    table.appendChild(h("thead", {}, [head]));
    table.appendChild(h("tbody", { id: "matrix-body" }));
    updateMatrix();
  }

  function updateMatrix() {
    C.criteria.forEach(function (c) {
      var out = doc.querySelector('output[data-for="' + c.id + '"]');
      if (out) out.textContent = pct(weightShare(c.id));
    });
    var ranked = E.rank(C.candidates, state.weights, C.criteria);
    var top = ranked[0].score;
    var zero = E.weightSum(state.weights) === 0;
    var byId = {};
    C.candidates.forEach(function (c) { byId[c.id] = c; });

    mount("matrix-body", ranked.map(function (row) {
      var c = byId[row.id];
      var isTop = !zero && Math.abs(row.score - top) < 1e-9;
      var cells = [h("th", { scope: "row", className: "c-name" }, [
        h("span", { className: "cand" }, [
          h("span", { text: P(c.name) }),
          c.id === C.chosen ? h("span", { className: "tag", text: T("why.chosen") }) : null
        ]),
        h("span", { className: "cand-why", text: P(c.why) })
      ])];
      C.criteria.forEach(function (k) {
        cells.push(h("td", { className: "c-score", text: num(c.scores[k.id]) }));
      });
      var meter = h("span", { className: "meter", "aria-hidden": "true" }, [h("i", { style: "width:" + (row.score / 5 * 100).toFixed(1) + "%" })]);
      cells.push(h("td", { className: "c-total" }, [h("div", { className: "total" }, [meter, h("b", { text: num(row.score, 2) })])]));
      return h("tr", { className: isTop ? "is-top" : "" }, cells);
    }));

    var result = doc.getElementById("matrix-result");
    if (zero) { result.textContent = T("why.zero"); return; }
    var winners = ranked.filter(function (r) { return Math.abs(r.score - top) < 1e-9; }).map(function (r) { return P(byId[r.id].short); });
    result.textContent = fill(T(winners.length > 1 ? "why.tie" : "why.result"), { winner: joinAnd(winners), score: num(top, 2) });
  }

  /* Remaining sections */

  function renderPhases() {
    mount("phases", C.phases.map(function (p) {
      return h("li", { className: "phase" }, [
        h("div", { className: "phase-when" }, [
          h("p", { className: "phase-n", text: fill(T("roadmap.phase"), { n: num(p.n) }) }),
          h("p", { className: "phase-weeks", text: P(p.when) }),
          h("p", { className: "phase-dates", text: P(p.dates) })
        ]),
        h("div", { className: "phase-body" }, [
          h("h3", { text: P(p.title) }),
          h("ul", { className: "goals" }, p.goals.map(function (g) { return h("li", { text: P(g) }); })),
          h("div", { className: "exit" }, [
            h("p", { className: "exit-label", text: T("roadmap.exit") }),
            h("p", { text: P(p.exit) })
          ])
        ])
      ]);
    }));
  }

  function renderReuse() {
    mount("reuse-list", C.reuse.map(function (r) {
      return h("li", {}, [
        h("a", { href: "https://github.com/SiteQ8/" + r.repo, rel: "noopener", dir: "ltr", text: r.repo }),
        h("p", { text: P(r.role) })
      ]);
    }));
  }

  function gridItems(list) {
    return list.map(function (item) {
      return h("li", {}, [
        h("h3", { text: P(item.title) }),
        h("p", { text: P(item.body) }),
        item.url ? sourceLink(item.url) : null
      ]);
    });
  }

  function renderRegister(id, headKeys, rows) {
    var table = doc.getElementById(id);
    table.textContent = "";
    table.appendChild(h("thead", {}, [h("tr", {}, headKeys.map(function (k) { return h("th", { scope: "col", text: T(k) }); }))]));
    table.appendChild(h("tbody", {}, rows.map(function (r) {
      return h("tr", {}, [h("th", { scope: "row", text: P(r[0]) }), h("td", { text: P(r[1]) })]);
    })));
  }

  function renderAll() {
    renderTongues();
    renderLedger();
    renderIdea();
    renderDemoPicker();
    renderDemo();
    renderLanes();
    renderLaneDetail();
    renderWeights();
    renderMatrixHead();
    renderPhases();
    renderReuse();
    mount("trust-list", gridItems(C.trust));
    renderRegister("measures-table", ["measures.metric", "measures.target"], C.measures.map(function (m) { return [m.metric, m.target]; }));
    renderRegister("risks-table", ["risks.risk", "risks.response"], C.risks.map(function (r) { return [r.risk, r.response]; }));
    mount("serves-list", gridItems(C.serves));
    mount("next-steps", C.steps.map(function (s) { return h("li", { text: P(s) }); }));
  }

  function applyLang() {
    var root = doc.documentElement;
    root.setAttribute("lang", lang);
    root.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    doc.title = T("meta.title");
    var desc = doc.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", T("meta.description"));
    doc.querySelectorAll("[data-t]").forEach(function (n) { n.textContent = T(n.getAttribute("data-t")); });
    doc.querySelectorAll("[data-t-aria]").forEach(function (n) { n.setAttribute("aria-label", T(n.getAttribute("data-t-aria"))); });
    doc.getElementById("lang").setAttribute("lang", lang === "ar" ? "en" : "ar");
    doc.getElementById("full-text").setAttribute("href", C.repo + "/blob/main/" + (lang === "ar" ? "PROJECT.ar.md" : "PROJECT.md"));
    renderAll();
  }

  function switchLang() {
    lang = lang === "ar" ? "en" : "ar";
    try { window.localStorage.setItem("asli.lang", lang); } catch (e) { /* storage can be unavailable */ }
    try {
      var url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (e) { /* history can be unavailable */ }
    applyLang();
  }

  function watchSections() {
    if (!("IntersectionObserver" in window)) return;
    var links = {};
    doc.querySelectorAll(".toc a").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(links).forEach(function (id) { links[id].removeAttribute("aria-current"); });
        var a = links[entry.target.id];
        if (a) a.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    doc.querySelectorAll(".part").forEach(function (s) { io.observe(s); });
  }

  doc.getElementById("lang").addEventListener("click", switchLang);
  if (narrow.addEventListener) {
    narrow.addEventListener("change", function () { placeLaneDetail(doc.getElementById("lane-detail")); });
  }
  doc.getElementById("matrix-reset").addEventListener("click", function () {
    state.weights = defaultWeights();
    renderWeights();
    updateMatrix();
  });

  applyLang();
  window.AsliSeal.draw(doc.getElementById("seal"), { animate: !reduceMotion });
  watchSections();
})();
