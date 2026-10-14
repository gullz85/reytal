// Efnissíður í 8 bitum: þjónusta, undirsíður hennar, um okkur, vefúttekt o.fl.
// Enginn leikur hér, bara efnið sjálft í 8-bita búningi. Allt er lesið úr
// venjulegu síðunni og sett í NES-kassa:
//   .page-hero          → borði + titill + inngangur
//   .work-row           → kort (með hlekk ef línan er hlekkur)
//   article.person      → pixlaðar myndir af teyminu
//   .cta-box            → kassi með tökkum
//   annað               → fyrirsagnir, málsgreinar og listar
import { P, Pixmap } from "../pixel.js";
import * as S from "../sprites.js";

const SVIDSMYND = { thjonusta: "hus", "um-okkur": "kirkja", vefuttekt: "viti" };
const TAKN_ORDA = [
  [/vef|kerfi|forrit|bakend|api/i, "kodi"], [/netversl|greiðsl|kaup/i, "karfa"], [/hönnun|vörumerki|ux|ui|ásýnd/i, "penni"],
  [/seo|leit|sýnileik|greining/i, "leit"], [/hýsing|rekstur|umsjón|öryggi|afrit/i, "thjonn"], [/gervigreind|ai|sjálfvirk/i, "neisti"],
  [/úttekt|mæl|hraði|tölur/i, "ritill"], [/samband|póst/i, "bref"],
];
const taknFyrir = (t) => (TAKN_ORDA.find(([r]) => r.test(t)) || [, "hnottur"])[1];

// Kyrr pixlaborði: himinn, jörð, eitt hús og Dropi sem stendur hjá
function bordi(slod) {
  const lykill = Object.keys(SVIDSMYND).find((k) => slod.includes(k));
  const w = 640, h = 96, m = w >> 1, pm = new Pixmap(w, h).rect(0, 0, w, h, P.himinn);
  pm.teikna(S.esja(w, 40), 0, h - 56);
  [[m - 250, 18, 32], [m - 126, 12, 32], [m + 70, 20, 64], [m + 220, 10, 32]].forEach(([x, y, b]) => pm.teikna(S.sky(b), x, y));
  for (let x = 0; x < w; x += 16) pm.teikna(S.jord(true), x, h - 16);
  const hlutur = lykill === "um-okkur" ? S.kirkja(66, 80) : lykill === "vefuttekt" ? S.viti(24, 70) : S.hus(P.rautt, "#A81C00", P.grarDD, 56, 50);
  pm.teikna(hlutur, m + 36 - (hlutur.w >> 1), h - 16 - hlutur.h);
  pm.teikna(S.runni(), m - 110, h - 28).teikna(S.runni(), m + 180, h - 28).teikna(S.dropi("kyrr", -1), m + 76, h - 32);
  return pm;
}

// Ljósmynd → pixlamynd: minnkuð í 28×28 og litum fækkað
function pixla(img, n = 28) {
  return new Promise((buid) => {
    const fara = () => {
      try {
        const c = document.createElement("canvas"); c.width = c.height = n;
        const x = c.getContext("2d"), s = Math.min(img.naturalWidth, img.naturalHeight);
        x.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 3, s, s, 0, 0, n, n);
        const d = x.getImageData(0, 0, n, n);
        for (let i = 0; i < d.data.length; i += 4) {
          const g = 0.3 * d.data[i] + 0.59 * d.data[i + 1] + 0.11 * d.data[i + 2], k = Math.round(g / 51) / 5;    // 6 tónar
          d.data[i] = 11 + k * 232; d.data[i + 1] = 28 + k * 212; d.data[i + 2] = 40 + k * 194;                  // navy → krem
        }
        x.putImageData(d, 0, 0);
        buid(c.toDataURL());
      } catch { buid(null); }
    };
    if (img.complete && img.naturalWidth) fara();
    else { img.addEventListener("load", fara, { once: true }); img.addEventListener("error", () => buid(null), { once: true }); }
  });
}

const synilegt = (el) => el && !el.closest("form, svg, .sr-only, [aria-hidden='true'], .va-mock, .va-status, nav, header") && el.textContent.trim();

