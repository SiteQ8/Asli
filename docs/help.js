/*
  The page someone reaches when it has already happened.

  Written for a person who is frightened and short of time, so the order matters
  more than the prose: stop the loss, then report, then keep the evidence. Every
  number here comes from the body that published it, and the page says plainly
  what Asli cannot do, because false hope costs people money.
*/
(function () {
  "use strict";

  var doc = document;
  var MOI_SOURCE = "https://www.moi.gov.kw/main/sections/cyber-crime?culture=en";
  var DIRAYA = "https://www.cbk.gov.kw/en/cbk-news/announcements-and-press-releases/press-releases/2021/02/202102031030-diraya-campaign-launches-video-addressing-e-crimes";

  var T = {
    skip: { ar: "انتقل إلى الخطوات", en: "Skip to the steps" },
    lang: { ar: "English", en: "العربية" },
    check: { ar: "افحص رسالة", en: "Check a message" },
    report: { ar: "أبلغ", en: "Report" },
    title: { ar: "وقع الاحتيال بالفعل", en: "It already happened" },
    lead: {
      ar: "ابدأ من الأعلى ولا تنتظر الصباح، فالساعة الأولى هي التي يمكن أن يُسترد فيها المال، ولا تلُم نفسك لأن هذه الرسائل مصممة لتنجح مع الناس العاديين المشغولين.",
      en: "Start at the top and do not wait for the morning. The first hour is when money can still be stopped. Do not blame yourself either: these messages are built to work on ordinary busy people."
    },
    callBank: { ar: "اتصل ببنكك الآن", en: "Call your bank now" },
    callBankWhy: {
      ar: "استخدم الرقم المطبوع خلف بطاقتك أو الرقم داخل تطبيق البنك، ولا تستخدم أي رقم ورد في الرسالة المشبوهة.",
      en: "Use the number printed on the back of your card or the one inside your bank app. Do not use any number from the suspicious message."
    },
    callCyber: { ar: "بلّغ إدارة مكافحة الجرائم الإلكترونية", en: "Report to the cybercrime department" },
    callCyberWhy: {
      ar: "تستقبل الإدارة البلاغات هاتفًا وعلى واتساب على الرقم ٩٧٢٨٣٩٣٩، وتذكر الوزارة أن البلاغ يُعامَل بسرية.",
      en: "The department takes reports by phone and on WhatsApp on 97283939, and the ministry states that reports are treated confidentially."
    },

    stepsTitle: { ar: "الخطوات", en: "The steps" },
    steps: [
      {
        title: { ar: "أوقف الخسارة", en: "Stop the loss" },
        body: {
          ar: "اتصل ببنكك فورًا واطلب إيقاف البطاقة أو تجميد الحساب ومحاولة استرجاع الحوالة، ولا تنتظر ساعات العمل لأن كل دقيقة تفرق.",
          en: "Call your bank at once, ask it to stop the card or freeze the account and to try to recall the transfer. Do not wait for office hours, because every minute counts."
        }
      },
      {
        title: { ar: "بلّغ الجهات المختصة", en: "Report it" },
        body: {
          ar: "أبلغ إدارة مكافحة الجرائم الإلكترونية بوزارة الداخلية على ٩٧٢٨٣٩٣٩ هاتفًا أو واتساب، وإن كانت الجريمة جارية أو هناك خطر على أحد فاتصل على ١١٢.",
          en: "Report to the Ministry of Interior's Electronic and Cyber Crime Combating Department on 97283939, by phone or WhatsApp. If a crime is in progress or anyone is in danger, call 112."
        },
        source: MOI_SOURCE
      },
      {
        title: { ar: "احفظ الأدلة قبل أن تختفي", en: "Keep the evidence before it disappears" },
        body: {
          ar: "صوّر الرسالة كاملة بحيث يظهر فيها المرسل والوقت والرابط، واحتفظ برقم العملية أو الإيصال، ولا تحذف المحادثة مهما شعرت بالحرج منها.",
          en: "Screenshot the whole message so the sender, the time and the link are visible, keep the transaction or reference number, and do not delete the conversation however embarrassed you feel."
        }
      },
      {
        title: { ar: "أغلق الباب الذي دخلوا منه", en: "Close the door they came through" },
        body: {
          ar: "غيّر كلمة المرور لكل حساب أدخلت بياناته، ويفضل أن يكون ذلك من جهاز آخر، وفعّل التحقق بخطوتين، ولا تشارك رمز التحقق مع أي أحد حتى لو قال إنه من البنك.",
          en: "Change the password of every account whose details you entered, from another device if you can, turn on two step verification, and never share a one time code with anyone, even someone who says they are from the bank."
        },
        source: DIRAYA
      },
      {
        title: { ar: "أخبر من حولك", en: "Tell the people around you" },
        body: {
          ar: "الرسالة نفسها تصل عادة إلى مئات الأشخاص في اليوم نفسه، لذا تحذيرك لعائلتك وزملائك يوقف الخسارة عند غيرك.",
          en: "The same message usually reaches hundreds of people on the same day, so warning your family and your colleagues stops the loss for someone else."
        }
      },
      {
        title: { ar: "شارك ما وصلك", en: "Share what you received" },
        body: {
          ar: "أرسل الرسالة إلى أَصْلي بعد أن تُحذف بياناتك الشخصية على جهازك، فتُراجَع ويستفيد منها الجميع.",
          en: "Send the message to Asli after your own details are removed on your device, so it can be reviewed and everyone benefits."
        },
        link: { href: "report.html", ar: "افتح صفحة البلاغ", en: "Open the report page" }
      }
    ],

    numbersTitle: { ar: "الأرقام التي تنشرها الجهات نفسها", en: "Numbers the bodies publish themselves" },
    numbersLead: {
      ar: "هذه أرقام مأخوذة من مواقع الجهات نفسها ومحفوظة في السجل مع مصدرها.",
      en: "These come from the bodies' own websites and are kept in the registry with their source."
    },
    numbersNote: {
      ar: "ليست هذه كل أرقام الجهة، بل ما تنشره على موقعها، وإن لم يظهر بنكك هنا فاستخدم الرقم المطبوع خلف بطاقتك.",
      en: "These are not all of a body's numbers, only what it publishes on its site. If your bank is not here, use the number printed on the back of your card."
    },
    numbersLoading: { ar: "يجري تحميل الأرقام", en: "Loading the numbers" },
    numbersOffline: {
      ar: "تعذّر تحميل الأرقام، واستخدم الرقم المطبوع خلف بطاقتك.",
      en: "The numbers could not be loaded. Use the number printed on the back of your card."
    },
    sourceLabel: { ar: "المصدر", en: "Source" },

    limitsTitle: { ar: "ما لا يستطيع أَصْلي فعله", en: "What Asli cannot do" },
    limits: {
      ar: "أَصْلي مشروع مجتمعي مفتوح المصدر وليس جهة حكومية ولا بنكًا، فلا يسترد مالًا ولا يفتح بلاغًا رسميًا نيابة عنك ولا يتصل بأحد بدلًا منك، وكل ما يفعله أنه يوضح ما إذا كانت القناة أصلية ويوجّهك إلى الجهة الصحيحة بسرعة.",
      en: "Asli is an open-source community project, not a government body and not a bank. It cannot recover money, file an official report for you or call anyone on your behalf. What it does is show whether a channel is genuine and point you to the right place quickly."
    },
    footer: {
      ar: "أَصْلي مشروع مفتوح المصدر من علي العنزي، وكل رقم في هذه الصفحة مأخوذ من الجهة التي نشرته.",
      en: "Asli is an open-source project by Ali AlEnezi. Every number on this page comes from the body that published it."
    },
    source: { ar: "الشيفرة المصدرية", en: "Source code" }
  };

  var lang = initialLang();

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

  function t(key) {
    var pair = T[key];
    return pair ? pair[lang] : key;
  }

  function P(pair) {
    return pair ? pair[lang] || pair.en : "";
  }

  function h(tag, props, children) {
    var n = doc.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      var v = props[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "text") n.textContent = v;
      else if (k === "className") n.className = v;
      else n.setAttribute(k, v === true ? "" : String(v));
    });
    (children || []).forEach(function (c) {
      if (!c) return;
      n.appendChild(typeof c === "string" ? doc.createTextNode(c) : c);
    });
    return n;
  }

  function mount(id, children) {
    var host = doc.getElementById(id);
    host.textContent = "";
    children.forEach(function (c) { if (c) host.appendChild(c); });
  }

  function sourceLink(url) {
    return h("p", { className: "src" }, [h("a", { href: url, rel: "noopener", text: t("sourceLabel") })]);
  }

  function renderUrgent() {
    mount("urgent", [
      h("div", { className: "urgent-card" }, [
        h("p", { className: "urgent-what", text: t("callBank") }),
        h("p", { className: "urgent-why", text: t("callBankWhy") })
      ]),
      h("div", { className: "urgent-card" }, [
        h("p", { className: "urgent-what" }, [
          t("callCyber"),
          " ",
          h("a", { className: "urgent-number", href: "tel:+96597283939", dir: "ltr", text: "97283939" })
        ]),
        h("p", { className: "urgent-why", text: t("callCyberWhy") }),
        sourceLink(MOI_SOURCE)
      ])
    ]);
  }

  function renderSteps() {
    mount("steps", T.steps.map(function (step) {
      return h("li", { className: "step" }, [
        h("h2", { text: P(step.title) }),
        h("p", { text: P(step.body) }),
        step.link ? h("p", {}, [h("a", { className: "btn", href: step.link.href, text: step.link[lang] })]) : null,
        step.source ? sourceLink(step.source) : null
      ]);
    }));
  }

  function renderNumbers() {
    var host = doc.getElementById("numbers");
    host.textContent = "";
    host.appendChild(h("li", { text: t("numbersLoading") }));
    fetch("data/registry.json", { cache: "no-cache" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var rows = [];
        (d.bodies || []).forEach(function (body) {
          (body.hotlines || []).forEach(function (line) {
            rows.push(
              h("li", {}, [
                h("a", { href: "tel:+965" + line.number, dir: "ltr", text: line.number }),
                h("span", { text: " " + P(body.name) + (line.label ? ", " + P(line.label) : "") }),
                sourceLink(line.source)
              ])
            );
          });
        });
        mount("numbers", rows.length ? rows : [h("li", { text: t("numbersOffline") })]);
      })
      .catch(function () {
        mount("numbers", [h("li", { text: t("numbersOffline") })]);
      });
  }

  function applyLang() {
    doc.documentElement.setAttribute("lang", lang);
    doc.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    doc.title = t("title") + " | " + (lang === "ar" ? "أَصْلي" : "Asli");
    doc.querySelectorAll("[data-t]").forEach(function (n) { n.textContent = t(n.getAttribute("data-t")); });
    doc.getElementById("lang").setAttribute("lang", lang === "ar" ? "en" : "ar");
    renderUrgent();
    renderSteps();
    renderNumbers();
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

  applyLang();
})();
