// Hamurinn: kveikir og slekkur á 8-bita heiminum og heldur utan um það sem er
// sameiginlegt öllum síðum (stjórnborð, gluggar, hylki, fótur, ferjuferðir).
// Hver síða á sinn heim í worlds/ sem les efnið úr venjulegu síðunni.
import * as T from "./transition.js";
import { spila, thogn, setjaThogn } from "./audio.js";
import { setjaHam, bitar, BAETI, allirBitar, finnaBita } from "./astand.js";
import { merki, P, Pixmap } from "./pixel.js";
import { takn, jord, mursteinn, steinar, ferja, verdlaunabikar, slembi, dropi } from "./sprites.js";
import { Leikvollur, mynd } from "./leikur.js";

const rot = document.documentElement;
const GRUNNUR = new URL(".", import.meta.url).href;

// ── Heimarnir: slóð → borð ─────────────────────────────────────────────────
export const HEIMAR = [
  { slod: /^\/(index(\.html)?)?$/, nr: "1-1", nafn: "Reykjavík", titill: "Heim", href: "/", saekja: () => import("./worlds/reykjavik.js") },
  { slod: /^\/verkefni(\.html)?\/?$/, nr: "1-2", nafn: "Tallinn", titill: "Verkefni", href: "/verkefni", saekja: () => import("./worlds/tallinn.js") },
];
// Efnissíðurnar: enginn leikur, bara efnið í 8 bitum (worlds/efni.js)
const efni = () => import("./worlds/efni.js");
HEIMAR.push(
  { slod: /^\/thjonusta(\.html)?\/?$/, nr: "2-1", nafn: "Þjónusta", href: "/thjonusta", saekja: efni },
  ...[["vefthroun", "Vefþróun"], ["honnun", "Hönnun"], ["seo", "Leitarvélabestun"], ["hysing", "Hýsing"], ["gervigreind", "Gervigreind"]].map(([s, n], i) =>
    ({ slod: new RegExp(`^/thjonusta/${s}/?`), nr: `2-${i + 2}`, nafn: n, href: `/thjonusta/${s}/`, saekja: efni })),
  { slod: /^\/um-okkur(\.html)?\/?$/, nr: "3-1", nafn: "Um okkur", href: "/um-okkur", saekja: efni },
  { slod: /^\/vefuttekt(\.html)?\/?$/, nr: "4-1", nafn: "Vefúttekt", href: "/vefuttekt", saekja: efni },
  { slod: /^\/islenski-vefurinn(\.html)?\/?$/, nr: "4-2", nafn: "Íslenski vefurinn", href: "/islenski-vefurinn", saekja: efni },
);
const SMIDI = { nr: "?-?", nafn: "Í smíðum", saekja: () => import("./worlds/smidi.js") };
const VALMYND = [
  ["Heim", "/", "1-1"], ["Þjónusta", "/thjonusta", "2-1"], ["Verkefni", "/verkefni", "1-2"], ["Vefúttekt", "/vefuttekt", "4-1"], ["Um okkur", "/um-okkur", "3-1"],
];
export const heimurFyrir = (slod) => HEIMAR.find((h) => h.slod.test(slod)) || { ...SMIDI, href: slod };

let skel = null, heimur = null, eining = null, leikvellir = [], fjolmidlar = [];

// ── Undirbúningur: stílar, letur og heimurinn sóttur á meðan skjárinn glitchar ──
let stilar = null;
function hladaStilum() {
  if (stilar) return stilar;
  stilar = new Promise((buid) => {
    const l = document.createElement("link");
    l.rel = "stylesheet"; l.href = GRUNNUR + "style.css"; l.id = "r8-stilar";
    l.onload = l.onerror = buid;
    document.head.appendChild(l);
    const f = document.createElement("link");
    f.rel = "stylesheet"; f.href = "https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&family=Pixelify+Sans:wght@400;500;700&display=swap";
    document.head.appendChild(f);
  }).then(() => Promise.race([
    Promise.all([document.fonts.load('16px "Silkscreen"', "REYTAL ÞÆÖÍ"), document.fonts.load('700 16px "Silkscreen"', "REYTAL ÞÆÖÍ"), document.fonts.load('18px "Pixelify Sans"', "Þjónusta")]),
    new Promise((r) => setTimeout(r, 1800)),
  ])).catch(() => {});
  return stilar;
}
async function undirbua() {
  heimur = heimurFyrir(location.pathname);
  const [m] = await Promise.all([heimur.saekja(), hladaStilum()]);
  eining = m;
  return heimur;
}

