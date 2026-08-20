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
      // Nafn og netfang saman í fyrsta skrefi: hvort tveggja er nauðsynlegt
      // til að hægt sé að svara, svo það er engin ástæða til að dreifa því
      // á sitt hvorn endann á ferlinu.
      key: "name",
      type: "fields",
      q: "Hver ert þú?",
      hint: "Nafn og netfang, svo við vitum við hvern við erum að tala.",
      required: true,
      fields: [
        { key: "name",  type: "text",  placeholder: "Nafnið þitt", required: true, autocomplete: "name" },
        { key: "email", type: "email", placeholder: "nafn@mittfyrirtaeki.is", required: true, autocomplete: "email" },
      ],
    },
    {
      key: "topics",
      type: "choice",
      q: "Hvað getum við gert fyrir þig?",
      hint: "Veldu þjónustuþætti eða ýttu á tölurnar á lyklaborðinu",
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
      placeholder: "mittfyrirtaeki.is",
      skip: "Ég er ekki með vef",
      inputmode: "url",
      autocomplete: "url",
    },
    {
      key: "message",
      type: "textarea",
      q: "Segðu okkur aðeins meira",
      hint: "Ef þú ert með frekari upplýsingar sem þú vilt koma á framfæri, annars slepptu þessu.",
      placeholder: "Hvað stendur til?",
      skip: "Sleppa",
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
    ".sb-top{display:flex;align-items:center;padding:22px clamp(20px,4vw,44px);}",
    /* Framvindan situr neðst og miðjusett - strikin fyrst, teljarinn undir. */
    ".sb-foot{display:flex;flex-direction:column;align-items:center;gap:12px;",
    "  padding:0 clamp(20px,4vw,44px) clamp(26px,4vh,40px);}",
    ".sb-marks{display:flex;gap:6px;width:100%;max-width:340px;}",
    ".sb-mark{height:3px;flex:1;border-radius:999px;background:rgba(11,12,13,0.14);",
    "  transition:background .35s ease;}",
    ".sb-mark.is-done{background:var(--navy,#0D4659);}",
    ".sb-mark.is-now{background:var(--slate,#4C7C93);}",
    ".sb-count{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.08em;",
    "  text-transform:uppercase;color:var(--slate,#4C7C93);white-space:nowrap;}",
    ".sb-x{margin-left:auto;background:none;border:none;cursor:pointer;padding:8px;",
    "  line-height:0;color:var(--black,#0B0C0D);opacity:.55;transition:opacity .25s ease;}",
    ".sb-x:hover{opacity:1;}",

    ".sb-body{flex:1;display:flex;align-items:center;overflow-y:auto;}",
    /* minna botn-padding en áður: framvindan situr núna í sínum eigin fæti
       fyrir neðan, svo innihaldið þarf ekki lengur að taka frá pláss */
    ".sb-inner{width:100%;max-width:660px;margin:0 auto;padding:0 clamp(20px,5vw,44px) clamp(16px,2.5vh,32px);}",

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
    /* Lyklaborðsvísbending: takkinn teiknaður sem takki, merkingin við hlið.
       Þetta er eina leiðin til að vita að Enter og Esc geri eitthvað - án
       hennar er ferlið jafn nothæft en enginn kemst að því. */
    ".sb-keys{display:flex;align-items:center;gap:16px;margin-left:auto;}",
    ".sb-key{display:inline-flex;align-items:center;gap:7px;",
    "  font-family:'DM Mono',monospace;font-size:11px;letter-spacing:0.06em;",
    "  text-transform:uppercase;color:var(--slate,#4C7C93);white-space:nowrap;}",
    ".sb-key kbd{font-family:'DM Mono',monospace;font-size:10.5px;line-height:1;",
    "  border:1px solid rgba(11,12,13,0.22);border-radius:5px;padding:5px 7px;",
    "  background:rgba(255,255,255,0.5);color:var(--black,#0B0C0D);}",
    /* Á litlum skjá er lyklaborðið hvort eð er ekki til staðar. */
    "@media (max-width:620px){.sb-keys{display:none;}}",

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
  // satt eftir að fyrirspurn hefur verið send: þá er ekkert skref til baka
  var sent = false;
  var root, sheet, body, marks, count;
  // lyklaborðsstýring valkosta-skrefsins; hangir á document og VERÐUR að
  // fjarlægjast þegar skipt er um skref, annars safnast hlustarar upp
  var keyHandler = null;

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

    // Efst situr aðeins lokunarhnappurinn. Framvindan (strikin + teljarinn)
    // færðist neðst og miðjusett: hún er staðfesting, ekki fyrirsögn, og á
    // ekki að keppa við spurninguna sem verið er að svara.
    var top = el("div", "sb-top");
    var x = el("button", "sb-x");
    x.setAttribute("aria-label", "Loka");
    x.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 5l10 10M15 5L5 15"/></svg>';
    x.addEventListener("click", close);
    top.appendChild(x);

    body = el("div", "sb-body");

    var foot = el("div", "sb-foot");
    marks = el("div", "sb-marks");
    for (var i = 0; i < STEPS.length; i++) marks.appendChild(el("span", "sb-mark"));
    count = el("span", "sb-count");
    foot.appendChild(marks);
    foot.appendChild(count);

    sheet.appendChild(top);
    sheet.appendChild(body);
    sheet.appendChild(foot);
    root.appendChild(sheet);
    document.body.appendChild(root);

    // ESC bakkar eitt skref í einu og lokar fyrst þegar lengra verður ekki
    // farið til baka. Þannig er alltaf hægt að komast út með því að halda
    // áfram að ýta - Escape þýðir enn "út", það tekur bara fleiri en eitt
    // högg. Eftir sendingu er ekkert til baka, þá lokar hann strax.
    document.addEventListener("keydown", function (e) {
      if (!open || e.key !== "Escape") return;
      e.preventDefault();
      if (sent || idx === 0) { close(); return; }
      idx--;
      render();
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

  var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;

  function validField(f) {
    if (!f.required) return true;
    var v = String(data[f.key] || "").trim();
    if (f.type === "email") return EMAIL_RE.test(v);
    return v.length > 0;
  }

  function valid(step) {
    if (step.type === "choice") return !step.required || data.topics.length > 0;
    // fjölreita-skref gildir aðeins ef ALLIR skyldureitir standast
    if (step.type === "fields") return step.fields.every(validField);
    if (!step.required) return true;
    if (step.type === "email") return EMAIL_RE.test(String(data[step.key] || "").trim());
    return String(data[step.key] || "").trim().length > 0;
  }

  function detachKeys() {
    if (!keyHandler) return;
    document.removeEventListener("keydown", keyHandler);
    keyHandler = null;
  }

  function render() {
    var step = STEPS[idx];
    detachKeys();          // fyrra skref má ekki halda lyklaborðinu
    progress();
    body.innerHTML = "";

    var inner = el("div", "sb-inner sb-step");
    inner.appendChild(el("h2", "sb-q", step.q));
    if (step.hint) inner.appendChild(el("p", "sb-hint", step.hint));

    var first = null;

    if (step.type === "choice") {
      var wrap = el("div", "sb-choices");
      var buttons = [];
      function toggle(i) {
        var opt = step.options[i];
        var b = buttons[i];
        if (!b) return;
        var at = data.topics.indexOf(opt);
        if (at >= 0) data.topics.splice(at, 1);
        else data.topics.push(opt);
        b.classList.toggle("is-on");
        next.disabled = !valid(step);
      }
      step.options.forEach(function (opt, i) {
        var b = el("button", "sb-choice");
        b.type = "button";
        b.appendChild(el("span", "n", String(i + 1)));
        b.appendChild(el("span", null, opt));
        if (data.topics.indexOf(opt) >= 0) b.classList.add("is-on");
        b.setAttribute("aria-pressed", data.topics.indexOf(opt) >= 0 ? "true" : "false");
        b.addEventListener("click", function () {
          toggle(i);
          b.setAttribute("aria-pressed", b.classList.contains("is-on") ? "true" : "false");
        });
        buttons.push(b);
        wrap.appendChild(b);
      });
      inner.appendChild(wrap);

      // Tölurnar á valkostunum eru ekki bara skraut: 1-9 velja og afvelja.
      // Hlustarinn hangir á document (valkostirnir eru hnappar, svo það er
      // enginn einn reitur sem heldur fókus) og er tekinn af um leið og
      // skipt er um skref - sjá keyHandler-hreinsunina efst í render().
      keyHandler = function (e) {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        var t = e.target;
        // ekki grípa innslátt í reit
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;

        // Enter heldur ferlinu gangandi: þetta er eina skrefið án textareits,
        // svo án þessa slitnaði lyklaborðsleiðin hér og notandinn þurfti mús.
        if (e.key === "Enter") {
          if (!valid(step)) return;
          e.preventDefault();
          advance();
          return;
        }

        var n = parseInt(e.key, 10);
        if (isNaN(n) || n < 1 || n > step.options.length) return;
        e.preventDefault();
        toggle(n - 1);
        var b = buttons[n - 1];
        if (b) b.setAttribute("aria-pressed", b.classList.contains("is-on") ? "true" : "false");
      };
      document.addEventListener("keydown", keyHandler);
    } else if (step.type === "fields") {
      // Nokkrir reitir í einu skrefi. Enter fer í næsta reit sem er tómur,
      // eða áfram ef allt stenst - það er hraðara en að þvinga tab.
      var inputs = [];
      step.fields.forEach(function (fd) {
        var lab = el("label", "sb-field");
        var inp = document.createElement("input");
        inp.type = fd.type === "email" ? "email" : fd.type === "tel" ? "tel" : "text";
        inp.placeholder = fd.placeholder || "";
        inp.value = data[fd.key] || "";
        inp.setAttribute("aria-label", fd.placeholder || fd.key);
        if (fd.autocomplete) inp.autocomplete = fd.autocomplete;
        if (fd.required) inp.required = true;
        inp.addEventListener("input", function () {
          data[fd.key] = inp.value;
          next.disabled = !valid(step);
        });
        inp.addEventListener("keydown", function (e) {
          if (e.key !== "Enter") return;
          e.preventDefault();
          if (valid(step)) { advance(); return; }
          for (var k = 0; k < inputs.length; k++) {
            if (!validField(inputs[k].fd)) { inputs[k].inp.focus(); break; }
          }
        });
        lab.appendChild(inp);
        inner.appendChild(lab);
        inputs.push({ inp: inp, fd: fd });
      });
      first = inputs.length ? inputs[0].inp : null;
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

    // Lyklaborðsvísbendingin. Merkingin er breytileg eftir skrefi: á síðasta
    // skrefi sendir Enter (ekki "áfram"), og á því fyrsta lokar Esc (það er
    // ekkert skref til baka). Röng merking væri verri en engin.
    function keyHint(label, meaning) {
      var s = el("span", "sb-key");
      var k = document.createElement("kbd");
      k.textContent = label;
      s.appendChild(k);
      s.appendChild(el("span", null, meaning));
      return s;
    }
    var keys = el("div", "sb-keys");
    keys.appendChild(keyHint("Enter", idx === STEPS.length - 1 ? "senda" : "áfram"));
    keys.appendChild(keyHint("Esc", idx > 0 ? "til baka" : "loka"));
    actions.appendChild(keys);

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
    sent = true;
    detachKeys();
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
          ? "Fyrirspurnin er komin til okkar og við erum þegar farin að skoða vefinn þinn. Þú heyrir í okkur innan skamms."
          : "Fyrirspurnin er komin til okkar. Þú heyrir í okkur innan skamms.",
      ),
    );

    var actions = el("div", "sb-actions");
    var b = el("button", "sb-next", "Loka");
    b.type = "button";
    b.addEventListener("click", close);
    actions.appendChild(b);
    inner.appendChild(actions);
    body.appendChild(inner);
    // Fókus á lokahnappinn svo Enter loki forminu - lokahlekkurinn í
    // lyklaborðsleiðinni, annars sæti notandinn fastur á takkskjánum.
    setTimeout(function () { b.focus(); }, 60);
  }

  /* ── Opna og loka ───────────────────────────────────────────────────── */
  function start(topic) {
    if (!root) build();
    // Ný lota: hreinsum allt nema það sem gestur valdi með hlekknum sem
    // hann smellti á.
    data = { name: "", topics: topic ? [topic] : [], domain: "", message: "", email: "", phone: "" };
    idx = 0;
    sent = false;
    open = true;
    root.classList.add("is-open");
    document.body.style.overflow = "hidden";
    render();
    requestAnimationFrame(function () { root.classList.add("is-in"); });
  }

  function close() {
    if (!root) return;
    open = false;
    detachKeys();          // annars grípa tölutakkar áfram eftir lokun
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
