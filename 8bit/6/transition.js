// Umbreytingin. Fjórir þættir sem mode.js raðar saman:
//   glitch()       skjárinn titrar og rifnar í stutta stund
//   upplausn()     nútímavefurinn brotnar í pixla sem breiðast út frá smellinum
//   spjald()       svart borðspjald eins og á NES: "HEIMUR 1-1 · REYKJAVÍK"
//   uppbygging()   8-bita heimurinn raðast upp kubb fyrir kubb, neðan frá
// Ef gesturinn biður um minni hreyfingu verður allt að stuttri deyfingu.

export const rolegt = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
// Næsti rammi: requestAnimationFrame, með tímastilli til vara. Sumir vafrar hægja
// á rAF (faldir flipar, rafhlöðusparnaður, innfelldir gluggar) og þá má
// umbreytingin ekki festast. Það sem kemur fyrst ræður.
export function ramma(f) {
  let farid = false;
  const fara = () => { if (!farid) { farid = true; f(performance.now()); } };
  if (!document.hidden) requestAnimationFrame(fara);
  setTimeout(fara, document.hidden ? 16 : 40);
}

let yfir = null, cv = null, cx = null;
export function yfirlag() {
  if (yfir) return yfir;
  yfir = document.createElement("div");
  yfir.className = "r8-yfir";
  yfir.setAttribute("aria-hidden", "true");
  yfir.innerHTML = '<canvas></canvas><div class="r8-spjald" hidden></div>';
  cv = yfir.querySelector("canvas");
  cx = cv.getContext("2d");
  document.body.appendChild(yfir);
  staerd();
  addEventListener("resize", staerd);
  return yfir;
}
function staerd() {
  if (!cv) return;
  cv.width = innerWidth; cv.height = innerHeight;
}
export function fjarlaegja() {
  if (!yfir) return;
  removeEventListener("resize", staerd);
  yfir.remove(); yfir = cv = cx = null;
}

function flisar(T) {
  const dalkar = Math.ceil(innerWidth / T), radir = Math.ceil(innerHeight / T), a = [];
  for (let r = 0; r < radir; r++) for (let d = 0; d < dalkar; d++) a.push({ x: d * T, y: r * T, d, r });
  return { a, dalkar, radir };
}
const bida = (ms) => new Promise((r) => setTimeout(r, ms));

// ── 1. Glitch ──────────────────────────────────────────────────────────────
export function glitch(ms = 520) {
  yfirlag();
  if (rolegt()) return bida(0);
  document.documentElement.classList.add("r8-glitch");
  const t0 = performance.now(), litir = ["#0D4659", "#F3F0EA", "#E07A45", "#5C94FC", "#00A844", "#FC9838"];
  return new Promise((buid) => {
    (function lykkja(t) {
      const p = (t - t0) / ms;
      cx.clearRect(0, 0, cv.width, cv.height);
      const n = 4 + Math.floor(p * 14);
      for (let i = 0; i < n; i++) {
        const y = Math.random() * cv.height, h = 2 + Math.random() * (10 + p * 40);
        cx.globalAlpha = 0.25 + Math.random() * 0.5;
        cx.fillStyle = litir[(Math.random() * litir.length) | 0];
        cx.fillRect(Math.random() * cv.width * 0.3 - 40, y, cv.width * (0.4 + Math.random() * 0.8), h);
      }
      cx.globalAlpha = 1;
      if (p < 1) ramma(lykkja);
      else { document.documentElement.classList.remove("r8-glitch"); cx.clearRect(0, 0, cv.width, cv.height); buid(); }
    })(t0);
  });
}

// ── 2. Upplausn: flísar fyllast út frá upprunanum, fyrst í lit og svo svart ──
export function upplausn(uppruni, { ms = 900, litir = ["#F3F0EA", "#E9E5DC", "#0D4659", "#BEBFA6", "#4C7C93"], T } = {}) {
  yfirlag();
  if (rolegt()) return deyfa(1, 220);
  T = T || (innerWidth < 640 ? 18 : 26);
  const { a } = flisar(T);
  const ox = uppruni ? uppruni.x : innerWidth / 2, oy = uppruni ? uppruni.y : innerHeight / 2;
  const mx = Math.hypot(Math.max(ox, innerWidth - ox), Math.max(oy, innerHeight - oy));
  a.forEach((f) => { f.t = (Math.hypot(f.x + T / 2 - ox, f.y + T / 2 - oy) / mx) * 0.72 + Math.random() * 0.22; f.c = litir[(Math.random() * litir.length) | 0]; });
  const t0 = performance.now(), litlengd = 0.12;
  return new Promise((buid) => {
    (function lykkja(t) {
      const p = (t - t0) / ms;
      for (const f of a) {
        if (p < f.t || f.svart) continue;
        if (p < f.t + litlengd) { cx.fillStyle = f.c; cx.fillRect(f.x, f.y, T, T); if (Math.random() < 0.2) { cx.fillStyle = "rgba(0,0,0,.25)"; cx.fillRect(f.x + T - 4, f.y + 4, 4, T - 4); } }
        else { cx.fillStyle = "#000"; cx.fillRect(f.x, f.y, T, T); f.svart = true; }
      }
      if (p < 1 + litlengd) ramma(lykkja);
      else { cx.fillStyle = "#000"; cx.fillRect(0, 0, cv.width, cv.height); buid(); }
    })(t0);
  });
}

