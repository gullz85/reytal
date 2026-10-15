// Pixlakort og pixlaletur REYTAL 8-bit.
//
// Öll pixlalist frumgerðarinnar er teiknuð hér, pixel fyrir pixel, á Pixmap:
// einfalt RGBA-fylki sem keyrir bæði í vafranum (→ canvas) og í Node
// (→ PNG í assets/pixel, sjá scripts/build-assets.mjs). Engar myndir eru
// sóttar og ekkert er fengið að láni úr Nintendo-leikjum.

// ── Litaspjaldið: takmarkað eins og á NES, en með litum REYTAL ─────────────
export const P = {
  svart: "#000000", blek: "#0B0C0D", hvitt: "#FCFCFC", krem: "#F3F0EA", sand: "#E9E5DC",
  navy: "#0D4659", navyD: "#062834", navyL: "#3d8aa6", slate: "#4C7C93", sage: "#BEBFA6",
  himinn: "#5C94FC", himinnL: "#A4E4FC", gras: "#00A844", grasL: "#58D854", grasD: "#005800",
  mold: "#C84C0C", moldD: "#7C2C00", moldL: "#FC9838", gull: "#F8B800", gullL: "#FCE0A8",
  rautt: "#D82800", rauttL: "#F87858", appels: "#E07A45", grar: "#BCBCBC", grarD: "#7C7C7C",
  grarDD: "#3C3C3C", fjall: "#6888FC", fjallD: "#4468C8", nott: "#0B1B33", nott2: "#122A4A",
  nott3: "#1C3D63", gler: "#78C8F0", ljos: "#FCE4A0", fjola: "#6844FC", bleikt: "#F878F8",
};

const skyndi = new Map();
export function litur(c) {
  if (Array.isArray(c)) return c;
  let v = skyndi.get(c);
  if (!v) {
    const h = c.replace("#", "");
    v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length > 6 ? parseInt(h.slice(6, 8), 16) : 255];
    skyndi.set(c, v);
  }
  return v;
}

export class Pixmap {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Uint8ClampedArray(w * h * 4); }
  set(x, y, c) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || c === undefined) return this;
    const i = (y * this.w + x) * 4;
    if (c === null) { this.d[i] = this.d[i + 1] = this.d[i + 2] = this.d[i + 3] = 0; return this; }   // null strokar út
    const [r, g, b, a] = litur(c);
    this.d[i] = r; this.d[i + 1] = g; this.d[i + 2] = b; this.d[i + 3] = a;
    return this;
  }
  get(x, y) { const i = (y * this.w + x) * 4; return this.d[i + 3] ? this.d.slice(i, i + 4) : null; }
  rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c); return this; }
  ramma(x, y, w, h, c) { this.rect(x, y, w, 1, c); this.rect(x, y + h - 1, w, 1, c); this.rect(x, y, 1, h, c); this.rect(x + w - 1, y, 1, h, c); return this; }
  // fyllt sporbaugur, pixlaður (miðja cx,cy og geislar rx,ry)
  sporbaugur(cx, cy, rx, ry, c) {
    for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++)
      if ((x * x) / (rx * rx + 0.6) + (y * y) / (ry * ry + 0.6) <= 1) this.set(cx + x, cy + y, c);
    return this;
  }
  // kort úr textalínum: hver stafur er lykill í litaspjaldi, "." er gegnsætt
  kort(linur, spjald, x0 = 0, y0 = 0) {
    linur.forEach((l, y) => { for (let x = 0; x < l.length; x++) { const k = l[x]; if (k !== "." && k !== " ") this.set(x0 + x, y0 + y, spjald[k]); } });
    return this;
  }
  teikna(p, x0, y0) {
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) { const c = p.get(x, y); if (c) this.set(x0 + x, y0 + y, [...c]); }
    return this;
  }
  spegla() {
    const n = new Pixmap(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) { const c = this.get(x, y); if (c) n.set(this.w - 1 - x, y, [...c]); }
    return n;
  }
  snua180() {
    const n = new Pixmap(this.w, this.h);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) { const c = this.get(x, y); if (c) n.set(this.w - 1 - x, this.h - 1 - y, [...c]); }
    return n;
  }
  // ytri útlína í lit c (fyrir skilti og texta á himni)
  utlina(c) {
    const n = new Pixmap(this.w + 2, this.h + 2);
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.get(x, y))
      for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) n.set(x + i, y + j, c);
    n.teikna(this, 1, 1);
    return n;
  }
  // í vafranum: canvas í réttri stærð
  canvas() {
    const cv = document.createElement("canvas");
    cv.width = this.w; cv.height = this.h;
    cv.getContext("2d").putImageData(new ImageData(this.d, this.w, this.h), 0, 0);
    return cv;
  }
  slod(skali = 1) {
    const c = this.canvas();
    if (skali === 1) return c.toDataURL();
    const s = document.createElement("canvas");
    s.width = this.w * skali; s.height = this.h * skali;
    const x = s.getContext("2d"); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, s.width, s.height);
    return s.toDataURL();
  }
}

