// HEIMUR 1-1 · REYKJAVÍK: forsíðan.
// Bjartur dagur: Esja í fjarska, grænar hæðir, lundar á flugi. Staðirnir í
// heiminum eru valmyndin: verkstæðið er þjónustan, kirkjuturninn er „um
// okkur“, vitinn er samband og ferjan siglir til Tallinn (verkefnin).
import { P } from "../pixel.js";
import * as S from "../sprites.js";
import { mynd } from "../leikur.js";
import { saekjaVerkefni } from "../verkefni.js";
const { verdlaunabikar, takn } = S;

const BREIDD = 1180, VATN = 1020;

// Þjónustan eins og hún er á /thjonusta
export const THJONUSTA = [
  ["kodi", "Vefsíður og vefkerfi", "Sérsniðið frá grunni og tæknin valin eftir verkefninu."],
  ["karfa", "Netverslanir", "Sala á netinu, greiðslur, lager og tengingar við kerfin."],
  ["penni", "Hönnun og vörumerki", "Frá wireframe að fullkláraðri ásýnd."],
  ["leit", "Leitarvélabestun", "Tæknileg bestun, efnisstefna og mælingar."],
  ["neisti", "Sýnileiki í gervigreind", "Að vefurinn skili sér í svörum ChatGPT, Gemini og Perplexity."],
  ["tannhjol", "Gervigreind og sjálfvirkni", "Samþættingar sem spara tíma í daglegum rekstri."],
  ["thjonn", "Hýsing og rekstur", "Vöktun, afritun og öryggisuppfærslur allt árið."],
  ["ritill", "Vefúttektir", "Greiningarvélin les vefinn og raðar því sem má bæta."],
];