// ── 3. Borðspjald ──────────────────────────────────────────────────────────
export function spjald(html, ms = 1300) {
  yfirlag();
  const s = yfir.querySelector(".r8-spjald");
  cx.fillStyle = "#000"; cx.fillRect(0, 0, cv.width, cv.height);
  s.innerHTML = html;
  s.hidden = false;
  return new Promise((buid) => {
    let lokid = false;
    const klara = () => { if (lokid) return; lokid = true; s.hidden = true; removeEventListener("keydown", klara); yfir.removeEventListener("pointerdown", klara); buid(); };
    setTimeout(klara, rolegt() ? Math.min(ms, 700) : ms);
    setTimeout(() => { addEventListener("keydown", klara); yfir.addEventListener("pointerdown", klara); }, 250);   // hægt að sleppa
  });
}

// ── 4. Uppbygging: svarta tjaldið hverfur kubb fyrir kubb, neðan frá ──────────
export function uppbygging({ ms = 900, T } = {}) {
  yfirlag();
  if (rolegt()) return deyfa(0, 260).then(fjarlaegja);
  T = T || (innerWidth < 640 ? 24 : 36);
  const { a, radir } = flisar(T);
  a.forEach((f) => (f.t = ((radir - 1 - f.r) / radir) * 0.78 + Math.random() * 0.18));
  const t0 = performance.now(), blikk = 0.06;
  cx.fillStyle = "#000"; cx.fillRect(0, 0, cv.width, cv.height);
  return new Promise((buid) => {
    (function lykkja(t) {
      const p = (t - t0) / ms;
      for (const f of a) {
        if (f.farin || p < f.t) continue;
        if (p < f.t + blikk) { cx.fillStyle = (f.d + f.r) % 2 ? "#5C94FC" : "#3C78FC"; cx.fillRect(f.x, f.y, T, T); cx.fillStyle = "#000"; cx.fillRect(f.x + T - 3, f.y, 3, T); cx.fillRect(f.x, f.y + T - 3, T, 3); }
        else { cx.clearRect(f.x, f.y, T, T); f.farin = true; }
      }
      if (p < 1 + blikk) ramma(lykkja);
      else { fjarlaegja(); buid(); }
    })(t0);
  });
}

// ── 5. Afhjúpun á leið út: tilviljanakennd upplausn yfir í nútímann ──────────
export function afhjupa({ ms = 650, T } = {}) {
  yfirlag();
  if (rolegt()) return deyfa(0, 260).then(fjarlaegja);
  T = T || (innerWidth < 640 ? 18 : 26);
  const { a } = flisar(T);
  a.forEach((f) => (f.t = Math.random() * 0.9));
  const t0 = performance.now();
  cx.fillStyle = "#000"; cx.fillRect(0, 0, cv.width, cv.height);
  return new Promise((buid) => {
    (function lykkja(t) {
      const p = (t - t0) / ms;
      for (const f of a) if (!f.farin && p >= f.t) { cx.clearRect(f.x, f.y, T, T); f.farin = true; }
      if (p < 1) ramma(lykkja);
      else { fjarlaegja(); buid(); }
    })(t0);
  });
}

function deyfa(til, ms) {
  yfirlag();
  cx.fillStyle = "#000"; cx.fillRect(0, 0, cv.width, cv.height);
  yfir.style.transition = "none";
  yfir.style.opacity = til ? "0" : "1";
  yfir.getBoundingClientRect();
  yfir.style.transition = `opacity ${ms}ms linear`;
  yfir.style.opacity = String(til);
  return bida(ms).then(() => { if (yfir) { yfir.style.transition = ""; yfir.style.opacity = ""; } });
}
