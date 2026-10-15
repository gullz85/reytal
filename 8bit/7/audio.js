// Hljóð REYTAL 8-bit: Web Audio, kveikir aldrei sjálft á sér.
// AudioContext verður aðeins til eftir smell eða takka gestsins (reglur vafra),
// og hljóðið er hægt að slökkva á í stjórnborðinu (geymt í localStorage).
import { HLJOD } from "./sfx-data.js";

let ctx = null, adal = null;
const LYKILL = "r8-hljod";

export function thogn() { try { return localStorage.getItem(LYKILL) === "0"; } catch { return false; } }
export function setjaThogn(t) {
  try { localStorage.setItem(LYKILL, t ? "0" : "1"); } catch {}
  if (adal) adal.gain.value = t ? 0 : 1;
}

function vakna() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    adal = ctx.createGain();
    adal.gain.value = thogn() ? 0 : 1;
    adal.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

let hav = null;
function havBuffer(c) {
  if (hav) return hav;
  hav = c.createBuffer(1, c.sampleRate * 0.2, c.sampleRate);
  const d = hav.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return hav;
}

// spila("biti") · spila("tal", { tonn: 3 }) hækkar um 3 hálftóna
export function spila(nafn, { tonn = 0 } = {}) {
  if (thogn()) return;
  const h = HLJOD[nafn], c = vakna();
  if (!h || !c) return;
  const k = Math.pow(2, tonn / 12);
  let t = c.currentTime + 0.005;
  if (h.hav) {
    const s = c.createBufferSource(), g = c.createGain();
    s.buffer = havBuffer(c);
    g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + h.hav);
    s.connect(g).connect(adal); s.start(t); s.stop(t + h.hav);
  }
  for (const [f0, lengd, f1] of h.notur) {
    if (f0 > 0) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = h.bylgja;
      o.frequency.setValueAtTime(f0 * k, t);
      if (f1) o.frequency.linearRampToValueAtTime(f1 * k, t + lengd);
      g.gain.setValueAtTime(h.styrkur, t);
      g.gain.setValueAtTime(h.styrkur, t + Math.max(0, lengd - 0.015));
      g.gain.linearRampToValueAtTime(0.0001, t + lengd);
      o.connect(g).connect(adal);
      o.start(t); o.stop(t + lengd + 0.02);
    }
    t += lengd;
  }
}