function heimurinn() {
  const skilti = (t) => mynd("sk-" + t, () => S.skilti(t));
  const esja = mynd("esja", () => S.esja(900, 72));
  const holl = [mynd("holl1", () => S.holl(96, 44, 1)), mynd("holl2", () => S.holl(64, 30, 2))];
  const sky = [mynd("sky32", () => S.sky(32)), mynd("sky64", () => S.sky(64))];
  const lundi = [mynd("lundi0", () => S.lundi(0)), mynd("lundi1", () => S.lundi(1))];
  const jordE = mynd("jordE", () => S.jord(true)), jordU = mynd("jordU", () => S.jord(false));
  const vatn = [0, 1, 2, 3].map((r) => mynd("vatn" + r, () => S.vatn(r)));
  const bryggja = mynd("bryggja", () => S.bryggja(48));
  const sk = [[30, 26, 0], [180, 40, 1], [330, 18, 0], [520, 34, 1], [700, 22, 0], [880, 44, 1], [1040, 28, 0]];

  return {
    breidd: BREIDD, upphaf: 60,
    gangur: [4, 1100],                            // bryggjan endar við x 1116; þar fyrir utan er sjór (ferjudyrnar byrja við 1092)
    pallMynd: mynd("murst", () => S.mursteinn()),
    pallar: [{ x: 330, haed: 36, breidd: 48 }, { x: 556, haed: 36, breidd: 48 }, { x: 620, haed: 84, breidd: 32 }],
    kubbar: [
      { x: 232, haed: 54, biti: 0, stadreynd: "Stofnað 2017" },
      { x: 264, haed: 54, stadreynd: "Söluvefur ársins 2025" },
      { x: 296, haed: 54, biti: 1, stadreynd: "Reykjavík + Tallinn = REYTAL" },
      { x: 820, haed: 54, stadreynd: "Um tólf manns í tveimur borgum" },
    ],
    bitar: [{ n: 2, x: 349, haed: 72 }, { n: 3, x: 631, haed: 118 }],
    skraut: [
      { mynd: skilti("1-1"), x: 12 },
      { mynd: mynd("runni", () => S.runni()), x: 190 },
      { mynd: mynd("runni", () => S.runni()), x: 520 },
      { mynd: mynd("runni", () => S.runni()), x: 900 },
    ],
    // þjónustukallar: rölta á milli staða og kynna sig þegar Dropi kemur
    kallar: [
      { tegund: "seo", fra: 160, til: 370, hradi: 16, linur: ["HÆ! ÉG ER SEO", "ÉG KEM ÞÉR Á FYRSTU SÍÐU", "GOOGLE ELSKAR HRAÐA VEFI"] },
      { tegund: "verslun", fra: 500, til: 690, hradi: 13, linur: ["HÆ! ÉG ER NETVERSLUN", "OPIÐ ALLAN SÓLARHRINGINN", "KARFAN ER TILBÚIN!"] },
      { tegund: "hysing", fra: 770, til: 990, hradi: 10, linur: ["HÆ! ÉG ER HÝSING", "ÉG SEF ALDREI", "AFRIT Á HVERJUM DEGI"] },
    ],
    stadir: [
      { id: "thjonusta", x: 112, mynd: mynd("hus", () => S.hus()), dyr: [24, 40], skilti: skilti("ÞJÓNUSTA"), skiltiX: 68, bola: "↓ INN" },
      { id: "um", x: 400, mynd: mynd("kirkja", () => S.kirkja()), dyr: [36, 52], skilti: skilti("UM OKKUR"), skiltiX: 94, bola: "↓ INN" },
      { id: "samband", x: 712, mynd: mynd("viti", () => S.viti()), dyr: [6, 22], skilti: skilti("SAMBAND"), skiltiX: 34, bola: "↓ INN",
        eftir: (c, x, y, t) => { if (Math.floor(t * 2) % 2) { c.fillStyle = "#FCFCFC"; c.fillRect(x + 10, y + 9, 8, 8); c.globalAlpha = 0.35; c.fillStyle = "#FCE4A0"; c.fillRect(x + 18, y + 11, 40, 4); c.fillRect(x - 30, y + 11, 40, 4); c.globalAlpha = 1; } } },
      { id: "ferja", x: 1092, dypi: 7, mynd: mynd("ferja", () => S.ferja()), dyr: [0, 44], skilti: skilti("→ TALLINN"), skiltiX: -78, skiltiHaed: 0, bola: "↓ UM BORÐ",
        eftir: (c, x, y, t) => { for (let i = 0; i < 3; i++) { const a = (t * 0.6 + i / 3) % 1; c.fillStyle = a < 0.5 ? "#FCFCFC" : "#BCBCBC"; const r = 2 + Math.round(a * 3); c.fillRect(Math.round(x + 55 - a * 10), Math.round(y - 4 - a * 26), r, r); } } },
    ],
    bakgrunnur(c, { cam, t, lw, YG, rolegt }) {
      c.fillStyle = P.himinn; c.fillRect(0, 0, lw, YG + 40);
      for (let x = -((cam * 0.15) % esja.width) - esja.width; x < lw; x += esja.width) c.drawImage(esja, Math.round(x), YG - 64);
      const rek = rolegt ? 0 : t * 5;
      for (const [x, h, i] of sk) {
        const sp = sky[i], b = BREIDD * 0.5 + lw;
        const xx = ((((x + rek - cam * 0.35) % b) + b) % b) - sp.width;
        c.drawImage(sp, Math.round(xx), h);
      }
      [[40, 0], [300, 1], [470, 0], [780, 1], [980, 0]].forEach(([x, i]) => c.drawImage(holl[i], Math.round(x - cam * 0.6), YG - holl[i].height));
      if (!rolegt) for (let i = 0; i < 2; i++) {
        const leid = lw + 160, x = ((t * (22 + i * 9) + i * 300) % leid) - 80, y = 30 + i * 22 + Math.round(Math.sin(t * 2 + i) * 4);
        c.drawImage(lundi[Math.floor(t * 6 + i) % 2], Math.round(x), y);
      }
    },
    jord(c, { cam, lw, lh, YG, t }) {
      for (let x = Math.floor(cam / 16) * 16; x < cam + lw + 16; x += 16) {
        const sx = Math.round(x - cam);
        if (x < VATN) {
          c.drawImage(jordE, sx, YG);
          for (let y = YG + 16; y < lh; y += 16) c.drawImage(jordU, sx, y);
        } else {
          c.fillStyle = "#2038EC"; c.fillRect(sx, YG + 6, 16, lh - YG);
          c.drawImage(vatn[Math.floor(t * 4 + x / 16) % 4], sx, YG + 4);
        }
      }
      for (let x = VATN; x < BREIDD - 60; x += 48) c.drawImage(bryggja, Math.round(x - cam), YG);
    },
  };
}

