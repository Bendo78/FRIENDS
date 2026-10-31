// Générateur de personnages en SVG, entièrement paramétrable.
// pose "sit" : buste assis (canapé)  ·  pose "stand" : en pied, une fiche à la main.

export const OPTIONS = {
  sex: ["f", "m"],
  skin: ["#ffe3d1", "#f7cfaa", "#e6b086", "#c98d5f", "#9a6440", "#6b4128", "#4a2c1c"],
  eyes: ["#2b1a12", "#5a3a1e", "#3f7fd0", "#3d9a5a", "#8a6a3a", "#6a6f78"],
  hair: ["court", "degrade", "raie", "undercut", "brosse", "meche", "bol", "mulet", "nattes", "surfeur", "degarni", "houppette", "rase", "mi-long", "frange", "long", "chignon", "queue", "couettes", "tresses", "boucles", "afro", "dreads", "crete", "chauve"],
  hairColor: ["#1b1310", "#3d2618", "#6e4325", "#a8703c", "#e0b56a", "#f3dfa8", "#b9b4b0", "#f4f4f4", "#b8352b", "#ff7a3d", "#d6428a", "#8a3fd1", "#3d63d6", "#23b07d"],
  outfit: ["tshirt", "debardeur", "chemise", "polo", "pull", "sweat", "hoodie", "jean", "cuir", "costume", "robe", "paillettes", "salopette", "maillot", "peignoir", "bain", "nu"],
  outfitColor: ["#e8244f", "#ff7a3d", "#f4c430", "#23b07d", "#1e9bd7", "#3f4fd8", "#8a3fd1", "#ff6fae", "#f3f0ea", "#8a8f98", "#5a3a26", "#24242e"],
  face: ["aucun", "lunettes", "solaires", "maquillage", "rousseur", "moustache", "barbe", "barbe3j", "bandeau-oeil"],
  hat: ["aucun", "casquette", "bonnet", "chapeau", "couronne", "bandeau", "fleur", "noeud", "cornes", "aureole"],
  neck: ["aucun", "noeud", "cravate", "collier", "chaine", "boucles", "echarpe", "casque"],
  // visage
  eyeShape: ["ronds", "amande", "grands", "petits", "chat", "rieurs"],
  brows: ["naturels", "fins", "epais", "arques", "droits", "broussailleux"],
  mouth: ["sourire", "grand", "dents", "coin", "neutre", "bisou", "langue"],
  mood: ["joyeux", "neutre", "confiant", "timide", "grincheux", "reveur"],
  // couleurs des accessoires
  hatColor: ACC_COLORS(), neckColor: ACC_COLORS(), faceColor: ACC_COLORS(),
};
function ACC_COLORS() { return ["#c8102e", "#e8244f", "#ff7a3d", "#f4c430", "#23b07d", "#1e9bd7", "#3f4fd8", "#8a3fd1", "#ff6fae", "#f3f0ea", "#8a8f98", "#5a3a26", "#24242e"]; }
// Accessoires qu’on peut colorier, et la clé de couleur de chaque catégorie
export const COLORABLE = {
  hat: { key: "hatColor", items: ["casquette", "bonnet", "chapeau", "bandeau", "fleur", "noeud"] },
  neck: { key: "neckColor", items: ["noeud", "cravate", "echarpe", "casque"] },
  face: { key: "faceColor", items: ["lunettes", "maquillage"] },
};
// couleur de départ quand on choisit cet accessoire
export const FACE_DEFAULT = { lunettes: "#24242e", maquillage: "#c8102e" };
export const LABELS = {
  hair: { court: "Court", degrade: "Dégradé", raie: "Raie sur le côté", undercut: "Undercut", brosse: "En brosse", meche: "Mèche", bol: "Au bol", mulet: "Mulet", nattes: "Nattes plaquées", surfeur: "Surfeur", degarni: "Dégarni", houppette: "Houppette", rase: "Rasé", "mi-long": "Carré", frange: "Frange", long: "Long", chignon: "Chignon", queue: "Queue", couettes: "Couettes", tresses: "Tresses", boucles: "Bouclés", afro: "Afro", dreads: "Dreads", crete: "Crête", chauve: "Chauve" },
  outfit: { tshirt: "T-shirt", debardeur: "Débardeur", chemise: "Chemise", polo: "Polo", pull: "Col roulé", sweat: "Sweat", hoodie: "Sweat à capuche", jean: "Veste en jean", cuir: "Blouson cuir", costume: "Costume", robe: "Robe", paillettes: "Paillettes", salopette: "Salopette", maillot: "Maillot de foot", peignoir: "Peignoir", bain: "Maillot de bain", nu: "Tout nu (censuré)" },
  face: { aucun: "Rien", lunettes: "Lunettes", solaires: "Solaires", maquillage: "Maquillage", rousseur: "Taches de rousseur", moustache: "Moustache", barbe: "Barbe", barbe3j: "Barbe de 3 jours", "bandeau-oeil": "Cache-œil" },
  hat: { aucun: "Rien", casquette: "Casquette", bonnet: "Bonnet", chapeau: "Chapeau", couronne: "Couronne", bandeau: "Bandeau", fleur: "Fleur", noeud: "Nœud", cornes: "Cornes", aureole: "Auréole" },
  neck: { aucun: "Rien", noeud: "Nœud pap'", cravate: "Cravate", collier: "Perles", chaine: "Chaîne en or", boucles: "Boucles d'oreilles", echarpe: "Écharpe", casque: "Casque audio" },
  eyeShape: { ronds: "Ronds", amande: "En amande", grands: "Grands", petits: "Petits", chat: "De chat", rieurs: "Rieurs" },
  brows: { naturels: "Naturels", fins: "Fins", epais: "Épais", arques: "Arqués", droits: "Droits", broussailleux: "Broussailleux" },
  mouth: { sourire: "Sourire", grand: "Grand sourire", dents: "Toutes dents", coin: "En coin", neutre: "Neutre", bisou: "Bisou", langue: "Langue tirée" },
  mood: { joyeux: "Joyeux", neutre: "Calme", confiant: "Sûr de soi", timide: "Timide", grincheux: "Grincheux", reveur: "Rêveur" },
};

const pick = (a) => a[Math.floor(Math.random() * a.length)];
export function randomLook() {
  const sex = pick(OPTIONS.sex);
  return sanitizeLook({
    sex, skin: pick(OPTIONS.skin), eyes: pick(OPTIONS.eyes),
    hair: pick(sex === "f" ? ["mi-long", "long", "chignon", "queue", "couettes", "tresses", "boucles", "afro", "frange"] : ["court", "degrade", "raie", "undercut", "brosse", "meche", "bol", "mulet", "nattes", "surfeur", "degarni", "houppette", "rase", "boucles", "afro", "dreads", "crete", "chauve"]),
    hairColor: pick(OPTIONS.hairColor.slice(0, 8)), outfit: pick(OPTIONS.outfit.slice(0, 15)), outfitColor: pick(OPTIONS.outfitColor),
    face: pick(["aucun", "aucun", "lunettes", sex === "f" ? "maquillage" : "barbe3j", "rousseur"]), hat: pick(["aucun", "aucun", "aucun", "casquette", "bonnet", "fleur"]), neck: pick(["aucun", "aucun", "boucles", "collier", "chaine", "cravate", "noeud", "echarpe"]),
    eyeShape: pick(OPTIONS.eyeShape), brows: pick(OPTIONS.brows.slice(0, 5)), mouth: pick(["sourire", "sourire", "grand", "dents", "coin", "neutre"]), mood: pick(OPTIONS.mood),
    hatColor: pick(OPTIONS.hatColor), neckColor: pick(OPTIONS.neckColor),
  });
}
// ── Cohérence : ce qui existe vraiment ensemble ──
const COLLAR = ["chemise", "costume"];
const RULES = {
  neck: {
    cravate: { ok: (L) => COLLAR.includes(L.outfit), why: "Cravate et nœud pap’ : seulement avec une chemise ou un costume." },
    noeud: { ok: (L) => COLLAR.includes(L.outfit), why: "Cravate et nœud pap’ : seulement avec une chemise ou un costume." },
    echarpe: { ok: (L) => !["bain", "nu", "peignoir"].includes(L.outfit), why: "Pas d’écharpe en maillot de bain, en peignoir ou tout nu." },
  },
};
// true si l’option v de la catégorie k va avec le reste du personnage
export function isAllowed(k, v, L) { const rule = RULES[k]?.[v]; return !rule || rule.ok(L); }
export function whyNot(k, v) { return RULES[k]?.[v]?.why || ""; }

