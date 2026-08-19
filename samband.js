/* ============================================================================
   SAMBANDSFERLIÐ — ein spurning í einu, beint í Innhólf Wisdom.
   ============================================================================

   HVERS VEGNA EIN SPURNING Í EINU:
   Venjulegt samskiptaform með sex reitum lítur út eins og vinna. Spurning í
   einu lítur út eins og samtal. Munurinn sést í því hversu margir klára.

   HVERS VEGNA ÞETTA ER EIN SKRÁ:
   Hún sprautar sínum eigin stílum og sínu eigin DOM. Þar með snertir hún
   hvorki style.css né main.js og getur ekki brotið neitt sem fyrir er.
   Til að bæta henni á síðu þarf eina línu.

   HVERS VEGNA MAILTO-HLEKKIRNIR STANDA ÓBREYTTIR:
   Skriftan tekur yfir smelli á "hallo@reytal.is" hlekkina og opnar formið í
   staðinn. Sé JavaScript slökkt — eða bregðist þessi skrá — opnast
   tölvupóstforritið eins og áður. Formið er VIÐBÓT, ekki skilyrði.

   TENGINGIN VIÐ WISDOM:
   Eitt POST á /api/public/lead með því sem manneskjan skrifaði. Reytal veit
   ekkert um lénauðkenni, biðraðir eða innhólf — og á ekki að vita það.
   Vefslóðin er VALFRJÁLS: sá sem vill nýjan vef á engan vef til að gefa upp.
   ========================================================================= */
