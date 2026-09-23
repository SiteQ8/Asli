/*
  Asli content.

  Every word on the site and in PROJECT.md and PROJECT.ar.md comes from this file.
  Each text is a pair with an Arabic (ar) and an English (en) value.
  tests/content.test.mjs enforces completeness, number parity between the two
  languages, Arabic punctuation and language purity, so a broken pair fails the build.
*/
(function (root) {
  "use strict";

  var ASLI = {
    version: "0.2.0",
    published: "2026-09-23",
    site: "https://asli.3li.info/",
    repo: "https://github.com/SiteQ8/Asli",
    chosen: "asli",

    t: {
      "meta.title": {
        ar: "أَصْلي | درع الكويت المفتوح ضد الاحتيال",
        en: "Asli | Kuwait's open scam shield"
      },
      "meta.description": {
        ar: "أَصْلي سجل مفتوح المصدر للقنوات الرسمية الأصلية في الكويت وتغذية مُراجَعة بروابط الاحتيال وأرقامه، يستطيع الجميع أن يتحقق منها ويعيد استخدامها مجانًا.",
        en: "Asli: an open-source registry of Kuwait's genuine official channels and a reviewed feed of scam links and numbers that anyone can check and reuse for free."
      },

      "nav.skip": { ar: "انتقل إلى المحتوى", en: "Skip to the content" },
      "nav.lang": { ar: "English", en: "العربية" },
      "nav.langLabel": { ar: "اعرض الصفحة بالإنجليزية", en: "Show this page in Arabic" },
      "nav.check": { ar: "افحص رسالة", en: "Check a message" },
      "nav.repo": { ar: "المصدر على GitHub", en: "Source on GitHub" },
      "nav.index": { ar: "في هذه الصفحة", en: "On this page" },

      "hero.kicker": {
        ar: "الإصدار ٠٫٢، سبتمبر ٢٠٢٦، السجل وصفحة الفحص يعملان الآن وتبقى تغذية الاحتيال فارغة حتى أول إدراج مُراجَع",
        en: "Version 0.2, September 2026. The registry and the check page work now, and the scam feed stays empty until the first reviewed listing"
      },
      "hero.title": { ar: "هل هذه الرسالة أصلية؟", en: "Is this message genuine?" },
      "hero.lead": {
        ar: "يحمي أَصْلي الناس في الكويت من الاحتيال بدرعٍ مفتوح المصدر يراجعه المجتمع، إذ ينشر سجلًا موثّقًا لكل قناة رسمية أصلية وتغذيةً حيّة بروابط الاحتيال وأرقامه المؤكَّدة، فيستطيع أي شخص أن يتحقق من رسالة في ثوانٍ، ويستطيع أي بنك أو شركة اتصالات أو تطبيق أن يربطه بخدماته.",
        en: "Asli is an open, community-reviewed shield against scams in Kuwait. It publishes a verified registry of every genuine official channel and a live feed of confirmed scam links and numbers, so anyone can check a message in seconds and any bank, telco or app can plug it in."
      },
      "hero.name": {
        ar: "تعني كلمة أَصْلي بالعربية الحقيقيَّ غير المزيَّف، وتحمل الكلمة نفسها المعنى ذاته في الهندية والأردية.",
        en: "Asli means genuine in Arabic, and the same word means the same thing in Hindi and Urdu."
      },
      "hero.ctaCheck": { ar: "افحص رسالة الآن", en: "Check a message now" },
      "hero.ctaStart": { ar: "ابدأ من المشكلة", en: "Start with the problem" },
      "hero.ctaDemo": { ar: "شاهد فحص رسالة", en: "See a message checked" },
      "hero.langs": {
        ar: "السؤال نفسه باللغات السبع الأولى التي سيتحدث بها أَصْلي",
        en: "The same question in the first seven languages Asli will speak"
      },
      "hero.seal": {
        ar: "ختم زخرفي على طريقة طباعة الأوراق النقدية يتوسطه اسم أَصْلي",
        en: "A banknote style guilloche seal with the Asli wordmark"
      },

      "sec.problem": { ar: "المشكلة", en: "The problem" },
      "sec.idea": { ar: "الفكرة", en: "The idea" },
      "sec.demo": { ar: "العرض التوضيحي", en: "See it work" },
      "sec.how": { ar: "كيف يعمل", en: "How it works" },
      "sec.why": { ar: "لماذا هذا المشروع", en: "Why this project" },
      "sec.roadmap": { ar: "خارطة الطريق", en: "Roadmap" },
      "sec.reuse": { ar: "البناء على ما سبق", en: "Built on SiteQ8" },
      "sec.trust": { ar: "الثقة والحوكمة", en: "Trust and governance" },
      "sec.measures": { ar: "مقاييس النجاح", en: "Measures of success" },
      "sec.risks": { ar: "المخاطر", en: "Risks" },
      "sec.serves": { ar: "لمن نبنيه", en: "Who it serves" },
      "sec.next": { ar: "الأسبوعان الأولان", en: "The first two weeks" },

      "common.source": { ar: "المصدر", en: "Source" },
      "common.and": { ar: " و", en: " and " },
      "common.listSep": { ar: "، ", en: ", " },

      "problem.title": {
        ar: "يصل الاحتيال إلى كل من في الكويت وبكل لغة",
        en: "Scams reach everyone in Kuwait, in every language"
      },
      "problem.lead": {
        ar: "تستند الأدلة أدناه إلى بيانات رسمية وتقارير منشورة، ويرتبط كل سطر منها بمصدره.",
        en: "The evidence below comes from official statements and published reports. Each line links to its source."
      },
      "problem.analysisLabel": { ar: "تحليلنا", en: "Our analysis" },
      "problem.analysis": {
        ar: "تنقص الكويتَ طبقةٌ عامة تستطيع الآلات قراءتها، تبيّن القنوات الأصلية وروابط الاحتيال المؤكدة وما لا تطلبه أي جهة رسمية منك أبدًا، لأن التحذيرات تنتقل اليوم صورًا على وسائل التواصل بلغة أو لغتين، فلا يمكن ربطها بتطبيق بنك أو مرشّح شركة اتصالات أو متصفح.",
        en: "What is missing is a public layer that machines can read: which channels are genuine, which links are confirmed scams, and what each official body will never ask you to do. Today warnings travel as images on social media in one or two languages, so they cannot be plugged into a bank app, a telco filter or a browser."
      },

      "idea.title": {
        ar: "تحقّق من الأصلي ولا تكتفِ بملاحقة المزيّف",
        en: "Verify the genuine, not only chase the fake"
      },
      "idea.lead": {
        ar: "لا تنفد نطاقات الاحتيال، بينما تبقى القنوات الرسمية في الكويت محدودة ومعروفة، لذا ينشر أَصْلي القائمتين معًا ويبدأ كل فحص من قائمة الأصلي.",
        en: "Scam domains never run out, but Kuwait's official channels are few and knowable. Asli publishes both lists and starts every check from the genuine one."
      },
      "idea.blockTitle": { ar: "قائمة الحظر وحدها", en: "A blocklist alone" },
      "idea.regTitle": { ar: "السجل أولًا", en: "Registry first" },
      "idea.openTitle": { ar: "لماذا يجب أن يكون مفتوح المصدر", en: "Why it must be open source" },
      "idea.localTitle": { ar: "ما تغفله أدوات الفحص العالمية", en: "What global checkers miss" },
      "idea.local": {
        ar: "لا تعرف أدوات الفحص العالمية أن وزارة الداخلية لا ترسل المخالفات المرورية برسائل نصية، ولا أن البنوك الكويتية لا تطلب رمز التحقق أبدًا، ولا كيف تبدو رسالة المخالفة المزيفة بالعربية أو المالايالامية أو التاغالوغية، لذا بُني أَصْلي حول هذه المعرفة المحلية.",
        en: "Global scam checkers do not know that the Ministry of Interior never sends traffic fines by text message, that Kuwaiti banks never ask for your one-time code, or how a fake fine reads in Arabic, Malayalam or Tagalog. Asli is built around that local knowledge."
      },

      "demo.title": { ar: "شاهد فحص رسالة", en: "See a message checked" },
      "demo.lead": {
        ar: "اختر نموذجًا ليقرأه أَصْلي كما سيقرؤه المدقق في المرحلة ١، فيستخرج الروابط والادعاءات ثم يقارنها بالسجل ويشرح الحكم.",
        en: "Pick a sample. Asli reads it the way the Phase 1 checker will: it pulls out links and claims, compares them with the registry and explains the verdict."
      },
      "demo.note": {
        ar: "تأتي النماذج للتوضيح فقط، وتستخدم روابطها النطاق المحجوز example فلا تؤدي إلى أي مكان، أما سجل العرض فيضم ثلاثة قيود ترتبط كل سياسة فيها بمصدرها.",
        en: "The samples are illustrative. Their links use the reserved example domain and lead nowhere. The demo registry holds three entries, and each policy links to its source."
      },
      "demo.samples": { ar: "النماذج", en: "Samples" },
      "demo.from": { ar: "المرسل", en: "From" },
      "demo.channel": { ar: "القناة", en: "Channel" },
      "demo.checks": { ar: "الفحوص", en: "Checks" },
      "demo.verdict": { ar: "الحكم", en: "Verdict" },
      "demo.todo": { ar: "ما الذي تفعله", en: "What to do" },

      "step.read": { ar: "القراءة", en: "Read" },
      "step.registry": { ar: "السجل", en: "Registry" },
      "step.lookalike": { ar: "التشابه", en: "Lookalike" },
      "step.policy": { ar: "سياسة القناة", en: "Channel policy" },
      "step.pressure": { ar: "الضغط", en: "Pressure" },

      "status.flag": { ar: "تحذير", en: "Warning" },
      "status.pass": { ar: "سليم", en: "Clear" },
      "status.info": { ar: "معلومة", en: "Note" },
      "status.none": { ar: "لا ينطبق", en: "Not applicable" },

      "f.links": { ar: "استخرجنا الروابط التالية: {links}.", en: "Links found: {links}." },
      "f.noLinks": { ar: "لا توجد روابط في الرسالة.", en: "No links in the message." },
      "f.claim": { ar: "تدّعي الرسالة أنها صادرة عن {entity}.", en: "It claims to come from {entity}." },
      "f.noClaim": { ar: "لا تذكر الرسالة أي جهة رسمية.", en: "It does not name an official body." },
      "f.regMiss": {
        ar: "لا يرد النطاق {host} في قيد {entity} بالسجل، إذ يذكر القيد {official}.",
        en: "{host} is not in the registry entry for {entity}, which lists {official}."
      },
      "f.regHit": { ar: "يطابق النطاق {host} قيد {entity} في السجل.", en: "{host} matches the registry entry for {entity}." },
      "f.regChannel": {
        ar: "وصلت الرسالة عبر قناة رسمية لدى {entity} بحسب السجل، هي {channel}.",
        en: "It arrived through {channel}, an official channel of {entity} according to the registry."
      },
      "f.regNone": { ar: "لا يوجد ما يمكن مطابقته مع السجل.", en: "There is nothing to match against the registry." },
      "f.look": { ar: "يستعير النطاق {host} اسم {entity} ليبدو رسميًا.", en: "{host} borrows the name of {entity} to look official." },
      "f.noLook": { ar: "لا توجد أسماء تقلّد اسمًا رسميًا.", en: "No names imitate an official one." },
      "f.policyBreak": { ar: "تخالف الرسالة سياسة قنوات منشورة: {policy}", en: "It breaks a published channel policy: {policy}" },
      "f.policyOk": { ar: "لا تخالف الرسالة أي سياسة قنوات منشورة.", en: "It breaks no published channel policy." },
      "f.policyNone": {
        ar: "لا تنطبق أي سياسة قنوات لأن الرسالة لا تذكر جهة رسمية.",
        en: "No channel policy applies, because the message names no official body."
      },
      "f.pressure": {
        ar: "تستخدم الرسالة الضغط بمهلة أو تهديد أو أمر بالتصرف فورًا.",
        en: "It uses pressure: a deadline, a threat or an order to act now."
      },
      "f.noPressure": { ar: "لا توجد أساليب ضغط.", en: "No pressure tactics." },

      "v.impersonation": { ar: "انتحال صفة", en: "Impersonation" },
      "v.impersonationWhy": {
        ar: "تدّعي الرسالة هوية رسمية لا تستطيع إثباتها.",
        en: "It claims an official identity it cannot back up."
      },
      "v.official": { ar: "قناة رسمية", en: "Official channel" },
      "v.officialWhy": {
        ar: "تثبت أصالة القناة في السجل، ومع ذلك لا تشارك رمز التحقق مع أي أحد.",
        en: "The registry confirms the channel. Still, never share a one-time code with anyone."
      },
      "v.unverified": { ar: "غير موثّق", en: "Unverified" },
      "v.unverifiedWhy": {
        ar: "لا يرد المرسل في السجل، ولا يعني المجهولُ أنه آمن.",
        en: "The sender is not in the registry, and unknown does not mean safe."
      },

      "how.title": { ar: "كيف يعمل", en: "How it works" },
      "how.lead": {
        ar: "تدخل الإشارات فتراجعها الآلات والبشر، ثم تخرج بيانات مفتوحة موقّعة إلى كل قناة تصل إلى السكان.",
        en: "Signals come in, machines and people review them, and signed open data goes out to every channel that reaches residents."
      },
      "how.reuses": { ar: "يعيد استخدام", en: "Reuses" },
      "how.newPart": { ar: "جزء جديد يُبنى ضمن أَصْلي", en: "A new part, built inside Asli" },

      "why.title": {
        ar: "لماذا اخترنا هذا المشروع",
        en: "Why this project was chosen"
      },
      "why.lead": {
        ar: "قيّمنا ستة مشاريع مرشحة وفق خمسة معايير، ويمكنك تحريك الأوزان لتختبر الاختيار بنفسك.",
        en: "Six candidates were scored against five criteria. Move the weights to test the choice yourself."
      },
      "why.note": {
        ar: "تعكس الدرجات تقديرًا تحريريًا من المشرف على المشروع، ولا تمثل بيانات مقيسة.",
        en: "Scores are the maintainer's editorial judgment, not measured data."
      },
      "why.weights": { ar: "الأوزان", en: "Weights" },
      "why.candidate": { ar: "المشروع المرشح", en: "Candidate" },
      "why.total": { ar: "الدرجة", en: "Score" },
      "why.weightOf": { ar: "وزن معيار {name}", en: "Weight of {name}" },
      "why.reset": { ar: "أعد الأوزان الأصلية", en: "Reset weights" },
      "why.chosen": { ar: "المختار", en: "Chosen" },
      "why.result": {
        ar: "بهذه الأوزان يأتي {winner} أولًا بدرجة {score} من ٥.",
        en: "With these weights, {winner} ranks first with {score} out of 5."
      },
      "why.tie": {
        ar: "بهذه الأوزان يتقاسم المركز الأول {winner} بدرجة {score} من ٥.",
        en: "With these weights, {winner} share first place with {score} out of 5."
      },
      "why.zero": { ar: "اجعل وزنًا واحدًا على الأقل أكبر من الصفر.", en: "Set at least one weight above zero." },

      "roadmap.title": { ar: "خارطة الطريق", en: "Roadmap" },
      "roadmap.lead": {
        ar: "يمتد المشروع على خمس مراحل خلال اثني عشر شهرًا، ولا تنتهي أي مرحلة إلا بعد اجتياز اختبار خروجها.",
        en: "Five phases over twelve months. A phase ends only when its exit test passes."
      },
      "roadmap.phase": { ar: "المرحلة {n}", en: "Phase {n}" },
      "roadmap.exit": { ar: "اختبار الخروج", en: "Exit test" },

      "reuse.title": { ar: "مبني على تسعة مشاريع من SiteQ8", en: "Built on nine SiteQ8 projects" },
      "reuse.lead": {
        ar: "يبدأ أَصْلي مشروعًا جديدًا، لكن معظم محركه موجود بالفعل في مستودعات عامة.",
        en: "Asli is new, but most of its engine already exists in public repositories."
      },

      "trust.title": { ar: "الثقة والحوكمة", en: "Trust and governance" },
      "trust.lead": {
        ar: "لا تنفع قائمة الاحتيال إلا بقدر عدالتها، لذا تسبق هذه القواعد أول إدراج.",
        en: "A scam list is only as good as it is fair, so these rules come before the first listing."
      },

      "measures.title": { ar: "مقاييس النجاح", en: "Measures of success" },
      "measures.lead": {
        ar: "نحدّد فيما يلي أهداف السنة الأولى، ونعلن التقدم نحوها كل شهر في لوحة عامة.",
        en: "First-year targets, with progress reported every month on a public dashboard."
      },
      "measures.metric": { ar: "المقياس", en: "Measure" },
      "measures.target": { ar: "الهدف", en: "Target" },

      "risks.title": { ar: "المخاطر وكيف نتعامل معها", en: "Risks and how we handle them" },
      "risks.risk": { ar: "الخطر", en: "Risk" },
      "risks.response": { ar: "المعالجة", en: "Response" },

      "serves.title": { ar: "لمن نبنيه", en: "Who it serves" },
      "serves.note": {
        ar: "نقترح هذه الفئات والشركاء دون أن تكون أي شراكة قائمة حتى الآن، ويبدأ التواصل في المرحلة ١.",
        en: "These audiences and partners are proposals. No partnership exists yet, and outreach starts in Phase 1."
      },

      "next.title": { ar: "الأسبوعان الأولان", en: "The first two weeks" },
      "next.lead": { ar: "ما يحدث بعد ذلك بالترتيب.", en: "What happens next, in order." },

      "footer.by": {
        ar: "مشروع مفتوح المصدر من علي العنزي، والإصدار ٠٫٢ الصادر في سبتمبر ٢٠٢٦ منشور بترخيص MIT، أما السجل والتغذية فمنشوران بترخيص CC BY 4.0.",
        en: "An open-source project by Ali AlEnezi. Version 0.2, September 2026, released under the MIT licence. The registry and the feed are released under CC BY 4.0."
      },
      "footer.source": { ar: "الشيفرة المصدرية", en: "Source code" },
      "footer.text": { ar: "النص الكامل", en: "The full text" },
      "footer.data": { ar: "البيانات المفتوحة", en: "The open data" },
      "footer.policy": { ar: "سياسة الإدراج", en: "Listing policy" },

      "md.live": { ar: "الموقع التفاعلي", en: "Interactive site" },
      "md.otherLang": { ar: "النسخة الإنجليزية", en: "Arabic version" },
      "md.generated": {
        ar: "يُولَّد هذا الملف آليًا من ملف المحتوى في الموقع، فلا تعدّله يدويًا.",
        en: "This file is generated from the site's content file. Do not edit it by hand."
      },
      "md.defaultWeights": { ar: "الأوزان الافتراضية", en: "Default weights" },
      "md.message": { ar: "الرسالة", en: "Message" }
    },

    /* The same question in the first seven languages. Language-neutral display data. */
    questions: [
      { lang: "ar", dir: "rtl", text: "هل هي أصلية؟", name: { ar: "العربية", en: "Arabic" } },
      { lang: "en", dir: "ltr", text: "Is it genuine?", name: { ar: "الإنجليزية", en: "English" } },
      { lang: "hi", dir: "ltr", text: "क्या यह असली है?", name: { ar: "الهندية", en: "Hindi" } },
      { lang: "ur", dir: "rtl", text: "کیا یہ اصلی ہے؟", name: { ar: "الأردية", en: "Urdu" } },
      { lang: "ml", dir: "ltr", text: "ഇത് യഥാർത്ഥമാണോ?", name: { ar: "المالايالامية", en: "Malayalam" } },
      { lang: "bn", dir: "ltr", text: "এটা কি আসল?", name: { ar: "البنغالية", en: "Bengali" } },
      { lang: "tl", dir: "ltr", text: "Totoo ba ito?", name: { ar: "التاغالوغية", en: "Tagalog" } }
    ],

    /* Evidence. Facts only, each with its source. Analysis lives in problem.analysis. */
    evidence: [
      {
        year: 2025,
        fact: {
          ar: "سُجّلت نحو ٣٬٠٠٠ قضية جرائم إلكترونية في الكويت خلال عام ٢٠٢٤، وكانت الرسائل النصية المزيفة التي تنتحل صفة الجهات الرسمية والبنوك أكثر أنواع الاحتيال شيوعًا.",
          en: "About 3,000 cybercrime cases were reported in Kuwait in 2024, and fake text messages impersonating official bodies and banks were the most common type of fraud."
        },
        source: {
          ar: "إدارة مكافحة الجرائم الإلكترونية بوزارة الداخلية، بحسب MEA Tech Watch، يوليو ٢٠٢٥",
          en: "Ministry of Interior Cybercrime Department, reported by MEA Tech Watch, July 2025"
        },
        url: "https://meatechwatch.com/?p=26822"
      },
      {
        year: 2025,
        fact: {
          ar: "منذ عام ٢٠٢٣ أغلقت وحدة تنسيق مختصة أكثر من ٢٬٣٠٠ موقع احتيالي، وأوقفت أكثر من ٢٬٢٠٠ رقم واتساب مزيف.",
          en: "Since 2023, a dedicated coordination unit has shut down more than 2,300 scam websites and disconnected more than 2,200 fake WhatsApp numbers."
        },
        source: {
          ar: "إدارة مكافحة الجرائم الإلكترونية بوزارة الداخلية، بحسب MEA Tech Watch، يوليو ٢٠٢٥",
          en: "Ministry of Interior Cybercrime Department, reported by MEA Tech Watch, July 2025"
        },
        url: "https://meatechwatch.com/?p=26822"
      },
      {
        year: 2026,
        fact: {
          ar: "تُرسل وزارة الداخلية إشعارات المخالفات المرورية عبر تطبيق سهل فقط ولا ترسلها برسائل نصية، ومع ذلك تتكرر الرسائل الاحتيالية التي تطالب بسداد المخالفات.",
          en: "The Ministry of Interior sends traffic violation notices only through the Sahel app, never by text message, yet scam texts demanding payment of fines keep circulating."
        },
        source: {
          ar: "بيان وزارة الداخلية، بحسب كويت تايمز، ٢٧ يناير ٢٠٢٦",
          en: "Ministry of Interior statement, reported by Kuwait Times, 27 January 2026"
        },
        url: "https://kuwaittimes.com/article/39064/kuwait/other-news/moi-warns-against-scammers/"
      },
      {
        year: 2026,
        fact: {
          ar: "حذّرت هيئة الاتصالات وتقنية المعلومات في أغسطس ٢٠٢٦ مستخدمي آيفون من حملة تصيّد احتيالي عبر خدمة آي مسج تنتحل صفة شركات التوصيل والبريد.",
          en: "In August 2026 CITRA warned iPhone users about an iMessage phishing campaign posing as delivery and postal companies."
        },
        source: {
          ar: "تنبيه هيئة الاتصالات وتقنية المعلومات، بحسب ARY News، ١٨ أغسطس ٢٠٢٦",
          en: "CITRA alert, reported by ARY News, 18 August 2026"
        },
        url: "https://arynews.tv/kuwait-warns-iphone-users"
      },
      {
        year: 2026,
        fact: {
          ar: "يشير بيت التمويل الكويتي إلى أن معظم المواقع المزيفة التي تقف وراء هذه الرسائل مستضافة خارج الكويت.",
          en: "Kuwait Finance House notes that most of the fake sites behind these messages are hosted outside Kuwait."
        },
        source: {
          ar: "تحذير بيت التمويل الكويتي من الاحتيال، ٢٠٢٦",
          en: "Kuwait Finance House fraud warning, 2026"
        },
        url: "https://www.kfh.com/en/home/Personal/news/2026/fraudulent.html"
      },
      {
        year: 2026,
        fact: {
          ar: "يشكّل الوافدون أكثر من ٧ من كل ١٠ سكان، إذ بلغت نسبتهم ٧١٫٥٪ في نهاية عام ٢٠٢٥، ويتجاوز عدد الهنود وحدهم مليون نسمة.",
          en: "More than 7 in 10 residents are expatriates: 71.5% at the end of 2025, with Indians alone above one million."
        },
        source: {
          ar: "الهيئة العامة للمعلومات المدنية، بحسب كويت تايمز، ٢٨ يناير ٢٠٢٦",
          en: "Public Authority for Civil Information, reported by Kuwait Times, 28 January 2026"
        },
        url: "https://kuwaittimes.com/article/39124/kuwait/other-news/kuwaits-population-grows-5/"
      },
      {
        year: 2026,
        fact: {
          ar: "يستخدم ٩٩٪ من السكان الإنترنت، أي ٥٫٠٠ مليون شخص في نهاية عام ٢٠٢٥.",
          en: "99% of the population uses the internet: 5.00 million people at the end of 2025."
        },
        source: {
          ar: "داتا ريبورتال، تقرير الكويت الرقمي ٢٠٢٦",
          en: "DataReportal, Digital 2026: Kuwait"
        },
        url: "https://datareportal.com/reports/digital-2026-kuwait"
      },
      {
        year: 2021,
        fact: {
          ar: "تتواصل جهود التوعية بالفعل، إذ يدير بنك الكويت المركزي واتحاد مصارف الكويت حملة دراية بمشاركة جميع البنوك الكويتية منذ عام ٢٠٢١.",
          en: "Awareness work already exists: the Central Bank of Kuwait and the Kuwait Banking Association have run the Diraya campaign with every Kuwaiti bank since 2021."
        },
        source: {
          ar: "بيان صحفي لبنك الكويت المركزي، ٣ فبراير ٢٠٢١",
          en: "Central Bank of Kuwait press release, 3 February 2021"
        },
        url: "https://www.cbk.gov.kw/en/cbk-news/announcements-and-press-releases/press-releases/2021/02/202102031030-diraya-campaign-launches-video-addressing-e-crimes"
      }
    ],

    idea: {
      block: [
        {
          ar: "متأخرة بخطوة دائمًا، إذ يبدو نطاق الاحتيال الجديد سليمًا حتى يُبلّغ عنه أحد.",
          en: "Always a step behind: a new scam domain looks clean until someone reports it."
        },
        {
          ar: "لا تملك إلا أن تقول «سيئ معروف» أو أن تصمت.",
          en: "It can only say “known bad” or stay silent."
        }
      ],
      registry: [
        {
          ar: "يعرف كل نطاق أصلي واسم مرسل وتطبيق وخط ساخن لدى كل جهة رسمية، مع مصدر لكل منها.",
          en: "It knows every genuine domain, sender name, app and hotline of each official body, with a source for each."
        },
        {
          ar: "يعرف سياسة القنوات لدى كل جهة، مثل «إشعارات المخالفات المرورية عبر تطبيق سهل فقط».",
          en: "It knows each body's channel policy, such as “traffic fine notices come only through Sahel”."
        },
        {
          ar: "يُنبّه إلى كل ما يدّعي أنه جهة رسمية وهو خارج قيدها في السجل، حتى قبل أن يُبلّغ عنه أحد.",
          en: "It flags anything that claims to be an official body but sits outside its registry entry, even before anyone reports it."
        }
      ],
      open: [
        {
          title: { ar: "الثقة", en: "Trust" },
          body: {
            ar: "يحمل كل إدراج أدلته، ويشكّل سجل Git أثرًا عامًا يمكن مراجعة كل قرار من خلاله.",
            en: "Every listing carries its evidence, and the Git history is a public audit trail of each decision."
          }
        },
        {
          title: { ar: "إعادة الاستخدام", en: "Reuse" },
          body: {
            ar: "تستطيع البنوك وشركات الاتصالات والمدارس ومطورو التطبيقات اعتماده بصيغ قياسية دون عقود.",
            en: "Banks, telcos, schools and app makers can adopt it in standard formats without a contract."
          }
        },
        {
          title: { ar: "الوصول", en: "Reach" },
          body: {
            ar: "ينقله المترجمون من المجتمع إلى السكان بلغاتهم.",
            en: "Community translators carry it to residents in their own languages."
          }
        },
        {
          title: { ar: "الديمومة", en: "Durability" },
          body: {
            ar: "يبقى بعد أي راعٍ منفرد، ويستطيع أي أحد أن ينسخه ويبني عليه.",
            en: "It outlives any single sponsor, and anyone can fork it."
          }
        },
        {
          title: { ar: "التكلفة", en: "Cost" },
          body: {
            ar: "يعمل على بنية عامة مجانية هي GitHub Pages وGitHub Actions.",
            en: "It runs on free public infrastructure: GitHub Pages and GitHub Actions."
          }
        }
      ]
    },

    /* Demo registry and samples. Official domains are real and resolvable; every
       other link uses the reserved example domain. */
    demo: {
      registry: [
        {
          id: "moi",
          name: { ar: "وزارة الداخلية", en: "the Ministry of Interior" },
          claims: ["وزارة الداخلية", "ministry of interior"],
          tokens: ["moi"],
          domains: ["moi.gov.kw"],
          channels: [{ id: "sahel", name: { ar: "تطبيق سهل", en: "the Sahel app" } }],
          policies: [
            {
              id: "moi-fines-in-sahel",
              text: {
                ar: "ترسل وزارة الداخلية إشعارات المخالفات المرورية عبر تطبيق سهل فقط، ولا ترسلها برسائل نصية.",
                en: "The Ministry of Interior sends traffic violation notices only through the Sahel app, never by text message."
              },
              url: "https://kuwaittimes.com/article/39064/kuwait/other-news/moi-warns-against-scammers/",
              channels: ["sms", "imessage", "whatsapp"],
              words: ["مخالفة", "مخالفات", "fine", "fines", "violation"]
            }
          ]
        },
        {
          id: "moc",
          name: { ar: "وزارة المواصلات", en: "the Ministry of Communications" },
          claims: ["بريد الكويت", "وزارة المواصلات", "kuwait post", "ministry of communications"],
          tokens: ["kwpost", "post", "moc"],
          domains: ["moc.gov.kw"],
          channels: [],
          policies: [
            {
              id: "moc-no-shipment-fees",
              text: {
                ar: "لا ترسل وزارة المواصلات رسائل أو بريدًا إلكترونيًا تطلب فيه دفع رسوم لاستلام الشحنات.",
                en: "The Ministry of Communications never sends messages or emails asking people to pay to receive shipments."
              },
              url: "https://kuwaittimes.com/communications-ministry-warns-of-scam-messages/",
              channels: ["sms", "imessage", "whatsapp", "email"],
              words: ["ادفع", "رسوم", "pay", "fee", "fees"]
            }
          ]
        },
        {
          id: "bank",
          name: { ar: "بنك كويتي", en: "a Kuwaiti bank" },
          claims: ["عزيزي العميل", "بطاقتك", "dear customer", "your card"],
          tokens: ["bank"],
          domains: [],
          channels: [],
          policies: [
            {
              id: "bank-no-codes",
              text: {
                ar: "لا تطلب البنوك بياناتك المصرفية أو رمز التحقق عبر المكالمات أو الرسائل أو البريد الإلكتروني.",
                en: "Banks never ask for your banking details or one-time code by call, message or email."
              },
              url: "https://www.cbk.gov.kw/en/cbk-news/announcements-and-press-releases/press-releases/2021/02/202102031030-diraya-campaign-launches-video-addressing-e-crimes",
              channels: ["sms", "imessage", "whatsapp", "call", "email"],
              words: ["رمز التحقق", "verification code", "one-time code", "otp", "pin"]
            }
          ]
        }
      ],
      pressure: [
        "خلال ٢٤ ساعة", "وإلا", "الآن", "فورًا", "اليوم", "سيتم إيقاف",
        "within 24 hours", "or it will be", "will be blocked", "immediately", "today", "now"
      ],
      samples: [
        {
          id: "fine",
          label: { ar: "مخالفة برسالة نصية", en: "Fine by text message" },
          channel: "sms",
          channelName: { ar: "رسالة نصية", en: "Text message" },
          from: { ar: "رقم مجهول", en: "Unknown number" },
          lang: "ar",
          text: "وزارة الداخلية: عليك مخالفة مرورية بقيمة ٢٠ دينارًا يجب سدادها خلال ٢٤ ساعة وإلا تُضاعف إلى ٢٠٠ دينار، ادفع الآن عبر moi-kw-fines.example",
          advice: {
            ar: "لا تفتح الرابط وتحقّق من مخالفاتك في تطبيق سهل، وإن كنت قد دفعت فاتصل ببنكك فورًا ثم أبلغ وزارة الداخلية عن الرسالة.",
            en: "Do not open the link. Check your fines in the Sahel app. If you already paid, call your bank now, then report the message to the Ministry of Interior."
          },
          expect: "impersonation"
        },
        {
          id: "parcel",
          label: { ar: "رسوم شحنة عبر آي مسج", en: "Parcel fee on iMessage" },
          channel: "imessage",
          channelName: { ar: "آي مسج", en: "iMessage" },
          from: "kwpost-help@mail.example",
          lang: "en",
          text: "Kuwait Post: your parcel is on hold at customs. Pay the 0.350 KD fee within 24 hours at kwpost-delivery.example or it will be returned.",
          advice: {
            ar: "لا تدفع أي رسوم عبر الرابط، وتتبّع شحنتك من تطبيق شركة الشحن الرسمي أو موقعها الموثّق، ثم أبلغ عن الرسالة بأنها غير مرغوب فيها واحذفها.",
            en: "Do not pay through the link. Track the parcel in the courier's official app or verified website, then report the message as junk and delete it."
          },
          expect: "impersonation"
        },
        {
          id: "sahel",
          label: { ar: "إشعار في تطبيق سهل", en: "Notice in the Sahel app" },
          channel: "sahel",
          channelName: { ar: "تطبيق سهل", en: "Sahel app" },
          from: { ar: "وزارة الداخلية", en: "Ministry of Interior" },
          lang: "ar",
          text: "وزارة الداخلية: سُجّلت عليك مخالفة مرورية، ويمكنك الاطلاع عليها وسدادها من خدمات الوزارة داخل التطبيق",
          advice: {
            ar: "ادفع من داخل التطبيق نفسه ولا تنتقل إلى روابط خارجية، ولا تشارك رمز التحقق مع أي أحد.",
            en: "Pay inside the app itself, do not follow outside links, and never share a one-time code with anyone."
          },
          expect: "official"
        },
        {
          id: "code",
          label: { ar: "طلب رمز التحقق عبر واتساب", en: "Code request on WhatsApp" },
          channel: "whatsapp",
          channelName: { ar: "واتساب", en: "WhatsApp" },
          from: "+965 0000 0000",
          lang: "en",
          text: "Dear customer, your card will be blocked today. Reply with the verification code we just sent to keep it active.",
          advice: {
            ar: "لا ترسل الرمز لأي أحد، واتصل ببنكك على الرقم المطبوع خلف بطاقتك.",
            en: "Do not send the code to anyone. Call your bank on the number printed on the back of your card."
          },
          expect: "impersonation"
        }
      ]
    },

    lanes: [
      {
        id: "signals",
        title: { ar: "الإشارات", en: "Signals" },
        nodes: [
          {
            id: "ct",
            title: { ar: "سجلات الشهادات", en: "Certificate logs" },
            body: {
              ar: "كل شهادة TLS جديدة علنية، لذا يرصد أَصْلي الأسماء التي تستعير علامات كويتية لحظة إصدار الشهادة.",
              en: "Every new TLS certificate is public. Asli watches for names that borrow Kuwaiti brands the moment a certificate is issued."
            },
            reuses: ["KWTCyberWatch", "PhishWatch"]
          },
          {
            id: "nrd",
            title: { ar: "النطاقات الجديدة", en: "New domains" },
            body: {
              ar: "تُقيَّم النطاقات المسجلة حديثًا وفق كلمات العلامات الكويتية وتهجئاتها اللاتينية والحروف المتشابهة.",
              en: "Newly registered domains are scored for Kuwaiti brand words, their Latin spellings and lookalike characters."
            },
            reuses: ["PhishWatch"]
          },
          {
            id: "reports",
            title: { ar: "بلاغات المجتمع", en: "Community reports" },
            body: {
              ar: "يرسل السكان الرسائل المشبوهة بعد أن تُزال البيانات الشخصية منها على الجهاز نفسه قبل إرسال أي شيء.",
              en: "Residents forward suspicious messages. Personal details are removed on the device before anything is sent."
            },
            reuses: ["Kashif", "Ghirbal"]
          },
          {
            id: "partners",
            title: { ar: "إشارات الشركاء", en: "Partner signals" },
            body: {
              ar: "تستطيع البنوك وشركات الاتصالات مشاركة المؤشرات المؤكدة عبر صيغة بسيطة موثّقة.",
              en: "Banks and telcos can share confirmed indicators through a simple, documented format."
            },
            reuses: []
          }
        ]
      },
      {
        id: "review",
        title: { ar: "المراجعة", en: "Review" },
        nodes: [
          {
            id: "engine",
            title: { ar: "محرك الرصد", en: "Detection engine" },
            body: {
              ar: "يقيّم كل مرشح وفق كلمات العلامة والحروف المتشابهة وعمر النطاق والاستضافة وبصمات صفحات الدفع المزيفة المعروفة.",
              en: "Scores each candidate on brand words, lookalike characters, domain age, hosting and the fingerprints of known fake payment pages."
            },
            reuses: ["PhishBOT", "PhishHunter"]
          },
          {
            id: "agent",
            title: { ar: "وكيل الفرز", en: "Triage agent" },
            body: {
              ar: "يجمع وكيل ذكاء اصطناعي الأدلة ويلتقط الصفحة ويصوغ مسودة الحكم ويجهّز ملف طلب الإيقاف، لكنه لا يستطيع نشر أي شيء بمفرده.",
              en: "An AI agent gathers evidence, captures the page, drafts the verdict and prepares a takedown packet. It cannot publish anything on its own."
            },
            reuses: ["Ghirbal"]
          },
          {
            id: "humans",
            title: { ar: "مراجعان بشريان", en: "Two reviewers" },
            body: {
              ar: "يحتاج كل إدراج إلى موافقتين بشريتين مستقلتين، وتُسجَّل كل موافقة في السجل العام.",
              en: "Every listing needs two independent human approvals, and each approval is recorded in the public history."
            },
            reuses: []
          }
        ]
      },
      {
        id: "open",
        title: { ar: "البيانات المفتوحة", en: "Open data" },
        nodes: [
          {
            id: "registry",
            title: { ar: "السجل الرسمي", en: "Official registry" },
            body: {
              ar: "يضم النطاقات الأصلية وأسماء المرسلين والتطبيقات والخطوط الساخنة وسياسات القنوات لدى الجهات الرسمية الكويتية، ولكل منها مصدر وتاريخ تحقق.",
              en: "Genuine domains, sender names, apps, hotlines and channel policies of Kuwaiti official bodies, each with a source and a verification date."
            },
            reuses: []
          },
          {
            id: "feed",
            title: { ar: "تغذية الاحتيال", en: "Scam feed" },
            body: {
              ar: "تنشر روابط الاحتيال وأرقامه وأسماء مرسليه المؤكدة، وتُحدَّث كل ساعة بـ٨ صيغ هي JSON وCSV والنص العادي وhosts وAdGuard وDNS RPZ وSTIX 2.1 وMISP.",
              en: "Confirmed scam links, numbers and sender names, updated every hour in 8 formats: JSON, CSV, plain text, hosts, AdGuard, DNS RPZ, STIX 2.1 and MISP."
            },
            reuses: ["Ghirbal"]
          },
          {
            id: "releases",
            title: { ar: "إصدارات موقّعة", en: "Signed releases" },
            body: {
              ar: "يُوقَّع كل إصدار ويُرقَّم، فيستطيع كل من يستخدمه أن يثبت ما استلمه وأن يعود إلى إصدار سابق.",
              en: "Every release is signed and versioned, so anyone who consumes it can prove what they received and roll back."
            },
            reuses: []
          }
        ]
      },
      {
        id: "reach",
        title: { ar: "الوصول", en: "Reach" },
        nodes: [
          {
            id: "check",
            title: { ar: "صفحة الفحص", en: "Check page" },
            body: {
              ar: "الصق رابطًا أو رقمًا أو رسالة لتحصل على حكم مع سببه، إذ يجري الفحص داخل متصفحك ويعمل دون اتصال.",
              en: "Paste a link, number or message and get a verdict with its reason. The check runs in your browser and works offline."
            },
            reuses: ["Ghirbal"]
          },
          {
            id: "extension",
            title: { ar: "إضافة المتصفح", en: "Browser extension" },
            body: {
              ar: "تُنبّه قبل تحميل صفحة احتيالية وتميّز المواقع الرسمية الأصلية.",
              en: "Warns before a scam page loads and marks genuine official sites."
            },
            reuses: []
          },
          {
            id: "bot",
            title: { ar: "بوت المراسلة", en: "Messaging bot" },
            body: {
              ar: "حوّل الرسالة لتحصل على الحكم بلغتك، ويبدأ البوت على تيليجرام ثم ينتقل إلى واتساب حين يغطي راعٍ تكلفته.",
              en: "Forward a message and get the verdict in your language. Telegram comes first, and WhatsApp follows when a sponsor covers its cost."
            },
            reuses: []
          },
          {
            id: "mcp",
            title: { ar: "خادم MCP", en: "MCP server" },
            body: {
              ar: "يتيح لمساعدات الذكاء الاصطناعي فحص الروابط والأرقام مقابل سجل الكويت وتغذيتها.",
              en: "Lets AI assistants check links and numbers against Kuwait's registry and feed."
            },
            reuses: ["KaliMCP"]
          },
          {
            id: "api",
            title: { ar: "واجهة البنوك وشركات الاتصالات", en: "Bank and telco API" },
            body: {
              ar: "توفّر نقاط وصول ثابتة قابلة للتخزين المؤقت تستطيع فرق مكافحة الاحتيال ومرشّحات الرسائل النصية استطلاعها.",
              en: "Static, cacheable endpoints that fraud teams and SMS filters can poll."
            },
            reuses: []
          },
          {
            id: "kit",
            title: { ar: "حزمة التوعية", en: "Awareness kit" },
            body: {
              ar: "نشرة شهرية بأنماط الاحتيال الجديدة بـ٧ لغات، يمكن إعادة استخدامها مجانًا في حملات مثل دراية.",
              en: "A monthly brief of new scam patterns in 7 languages, free to reuse in campaigns such as Diraya."
            },
            reuses: ["Wa3i"]
          }
        ]
      }
    ],

    criteria: [
      {
        id: "reach",
        weight: 5,
        name: { ar: "الوصول", en: "Reach" },
        desc: { ar: "عدد السكان الذين يستفيدون منه مباشرة", en: "How many residents it helps directly" }
      },
      {
        id: "harm",
        weight: 5,
        name: { ar: "الضرر المتجنَّب", en: "Harm reduced" },
        desc: { ar: "مدى تكرار المشكلة وشدة ضررها", en: "How often the problem strikes and how badly it hurts" }
      },
      {
        id: "open",
        weight: 4,
        name: { ar: "ملاءمة المصدر المفتوح", en: "Open-source fit" },
        desc: { ar: "هل يجعله الانفتاح أفضل لا أرخص فقط", en: "Whether openness makes it better, not just cheaper" }
      },
      {
        id: "feas",
        weight: 3,
        name: { ar: "قابلية التنفيذ", en: "Feasibility" },
        desc: {
          ar: "هل يستطيع فريق صغير إطلاق إصدار أول خلال ٨ أسابيع على بنية مجانية",
          en: "Whether a small team can ship a first version in 8 weeks on free infrastructure"
        }
      },
      {
        id: "lev",
        weight: 3,
        name: { ar: "البناء على العمل القائم", en: "Builds on existing work" },
        desc: { ar: "مقدار ما يعيد استخدامه من شيفرة SiteQ8 المجرّبة", en: "How much proven SiteQ8 code it can reuse" }
      }
    ],

    candidates: [
      {
        id: "asli",
        short: { ar: "أَصْلي", en: "Asli" },
        name: { ar: "أَصْلي، الدرع المفتوح ضد الاحتيال", en: "Asli, the open scam shield" },
        why: {
          ar: "يلامس كل مقيم ويحوّل الانفتاح إلى ثقة، ويعيد استخدام تسعة مشاريع من SiteQ8.",
          en: "Touches every resident, turns openness into trust and reuses nine SiteQ8 projects."
        },
        scores: { reach: 5, harm: 5, open: 5, feas: 4, lev: 5 }
      },
      {
        id: "sme",
        short: { ar: "ماسح المنشآت الصغيرة", en: "the small business scanner" },
        name: { ar: "ماسح الضوابط الأساسية للأمن السيبراني للمنشآت الصغيرة", en: "Cyber baseline scanner for small businesses" },
        why: {
          ar: "يتوافق بقوة مع الأدوات القائمة، لكنه يصل إلى المنشآت لا إلى السكان.",
          en: "Strong fit with existing tools, but it reaches businesses rather than residents."
        },
        scores: { reach: 2, harm: 3, open: 4, feas: 4, lev: 5 }
      },
      {
        id: "devkit",
        short: { ar: "حزمة المطور الكويتي", en: "the Kuwait developer kit" },
        name: { ar: "حزمة المطور الكويتي للتحقق من الرقم المدني والآيبان والعناوين والعطل", en: "Kuwait developer kit for civil ID, IBAN, address and holiday checks" },
        why: {
          ar: "سريعة البناء، لكنها تفيد الناس بشكل غير مباشر فقط.",
          en: "Quick to build, but it helps people only indirectly."
        },
        scores: { reach: 2, harm: 2, open: 5, feas: 5, lev: 3 }
      },
      {
        id: "laws",
        short: { ar: "مدونة التشريعات", en: "the legislation corpus" },
        name: { ar: "مدونة مفتوحة للتشريعات الكويتية", en: "Open corpus of Kuwaiti legislation" },
        why: {
          ar: "مفيدة للمحامين والباحثين، غير أن جمع النصوص وتوحيدها بطيء.",
          en: "Valuable to lawyers and researchers, but collecting and consolidating texts is slow."
        },
        scores: { reach: 3, harm: 2, open: 4, feas: 3, lev: 4 }
      },
      {
        id: "heat",
        short: { ar: "لوحة الصمود", en: "the resilience dashboard" },
        name: { ar: "لوحة الصمود أمام الحر وانقطاع الكهرباء", en: "Heat and power resilience dashboard" },
        why: {
          ar: "حاجتها حقيقية، لكنها تعتمد على بيانات غير منشورة.",
          en: "A real need, but it depends on data that is not published."
        },
        scores: { reach: 4, harm: 3, open: 3, feas: 3, lev: 1 }
      },
      {
        id: "lahja",
        short: { ar: "بيانات اللهجة الكويتية", en: "the Kuwaiti Arabic data" },
        name: { ar: "بيانات ونماذج لغوية مفتوحة للهجة الكويتية", en: "Open Kuwaiti Arabic language data and models" },
        why: {
          ar: "قيمتها عالية، لكنها تحتاج إلى بيانات ضخمة مرخّصة وسنوات من العمل.",
          en: "High value, but it needs large licensed datasets and years of work."
        },
        scores: { reach: 3, harm: 2, open: 5, feas: 2, lev: 2 }
      }
    ],

    phases: [
      {
        n: 0,
        title: { ar: "الأساس", en: "Foundations" },
        when: { ar: "الأسبوعان ١ و٢", en: "Weeks 1 and 2" },
        dates: { ar: "٤ إلى ١٥ أكتوبر ٢٠٢٦", en: "4 to 15 October 2026" },
        goals: [
          { ar: "اعتماد الاسم والنطاق والتراخيص", en: "Approve the name, scope and licences" },
          { ar: "نشر سياسة الإدراج وإشعار الخصوصية", en: "Publish the listing policy and the privacy notice" },
          { ar: "مخطط السجل بإصداره ١ مع اختبارات تفرضه", en: "Registry schema version 1, enforced by tests" },
          { ar: "إدخال أول ٢٥ جهة رسمية مع مصادرها", en: "Seed the first 25 official bodies with sources" }
        ],
        exit: {
          ar: "نجاح اختبارات المخطط، ووجود مصدر وتاريخ تحقق لكل قيد مُدخل.",
          en: "Schema tests pass, and every seeded entry has a source and a verification date."
        }
      },
      {
        n: 1,
        title: { ar: "التغذية وصفحة الفحص", en: "Feed and check page" },
        when: { ar: "الأسابيع ٣ إلى ٨", en: "Weeks 3 to 8" },
        dates: { ar: "١٨ أكتوبر إلى ٢٦ نوفمبر ٢٠٢٦", en: "18 October to 26 November 2026" },
        goals: [
          { ar: "رصد كل ساعة من سجلات الشهادات والنطاقات الجديدة", en: "Hourly detection from certificate logs and new domains" },
          { ar: "قائمة مراجعة بموافقتين لكل إدراج", en: "A review queue with two approvals per listing" },
          { ar: "نشر التغذية موقّعةً بـ٨ صيغ", en: "The feed published and signed in 8 formats" },
          { ar: "صفحة الفحص بالعربية والإنجليزية", en: "The check page in Arabic and English" }
        ],
        exit: {
          ar: "أن يقل الوسيط الزمني من الرصد إلى الإدراج عن ٦ ساعات، وأن تقل الإيجابيات الكاذبة المراجَعة عن ١٪.",
          en: "Median time from detection to listing is under 6 hours, and reviewed false positives are under 1%."
        }
      },
      {
        n: 2,
        title: { ar: "الوصول", en: "Reach" },
        when: { ar: "الأسابيع ٩ إلى ١٦", en: "Weeks 9 to 16" },
        dates: { ar: "٢٩ نوفمبر ٢٠٢٦ إلى ٢١ يناير ٢٠٢٧", en: "29 November 2026 to 21 January 2027" },
        goals: [
          { ar: "إضافة متصفح تعمل على Chromium وFirefox", en: "A browser extension for Chromium and Firefox" },
          { ar: "بوت على تيليجرام", en: "A Telegram bot" },
          { ar: "٧ لغات مع اختبارات تفرض اكتمالها", en: "7 languages, with completeness enforced by tests" },
          { ar: "نموذج بلاغ يحمي الخصوصية أولًا", en: "A report form that puts privacy first" }
        ],
        exit: {
          ar: "اجتياز اللغات السبع اختبارات الاكتمال، وإتاحة الإضافة في المتجرين.",
          en: "All seven languages pass the completeness tests, and the extension is live in both stores."
        }
      },
      {
        n: 3,
        title: { ar: "الوكلاء والتكامل", en: "Agents and integrations" },
        when: { ar: "الأشهر ٥ إلى ٩", en: "Months 5 to 9" },
        dates: { ar: "فبراير إلى يونيو ٢٠٢٧", en: "February to June 2027" },
        goals: [
          { ar: "وكيل فرز يخضع لاعتماد بشري", en: "A triage agent with human sign-off" },
          { ar: "خادم MCP وواجهة البنوك وشركات الاتصالات", en: "The MCP server and the bank and telco API" },
          { ar: "ملفات طلب الإيقاف لمسجلي النطاقات ومزودي الاستضافة", en: "Takedown packets for registrars and hosting providers" },
          { ar: "الاستعداد لاحتيال التبرعات قبل رمضان ٢٠٢٧", en: "Readiness for charity scams before Ramadan 2027" }
        ],
        exit: {
          ar: "أن تستهلك جهتان على الأقل التغذية في بيئة الإنتاج.",
          en: "At least two institutions consume the feed in production."
        }
      },
      {
        n: 4,
        title: { ar: "الرعاية المستدامة", en: "Stewardship" },
        when: { ar: "الأشهر ١٠ إلى ١٢", en: "Months 10 to 12" },
        dates: { ar: "يوليو إلى سبتمبر ٢٠٢٧", en: "July to September 2027" },
        goals: [
          { ar: "ميثاق حوكمة وجهة راعية محايدة", en: "A governance charter and a neutral steward" },
          { ar: "نموذج رعاية لا يشتري إدراجًا ولا حذفًا", en: "A sponsorship model that cannot buy listings or removals" },
          { ar: "أول تقرير شفافية سنوي", en: "The first annual transparency report" }
        ],
        exit: {
          ar: "نشر تقرير الشفافية، وعمل المشروع شهرًا كاملًا دون مؤسسه.",
          en: "The transparency report is published, and the project runs for a full month without its founder."
        }
      }
    ],

    reuse: [
      { repo: "KWTCyberWatch", role: { ar: "مراقبة شفافية الشهادات ورصد النطاقات المشابهة", en: "Certificate Transparency monitoring and lookalike domain detection" } },
      { repo: "PhishWatch", role: { ar: "مرشحو النطاقات المشابهة من CertStream وOpenSquat", en: "Lookalike candidates from CertStream and OpenSquat" } },
      { repo: "PhishBOT", role: { ar: "محرك لتحليل الصفحات مع واجهة REST", en: "Page analysis engine with a REST API" } },
      { repo: "PhishHunter", role: { ar: "رصد مواقع التصيّد من إشارات متعددة", en: "Phishing site detection from multiple signals" } },
      { repo: "Ghirbal", role: { ar: "استخراج المؤشرات من الرسائل مع التصدير بصيغة STIX 2.1", en: "Indicator extraction from messages, with STIX 2.1 export" } },
      { repo: "Kashif", role: { ar: "رصد البيانات الحساسة داخل المتصفح، ويُعاد استخدامه لتنقيح البلاغات", en: "In-browser detection of sensitive data, reused to redact reports" } },
      { repo: "Wa3i", role: { ar: "محتوى التوعية بالعربية", en: "Arabic awareness content" } },
      { repo: "KaliMCP", role: { ar: "خبرة بناء خوادم MCP لتكامل المساعدات الذكية", en: "Experience building MCP servers, for the assistant integration" } },
      { repo: "KW-OS", role: { ar: "دليل المصادر المفتوحة في الكويت للتعريف بالمشروع وبناء مجتمعه", en: "Kuwait's open-source directory, for listing and community" } }
    ],

    trust: [
      {
        id: "evidence",
        title: { ar: "الأدلة", en: "Evidence" },
        body: {
          ar: "يحفظ كل إدراج الرابط ووقت الالتقاط وبصمة لقطة الشاشة وسبب الإدراج.",
          en: "Every listing stores the link, the capture time, a screenshot hash and the reason."
        }
      },
      {
        id: "keys",
        title: { ar: "مفتاحان", en: "Two keys" },
        body: {
          ar: "لا يستطيع شخص واحد أو وكيل منفرد أن يُدرج أو يحذف، بل يجب أن يتفق مراجعان.",
          en: "No single person or agent can list or delist. Two reviewers must agree."
        }
      },
      {
        id: "expiry",
        title: { ar: "انتهاء الصلاحية", en: "Expiry" },
        body: {
          ar: "تنتهي صلاحية القيود بعد ٩٠ يومًا ما لم يُعَد تأكيدها، لأن النطاقات تنتقل بين المالكين.",
          en: "Entries expire after 90 days unless confirmed again, because domains change hands."
        }
      },
      {
        id: "appeals",
        title: { ar: "الاعتراض", en: "Appeals" },
        body: {
          ar: "يستطيع أي أحد الاعتراض على إدراج، والهدف البتّ فيه خلال ٧٢ ساعة مع تسجيل كل حذف.",
          en: "Anyone can appeal a listing. The target is a decision within 72 hours, and every delisting is logged."
        }
      },
      {
        id: "privacy",
        title: { ar: "الخصوصية", en: "Privacy" },
        body: {
          ar: "لا تدخل أي بيانات شخصية إلى التغذية، والبلاغات مجهولة المصدر افتراضيًا وتُنقَّح على الجهاز، وفق مبادئ لائحة حماية خصوصية البيانات الصادرة عن هيئة الاتصالات وتقنية المعلومات بالقرار رقم ٢٦ لسنة ٢٠٢٤.",
          en: "No personal data enters the feed. Reports are anonymous by default and redacted on the device, following the principles of CITRA's Data Privacy Protection Regulation, Resolution No. 26 of 2024."
        },
        url: "https://www.tamimi.com/news/kuwait-data-privacy-protection-regulations"
      },
      {
        id: "licences",
        title: { ar: "التراخيص", en: "Licences" },
        body: {
          ar: "تُنشر الشيفرة بترخيص MIT، ويُنشر السجل والتغذية ومحتوى التوعية بترخيص CC BY 4.0.",
          en: "Code is released under the MIT licence. The registry, the feed and the awareness content are released under CC BY 4.0."
        }
      },
      {
        id: "neutrality",
        title: { ar: "الحياد", en: "Neutrality" },
        body: {
          ar: "لا يعرض المشروع إعلانات ولا يتتبّع أحدًا ولا يقبل إدراجًا مدفوعًا، فالرعاة يموّلون العمل لا الإدراج أو الحذف.",
          en: "No ads, no tracking and no paid placement. Sponsors fund the work, never a listing or a removal."
        }
      },
      {
        id: "security",
        title: { ar: "الأمان", en: "Security" },
        body: {
          ar: "تُوقَّع الإصدارات وتُحمى الفروع، ويستخدم مشرفان على الأقل مفاتيح أمان مادية.",
          en: "Releases are signed, branches are protected, and at least two maintainers use hardware security keys."
        }
      },
      {
        id: "place",
        title: { ar: "موقعه", en: "Its place" },
        body: {
          ar: "يُكمّل أَصْلي الجهود الرسمية مثل وحدة الإيقاف في وزارة الداخلية وغرفة «أمان» الافتراضية التي تربط البنوك بالنيابة العامة ووحدة الجرائم المالية، إذ يوجّه الضحايا إلى بنوكهم وإلى الوزارة ولا يحل محل أي منها أبدًا.",
          en: "Asli complements official work such as the Ministry of Interior's takedown unit and the Aman virtual room that links banks, the Public Prosecution and the financial crimes unit. It routes victims to their bank and to the ministry, and it never replaces any of them."
        },
        url: "https://meatechwatch.com/?p=26822"
      }
    ],

    measures: [
      {
        metric: { ar: "الوسيط الزمني من الرصد إلى الإدراج", en: "Median time from detection to listing" },
        target: { ar: "أقل من ٦ ساعات في المرحلة ١، وأقل من ساعة في المرحلة ٣", en: "Under 6 hours in Phase 1 and under an hour in Phase 3" }
      },
      {
        metric: { ar: "نسبة الإيجابيات الكاذبة المراجَعة", en: "Reviewed false positive rate" },
        target: { ar: "أقل من ١٪", en: "Under 1%" }
      },
      {
        metric: { ar: "الجهات الرسمية في السجل", en: "Official bodies in the registry" },
        target: { ar: "٢٥ جهة في المرحلة ٠، و١٠٠ جهة بنهاية المرحلة ٢", en: "25 in Phase 0 and 100 by the end of Phase 2" }
      },
      {
        metric: { ar: "اللغات", en: "Languages" },
        target: { ar: "٧ لغات بنهاية المرحلة ٢", en: "7 by the end of Phase 2" }
      },
      {
        metric: { ar: "الجهات المستهلكة للتغذية", en: "Institutions consuming the feed" },
        target: { ar: "٥ جهات بنهاية السنة الأولى", en: "5 by the end of the first year" }
      },
      {
        metric: { ar: "حجم صفحة الفحص", en: "Check page weight" },
        target: { ar: "أقل من ١٠٠ كيلوبايت مضغوطة، وتعمل على اتصال ضعيف", en: "Under 100 KB compressed, usable on a weak connection" }
      },
      {
        metric: { ar: "المقاييس المفتوحة", en: "Open metrics" },
        target: { ar: "تُنشر كل شهر", en: "Published every month" }
      }
    ],

    risks: [
      {
        risk: { ar: "إدراج موقع مشروع عن طريق الخطأ", en: "A legitimate site is listed by mistake" },
        response: {
          ar: "يراجع كل إدراج شخصان وتُحفظ أدلته، وتنتهي صلاحيته بعد ٩٠ يومًا، ويبقى مسار الاعتراض مفتوحًا للجميع.",
          en: "Two reviewers, stored evidence, a 90-day expiry and a public appeal path."
        }
      },
      {
        risk: { ar: "دراسة المحتالين للشيفرة المفتوحة للتهرب منها", en: "Scammers study the open code to evade it" },
        response: {
          ar: "نفتح المنهجية ونُبقي كلمات المراقبة والمرشحين غير المؤكَّدين خاصة حتى يُؤكَّد الإدراج.",
          en: "The method is open, but watch terms and unconfirmed candidates stay private until a listing is confirmed."
        }
      },
      {
        risk: { ar: "نسخ مزيفة من أَصْلي نفسه", en: "Fake copies of Asli itself" },
        response: {
          ar: "يُدرج أَصْلي قنواته الأصلية في السجل ويوقّع كل إصدار، ولا يطلب مالًا ولا بيانات شخصية أبدًا.",
          en: "Asli lists its own genuine channels in the registry, signs every release and never asks for money or personal data."
        }
      },
      {
        risk: { ar: "شعور الجهات الرسمية بالانكشاف", en: "Official bodies feel exposed" },
        response: {
          ar: "لا يتضمن السجل إلا القنوات العامة مع مصادرها، ولا يطلق أي حكم على أمن أي جهة.",
          en: "The registry lists only public channels with their sources and makes no claim about any body's security."
        }
      },
      {
        risk: { ar: "إرهاق المشرفين", en: "Maintainer burnout" },
        response: {
          ar: "نعتمد الأتمتة أولًا ونناوب بين المراجعين، ثم نختبر في المرحلة ٤ قدرة المشروع على العمل شهرًا دون مؤسسه.",
          en: "Automation first, rotating reviewers, and the Phase 4 test of a month without the founder."
        }
      },
      {
        risk: { ar: "التعرض القانوني", en: "Legal exposure" },
        response: {
          ar: "يراجع مستشار قانوني سياسة الإدراج في المرحلة ٠، ويذكر كل إدراج وقائع بأدلتها لا آراء.",
          en: "Counsel reviews the listing policy in Phase 0, and every listing states facts with evidence, not opinions."
        }
      }
    ],

    serves: [
      { title: { ar: "السكان", en: "Residents" }, body: { ar: "إجابة واضحة بلغتهم دون تثبيت أي شيء.", en: "A clear answer in their own language, with nothing to install." } },
      { title: { ar: "البنوك", en: "Banks" }, body: { ar: "تغذية تربطها فرق مكافحة الاحتيال بأنظمتها، ومحتوى يلائم حملة دراية.", en: "A feed their fraud teams can plug in, and content that fits the Diraya campaign." } },
      { title: { ar: "شركات الاتصالات", en: "Telcos" }, body: { ar: "قوائم جاهزة لتصفية الرسائل النصية وطلبات DNS.", en: "Lists ready for SMS and DNS filtering." } },
      {
        title: { ar: "الجهات التنظيمية وجهات إنفاذ القانون", en: "Regulators and law enforcement" },
        body: {
          ar: "إنذار مبكر وملفات إيقاف جاهزة للمركز الوطني للأمن السيبراني وهيئة الاتصالات وتقنية المعلومات ووزارة الداخلية.",
          en: "Early warning and ready takedown packets for the National Cyber Security Center, CITRA and the Ministry of Interior."
        }
      },
      { title: { ar: "المطورون", en: "Developers" }, body: { ar: "نقاط وصول ثابتة وخادم MCP للبناء عليها.", en: "Static endpoints and an MCP server to build on." } },
      { title: { ar: "المعلمون", en: "Educators" }, body: { ar: "نشرة شهرية بأنماط حقيقية للمدارس وأماكن العمل.", en: "A monthly brief of real patterns for schools and workplaces." } }
    ],

    steps: [
      { ar: "اعتماد اسم أَصْلي والنطاق والتراخيص.", en: "Approve the name Asli, the scope and the licences." },
      { ar: "نشر سياسة الإدراج وآلية الاعتراض وإشعار الخصوصية.", en: "Publish the listing policy, the appeal process and the privacy notice." },
      { ar: "تعريف مخطط السجل بإصداره ١ والاختبارات التي تفرضه.", en: "Define registry schema version 1 and the tests that enforce it." },
      { ar: "إدخال أول ٢٥ جهة رسمية مع مصدر وتاريخ لكل حقل.", en: "Seed the first 25 official bodies, with a source and a date for every field." },
      { ar: "نقل مراقب الشهادات من KWTCyberWatch إلى مهمة مجدولة في GitHub Actions.", en: "Move the KWTCyberWatch certificate watcher into a scheduled GitHub Actions job." },
      { ar: "فتح قائمة المراجعة بنماذج الطلبات في GitHub ودعوة مراجعَين اثنين.", en: "Open the review queue with GitHub issue forms and invite two reviewers." },
      { ar: "طلب مراجعة قانونية لسياسة الإدراج.", en: "Ask counsel to review the listing policy." }
    ]
  };

  root.ASLI = ASLI;
})(typeof window !== "undefined" ? window : globalThis);