const spjaldHtml = (h) =>
  `<img class="r8-spjald-merki" src="${merki(P.hvitt, 4).slod()}" alt="">` +
  `<p class="r8-spjald-heimur">Heimur ${h.nr}</p><p class="r8-spjald-nafn">${h.nafn}</p>` +
  `<p class="r8-spjald-lif"><img src="${dropiMynd(allirBitar()).slod()}" alt=""> × 1</p>`;
// Dropi í tvöfaldri stærð fyrir borðspjaldið
function dropiMynd(gull) {
  const d = dropi("kyrr", 1, gull), s = new Pixmap(32, 32);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const k = d.get(x, y); if (k) s.rect(x * 2, y * 2, 2, 2, [...k]); }
  return s;
}

// ── Kveikja: öll umbreytingin ─────────────────────────────────────────────
export async function kveikja(uppruni) {
  if (rot.classList.contains("r8-a") || rot.classList.contains("r8-skipti")) return;
  rot.classList.add("r8-skipti");
  spila("kveikja");
  const [h] = await Promise.all([undirbua(), T.glitch(560)]);
  await T.upplausn(uppruni);
  const spj = T.spjald(spjaldHtml(h), 1500);
  smida();
  await spj;
  setjaHam("8bit");
  await T.uppbygging({ ms: 950 });
  rot.classList.remove("r8-skipti");
  if (!sessionStorage.getItem("r8-kynnt")) { sessionStorage.setItem("r8-kynnt", "1"); setTimeout(() => skilabod("Velkomin á hina hliðina. ◄ 2026 færir þig til baka."), 500); }
}

// Ræsing þegar hamurinn var virkur á fyrri síðu
export async function raesa() {
  rot.classList.add("r8-skipti");
  T.yfirlag();
  const h = await undirbua();
  smida();
  rot.classList.remove("r8-raesing");
  const kom = sessionStorage.getItem("r8-ferja");
  sessionStorage.removeItem("r8-ferja");
  if (!kom) await T.spjald(spjaldHtml(h), 900);
  else spila("inn");
  await T.uppbygging({ ms: 800 });
  rot.classList.remove("r8-skipti");
}

// ── Slökkva: aftur í 2026 ──────────────────────────────────────────────────
export async function slokkva() {
  if (!skel || rot.classList.contains("r8-skipti")) return;
  rot.classList.add("r8-skipti");
  spila("slokkva");
  await T.upplausn({ x: innerWidth - 60, y: 28 }, { ms: 650, litir: [P.himinn, P.gras, P.mold, P.gull, P.navy] });
  const spj = T.spjald('<p class="r8-spjald-heimur">Til baka í</p><p class="r8-spjald-nafn">2026</p>', 800);
  rifa();
  setjaHam(null);
  await spj;
  await T.afhjupa();
  rot.classList.remove("r8-skipti");
}

// ── Út úr hamnum og beint á venjulega síðu (t.d. vefúttekt með léni) ──────
export async function ut(href) {
  rot.classList.add("r8-skipti");
  spila("slokkva");
  await T.upplausn(null, { ms: 520, litir: [P.himinn, P.gras, P.mold, P.gull, P.navy] });
  setjaHam(null);
  await T.spjald('<p class="r8-spjald-heimur">Til baka í</p><p class="r8-spjald-nafn">2026</p>', 650);
  location.href = href;
}

