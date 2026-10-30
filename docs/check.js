/*
  The checker as a component. The home page and check.html mount the same
  form and the same result, running window.AsliChecker against the published
  registry and feed. Nothing leaves the browser.
*/
(function (root) {
  "use strict";

  var S = root.AsliSite;
  var C = root.AsliChecker;

  var T = {
    title: { ar: "افحص رسالة", en: "Check a message" },
    lead: {
      ar: "الصق رسالة أو رابطًا أو رقمًا، فيقارنه أَصْلي بسجل القنوات الرسمية الكويتية وبتغذية الاحتيال المؤكدة ويشرح لك سبب الحكم.",
      en: "Paste a message, a link or a number. Asli compares it with Kuwait's registry of genuine official channels and the confirmed scam feed, then explains the verdict."
    },
    privacy: {
      ar: "يجري الفحص كله داخل متصفحك، فلا تغادر الرسالة جهازك ولا يُرسل منها شيء إلى أي خادم.",
      en: "The whole check runs inside your browser. The message never leaves your device and nothing is sent to any server."
    },
    labelText: { ar: "الرسالة", en: "The message" },
    placeholder: { ar: "الصق نص الرسالة هنا بأي لغة", en: "Paste the message here, in any language" },
    labelChannel: { ar: "كيف وصلتك", en: "How it reached you" },
    samples: { ar: "أو جرّب رسالة من النماذج", en: "Or try one of the samples" },
    run: { ar: "افحص", en: "Check" },
    clear: { ar: "امسح", en: "Clear" },
    empty: { ar: "الصق رسالة أولًا.", en: "Paste a message first." },
    loading: { ar: "يجري تحميل السجل", en: "Loading the registry" },
    ready: { ar: "يقارن الفحص بسجل يضم {bodies}.", en: "Checked against a registry of {bodies}." },
    offline: {
      ar: "تعذّر تحميل السجل، لذا يعمل الفحص بقواعد عامة فقط.",
      en: "The registry could not be loaded, so the check runs on general rules only."
    },
    verdict: { ar: "الحكم", en: "Verdict" },
    checks: { ar: "ما وجده الفحص", en: "What the check found" },
    todo: { ar: "ما الذي تفعله", en: "What to do" },
    vListed: { ar: "احتيال مؤكد", en: "Confirmed scam" },
    vListedWhy: {
      ar: "يرد أحد عناصر الرسالة في تغذية الاحتيال المؤكدة بعد مراجعة بشرية.",
      en: "Something in this message is in the confirmed scam feed, after human review."
    },
    vImpersonation: { ar: "انتحال صفة", en: "Impersonation" },
    vImpersonationWhy: {
      ar: "تدّعي الرسالة هوية رسمية لا يؤكدها السجل.",
      en: "It claims an official identity that the registry does not confirm."
    },
    vOfficial: { ar: "قناة رسمية", en: "Official channel" },
    vOfficialWhy: {
      ar: "تعود الروابط الواردة إلى نطاقات رسمية يعرفها السجل، ومع ذلك لا تشارك رمز التحقق مع أي أحد.",
      en: "The links point to official domains the registry knows. Even so, never share a one-time code with anyone."
    },
    vUnverified: { ar: "غير موثّق", en: "Unverified" },
    vUnverifiedWhy: {
      ar: "لا يعرف السجل هذا المرسل، ولا يعني المجهولُ أنه آمن.",
      en: "The registry does not know this sender, and unknown does not mean safe."
    },
    adviceBad: {
      ar: "لا تفتح الروابط ولا تدفع شيئًا ولا ترسل أي رمز، وإن كنت قد فعلت فاتصل ببنكك فورًا ثم أبلغ وزارة الداخلية، ويمكنك التحقق من معاملاتك الحكومية داخل تطبيق سهل.",
      en: "Do not open the links, do not pay anything and do not send any code. If you already did, call your bank now and report it to the Ministry of Interior. Government matters can be checked inside the Sahel app."
    },
    adviceOfficial: {
      ar: "تعامل مع الخدمة من داخل التطبيق أو الموقع الرسمي مباشرة، ولا تشارك رمز التحقق مع أي أحد مهما كان.",
      en: "Use the official app or website directly, and never share a one-time code with anyone at all."
    },
    adviceUnknown: {
      ar: "تحقّق من المرسل بقناة تعرفها أنت، مثل الرقم المطبوع خلف بطاقتك أو الموقع الرسمي الذي تكتبه بنفسك.",
      en: "Verify the sender through a channel you already trust, such as the number printed on your card or an official site you type yourself."
    },
    nextHelp: { ar: "دفعت أو أرسلت رمزًا؟ افتح خطوات الساعة الأولى", en: "Already paid or sent a code? Open the first hour steps" },
    nextReport: { ar: "أبلغ عن هذه الرسالة", en: "Report this message" },
    fLinks: { ar: "الروابط في الرسالة: {list}", en: "Links in the message: {list}" },
    fNoLinks: { ar: "لا توجد روابط في الرسالة.", en: "No links in the message." },
    fPhones: { ar: "الأرقام في الرسالة: {list}", en: "Numbers in the message: {list}" },
    fClaim: { ar: "تدّعي الرسالة أنها من {name}.", en: "It claims to come from {name}." },
    fNoClaim: { ar: "لا تذكر الرسالة جهة رسمية يعرفها السجل.", en: "It does not name an official body the registry knows." },
    fListed: { ar: "مدرج في تغذية الاحتيال المؤكدة: {list}", en: "In the confirmed scam feed: {list}" },
    fOfficial: { ar: "{host} نطاق رسمي لـ{name} في السجل.", en: "{host} is an official domain of {name} in the registry." },
    fLookalike: { ar: "{host} يستعير اسم {name} وهو ليس من نطاقاتها.", en: "{host} borrows the name of {name} and is not one of its domains." },
    fUnknown: { ar: "{host} لا يعرفه السجل.", en: "{host} is unknown to the registry." },
    fPolicy: { ar: "تخالف الرسالة سياسة منشورة: {text}", en: "It breaks a published policy: {text}" },
    fNumberMatch: { ar: "الرقم {number} من الأرقام التي تنشرها {name}.", en: "{number} is one of the numbers {name} publishes." },
    fNumberUnknown: {
      ar: "الرقم {number} ليس من الأرقام التي تنشرها {name} على موقعها، وهي تنشر {list}.",
      en: "{number} is not among the numbers {name} publishes on its own site, which are {list}."
    },
    fNoPolicy: { ar: "لا تخالف الرسالة أي سياسة منشورة في السجل.", en: "It breaks no published policy in the registry." },
    fPressure: { ar: "تستخدم الرسالة الضغط بمهلة أو تهديد أو أمر بالتصرف فورًا.", en: "It uses pressure: a deadline, a threat or an order to act now." },
    fNoPressure: { ar: "لا توجد أساليب ضغط واضحة.", en: "No clear pressure tactics." },
    dataTitle: { ar: "البيانات نفسها مفتوحة", en: "The data itself is open" },
    dataLead: {
      ar: "تعمل هذه الصفحة بملفات منشورة يستطيع أي بنك أو شركة اتصالات أو مطوّر أن يستهلكها بالصيغة التي يفضلها.",
      en: "This page runs on published files that any bank, telco or developer can consume in the format they prefer."
    },
    dataLink: { ar: "اعرض السجل والملفات", en: "See the registry and the files" }
  };

  var BODIES = {
    ar: { one: "جهة رسمية واحدة", two: "جهتين رسميتين", few: "جهات رسمية", many: "جهة رسمية" },
    en: { one: "one official body", other: "official bodies" }
  };

  var CHANNELS = [
    { id: "sms", ar: "رسالة نصية", en: "Text message" },
    { id: "whatsapp", ar: "واتساب", en: "WhatsApp" },
    { id: "imessage", ar: "آي مسج", en: "iMessage" },
    { id: "email", ar: "بريد إلكتروني", en: "Email" },
    { id: "call", ar: "مكالمة", en: "Call" },
    { id: "social", ar: "تواصل اجتماعي", en: "Social media" },
    { id: "app", ar: "داخل تطبيق", en: "Inside an app" }
  ];

  var data = null;
  var dataFailed = false;
  var loading = null;

  function t(key, map) {
    var pair = T[key];
    if (!pair) throw new Error("Missing check text: " + key);
    return S.fill(pair[S.lang], map);
  }

  function listSep() { return S.lang === "ar" ? "، " : ", "; }

  function load() {
    if (!loading) {
      loading = Promise.all([S.json("data/registry.json"), S.json("data/feed.json")]).then(function (both) {
        data = { bodies: both[0].bodies || [], feed: both[1] };
      }).catch(function () {
        data = { bodies: [], feed: { domains: [], numbers: [] } };
        dataFailed = true;
      });
    }
    return loading;
  }

  function line(status, text, source) {
    var h = S.h;
    return h("li", { className: "check st-" + status }, [
      h("span", { className: "check-icon" }, [S.icon(status)]),
      h("div", { className: "check-text" }, [
        h("p", { text: text }),
        source ? S.sourceLink(source) : null
      ])
    ]);
  }

  function findings(result) {
    var P = S.pick;
    var out = [];
    out.push(line("info", result.hosts.length ? t("fLinks", { list: result.hosts.join(listSep()) }) : t("fNoLinks")));
    if (result.phones.length) out.push(line("info", t("fPhones", { list: result.phones.join(listSep()) })));
    out.push(line("info", result.claimed ? t("fClaim", { name: P(result.claimed.name) }) : t("fNoClaim")));
    if (result.listed.length) out.push(line("flag", t("fListed", { list: result.listed.join(listSep()) })));
    result.lookalike.forEach(function (l) { out.push(line("flag", t("fLookalike", { host: l.host, name: P(l.body.name) }))); });
    result.official.forEach(function (o) { out.push(line("pass", t("fOfficial", { host: o.host, name: P(o.body.name) }))); });
    result.unknown.forEach(function (u) { out.push(line("info", t("fUnknown", { host: u }))); });
    result.matchedNumbers.forEach(function (n) {
      out.push(line("pass", t("fNumberMatch", { number: n, name: P(result.claimed.name) })));
    });
    result.unpublishedNumbers.forEach(function (n) {
      out.push(line("flag", t("fNumberUnknown", { number: n, name: P(result.claimed.name), list: result.published.join(listSep()) })));
    });
    if (result.broken.length) {
      result.broken.forEach(function (b) { out.push(line("flag", t("fPolicy", { text: P(b.policy.text) }), b.policy.source)); });
    } else {
      out.push(line("pass", t("fNoPolicy")));
    }
    out.push(result.pressure ? line("flag", t("fPressure")) : line("pass", t("fNoPressure")));
    return out;
  }

  var VERDICTS = {
    listed: ["vListed", "vListedWhy", "adviceBad"],
    impersonation: ["vImpersonation", "vImpersonationWhy", "adviceBad"],
    official: ["vOfficial", "vOfficialWhy", "adviceOfficial"],
    unverified: ["vUnverified", "vUnverifiedWhy", "adviceUnknown"]
  };

  /*
    mount(root, options)
      options.samples   sample messages to offer as one tap fills (home page)
      options.headingLevel  level of the result's own headings
  */
  function mount(rootEl, options) {
    var opts = options || {};
    var h = S.h;
    var state = { channel: "sms", result: null, empty: false, motion: false };
    var level = opts.headingLevel || 2;

    var textarea = h("textarea", { id: rootEl.id + "-text", rows: "5", spellcheck: "false", "aria-describedby": rootEl.id + "-state" });
    var labelText = h("label", { className: "field-label", for: textarea.id });
    var channelLabel = h("p", { className: "field-label", id: rootEl.id + "-channel-label" });
    var channels = h("div", { className: "chips", role: "radiogroup", "aria-labelledby": channelLabel.id });
    var samplesLabel = opts.samples ? h("p", { className: "field-label", id: rootEl.id + "-samples-label" }) : null;
    var samples = opts.samples ? h("div", { className: "chips samples", role: "group", "aria-labelledby": samplesLabel.id }) : null;
    var runButton = h("button", { type: "submit", className: "btn primary" });
    var clearButton = h("button", { type: "button", className: "btn quiet" });
    var dataState = h("p", { className: "data-state", id: rootEl.id + "-state", "aria-live": "polite" });
    var form = h("form", { className: "check-form", autocomplete: "off", novalidate: true }, [
      h("div", { className: "field" }, [labelText, textarea]),
      h("div", { className: "field" }, [channelLabel, channels]),
      samples ? h("div", { className: "field" }, [samplesLabel, samples]) : null,
      h("div", { className: "form-actions" }, [runButton, clearButton, dataState])
    ]);
    var resultBox = h("section", { className: "result", "aria-live": "polite", hidden: true });
    S.mount(rootEl, [form, resultBox]);

    function renderChannels() {
      S.mount(channels, CHANNELS.map(function (c) {
        return h("button", {
          type: "button",
          className: "chip",
          role: "radio",
          "aria-checked": c.id === state.channel ? "true" : "false",
          text: c[S.lang],
          on: { click: function () { state.channel = c.id; renderChannels(); } }
        });
      }));
    }

    function renderSamples() {
      if (!samples) return;
      S.mount(samples, opts.samples.map(function (s) {
        return h("button", {
          type: "button",
          className: "chip sample",
          text: S.pick(s.label),
          on: {
            click: function () {
              textarea.value = s.text;
              state.channel = s.channel;
              renderChannels();
              run(true);
            }
          }
        });
      }));
    }

    function renderDataState() {
      dataState.classList.toggle("is-warn", dataFailed);
      if (dataFailed) dataState.textContent = t("offline");
      else if (data) dataState.textContent = t("ready", { bodies: S.count(data.bodies.length, BODIES) });
      else dataState.textContent = t("loading");
    }

    function renderResult() {
      if (state.empty) {
        resultBox.hidden = false;
        S.mount(resultBox, [h("p", { className: "todo", text: t("empty") })]);
        return;
      }
      if (!state.result) { resultBox.hidden = true; return; }
      var r = state.result;
      var v = VERDICTS[r.verdict];
      var bad = r.verdict === "listed" || r.verdict === "impersonation";
      resultBox.hidden = false;
      S.mount(resultBox, [
        h("div", { className: "verdict-head" }, [
          h("h" + level, { className: "result-label", text: t("verdict") }),
          h("p", { className: "stamp v-" + r.verdict + (state.motion ? " stamp-in" : ""), text: t(v[0]) })
        ]),
        h("p", { className: "verdict-why", text: t(v[1]) }),
        h("h" + (level + 1), { className: "result-label", text: t("todo") }),
        h("p", { className: "todo", text: t(v[2]) }),
        bad ? h("p", { className: "next-steps" }, [
          h("a", { href: "help.html", text: t("nextHelp") }),
          h("a", { href: "report.html", text: t("nextReport") })
        ]) : null,
        h("h" + (level + 1), { className: "result-label", text: t("checks") }),
        h("ol", { className: "checks" }, findings(r))
      ]);
      state.motion = false;
    }

    function run(fromSample) {
      var text = textarea.value.trim();
      if (!text) {
        state.result = null;
        state.empty = true;
        renderResult();
        textarea.focus();
        return;
      }
      state.empty = false;
      load().then(function () {
        state.result = C.check({ text: text, channel: state.channel }, data);
        state.motion = !S.reduceMotion;
        renderDataState();
        renderResult();
        if (!fromSample || root.innerWidth < 900) resultBox.scrollIntoView({ behavior: S.reduceMotion ? "auto" : "smooth", block: "nearest" });
      });
    }

    form.addEventListener("submit", function (ev) { ev.preventDefault(); run(false); });
    clearButton.addEventListener("click", function () {
      textarea.value = "";
      state.result = null;
      state.empty = false;
      renderResult();
      textarea.focus();
    });

    S.onLang(function () {
      labelText.textContent = t("labelText");
      textarea.setAttribute("placeholder", t("placeholder"));
      channelLabel.textContent = t("labelChannel");
      if (samplesLabel) samplesLabel.textContent = t("samples");
      runButton.textContent = t("run");
      clearButton.textContent = t("clear");
      renderChannels();
      renderSamples();
      renderDataState();
      renderResult();
    });

    load().then(renderDataState);
    return { run: run, textarea: textarea };
  }

  /* The check page: its own words, then the component. */
  function initPage() {
    var rootEl = root.document.getElementById("check-root");
    if (!rootEl) return;
    S.onLang(function () {
      root.document.title = t("title") + " | " + (S.lang === "ar" ? "أَصْلي" : "Asli");
      root.document.querySelectorAll("[data-c]").forEach(function (n) { n.textContent = t(n.getAttribute("data-c")); });
    });
    mount(rootEl, { headingLevel: 2 });
  }

  root.AsliCheckUI = { mount: mount, t: t };
  initPage();
})(window);
