// Les verkefnin beint af venjulegu verkefnasíðunni (.work-row), svo 8-bita
// útgáfan sýni alltaf sama efni og vefurinn. Á öðrum síðum er /verkefni sótt
// og þáttað; ekkert er tvískráð.
let skyndi = null;

function thatta(doc) {
  // Nýja verkefnasíðan geymir allar línurnar í <template id="vgGogn"> og býr til
  // spjöldin úr þeim; eldri útgáfan var með línurnar beint í síðunni.
  const sniðmát = doc.querySelector("template#vgGogn");
  const rot = sniðmát ? sniðmát.content : doc;
  return [...rot.querySelectorAll(".work-row")].map((a, i) => ({
    nr: i + 1,
    // vefurinn skiptir fyrirsögnum í orð fyrir hreyfingu, svo allur textinn er lesinn og örin tekin af
    nafn: (a.querySelector("h3")?.textContent || "").replace(/[↗︎\uFE0E]/g, "").replace(/\s+/g, " ").trim(),
    vidskiptavinur: a.querySelector(".work-client")?.textContent.trim() || "",
    lysing: a.querySelector(".work-main p")?.textContent.trim() || "",
    slod: a.getAttribute("href") || "",
    merki: [...a.querySelectorAll(".work-tag")].map((t) => t.textContent.trim()),
  })).filter((v) => v.nafn);
}

export function saekjaVerkefni() {
  if (skyndi) return skyndi;
  if (document.querySelector("template#vgGogn, .work-row")) return (skyndi = Promise.resolve(thatta(document)));
  skyndi = fetch("/verkefni", { credentials: "same-origin" })
    .then((r) => r.text())
    .then((t) => thatta(new DOMParser().parseFromString(t, "text/html")))
    .catch(() => []);
  return skyndi;
}
