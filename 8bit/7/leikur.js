// Leikvöllurinn: lítill hliðarskrunsheimur efst á hverri 8-bita síðu.
//
// Vefurinn þarf ekki leikinn. Allt sem hann gerir er líka hægt að smella á
// (hús, kubba, bita), og efnið sjálft er í textanum fyrir neðan. Lyklaborðið
// tekur aðeins við stýringu þegar gesturinn hefur ýtt á START eða smellt á
// völlinn, og sleppir með Esc eða smelli annars staðar.
import { dropi, biti, rKubbur, bola, kall } from "./sprites.js";
import { spila } from "./audio.js";
import { bitar, finnaBita, BAETI } from "./astand.js";
import { ramma, rolegt } from "./transition.js";

const G = 900, STOKK = -335, HRADI = 98, HROD = 700, NUNINGUR = 900;
const myndir = new Map();
// Pixmap → canvas, einu sinni
export function mynd(lykill, smid) {
  let c = myndir.get(lykill);
  if (!c) { c = smid().canvas(); myndir.set(lykill, c); }
  return c;
}

export class Leikvollur {
  constructor(gamur, heimur, { onStadur, onBiti, onStadreynd } = {}) {
    this.g = gamur; this.h = heimur;
    this.onStadur = onStadur; this.onBiti = onBiti; this.onStadreynd = onStadreynd;
    this.cv = document.createElement("canvas");
    this.cv.className = "r8-leikur-cv";
    this.cv.setAttribute("aria-hidden", "true");
    this.ctx = this.cv.getContext("2d");
    gamur.prepend(this.cv);
    this.t = 0; this.virkur = false; this.lifandi = true;
    this.lyklar = new Set(); this.agnir = [];
    const fundnir = new Set(bitar());
    this.kubbar = (heimur.kubbar || []).map((k) => ({ ...k, notadur: k.biti != null && fundnir.has(k.biti), hopp: 0 }));
    this.mynt = (heimur.bitar || []).filter((b) => !fundnir.has(b.n)).map((b) => ({ ...b }));
    this.stadir = heimur.stadir || [];
    // þjónustukallar sem rölta fram og til baka og segja eitthvað þegar Dropi kemur
    this.kallar = (heimur.kallar || []).map((k) => ({ ...k, x: k.fra + Math.random() * (k.til - k.fra), att: Math.random() < 0.5 ? -1 : 1, bid: 0, bola: 0, lina: -1, naer: false, veifa: 0, hopp: 0 }));
    this.p = { x: heimur.upphaf || 40, y: -60, vx: 0, vy: 0, a: false, att: 1, lending: 0, blikk: 0 };
    this.sjalf = { mark: this.p.x, bid: 1.5 };
    this.staerd();
    this.ro = new ResizeObserver(() => this.staerd());
    this.ro.observe(gamur);
    this.tengja();
    this.sidast = performance.now();
    ramma((t) => this.lykkja(t));
  }

  staerd() {
    const r = this.g.getBoundingClientRect();
    const S = r.height >= 500 && r.width >= 700 ? 3 : 2;
    this.S = S;
    this.lw = Math.ceil(r.width / S); this.lh = Math.ceil(r.height / S);
    this.cv.width = this.lw; this.cv.height = this.lh;
    this.cv.style.width = this.lw * S + "px"; this.cv.style.height = this.lh * S + "px";
    this.YG = this.lh - 32;                      // efri brún jarðar
    this.ctx.imageSmoothingEnabled = false;
  }

  // hæð yfir jörð → y í heiminum
  y(haed, h = 0) { return this.YG - haed - h; }
  kassiKubbs(k) { return { x: k.x, y: this.y(k.haed, 16), w: 16, h: 16 }; }

