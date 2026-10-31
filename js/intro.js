// Générique d'ouverture : la petite vidéo qui explique les règles, façon émission.
// Tout est en HTML/CSS animé, joué en même temps sur la télé et les téléphones.
import { avatarSVG } from "./avatar.js";

// Durée de chaque plan (ms)
export const INTRO = [3800, 4600, 4800, 4400, 4200, 4800, 4600, 3800, 4200];
export const INTRO_TOTAL = INTRO.reduce((a, b) => a + b, 0);

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const bust = (look, expr = "smile") => avatarSVG(look, { pose: "sit", expr }).replace(/viewBox="[^"]*"/, 'viewBox="14 -26 172 250"');
const head = (look, expr = "smile") => avatarSVG(look, { pose: "sit", expr }).replace(/viewBox="[^"]*"/, 'viewBox="18 -30 164 176"');
const full = (look, expr = "smile") => avatarSVG(look, { pose: "stand", expr });
const COAL = `<svg class="io-coal" viewBox="0 0 200 180" aria-hidden="true"><defs>
  <radialGradient id="ioHeat" cx="50%" cy="55%" r="60%"><stop offset="0" stop-color="#ffd36b"/><stop offset=".45" stop-color="#ff6a1a"/><stop offset="1" stop-color="#5a1206"/></radialGradient>
  <linearGradient id="ioCoal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a2a"/><stop offset="1" stop-color="#120a0a"/></linearGradient></defs>
  <path d="M100 168 C40 124 6 92 6 52 C6 24 28 6 54 6 C74 6 90 18 100 34 C110 18 126 6 146 6 C172 6 194 24 194 52 C194 92 160 124 100 168 Z" fill="url(#ioCoal)"/>
  <path class="io-coal-heat" d="M100 168 C40 124 6 92 6 52 C6 24 28 6 54 6 C74 6 90 18 100 34 C110 18 126 6 146 6 C172 6 194 24 194 52 C194 92 160 124 100 168 Z" fill="url(#ioHeat)"/>
  <path d="M52 42 l16 10 l2 16 M146 58 l-16 6 M110 98 l-8 16 l10 14" stroke="#ffb347" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/></svg>`;

function rule(n, title, text, art) {
  return `<div class="io-rule">
    <div class="io-txt"><div class="io-num">${String(n).padStart(2, "0")}</div><div class="io-k">Règle n°${n}</div><h2 class="io-h">${title}</h2><p class="io-p">${text}</p></div>
    <div class="io-art">${art}</div></div>`;
}