// ── Ferð milli síðna innan 8-bita hamsins ─────────────────────────────────
export async function fara(href) {
  const url = new URL(href, location.href);
  if (url.pathname === location.pathname) { if (url.hash) skel.querySelector(url.hash)?.scrollIntoView({ behavior: "smooth" }); return; }
  const h = heimurFyrir(url.pathname);
  rot.classList.add("r8-skipti");
  spila("ferja");
  await T.upplausn(null, { ms: 520, litir: [P.himinn, P.navy, P.gler, P.hvitt] });
  const fra = heimur?.nafn || "";
  await T.spjald(
    `<p class="r8-spjald-heimur">Heimur ${h.nr}</p><p class="r8-spjald-nafn">${h.nafn}</p>` +
    `<div class="r8-sigling" aria-hidden="true"><span class="r8-hofn">${fra}</span><img src="${ferja().slod(2)}" alt=""><span class="r8-hofn">${h.nafn}</span></div>`, 1500);
  sessionStorage.setItem("r8-ferja", "1");
  location.href = url.href;
}

// ── Grindin: stjórnborð + efni heimsins ───────────────────────────────────
function smida() {
  if (skel) return;
  // nútímavefurinn hverfur á bak við (inert = ekki hægt að tabba þangað)
  [...document.body.children].forEach((el) => { if (!el.classList.contains("r8-yfir")) { el.dataset.r8Inert = el.inert ? "1" : ""; el.inert = true; } });
  fjolmidlar = [...document.querySelectorAll("video")].filter((v) => !v.paused);
  fjolmidlar.forEach((v) => v.pause());
  rot.classList.add("r8-a");
  rot.dataset.r8Heimur = heimur.nr;

  skel = document.createElement("div");
  skel.id = "r8";
  skel.className = "r8";
  skel.lang = "is";
  const bitaHolf = BAETI.map((_, i) => `<i data-n="${i}"></i>`).join("");
  skel.innerHTML = `
    <a class="r8-hoppa" href="#r8-efni">Beint í efnið</a>
    <header class="r8-bord">
      <a class="r8-bord-merki" href="/" aria-label="REYTAL, heimur 1-1"><img src="${merki(P.hvitt, 2).slod()}" alt="REYTAL"></a>
      <span class="r8-bord-heimur" aria-hidden="true">Heimur<b>${heimur.nr}</b></span>
      <nav class="r8-valmynd" id="r8-valmynd" aria-label="Aðalvalmynd">
        <ul>${VALMYND.map(([t, s, nr]) => `<li><a href="${s}"${heimurFyrir(location.pathname).href === s || (s !== "/" && location.pathname.startsWith(s)) ? ' aria-current="page"' : ""}><small>${nr}</small>${t}</a></li>`).join("")}</ul>
      </nav>
      <button type="button" class="r8-bitar" title="Bitar: hvað er þetta?" aria-label="Bitar">${bitaHolf}</button>
      <button type="button" class="r8-tak r8-hljod" aria-pressed="false" title="Hljóð"><span class="kveikt">♪</span><span class="slokkt">♪̸</span><span class="sr">Hljóð</span></button>
      <button type="button" class="r8-tak r8-matsedill" aria-expanded="false" aria-controls="r8-valmynd"><span aria-hidden="true">≡</span><span class="sr">Valmynd</span></button>
      <button type="button" class="r8-tak r8-ut" title="Aftur í nútímann (Esc í valmynd)"><span aria-hidden="true">◄ 2026</span><span class="sr">Hætta í 8-bita ham</span></button>
    </header>
    <main id="r8-efni" tabindex="-1"></main>
    <div class="r8-tilkynning" role="status" aria-live="polite"></div>`;
  document.body.appendChild(skel);

  const hl = skel.querySelector(".r8-hljod");
  const hljodStada = () => { hl.setAttribute("aria-pressed", String(!thogn())); hl.classList.toggle("af", thogn()); };
  hljodStada();
  hl.addEventListener("click", () => { setjaThogn(!thogn()); hljodStada(); spila("velja"); });
  skel.querySelector(".r8-ut").addEventListener("click", slokkva);
  skel.querySelector(".r8-bitar").addEventListener("click", bitaGluggi);
  const ms = skel.querySelector(".r8-matsedill"), vm = skel.querySelector(".r8-valmynd");
  ms.addEventListener("click", () => { const o = ms.getAttribute("aria-expanded") !== "true"; ms.setAttribute("aria-expanded", String(o)); vm.classList.toggle("opin", o); spila(o ? "opna" : "loka"); });

  // hlekkir innan heimsins: ferja í stað venjulegrar síðuskiptingar
  skel.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
    // „Senda póst“ / „Hafa samband“: út úr 8 bitum og sambandsform vefsins opnað
    // (samband.js, window.reytalSamband). Án þess opnast póstforritið eins og áður.
    if (/^mailto:hallo@/i.test(a.getAttribute("href")) && window.reytalSamband) {
      e.preventDefault(); e.stopPropagation();
      slokkva().then(() => window.reytalSamband.open());
      return;
    }
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin) return;
    e.preventDefault();
    fara(u.href);
  });
  skel.addEventListener("pointerover", (e) => { if (e.pointerType === "mouse" && e.target.closest(".r8-takki, .r8-hylki, .r8-valmynd a")) spila("velja"); });

  uppfaeraBita();
  addEventListener("r8:biti", vidBita);
  addEventListener("storage", vidGeymslu);                 // bitar fundnir í öðrum flipa
  eining.smida(skel.querySelector("main"), API);
}

