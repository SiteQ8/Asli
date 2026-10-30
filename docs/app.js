/*
  The about page. Renders every long-form section from content.js in the
  chosen language and wires the interactive parts. The shared shell (site.js)
  owns the language, the header and the footer. Text is always set with
  textContent.
*/
(function () {
  "use strict";

  var C = window.ASLI;
  var E = window.AsliEngine;
  var S = window.AsliSite;
  var doc = document;
  var h = S.h;
  var narrow = window.matchMedia ? window.matchMedia("(max-width: 640px)") : { matches: false };

  var state = {
    sample: C.demo.samples[0].id,
    node: C.lanes[0].nodes[0].id,
    weights: defaultWeights(),
    bodies: null,
    bodiesFailed: false,
    stampMotion: false
  };

  function T(key) { return S.c(key); }
  function P(pair) { return S.pick(pair); }
  function num(value, decimals) { return E.formatNumber(value, S.lang, decimals); }
  function pct(value) { return num(value) + (S.lang === "ar" ? "٪" : "%"); }
  function fill(template, map) { return S.fill(template, map); }
  function mount(id, nodes) { return S.mount(id, nodes); }

  function joinAnd(items) {
    if (items.length < 2) return items.join("");
    if (S.lang === "ar") return items.join(T("common.and"));
    return items.slice(0, -1).join(T("common.listSep")) + T("common.and") + items[items.length - 1];
  }

  /* Sections */

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
      return h("li", {}, [S.icon("flag"), h("span", { text: P(item) })]);
    }));
    mount("idea-registry", C.idea.registry.map(function (item) {
      return h("li", {}, [S.icon("pass"), h("span", { text: P(item) })]);
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
            state.stampMotion = !S.reduceMotion;
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
    if (url) body.push(S.sourceLink(url));
    return h("li", { className: "check st-" + status }, [
      h("span", { className: "check-icon" }, [S.icon(status), h("span", { className: "visually-hidden", text: T(statusKey) })]),
      h("span", { className: "check-name", text: name }),
      h("div", { className: "check-text" }, body)
    ]);
  }

  /*
    The demo runs window.AsliChecker, the same function the check page runs,
    against data/registry.json, the same file the check page reads. What the
    visitor sees here is what the real check says, not an illustration of it.
  */
  function renderDemo() {
    var s = currentSample();
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

    if (!state.bodies) {
      mount("demo-steps", [h("li", { className: "check st-info" }, [h("div", { className: "check-text" }, [h("p", { text: T(state.bodiesFailed ? "demo.offline" : "demo.loading") })])])]);
      mount("demo-verdict", []);
      return;
    }

    var r = window.AsliChecker.check({ text: s.text, channel: s.channel }, { bodies: state.bodies, feed: { domains: [], numbers: [] } });
    var items = [];

    var readLines = [r.hosts.length ? fill(T("f.links"), { links: r.hosts.join(T("common.listSep")) }) : T("f.noLinks")];
    readLines.push(r.claimed ? fill(T("f.claim"), { entity: P(r.claimed.name) }) : T("f.noClaim"));
    items.push(checkItem("info", T("step.read"), readLines));

    if (r.lookalike.length) {
      var imitated = r.claimed || r.lookalike[0].body;
      items.push(checkItem("flag", T("step.registry"), [fill(T("f.regMiss"), { host: r.lookalike[0].host, entity: P(imitated.name), official: joinAnd(imitated.domains.slice()) })]));
    } else if (r.official.length) {
      items.push(checkItem("pass", T("step.registry"), [fill(T("f.regHit"), { host: r.official[0].host, entity: P(r.official[0].body.name) })]));
    } else if (r.unknown.length) {
      items.push(checkItem("info", T("step.registry"), r.unknown.map(function (host) { return fill(T("f.regUnknown"), { host: host }); })));
    } else {
      items.push(checkItem("none", T("step.registry"), [T("f.regNone")]));
    }

    if (r.lookalike.length) {
      items.push(checkItem("flag", T("step.lookalike"), r.lookalike.map(function (l) {
        return fill(T("f.look"), { host: l.host, entity: P(l.body.name) });
      })));
    } else {
      items.push(checkItem(r.hosts.length ? "pass" : "none", T("step.lookalike"), [T("f.noLook")]));
    }

    if (r.broken.length) {
      items.push(checkItem("flag", T("step.policy"), [fill(T("f.policyBreak"), { policy: P(r.broken[0].policy.text) })], r.broken[0].policy.source));
    } else if (r.claimed) {
      items.push(checkItem("pass", T("step.policy"), [T("f.policyOk")]));
    } else {
      items.push(checkItem("none", T("step.policy"), [T("f.policyNone")]));
    }

    items.push(r.pressure ? checkItem("flag", T("step.pressure"), [T("f.pressure")]) : checkItem("pass", T("step.pressure"), [T("f.noPressure")]));
    mount("demo-steps", items);

    var verdict = r.verdict === "listed" ? "impersonation" : r.verdict;
    var verdictText = {
      impersonation: [T("v.impersonation"), T("v.impersonationWhy")],
      official: [T("v.official"), T("v.officialWhy")],
      unverified: [T("v.unverified"), T("v.unverifiedWhy")]
    }[verdict];

    mount("demo-verdict", [
      h("div", { className: "verdict-head" }, [
        h("p", { className: "field-label", text: T("demo.verdict") }),
        h("p", { className: "stamp v-" + verdict + (state.stampMotion ? " stamp-in" : ""), text: verdictText[0] })
      ]),
      h("div", { className: "verdict-body" }, [
        h("p", { className: "verdict-why", text: verdictText[1] }),
        h("p", { className: "field-label", text: T("demo.todo") }),
        h("p", { className: "todo", text: P(s.advice) })
      ])
    ]);
    state.stampMotion = false;
  }

  function loadRegistry() {
    S.json("data/registry.json")
      .then(function (data) {
        state.bodies = data.bodies || [];
        renderDemo();
      })
      .catch(function () {
        state.bodiesFailed = true;
        renderDemo();
      });
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
    mount("lanes", C.lanes.map(function (lane) {
      return h("div", { className: "lane" }, [
        h("h3", { className: "lane-title", text: P(lane.title) }),
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

  /* Roadmap and progress: each phase and each step says where it stands. */

  var PHASE_STATUS = { done: "roadmap.done", active: "roadmap.active", ahead: "roadmap.ahead" };
  var STEP_STATUS = { done: "status.done", active: "status.active", todo: "status.todo" };
  var STEP_ICON = { done: "pass", active: "info", todo: "none" };

  function renderPhases() {
    mount("phases", C.phases.map(function (p) {
      return h("li", { className: "phase is-" + p.status, "aria-current": p.status === "active" ? "step" : null }, [
        h("div", { className: "phase-when" }, [
          h("p", { className: "phase-n", text: fill(T("roadmap.phase"), { n: num(p.n) }) }),
          h("p", { className: "phase-status", text: T(PHASE_STATUS[p.status]) }),
          h("p", { className: "phase-weeks", text: P(p.when) }),
          h("p", { className: "phase-dates", text: P(p.dates) })
        ]),
        h("div", { className: "phase-body" }, [
          h("h3", { text: P(p.title) }),
          h("ul", { className: "goals" }, p.goals.map(function (g) {
            return h("li", { className: g.done ? "is-done" : "" }, [
              S.icon(g.done ? "pass" : "none"),
              h("span", { text: P(g.text) }),
              g.done ? h("span", { className: "visually-hidden", text: " (" + T(STEP_STATUS.done) + ")" }) : null
            ]);
          })),
          h("div", { className: "exit" }, [
            h("p", { className: "exit-label", text: T("roadmap.exit") }),
            h("p", { text: P(p.exit) })
          ])
        ])
      ]);
    }));
  }

  function renderSteps() {
    mount("next-steps", C.steps.map(function (s) {
      return h("li", { className: "st-" + s.status }, [
        h("span", { className: "progress-icon" }, [S.icon(STEP_ICON[s.status])]),
        h("p", { className: "progress-text", text: P(s.text) }),
        h("p", { className: "progress-status", text: T(STEP_STATUS[s.status]) })
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
        item.url ? S.sourceLink(item.url) : null
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
    renderSteps();
  }

  function applyLang() {
    doc.title = T("about.title");
    var desc = doc.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", T("about.lead"));
    doc.querySelectorAll("[data-t]").forEach(function (n) { n.textContent = T(n.getAttribute("data-t")); });
    doc.querySelectorAll("[data-t-aria]").forEach(function (n) { n.setAttribute("aria-label", T(n.getAttribute("data-t-aria"))); });
    renderAll();
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

  if (narrow.addEventListener) {
    narrow.addEventListener("change", function () { placeLaneDetail(doc.getElementById("lane-detail")); });
  }
  doc.getElementById("matrix-reset").addEventListener("click", function () {
    state.weights = defaultWeights();
    renderWeights();
    updateMatrix();
  });

  S.onLang(applyLang);
  loadRegistry();
  watchSections();
})();
