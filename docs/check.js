/*
  The check page. Loads the published registry and feed, then runs
  window.AsliChecker on whatever the visitor pastes. Nothing leaves the browser.
*/
(function () {
  "use strict";

  var doc = document;
  var T = {
    skip: { ar: "انتقل إلى الفحص", en: "Skip to the check" },
    lang: { ar: "English", en: "العربية" },
    home: { ar: "عن المشروع", en: "About the project" },
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
    placeholder: {
      ar: "الصق نص الرسالة هنا بأي لغة",
      en: "Paste the message here, in any language"
    },
    labelChannel: { ar: "كيف وصلتك", en: "How it reached you" },
    run: { ar: "افحص", en: "Check" },
    clear: { ar: "امسح", en: "Clear" },
    empty: { ar: "الصق رسالة أولًا.", en: "Paste a message first." },
    loading: { ar: "يجري تحميل البيانات", en: "Loading data" },
    ready: {
      ar: "البيانات جاهزة: {bodies} جهة رسمية و{feed} مؤشر احتيال مؤكد",
      en: "Data ready: {bodies} official bodies and {feed} confirmed scam indicators"
    },
    offline: {
      ar: "تعذّر تحميل البيانات، لذا يعمل الفحص بقواعد عامة فقط دون السجل.",
      en: "The data could not be loaded, so the check runs on general rules only, without the registry."
    },
    verdict: { ar: "الحكم", en: "Verdict" },
    checks: { ar: "الفحوص", en: "Checks" },
    todo: { ar: "ما الذي تفعله", en: "What to do" },
    sourceLabel: { ar: "المصدر", en: "Source" },
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
    fNoPolicy: { ar: "لا تخالف الرسالة أي سياسة منشورة في السجل.", en: "It breaks no published policy in the registry." },
    fPressure: { ar: "تستخدم الرسالة الضغط بمهلة أو تهديد أو أمر بالتصرف فورًا.", en: "It uses pressure: a deadline, a threat or an order to act now." },
    fNoPressure: { ar: "لا توجد أساليب ضغط واضحة.", en: "No clear pressure tactics." },
    dataTitle: { ar: "البيانات نفسها مفتوحة", en: "The data itself is open" },
    dataLead: {
      ar: "يستطيع أي بنك أو شركة اتصالات أو مطوّر أن يستهلك الملفات نفسها التي تعمل بها هذه الصفحة.",
      en: "Any bank, telco or developer can consume the same files this page runs on."
    },
    footer: {
      ar: "أَصْلي مشروع مفتوح المصدر من علي العنزي، والبيانات منشورة بترخيص CC BY 4.0.",
      en: "Asli is an open-source project by Ali AlEnezi. The data is published under CC BY 4.0."
    },
    source: { ar: "الشيفرة المصدرية", en: "Source code" },
    policy: { ar: "سياسة الإدراج", en: "Listing policy" },
    privacyDoc: { ar: "إشعار الخصوصية", en: "Privacy notice" }
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

  var DATA_FILES = [
    { file: "registry.json", ar: "سجل القنوات الرسمية", en: "Registry of official channels" },
    { file: "feed.json", ar: "تغذية الاحتيال، JSON", en: "Scam feed, JSON" },
    { file: "feed.csv", ar: "تغذية الاحتيال، CSV", en: "Scam feed, CSV" },
    { file: "hosts.txt", ar: "ملف hosts", en: "hosts file" },
    { file: "adguard.txt", ar: "قائمة AdGuard", en: "AdGuard list" },
    { file: "rpz.zone", ar: "منطقة DNS RPZ", en: "DNS RPZ zone" },
    { file: "feed.stix2.json", ar: "حزمة STIX 2.1", en: "STIX 2.1 bundle" },
    { file: "feed.misp.json", ar: "حدث MISP", en: "MISP event" },
    { file: "meta.json", ar: "الأعداد ووقت البناء", en: "Counts and build time" }
  ];

  var lang = initialLang();
  var state = { channel: "sms", data: null, meta: null };

  function initialLang() {
    try {
      var q = new URLSearchParams(window.location.search).get("lang");
      if (q === "ar" || q === "en") return q;
    } catch (e) { /* ignore */ }
    try {
      var saved = window.localStorage.getItem("asli.lang");
      if (saved === "ar" || saved === "en") return saved;
    } catch (e) { /* ignore */ }
    return "ar";
  }

  function t(key, map) {
    var pair = T[key];
    var text = pair ? pair[lang] : key;
    return map ? text.replace(/\{(\w+)\}/g, function (w, k) { return k in map ? map[k] : w; }) : text;
  }

  function P(pair) {
    if (!pair) return "";
    return pair[lang] || pair.en || pair.ar || "";
  }

  function num(value) {
    var s = String(value);
    return lang === "ar" ? s.replace(/[0-9]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[+d]; }) : s;
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
      if (!c) return;
      n.appendChild(typeof c === "string" ? doc.createTextNode(c) : c);
    });
    return n;
  }

  function mount(node, children) {
    node.textContent = "";
    children.forEach(function (c) { if (c) node.appendChild(c); });
  }

  function listSep() { return lang === "ar" ? "، " : ", "; }

  /* Data */

  function loadData() {
    var state$ = doc.getElementById("dataState");
    state$.textContent = t("loading");
    Promise.all([
      fetch("data/registry.json", { cache: "no-cache" }).then(function (r) { return r.json(); }),
      fetch("data/feed.json", { cache: "no-cache" }).then(function (r) { return r.json(); })
    ]).then(function (both) {
      state.data = { bodies: both[0].bodies || [], feed: both[1] };
      state.meta = { bodies: (both[0].bodies || []).length, feed: both[1].count || 0 };
      showDataState();
    }).catch(function () {
      state.data = { bodies: [], feed: { domains: [], numbers: [] } };
      state.meta = null;
      showDataState();
    });
  }

  function showDataState() {
    var node = doc.getElementById("dataState");
    if (!state.meta) { node.textContent = t("offline"); node.classList.add("is-warn"); return; }
    node.classList.remove("is-warn");
    node.textContent = t("ready", { bodies: num(state.meta.bodies), feed: num(state.meta.feed) });
  }

  /* Rendering */

  function renderChannels() {
    mount(doc.getElementById("channels"), CHANNELS.map(function (c) {
      return h("button", {
        type: "button",
        className: "chip",
        role: "radio",
        "aria-checked": c.id === state.channel ? "true" : "false",
        text: c[lang],
        on: {
          click: function () {
            state.channel = c.id;
            renderChannels();
          }
        }
      });
    }));
  }

  function renderDataLinks() {
    mount(doc.getElementById("dataLinks"), DATA_FILES.map(function (d) {
      return h("li", {}, [
        h("a", { href: "data/" + d.file, dir: "ltr", text: d.file }),
        h("span", { text: " " + d[lang] })
      ]);
    }));
  }

  function line(status, text, source) {
    return h("li", { className: "check st-" + status }, [
      h("span", { className: "check-icon", "aria-hidden": "true", text: status === "flag" ? "✕" : status === "pass" ? "✓" : "•" }),
      h("div", { className: "check-text" }, [
        h("p", { text: text }),
        source ? h("p", { className: "src" }, [h("a", { href: source, rel: "noopener", text: t("sourceLabel") })]) : null
      ])
    ]);
  }

  function render(result) {
    var box = doc.getElementById("result");
    box.hidden = false;

    var verdictMap = {
      listed: ["vListed", "vListedWhy", "adviceBad"],
      impersonation: ["vImpersonation", "vImpersonationWhy", "adviceBad"],
      official: ["vOfficial", "vOfficialWhy", "adviceOfficial"],
      unverified: ["vUnverified", "vUnverifiedWhy", "adviceUnknown"]
    }[result.verdict];

    var findings = [];
    findings.push(line("info", result.hosts.length ? t("fLinks", { list: result.hosts.join(listSep()) }) : t("fNoLinks")));
    if (result.phones.length) findings.push(line("info", t("fPhones", { list: result.phones.join(listSep()) })));
    findings.push(line("info", result.claimed ? t("fClaim", { name: P(result.claimed.name) }) : t("fNoClaim")));

    if (result.listed.length) findings.push(line("flag", t("fListed", { list: result.listed.join(listSep()) })));
    result.lookalike.forEach(function (l) { findings.push(line("flag", t("fLookalike", { host: l.host, name: P(l.body.name) }))); });
    result.official.forEach(function (o) { findings.push(line("pass", t("fOfficial", { host: o.host, name: P(o.body.name) }))); });
    result.unknown.forEach(function (u) { findings.push(line("info", t("fUnknown", { host: u }))); });

    if (result.broken.length) {
      result.broken.forEach(function (b) { findings.push(line("flag", t("fPolicy", { text: P(b.policy.text) }), b.policy.source)); });
    } else {
      findings.push(line("pass", t("fNoPolicy")));
    }
    findings.push(result.pressure ? line("flag", t("fPressure")) : line("pass", t("fNoPressure")));

    mount(box, [
      h("div", { className: "verdict-head" }, [
        h("p", { className: "small-label", text: t("verdict") }),
        h("p", { className: "stamp stamp-in v-" + result.verdict, text: t(verdictMap[0]) })
      ]),
      h("p", { className: "verdict-why", text: t(verdictMap[1]) }),
      h("p", { className: "small-label", text: t("checks") }),
      h("ol", { className: "checks" }, findings),
      h("p", { className: "small-label", text: t("todo") }),
      h("p", { className: "todo", text: t(verdictMap[2]) })
    ]);
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function run(event) {
    event.preventDefault();
    var text = doc.getElementById("text").value.trim();
    var box = doc.getElementById("result");
    if (!text) {
      box.hidden = false;
      mount(box, [h("p", { className: "todo", text: t("empty") })]);
      return;
    }
    render(window.AsliChecker.check({ text: text, channel: state.channel }, state.data || { bodies: [], feed: {} }));
  }

  function applyLang() {
    doc.documentElement.setAttribute("lang", lang);
    doc.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    doc.title = t("title") + " | " + (lang === "ar" ? "أَصْلي" : "Asli");
    doc.querySelectorAll("[data-t]").forEach(function (n) { n.textContent = t(n.getAttribute("data-t")); });
    doc.querySelectorAll("[data-t-placeholder]").forEach(function (n) { n.setAttribute("placeholder", t(n.getAttribute("data-t-placeholder"))); });
    doc.querySelectorAll("[data-t-aria]").forEach(function (n) { n.setAttribute("aria-label", t(n.getAttribute("data-t-aria"))); });
    doc.getElementById("lang").setAttribute("lang", lang === "ar" ? "en" : "ar");
    renderChannels();
    renderDataLinks();
    showDataState();
    doc.getElementById("result").hidden = true;
  }

  doc.getElementById("lang").addEventListener("click", function () {
    lang = lang === "ar" ? "en" : "ar";
    try { window.localStorage.setItem("asli.lang", lang); } catch (e) { /* ignore */ }
    try {
      var url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      window.history.replaceState(null, "", url.pathname + url.search);
    } catch (e) { /* ignore */ }
    applyLang();
  });

  doc.getElementById("form").addEventListener("submit", run);
  doc.getElementById("clear").addEventListener("click", function () {
    doc.getElementById("text").value = "";
    doc.getElementById("result").hidden = true;
    doc.getElementById("text").focus();
  });

  applyLang();
  loadData();
})();