export function smida(main, api) {
  const slod = location.pathname;

  // ── Hetjan ──
  const hetja = document.querySelector(".page-hero") || document.body;
  const bak = hetja.querySelector("a.back");
  const k = document.createElement("section");
  k.className = "r8-efnishaus";
  k.innerHTML = `<div class="r8-bordi"><img src="${bordi(slod).slod()}" alt=""></div>
    <div class="r8-efnishaus-texti">
      ${bak ? `<p><a href="${bak.getAttribute("href")}">${api.lesa(bak)}</a></p>` : `<p class="r8-yfirskrift">Heimur ${document.documentElement.dataset.r8Heimur}</p>`}
      <h1>${api.lesa(hetja.querySelector("h1"), document.title.split(" - ")[0])}</h1>
      ${hetja.querySelector(".lede") ? `<p class="r8-inngangur">${api.lesa(hetja.querySelector(".lede"))}</p>` : ""}
    </div>`;
  main.appendChild(k);

  // Vefúttektin: lénið sent beint á alvöru síðuna, þar fer greiningin af stað
  if (document.getElementById("vaForm")) {
    const f = document.createElement("form");
    f.className = "r8-uttektarform";
    f.innerHTML = `<label for="r8-len">Vefslóð</label><div><input id="r8-len" type="text" inputmode="url" autocomplete="url" autocapitalize="off" spellcheck="false" placeholder="vefurinn.is" required>
      <button type="submit" class="r8-takki">Skoða vefinn</button></div><p class="r8-smatt">Úttektin opnast á venjulega vefnum.</p>`;
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      const len = f.querySelector("input").value.trim();
      if (len) api.ut("/vefuttekt?domain=" + encodeURIComponent(len));
    });
    k.querySelector(".r8-efnishaus-texti").appendChild(f);
  }

  // ── Kaflarnir ──
  const kaflar = [...document.querySelectorAll(".site > section, body > section, main > section, .site > .top ~ section")]
    .filter((s, i, a) => a.indexOf(s) === i && !s.classList.contains("page-hero") && !s.closest(".page-hero"));
  for (const s of kaflar) {
    const haus = s.querySelector(".section-head");
    const yfir = haus?.querySelector(".eyebrow") ? api.lesa(haus.querySelector(".eyebrow")) : "";
    const h2 = s.querySelector("h2");
    const titill = h2 && synilegt(h2) ? api.lesa(h2) : "";

    const radir = [...s.querySelectorAll(".work-row")];
    const folk = [...s.querySelectorAll("article.person")];
    const cta = s.querySelector(".cta-box");

    if (radir.length) {
      const box = api.kassi(main, { yfirskrift: yfir, titill, html: '<ul class="r8-kort"></ul>' });
      const ul = box.querySelector("ul");
      for (const r of radir) {
        const nafn = api.lesa(r.querySelector("h3")), lysing = api.lesa(r.querySelector("p")), merki = [...r.querySelectorAll(".work-tag")].map((t) => api.lesa(t));
        const li = document.createElement("li");
        const href = r.tagName === "A" ? r.getAttribute("href") : "";
        li.innerHTML = `${href ? `<a href="${href}"${r.target === "_blank" ? ' target="_blank" rel="noopener"' : ""}>` : "<div>"}
          <img src="${api.takn(taknFyrir(nafn + " " + merki.join(" ")), P.gull, 3).slod()}" alt="">
          <b>${nafn}${href ? " →" : ""}</b><span>${lysing}</span>
          ${merki.length ? `<small>${merki.join(" · ")}</small>` : ""}${href ? "</a>" : "</div>"}`;
        ul.appendChild(li);
      }
    } else if (folk.length) {
      const box = api.kassi(main, { yfirskrift: yfir || "Teymið", titill, html: '<ul class="r8-teymi"></ul>' });
      const ul = box.querySelector("ul");
      for (const p of folk) {
        const li = document.createElement("li");
        li.innerHTML = `<span class="r8-mynd"><img src="${S.dropi("kyrr", 1).slod(2)}" alt=""></span><b>${api.lesa(p.querySelector("h3"))}</b><small>${api.lesa(p.querySelector(".role"))}</small>`;
        ul.appendChild(li);
        const img = p.querySelector("img");
        if (img) pixla(img).then((u) => { if (u) li.querySelector("img").src = u; });
      }
    } else if (cta) {
      const takkar = [...cta.querySelectorAll("a.btn-primary, a.btn, a.btn-secondary")];
      api.kassi(main, {
        tegund: "r8-cta",
        titill: api.lesa(cta.querySelector("h2")),
        html: `<div class="r8-takkar">${takkar.map((a) => `<a class="r8-takki" href="${a.getAttribute("href")}">${api.lesa(a.querySelector(".btn-label") || a)}</a>`).join("")}</div>`,
      });
    } else {
      // almennt efni: h3, málsgreinar og listar sem sjást á síðunni
      const hlutar = [...s.querySelectorAll("h3, p, li")].filter((el) => synilegt(el) && !el.closest(".section-head") && !(el.tagName !== "LI" && el.closest("li")));
      const html = hlutar.slice(0, 24).map((el) => {
        const t = api.lesa(el);
        if (!t || t.length < 2) return "";
        if (el.tagName === "H3") return `<h3>${t}</h3>`;
        if (el.tagName === "LI") return `<p class="r8-punktur">▸ ${t}</p>`;
        return `<p>${t}</p>`;
      }).filter(Boolean).join("");
      if (!titill && !html) continue;
      // hlekkir og takkar kaflans (ekki þeir sem eru inni í listum eða kortum)
      const hlekkir = [...s.querySelectorAll("a[href]")].filter((a) => synilegt(a) && !a.closest("li, .work-row, p")).slice(0, 3);
      const takkar = hlekkir.map((a) => `<a class="r8-takki${a.matches(".btn-primary") ? "" : " aukalegur"}" href="${a.getAttribute("href")}"${a.target === "_blank" ? ' target="_blank" rel="noopener"' : ""}>${api.lesa(a.querySelector(".btn-label") || a)}</a>`).join("");
      api.kassi(main, { yfirskrift: yfir, titill, html: `<div class="r8-almennt">${html}</div>${takkar ? `<div class="r8-takkar">${takkar}</div>` : ""}` });
    }
  }

  api.fotur(main, {});
}