export function sanitizeLook(l) {
  const L = l && typeof l === "object" ? { ...l } : {};
  // anciens personnages : un seul accessoire "acc"
  if (L.acc && !L.face && !L.hat && !L.neck) {
    if (OPTIONS.face.includes(L.acc)) L.face = L.acc;
    else if (OPTIONS.hat.includes(L.acc)) L.hat = L.acc;
    else if (OPTIONS.neck.includes(L.acc)) L.neck = L.acc;
  }
  if (L.outfit === "sweat" && L.hood) L.outfit = "hoodie";
  // anciens personnages sans couleur d’accessoire : on garde le rendu d’avant
  if (!OPTIONS.hatColor.includes(L.hatColor)) L.hatColor = OPTIONS.hatColor.includes(L.outfitColor) ? L.outfitColor : OPTIONS.hatColor[0];
  if (!OPTIONS.faceColor.includes(L.faceColor)) L.faceColor = FACE_DEFAULT[L.face] || OPTIONS.faceColor[0];
  const out = {};
  for (const k of Object.keys(OPTIONS)) out[k] = OPTIONS[k].includes(L[k]) ? L[k] : OPTIONS[k][0];
  for (const k of Object.keys(RULES)) if (!isAllowed(k, out[k], out)) out[k] = OPTIONS[k][0];
  return out;
}

// ── couleurs ──
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const t = f < 0 ? 0 : 255, p = Math.abs(f);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
const lum = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
const hl = (c) => `stroke="${shade(c, 0.22)}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"`;
let uid = 0;

// Mosaïque de censure façon télé
function censor(x, y, w, h, sk) {
  const s = 11, out = [];
  const tones = [shade(sk, -0.08), shade(sk, 0.1), shade(sk, -0.2), shade(sk, 0.02)];
  for (let j = 0; j * s < h; j++) for (let i = 0; i * s < w; i++) out.push(`<rect x="${x + i * s}" y="${y + j * s}" width="${s}" height="${s}" fill="${tones[(i * 3 + j * 5) % 4]}"/>`);
  return `<g class="censor">${out.join("")}</g>`;
}