  // ── Inntak ─────────────────────────────────────────────────────────────
  tengja() {
    const skrifar = (t) => t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    // opinn gluggi (NES-gluggi eða tilkynning) á lyklaborðið á meðan; leikurinn bíður
    const gluggiOpinn = () => !!document.querySelector(".r8-gluggi-bak");
    this.kd = (e) => {
      if (!this.virkur || skrifar(e.target) || e.metaKey || e.ctrlKey || e.altKey || gluggiOpinn()) return;
      const k = e.key;
      if (k === "Escape") { this.setjaVirkan(false); return; }
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "a", "d", "w", "s", "z", "A", "D", "W", "S", "Z", "Enter"].includes(k)) {
        e.preventDefault();
        if (!this.lyklar.has(k)) {
          if ([" ", "ArrowUp", "w", "W", "z", "Z"].includes(k)) this.stokkva();
          if (["ArrowDown", "s", "S", "Enter"].includes(k)) this.fara();
        }
        this.lyklar.add(k);
      }
    };
    this.ku = (e) => this.lyklar.delete(e.key);
    // smellur annars staðar á síðunni sleppir stýringunni, en ekki smellur í glugga sem leikurinn opnaði
    this.utan = (e) => { if (this.virkur && !this.g.contains(e.target) && !e.target.closest?.(".r8-gluggi-bak")) this.setjaVirkan(false); };
    addEventListener("keydown", this.kd);
    addEventListener("keyup", this.ku);
    addEventListener("pointerdown", this.utan, true);
    addEventListener("blur", () => this.lyklar.clear());

    this.cv.addEventListener("pointermove", (e) => { this.cv.style.cursor = this.hitta(e) ? "pointer" : this.virkur ? "default" : "pointer"; });
    this.cv.addEventListener("click", (e) => {
      const h = this.hitta(e);
      if (h) return this.smella(h);
      if (!this.virkur) this.setjaVirkan(true);
    });

    // snertistýringar (birtast aðeins þegar leikurinn er virkur á snertiskjá)
    const s = document.createElement("div");
    s.className = "r8-snerting";
    s.innerHTML = '<button type="button" data-k="ArrowLeft" aria-label="Til vinstri">◀</button><button type="button" data-k="ArrowRight" aria-label="Til hægri">▶</button>' +
      '<span></span><button type="button" class="r8-inn" data-k="Enter" aria-label="Fara inn" hidden>INN</button><button type="button" class="r8-a" data-k=" " aria-label="Stökkva">A</button>';
    s.querySelectorAll("button").forEach((b) => {
      const k = b.dataset.k;
      const nidur = (e) => { e.preventDefault(); b.setPointerCapture?.(e.pointerId); this.lyklar.add(k); if (k === " ") this.stokkva(); if (k === "Enter") this.fara(); };
      const upp = () => this.lyklar.delete(k);
      b.addEventListener("pointerdown", nidur); b.addEventListener("pointerup", upp); b.addEventListener("pointercancel", upp); b.addEventListener("lostpointercapture", upp);
      b.addEventListener("contextmenu", (e) => e.preventDefault());
    });
    this.g.appendChild(s);
    this.snerting = s;
  }

  setjaVirkan(v) {
    if (this.virkur === v) return;
    this.virkur = v;
    this.lyklar.clear();
    this.g.classList.toggle("virkur", v);
    if (v) { spila("velja"); this.g.focus({ preventScroll: true }); }
    this.g.dispatchEvent(new CustomEvent("r8:virkur", { detail: v }));
  }

  // smellur á canvas: (x,y) á skjá → heimur
  hitta(e) {
    const r = this.cv.getBoundingClientRect();
    const x = (e.clientX - r.left) / this.S + this.cam, y = (e.clientY - r.top) / this.S;
    for (const m of this.mynt) if (x >= m.x - 2 && x <= m.x + 12 && y >= this.y(m.haed, 14) - 2 && y <= this.y(m.haed) + 2) return { tegund: "mynt", m };
    for (const k of this.kubbar) { const b = this.kassiKubbs(k); if (x >= b.x && x <= b.x + 16 && y >= b.y && y <= b.y + 16) return { tegund: "kubbur", k }; }
    for (const k of this.kallar) if (x >= k.x && x <= k.x + 16 && y >= this.YG - 22 && y <= this.YG) return { tegund: "kall", k };
    for (const s of this.stadir) { const w = s.mynd.width, h = s.mynd.height; if (x >= s.x && x <= s.x + w && y >= this.y(0, h) + (s.dypi || 0) && y <= this.YG + (s.dypi || 0)) return { tegund: "stadur", s }; }
    return null;
  }
  smella(h) {
    if (h.tegund === "mynt") this.safna(h.m);
    else if (h.tegund === "kubbur") this.lemja(h.k);
    else if (h.tegund === "stadur") { spila("inn"); this.onStadur?.(h.s); }
    else if (h.tegund === "kall") { this.heilsa(h.k); h.k.bola = 3; }
  }

  stokkva() {
    if (this.p.a) return;
    this.p.vy = STOKK; this.p.a = true; spila("hopp");
  }
  fara() { const s = this.vidDyr(); if (s) { spila("inn"); this.onStadur?.(s); } }
  vidDyr() {
    const mx = this.p.x + 8;
    return this.stadir.find((s) => mx > s.x + s.dyr[0] && mx < s.x + s.dyr[1] && !this.p.a) || null;
  }

  lemja(k) {
    k.hopp = 0.16;
    spila("dynkur");
    if (k.biti != null && !k.notadur) {
      k.notadur = true;
      this.agnir.push({ teg: "mynt", x: k.x + 3, y: this.y(k.haed, 16) - 14, vy: -150, lif: 0.55, n: k.biti });
      if (finnaBita(k.biti)) { setTimeout(() => spila("biti"), 60); this.onBiti?.(k.biti); }
    }
    if (k.stadreynd) this.onStadreynd?.(k.stadreynd);
  }
  safna(m) {
    this.mynt = this.mynt.filter((x) => x !== m);
    this.agnir.push({ teg: "glampi", x: m.x + 5, y: this.y(m.haed, 7), lif: 0.3 });
    if (finnaBita(m.n)) { spila("biti"); this.onBiti?.(m.n); }
  }

  // ── Eðlisfræði ─────────────────────────────────────────────────────────
  hreyfa(dt) {
    const p = this.p, L = this.lyklar;
    let stefna = 0;
    if (this.virkur) {
      if (L.has("ArrowLeft") || L.has("a") || L.has("A")) stefna -= 1;
      if (L.has("ArrowRight") || L.has("d") || L.has("D")) stefna += 1;
    } else if (!rolegt()) {
      // sjálfstýring: Dropi röltir um og hoppar stundum, safnar engu
      const s = this.sjalf;
      s.bid -= dt;
      if (s.bid <= 0) {
        s.mark = Math.max(24, Math.min(this.h.breidd - 60, this.cam + 30 + Math.random() * (this.lw - 80)));
        s.bid = 2.2 + Math.random() * 3;
        if (Math.random() < 0.35) setTimeout(() => !this.virkur && !this.p.a && ((this.p.vy = STOKK * 0.75), (this.p.a = true)), 300);
      }
      if (Math.abs(s.mark - p.x) > 4) stefna = Math.sign(s.mark - p.x) * 0.55;
    }
    if (stefna) { p.vx += stefna * HROD * dt; p.att = Math.sign(stefna); }
    else p.vx -= Math.sign(p.vx) * Math.min(Math.abs(p.vx), NUNINGUR * dt);
    const hamark = HRADI * (stefna ? Math.abs(stefna) : 1);
    p.vx = Math.max(-hamark, Math.min(hamark, p.vx));
    p.vy = Math.min(p.vy + G * dt, 520);

    // lárétt
    p.x += p.vx * dt;
    p.x = Math.max(4, Math.min(this.h.breidd - 20, p.x));
    for (const b of this.fastir()) if (this.skarast(p, b)) { p.x = p.vx > 0 ? b.x - 14 : b.x + b.w - 2; p.vx = 0; }
    // lóðrétt
    const vaeri = p.a;
    p.y += p.vy * dt;
    p.a = true;
    if (p.y + 16 >= this.YG) { p.y = this.YG - 16; p.vy = 0; p.a = false; }
    for (const b of this.fastir()) if (this.skarast(p, b)) {
      if (p.vy > 0) { p.y = b.y - 16; p.vy = 0; p.a = false; }
      else if (p.vy < 0) { p.y = b.y + b.h - 4; p.vy = 30; if (b.kubbur && this.virkur) this.lemja(b.kubbur); else if (b.kubbur) { b.kubbur.hopp = 0.16; } }
    }
    if (vaeri && !p.a) { p.lending = 0.12; this.agnir.push({ teg: "ryk", x: p.x + 2, y: p.y + 15, lif: 0.25 }, { teg: "ryk", x: p.x + 12, y: p.y + 15, lif: 0.25 }); }

    if (this.virkur) for (const m of [...this.mynt]) {
      const my = this.y(m.haed, 14);
      if (p.x + 14 > m.x && p.x + 2 < m.x + 10 && p.y + 16 > my && p.y + 4 < my + 14) this.safna(m);
    }
    // fígúran: 16×16, árekstrarkassi 12 breiður og 12 hár neðst
    this.kallaRolt(dt);
  }
  kallaRolt(dt) {
    const p = this.p;
    for (const k of this.kallar) {
      const dx = p.x - k.x, naer = Math.abs(dx) < 26 && p.y > this.YG - 50;
      k.veifa = Math.max(0, k.veifa - dt); k.hopp = Math.max(0, k.hopp - dt);
      if (naer) {
        if (!k.naer) this.heilsa(k);
        k.naer = true; k.bola = Math.max(k.bola, 0.5); k.att = Math.sign(dx) || k.att;
        continue;
      }
      k.naer = false;
      k.bola = Math.max(0, k.bola - dt);
      if (rolegt()) continue;
      if (k.bid > 0) { k.bid -= dt; continue; }
      k.x += k.att * k.hradi * dt;
      if (k.x <= k.fra) { k.x = k.fra; k.att = 1; }
      if (k.x >= k.til) { k.x = k.til; k.att = -1; }
      if (Math.random() < dt / 5) {
        // stoppar stundum; annað hvert sinn veifar hann til gestsins og kynnir sig
        k.bid = 1.2 + Math.random() * 1.4;
        const synilegur = k.x - this.cam > 8 && k.x - this.cam < this.lw - 24;
        if (synilegur && Math.random() < 0.5) { k.veifa = k.bid; k.bola = k.bid; k.lina = 0; }
      }
    }
  }
  // Dropi kemur: lítið hopp, veifa og næsta lína (sú fyrsta er alltaf kynningin)
  heilsa(k) {
    k.lina = (k.lina + 1) % k.linur.length;
    k.veifa = 1.6; k.hopp = 0.3; k.bid = 0;
    if (this.virkur) spila("velja");
  }
  fastir() {
    const a = this.kubbar.map((k) => ({ ...this.kassiKubbs(k), kubbur: k }));
    for (const pl of this.h.pallar || []) a.push({ x: pl.x, y: this.y(pl.haed, 16), w: pl.breidd, h: 16 });
    return a;
  }
  skarast(p, b) { return p.x + 14 > b.x && p.x + 2 < b.x + b.w && p.y + 16 > b.y && p.y + 4 < b.y + b.h; }

  // ── Teikning ───────────────────────────────────────────────────────────
  teikna() {
    const c = this.ctx, p = this.p, t = this.t;
    const mark = Math.round(p.x + 8 - this.lw * 0.42);
    this.cam = this.h.breidd <= this.lw ? Math.round((this.h.breidd - this.lw) / 2) : Math.max(0, Math.min(this.h.breidd - this.lw, mark));
    const cam = this.cam;
    c.clearRect(0, 0, this.lw, this.lh);
    this.h.bakgrunnur(c, { cam, t, lw: this.lw, lh: this.lh, YG: this.YG, rolegt: rolegt() });

    for (const s of this.h.skraut || []) {
      const m = s.mynd, x = Math.round(s.x - cam * (s.parallax ?? 1)), yy = this.y(s.haed || 0, m.height) + (s.vagga ? Math.round(Math.sin(t * 2 + s.x) * 1.2) : 0);
      if (x + m.width < 0 || x > this.lw) continue;
      c.drawImage(m, x, yy);
      s.eftir?.(c, x, yy, t);
    }
    for (const s of this.stadir) {
      const m = s.mynd, x = Math.round(s.x - cam), yy = this.y(0, m.height) + (s.dypi || 0);
      if (x + m.width < -60 || x > this.lw + 60) continue;
      c.drawImage(m, x, yy);
      s.eftir?.(c, x, yy, t);
      if (s.skilti) c.drawImage(s.skilti, x + s.skiltiX, this.y(s.skiltiHaed ?? 0, s.skilti.height));
    }
    // jörðin
    this.h.jord(c, { cam, lw: this.lw, lh: this.lh, YG: this.YG, t });
    for (const pl of this.h.pallar || []) {
      const ms = this.h.pallMynd;
      for (let x = 0; x < pl.breidd; x += 16) c.drawImage(ms, Math.round(pl.x + x - cam), this.y(pl.haed, 16));
    }
    for (const k of this.kubbar) {
      if (k.hopp > 0) k.hopp -= 1 / 60;
      const lyft = k.hopp > 0 ? Math.round(Math.sin((k.hopp / 0.16) * Math.PI) * 4) : 0;
      c.drawImage(mynd(k.notadur ? "r-notadur" : "r", () => rKubbur(k.notadur)), Math.round(k.x - cam), this.y(k.haed, 16) - lyft);
    }
    const rammi = Math.floor(t * 8) % 4;
    for (const m of this.mynt) {
      const bob = Math.round(Math.sin(t * 3 + m.x) * 2);
      c.drawImage(mynd(`b${m.n}${rammi}`, () => biti(String(BAETI_GILDI(m.n)), rammi)), Math.round(m.x - cam), this.y(m.haed, 14) + bob);
    }
    // þjónustukallarnir
    for (const k of this.kallar) {
      const x = Math.round(k.x - cam);
      if (x < -160 || x > this.lw + 160) continue;
      const r = k.veifa > 0 ? 2 + (Math.floor(t * 7) % 2) : !k.naer && k.bid <= 0 && !rolegt() ? Math.floor(t * 6 + k.x / 40) % 2 : 0;
      const lyft = k.hopp > 0 ? Math.round(Math.sin((k.hopp / 0.3) * Math.PI) * 5) : 0;
      c.drawImage(mynd(`kall-${k.tegund}${r}${k.att}`, () => kall(k.tegund, r, k.att)), x - 2, this.YG - 20 - lyft);
      // bólan aðeins ef kallinn sjálfur sést; annars svífur hún við skjábrúnina án kalls
      if (k.bola > 0 && k.lina >= 0 && x >= 0 && x <= this.lw - 16) {
        const b = mynd(`kb-${k.tegund}${k.lina}`, () => bola(k.linur[k.lina]));
        c.drawImage(b, Math.max(2, Math.min(this.lw - b.width - 2, x + 8 - (b.width >> 1))), this.YG - 42 - lyft + Math.round(Math.sin(t * 5)));
      }
    }
    // fígúran
    let rf = "kyrr";
    if (p.lending > 0) rf = "kremja";
    else if (p.a) rf = p.vy < 0 ? "teygja" : "kyrr";
    else if (p.blikk > 0) rf = "blikk";
    else if (Math.abs(p.vx) > 10 && Math.floor(t * 10) % 2) rf = "kremja";
    const gull = this.h.gull?.();
    c.drawImage(mynd(`d${rf}${p.att}${gull ? "g" : ""}`, () => dropi(rf, p.att, gull)), Math.round(p.x - cam), Math.round(p.y));
    // agnir
    this.agnir = this.agnir.filter((a) => (a.lif -= 1 / 60) > 0);
    for (const a of this.agnir) {
      if (a.teg === "mynt") { a.vy += G * (1 / 60); a.y += a.vy / 60; c.drawImage(mynd(`b${a.n}${rammi}`, () => biti(String(BAETI_GILDI(a.n)), rammi)), Math.round(a.x - cam), Math.round(a.y)); }
      else if (a.teg === "ryk") { c.fillStyle = "#FCFCFC"; c.fillRect(Math.round(a.x - cam + (a.x % 2 ? -1 : 1) * (0.25 - a.lif) * 20), Math.round(a.y - (0.25 - a.lif) * 12), 2, 2); }
      else if (a.teg === "glampi") { c.fillStyle = "#FCE0A8"; const r = Math.round((0.3 - a.lif) * 30); c.fillRect(Math.round(a.x - cam - r), Math.round(a.y), 2, 2); c.fillRect(Math.round(a.x - cam + r), Math.round(a.y), 2, 2); c.fillRect(Math.round(a.x - cam), Math.round(a.y - r), 2, 2); c.fillRect(Math.round(a.x - cam), Math.round(a.y + r), 2, 2); }
    }
    // bóla við dyr
    const s = this.virkur ? this.vidDyr() : null;
    this.snerting.querySelector(".r8-inn").hidden = !s;
    if (s) {
      const b = mynd("bola-" + s.id, () => bola(s.bola || "↓ INN"));
      c.drawImage(b, Math.round(p.x + 8 - b.width / 2 - cam), Math.round(p.y - 20 + Math.sin(t * 6)));
    }
  }

  lykkja(nu) {
    if (!this.lifandi) return;
    const dt = Math.min(0.033, (nu - this.sidast) / 1000);
    this.sidast = nu; this.t += dt;
    const p = this.p;
    p.lending = Math.max(0, p.lending - dt);
    p.blikk = p.blikk > 0 ? p.blikk - dt : Math.random() < dt / 3.5 ? 0.12 : 0;
    this.hreyfa(dt);
    this.teikna();
    ramma((t) => this.lykkja(t));
  }

  eyda() {
    this.lifandi = false;
    this.ro.disconnect();
    removeEventListener("keydown", this.kd); removeEventListener("keyup", this.ku); removeEventListener("pointerdown", this.utan, true);
  }
}

// gildi bita n í bætinu (sjá astand.js)
function BAETI_GILDI(n) { return BAETI[n]; }