export async function smida(main, api) {
  const { s } = api.svid(main, heimurinn(), {
    yfirskrift: "Heimur 1-1 · Reykjavík",
    titill: api.lesa(".hero h1", "Stafrænar Lausnir"),
    inngangur: api.lesa(".hero-copy p", "Við hönnum og byggjum vefi, netverslanir og stafrænar lausnir fyrir íslensk fyrirtæki."),
    onStadur: (st) => stadur(st.id, api),
  });

  // Staðirnir líka sem venjulegir takkar, fyrir þá sem vilja ekki spila
  const leid = document.createElement("nav");
  leid.className = "r8-stadir";
  leid.setAttribute("aria-label", "Staðir í heimi 1-1");
  [["thjonusta", "kodi", "Verkstæðið", "Þjónusta"], ["um", "hjarta", "Turninn", "Um okkur"], ["samband", "bref", "Vitinn", "Samband"], ["ferja", "hnottur", "Ferjan", "Verkefni → Tallinn"]]
    .forEach(([id, t, nafn, lysing]) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "r8-stadur";
      b.innerHTML = `<img src="${takn(t, P.gull, 3).slod()}" alt=""><span><b>${nafn}</b><small>${lysing}</small></span>`;
      b.addEventListener("click", () => stadur(id, api));
      leid.appendChild(b);
    });
  main.appendChild(leid);

  // Afrek: söluvefur ársins
  const afrek = api.kassi(main, {
    tegund: "r8-afrek",
    yfirskrift: "★ Afrek opnað",
    titill: api.lesa(".award h2", "Söluvefur ársins 2025"),
    html: `<div class="r8-afrek-innan"><img src="${verdlaunabikar().slod(6)}" alt="Bikar" class="r8-bikar"><p>${api.lesa(".award p", "Orkureiturinn.is var valinn söluvefur ársins 2025 á Íslensku vefverðlaununum hjá SVEF.")}</p></div>`,
  });

  // Búnaðurinn: þjónustan sem hlutir í birgðum
  api.kassi(main, {
    id: "bunadur",
    yfirskrift: "Búnaður",
    titill: "Það sem við tökum með í hvert verkefni",
    html: `<ul class="r8-bunadur">${THJONUSTA.map(([t, n, l]) => `<li><img src="${takn(t, P.gull, 3).slod()}" alt=""><b>${n}</b><span>${l}</span></li>`).join("")}</ul>
      <p class="r8-meira"><a class="r8-takki aukalegur" href="/thjonusta">Öll þjónustan →</a></p>`,
  });

  // Valin borð: verkefnin úr sýningunni á forsíðunni, sem hylki
  const bord = api.kassi(main, { id: "valin", yfirskrift: "Valin borð", titill: api.lesa(".work-head h2", "Valin verkefni"), html: '<div class="r8-hylkjarod"></div>' });
  // verkefnaröðin á forsíðunni (.fv-kort); röðin er tvöfölduð fyrir hringinn, svo hvert nafn einu sinni
  const nofn = [...new Set([...document.querySelectorAll(".fv-kort h3, .showcase h3")].map((h) => api.lesa(h)).filter(Boolean))];
  saekjaVerkefni().then((allt) => {
    const rod = bord.querySelector(".r8-hylkjarod");
    const finna = (n) => allt.find((v) => v.nafn.toLowerCase() === n.toLowerCase()) || allt.find((v) => n.toLowerCase().includes(v.nafn.toLowerCase()) || v.nafn.toLowerCase().includes(n.toLowerCase().split(" ")[0]));
    (nofn.length ? nofn : allt.slice(0, 8).map((v) => v.nafn)).slice(0, 8).forEach((n) => { const v = finna(n) || { nr: 0, nafn: n, merki: [] }; rod.appendChild(api.hylkiEl(v)); });
    const fl = document.createElement("p");
    fl.className = "r8-meira";
    fl.innerHTML = `<a class="r8-takki" href="/verkefni">Öll ${allt.length} borðin · sigla til Tallinn →</a>`;
    bord.appendChild(fl);
  });

  // Vefúttektin
  api.kassi(main, {
    tegund: "r8-uttekt",
    yfirskrift: "Hliðarverkefni",
    titill: api.lesa(".engine-cta h2", "Hvernig stendur vefurinn þinn sig?"),
    html: `<p>${api.lesa(".engine-cta p", "Sláðu inn lénið þitt og fáðu ókeypis úttekt á tækni, hraða, öryggi og sýnileika.")}</p>
      <p class="r8-meira"><a class="r8-takki" href="/vefuttekt">Hefja úttekt →</a></p>`,
  });

  api.fotur(main, { bitiN: 4 });
  return s;
}

function stadur(id, api) {
  if (id === "ferja") return api.fara("/verkefni");
  if (id === "thjonusta") return api.gluggi({
    yfirskrift: "Verkstæðið", titill: "Þjónusta",
    html: `<p>Við hönnum og byggjum vefi, netverslanir og stafrænar lausnir. Þetta er það sem er á verkstæðinu:</p>
      <ul class="r8-listi">${THJONUSTA.map(([t, n]) => `<li><img src="${takn(t, P.gull, 2).slod()}" alt="">${n}</li>`).join("")}</ul>`,
    takkar: [{ texti: "Öll þjónustan →", href: "/thjonusta" }],
  });
  if (id === "um") return api.gluggi({
    yfirskrift: "Turninn", titill: "Um REYTAL",
    html: `<p>Um tólf manns í tveimur borgum, Reykjavík og Tallinn. Hönnuðir, forritarar, verkefnastjórn og rekstur undir einu þaki síðan 2017.</p>
      <p>Nafnið segir söguna: <b>REY</b>kjavík og <b>TAL</b>linn. Þess vegna snýr TAL á hvolf í merkinu, tvær borgir og tvær áttir.</p>`,
    takkar: [{ texti: "Um okkur →", href: "/um-okkur" }],
  });
  if (id === "samband") return api.gluggi({
    yfirskrift: "Vitinn", titill: "Sendu ljósmerki",
    html: `<p>Ertu með verkefni í huga? Við svörum öllum skeytum.</p>
      <ul class="r8-listi"><li><img src="${takn("bref", P.gull, 2).slod()}" alt="">hallo@reytal.is</li><li><img src="${takn("simi", P.gull, 2).slod()}" alt="">510 9000</li><li><img src="${takn("pinni", P.gull, 2).slod()}" alt="">Guðrúnartún 8, 105 Reykjavík</li></ul>`,
    takkar: [{ texti: "Senda póst", href: "mailto:hallo@reytal.is?subject=Fyrirspurn%20af%20vef" }],
  });
}