// ── cheveux ──
function hairBack(h, c) {
  const dk = shade(c, -0.22);
  switch (h) {
    case "mi-long": return `<path d="M46 78 Q44 20 100 18 Q156 20 154 78 L158 132 Q100 146 42 132 Z" fill="${c}"/>`;
    case "frange": return `<path d="M46 78 Q44 20 100 18 Q156 20 154 78 L156 124 Q100 136 44 124 Z" fill="${c}"/>`;
    case "long": return `<path d="M46 74 Q44 18 100 16 Q156 18 154 74 L166 214 Q132 230 100 222 Q68 230 34 214 Z" fill="${c}"/><path d="M60 120 L54 206 M140 120 L146 206" stroke="${dk}" stroke-width="3" opacity=".5"/>`;
    case "chignon": return `<circle cx="100" cy="20" r="24" fill="${c}"/><path d="M84 12 Q100 2 116 12" ${hl(c)}/>`;
    case "queue": return `<path d="M136 40 Q182 52 170 120 Q164 150 148 168 Q160 120 140 76 Z" fill="${c}"/>`;
    case "couettes": return `<ellipse cx="36" cy="84" rx="20" ry="34" fill="${c}" transform="rotate(14 36 84)"/><ellipse cx="164" cy="84" rx="20" ry="34" fill="${c}" transform="rotate(-14 164 84)"/><circle cx="48" cy="58" r="6" fill="#ff4f8b"/><circle cx="152" cy="58" r="6" fill="#ff4f8b"/>`;
    case "tresses": return [54, 146].map((x) => [0, 1, 2, 3, 4, 5].map((i) => `<ellipse cx="${x + (x < 100 ? -2 : 2) * i}" cy="${108 + i * 20}" rx="11" ry="12" fill="${i % 2 ? dk : c}"/>`).join("") + `<circle cx="${x + (x < 100 ? -12 : 12)}" cy="226" r="5" fill="#ffd54a"/>`).join("");
    case "boucles": return [[52, 96, 18], [148, 96, 18], [56, 120, 15], [144, 120, 15]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join("");
    case "afro": return `<circle cx="100" cy="66" r="76" fill="${c}"/>`;
    case "dreads": return [52, 64, 78, 122, 136, 148].map((x, i) => `<path d="M${x} 60 Q${x + (i < 3 ? -10 : 10)} 120 ${x + (i < 3 ? -6 : 6)} ${168 + (i % 2) * 18}" stroke="${i % 2 ? dk : c}" stroke-width="12" fill="none" stroke-linecap="round"/>`).join("");
    case "mulet": return `<path d="M56 70 Q52 118 62 150 Q80 162 100 160 Q120 162 138 150 Q148 118 144 70 Z" fill="${c}"/><path d="M70 120 Q68 140 74 152 M130 120 Q132 140 126 152" stroke="${dk}" stroke-width="3" fill="none" opacity=".5"/>`;
    case "surfeur": return `<path d="M48 80 Q44 22 100 20 Q156 22 152 80 L156 116 Q150 126 140 118 Q134 126 124 118 L76 118 Q66 126 60 118 Q50 126 44 116 Z" fill="${c}"/>`;
    default: return "";
  }
}
function hairFront(h, c) {
  switch (h) {
    case "degrade": return `<path d="M54 88 Q52 60 60 46 L66 60 Q60 70 58 88 Z M146 88 Q148 60 140 46 L134 60 Q140 70 142 88 Z" fill="${c}" opacity=".4"/><path d="M60 62 Q56 26 100 22 Q144 26 140 62 Q130 46 100 44 Q70 46 60 62 Z" fill="${c}"/><path d="M76 30 l4 8 M92 26 l3 9 M108 26 l-2 9 M124 30 l-4 8" stroke="${shade(c, -0.25)}" stroke-width="2.5" stroke-linecap="round"/><path d="M80 32 Q100 26 118 32" ${hl(c)}/>`;
    case "raie": return `<path d="M54 84 Q50 28 100 24 Q150 26 146 84 Q144 62 134 52 Q112 44 84 52 Q66 58 54 84 Z" fill="${c}"/><path d="M78 28 Q74 40 78 52" stroke="${shade(c, -0.3)}" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M86 34 Q112 26 136 40" ${hl(c)}/>`;
    case "undercut": return `<path d="M54 80 Q52 50 62 40 Q100 34 138 40 Q148 50 146 80 Q140 56 100 52 Q60 56 54 80 Z" fill="${c}" opacity=".42"/><path d="M60 52 Q58 14 104 10 Q152 12 158 44 Q148 38 132 42 Q108 50 60 52 Z" fill="${c}"/><path d="M74 28 Q104 16 140 26" ${hl(c)}/><path d="M86 44 Q116 34 146 40" stroke="${shade(c, -0.25)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    case "brosse": return `<path d="M54 80 Q52 58 58 46 L58 32 Q100 26 142 32 L142 46 Q148 58 146 80 Q140 54 100 50 Q60 54 54 80 Z" fill="${c}"/>${[66, 76, 86, 96, 106, 116, 126, 136].map((x) => `<path d="M${x} 30 V38" stroke="${shade(c, -0.25)}" stroke-width="2.4" stroke-linecap="round"/>`).join("")}<path d="M62 32 H138" stroke="${shade(c, 0.3)}" stroke-width="2" opacity=".5"/>`;
    case "meche": return `<path d="M54 84 Q50 26 100 22 Q150 24 146 80 Q138 56 118 50 Q96 58 70 72 Q60 76 54 84 Z" fill="${c}"/><path d="M60 60 Q86 52 114 46 M66 68 Q90 58 116 50" stroke="${shade(c, -0.25)}" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M84 32 Q110 26 132 36" ${hl(c)}/>`;
    case "bol": return `<path d="M50 82 Q44 20 100 18 Q156 20 150 82 L148 62 Q100 54 52 62 Z" fill="${c}"/><path d="M60 60 V52 M76 58 V48 M92 57 V47 M108 57 V47 M124 58 V48 M140 60 V52" stroke="${shade(c, -0.22)}" stroke-width="2.2" opacity=".6"/><path d="M70 30 Q100 22 130 30" ${hl(c)}/>`;
    case "mulet": return `<path d="M54 80 Q50 26 100 24 Q150 26 146 80 Q142 56 124 48 Q104 58 80 50 Q60 58 54 80 Z" fill="${c}"/><path d="M60 52 L58 40 M140 52 L142 40" stroke="${shade(c, -0.25)}" stroke-width="2.5"/><path d="M78 36 Q98 30 120 36" ${hl(c)}/>`;
    case "nattes": return `<path d="M54 82 Q52 30 100 28 Q148 30 146 82 Q140 54 100 50 Q60 54 54 82 Z" fill="${c}"/>${[62, 76, 90, 104, 118, 132].map((x, i) => `<path d="M${x} ${64 + Math.abs(x - 97) * 0.12} Q${100 + (x - 100) * 0.8} 46 ${100 + (x - 100) * 0.45} ${36 + Math.abs(x - 97) * 0.08}" stroke="${shade(c, 0.28)}" stroke-width="2.4" fill="none" stroke-dasharray="3 3" stroke-linecap="round"/>`).join("")}`;
    case "surfeur": return `<path d="M52 98 Q46 24 100 22 Q154 24 148 98 Q144 66 126 54 Q112 60 102 46 Q94 60 78 54 Q58 66 52 98 Z" fill="${c}"/><path d="M60 80 Q66 64 78 58 M140 80 Q134 64 122 58" stroke="${shade(c, -0.25)}" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M74 34 Q100 26 128 36" ${hl(c)}/>`;
    case "degarni": return `<path d="M54 90 Q50 58 64 42 Q72 50 68 62 Q60 72 58 90 Z M146 90 Q150 58 136 42 Q128 50 132 62 Q140 72 142 90 Z" fill="${c}"/><path d="M70 40 Q86 34 92 42 Q100 36 108 42 Q114 34 130 40 Q118 32 100 32 Q82 32 70 40 Z" fill="${c}" opacity=".7"/><ellipse cx="96" cy="46" rx="12" ry="5" fill="#fff" opacity=".18"/>`;
    case "court": return `<path d="M54 80 Q50 26 100 24 Q150 26 146 80 Q142 56 124 48 Q104 60 80 50 Q60 58 54 80 Z" fill="${c}"/><path d="M78 36 Q98 30 120 36" ${hl(c)}/>`;
    case "houppette": return `<path d="M54 82 Q48 30 92 22 Q86 6 118 4 Q150 6 150 40 Q154 58 146 82 Q140 56 122 50 Q100 60 78 50 Q60 58 54 82 Z" fill="${c}"/><path d="M98 14 Q120 8 136 22" ${hl(c)}/>`;
    case "rase": return `<path d="M54 78 Q52 30 100 30 Q148 30 146 78 Q140 52 100 48 Q60 52 54 78 Z" fill="${c}" opacity=".62"/>`;
    case "mi-long": case "long": return `<path d="M52 98 Q46 24 100 22 Q154 24 148 98 Q144 62 128 50 Q104 70 66 54 Q56 66 52 98 Z" fill="${c}"/><path d="M74 34 Q100 26 128 36" ${hl(c)}/>`;
    case "frange": return `<path d="M52 100 Q46 22 100 20 Q154 22 148 100 L146 62 Q100 70 54 62 Z" fill="${c}"/><path d="M66 62 V50 M84 64 V48 M102 66 V48 M120 64 V48 M136 62 V50" stroke="${shade(c, -0.2)}" stroke-width="2.5" opacity=".6"/>`;
    case "chignon": case "queue": case "couettes": return `<path d="M54 82 Q52 30 100 30 Q148 30 146 82 Q134 50 100 46 Q66 50 54 82 Z" fill="${c}"/><path d="M76 40 Q100 34 124 40" ${hl(c)}/>`;
    case "tresses": return `<path d="M54 86 Q52 28 100 28 Q148 28 146 86 Q138 50 104 44 L100 52 L96 44 Q62 50 54 86 Z" fill="${c}"/>`;
    case "boucles": return [[62, 54, 18], [80, 36, 19], [100, 30, 20], [120, 36, 19], [138, 54, 18], [54, 74, 14], [146, 74, 14], [90, 48, 14], [112, 48, 14]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`).join("") + `<circle cx="94" cy="30" r="6" fill="${shade(c, 0.25)}" opacity=".5"/>`;
    case "afro": return `<path d="M50 80 Q40 12 100 10 Q160 12 150 80 Q142 50 100 48 Q58 50 50 80 Z" fill="${c}"/>` + [[70, 26], [96, 18], [124, 24], [146, 46], [54, 48], [110, 34], [82, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${shade(c, 0.2)}" opacity=".5"/>`).join("");
    case "dreads": return `<path d="M54 82 Q50 28 100 26 Q150 28 146 82 Q140 56 120 50 Q100 58 80 50 Q60 56 54 82 Z" fill="${c}"/>` + [64, 84, 104, 124, 140].map((x) => `<path d="M${x} 44 L${x - 2} 66" stroke="${shade(c, -0.25)}" stroke-width="5" stroke-linecap="round"/>`).join("");
    case "crete": return `<path d="M56 78 Q54 46 74 38 L126 38 Q146 46 144 78 Q130 54 100 52 Q70 54 56 78 Z" fill="${c}" opacity=".45"/><path d="M84 52 L76 -6 L92 12 L100 -16 L108 12 L124 -6 L116 52 Z" fill="${c}"/>`;
    case "chauve": return `<path d="M56 86 Q54 70 60 62 M144 86 Q146 70 140 62" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/><ellipse cx="86" cy="42" rx="14" ry="7" fill="#fff" opacity=".22"/>`;
  }
  return "";
}

// ── visage ──
// expr vient du jeu (smile = repos). Au repos, on affiche l’humeur et la bouche choisies.
const EYE = { ronds: [8.5, 9.5, 5.6], amande: [10, 6.6, 5], grands: [10, 11.5, 6.6], petits: [0, 0, 4.4], chat: [10, 6.8, 5], rieurs: [0, 0, 0] };
function eyesSVG(look, id, expr) {
  const rest = expr === "smile", mood = look.mood, f = look.sex === "f", sk = look.skin;
  const [rx, ry, pr] = EYE[look.eyeShape] || EYE.ronds;
  let dx = 0, dy = 0, lid = 0, lidTilt = 0;
  if (rest) {
    if (mood === "timide") { dx = -2.6; dy = 2.6; }
    if (mood === "reveur") { dx = 2; dy = -3; lid = 0.22; }
    if (mood === "confiant") { dx = 1.5; lid = 0.34; }
    if (mood === "grincheux") { lid = 0.38; lidTilt = 4; }
  }
  if (expr === "think") { dx = 2.6; dy = -3; }
  if (expr === "sad") { lid = 0.2; lidTilt = -3; }
  const lash = "#1d1215";
  const one = (cx, side) => {
    const inner = side ? -1 : 1; // côté du nez
    if (look.eyeShape === "rieurs") {
      const up = expr === "sad" ? -1 : 1;
      return `<path d="M${cx - 9} 91 Q${cx} ${91 - 10 * up} ${cx + 9} 91" stroke="${lash}" stroke-width="3.6" fill="none" stroke-linecap="round"/>${f ? `<path d="M${cx - 9 * inner} 91 l${-4 * inner} -3" stroke="${lash}" stroke-width="2.2" stroke-linecap="round"/>` : ""}`;
    }
    if (look.eyeShape === "petits") {
      return `<circle cx="${cx + 1 * inner + dx * 0.6}" cy="${90 + dy * 0.6}" r="${pr}" fill="#120a08"/><circle cx="${cx + 2 * inner + dx * 0.6}" cy="${88 + dy * 0.6}" r="1.5" fill="#fff"/>${f ? `<path d="M${cx - 5 * inner} 86 l${-4 * inner} -3" stroke="${lash}" stroke-width="2.2" stroke-linecap="round"/>` : ""}`;
    }
    const cy = 88, o = cx - rx * inner, n = cx + rx * inner; // coin extérieur, coin intérieur
    let white;
    if (look.eyeShape === "amande") white = `M${o} ${cy} Q${cx} ${cy - ry * 1.55} ${n} ${cy} Q${cx} ${cy + ry * 1.3} ${o} ${cy} Z`;
    else if (look.eyeShape === "chat") white = `M${o} ${cy - 3} Q${cx} ${cy - ry * 1.5} ${n} ${cy + 1} Q${cx} ${cy + ry * 1.35} ${o} ${cy - 3} Z`;
    else white = `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;
    const cid = `ey${id}${side}`, px = cx + 1 * inner + dx, py = 90 + dy;
    const top = cy - ry - 3, h = (ry * 2 + 6) * lid;
    const lidPath = lid ? `M${cx - rx - 2} ${top} H${cx + rx + 2} V${top + h + lidTilt * inner * 0.5} L${cx - rx - 2} ${top + h + lidTilt * -inner * 0.5} Z` : "";
    const liner = look.eyeShape === "chat" ? `<path d="M${n} ${cy + 1} Q${cx} ${cy - ry * 1.5} ${o} ${cy - 3} l${-6 * inner} -4" stroke="${lash}" stroke-width="2.6" fill="none" stroke-linecap="round"/>` : "";
    const lashes = f && look.eyeShape !== "chat" ? `<path d="M${o + 1.5 * inner} ${cy - ry * 0.62} l${-5 * inner} -4 M${o + 4.5 * inner} ${cy - ry * 0.9} l${-3.5 * inner} -5" stroke="${lash}" stroke-width="2.2" stroke-linecap="round"/>` : "";
    const big = look.eyeShape === "grands" ? `<circle cx="${px - 2.5 * inner}" cy="${py + 2.5}" r="1.1" fill="#fff"/>` : "";
    return `<clipPath id="${cid}"><path d="${white}"/></clipPath>
      <path d="${white}" fill="#fff"/>
      <g clip-path="url(#${cid})"><circle cx="${px}" cy="${py}" r="${pr}" fill="${look.eyes}"/><circle cx="${px}" cy="${py}" r="${pr * 0.46}" fill="#120a08"/><circle cx="${px + 2}" cy="${py - 2.5}" r="${pr * 0.34}" fill="#fff"/>${big}
      ${lid ? `<path d="${lidPath}" fill="${shade(sk, -0.06)}"/><path d="M${cx - rx - 2} ${top + h + lidTilt * -inner * 0.5} L${cx + rx + 2} ${top + h + lidTilt * inner * 0.5}" stroke="${shade(sk, -0.35)}" stroke-width="2"/>` : ""}</g>
      ${liner}${lashes}`;
  };
  return `<g class="av-eyes">${one(81, 0)}${one(119, 1)}</g>`;
}
const BROW = { naturels: [4.6, 5], fins: [2.2, 5], epais: [7.4, 4], arques: [4.4, 10], droits: [5, 0.6], broussailleux: [8, 3] };
function browsSVG(look, expr) {
  const rest = expr === "smile", hc = look.hairColor, f = look.sex === "f";
  const col = shade(hc, lum(hc) > 0.6 ? -0.35 : 0);
  let [w, arch] = BROW[look.brows] || BROW.naturels;
  if (f && look.brows !== "fins") w *= 0.75;
  let base = 68, inL = 0, outL = 0, inR = 0, outR = 0;
  const set = (a, b, c, d) => { inL = a; outL = b; inR = c; outR = d; };
  if (rest) {
    if (look.mood === "neutre") base = 70;
    if (look.mood === "confiant") set(-4, -6, 2, 2);
    if (look.mood === "timide") set(-4, 3, -4, 3);
    if (look.mood === "grincheux") set(6, -2, 6, -2);
    if (look.mood === "reveur") base = 65;
  } else if (expr === "o") base = 62;
  else if (expr === "happy") base = 65;
  else if (expr === "sad") { base = 69; set(-4, 4, -4, 4); }
  else if (expr === "think") set(2, 0, -2, -5);
  const one = (o, n, yo, yn) => {
    const mx = (o + n) / 2, my = Math.min(yo, yn) - arch;
    let s = `<path d="M${o} ${yo} Q${mx} ${my} ${n} ${yn}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
    if (look.brows === "broussailleux") s += [0.2, 0.4, 0.6, 0.8].map((t) => { const x = o + (n - o) * t, y = (1 - t) ** 2 * yo + 2 * (1 - t) * t * my + t * t * yn; return `<path d="M${x - 2} ${y + 3} l4 -7" stroke="${shade(col, -0.25)}" stroke-width="2" stroke-linecap="round"/>`; }).join("");
    return s;
  };
  return one(70, 92, base + outL, base + inL) + one(130, 108, base + outR, base + inR);
}
function mouthSVG(look, expr) {
  const f = look.sex === "f", mk = look.face === "maquillage";
  const lip = mk ? look.faceColor : f ? "#a3283c" : "#7d2430", inside = "#7d2430";
  const line = (d, w = 4) => `<path d="${d}" stroke="${lip}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const open = `<path d="M83 107 Q100 130 117 107 Z" fill="${inside}"/><path d="M90 118 Q100 124 110 118 Q100 128 90 118" fill="#ff8a9a"/>${f || mk ? line("M83 107 Q100 112 117 107", 3) : ""}`;
  if (expr === "smile") switch (look.mouth) {
    case "grand": return open;
    case "dents": return `<path d="M82 107 Q100 128 118 107 Z" fill="#fff" stroke="${lip}" stroke-width="3" stroke-linejoin="round"/><path d="M85 111 Q100 115 115 111 M93 109 V117 M100 110 V118 M107 109 V117" stroke="#d6cdc4" stroke-width="1.4" fill="none"/>`;
    case "coin": return line("M88 114 Q102 117 115 106") + line("M115 106 l3 -1.5", 2.5);
    case "neutre": return line("M90 113 Q100 115 110 113");
    case "bisou": return `<path d="M91 113 Q95 104 100 108 Q105 104 109 113 Q100 124 91 113 Z" fill="${f || mk ? lip : "#b8465a"}" stroke="${shade(lip, -0.3)}" stroke-width="1.5" stroke-linejoin="round"/><path d="M93 113 Q100 115 107 113" stroke="${shade(lip, -0.45)}" stroke-width="1.6" fill="none" stroke-linecap="round"/><ellipse cx="97" cy="109.5" rx="2.4" ry="1.2" fill="#fff" opacity=".45"/>`;
    case "langue": return `<path d="M94 115 Q93 128 100 128 Q107 128 106 115 Z" fill="#ff7a8f" stroke="#c4495c" stroke-width="1.5"/><path d="M100 118 V125" stroke="#c4495c" stroke-width="1.4"/>` + line("M86 110 Q100 122 114 110");
    default: return line("M86 110 Q100 122 114 110");
  }
  switch (expr) {
    case "happy": return open;
    case "shh": return line("M90 113 L110 113");
    case "o": return `<ellipse cx="100" cy="114" rx="6" ry="8" fill="${inside}" stroke="${lip}" stroke-width="2"/>`;
    case "sad": return line("M88 117 Q100 107 112 117");
    case "think": return line("M90 114 Q100 110 112 116");
  }
  return line("M86 110 Q100 122 114 110");
}
function face(look, expr, id) {
  const sk = look.skin, dk = shade(sk, -0.14), mk = look.face === "maquillage";
  const blush = mk ? 0.55 : expr === "smile" && look.mood === "timide" ? 0.62 : expr === "smile" && look.mood === "grincheux" ? 0.12 : 0.3;
  const shadow = mk ? `<ellipse cx="81" cy="81" rx="12" ry="6" fill="${look.faceColor}" opacity=".32"/><ellipse cx="119" cy="81" rx="12" ry="6" fill="${look.faceColor}" opacity=".32"/>` : "";
  const head = `
    <circle cx="54" cy="88" r="10" fill="${sk}"/><circle cx="146" cy="88" r="10" fill="${sk}"/>
    <circle cx="54" cy="88" r="5" fill="${dk}" opacity=".5"/><circle cx="146" cy="88" r="5" fill="${dk}" opacity=".5"/>
    <ellipse cx="100" cy="84" rx="${look.sex === "f" ? 44 : 46}" ry="52" fill="${sk}"/>
    <path d="M60 104 Q100 148 140 104 Q132 130 100 136 Q68 130 60 104 Z" fill="${dk}" opacity=".35"/>
    ${shadow}${eyesSVG(look, id, expr)}${browsSVG(look, expr)}
    <path d="M98 96 Q95 104 101 105" stroke="${dk}" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="70" cy="106" rx="8" ry="4.5" fill="#ff6f8a" opacity="${blush}"/><ellipse cx="130" cy="106" rx="8" ry="4.5" fill="#ff6f8a" opacity="${blush}"/>`;
  return { head, mouth: `<g class="av-mouth">${mouthSVG(look, expr)}</g>` };
}
function faceAcc(a, look) {
  const hc = look.hairColor;
  switch (a) {
    case "lunettes": return `<g fill="none" stroke="${look.faceColor}" stroke-width="3.4"><circle cx="81" cy="89" r="13"/><circle cx="119" cy="89" r="13"/><path d="M94 88 Q100 84 106 88 M68 86 L56 82 M132 86 L144 82"/></g><ellipse cx="76" cy="84" rx="4" ry="2.5" fill="#fff" opacity=".5"/>`;
    case "solaires": return `<path d="M64 80 H96 Q96 100 80 101 Q64 100 64 80 Z M104 80 H136 Q136 100 120 101 Q104 100 104 80 Z" fill="#14121a"/><path d="M96 84 Q100 80 104 84" stroke="#14121a" stroke-width="3" fill="none"/><path d="M70 84 L80 84 M110 84 L120 84" stroke="#fff" stroke-width="2.5" opacity=".55" stroke-linecap="round"/>`;
    case "rousseur": return [[68, 98], [74, 102], [66, 104], [132, 98], [126, 102], [134, 104], [72, 96], [128, 96]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#a0522d" opacity=".7"/>`).join("");
    case "moustache": return `<path d="M100 104 Q86 98 78 108 Q86 112 100 107 Q114 112 122 108 Q114 98 100 104 Z" fill="${hc}"/>`;
    case "barbe": return `<path d="M56 96 Q58 140 100 144 Q142 140 144 96 Q138 120 120 122 Q100 112 80 122 Q62 120 56 96 Z" fill="${hc}"/>`;
    case "barbe3j": return `<path d="M58 100 Q60 138 100 140 Q140 138 142 100 Q136 124 100 126 Q64 124 58 100 Z" fill="${hc}" opacity=".28"/>`;
    case "bandeau-oeil": return `<path d="M52 70 L148 96" stroke="#141218" stroke-width="3"/><ellipse cx="119" cy="89" rx="13" ry="12" fill="#141218"/>`;
  }
  return "";
}
// Où poser un chapeau selon le volume de la coiffure
const HAIR_TOP = { undercut: -8, brosse: -4, afro: -26, crete: -12, chignon: -18, houppette: -10, boucles: -8, dreads: -2 };
const HAIR_WIDE = { afro: 1.34, boucles: 1.08, dreads: 1.06 };
const WIDE_HATS = ["casquette", "bonnet", "chapeau", "bandeau"];
function hatAcc(a, look) {
  const inner = hatShape(a, look); if (!inner) return "";
  const top = HAIR_TOP[look.hair] || 0, wide = HAIR_WIDE[look.hair] || 1;
  if (WIDE_HATS.includes(a)) {
    const k = wide, dy = look.hair === "afro" ? -18 : 0;
    return k === 1 && !dy ? inner : `<g transform="translate(100 ${56 + dy}) scale(${k}) translate(-100 -56)">${inner}</g>`;
  }
  if (a === "fleur" || a === "noeud") return `<g transform="translate(${look.hair === "afro" ? 22 : 0} ${top * 0.7})">${inner}</g>`;
  return `<g transform="translate(0 ${top})">${inner}</g>`;
}
function hatShape(a, look) {
  const c = look.hatColor, dk = shade(c, -0.25);
  switch (a) {
    case "casquette": return `<path d="M54 56 Q54 10 100 8 Q146 10 146 56 Z" fill="${c}"/><path d="M100 9 V54 M76 16 Q72 34 74 54 M124 16 Q128 34 126 54" stroke="${dk}" stroke-width="2" fill="none" opacity=".6"/><circle cx="100" cy="9" r="4" fill="${dk}"/>
      <path d="M50 52 Q100 62 150 52 Q156 56 154 62 Q100 76 46 62 Q44 56 50 52 Z" fill="${dk}"/><path d="M60 58 Q100 66 140 58" stroke="#fff" stroke-width="2" opacity=".25" fill="none"/>`;
    case "bonnet": return `<path d="M52 56 Q50 2 100 0 Q150 2 148 56 Z" fill="${c}"/><rect x="48" y="40" width="104" height="20" rx="9" fill="${dk}"/>${[60, 74, 88, 102, 116, 130, 142].map((x) => `<path d="M${x} 43 V57" stroke="${c}" stroke-width="3" opacity=".55" stroke-linecap="round"/>`).join("")}<circle cx="100" cy="-4" r="12" fill="#f3f0ea"/><circle cx="96" cy="-8" r="4" fill="#fff" opacity=".7"/>`;
    case "chapeau": return `<ellipse cx="100" cy="42" rx="78" ry="14" fill="#1d1a22"/><path d="M64 42 Q62 -4 100 -6 Q138 -4 136 42 Z" fill="#2a2630"/><path d="M84 -2 Q100 6 116 -2" stroke="#1d1a22" stroke-width="3" fill="none"/><path d="M65 32 H135" stroke="${c}" stroke-width="8"/><ellipse cx="100" cy="40" rx="60" ry="6" fill="#000" opacity=".25"/>`;
    case "couronne": return `<path d="M64 36 L64 6 L80 22 L100 0 L120 22 L136 6 L136 36 Z" fill="#ffcf3a" stroke="#c48a00" stroke-width="2"/><circle cx="100" cy="24" r="5" fill="#e8244f"/><circle cx="78" cy="28" r="3.5" fill="#1e9bd7"/><circle cx="122" cy="28" r="3.5" fill="#23b07d"/>`;
    case "bandeau": return `<path d="M52 60 Q100 36 148 60" stroke="${c}" stroke-width="11" fill="none" stroke-linecap="round"/>`;
    case "fleur": return `<g transform="translate(132 40)">${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="0" cy="-9" rx="6" ry="9" fill="${c}" stroke="${dk}" stroke-width="1" transform="rotate(${r})"/>`).join("")}<circle r="5" fill="${c === "#f4c430" ? "#7a4a1e" : "#ffd54a"}"/></g>`;
    case "noeud": return `<g transform="translate(130 30) rotate(18)"><path d="M0 0 L-24 -14 L-24 14 Z M0 0 L24 -14 L24 14 Z" fill="${c}"/><circle r="6" fill="${dk}"/></g>`;
    case "cornes": return `<path d="M64 40 Q52 18 60 2 Q66 22 80 32 Z M136 40 Q148 18 140 2 Q134 22 120 32 Z" fill="#d81b3c"/>`;
    case "aureole": return `<ellipse cx="100" cy="2" rx="40" ry="10" fill="none" stroke="#ffe27a" stroke-width="6"/>`;
  }
  return "";
}
function neckAcc(a, c) {
  const dk = shade(c, -0.3), mid = shade(c, -0.15), light = lum(c) > 0.62;
  switch (a) {
    case "noeud": return `<path d="M100 146 L80 136 L80 158 Z M100 146 L120 136 L120 158 Z" fill="${c}"/><circle cx="100" cy="146" r="6" fill="${dk}"/>`;
    case "cravate": return `<path d="M94 142 H106 L104 152 L110 214 L100 226 L90 214 L96 152 Z" fill="${c}"/><path d="M94 142 H106 L104 152 H96 Z" fill="${dk}"/><path d="M95 166 L108 158 M93 186 L109 176" stroke="${light ? dk : "#ffd54a"}" stroke-width="2.5"/>`;
    case "collier": return [...Array(11).keys()].map((i) => { const a = Math.PI * (0.15 + 0.07 * i); return `<circle cx="${100 + Math.cos(a) * 30}" cy="${134 + Math.sin(a) * 22}" r="4" fill="#fffaf0" stroke="#d9d2c0"/>`; }).join("");
    case "chaine": return `<path d="M72 140 Q100 176 128 140" stroke="#e0b030" stroke-width="5" fill="none" stroke-dasharray="6 3"/><circle cx="100" cy="162" r="7" fill="#ffd54a" stroke="#b8860b" stroke-width="2"/>`;
    case "echarpe": return `<g>
      <path d="M68 128 Q100 142 132 128 Q140 138 136 152 Q100 170 64 152 Q60 138 68 128 Z" fill="${c}"/>
      <path d="M72 136 Q100 150 128 136 M70 146 Q100 162 130 146" stroke="${light ? dk : "#f3f0ea"}" stroke-width="3" fill="none" opacity=".7"/>
      <path d="M104 150 Q112 146 120 152 L128 226 Q118 232 108 228 Z" fill="${mid}"/>
      <path d="M118 150 Q128 150 132 156 L146 216 Q138 222 128 218 Z" fill="${c}"/>
      <path d="M110 176 L122 174 M112 196 L124 194 M126 180 L138 176 M130 198 L142 194" stroke="${light ? dk : "#f3f0ea"}" stroke-width="3" opacity=".7"/>
      <path d="M110 228 V238 M116 230 V240 M122 230 V240 M130 218 V228 M136 218 V228 M142 216 V226" stroke="${mid}" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="114" cy="152" rx="11" ry="9" fill="${mid}"/></g>`;
    case "casque": return `<g>
      <path d="M70 146 Q100 166 130 146" stroke="#1d1a22" stroke-width="7" fill="none" stroke-linecap="round"/>
      <g transform="rotate(-28 72 138)"><rect x="60" y="124" width="24" height="30" rx="11" fill="#1d1a22"/><rect x="64" y="129" width="16" height="20" rx="7" fill="${c}"/><rect x="66" y="131" width="5" height="9" rx="2" fill="#fff" opacity=".35"/></g>
      <g transform="rotate(28 128 138)"><rect x="116" y="124" width="24" height="30" rx="11" fill="#1d1a22"/><rect x="120" y="129" width="16" height="20" rx="7" fill="${c}"/></g></g>`;
  }
  return "";
}
const earrings = (a) => (a === "boucles" ? `<circle cx="53" cy="104" r="5" fill="#ffd54a" stroke="#b8860b" stroke-width="1.5"/><circle cx="147" cy="104" r="5" fill="#ffd54a" stroke="#b8860b" stroke-width="1.5"/>` : "");