// ── Pixlaletur 5×8: hástafir, íslenskir stafir, tölur og nokkur tákn ───────
// Lína 0 er fyrir kommur yfir stöfum; stafir án kommu nota línur 1-7.
const L = {
  "A": [".....", ".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  "B": [".....", "####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  "C": [".....", ".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  "D": [".....", "####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  "E": [".....", "#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  "F": [".....", "#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  "G": [".....", ".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".####"],
  "H": [".....", "#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  "I": [".....", ".###.", "..#..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "J": [".....", "..###", "...#.", "...#.", "...#.", "#..#.", "#..#.", ".##.."],
  "K": [".....", "#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  "L": [".....", "#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  "M": [".....", "#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  "N": [".....", "#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  "O": [".....", ".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  "P": [".....", "####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  "Q": [".....", ".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  "R": [".....", "####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  "S": [".....", ".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  "T": [".....", "#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  "U": [".....", "#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  "V": [".....", "#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  "W": [".....", "#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
  "X": [".....", "#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  "Y": [".....", "#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  "Z": [".....", "#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  "Þ": [".....", "#....", "####.", "#...#", "#...#", "####.", "#....", "#...."],
  "Ð": [".....", "####.", ".#..#", ".#..#", "###.#", ".#..#", ".#..#", "####."],
  "Æ": [".....", ".####", "#.#..", "#.#..", "####.", "#.#..", "#.#..", "#.###"],
  "Ö": [".#.#.", ".....", ".###.", "#...#", "#...#", "#...#", "#...#", ".###."],
  "Á": ["...#.", "..#..", ".###.", "#...#", "#...#", "#####", "#...#", "#...#"],
  "É": ["...#.", "..#..", "#####", "#....", "####.", "#....", "#....", "#####"],
  "Í": ["...#.", "..#..", ".###.", "..#..", "..#..", "..#..", "..#..", ".###."],
  "Ó": ["...#.", "..#..", ".###.", "#...#", "#...#", "#...#", "#...#", ".###."],
  "Ú": ["...#.", "..#..", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  "Ý": ["...#.", "..#..", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  "Ü": [".#.#.", ".....", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  "0": [".....", ".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  "1": [".....", "..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "2": [".....", ".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
  "3": [".....", "#####", "...#.", "..#..", "...#.", "....#", "#...#", ".###."],
  "4": [".....", "...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": [".....", "#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": [".....", "..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
  "7": [".....", "#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  "8": [".....", ".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".....", ".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", ".....", "....."],
  "-": [".....", ".....", ".....", ".....", ".###.", ".....", ".....", "....."],
  ".": [".....", ".....", ".....", ".....", ".....", ".....", ".....", "..#.."],
  ",": [".....", ".....", ".....", ".....", ".....", ".....", "..#..", ".#..."],
  ":": [".....", ".....", ".....", "..#..", ".....", ".....", "..#..", "....."],
  "!": [".....", "..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."],
  "?": [".....", ".###.", "#...#", "....#", "...#.", "..#..", ".....", "..#.."],
  "/": [".....", "....#", "...#.", "...#.", "..#..", ".#...", ".#...", "#...."],
  "'": [".....", "..#..", "..#..", ".....", ".....", ".....", ".....", "....."],
  "+": [".....", ".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
  "→": [".....", ".....", "..#..", "...#.", "#####", "...#.", "..#..", "....."],
  "←": [".....", ".....", "..#..", ".#...", "#####", ".#...", "..#..", "....."],
  "↓": [".....", "..#..", "..#..", "..#..", "#.#.#", ".###.", "..#..", "....."],
  "↑": [".....", "..#..", ".###.", "#.#.#", "..#..", "..#..", "..#..", "....."],
  "×": [".....", ".....", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "....."],
  "·": [".....", ".....", ".....", ".....", "..#..", ".....", ".....", "....."],
  "@": [".....", ".###.", "#...#", "#.###", "#.#.#", "#.##.", "#....", ".###."],
  "&": [".....", ".##..", "#..#.", ".##..", ".#...", "#.#.#", "#..#.", ".##.#"],
};
export const LETUR_H = 8;

// Breidd textastrengs í pixlum (5 + 1 bil á staf)
export function textaBreidd(t) { return Math.max(0, String(t).length * 6 - 1); }

export function texti(pm, t, x, y, c, skali = 1) {
  const s = String(t).toUpperCase();
  for (let n = 0; n < s.length; n++) {
    const g = L[s[n]] || L["?"];
    for (let j = 0; j < 8; j++) for (let i = 0; i < 5; i++) if (g[j][i] === "#")
      for (let b = 0; b < skali; b++) for (let a = 0; a < skali; a++) pm.set(x + (n * 6 + i) * skali + a, y + j * skali + b, c);
  }
  return pm;
}

export function textaKort(t, c, skali = 1) {
  const pm = new Pixmap(Math.max(1, textaBreidd(t) * skali), 8 * skali);
  return texti(pm, t, 0, 0, c, skali);
}

// ── REYTAL-merkið í 8 bitum: REY upprétt, TAL á hvolfi eins og alvöru merkið ──
export function merki(c = P.hvitt, skali = 1) {
  const rey = textaKort("REY", c), tal = textaKort("TAL", c).snua180();
  const w = rey.w + 3, pm = new Pixmap(w, 8 + 8 + 1);
  pm.teikna(rey, 0, 0);
  pm.teikna(tal, 0, 9);
  pm.set(rey.w + 1, 7, c);                                // ®-punkturinn
  if (skali === 1) return pm;
  const s = new Pixmap(pm.w * skali, pm.h * skali);
  for (let y = 0; y < pm.h; y++) for (let x = 0; x < pm.w; x++) { const k = pm.get(x, y); if (k) s.rect(x * skali, y * skali, skali, skali, [...k]); }
  return s;
}
