// REYTAL 8-bit · kveikjan. Eina skráin sem venjulegi vefurinn hleður (um 3 KB).
// Allt annað (heimurinn, pixlalistin, hljóðið) er sótt með import() fyrst
// þegar gesturinn finnur leynileiðina.
//
// Leynileiðin: í merkinu stendur TAL á hvolfi. Smelltu fimm sinnum á TAL og
// það snýst um 36° í hvert sinn þar til það stendur upprétt, og þá opnast
// hin hliðin. Sama í síma (fimm snertingar). Konami-kóðinn virkar líka.
const AFRAM = 1500;        // ms áður en TAL rennur til baka ef gesturinn hættir
const SKREF = 5;

const rot = document.documentElement;
let hamurinn = null;
const saekjaHam = () => (hamurinn ||= import("./mode.js"));

// ?r8=af slekkur, ?r8=reset hreinsar allt (bitar, hljóð, hamur)
const leit = new URLSearchParams(location.search).get("r8");
if (leit === "af" || leit === "reset") {
  try { ["r8-hamur", ...(leit === "reset" ? ["r8-bitar", "r8-hljod"] : [])].forEach((k) => localStorage.removeItem(k)); } catch {}
  rot.classList.remove("r8-raesing");
}

// Hamurinn var virkur á síðustu síðu: ræsa beint í 8 bitum
if (rot.classList.contains("r8-raesing")) saekjaHam().then((m) => m.raesa()).catch((e) => {
  console.warn("REYTAL 8-bit: ræsing mistókst", e);                    // venjulegi vefurinn birtist þá bara
  rot.classList.remove("r8-raesing", "r8-skipti");
  document.querySelector(".r8-yfir")?.remove();
});

// ── 1. TAL í merkinu ───────────────────────────────────────────────────────
function talHopur(svg) {
  let g = svg.querySelector("g.r8-tal");
  if (g) return g;
  // TAL eru þrír fyrstu stígarnir (neðri helmingur merkisins, y > 10)
  const stigar = [...svg.querySelectorAll(":scope > path")].filter((p) => { try { return p.getBBox().y > 9.5; } catch { return false; } });
  if (stigar.length < 3) return null;
  g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", "r8-tal");
  g.style.transformBox = "fill-box";
  g.style.transformOrigin = "50% 50%";
  g.style.transition = "transform .45s cubic-bezier(.34,1.56,.64,1)";
  stigar[0].before(g);
  stigar.forEach((p) => g.appendChild(p));
  return g;
}

let fjoldi = 0, tifari = 0, ferd = 0, raesist = false;
function setjaSnuning(g, n) { g.style.transform = n ? `rotate(${n * (180 / SKREF)}deg)` : ""; }

function kveikja(uppruni) {
  if (raesist || rot.classList.contains("r8-a") || rot.classList.contains("r8-skipti")) return;
  raesist = true;
  saekjaHam().then((m) => m.kveikja(uppruni)).catch((e) => console.warn("REYTAL 8-bit:", e)).finally(() => (raesist = false));
}

document.addEventListener("click", (e) => {
  const a = e.target.closest && e.target.closest("a.logo-mark, #logoTarget");
  if (!a || e.detail === 0) return;                                      // lyklaborð: venjulegur hlekkur
  // Á meðan hin hliðin opnast eru allir smellir á merkið gleyptir. Annars fer
  // sjötti smellurinn til vefsins, sem spilar splash og hleður síðunni aftur.
  if (raesist || rot.classList.contains("r8-skipti") || rot.classList.contains("r8-a")) { e.preventDefault(); e.stopImmediatePropagation(); return; }
  const svg = a.querySelector("svg");
  if (!svg) return;
  const r = svg.getBoundingClientRect();
  // fyrsti smellurinn þarf að hitta TAL; eftir það telur allt merkið (fingur hitta ekki alltaf)
  if (fjoldi === 0 && e.clientY < r.top + r.height * 0.5) return;        // REY: venjulegur hlekkur
  const g = talHopur(svg);
  if (!g) return;
  // vefurinn sjálfur hlustar líka á smelli á merkinu (splash og síðuskipti);
  // smellir á TAL eru teknir hér og fara ekki lengra
  e.preventDefault();
  e.stopImmediatePropagation();
  fjoldi++;
  setjaSnuning(g, fjoldi);
  import("./audio.js").then((h) => h.spila("tal", { tonn: fjoldi * 2 })).catch(() => {});
  if (fjoldi === 2) saekjaHam();                                          // byrja að sækja í leyni
  clearTimeout(tifari); clearTimeout(ferd);
  if (fjoldi >= SKREF) {
    fjoldi = 0;
    raesist = true;                                                       // læst strax, ekki eftir 260 ms
    setTimeout(() => { raesist = false; kveikja({ x: e.clientX, y: e.clientY }); setTimeout(() => setjaSnuning(g, 0), 900); }, 260);
    return;
  }
  if (fjoldi === 1) {
    // einn smellur er bara smellur á merkið: honum er skilað til vefsins eins og
    // ekkert hafi í skorist (a.click() hefur detail 0 og fer framhjá okkur)
    ferd = setTimeout(() => {
      if (fjoldi !== 1) return;
      fjoldi = 0; setjaSnuning(g, 0);
      a.click();
    }, 420);
  }
  tifari = setTimeout(() => { fjoldi = 0; setjaSnuning(g, 0); }, AFRAM);
}, true);

// fimm hraðar snertingar mega ekki verða að tvísmells-aðdrætti í síma
document.querySelectorAll("a.logo-mark, #logoTarget").forEach((a) => (a.style.touchAction = "manipulation"));

// ── 2. Konami-kóðinn: ↑ ↑ ↓ ↓ ← → ← → B A ───────────────────────────────────
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let stada = 0;
document.addEventListener("keydown", (e) => {
  const t = e.target;
  if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  stada = k === KONAMI[stada] ? stada + 1 : k === KONAMI[0] ? 1 : 0;
  if (stada === KONAMI.length) {
    stada = 0;
    if (rot.classList.contains("r8-a")) saekjaHam().then((m) => m.slokkva());
    else kveikja(null);
  }
});