// ── tenues ──
const BARE = ["debardeur", "robe", "paillettes", "bain", "nu"];
function torso(look, id, standing) {
  const c = look.outfitColor, dk = shade(c, -0.22), lt = shade(c, 0.18), sk = look.skin, skd = shade(sk, -0.1), f = look.sex === "f";
  const bottom = standing ? 300 : 290;
  const L = f ? 44 : 38, R = 200 - L;
  const body = `M${L} ${bottom} L${L + 2} 188 Q${L + 4} 148 82 138 L118 138 Q${R - 4} 148 ${R - 2} 188 L${R} ${bottom} Z`;
  const skinBody = `<path d="${body}" fill="${sk}"/><path d="M${L + 10} 200 Q100 214 ${R - 10} 200" stroke="${skd}" stroke-width="3" fill="none" opacity=".5"/>`;
  let out = "", defs = "", back = "";
  switch (look.outfit) {
    case "tshirt":
      out = `<path d="${body}" fill="${c}"/><path d="M84 138 Q100 156 116 138" fill="${sk}" stroke="${dk}" stroke-width="4"/><path d="M60 170 Q100 182 140 170" stroke="${lt}" stroke-width="3" fill="none" opacity=".35"/>`; break;
    case "debardeur":
      out = `${skinBody}<path d="M66 ${bottom} L68 168 Q70 150 80 142 Q100 166 120 142 Q130 150 132 168 L134 ${bottom} Z" fill="${c}"/><path d="M72 146 L80 142 M128 146 L120 142" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`; break;
    case "chemise":
      out = `<path d="${body}" fill="${c}"/><path d="M86 138 L100 172 L114 138 Z" fill="${sk}"/><path d="M80 136 L100 168 L92 176 L74 146 Z M120 136 L100 168 L108 176 L126 146 Z" fill="${lt}"/>
        <path d="M100 172 V${bottom}" stroke="${dk}" stroke-width="2"/>${[196, 222, 248].map((y) => `<circle cx="100" cy="${y}" r="2.6" fill="${dk}"/>`).join("")}<path d="M126 196 h18 v14 h-18 z" fill="${dk}" opacity=".35"/>`; break;
    case "polo":
      out = `<path d="${body}" fill="${c}"/><path d="M78 136 L96 150 L86 162 L70 144 Z M122 136 L104 150 L114 162 L130 144 Z" fill="${lt}"/><path d="M90 140 L100 150 L110 140 Z" fill="${sk}"/><path d="M100 150 V184" stroke="${dk}" stroke-width="2"/><circle cx="100" cy="162" r="2.4" fill="${dk}"/><circle cx="100" cy="176" r="2.4" fill="${dk}"/><path d="M58 186 l10 -8 l6 8 l-10 6 z" fill="#fff" opacity=".7"/>`; break;
    case "pull":
      out = `<path d="${body}" fill="${c}"/><rect x="80" y="122" width="40" height="30" rx="12" fill="${lt}"/>${[86, 94, 102, 110].map((x) => `<path d="M${x} 126 V148" stroke="${dk}" stroke-width="2" opacity=".5"/>`).join("")}${[184, 214, 244].map((y) => `<path d="M${L + 6} ${y} Q100 ${y + 10} ${R - 6} ${y}" stroke="${dk}" stroke-width="2" fill="none" opacity=".35"/>`).join("")}`; break;
    case "sweat":
      out = `<path d="${body}" fill="${c}"/><path d="M74 140 Q100 170 126 140 Q120 160 100 162 Q80 160 74 140 Z" fill="${dk}"/><path d="M70 236 H130 L124 268 H76 Z" fill="${dk}" opacity=".55"/>`; break;
    case "hoodie":
      back = `<path d="M52 158 Q46 116 100 110 Q154 116 148 158 Z" fill="${dk}"/><path d="M62 150 Q60 124 100 120 Q140 124 138 150 Z" fill="${shade(c, -0.42)}"/>`;
      out = `<path d="${body}" fill="${c}"/><path d="M68 140 Q100 176 132 140 Q126 162 100 166 Q74 162 68 140 Z" fill="${dk}"/>
        ${["cravate", "echarpe", "noeud"].includes(look.neck) ? "" : `<path d="M92 162 L90 196 M108 162 L110 196" stroke="#f3f0ea" stroke-width="3" stroke-linecap="round"/><circle cx="90" cy="198" r="3" fill="#f3f0ea"/><circle cx="110" cy="198" r="3" fill="#f3f0ea"/>`}
        <path d="M66 234 H134 L126 270 H74 Z" fill="${dk}" opacity=".6"/>`; break;
    case "jean": {
      const dn = "#3b6aa8", dnd = "#2c5288";
      out = `<path d="${body}" fill="${dn}"/><path d="M84 138 L100 ${bottom} L116 138 Z" fill="${c}"/><path d="M84 138 Q100 152 116 138" fill="${sk}"/>
        <path d="M82 138 L72 160 L98 ${bottom - 30} M118 138 L128 160 L102 ${bottom - 30}" stroke="${dnd}" stroke-width="3" fill="none"/>
        ${[58, 116].map((x) => `<path d="M${x} 184 H${x + 26} V192 L${x + 13} 198 L${x} 192 Z" fill="${dnd}"/><circle cx="${x + 13}" cy="192" r="2.6" fill="#d9a640"/>`).join("")}
        <path d="M${L + 4} 170 Q100 178 ${R - 4} 170" stroke="#e0a64a" stroke-width="1.6" fill="none" opacity=".7" stroke-dasharray="4 3"/>`; break;
    }
    case "cuir":
      out = `<path d="${body}" fill="#1c1a20"/><path d="M86 138 L100 ${bottom} L114 138 Z" fill="${c}"/><path d="M86 138 Q100 150 114 138" fill="${sk}"/>
        <path d="M82 136 L66 164 L90 182 Z M118 136 L134 164 L110 182 Z" fill="#2c2932"/><path d="M106 150 L110 ${bottom}" stroke="#bfc3c9" stroke-width="2.5"/><path d="M58 180 Q70 170 82 176" stroke="#fff" stroke-width="3" opacity=".25" fill="none"/>`; break;
    case "costume":
      out = `<path d="${body}" fill="${c}"/><path d="M84 138 L100 200 L116 138 Z" fill="#f6f3ee"/><path d="M82 138 L100 204 L80 220 L66 160 Z M118 138 L100 204 L120 220 L134 160 Z" fill="${dk}"/>
        <path d="M100 204 V${bottom}" stroke="${dk}" stroke-width="2.5"/><circle cx="104" cy="236" r="3" fill="${dk}"/><path d="M128 182 l16 -4 l2 6 l-16 4 z" fill="#fff" opacity=".85"/>`; break;
    case "robe":
      out = `<path d="M50 188 Q52 146 84 140 L116 140 Q148 146 150 188 Z" fill="${sk}"/><path d="M70 156 Q100 178 130 156 L142 ${bottom} H58 Z" fill="${c}"/>
        <path d="M74 152 L80 168 M126 152 L120 168" stroke="${c}" stroke-width="5" stroke-linecap="round"/><path d="M70 156 Q100 178 130 156" stroke="${lt}" stroke-width="3" fill="none"/>`; break;
    case "paillettes": {
      const pid = "pl" + id;
      defs = `<pattern id="${pid}" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${c}"/><circle cx="4" cy="4" r="2.4" fill="${lt}"/><circle cx="11" cy="10" r="2" fill="#fff" opacity=".8"/><circle cx="11" cy="3" r="1.2" fill="${dk}"/></pattern>`;
      out = `<path d="M50 188 Q52 146 84 140 L116 140 Q148 146 150 188 Z" fill="${sk}"/><path d="M64 150 Q100 172 136 150 L146 ${bottom} H54 Z" fill="url(#${pid})"/><path d="M64 150 Q100 172 136 150" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>`; break;
    }
    case "salopette":
      out = `<path d="${body}" fill="#f3f0ea"/><path d="M84 138 Q100 154 116 138" fill="${sk}"/><path d="M68 ${bottom} L70 188 H130 L132 ${bottom} Z" fill="${c}"/><rect x="80" y="196" width="40" height="28" rx="4" fill="${dk}"/>
        <path d="M74 190 L80 144 M126 190 L120 144" stroke="${c}" stroke-width="9" stroke-linecap="round"/><circle cx="76" cy="190" r="4" fill="#ffd54a"/><circle cx="124" cy="190" r="4" fill="#ffd54a"/>`; break;
    case "maillot":
      out = `<path d="${body}" fill="${c}"/><path d="M84 138 L100 160 L116 138" fill="${sk}" stroke="#fff" stroke-width="4"/><path d="M${L + 4} 172 L${L + 10} ${bottom} M${R - 4} 172 L${R - 10} ${bottom}" stroke="#fff" stroke-width="6"/>
        <text x="100" y="232" text-anchor="middle" font-family="Bebas Neue, sans-serif" font-size="58" fill="#fff">10</text>`; break;
    case "peignoir":
      out = `<path d="${body}" fill="${c}"/><path d="M84 138 L100 196 L116 138 Z" fill="${sk}"/><path d="M80 136 L104 212 M120 136 L96 212" stroke="${lt}" stroke-width="10" stroke-linecap="round"/>
        <path d="M${L + 4} 236 H${R - 4}" stroke="${dk}" stroke-width="10"/><path d="M110 236 L118 262 M110 236 L104 264" stroke="${dk}" stroke-width="6" stroke-linecap="round"/>`; break;
    case "bain":
      out = skinBody + (f
        ? `<path d="M70 172 Q84 160 98 172 Q100 188 84 190 Q70 188 70 172 Z M102 172 Q116 160 130 172 Q130 188 116 190 Q100 188 102 172 Z" fill="${c}"/><path d="M98 176 H102 M72 172 L66 150 M128 172 L134 150" stroke="${c}" stroke-width="3"/>`
        : `<path d="M86 176 Q90 172 94 176 M106 176 Q110 172 114 176" stroke="${skd}" stroke-width="2.5" fill="none" opacity=".7"/>`); break;
    case "nu":
      out = skinBody + (f ? censor(66, 164, 68, 30, sk) : `<path d="M86 176 Q90 172 94 176 M106 176 Q110 172 114 176" stroke="${skd}" stroke-width="2.5" fill="none" opacity=".7"/><path d="M100 196 V212" stroke="${skd}" stroke-width="2" opacity=".5"/>`); break;
  }
  const sleeve = BARE.includes(look.outfit) ? sk : look.outfit === "jean" ? "#3b6aa8" : look.outfit === "cuir" ? "#1c1a20" : look.outfit === "salopette" ? "#f3f0ea" : c;
  return { defs, out, back, sleeve };
}
function legs(look, id) {
  const o = look.outfit, sk = look.skin, c = look.outfitColor, f = look.sex === "f";
  const bareLegs = `<path d="M74 300 L72 432 M126 300 L128 432" stroke="${sk}" stroke-width="22" stroke-linecap="round"/>`;
  const shoes = (col = "#1a1420") => `<ellipse cx="68" cy="446" rx="24" ry="10" fill="${col}"/><ellipse cx="132" cy="446" rx="24" ry="10" fill="${col}"/>`;
  const heels = `<ellipse cx="68" cy="446" rx="22" ry="10" fill="#1a1420"/><ellipse cx="132" cy="446" rx="22" ry="10" fill="#1a1420"/><path d="M62 438 L72 420 M138 438 L128 420" stroke="#1a1420" stroke-width="5"/>`;
  const pants = (col) => `<path d="M44 296 H156 L150 440 H106 L100 330 L94 440 H50 Z" fill="${col}"/><path d="M100 330 V300" stroke="${shade(col, -0.25)}" stroke-width="2"/>`;
  if (o === "robe" || o === "paillettes") return bareLegs + `<path d="M58 296 H142 L156 360 Q100 376 44 360 Z" fill="${o === "paillettes" ? `url(#pl${id})` : c}"/>` + heels;
  if (o === "peignoir") return bareLegs + `<path d="M48 296 H152 L156 372 Q100 384 44 372 Z" fill="${c}"/>` + shoes("#f3f0ea");
  if (o === "bain") return bareLegs + (f ? `<path d="M60 296 H140 L128 330 Q100 340 72 330 Z" fill="${c}"/>` : `<path d="M50 296 H150 L146 350 H104 L100 326 L96 350 H54 Z" fill="${c}"/>`) + shoes("#f4c430");
  if (o === "nu") return bareLegs + censor(70, 298, 60, 34, sk) + shoes(sk);
  if (o === "salopette") return pants(c) + shoes();
  if (o === "maillot") return `<path d="M50 296 H150 L146 350 H104 L100 326 L96 350 H54 Z" fill="#f3f0ea"/><path d="M72 350 L72 432 M128 350 L128 432" stroke="${sk}" stroke-width="22" stroke-linecap="round"/><path d="M72 392 V432 M128 392 V432" stroke="${c}" stroke-width="24"/>` + shoes("#f3f0ea");
  if (o === "costume") return pants(shade(c, -0.3)) + shoes();
  if (f && o === "debardeur") return `<path d="M54 296 H146 L150 350 H50 Z" fill="#2c3550"/>` + bareLegs.replace(/M74 300/g, "M74 350").replace(/M126 300/g, "M126 350") + shoes("#f3f0ea");
  return pants(o === "cuir" || o === "pull" ? "#24242e" : "#2c3550") + shoes();
}

export function avatarSVG(lookIn, { pose = "sit", expr = "smile", cls = "" } = {}) {
  const look = sanitizeLook(lookIn);
  const id = ++uid, standing = pose === "stand", H = standing ? 470 : 290;
  const t = torso(look, id, standing), sk = look.skin, skd = shade(sk, -0.12);
  let arms;
  if (standing) {
    arms = `<path d="M46 178 Q32 236 44 296" stroke="${t.sleeve}" stroke-width="26" fill="none" stroke-linecap="round"/><circle cx="45" cy="304" r="13" fill="${sk}"/>
      <path d="M154 178 Q170 226 146 246" stroke="${t.sleeve}" stroke-width="26" fill="none" stroke-linecap="round"/>
      <g class="av-card"><rect x="118" y="206" width="62" height="80" rx="5" fill="#fffdf4" stroke="#e6dcc8" stroke-width="2" transform="rotate(-10 149 246)"/>
      <path d="M128 222 h30 M128 234 h40 M128 246 h34" stroke="#d4145a" stroke-width="3" stroke-linecap="round" transform="rotate(-10 149 246)" opacity=".75"/></g>
      <circle cx="140" cy="250" r="13" fill="${sk}"/>`;
  } else {
    arms = `<path d="M46 180 Q36 238 80 266" stroke="${t.sleeve}" stroke-width="26" fill="none" stroke-linecap="round"/>
      <path d="M154 180 Q164 238 120 266" stroke="${t.sleeve}" stroke-width="26" fill="none" stroke-linecap="round"/>
      <ellipse cx="88" cy="268" rx="14" ry="11" fill="${sk}"/><ellipse cx="112" cy="268" rx="14" ry="11" fill="${sk}"/>`;
  }
  const coverHat = ["bonnet", "chapeau", "casquette"].includes(look.hat);
  const hatHidesHair = coverHat && !["long", "mi-long", "frange", "tresses", "couettes", "dreads", "afro", "queue", "surfeur"].includes(look.hair);
  const fc = face(look, expr, id);
  const backHair = coverHat && look.hair === "chignon" ? "" : hairBack(look.hair, look.hairColor);
  return `<svg class="av ${cls}" viewBox="0 0 200 ${H}" xmlns="http://www.w3.org/2000/svg" data-expr="${expr}">
    <defs>${t.defs}</defs>
    <g class="av-body">
      ${standing ? legs(look, id) : ""}
      ${t.back}
      <g class="av-hairback">${backHair}</g>
      <path d="M86 118 H114 V146 Q100 154 86 146 Z" fill="${skd}"/>
      ${t.out}${neckAcc(look.neck, look.neckColor)}
      ${arms}
      <g class="av-head">${fc.head}${look.face === "barbe" ? "" : fc.mouth}${hatHidesHair ? (["crete", "houppette", "court", "boucles", "degrade", "raie", "undercut", "brosse", "meche", "bol", "mulet", "nattes"].includes(look.hair) ? hairFront("rase", look.hairColor) : "") : hairFront(look.hair, look.hairColor)}${faceAcc(look.face, look)}${look.face === "barbe" ? fc.mouth : ""}${earrings(look.neck)}${hatAcc(look.hat, look)}</g>
    </g></svg>`;
}

// Symboles ♀ ♂ dessinés
export const sexIcon = (s) => s === "f"
  ? `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="9" r="5.5"/><path d="M12 14.5V22M8.5 18.5h7"/></svg>`
  : `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="10" cy="14" r="5.5"/><path d="M14 10l6-6M15 4h5v5"/></svg>`;
