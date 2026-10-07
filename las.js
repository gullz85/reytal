/* ═══════════════════════════════════════════════════════════════════
   LÆS: tímabundin læsing á vefnum á meðan hann er í vinnslu.

   Sett á hverja síðu með EINNI línu, EFST í <head> (á undan stílum):
       <script src="las.js?v=1"></script>
   (í /thjonusta/<slóð>/index.html er slóðin ../../las.js?v=1)

   Hvað gerist: skráin bætir klasa á <html> strax og felur síðuna áður en
   nokkuð teiknast, byggir svo læsiskjá með lykilorðsreit. Rétt lykilorð
   geymist í localStorage, svo það þarf aðeins að slá það inn einu sinni
   í hverjum vafra.

   LYKILORÐ: geymt sem SHA-256, ekki í berum texta. Til að skipta um:
       echo -n "nytt-ord" | shasum -a 256
   og líma útkomuna í HASH hér að neðan.

   ÞEGAR VEFURINN FER Í LOFTIÐ:
     1. fjarlægja <script src="las.js"> línuna úr síðunum (eða eyða skránni),
     2. setja robots.txt aftur í fyrra horf (sjá athugasemd þar).

   TAKMÖRK: þetta heldur gestum frá, en efnið er áfram í HTML-inu og sést
   í "view source" hjá þeim sem leitar að því. Fyrir raunverulega vörn
   þarf læsingu hjá hýsingaraðilanum (Cloudflare Access eða lykilorð
   á Netlify), sem er stillt í þeirra viðmóti, ekki í þessari skrá.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var HASH = "6236633c893491de76201bcdd924cf6227ecb5b788a10fdd63ca604fd31911e3"; // reytal2026
  var KEY = "reytal-opid";

  // Þegar skráin keyrir er <body> ekki til ennþá, svo klasinn fer á <html>
  // og felur allt þar til læsiskjárinn er tilbúinn. Þannig blikkar efnið
  // aldrei á skjánum áður en það er falið.
  var root = document.documentElement;
  try {
    if (localStorage.getItem(KEY) === "1") return;      // þegar opnað í þessum vafra
  } catch (e) {}

  root.className += " las";

  var css =
    "html.las body{visibility:hidden !important;}" +
    "html.las{overflow:hidden;}" +
    ".las-screen{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;visibility:visible;" +
    "background:#F3F0EA;color:#0B0C0D;font-family:'DM Sans',system-ui,sans-serif;padding:24px;}" +
    ".las-box{width:min(360px,100%);display:flex;flex-direction:column;gap:14px;}" +
    ".las-box p{font-size:15.5px;line-height:1.55;color:#2a2a2a;margin:0;}" +
    ".las-box input{width:100%;min-height:52px;padding:14px 20px;font-family:inherit;font-size:16px;color:#0B0C0D;" +
    "background:rgba(255,255,255,.6);border:1px solid rgba(11,12,13,.22);border-radius:999px;}" +
    ".las-box input:focus{outline:none;border-color:#0D4659;box-shadow:0 0 0 4px rgba(13,70,89,.1);}" +
    ".las-box button{min-height:52px;border:0;border-radius:999px;cursor:pointer;background:#0B0C0D;color:#F3F0EA;" +
    "font-family:'DM Mono',monospace;font-size:13px;letter-spacing:.06em;text-transform:uppercase;font-weight:600;}" +
    ".las-box button:hover{background:#0D4659;}" +
    ".las-box .e{min-height:20px;font-size:14px;color:#8a2b2b;margin:0;}";

  var style = document.createElement("style");
  style.textContent = css;
  (document.head || root).appendChild(style);

  function show() {
    var wrap = document.createElement("div");
    wrap.className = "las-screen";
    wrap.innerHTML =
      '<form class="las-box">' +
        "<p>Vefurinn er í vinnslu. Sláðu inn lykilorðið til að skoða hann.</p>" +
        '<input type="password" autocomplete="current-password" placeholder="Lykilorð" aria-label="Lykilorð">' +
        "<button type=\"submit\">Opna</button>" +
        '<p class="e"></p>' +
      "</form>";
    document.body.appendChild(wrap);

    var form = wrap.querySelector("form");
    var input = wrap.querySelector("input");
    var err = wrap.querySelector(".e");
    input.focus();

    function open_() {
      try { localStorage.setItem(KEY, "1"); } catch (e) {}
      root.className = root.className.replace(/\blas\b/, "");
      wrap.remove();
    }

    function sha256(text) {
      return crypto.subtle
        .digest("SHA-256", new TextEncoder().encode(text))
        .then(function (buf) {
          return [].map
            .call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); })
            .join("");
        });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      err.textContent = "";
      // crypto.subtle er aðeins til yfir https og á localhost. Sé hún ekki til
      // (t.d. skrá opnuð beint af diski) opnum við frekar en að loka okkur úti.
      if (!(window.crypto && crypto.subtle)) { open_(); return; }
      sha256(input.value.trim()).then(function (h) {
        if (h === HASH) open_();
        else { err.textContent = "Rangt lykilorð."; input.select(); }
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", show);
  else show();
})();
