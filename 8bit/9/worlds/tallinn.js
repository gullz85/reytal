// HEIMUR 1-2 · TALLINN: verkefnasíðan.
// Nótt í gamla bænum: turnar með rauðum keiluþökum, borgarmúr, ljósker og
// stjörnur. Ferjan frá Reykjavík liggur við bryggju. Verkefnin eru leikjahylki
// í hillu; hvert hylki er borð með raunverulegum upplýsingum um verkefnið.
import { P, Pixmap } from "../pixel.js";
import * as S from "../sprites.js";
import { mynd } from "../leikur.js";
import { saekjaVerkefni } from "../verkefni.js";
import { bitar, finnaBita } from "../astand.js";
import { spila } from "../audio.js";

const BREIDD = 1120, BRYGGJA = 96;
// fjöldi verkefna, lesinn af verkefnasíðunni svo kubburinn fylgi listanum
let fjoldiBorda = 0;
saekjaVerkefni().then((v) => { fjoldiBorda = v.length; }).catch(() => {});

// Sjóndeildarhringur gamla bæjarins: hús, turnar og ein mjög há spíra
function sjondeild(w = 960, h = 120) {
  const pm = new Pixmap(w, h), r = S.slembi(21), SKUGGI = "#081430";
  let x = 0;
  while (x < w) {
    const b = 18 + ((r() * 26) | 0), hd = 30 + ((r() * 34) | 0), tegund = r();
    pm.rect(x, h - hd, b, hd, SKUGGI);
    if (tegund < 0.45) for (let y = 0; y < 10; y++) { const k = Math.round(((10 - y) / 10) * (b / 2)); pm.rect(x + (b >> 1) - k, h - hd - 10 + y, k * 2, 1, SKUGGI); }
    else if (tegund < 0.6) { const sh = 30 + ((r() * 40) | 0); for (let y = 0; y < sh; y++) { const k = Math.max(1, Math.round((y / sh) * 5)); pm.rect(x + (b >> 1) - k, h - hd - sh + y, k * 2, 1, SKUGGI); } }
    for (let wy = h - hd + 5; wy < h - 4; wy += 7) for (let wx = x + 3; wx < x + b - 3; wx += 6) if (r() < 0.28) pm.rect(wx, wy, 2, 3, P.ljos);
    x += b + ((r() * 6) | 0);
  }
  // Oleviste-spíran
  const ox = (w * 0.62) | 0;
  pm.rect(ox - 8, h - 70, 16, 70, SKUGGI);
  for (let y = 0; y < 48; y++) { const k = Math.max(1, Math.round((y / 48) * 8)); pm.rect(ox - k, h - 118 + y, k * 2, 1, SKUGGI); }
  return pm;
}