function rifa() {
  removeEventListener("r8:biti", vidBita);
  removeEventListener("storage", vidGeymslu);
  leikvellir.forEach((l) => l.eyda()); leikvellir = [];
  skel?.remove(); skel = null;
  document.getElementById("r8-stilar")?.remove(); stilar = null;
  [...document.body.children].forEach((el) => { if ("r8Inert" in el.dataset) { el.inert = el.dataset.r8Inert === "1"; delete el.dataset.r8Inert; } });
  rot.classList.remove("r8-a");
  delete rot.dataset.r8Heimur;
  fjolmidlar.forEach((v) => v.play().catch(() => {}));
}

// ── Bitar ──────────────────────────────────────────────────────────────────
function uppfaeraBita() {
  if (!skel) return;
  const a = bitar();
  skel.querySelectorAll(".r8-bitar i").forEach((i) => { const n = +i.dataset.n; i.textContent = a.includes(n) ? BAETI[n] : "·"; i.classList.toggle("fundinn", a.includes(n)); });
  skel.querySelector(".r8-bitar").setAttribute("aria-label", `Bitar fundnir: ${a.length} af 8`);
}
function vidGeymslu(e) { if (e.key === "r8-bitar") uppfaeraBita(); }
function vidBita(e) {
  uppfaeraBita();
  const i = skel?.querySelector(`.r8-bitar i[data-n="${e.detail.n}"]`);
  if (i) { i.classList.remove("blikk"); void i.offsetWidth; i.classList.add("blikk"); }
  if (e.detail.alls === 8) setTimeout(baetiFullt, 700);
  else skilabod(`Biti fundinn! ${e.detail.alls} af 8`);
}
// Smellur á bitamælinn: hvað hann er og vísbendingar um þá sem vantar
const VISBENDINGAR = [
  "R-kubbur í Reykjavík. Stökktu undir hann.", "Annar R-kubbur í Reykjavík.", "Á múrsteinspalli í Reykjavík.",
  "Hátt uppi á palli handan við kirkjuturninn.", "Eitthvað er falið neðst á forsíðunni. Bankaðu á múrsteininn.",
  "R-kubbur í gamla bænum í Tallinn.", "Efst á steinþrepunum við turninn í Tallinn.", "Hylki sem enginn hefur spilað. Aftast í hylkjasafninu.",
];
function bitaGluggi() {
  const a = bitar();
  if (a.length === 8) return baetiFullt();
  const vantar = BAETI.map((_, n) => n).filter((n) => !a.includes(n));
  gluggi({
    yfirskrift: `Bitar · ${a.length} af 8`,
    titill: "Átta bitar = eitt bæti",
    html: `<p>Átta bitar eru faldir í 8-bita heimunum. Hver þeirra er 0 eða 1, og saman mynda þeir eitt bæti. Hvaða staf skyldi það stafa?</p>
      <p>${vantar.length === 8 ? "Þú hefur ekki fundið neinn enn." : `Þú átt ${vantar.length} eftir.`} Vísbendingar:</p>
      <ul class="r8-listi">${vantar.map((n) => `<li>▸ ${VISBENDINGAR[n]}</li>`).join("")}</ul>`,
  });
}

