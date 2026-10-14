// Ástand 8-bita hamsins sem lifir milli síðna: hamur og safnaðir bitar.
// Allt í localStorage og allt pakkað í try/catch (einkagluggar o.fl.).
const HAMUR = "r8-hamur", BITAR = "r8-bitar";

// Bætið sem bitarnir átta mynda: 01010010 = "R"
export const BAETI = [0, 1, 0, 1, 0, 0, 1, 0];

function lesa(k) { try { return localStorage.getItem(k); } catch { return null; } }
function skrifa(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} }

export const hamur = () => lesa(HAMUR) === "8bit" ? "8bit" : "venjulegur";
export const setjaHam = (h) => skrifa(HAMUR, h === "8bit" ? "8bit" : null);

export function bitar() {
  try { const a = JSON.parse(lesa(BITAR) || "[]"); return Array.isArray(a) ? a.filter((n) => n >= 0 && n < 8) : []; } catch { return []; }
}
// skilar true ef þetta var nýr biti
export function finnaBita(n) {
  const a = bitar();
  if (a.includes(n)) return false;
  a.push(n); skrifa(BITAR, JSON.stringify(a));
  window.dispatchEvent(new CustomEvent("r8:biti", { detail: { n, alls: a.length } }));
  return true;
}
export const allirBitar = () => bitar().length === 8;
export function endurstilla() { skrifa(HAMUR, null); skrifa(BITAR, null); skrifa("r8-hljod", null); }