// S = état de la room
export function introHTML(S) {
  const seat = {};
  for (const p of Object.values(S.players)) if (p.duo != null && p.seat != null && p.duo < S.duoCount) seat[p.duo + "-" + p.seat] = p;
  const duos = [...Array(S.duoCount).keys()].filter((d) => seat[d + "-0"] || seat[d + "-1"]);
  const fullDuo = duos.find((d) => seat[d + "-0"] && seat[d + "-1"]) ?? duos[0] ?? 0;
  const A = seat[fullDuo + "-0"] || seat[fullDuo + "-1"] || { name: "Candidat", look: S.hostLook };
  const B = seat[fullDuo + "-1"] || seat[fullDuo + "-0"] || A;
  const host = S.hostLook, hn = esc(S.hostName || "Le présentateur");
  const many = duos.length > 4;

  const scenes = [
    // 0. Ouverture
    `<div class="io-open"><div class="io-smoke"><i></i><i></i><i></i></div>${COAL}
      <div class="io-kick">Ce soir, en direct</div>
      <div class="io-logo"><span>FRI</span><span>ENDS</span></div>
      <div class="io-slogan">Qui connaît le mieux son pote ?</div></div>`,
    // 1. Les candidats
    `<div class="io-cast"><div class="io-k">Sur le plateau ce soir</div><h2 class="io-h">Nos candidats</h2>
      <div class="io-duos ${many ? "many" : ""}">${duos.map((d, i) => `<div class="io-duo" style="--i:${i}">
        <div class="io-pair">${[0, 1].map((s) => seat[d + "-" + s] ? `<div class="io-face">${head(seat[d + "-" + s].look, "happy")}</div>` : `<div class="io-face empty"></div>`).join("")}</div>
        <div class="io-dn">Duo ${d + 1}</div><div class="io-names">${esc(seat[d + "-0"]?.name || "?")} <b>&</b> ${esc(seat[d + "-1"]?.name || "?")}</div></div>`).join("")}</div>
      <div class="io-p io-host">Présenté par <b>${hn}</b>${S.cohost ? ` et <b>${esc(S.cohost.name)}</b>` : ""}</div></div>`,
    // 2. La question
    rule(1, "La question", `${hn} choisit un candidat et lui pose une question… <b>sur son pote</b>.`,
      `<div class="io-host-fig">${full(host, "happy")}</div>
       <div class="io-bubble">« ${esc(A.name)}, quel est le plat préféré de ${esc(B.name)} ? »</div>
       <div class="io-cand">${bust(A.look, "think")}<span>${esc(A.name)}</span></div>`),
    // 3. La réponse cachée
    rule(2, "La vraie réponse", `${esc(B.name)} a déjà donné la sienne : <b>en secret</b> sur son téléphone, ou dans le <b>formulaire</b>.`,
      `<div class="io-cand big">${bust(B.look, "shh")}<span>${esc(B.name)}</span></div>
       <div class="io-card"><div class="io-card-h">Fiche du présentateur</div><div class="io-card-q">Plat préféré de ${esc(B.name)}</div>
         <div class="io-card-a"><span>Les lasagnes de mamie</span><i class="io-lock"></i></div></div>`),
    // 4. L'ardoise
    rule(3, "L'ardoise", `Tu écris ta réponse sur ton téléphone <b>avant la fin du chrono</b>. Elle apparaît sur ton ardoise.`,
      `<div class="io-slate"><span class="io-chalk">Les lasagnes !</span></div>
       <div class="io-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="bg"/><circle cx="60" cy="60" r="52" class="fg"/></svg><b>20</b></div>`),
    // 5. Le verdict
    rule(4, "Le verdict", `Bonne réponse : des points pour le duo. Pas tout à fait ça mais bien défendu ? <b>Justificatif accepté</b>.`,
      `<div class="io-stamps"><div class="io-st good">Bonne réponse<small>+ points</small></div><div class="io-st just">Justificatif accepté<small>+ points</small></div><div class="io-st bad">Raté<small>0 point</small></div></div>`),
    // 6. Objection
    rule(5, "Objection !", `Un autre duo connaît la bonne réponse ? Il crie <b>Objection</b> et peut <b>voler le point</b>.`,
      `<div class="io-obj"><svg viewBox="0 0 1000 420"><polygon points="500,10 560,140 700,40 660,170 900,120 720,230 960,300 680,290 740,410 560,310 500,415 440,310 260,410 320,290 40,300 280,230 100,120 340,170 300,40 440,140"/></svg><b>OBJECTION !</b></div>`),
    // 7. Les manches
    rule(6, "Les manches", `Plus l'émission avance, plus ça rapporte. Le duo qui a le plus de points gagne.`,
      `<div class="io-steps">${[["Manche 1", "1 pt"], ["Manche 2", "2 pts"], ["Finale", "3 pts"]].map(([a, b], i) => `<div class="io-step" style="--i:${i}"><b>${b}</b><span>${a}</span></div>`).join("")}</div>`),
    // 8. Fin
    `<div class="io-end"><div class="io-smoke"><i></i><i></i><i></i></div>${COAL}<h2 class="io-h">Que le meilleur pote gagne !</h2>
      <div class="io-count"><b>3</b><b>2</b><b>1</b></div><div class="io-p">On allume le charbon…</div></div>`,
  ];
  return `<div class="io-bg"></div><div class="io-embers">${"<i></i>".repeat(16)}</div>
    ${scenes.map((h, i) => `<section class="is is${i}">${h}</section>`).join("")}
    <div class="io-chip">FRIENDS · Les règles</div>
    <div class="io-prog">${INTRO.map(() => "<i><b></b></i>").join("")}</div>`;
}

// Affiche le plan qui correspond au temps écoulé ; renvoie son numéro (-1 = fini)
export function introTick(root, ms) {
  let t = ms, idx = -1;
  for (let i = 0; i < INTRO.length; i++) { if (t < INTRO[i]) { idx = i; break; } t -= INTRO[i]; }
  const sc = root.querySelectorAll(".is"), bars = root.querySelectorAll(".io-prog b");
  sc.forEach((s, i) => s.classList.toggle("on", i === idx));
  bars.forEach((b, i) => (b.style.width = (i < idx || idx < 0 ? 100 : i === idx ? (t / INTRO[i]) * 100 : 0) + "%"));
  return idx;
}
