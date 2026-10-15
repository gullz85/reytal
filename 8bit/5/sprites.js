// Pixlalist REYTAL 8-bit. Allt teiknað í kóða á Pixmap (sjá pixel.js), svo sömu
// skilgreiningar búa til PNG í assets/pixel og myndirnar sem leikurinn notar.
import { Pixmap, P, texti, textaBreidd, merki } from "./pixel.js";

// ── Hjálparföll ────────────────────────────────────────────────────────────
function lina(pm, x0, y0, x1, y1, c) {
  let dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1, e = dx + dy;
  for (;;) { pm.set(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
function hringur(pm, cx, cy, r, c) {
  for (let a = 0; a < 64; a++) { const t = (a / 64) * Math.PI * 2; pm.set(Math.round(cx + Math.cos(t) * r), Math.round(cy + Math.sin(t) * r), c); }
}
// gervislembi með fræi, svo pixlalistin verði eins í hvert skipti
export function slembi(fr) { let s = fr >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ── Dropi: fígúra REYTAL í 16×16 ───────────────────────────────────────────
// ramma: "kyrr" | "blikk" | "kremja" | "teygja"; att: 1 hægri, -1 vinstri
export function dropi(ramma = "kyrr", att = 1, gull = false) {
  const L = gull
    ? { ut: P.moldD, a: P.mold, b: P.gull, c: P.hvitt, auga: P.blek }
    : { ut: P.navyD, a: P.navy, b: P.navyL, c: "#9fdcf0", auga: P.krem };
  const pm = new Pixmap(16, 16);
  // [miðja x, miðja y, geisli x, geisli y]: dropinn kremst við lendingu og teygist í stökki
  const [cx, cy, rx, ry] = { kremja: [8, 10, 7, 5], teygja: [8, 8, 5, 7] }[ramma] || [8, 9, 6, 6];
  pm.sporbaugur(cx, cy, rx, ry, L.ut);
  pm.sporbaugur(cx, cy, rx - 1, ry - 1, L.a);
  pm.sporbaugur(cx - 1, cy - 1, rx - 2, ry - 2, L.b);
  pm.sporbaugur(cx, cy + 1, rx - 3, ry - 3, L.a);
  pm.rect(cx - rx + 2, cy - ry + 2, 2, 1, L.c).set(cx - rx + 2, cy - ry + 3, L.c);           // gljái
  pm.rect(cx - rx + 2, cy + ry, rx * 2 - 3, 1, L.ut);                                        // flatur botn
  for (let x = cx - rx + 1; x <= cx + rx - 1; x++) if (!pm.get(x, cy + ry - 1)) pm.set(x, cy + ry - 1, L.ut);
  const ex = cx - 3 + att, ey = cy - (ramma === "teygja" ? 2 : 1);
  if (ramma === "blikk") { pm.rect(ex, ey + 2, 2, 1, L.auga); pm.rect(ex + 4, ey + 2, 2, 1, L.auga); }
  else { const h = ramma === "kremja" ? 3 : 4; pm.rect(ex, ey, 2, h, L.auga); pm.rect(ex + 4, ey, 2, h, L.auga); }
  return pm;
}

// ── Biti: peningur með 0 eða 1, snýst í fjórum römmum ──────────────────────
const TOLUR = { "0": ["###", "#.#", "#.#", "#.#", "###"], "1": [".#.", "##.", ".#.", ".#.", "###"] };
export function biti(gildi = 1, ramma = 0) {
  const pm = new Pixmap(10, 14);
  const rx = [4, 3, 1, 3][ramma % 4];
  pm.sporbaugur(5, 7, rx, 6, P.moldD);
  if (rx > 1) pm.sporbaugur(5, 7, rx - 1, 5, P.gull);
  if (rx > 2) { pm.rect(5 - rx + 1, 4, 1, 6, P.gullL); TOLUR[gildi].forEach((l, y) => { for (let x = 0; x < 3; x++) if (l[x] === "#") pm.set(4 + x, 5 + y, P.moldD); }); }
  else if (rx === 1) pm.rect(5, 2, 1, 10, P.gullL);
  return pm;
}

// ── Kubbar 16×16 ───────────────────────────────────────────────────────────
export function rKubbur(notadur = false) {
  const pm = new Pixmap(16, 16);
  if (notadur) {
    pm.rect(0, 0, 16, 16, P.moldD).rect(1, 1, 14, 14, P.mold).rect(1, 1, 14, 1, P.moldL);
    [[2, 2], [13, 2], [2, 13], [13, 13]].forEach(([x, y]) => pm.set(x, y, P.moldD));
    return pm;
  }
  pm.rect(0, 0, 16, 16, P.navyD).rect(1, 1, 14, 14, P.navy).rect(1, 1, 14, 1, P.navyL).rect(1, 1, 1, 14, P.navyL);
  [[2, 2], [13, 2], [2, 13], [13, 13]].forEach(([x, y]) => pm.set(x, y, P.gull));
  texti(pm, "R", 5, 3, P.krem);
  return pm;
}
export function mursteinn() {
  const pm = new Pixmap(16, 16).rect(0, 0, 16, 16, P.moldD);
  for (let r = 0; r < 4; r++) {
    const y = r * 4, hlid = r % 2 ? 4 : 0;
    for (let k = -1; k < 3; k++) {
      const x = k * 8 + hlid;
      pm.rect(x + 1, y + 1, 7, 3, P.mold);
      pm.rect(x + 1, y + 1, 7, 1, P.moldL);
    }
  }
  return pm;
}
export function jord(efst = true) {
  const pm = new Pixmap(16, 16).rect(0, 0, 16, 16, P.mold);
  const r = slembi(efst ? 7 : 9);
  for (let i = 0; i < 14; i++) pm.rect((r() * 15) | 0, (r() * 15) | 0, 2, 1, P.moldD);
  for (let i = 0; i < 6; i++) pm.set((r() * 16) | 0, (r() * 16) | 0, P.moldL);
  if (efst) {
    pm.rect(0, 0, 16, 4, P.gras).rect(0, 0, 16, 1, P.grasL);
    for (let x = 0; x < 16; x += 3) pm.rect(x, 4, 2, 1 + (x % 2), P.gras);
    for (let x = 1; x < 16; x += 4) pm.set(x, 1, P.grasD);
  }
  return pm;
}
export function steinar() {
  const pm = new Pixmap(16, 16).rect(0, 0, 16, 16, P.grarDD);
  [[0, 0, 7, 5], [8, 0, 8, 6], [0, 6, 5, 5], [6, 7, 6, 4], [13, 7, 3, 5], [0, 12, 9, 4], [10, 12, 6, 4]].forEach(([x, y, w, h], i) => {
    pm.rect(x + 1, y + 1, w - 1, h - 1, i % 3 ? P.grarD : "#5C5C5C");
    pm.rect(x + 1, y + 1, w - 2, 1, P.grar);
  });
  return pm;
}
export function vatn(ramma = 0) {
  const pm = new Pixmap(16, 8).rect(0, 0, 16, 8, "#2038EC");
  for (let x = 0; x < 16; x++) { const y = Math.round(1 + Math.sin((x + ramma * 4) / 2.5)); pm.set(x, y, P.himinnL); pm.set(x, y + 1, "#3C78FC"); }
  return pm;
}

// ── Himinn og bakgrunnur ───────────────────────────────────────────────────
export function sky(w = 32) {
  const pm = new Pixmap(w, 16), h = (w / 32) | 0;
  pm.sporbaugur(8 * h, 10, 6 * h, 5, P.hvitt).sporbaugur(16 * h, 7, 7 * h, 7, P.hvitt).sporbaugur(24 * h, 10, 6 * h, 5, P.hvitt);
  pm.rect(3 * h, 12, 26 * h, 3, P.hvitt);
  pm.rect(4 * h, 14, 24 * h, 1, P.himinnL);
  return pm;
}
export function lundi(ramma = 0) {
  const pm = new Pixmap(12, 9);
  pm.kort(ramma ? [
    "............",
    "...ss.......",
    "..sssss.....",
    ".ssssssssaa.",
    "..sswwwwwa..",
    "...wwwwww...",
    "....w..w....",
  ] : [
    "............",
    "............",
    "....sssssaa.",
    ".ssssswwwa..",
    "sss.wwwwww..",
    "....wwwwww..",
    ".....w..w...",
  ], { s: P.blek, w: P.hvitt, a: P.appels }, 0, 1);
  pm.set(8, ramma ? 3 : 2, P.hvitt);
  return pm;
}
export function runni() {
  const pm = new Pixmap(32, 12);
  pm.sporbaugur(8, 8, 7, 5, P.grasD).sporbaugur(16, 6, 8, 6, P.grasD).sporbaugur(24, 8, 7, 5, P.grasD);
  pm.sporbaugur(8, 8, 6, 4, P.gras).sporbaugur(16, 6, 7, 5, P.gras).sporbaugur(24, 8, 6, 4, P.gras);
  pm.rect(4, 4, 2, 1, P.grasL).rect(13, 2, 3, 1, P.grasL).rect(21, 5, 2, 1, P.grasL);
  pm.rect(0, 11, 32, 1, null);
  return pm;
}
// Esja: langur fjallgarður með snjó, breidd w
export function esja(w = 640, h = 72) {
  const pm = new Pixmap(w, h), r = slembi(3);
  const tindar = [];
  for (let x = -40; x < w + 40; x += 34 + ((r() * 40) | 0)) tindar.push([x, 10 + r() * 26, 26 + r() * 30]);
  for (let x = 0; x < w; x++) {
    let t = h;
    for (const [tx, ty, br] of tindar) t = Math.min(t, ty + (Math.abs(x - tx) / br) * 26);
    t = Math.round(t + Math.sin(x * 1.7) * 0.6);
    for (let y = t; y < h; y++) pm.set(x, y, y < t + 2 ? P.fjallD : P.fjall);
    if (t < 30) for (let y = t; y < Math.min(h, 30 + ((x * 7) % 4)); y++) pm.set(x, y, P.hvitt);    // snjór á tindunum
    if (x % 6 === 0) for (let y = Math.max(t + 5, 28); y < h; y += 4) pm.set(x, y, P.fjallD);       // gil
  }
  return pm;
}
export function holl(w = 80, h = 40, fr = 1) {
  const pm = new Pixmap(w, h);
  pm.sporbaugur(w >> 1, h, (w >> 1) - 1, h - 1, P.grasD);
  pm.sporbaugur(w >> 1, h, (w >> 1) - 2, h - 2, P.gras);
  const r = slembi(fr);
  for (let i = 0; i < w / 6; i++) { const x = 6 + ((r() * (w - 12)) | 0), y = 8 + ((r() * (h - 10)) | 0); if (pm.get(x, y)) pm.rect(x, y, 2, 3, P.grasD); }
  pm.rect((w >> 1) - 10, 4, 6, 1, P.grasL);
  return pm;
}

// ── Reykjavík: hús, kirkja, viti, ferja ────────────────────────────────────
// Bárujárnshús: litríkt, eins og í gamla Vesturbænum
export function hus(veggur = P.rautt, veggurD = "#A81C00", thak = P.grarDD, w = 64, h = 56) {
  const pm = new Pixmap(w, h), vh = h - 22;
  for (let y = 0; y < 22; y++) { const b = Math.round((y / 21) * (w / 2)); pm.rect((w >> 1) - b, y, b * 2, 1, y === 21 ? P.blek : thak); }
  pm.rect((w >> 1) - 1, 0, 2, 22, P.grarD);
  pm.rect(2, 22, w - 4, vh, veggur);
  for (let x = 3; x < w - 3; x += 3) pm.rect(x, 22, 1, vh, veggurD);
  pm.rect(2, 22, w - 4, 1, P.hvitt).rect(2, h - 1, w - 4, 1, P.blek);
  const glugg = (x, y) => { pm.rect(x, y, 10, 12, P.hvitt).rect(x + 1, y + 1, 8, 10, P.gler).rect(x + 5, y + 1, 1, 10, P.hvitt).rect(x + 1, y + 6, 8, 1, P.hvitt).rect(x + 2, y + 2, 2, 2, P.himinnL); };
  glugg(7, 28); glugg(w - 17, 28);
  pm.rect((w >> 1) - 7, h - 20, 14, 20, P.hvitt).rect((w >> 1) - 6, h - 19, 12, 19, P.navy).rect((w >> 1) + 3, h - 10, 2, 2, P.gull);
  pm.rect((w >> 1) - 6, h - 19, 12, 1, P.navyL);
  return pm;
}
// Kirkjuturn með stöllum: í anda Hallgrímskirkju, ekki eftirmynd
export function kirkja(w = 88, h = 136) {
  const pm = new Pixmap(w, h), cx = w >> 1;
  for (let s = 5; s >= 1; s--) {
    const hd = 30 + (5 - s) * 15, x1 = cx - 7 - s * 7, x2 = cx + 7 + (s - 1) * 7;
    [x1, x2].forEach((x) => {
      pm.rect(x, h - hd, 7, hd, P.grarD).rect(x + 1, h - hd + 1, 5, hd - 1, P.grar).rect(x + 1, h - hd + 1, 1, hd - 1, P.hvitt);
      for (let y = h - hd + 6; y < h - 4; y += 9) pm.rect(x + 3, y, 1, 5, P.grarD);
    });
  }
  pm.rect(cx - 7, 26, 14, h - 26, P.grarD).rect(cx - 6, 27, 12, h - 27, P.grar).rect(cx - 6, 27, 2, h - 27, P.hvitt);
  for (let y = 0; y < 26; y++) { const b = Math.max(1, Math.round((y / 25) * 7)); pm.rect(cx - b, y, b * 2, 1, y < 2 ? P.grarD : P.grar); pm.set(cx - b, y, P.grarD); pm.set(cx + b - 1, y, P.grarD); }
  pm.rect(cx - 4, 34, 8, 8, P.krem).ramma(cx - 4, 34, 8, 8, P.grarDD).rect(cx, 36, 1, 3, P.blek).rect(cx, 38, 2, 1, P.blek);
  for (let y = 48; y < h - 24; y += 10) pm.rect(cx - 2, y, 4, 6, P.navyD);
  pm.rect(cx - 6, h - 18, 12, 18, P.grarDD).rect(cx - 5, h - 17, 10, 17, P.navy).rect(cx - 5, h - 17, 10, 1, P.navyL);
  return pm;
}
export function viti(w = 28, h = 84) {
  const pm = new Pixmap(w, h), cx = w >> 1;
  for (let y = 20; y < h; y++) {
    const b = Math.round(5 + ((y - 20) / (h - 20)) * 6), band = (((y - 20) / 12) | 0) % 2;
    pm.rect(cx - b, y, b * 2, 1, band ? P.rautt : P.hvitt);
    pm.set(cx - b, y, P.blek); pm.set(cx + b - 1, y, P.blek);
    pm.rect(cx + b - 3, y, 2, 1, band ? "#A81C00" : P.grar);
  }
  pm.rect(cx - 8, 18, 16, 3, P.blek);
  pm.rect(cx - 5, 8, 10, 10, P.blek).rect(cx - 4, 9, 8, 8, P.ljos);
  for (let y = 0; y < 8; y++) { const b = Math.round(1 + (y / 7) * 6); pm.rect(cx - b, y, b * 2, 1, P.rautt); }
  pm.rect(cx - 3, h - 14, 6, 14, P.navy).rect(cx - 3, h - 14, 6, 1, P.navyL);
  return pm;
}
export function ferja(w = 72, h = 34) {
  const pm = new Pixmap(w, h);
  for (let y = 18; y < h; y++) { const inn = Math.round(((y - 18) / (h - 18)) * 8); pm.rect(inn, y, w - inn * 2 - 2, 1, y < 21 ? P.hvitt : P.navy); }
  pm.rect(0, 18, w - 2, 1, P.blek);
  texti(pm, "REYTAL", 14, 22, P.krem);
  pm.rect(12, 6, 40, 12, P.hvitt).ramma(12, 6, 40, 12, P.blek);
  for (let x = 15; x < 50; x += 7) pm.rect(x, 9, 4, 4, P.gler);
  // strompurinn stendur á dekkinu (y 18), ekki fljótandi fyrir ofan það
  pm.rect(52, 0, 7, 18, P.appels).rect(52, 0, 7, 2, P.blek).rect(53, 2, 2, 16, P.moldL).rect(57, 2, 2, 16, P.mold).rect(52, 8, 7, 2, P.navy);
  pm.rect(4, 12, 1, 6, P.blek).rect(2, 13, 4, 1, P.blek);
  return pm;
}
export function bryggja(w = 48) {
  const pm = new Pixmap(w, 20);
  pm.rect(0, 0, w, 4, P.moldL).rect(0, 3, w, 1, P.moldD);
  for (let x = 2; x < w; x += 12) pm.rect(x, 4, 3, 16, P.moldD);
  for (let x = 0; x < w; x += 4) pm.set(x, 1, P.mold);
  return pm;
}

// ── Tallinn: turnar, múr, ljósker, gildishús ───────────────────────────────
export function hringturn(w = 36, h = 92) {
  const pm = new Pixmap(w, h), cx = w >> 1;
  for (let y = 0; y < 26; y++) { const b = Math.round(1 + (y / 25) * (cx - 1)); pm.rect(cx - b, y, b * 2, 1, y % 4 === 3 ? "#A81C00" : P.rautt); pm.set(cx - b, y, P.moldD); pm.set(cx + b - 1, y, P.moldD); }
  pm.rect(cx, 0, 1, 2, P.gull);
  pm.rect(2, 26, w - 4, h - 26, "#8A8070");
  const r = slembi(11);
  for (let y = 28; y < h; y += 4) for (let x = 3 + ((y / 4) % 2) * 3; x < w - 4; x += 6) pm.rect(x, y, 5, 3, r() > 0.5 ? "#A49A88" : "#9A9080");
  pm.rect(2, 26, 3, h - 26, "#6E6658").rect(w - 6, 26, 4, h - 26, "#6E6658");
  [[cx - 2, 40], [cx - 2, 60]].forEach(([x, y]) => pm.rect(x, y, 4, 7, P.blek).rect(x + 1, y + 1, 2, 5, P.ljos));
  return pm;
}
export function mur(w = 64, h = 44) {
  const pm = new Pixmap(w, h).rect(0, 6, w, h - 6, "#7A7262");
  for (let x = 0; x < w; x += 8) pm.rect(x, 0, 5, 6, "#7A7262");
  const r = slembi(5);
  for (let y = 8; y < h; y += 5) for (let x = (y % 2) * 4; x < w; x += 8) pm.rect(x + 1, y, 6, 3, r() > 0.5 ? "#8A8070" : "#6E6658");
  return pm;
}
export function ljosker(h = 40) {
  const pm = new Pixmap(12, h);
  pm.rect(5, 10, 2, h - 10, P.blek).rect(3, h - 2, 6, 2, P.blek);
  pm.rect(2, 2, 8, 8, P.blek).rect(3, 3, 6, 6, P.ljos).rect(4, 0, 4, 2, P.blek);
  return pm;
}
export function tungl() {
  const pm = new Pixmap(16, 16);
  pm.sporbaugur(8, 8, 7, 7, P.gullL);
  pm.sporbaugur(5, 6, 1, 1, P.sage).sporbaugur(10, 10, 1, 1, P.sage).set(10, 4, P.sage).set(4, 11, P.sage);
  return pm;
}
// Gildishús með stöllóttum gafli, eins og í gamla bænum í Tallinn
export function gildishus(w = 80, h = 96) {
  const pm = new Pixmap(w, h), cx = w >> 1;
  const stallar = 6;
  for (let s = 0; s < stallar; s++) {
    const b = 8 + s * ((w / 2 - 8) / (stallar - 1));
    pm.rect(Math.round(cx - b), s * 7, Math.round(b * 2), 7, P.sand);
    pm.rect(Math.round(cx - b), s * 7, Math.round(b * 2), 1, P.hvitt);
  }
  pm.rect(0, stallar * 7, w, h - stallar * 7, P.sand);
  pm.rect(cx - 1, 0, 2, 4, P.blek).set(cx, -1, P.gull);
  // Gluggar: speglaðir um miðjuna (miðgluggi og pör til hliðanna með jöfnu bili).
  // Hver röð fær aðeins þau pör sem komast fyrir innan gaflsins í þeirri hæð, og
  // gluggar við hurðina standa með sama bili frá henni og hver frá öðrum.
  const halfBreidd = (y) => (y < stallar * 7 ? 8 + Math.floor(y / 7) * ((w / 2 - 8) / (stallar - 1)) : w / 2);
  const BIL = 15, GW = 8, GH = 11, JADAR = 4, dyrHalf = 9, dyrEfst = h - 38;
  const glugga = (x, y, ljos) => pm.rect(x, y, GW, GH, P.navyD).rect(x + 1, y + 1, GW - 2, GH - 2, ljos ? P.ljos : P.nott3).rect(x + 4, y + 1, 1, GH - 2, P.navyD);
  let rod = 0;
  for (let y = 12; y + GH <= h - 6; y += 16, rod++) {
    const hb = halfBreidd(y), vidDyr = y + GH > dyrEfst - 3;
    for (let k = 0; k * BIL + GW / 2 + JADAR <= hb; k++) {
      if (vidDyr && k * BIL - GW / 2 < dyrHalf + 3) continue;          // ekki ofan í eða alveg upp við hurðina
      const ljos = (rod + k) % 3 !== 1;                                 // sum herbergi myrk, en sama mynstur báðum megin
      glugga(cx - GW / 2 + k * BIL, y, ljos);
      if (k) glugga(cx - GW / 2 - k * BIL, y, ljos);
    }
  }
  pm.rect(cx - 9, h - 28, 18, 28, "#5A3A1A");
  for (let y = 0; y < 9; y++) { const r = Math.round(Math.sqrt(81 - (9 - y) * (9 - y))); pm.rect(cx - r, h - 37 + y, r * 2, 1, "#5A3A1A"); }
  pm.rect(cx - 7, h - 30, 14, 30, "#7A4E24").rect(cx - 1, h - 30, 2, 30, "#5A3A1A").rect(cx + 3, h - 14, 2, 2, P.gull);
  pm.rect(0, stallar * 7, 2, h - stallar * 7, "#C8C0B0").rect(w - 2, stallar * 7, 2, h - stallar * 7, "#C8C0B0");
  return pm;
}
export function stjarna(s = 0) {
  const pm = new Pixmap(5, 5);
  if (s) pm.rect(2, 0, 1, 5, P.gullL).rect(0, 2, 5, 1, P.gullL).set(2, 2, P.hvitt);
  else pm.set(2, 2, P.hvitt);
  return pm;
}

// ── Skilti með texta: viðarfjöl á tveimur stólpum ──────────────────────────
export function skilti(t, w0) {
  const tw = textaBreidd(t), w = Math.max(w0 || 0, tw + 8), h = 14;
  const pm = new Pixmap(w, h + 10);
  pm.rect(4, h, 2, 10, P.moldD).rect(w - 6, h, 2, 10, P.moldD);
  pm.rect(0, 0, w, h, P.moldD).rect(1, 1, w - 2, h - 2, P.moldL).rect(1, h - 3, w - 2, 1, P.mold);
  texti(pm, t, ((w - tw) / 2) | 0, 3, P.blek);
  return pm;
}
// Talbóla yfir fígúrunni
export function bola(t) {
  const tw = textaBreidd(t), w = tw + 8, pm = new Pixmap(w, 17);
  pm.rect(1, 0, w - 2, 13, P.blek).rect(0, 1, w, 11, P.blek).rect(2, 1, w - 4, 11, P.hvitt).rect(1, 2, w - 2, 9, P.hvitt);
  pm.rect((w >> 1) - 2, 13, 5, 1, P.blek).rect((w >> 1) - 1, 14, 3, 1, P.blek).set(w >> 1, 15, P.blek);
  pm.rect((w >> 1) - 1, 12, 3, 1, P.hvitt).set(w >> 1, 13, P.hvitt);
  texti(pm, t, 4, 2, P.blek);
  return pm;
}

// ── Tákn 12×12 fyrir þjónustu, merki og samband ────────────────────────────
export const TAKN = {
  kodi(pm, c) { lina(pm, 3, 2, 0, 5, c); lina(pm, 0, 6, 3, 9, c); lina(pm, 8, 2, 11, 5, c); lina(pm, 11, 6, 8, 9, c); lina(pm, 7, 1, 4, 10, c); },
  karfa(pm, c) { lina(pm, 0, 1, 2, 1, c); lina(pm, 2, 1, 4, 7, c); pm.rect(3, 2, 9, 1, c); lina(pm, 11, 2, 10, 6, c); pm.rect(4, 7, 7, 1, c); pm.rect(4, 9, 2, 2, c); pm.rect(9, 9, 2, 2, c); },
  penni(pm, c) { for (let i = 0; i < 8; i++) pm.rect(2 + i, 9 - i, 2, 2, c); pm.rect(0, 10, 2, 2, c); pm.rect(10, 0, 2, 2, P.appels); },
  leit(pm, c) { hringur(pm, 4.5, 4.5, 3.5, c); lina(pm, 7, 7, 11, 11, c); lina(pm, 8, 7, 11, 10, c); },
  neisti(pm, c) { lina(pm, 5, 0, 5, 10, c); lina(pm, 0, 5, 10, 5, c); pm.rect(4, 4, 3, 3, c); pm.rect(9, 0, 1, 3, c); pm.rect(8, 1, 3, 1, c); },
  tannhjol(pm, c) { hringur(pm, 5.5, 5.5, 3.5, c); hringur(pm, 5.5, 5.5, 1.2, c); [[5, 0], [5, 10], [0, 5], [10, 5], [1, 1], [9, 1], [1, 9], [9, 9]].forEach(([x, y]) => pm.rect(x, y, 2, 2, c)); },
  thjonn(pm, c) { [0, 4, 8].forEach((y) => { pm.ramma(0, y, 12, 4, c); pm.set(2, y + 1, P.grasL); pm.set(4, y + 1, P.gull); }); },
  ritill(pm, c) { pm.rect(0, 11, 12, 1, c); pm.rect(1, 7, 2, 4, c); pm.rect(4, 4, 2, 7, c); pm.rect(7, 6, 2, 5, c); pm.rect(10, 1, 2, 10, c); },
  bikar(pm, c) { pm.rect(2, 0, 8, 5, c); pm.rect(3, 5, 6, 1, c); pm.rect(5, 6, 2, 3, c); pm.rect(3, 9, 6, 2, c); pm.set(0, 1, c); pm.set(0, 2, c); pm.set(1, 3, c); pm.set(11, 1, c); pm.set(11, 2, c); pm.set(10, 3, c); pm.rect(4, 1, 1, 2, P.hvitt); },
  bref(pm, c) { pm.ramma(0, 2, 12, 8, c); lina(pm, 0, 2, 5, 6, c); lina(pm, 11, 2, 6, 6, c); },
  pinni(pm, c) { pm.sporbaugur(5, 4, 4, 4, c); pm.sporbaugur(5, 4, 1, 1, null); lina(pm, 2, 7, 5, 11, c); lina(pm, 8, 7, 5, 11, c); },
  simi(pm, c) { pm.ramma(3, 0, 6, 12, c); pm.rect(5, 10, 2, 1, c); pm.rect(5, 1, 2, 1, c); },
  hjarta(pm, c) { pm.kort(["..##..##....", ".####.####..", "##########..", "##########..", ".########...", "..######....", "...####.....", "....##......"], { "#": c }, 1, 2); },
  hnottur(pm, c) { hringur(pm, 5.5, 5.5, 5, c); lina(pm, 0, 5, 11, 5, c); lina(pm, 5, 0, 5, 11, c); hringur(pm, 5.5, 5.5, 2.5, c); },
};
export function takn(nafn, c = P.krem, skali = 1) {
  const pm = new Pixmap(12, 12);
  (TAKN[nafn] || TAKN.neisti)(pm, c);
  if (skali === 1) return pm;
  const s = new Pixmap(12 * skali, 12 * skali);
  for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) { const k = pm.get(x, y); if (k) s.rect(x * skali, y * skali, skali, skali, [...k]); }
  return s;
}

// Bikarinn fyrir afrekið (16×16)
export function verdlaunabikar() {
  const pm = new Pixmap(16, 16);
  pm.rect(3, 0, 10, 7, P.moldD).rect(4, 1, 8, 5, P.gull).rect(5, 1, 2, 4, P.gullL);
  pm.rect(0, 1, 3, 1, P.moldD).rect(0, 2, 1, 3, P.moldD).rect(1, 5, 2, 1, P.moldD);
  pm.rect(13, 1, 3, 1, P.moldD).rect(15, 2, 1, 3, P.moldD).rect(13, 5, 2, 1, P.moldD);
  pm.rect(5, 7, 6, 1, P.moldD).rect(7, 8, 2, 3, P.gull).rect(4, 11, 8, 2, P.moldD).rect(3, 13, 10, 3, P.navy).rect(3, 13, 10, 1, P.navyL);
  return pm;
}

export { merki };