function heimurinn() {
  const skilti = (t) => mynd("sk-" + t, () => S.skilti(t));
  const sjon = mynd("sjondeild", () => sjondeild());
  const turn = mynd("hringturn", () => S.hringturn());
  const murinn = mynd("mur", () => S.mur());
  const tungl = mynd("tungl", () => S.tungl());
  const stjornur = [mynd("st0", () => S.stjarna(0)), mynd("st1", () => S.stjarna(1))];
  const steinn = mynd("steinar", () => S.steinar());
  const vatn = [0, 1, 2, 3].map((r) => mynd("vatn" + r, () => S.vatn(r)));
  const bryggja = mynd("bryggja", () => S.bryggja(48));
  const ljos = mynd("ljosker", () => S.ljosker(40));
  const r = S.slembi(8), punktar = Array.from({ length: 70 }, () => [r() * 1, r() * 0.55, r() < 0.15]);

  // bjarmi: tveir pixlaðir hringir í kringum ljóskerið
  const ljosker = (x) => ({ mynd: ljos, x, eftir: (c, lx, ly, t) => {
    c.fillStyle = P.ljos;
    [[10, 0.08], [6, 0.14]].forEach(([r, a]) => { c.globalAlpha = a + Math.sin(t * 3 + x) * 0.03; c.fillRect(lx + 6 - r, ly + 6 - r + 3, r * 2, r * 2 - 6); c.fillRect(lx + 6 - r + 3, ly + 6 - r, r * 2 - 6, r * 2); });
    c.globalAlpha = 1;
  } });
  return {
    breidd: BREIDD, upphaf: 110,
    gangur: [46, BREIDD - 20],                    // bryggjan byrjar við x 48; vestar er sjór (ferjudyrnar ná að 58)
    pallMynd: steinn,
    pallar: [{ x: 300, haed: 40, breidd: 32 }, { x: 352, haed: 84, breidd: 32 }],
    kubbar: [
      { x: 668, haed: 54, biti: 5, stadreynd: "Tallinn: borgin sem gaf okkur TAL" },
      { x: 700, haed: 54, stadreynd: () => (fjoldiBorda ? fjoldiBorda + " borð" : "Tugir borða") + " og fleiri á leiðinni" },
    ],
    bitar: [{ n: 6, x: 363, haed: 112 }],
    skraut: [
      { mynd: murinn, x: 150, parallax: 1 }, { mynd: murinn, x: 214 },
      { mynd: turn, x: 250 },
      { mynd: murinn, x: 590 }, { mynd: murinn, x: 654 }, { mynd: murinn, x: 718 },
      { mynd: turn, x: 770 },
      ljosker(140), ljosker(430), ljosker(600), ljosker(890),
      { mynd: skilti("1-2"), x: 104 },
    ],
    // þjónustukallar Tallinn, dreifðir um gamla bæinn
    kallar: [
      { tegund: "geo", fra: 150, til: 420, hradi: 14, linur: ["HÆ! ÉG ER GEO", "ÉG KEM ÞÉR Í SVÖR CHATGPT", "GERVIGREINDIN LES ÞIG LÍKA"] },
      { tegund: "honnun", fra: 575, til: 760, hradi: 12, linur: ["HÆ! ÉG ER HÖNNUN", "FRÁ WIREFRAME AÐ ÁSÝND", "PIXLARNIR SKIPTA MÁLI"] },
      { tegund: "kodi", fra: 800, til: 1010, hradi: 15, linur: ["HÆ! ÉG ER VEFÞRÓUN", "SÉRSMÍÐAÐ FRÁ GRUNNI", "ÉG TALA REIPRENNANDI JS"] },
    ],
    stadir: [
      { id: "ferja", x: -6, dypi: 7, mynd: mynd("ferja", () => S.ferja()), dyr: [10, 64], skilti: skilti("← REYKJAVÍK"), skiltiX: 74, bola: "↓ UM BORÐ",
        eftir: (c, x, y, t) => { for (let i = 0; i < 3; i++) { const a = (t * 0.6 + i / 3) % 1; c.fillStyle = a < 0.5 ? "#BCBCBC" : "#7C7C7C"; const s = 2 + Math.round(a * 3); c.fillRect(Math.round(x + 55 + a * 10), Math.round(y - 4 - a * 26), s, s); } } },
      { id: "safn", x: 470, mynd: mynd("gildishus", () => S.gildishus()), dyr: [28, 52], skilti: skilti("HYLKJASAFN"), skiltiX: 86, bola: "↓ INN" },
      { id: "safn2", x: 930, mynd: mynd("gildishus", () => S.gildishus()), dyr: [28, 52], skilti: skilti("SAMBAND"), skiltiX: 86, bola: "↓ INN" },
    ],
    bakgrunnur(c, { cam, t, lw, YG, rolegt }) {
      const bond = [P.nott, P.nott2, P.nott3];
      bond.forEach((b, i) => { c.fillStyle = b; c.fillRect(0, Math.round((YG * i) / 3.2), lw, YG); });
      for (const [px, py, stor] of punktar) {
        if (!rolegt && Math.sin(t * 2 + px * 50) > 0.85) continue;
        c.drawImage(stjornur[stor ? 1 : 0], Math.round(((px * (lw + 200) - cam * 0.05) % (lw + 10) + lw + 10) % (lw + 10)), Math.round(py * YG));
      }
      c.drawImage(tungl, Math.round(lw * 0.78 - cam * 0.03), 18);
      for (let x = -((cam * 0.3) % sjon.width) - sjon.width; x < lw; x += sjon.width) c.drawImage(sjon, Math.round(x), YG - sjon.height + 6);
    },
    jord(c, { cam, lw, lh, YG, t }) {
      for (let x = Math.floor(cam / 16) * 16; x < cam + lw + 16; x += 16) {
        const sx = Math.round(x - cam);
        if (x >= BRYGGJA) { c.drawImage(steinn, sx, YG); c.fillStyle = "#26262C"; c.fillRect(sx, YG + 16, 16, lh - YG); }
        else { c.fillStyle = "#14286C"; c.fillRect(sx, YG + 6, 16, lh - YG); c.drawImage(vatn[Math.floor(t * 4 + x / 16) % 4], sx, YG + 4); }
      }
      c.drawImage(bryggja, Math.round(48 - cam), YG);
    },
  };
}

