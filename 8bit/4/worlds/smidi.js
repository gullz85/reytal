// Síður sem hafa ekki fengið sinn eigin heim enn. Sýnir að hamurinn er
// endurnýtanlegur: titill síðunnar er lesinn úr venjulegu síðunni og gesturinn
// getur skoðað hana í nútímanum eða siglt aftur heim.
import { P } from "../pixel.js";
import { takn } from "../sprites.js";

export function smida(main, api) {
  const titill = api.lesa("h1", document.title.split(" - ")[0].trim());
  const k = api.kassi(main, {
    tegund: "r8-smidi",
    yfirskrift: "Borð ?-? · Í smíðum",
    titill,
    html: `<div class="r8-smidi-innan"><img src="${takn("tannhjol", P.gull, 6).slod()}" alt="" class="r8-snyst">
      <p>Þetta borð hefur ekki fengið 8-bita búninginn sinn enn. Pixlarnir eru á leiðinni.</p></div>
      <div class="r8-takkar"><button type="button" class="r8-takki">Skoða síðuna í 2026</button><a class="r8-takki aukalegur" href="/">← Heimur 1-1</a><a class="r8-takki aukalegur" href="/verkefni">Heimur 1-2 →</a></div>`,
  });
  k.querySelector("button").addEventListener("click", () => api.slokkva());
  api.fotur(main, {});
}
