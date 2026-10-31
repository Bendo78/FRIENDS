// Journal de bord : note ce qui se passe pendant la partie (dans le téléphone uniquement),
// pour comprendre pourquoi un navigateur mobile ferme ou recharge la page.
// Au lancement suivant, l'accueil affiche le rapport de la visite précédente.
const KEY = "cac-journal", KEEP = 40;
const now = () => Date.now();
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } };

const prev = read(); // visite précédente
const navType = (performance.getEntriesByType?.("navigation")?.[0]?.type) || "?";
const cur = {
  start: now(), beat: now(), clean: false, hidden: false,
  nav: navType, discarded: !!document.wasDiscarded,
  ua: navigator.userAgent, ram: navigator.deviceMemory || null,
  screen: `${screen.width}x${screen.height} @${devicePixelRatio}`,
  heap: null, nodes: null, ev: [],
};
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cur)); } catch {} };

export function log(type, data = "") {
  cur.ev.push([+((now() - cur.start) / 1000).toFixed(1), type, String(data).slice(0, 160)]);
  if (cur.ev.length > KEEP) cur.ev.shift();
  save();
}

// battement toutes les 2 s : mémoire et nombre d'éléments
setInterval(() => {
  cur.beat = now();
  const m = performance.memory; if (m) cur.heap = Math.round(m.usedJSHeapSize / 1e6);
  cur.nodes = document.getElementsByTagName("*").length;
  save();
}, 2000);

addEventListener("error", (e) => log("erreur", `${e.message} (${(e.filename || "").split("/").pop()}:${e.lineno})`));
addEventListener("unhandledrejection", (e) => log("erreur-promesse", e.reason?.message || e.reason));
addEventListener("pagehide", (e) => { cur.clean = true; log("page quittée", e.persisted ? "mise en cache" : ""); });
document.addEventListener("visibilitychange", () => { cur.hidden = document.visibilityState === "hidden"; log("écran", document.visibilityState === "hidden" ? "caché (appli en arrière-plan)" : "visible"); });
let lastSize = "", sizeT = 0;
addEventListener("resize", () => { const s = innerWidth + "x" + innerHeight; if (s !== lastSize && now() - sizeT > 800) { sizeT = now(); lastSize = s; log("taille", s); } });
document.addEventListener("click", (e) => { const b = e.target.closest?.("button, [data-act]"); if (b) log("clic", b.dataset.act ? b.dataset.act + (b.dataset.v != null ? ":" + b.dataset.v : "") : b.id || b.textContent.trim().slice(0, 24)); }, true);
let scrollT = 0;
document.addEventListener("scroll", () => { if (now() - scrollT > 1500) { scrollT = now(); log("défilement"); } }, true);
log("ouverture", `${navType}${cur.discarded ? ", onglet relancé par le téléphone (mémoire)" : ""}`);

// ─── Rapport de la visite précédente ───
// Renvoie null si rien d'anormal, sinon { text, crashed }
export function lastReport() {
  if (!prev?.ev?.length) return null;
  const age = now() - prev.beat;
  if (age > 30 * 60e3) return null;                      // trop ancien
  const crashed = !prev.clean;                            // pas de « page quittée » : fermée brutalement
  const reload = navType === "reload";
  if (!crashed && !reload && !cur.discarded) return null; // visite normale terminée normalement
  const why = cur.discarded ? "le téléphone a fermé l'onglet pour libérer de la mémoire"
    : crashed ? (prev.hidden ? "l'onglet a été fermé pendant qu'il était en arrière-plan" : "la page s'est fermée brutalement (plantage du navigateur)")
    : "la page a été rechargée (geste « glisser pour rafraîchir » ou bouton recharger)";
  const dur = Math.round((prev.beat - prev.start) / 1000);
  const lines = [
    `FRIENDS — rapport de fermeture`,
    `Cause probable : ${why}`,
    `Durée avant fermeture : ${dur} s · ouverture actuelle : ${navType}${cur.discarded ? " (onglet relancé)" : ""}`,
    `Mémoire JS : ${prev.heap ?? "?"} Mo · éléments : ${prev.nodes ?? "?"} · RAM téléphone : ${prev.ram ?? "?"} Go · écran ${prev.screen}`,
    `Navigateur : ${prev.ua}`,
    `Derniers évènements (secondes) :`,
    ...prev.ev.slice(-18).map(([t, k, d]) => `  ${t}s  ${k}${d ? " — " + d : ""}`),
  ];
  return { crashed: crashed || cur.discarded, text: lines.join("\n") };
}