function baetiFullt() {
  spila("baeti");
  gluggi({
    yfirskrift: "Bæti fullt",
    titill: "01010010 = R",
    html: `<p>Þú fannst alla átta bitana. Saman mynda þeir eitt bæti, og bætið er stafurinn <b>R</b>.</p>
      <p>Dropi er orðinn gylltur í öllum heimum. Svona forvitni finnst okkur skemmtileg: sendu okkur línu á <b>hallo@reytal.is</b> og segðu okkur hvernig þú fannst leiðina.</p>`,
    takkar: [{ texti: "Senda línu", href: "mailto:hallo@reytal.is?subject=Ég%20fann%20bætið%20(01010010)" }],
  });
}

// ── Sameiginlegir hlutar sem heimarnir nota ───────────────────────────────
export function skilabod(t) {
  const el = skel?.querySelector(".r8-tilkynning");
  if (!el) return;
  el.textContent = t;
  el.classList.remove("synd"); void el.offsetWidth; el.classList.add("synd");
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("synd"), 2600);
}

// NES-gluggi: titill, texti sem skrifast fram og takkar
export function gluggi({ yfirskrift = "", titill, html, takkar = [], tegund = "" }) {
  const fyrri = document.activeElement;
  const g = document.createElement("div");
  g.className = "r8-gluggi-bak";
  g.innerHTML = `<div class="r8-gluggi ${tegund}" role="dialog" aria-modal="true" aria-labelledby="r8-gt">
      <button type="button" class="r8-loka" aria-label="Loka">×</button>
      ${yfirskrift ? `<p class="r8-yfirskrift">${yfirskrift}</p>` : ""}
      <h2 id="r8-gt">${titill}</h2>
      <div class="r8-gluggi-efni">${html}</div>
      ${takkar.length ? `<div class="r8-takkar">${takkar.map((t) => t.href
        ? `<a class="r8-takki${t.aukalegur ? " aukalegur" : ""}" href="${t.href}"${t.ut ? ' target="_blank" rel="noopener"' : ""}>${t.texti}</a>`
        : `<button type="button" class="r8-takki${t.aukalegur ? " aukalegur" : ""}">${t.texti}</button>`).join("")}</div>` : ""}
    </div>`;
  skel.appendChild(g);
  spila("opna");
  const loka = () => { g.classList.add("fer"); spila("loka"); removeEventListener("keydown", esc, true); setTimeout(() => g.remove(), 160); fyrri?.focus?.({ preventScroll: true }); };
  const esc = (e) => {
    if (e.key === "Escape") { e.stopImmediatePropagation(); loka(); }                 // Esc lokar glugganum, ekki leiknum
    if (e.key === "Tab") {
      const f = [...g.querySelectorAll("a, button")]; if (!f.length) return;
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  };
  addEventListener("keydown", esc, true);
  g.addEventListener("click", (e) => { if (e.target === g || e.target.closest(".r8-loka")) loka(); });
  takkar.forEach((t, i) => t.smellur && g.querySelectorAll(".r8-takkar > *")[i].addEventListener("click", (e) => { t.smellur(e); loka(); }));
  // ritvélaáhrif á fyrstu málsgreinina
  const p = g.querySelector(".r8-gluggi-efni p");
  if (p && !T.rolegt() && p.children.length === 0) {
    const fullur = p.textContent; p.style.minHeight = p.offsetHeight + "px"; p.textContent = "";
    let n = 0; const tif = setInterval(() => { n += 2; p.textContent = fullur.slice(0, n); if (n >= fullur.length) clearInterval(tif); }, 16);
    g.addEventListener("click", () => { clearInterval(tif); p.textContent = fullur; }, { once: true });
  }
  setTimeout(() => g.querySelector(".r8-loka").focus({ preventScroll: true }), 30);
  return { loka };
}

// ── Hylki: verkefni sem leikjahylki ────────────────────────────────────────
const TAKN_MERKJA = { "Vefþróun": "kodi", "Hönnun": "penni", "Netverslun": "karfa", "SEO": "leit", "Verðlaun": "bikar", "Bestun": "ritill", "Hýsing": "thjonn", "Gervigreind": "neisti", "Vörumerki": "penni", "App": "simi" };
export const taknMerkis = (m) => TAKN_MERKJA[m] || "hnottur";
function hass(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
const MIDALITIR = [[P.himinn, P.gras, P.grasL], [P.nott2, P.navyL, P.gullL], [P.appels, P.gull, P.rautt], [P.navy, P.slate, P.krem], [P.fjola, P.bleikt, P.hvitt], [P.grasD, P.sage, P.gull], [P.moldD, P.mold, P.moldL], [P.blek, P.rautt, P.krem]];
// Miðinn á hylkinu: lítið pixlaumhverfi búið til úr nafni verkefnisins
export function hylkisMidi(v) {
  const h = hass(v.nafn), r = slembi(h), [a, b, c] = MIDALITIR[h % MIDALITIR.length];
  const pm = new Pixmap(48, 30).rect(0, 0, 48, 30, a);
  for (let x = 0; x < 48; x++) { const y = 18 + Math.round(Math.sin(x / (3 + (h % 5)) + h) * 3 + Math.sin(x / 7) * 2); pm.rect(x, y, 1, 30 - y, b); }
  for (let i = 0; i < 7; i++) pm.set((r() * 48) | 0, (r() * 14) | 0, c);
  pm.teikna(takn(taknMerkis(v.merki?.[0]), c), 4, 4);
  return pm;
}
export function hylkiEl(v, { leynd } = {}) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "r8-hylki" + (leynd ? " leynd" : "");
  b.innerHTML = `<span class="r8-hylki-skel"><span class="r8-hylki-midi"><img src="${leynd ? "" : hylkisMidi(v).slod(4)}" alt="">` +
    `<span class="r8-hylki-nafn">${v.nafn}</span></span></span><span class="r8-hylki-nr">Borð ${String(v.nr).padStart(2, "0")}</span>`;
  b.addEventListener("click", () => opnaHylki(v));
  return b;
}
export function opnaHylki(v) {
  spila("hylki");
  const merkin = (v.merki || []).map((m) => `<li><img src="${takn(taknMerkis(m), P.gull, 2).slod()}" alt="">${m}</li>`).join("");
  gluggi({
    tegund: "r8-gluggi-hylki",
    yfirskrift: `Borð ${String(v.nr).padStart(2, "0")}`,
    titill: v.nafn,
    html: `<div class="r8-tolva" aria-hidden="true"><span class="r8-tolva-rauf"></span><img class="r8-tolva-hylki" src="${hylkisMidi(v).slod(3)}" alt=""></div>
      ${v.vidskiptavinur ? `<p class="r8-vidskipta">${v.vidskiptavinur}</p>` : ""}
      <p>${v.lysing || ""}</p>
      ${merkin ? `<ul class="r8-krafter" aria-label="Það sem við gerðum">${merkin}</ul>` : ""}`,
    takkar: v.slod ? [{ texti: "Spila ↗", href: v.slod, ut: true }] : [],
  });
}

// ── Fótur: jörð úr kubbum + samband. Einn falinn biti í honum ef heimurinn vill ──
export function fotur(main, { bitiN = null, steinn = false } = {}) {
  const f = document.createElement("footer");
  f.className = "r8-fotur";
  const flis = (steinn ? steinar() : jord(true)).slod(4), undir = (steinn ? steinar() : jord(false)).slod(4);
  f.style.setProperty("--r8-flis", `url(${flis})`); f.style.setProperty("--r8-undir", `url(${undir})`);
  const fundinn = bitiN != null && bitar().includes(bitiN);
  f.innerHTML = `<div class="r8-fotur-jord" aria-hidden="true"></div>
    <div class="r8-fotur-innan">
      <div><p class="r8-yfirskrift">Hafa samband</p><p class="r8-stort"><a href="mailto:hallo@reytal.is">hallo@reytal.is</a></p>
        <p>Guðrúnartún 8, 105 Reykjavík · <a href="tel:+3545109000">510 9000</a></p></div>
      <div class="r8-fotur-borgir"><span>Reykjavík</span><span>Tallinn</span></div>
      <p class="r8-fotur-smatt">REYTAL © 2026 · Engir pixlar skemmdust við gerð þessarar síðu
        ${bitiN != null ? `<button type="button" class="r8-falinn-kubbur${fundinn ? " notadur" : ""}" aria-label="Múrsteinn"><img src="${mursteinn().slod(2)}" alt=""></button>` : ""}</p>
    </div>`;
  if (bitiN != null) {
    const k = f.querySelector(".r8-falinn-kubbur");
    k.addEventListener("click", () => {
      k.classList.remove("hopp"); void k.offsetWidth; k.classList.add("hopp");
      spila("dynkur");
      if (!k.classList.contains("notadur")) { k.classList.add("notadur"); if (finnaBita(bitiN)) setTimeout(() => spila("biti"), 80); }
    });
  }
  main.appendChild(f);
  return f;
}

// ── Leikvöllur + hetjutexti efst á síðu ──────────────────────────────────
export function svid(main, heimurinn, { yfirskrift, titill, inngangur, onStadur, onStadreynd }) {
  const s = document.createElement("section");
  s.className = "r8-svid";
  s.setAttribute("aria-label", `Heimur ${heimur.nr}, ${heimur.nafn}`);
  s.tabIndex = -1;
  s.innerHTML = `<div class="r8-hetja">
      <p class="r8-yfirskrift">${yfirskrift}</p>
      <h1>${titill}</h1>
      <p class="r8-inngangur">${inngangur}</p>
      <div class="r8-hetja-takkar"><button type="button" class="r8-takki r8-start">▶ Ýttu á start</button>
      <p class="r8-leidbeining"><span class="lykla">← → ganga · bil stökkva · ↓ fara inn · Esc hætta</span><span class="snert">Snertu heiminn til að spila</span></p></div>
    </div>`;
  main.appendChild(s);
  const l = new Leikvollur(s, { ...heimurinn, gull: allirBitar }, {
    onStadur, onStadreynd: (t) => { skilabod(t); onStadreynd?.(t); },
    onBiti: () => {},
  });
  leikvellir.push(l);
  const start = s.querySelector(".r8-start"), snerti = matchMedia("(pointer: coarse)").matches;
  start.setAttribute("aria-pressed", "false");
  start.addEventListener("click", (e) => { e.stopPropagation(); if (!l.virkur) spila("kveikja"); l.setjaVirkan(!l.virkur); });
  s.addEventListener("r8:virkur", (e) => {
    start.textContent = e.detail ? (snerti ? "■ Hætta" : "■ Í leik · Esc") : "▶ Ýttu á start";
    start.setAttribute("aria-pressed", String(e.detail));
  });
  return { s, leikur: l };
}

// Efnisrammi: NES-kassi með yfirskrift
export function kassi(main, { id, yfirskrift, titill, html, tegund = "" }) {
  const k = document.createElement("section");
  k.className = "r8-kafli " + tegund;
  if (id) k.id = id;
  k.innerHTML = `<div class="r8-kassi">${yfirskrift ? `<p class="r8-yfirskrift">${yfirskrift}</p>` : ""}${titill ? `<h2>${titill}</h2>` : ""}${html || ""}</div>`;
  main.appendChild(k);
  return k.querySelector(".r8-kassi");
}

// Texti úr venjulegu síðunni. Vefurinn skiptir fyrirsögnum í búta (span) fyrir
// hreyfingu, svo bútarnir eru sameinaðir með bili.
export function lesa(sel, vara = "") {
  const el = typeof sel === "string" ? document.querySelector(sel) : sel;
  if (!el) return vara;
  return [...el.childNodes].map((n) => n.textContent).join(" ").replace(/[↗︎\uFE0E]/g, "").replace(/\s+/g, " ").trim() || vara;
}

export const API = { lesa, ut, takn, svid, kassi, fotur, gluggi, skilabod, hylkiEl, opnaHylki, hylkisMidi, taknMerkis, fara, slokkva, mynd, P };
export { takn, verdlaunabikar };
