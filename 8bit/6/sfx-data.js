// Hljóðbrellur REYTAL 8-bit. Frumsamdar, stuttar, engin tónlist.
// Hver brella er röð nótna: [tíðni Hz, lengd sek, lokatíðni (valfrjálst)].
// Sama skilgreining spilast með Web Audio (audio.js) og verður að WAV í
// assets/sfx með synth() hér fyrir neðan.
export const HLJOD = {
  kveikja: { bylgja: "square", styrkur: 0.16, notur: [[523, 0.06], [659, 0.06], [784, 0.06], [1047, 0.06], [1319, 0.06], [1568, 0.2]] },
  slokkva: { bylgja: "square", styrkur: 0.14, notur: [[1319, 0.05], [1047, 0.05], [784, 0.05], [659, 0.05], [523, 0.05], [392, 0.16]] },
  hopp: { bylgja: "square", styrkur: 0.1, notur: [[290, 0.13, 720]] },
  biti: { bylgja: "square", styrkur: 0.12, notur: [[988, 0.06], [1319, 0.24]] },
  dynkur: { bylgja: "triangle", styrkur: 0.35, notur: [[170, 0.09, 80]], hav: 0.05 },
  opna: { bylgja: "square", styrkur: 0.1, notur: [[660, 0.05], [880, 0.09]] },
  loka: { bylgja: "square", styrkur: 0.08, notur: [[880, 0.04], [660, 0.07]] },
  velja: { bylgja: "square", styrkur: 0.05, notur: [[1250, 0.025]] },
  inn: { bylgja: "square", styrkur: 0.1, notur: [[392, 0.06], [523, 0.06], [659, 0.12]] },
  ferja: { bylgja: "triangle", styrkur: 0.4, notur: [[196, 0.28], [0, 0.06], [147, 0.55]] },
  baeti: { bylgja: "square", styrkur: 0.13, notur: [[523, 0.08], [659, 0.08], [784, 0.08], [1047, 0.14], [784, 0.08], [1047, 0.4]] },
  tal: { bylgja: "square", styrkur: 0.07, notur: [[660, 0.035]] },
  hylki: { bylgja: "triangle", styrkur: 0.3, notur: [[220, 0.05, 110], [0, 0.05], [660, 0.05], [990, 0.1]], hav: 0.03 },
};

// Hrá sýni fyrir WAV (Node). Ferhyrnings-, þríhyrnings- og suðbylgja með
// stuttri dofnun í lok hverrar nótu svo ekki smelli.
export function synth(nafn, sr = 22050) {
  const h = HLJOD[nafn], ut = [];
  let fasi = 0, s = 1;
  const suð = () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
  if (h.hav) for (let i = 0; i < h.hav * sr; i++) ut.push(suð() * 0.25 * (1 - i / (h.hav * sr)));
  let n0 = 0;
  for (const [f0, lengd, f1] of h.notur) {
    const N = Math.round(lengd * sr);
    for (let i = 0; i < N; i++) {
      const t = i / N, f = f1 ? f0 + (f1 - f0) * t : f0;
      fasi = (fasi + f / sr) % 1;
      let v = 0;
      if (f > 0) v = h.bylgja === "triangle" ? 1 - 4 * Math.abs(fasi - 0.5) : fasi < 0.5 ? 1 : -1;
      const dofn = Math.min(1, (N - i) / (sr * 0.012)) * Math.min(1, i / (sr * 0.002));
      const v0 = ut[n0 + i] || 0;
      ut[n0 + i] = v0 + v * h.styrkur * dofn;
    }
    n0 += N;
  }
  return ut;
}
