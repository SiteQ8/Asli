/*
  The report page.

  Three things happen here, all in the browser: the message is cleaned of the
  reporter's own details, it is checked against the registry so the person gets
  an answer straight away, and a report is prepared for the review queue. Nothing
  is sent until the person presses the last button themselves.
*/
(function () {
  "use strict";

  var doc = document;
  var REPO = "https://github.com/SiteQ8/Asli";

  var T = {
    skip: { ar: "انتقل إلى النموذج", en: "Skip to the form" },
    lang: { ar: "English", en: "العربية" },
    check: { ar: "افحص رسالة", en: "Check a message" },
    home: { ar: "عن المشروع", en: "About the project" },
    title: { ar: "أبلغ عن احتيال", en: "Report a scam" },
    lead: {
      ar: "حوّل رسالة وصلتك إلى بلاغ يستفيد منه غيرك، إذ يفحصها أَصْلي ويحذف بياناتك الشخصية ثم يجهّز البلاغ لقائمة المراجعة.",
      en: "Turn a message you received into a report that helps other people. Asli checks it, removes your own details, then prepares the report for the review queue."
    },
    privacy: {
      ar: "تُحذف بياناتك على جهازك قبل أن يغادر أي شيء، فالرقم المدني والآيبان وأرقام البطاقات والحسابات والبريد الإلكتروني تُزال تلقائيًا، وتبقى روابط الاحتيال وأرقامه لأنها الدليل نفسه.",
      en: "Your details are removed on your device before anything leaves it. Civil ID, IBAN, card and account numbers and email addresses go automatically, while the scam's own links and numbers stay, because they are the evidence."
    },
    labelText: { ar: "الرسالة كما وصلتك", en: "The message as you received it" },
    placeholder: { ar: "الصق نص الرسالة هنا بأي لغة", en: "Paste the message here, in any language" },
    labelChannel: { ar: "كيف وصلتك", en: "How it reached you" },
    labelFrom: { ar: "المرسل، إن كنت تعرفه", en: "The sender, if you know it" },
    fromPlaceholder: { ar: "رقم أو اسم مرسل أو بريد إلكتروني", en: "A number, a sender name or an email address" },
    labelSeen: { ar: "تاريخ وصولها", en: "When it arrived" },
    prepare: { ar: "نظّف الرسالة وافحصها", en: "Clean it and check it" },
    clear: { ar: "امسح", en: "Clear" },
    empty: { ar: "الصق الرسالة أولًا.", en: "Paste the message first." },
    loading: { ar: "يجري تحميل السجل", en: "Loading the registry" },
    ready: { ar: "السجل جاهز: {bodies} جهة رسمية", en: "Registry ready: {bodies} official bodies" },
    offline: { ar: "تعذّر تحميل السجل، ويمكنك إرسال البلاغ رغم ذلك.", en: "The registry could not be loaded. You can still send the report." },
    verdict: { ar: "ما رأي أَصْلي", en: "What Asli makes of it" },
    cleaned: { ar: "الرسالة بعد التنظيف", en: "The message after cleaning" },
    removedTitle: { ar: "ما حُذف", en: "What was removed" },
    removedNone: { ar: "لم يُعثر على بيانات شخصية تحتاج إلى حذف.", en: "No personal details were found that needed removing." },
    kinds: {
      civilId: { ar: "رقم مدني", en: "civil id" },
      iban: { ar: "آيبان", en: "iban" },
      card: { ar: "رقم بطاقة", en: "card number" },
      account: { ar: "رقم حساب", en: "account number" },
      email: { ar: "بريد إلكتروني", en: "email address" },
      phone: { ar: "رقم هاتف", en: "phone number" }
    },
    phonesTitle: { ar: "أرقام بقيت في النص", en: "Numbers kept in the text" },
    phonesLead: {
      ar: "تبقى الأرقام لأنها دليل، فإن كان أحدها رقمك أنت فاضغط عليه ليُحذف.",
      en: "Numbers are kept because they are evidence. If one of them is yours, tap it to remove it."
    },
    namesWarning: {
      ar: "راجع النص بنفسك قبل الإرسال، فالأسماء والعناوين لا يمكن رصدها آليًا.",
      en: "Read the text yourself before sending. Names and addresses cannot be detected automatically."
    },
    copy: { ar: "انسخ النص النظيف", en: "Copy the clean text" },
    copied: { ar: "نُسخ", en: "Copied" },
    send: { ar: "افتح البلاغ على GitHub", en: "Open the report on GitHub" },
    sendNote: {
      ar: "يفتح نموذجًا معبّأً على GitHub، ولن يُرسل شيء حتى تضغط أنت على زر الإرسال هناك، والبلاغ علني.",
      en: "This opens a prefilled form on GitHub. Nothing is sent until you press submit there, and the report is public."
    },
    noAccount: {
      ar: "إن لم يكن لديك حساب على GitHub فانسخ النص وأرسله إلى بنكك أو إلى وزارة الداخلية مباشرة.",
      en: "If you do not have a GitHub account, copy the text and send it to your bank or to the Ministry of Interior directly."
    },
    urgent: {
      ar: "إن كنت قد دفعت أو أرسلت رمز تحقق فاتصل ببنكك الآن قبل أي شيء آخر.",
      en: "If you already paid or sent a code, call your bank now, before anything else."
    },
    vListed: { ar: "احتيال مؤكد", en: "Confirmed scam" },
    vImpersonation: { ar: "انتحال صفة", en: "Impersonation" },
    vOfficial: { ar: "قناة رسمية", en: "Official channel" },
    vUnverified: { ar: "غير موثّق", en: "Unverified" },
    footer: {
      ar: "أَصْلي مشروع مفتوح المصدر من علي العنزي، ولا يُدرج شيء إلا بموافقة مراجعَين مع أدلته.",
      en: "Asli is an open-source project by Ali AlEnezi. Nothing is listed without two reviewers and stored evidence."
    },
    privacyDoc: { ar: "إشعار الخصوصية", en: "Privacy notice" },
    policy: { ar: "سياسة الإدراج", en: "Listing policy" },
    source: { ar: "الشيفرة المصدرية", en: "Source code" }
  };

  var CHANNELS = [
    { id: "sms", form: "Text message", ar: "رسالة نصية", en: "Text message" },
    { id: "whatsapp", form: "WhatsApp", ar: "واتساب", en: "WhatsApp" },
    { id: "imessage", form: "iMessage", ar: "آي مسج", en: "iMessage" },
    { id: "email", form: "Email", ar: "بريد إلكتروني", en: "Email" },
    { id: "call", form: "Call", ar: "مكالمة", en: "Call" },
    { id: "social", form: "Social media", ar: "تواصل اجتماعي", en: "Social media" },
    { id: "app", form: "Inside an app", ar: "داخل تطبيق", en: "Inside an app" }
  ];

  var lang = initialLang();
  var state = { channel: "sms", bodies: [], drop: [], last: null };

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

  function num(value) {
    return lang === "ar" ? String(value).replace(/[0-9]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩"[+d]; }) : String(value);
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

  function loadRegistry() {
    var node = doc.getElementById("dataState");
    node.textContent = t("loading");
    fetch("data/registry.json", { cache: "no-cache" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        state.bodies = d.bodies || [];
        node.classList.remove("is-warn");
        node.textContent = t("ready", { bodies: num(state.bodies.length) });
      })
      .catch(function () {
        node.classList.add("is-warn");
        node.textContent = t("offline");
      });
  }

  function renderChannels() {
    mount(doc.getElementById("channels"), CHANNELS.map(function (c) {
      return h("button", {
        type: "button",
        className: "chip",
        role: "radio",
        "aria-checked": c.id === state.channel ? "true" : "false",
        text: c[lang],
        on: { click: function () { state.channel = c.id; renderChannels(); } }
      });
    }));
  }

  function issueUrl(clean) {
    var channel = CHANNELS.filter(function (c) { return c.id === state.channel; })[0];
    var result = state.last && state.last.result;
    var indicators = [];
    if (result) {
      result.hosts.forEach(function (x) { indicators.push(x); });
      result.phones.forEach(function (x) { indicators.push(x); });
    }
    var from = doc.getElementById("from").value.trim();
    if (from && indicators.indexOf(from) < 0) indicators.push(from);
    var impersonates = result && result.claimed ? (result.claimed.name.en || "") : "";
    var params = new URLSearchParams({
      template: "report-scam.yml",
      title: "Scam report: " + (indicators[0] || "message"),
      indicator: indicators.join("\n"),
      channel: channel ? channel.form : "Other",
      message: clean,
      impersonates: impersonates,
      seen: doc.getElementById("seen").value || ""
    });
    return REPO + "/issues/new?" + params.toString();
  }

  function verdictLabel(verdict) {
    return {
      listed: t("vListed"),
      impersonation: t("vImpersonation"),
      official: t("vOfficial"),
      unverified: t("vUnverified")
    }[verdict];
  }

  function render() {
    var raw = doc.getElementById("text").value;
    var cleaned = window.AsliRedact.redact(raw, { lang: lang, drop: state.drop });
    var result = window.AsliChecker.check({ text: cleaned.text, channel: state.channel }, { bodies: state.bodies, feed: { domains: [], numbers: [] } });
    state.last = { cleaned: cleaned, result: result };

    var removedKinds = Object.keys(cleaned.removed);
    var removedLine = removedKinds.length
      ? removedKinds.map(function (k) { return num(cleaned.removed[k]) + " " + (T.kinds[k] ? T.kinds[k][lang] : k); }).join(lang === "ar" ? "، " : ", ")
      : t("removedNone");

    var phoneChips = cleaned.phones.map(function (number) {
      return h("button", {
        type: "button",
        className: "chip",
        dir: "ltr",
        "aria-pressed": "false",
        text: number,
        on: {
          click: function () {
            state.drop.push(number);
            render();
          }
        }
      });
    });

    var box = doc.getElementById("result");
    box.hidden = false;
    mount(box, [
      h("div", { className: "verdict-head" }, [
        h("p", { className: "small-label", text: t("verdict") }),
        h("p", { className: "stamp stamp-in v-" + result.verdict, text: verdictLabel(result.verdict) })
      ]),
      result.verdict === "impersonation" || result.verdict === "listed"
        ? h("p", { className: "todo", text: t("urgent") })
        : null,

      h("p", { className: "small-label", text: t("cleaned") }),
      h("pre", { className: "cleaned", dir: "auto", text: cleaned.text }),

      h("p", { className: "small-label", text: t("removedTitle") }),
      h("p", { text: removedLine }),

      cleaned.phones.length ? h("p", { className: "small-label", text: t("phonesTitle") }) : null,
      cleaned.phones.length ? h("p", { text: t("phonesLead") }) : null,
      cleaned.phones.length ? h("div", { className: "chips" }, phoneChips) : null,

      h("p", { className: "note", text: t("namesWarning") }),

      h("p", { className: "form-actions" }, [
        h("button", {
          type: "button",
          className: "btn",
          text: t("copy"),
          on: {
            click: function (ev) {
              var button = ev.currentTarget;
              navigator.clipboard.writeText(cleaned.text).then(function () {
                button.textContent = t("copied");
                setTimeout(function () { button.textContent = t("copy"); }, 1500);
              });
            }
          }
        }),
        h("a", { className: "btn primary", href: issueUrl(cleaned.text), rel: "noopener", target: "_blank", text: t("send") })
      ]),
      h("p", { className: "note", text: t("sendNote") }),
      h("p", { className: "note", text: t("noAccount") })
    ]);
  }

  function run(event) {
    event.preventDefault();
    var box = doc.getElementById("result");
    if (!doc.getElementById("text").value.trim()) {
      box.hidden = false;
      mount(box, [h("p", { className: "todo", text: t("empty") })]);
      return;
    }
    state.drop = [];
    render();
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
    if (state.last) render();
    if (state.bodies.length) doc.getElementById("dataState").textContent = t("ready", { bodies: num(state.bodies.length) });
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
    doc.getElementById("from").value = "";
    state.drop = [];
    state.last = null;
    doc.getElementById("result").hidden = true;
    doc.getElementById("text").focus();
  });

  applyLang();
  loadRegistry();
})();