export async function smida(main, api) {
  const h1 = api.lesa(".page-hero h1", "Nokkur Verkefni");
  const lede = api.lesa(".page-hero .lede", "Nokkur valin verkefni frá síðustu árum.");
  api.svid(main, heimurinn(), {
    yfirskrift: "Heimur 1-2 · Tallinn",
    titill: h1,
    inngangur: lede + " Veldu borð úr hylkjasafninu, eða gakktu um gamla bæinn.",
    onStadur: (st) => {
      if (st.id === "ferja") return api.fara("/");
      if (st.id === "safn2") return api.gluggi({ yfirskrift: "Gildishúsið", titill: "Nýtt borð?", html: "<p>Eigum við að bæta þínu verkefni á listann? Sendu okkur línu og segðu frá.</p>", takkar: [{ texti: "Hafa samband", href: "mailto:hallo@reytal.is?subject=Fyrirspurn%20af%20vef" }] });
      main.querySelector("#hylkjasafn")?.scrollIntoView({ behavior: "smooth", block: "start" });
      spila("opna");
    },
  });

  const safn = api.kassi(main, { id: "hylkjasafn", tegund: "r8-safn", yfirskrift: "Hylkjasafnið", titill: "Veldu borð", html: '<div class="r8-hylkjarod stor"></div>' });
  const verk = await saekjaVerkefni();
  const rod = safn.querySelector(".r8-hylkjarod");
  verk.forEach((v) => rod.appendChild(api.hylkiEl(v)));
  rod.appendChild(leyniHylki(verk.length + 1));

  // Leynihylkið: síðasti bitinn og boð um að bæta þínu verkefni við
  function leyniHylki(nr) {
    const n = 7;
    // klónað svo venjulegi smellurinn (opna verkefni) fylgi ekki með
    const el = api.hylkiEl({ nr, nafn: "???", merki: [] }, { leynd: true }).cloneNode(true);
    el.addEventListener("click", () => {
      const fyrst = finnaBita(n);
      if (fyrst) spila("biti");
      el.classList.add("opnad");
      api.gluggi({
        yfirskrift: `Borð ${nr}`, titill: "Þitt verkefni?",
        html: `<p>${fyrst ? "Þú fannst falinn bita! " : ""}Þetta borð er enn autt. Eigum við að bæta þínu verkefni á listann?</p>`,
        takkar: [{ texti: "Hafa samband", href: "mailto:hallo@reytal.is?subject=Fyrirspurn%20af%20vef" }],
      });
    });
    if (bitar().includes(n)) el.classList.add("opnad");
    return el;
  }

  api.fotur(main, { steinn: true });
}