(function () {
  "use strict";

  var API = "https://wisdom.reytal.is/api/public/lead";

  /* ── Spurningarnar ────────────────────────────────────────────────────
     Röðin er ekki tilviljun. Nafnið fyrst því það er auðveldasta svarið og
     það sem opnar samtalið. Netfangið SÍÐAST því það er það eina sem fólk
     hikar við — og sá sem er kominn í gegnum fjórar spurningar gefur það
     upp, en sá sem er beðinn um það fyrst fer.                            */
  var STEPS = [
    {
      key: "name",
      type: "text",
      q: "Hvað heitir þú?",
      placeholder: "Nafnið þitt",
      required: true,
      autocomplete: "name",
    },
    {
      key: "topics",
      type: "choice",
      q: "Hvað getum við gert fyrir þig?",
      hint: "Veldu eins margt og þú vilt",
      required: true,
      options: [
        "Nýr vefur",
        "Endurhönnun",
        "Viðhald og rekstur",
        "Hraði og leitarvélar",
        "Gervigreind og sjálfvirkni",
        "Annað",
      ],
    },
    {
      key: "domain",
      type: "text",
      q: "Ertu með vef í dag?",
      hint: "Við kíkjum á hann áður en við heyrum í þér",
      placeholder: "fyrirtaekid.is",
      skip: "Ég er ekki með vef",
      inputmode: "url",
      autocomplete: "url",
    },
    {
      key: "message",
      type: "textarea",
      q: "Segðu okkur aðeins meira",
      hint: "Shift + Enter fyrir nýja línu",
      placeholder: "Hvað stendur til?",
      skip: "Sleppa",
    },
    {
      key: "email",
      type: "email",
      q: "Hvert eigum við að svara?",
      hint: "Netfang, og símanúmer ef þú vilt heyra í okkur fyrr",
      placeholder: "nafn@fyrirtaekid.is",
      required: true,
      autocomplete: "email",
      extra: { key: "phone", placeholder: "Símanúmer (valfrjálst)", autocomplete: "tel" },
    },
  ];

  var CSS = [
    ".sb-root{position:fixed;inset:0;z-index:9999;display:none;}",
    ".sb-root.is-open{display:block;}",
    ".sb-sheet{position:absolute;inset:0;background:var(--cream,#F3F0EA);",
    "  display:flex;flex-direction:column;",
    "  opacity:0;transform:translateY(14px);",
    "  transition:opacity .42s cubic-bezier(.25,.7,.25,1), transform .42s cubic-bezier(.25,.7,.25,1);}",
    ".sb-root.is-in .sb-sheet{opacity:1;transform:none;}",

    /* Þrepin sem strik. Aranja notar samfellda slá; strikin segja það sem
       slá segir ekki: HVERSU MÖRG skref eru eftir, talin í heilum tölum. */
    ".sb-top{display:flex;align-items:center;gap:20px;padding:22px clamp(20px,4vw,44px);}",
    ".sb-marks{display:flex;gap:6px;flex:1;max-width:340px;}",
    ".sb-mark{height:3px;flex:1;border-radius:999px;background:rgba(11,12,13,0.14);",
    "  transition:background .35s ease;}",
    ".sb-mark.is-done{background:var(--navy,#0D4659);}",
    ".sb-mark.is-now{background:var(--slate,#4C7C93);}",
    ".sb-count{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.08em;",
    "  text-transform:uppercase;color:var(--grey,#9AA1A6);white-space:nowrap;}",
    ".sb-x{margin-left:auto;background:none;border:none;cursor:pointer;padding:8px;",
    "  line-height:0;color:var(--black,#0B0C0D);opacity:.55;transition:opacity .25s ease;}",
    ".sb-x:hover{opacity:1;}",

    ".sb-body{flex:1;display:flex;align-items:center;overflow-y:auto;}",
    ".sb-inner{width:100%;max-width:660px;margin:0 auto;padding:0 clamp(20px,5vw,44px) clamp(40px,8vh,90px);}",

    ".sb-q{font-family:'DM Sans',sans-serif;font-weight:700;",
    "  font-size:clamp(26px,4.4vw,44px);line-height:1.06;letter-spacing:-0.02em;",
    "  margin-bottom:10px;}",
    ".sb-hint{font-size:14px;line-height:1.5;color:var(--grey,#9AA1A6);margin-bottom:26px;}",
    ".sb-q + .sb-field, .sb-q + .sb-choices{margin-top:26px;}",

    ".sb-field input,.sb-field textarea{width:100%;",
    "  font-family:'DM Sans',sans-serif;font-size:clamp(17px,2vw,21px);color:var(--black,#0B0C0D);",
    "  background:transparent;border:none;border-bottom:1.5px solid rgba(11,12,13,0.22);",
    "  padding:12px 0;outline:none;transition:border-color .3s ease;}",
    ".sb-field textarea{resize:none;min-height:96px;line-height:1.5;}",
    ".sb-field input:focus,.sb-field textarea:focus{border-bottom-color:var(--navy,#0D4659);}",
    ".sb-field input::placeholder,.sb-field textarea::placeholder{color:rgba(11,12,13,0.28);}",
    ".sb-field + .sb-field{margin-top:18px;}",

    /* Valkostir sem tölusettar pillur — sama form og .work-tag á vefnum. */
    ".sb-choices{display:flex;flex-wrap:wrap;gap:10px;}",
    ".sb-choice{display:inline-flex;align-items:center;gap:10px;cursor:pointer;",
    "  font-family:'DM Sans',sans-serif;font-size:15px;color:var(--black,#0B0C0D);",
    "  background:transparent;border:1px solid rgba(11,12,13,0.22);border-radius:999px;",
    "  padding:11px 20px 11px 12px;",
    "  transition:border-color .25s ease, background .25s ease, color .25s ease;}",
    ".sb-choice:hover{border-color:var(--navy,#0D4659);}",
    ".sb-choice .n{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.04em;",
    "  width:22px;height:22px;border-radius:50%;display:grid;place-items:center;",
    "  border:1px solid rgba(11,12,13,0.22);color:var(--grey,#9AA1A6);",
    "  transition:all .25s ease;}",
    ".sb-choice.is-on{background:var(--navy,#0D4659);border-color:var(--navy,#0D4659);color:var(--cream,#F3F0EA);}",
    ".sb-choice.is-on .n{background:var(--cream,#F3F0EA);border-color:var(--cream,#F3F0EA);color:var(--navy,#0D4659);}",

    ".sb-actions{display:flex;align-items:center;gap:20px;margin-top:34px;flex-wrap:wrap;}",
    ".sb-next{background:var(--black,#0B0C0D);color:var(--cream,#F3F0EA);",
    "  font-family:'DM Mono',monospace;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;",
    "  border:none;border-radius:999px;padding:15px 30px;cursor:pointer;font-weight:600;",
    "  transition:background .3s ease, transform .3s ease;}",
    ".sb-next:hover{background:var(--navy,#0D4659);transform:translateY(-2px);}",
    ".sb-next[disabled]{opacity:.35;cursor:default;transform:none;background:var(--black,#0B0C0D);}",
    ".sb-ghost{background:none;border:none;cursor:pointer;padding:6px 0;",
    "  font-family:'DM Sans',sans-serif;font-size:14px;color:var(--grey,#9AA1A6);",
    "  text-decoration:underline;text-underline-offset:4px;transition:color .25s ease;}",
    ".sb-ghost:hover{color:var(--navy,#0D4659);}",
    ".sb-enter{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.06em;",
    "  text-transform:uppercase;color:var(--grey,#9AA1A6);}",
    "@media (max-width:620px){.sb-enter{display:none;}}",

    ".sb-err{margin-top:18px;font-size:14.5px;line-height:1.5;color:#8a2b2b;}",

    /* Hunangsgildra: hvorki sýnileg né í flipa-röðinni. */
    ".sb-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0;}",

    ".sb-done{max-width:560px;}",
    ".sb-done .sb-q{margin-bottom:16px;}",
    ".sb-done p{font-size:16px;line-height:1.6;color:#2a2a2a;}",
    ".sb-tick{width:44px;height:44px;border-radius:50%;background:var(--navy,#0D4659);",
    "  color:var(--cream,#F3F0EA);display:grid;place-items:center;font-size:20px;margin-bottom:22px;}",

    ".sb-step{animation:sb-rise .38s cubic-bezier(.25,.7,.25,1) both;}",
    "@keyframes sb-rise{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}",
    "@media (prefers-reduced-motion:reduce){",
    "  .sb-sheet{transition:none;} .sb-step{animation:none;} .sb-next:hover{transform:none;}}",
  ].join("\n");

  /* ── Staða ──────────────────────────────────────────────────────────── */
  var data = { name: "", topics: [], domain: "", message: "", email: "", phone: "" };
  var idx = 0;
  var open = false;
  var sending = false;
  var root, sheet, body, marks, count;

  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }

  function build() {
    root = el("div", "sb-root");
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Hafa samband");

    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    sheet = el("div", "sb-sheet");

    var top = el("div", "sb-top");
    marks = el("div", "sb-marks");
    for (var i = 0; i < STEPS.length; i++) marks.appendChild(el("span", "sb-mark"));
    count = el("span", "sb-count");
    var x = el("button", "sb-x");
    x.setAttribute("aria-label", "Loka");
    x.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5l10 10M15 5L5 15"/></svg>';
    x.addEventListener("click", close);
    top.appendChild(marks);
    top.appendChild(count);
    top.appendChild(x);

    body = el("div", "sb-body");

    sheet.appendChild(top);
    sheet.appendChild(body);
    root.appendChild(sheet);
    document.body.appendChild(root);

    document.addEventListener("keydown", function (e) {
      if (!open) return;
      if (e.key === "Escape") close();
    });
  }

  function progress() {
    var m = marks.children;
    for (var i = 0; i < m.length; i++) {
      m[i].className =
        "sb-mark" + (i < idx ? " is-done" : i === idx ? " is-now" : "");
    }
    count.textContent = "Skref " + (idx + 1) + " af " + STEPS.length;
  }

  function valid(step) {
    if (!step.required) return true;
    if (step.type === "choice") return data.topics.length > 0;
    if (step.key === "email") return /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(data.email.trim());
    return String(data[step.key] || "").trim().length > 0;
  }

  function render() {
    var step = STEPS[idx];
    progress();
    body.innerHTML = "";

    var inner = el("div", "sb-inner sb-step");
    inner.appendChild(el("h2", "sb-q", step.q));
    if (step.hint) inner.appendChild(el("p", "sb-hint", step.hint));

    var first = null;

    if (step.type === "choice") {
      var wrap = el("div", "sb-choices");
      step.options.forEach(function (opt, i) {
        var b = el("button", "sb-choice");
        b.type = "button";
        b.appendChild(el("span", "n", String(i + 1)));
        b.appendChild(el("span", null, opt));
        if (data.topics.indexOf(opt) >= 0) b.classList.add("is-on");
        b.addEventListener("click", function () {
          var at = data.topics.indexOf(opt);
          if (at >= 0) data.topics.splice(at, 1);
          else data.topics.push(opt);
          b.classList.toggle("is-on");
          next.disabled = !valid(step);
        });
        wrap.appendChild(b);
      });
      inner.appendChild(wrap);
    } else {
      var f = el("label", "sb-field");
      var input =
        step.type === "textarea" ? document.createElement("textarea") : document.createElement("input");
      if (step.type !== "textarea") input.type = step.type === "email" ? "email" : "text";
      input.placeholder = step.placeholder || "";
      input.value = data[step.key] || "";
      input.setAttribute("aria-label", step.q);
      if (step.autocomplete) input.autocomplete = step.autocomplete;
      if (step.inputmode) input.inputMode = step.inputmode;
      if (step.type === "textarea") input.rows = 3;
      input.addEventListener("input", function () {
        data[step.key] = input.value;
        next.disabled = !valid(step);
      });
      input.addEventListener("keydown", function (e) {
        if (e.key !== "Enter") return;
        if (step.type === "textarea" && e.shiftKey) return;
        e.preventDefault();
        if (valid(step)) advance();
      });
      f.appendChild(input);
      inner.appendChild(f);
      first = input;

      if (step.extra) {
        var f2 = el("label", "sb-field");
        var i2 = document.createElement("input");
        i2.type = "text";
        i2.placeholder = step.extra.placeholder;
        i2.value = data[step.extra.key] || "";
        i2.setAttribute("aria-label", step.extra.placeholder);
        if (step.extra.autocomplete) i2.autocomplete = step.extra.autocomplete;
        i2.addEventListener("input", function () {
          data[step.extra.key] = i2.value;
        });
        i2.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            if (valid(step)) advance();
          }
        });
        f2.appendChild(i2);
        inner.appendChild(f2);
      }
    }

    var actions = el("div", "sb-actions");
    var next = el("button", "sb-next", idx === STEPS.length - 1 ? "Senda" : "Áfram");
    next.type = "button";
    next.disabled = !valid(step);
    next.addEventListener("click", function () {
      if (valid(step)) advance();
    });
    actions.appendChild(next);

    if (step.skip) {
      var skip = el("button", "sb-ghost", step.skip);
      skip.type = "button";
      skip.addEventListener("click", function () {
        data[step.key] = "";
        advance();
      });
      actions.appendChild(skip);
    }

    if (idx > 0) {
      var back = el("button", "sb-ghost", "Til baka");
      back.type = "button";
      back.addEventListener("click", function () {
        idx--;
        render();
      });
      actions.appendChild(back);
    }

    if (step.type !== "choice") {
      actions.appendChild(el("span", "sb-enter", "Enter"));
    }

    inner.appendChild(actions);

    var err = el("p", "sb-err");
    err.id = "sbErr";
    err.style.display = "none";
    inner.appendChild(err);

    // Hunangsgildran lifir í hverju skrefi — bot sem fyllir út allt fyllir
    // hana út líka, og manneskja sér hana aldrei.
    var hp = document.createElement("input");
    hp.className = "sb-hp";
    hp.tabIndex = -1;
    hp.setAttribute("aria-hidden", "true");
    hp.autocomplete = "off";
    hp.id = "sbHp";
    hp.value = data._hp || "";
    hp.addEventListener("input", function () {
      data._hp = hp.value;
    });
    inner.appendChild(hp);

    body.appendChild(inner);
    if (first) setTimeout(function () { first.focus(); }, 60);
  }

  function advance() {
    if (idx < STEPS.length - 1) {
      idx++;
      render();
      return;
    }
    send();
  }

  function fail(text) {
    var err = document.getElementById("sbErr");
    if (!err) return;
    err.textContent = text;
    err.style.display = "";
  }

  function send() {
    if (sending) return;
    sending = true;
    var next = body.querySelector(".sb-next");
    if (next) {
      next.disabled = true;
      next.textContent = "Sendi…";
    }

    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        topics: data.topics,
        domain: data.domain,
        website: data._hp || "",
      }),
    })
      .then(function (r) {
        return r.json().then(function (j) { return { http: r.status, data: j }; });
      })
      .then(function (res) {
        sending = false;
        if (res.data && res.data.ok) {
          if (typeof gtag === "function") gtag("event", "samband_sent");
          done();
          return;
        }
        if (next) {
          next.disabled = false;
          next.textContent = "Senda";
        }
        fail((res.data && res.data.error) || "Eitthvað fór úrskeiðis. Reyndu aftur eða sendu okkur línu á hallo@reytal.is.");
      })
      .catch(function () {
        sending = false;
        if (next) {
          next.disabled = false;
          next.textContent = "Senda";
        }
        fail("Við náðum ekki sambandi. Reyndu aftur eða sendu okkur línu á hallo@reytal.is.");
      });
  }

  function done() {
    for (var i = 0; i < marks.children.length; i++) {
      marks.children[i].className = "sb-mark is-done";
    }
    count.textContent = "Sent";
    body.innerHTML = "";

    var inner = el("div", "sb-inner sb-step sb-done");
    var tick = el("div", "sb-tick");
    tick.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 10.5l4 4 8-9"/></svg>';
    inner.appendChild(tick);
    inner.appendChild(el("h2", "sb-q", "Takk, " + (data.name.split(" ")[0] || "") + "."));
    inner.appendChild(
      el(
        "p",
        null,
        data.domain
          ? "Fyrirspurnin er komin til okkar og við erum þegar farin að skoða vefinn þinn. Þú heyrir frá okkur á " +
              data.email +
              " innan sólarhrings á virkum degi."
          : "Fyrirspurnin er komin til okkar. Þú heyrir frá okkur á " +
              data.email +
              " innan sólarhrings á virkum degi.",
      ),
    );

    var actions = el("div", "sb-actions");
    var b = el("button", "sb-next", "Loka");
    b.type = "button";
    b.addEventListener("click", close);
    actions.appendChild(b);
    inner.appendChild(actions);
    body.appendChild(inner);
  }

  /* ── Opna og loka ───────────────────────────────────────────────────── */
  function start(topic) {
    if (!root) build();
    // Ný lota: hreinsum allt nema það sem gestur valdi með hlekknum sem
    // hann smellti á.
    data = { name: "", topics: topic ? [topic] : [], domain: "", message: "", email: "", phone: "" };
    idx = 0;
    open = true;
    root.classList.add("is-open");
    document.body.style.overflow = "hidden";
    render();
    requestAnimationFrame(function () { root.classList.add("is-in"); });
  }

  function close() {
    if (!root) return;
    open = false;
    root.classList.remove("is-in");
    document.body.style.overflow = "";
    setTimeout(function () { root.classList.remove("is-open"); }, 300);
  }

  /* ── Tengingin við síðuna ───────────────────────────────────────────────
     Allt sem vísar á hallo@reytal.is opnar formið í staðinn. Efnið úr
     subject-hlutanum (t.d. "SEO") er notað til að merkja við réttan
     valkost, svo sá sem smellti á SEO-línuna þurfi ekki að segja það aftur. */
  var SUBJECT_MAP = {
    "vefþróun": "Nýr vefur",
    "vefuttekt": "Hraði og leitarvélar",
    "vefúttekt": "Hraði og leitarvélar",
    "hönnun": "Endurhönnun",
    "seo": "Hraði og leitarvélar",
    "hýsing og rekstur": "Viðhald og rekstur",
    "gervigreind og sjálfvirkni": "Gervigreind og sjálfvirkni",
  };

  function topicFrom(href) {
    var m = /[?&]subject=([^&]*)/i.exec(href || "");
    if (!m) return "";
    var subject = "";
    try {
      subject = decodeURIComponent(m[1].replace(/\+/g, " ")).toLowerCase();
    } catch (e) {
      return "";
    }
    return SUBJECT_MAP[subject] || "";
  }

  function wire() {
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a,button") : null;
      if (!a) return;

      // Beinar merkingar hafa forgang: data-samband="Nýr vefur"
      if (a.hasAttribute && a.hasAttribute("data-samband")) {
        e.preventDefault();
        start(a.getAttribute("data-samband") || "");
        return;
      }

      var href = a.getAttribute && a.getAttribute("href");
      // Vefurinn notar TVÖ netföng á sömu hnöppum (reytal.is og eldra
      // reykjavikdigital.is). Sýnilegi „Hafa samband" hnappurinn er á því
      // eldra — svo formið verður að grípa bæði, annars sleppur aðalhnappurinn.
      if (
        !href ||
        (href.indexOf("mailto:hallo@reytal.is") !== 0 &&
          href.indexOf("mailto:hallo@reykjavikdigital.is") !== 0)
      )
        return;
      // Meta/Ctrl-smellur og miðjusmellur fá að haga sér eins og venjulega.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      start(topicFrom(href));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wire);
  } else {
    wire();
  }

  // Opinbert viðmót ef þú vilt ræsa formið úr eigin kóða.
  window.reytalSamband = { open: start, close: close };
})();
