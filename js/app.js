import { connect, isOnline } from "./net.js";
import { Stage } from "./stage.js";
import { INTRO, INTRO_TOTAL } from "./intro.js";
import { sfx, unlock, setMuted, isMuted } from "./sound.js";
import { QUESTIONS, CATEGORIES, fill } from "./questions.js";
import { OPTIONS, LABELS, avatarSVG, randomLook, sanitizeLook, sexIcon, isAllowed, whyNot, COLORABLE, FACE_DEFAULT } from "./avatar.js";
import { icon } from "./icons.js";
import { fetchSheet, parseCSV, analyze, norm } from "./sheet.js";

// ───────────────────────── utilitaires ─────────────────────────
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clean = (s, n) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const LS = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
// Copie de l'état (JSON simple) : marche aussi sur les iPhone qui n'ont pas structuredClone
const clone = (o) => JSON.parse(JSON.stringify(o));
const SS = {
  get(k, d = null) { try { const v = sessionStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { sessionStorage.removeItem(k); } catch {} },
};
const TIMERS = [10, 15, 20, 30, 45, 60];
// Un identifiant par onglet (survit au rechargement)
const pid = SS.get("cac-pid") || (() => { const id = Math.random().toString(36).slice(2, 10); SS.set("cac-pid", id); return id; })();

let toastT;
function toast(msg, ms = 3000) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), ms); }

// ───────────────────────── état ─────────────────────────
let role = null;          // "host" | "player" | "co" | "tv"
let net = null, S = null, lastS = null, stage = null, offset = 0, panelKey = "";
let myName = "", myLook = null;
const H = { draft: "", say: "", qv: 0, editLook: false, sheetV: 0, sheetBusy: false, sheetErr: "",
  form: { src: "form", tpl: null, q: "", expected: "", col: null, who: "", timer: 20, points: 1, cat: "Toutes" } };
// Réponses du formulaire (privées au présentateur) et questions perso
H.sheet = LS.get("cac-sheet", null);
H.data = H.sheet ? analyze(H.sheet.rows, H.sheet.nameCol) : null;
H.mine = LS.get("cac-myq", []);
const MAX_DUOS = 10;
const zeros = () => Array(MAX_DUOS).fill(0);
const CO = { priv: {}, say: "" };
let myMsg = "", myObjN = -1, myObjSentN = -1;
let joined = false, everJoined = false, editing = false, myDraft = "", mySubmitN = -1, mySecretN = -1, lastDraftSent = 0, draftTimer = null, lookTimer = null;

const playerAt = (d, s) => S && Object.values(S.players).find((p) => p.duo === d && p.seat === s);
const target = () => S?.round && playerAt(S.round.duo, S.round.seat);
const partner = () => S?.round && playerAt(S.round.duo, 1 - S.round.seat);
const nm = (p, d = "?") => (p ? p.name : d);
const btnIc = (name, label) => `${icon(name)}<span>${label}</span>`;

// ───────────────────────── éditeur de personnage ─────────────────────────
let edTab = "corps";
const ED_TABS = [["corps", "Corps"], ["visage", "Visage"], ["cheveux", "Cheveux"], ["tenue", "Tenue"], ["acc", "Accessoires"]];
function editorHTML(look, { preview = true } = {}) {
  const sw = (k, label) => `<div class="ed-row"><span class="ed-l">${label}</span><div class="swatches">${OPTIONS[k].map((c) =>
    `<button type="button" class="sw ${look[k] === c ? "on" : ""}" style="--c:${c}" data-act="look" data-k="${k}" data-v="${c}" aria-label="${label} ${c}" aria-pressed="${look[k] === c}"></button>`).join("")}</div></div>`;
  const ch = (k, label) => {
    const off = OPTIONS[k].filter((v) => !isAllowed(k, v, look));
    const note = off.length ? `<p class="ed-why">${[...new Set(off.map((v) => whyNot(k, v)))].join(" ")}</p>` : "";
    return `<div class="ed-row"><span class="ed-l">${label}</span><div class="chips">${OPTIONS[k].map((v) => {
      const ok = isAllowed(k, v, look);
      return `<button type="button" class="chip ${look[k] === v ? "on" : ""}" data-act="look" data-k="${k}" data-v="${v}" aria-pressed="${look[k] === v}" ${ok ? "" : `disabled title="${whyNot(k, v)}"`}>${LABELS[k][v]}</button>`;
    }).join("")}</div>${note}</div>`;
  };
  const sex = `<div class="ed-row"><span class="ed-l">Sexe</span><div class="sex-pick">${[["f", "Femme"], ["m", "Homme"]].map(([v, l]) =>
    `<button type="button" class="sex-btn s-${v} ${look.sex === v ? "on" : ""}" data-act="look" data-k="sex" data-v="${v}" aria-label="${l}" aria-pressed="${look.sex === v}" title="${l}">${sexIcon(v)}</button>`).join("")}</div></div>`;
  // couleur d’un accessoire : affichée seulement s’il est porté et coloriable
  const accSw = (k) => { const c = COLORABLE[k]; return c.items.includes(look[k]) ? `<div class="ed-sub">${sw(c.key, "Couleur : " + LABELS[k][look[k]])}</div>` : ""; };
  const panes = {
    corps: sex + sw("skin", "Peau"),
    visage: ch("mood", "Expression") + ch("eyeShape", "Yeux") + sw("eyes", "Couleur des yeux") + ch("brows", "Sourcils") + ch("mouth", "Bouche"),
    cheveux: ch("hair", "Coiffure") + sw("hairColor", "Couleur"),
    tenue: ch("outfit", "Tenue") + sw("outfitColor", "Couleur"),
    acc: ch("face", "Visage") + accSw("face") + ch("hat", "Tête") + accSw("hat") + ch("neck", "Cou et oreilles") + accSw("neck"),
  };
  return `<div class="editor">
    ${preview ? `<div class="ed-preview"><div class="ed-spot"></div>${avatarSVG(look, { pose: "stand", expr: "smile" })}<button type="button" class="btn small ghost ed-rand" data-act="lookRand">${btnIc("shuffle", "Au hasard")}</button></div>` : ""}
    <div class="ed-ctrls">
      <div class="ed-tabs" role="tablist">${ED_TABS.map(([k, l]) => `<button type="button" role="tab" class="ed-tab ${edTab === k ? "on" : ""}" aria-selected="${edTab === k}" data-act="edTab" data-v="${k}">${l}</button>`).join("")}</div>
      ${panes[edTab]}
      ${preview ? "" : `<button type="button" class="btn small ghost" data-act="lookRand">${btnIc("shuffle", "Au hasard")}</button>`}
    </div>
  </div>`;
}
function applyLookAct(look, d) {
  if (d.act === "lookRand") return randomLook();
  const next = sanitizeLook({ ...look, [d.k]: d.v, ...(d.k === "face" && FACE_DEFAULT[d.v] ? { faceColor: FACE_DEFAULT[d.v] } : {}) });
  // un accessoire retiré parce qu’il ne va plus avec la nouvelle tenue : on prévient
  for (const k of ["neck"]) if (look[k] !== "aucun" && next[k] === "aucun" && d.k !== k) toast(`${whyNot(k, look[k])} J’ai retiré : ${LABELS[k][look[k]]}.`);
  return next;
}

// ───────────────────────── accueil ─────────────────────────
function initHome() {
  document.querySelectorAll("[data-ic]").forEach((b) => (b.innerHTML = btnIc(b.dataset.ic, b.textContent)));
  const mode = $("#netMode");
  if (isOnline()) { mode.innerHTML = `<i class="dot on"></i>En ligne — jouable depuis n'importe où`; mode.classList.add("on"); }
  else { mode.innerHTML = `<i class="dot local"></i>Mode local — seulement entre onglets de ce navigateur (configure Supabase pour jouer en ligne)`; mode.classList.add("off"); }

  myLook = sanitizeLook(SS.get("cac-look") || LS.get("cac-look") || randomLook());
  myName = SS.get("cac-name") || LS.get("cac-name", "");
  $("#myName").value = myName;
  const ed = $("#homeEditor");
  const draw = () => (ed.innerHTML = editorHTML(myLook));
  draw();
  ed.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    if (b.dataset.act === "edTab") { edTab = b.dataset.v; return draw(); }
    myLook = applyLookAct(myLook, b.dataset); saveMe(); draw();
  });
  $("#myName").addEventListener("input", (e) => { myName = clean(e.target.value, 14); saveMe(); });

  const r = new URLSearchParams(location.search).get("r");
  if (r) { $("#roomCode").value = r.toUpperCase(); setTimeout(() => $("#myName").focus(), 50); }
  $("#roomCode").addEventListener("input", (e) => (e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, "")));

  // Rechargement de page : on remet chacun à sa place
  const again = SS.get("cac-session");
  if (again && (!r || r.toUpperCase() === again.code) && myName) {
    if (again.role === "player") return void startPlayer(again.code);
    if (again.role === "co") return void startCo(again.code);
    // Le présentateur revient sur son émission (page rechargée par erreur, onglet relancé par le téléphone…)
    // Garde-fou : deux rechargements en moins de 20 s, on reste sur l'accueil pour ne pas boucler.
    if (again.role === "host" && LS.get("cac-host-" + again.code)) {
      const now = Date.now();
      if (now - SS.get("cac-resumeAt", 0) > 20000) { SS.set("cac-resumeAt", now); return void startHost(again.code); }
    }
  }
  const last = LS.get("cac-lasthost");
  if (last && LS.get("cac-host-" + last)) {
    const b = $("#btnResume"); b.innerHTML = btnIc("refresh", `Reprendre l'émission ${last}`); b.classList.remove("hidden");
    b.onclick = () => { unlock(); startHost(last); };
  }
  const err = (m) => ($("#homeErr").textContent = m);
  const needCode = () => { const c = clean($("#roomCode").value, 4).toUpperCase(); if (c.length !== 4) { err("Le code de la room fait 4 lettres."); $("#roomCode").focus(); return null; } return c; };
  const needName = () => { if (!myName) { err("Écris ton prénom pour que ton nom apparaisse sur le plateau."); $("#myName").focus(); return false; } return true; };
  $("#btnCreate").onclick = () => { if (!needName()) return; unlock(); startHost(); };
  $("#btnJoin").onclick = () => { const c = needCode(); if (!c || !needName()) return; unlock(); startPlayer(c); };
  $("#btnCo").onclick = () => { const c = needCode(); if (!c || !needName()) return; unlock(); startCo(c); };
  $("#btnTV").onclick = () => { const c = needCode(); if (!c) return; unlock(); startTV(c); };

  // Arrivé par un lien d'invitation sur téléphone : le bouton « Rejoindre » reste sous le pouce
  const bar = $("#mJoin");
  if (bar && r && "IntersectionObserver" in window) {
    bar.querySelector("b").textContent = clean(r, 4).toUpperCase();
    bar.querySelector("button").onclick = () => $("#btnJoin").click();
    new IntersectionObserver(([e]) => bar.classList.toggle("show", !e.isIntersecting)).observe($("#btnJoin"));
  }
}
function saveMe() { SS.set("cac-look", myLook); LS.set("cac-look", myLook); SS.set("cac-name", myName); LS.set("cac-name", myName); }

function setStatus(st) {
  const map = { online: ["on", "En ligne"], local: ["local", "Mode local (même navigateur)"], error: ["err", "Connexion perdue, reconnexion…"], offline: ["err", "Hors ligne"] };
  const [c, t] = map[st] || ["", "Connexion…"];
  $("#tbStatus").innerHTML = `<i class="dot ${c}"></i><span>${t}</span>`;
}
function setMuteIcon() { $("#btnMute").innerHTML = icon(isMuted() ? "mute" : "sound"); $("#btnMute").setAttribute("aria-label", isMuted() ? "Remettre le son" : "Couper le son"); }

async function enter(r, code) {
  role = r;
  document.documentElement.classList.add("in-game"); // bloque le « glisser pour rafraîchir » du téléphone
  $("#home").classList.add("hidden");
  const g = $("#game"); g.classList.remove("hidden"); g.classList.add("role-" + r);
  $("#tbCode").textContent = "ROOM " + code;
  stage = new Stage($("#stageHost"));
  // Téléphone : le plateau animé est masqué par défaut (le téléphone sert de télécommande,
  // le plateau passe sur la télé ou le PC). Certains téléphones plantent sinon. Bouton pour l'afficher.
  const phone = r !== "tv" && matchMedia("(max-width: 900px), (pointer: coarse)").matches;
  const applyStage = () => {
    const on = !phone || LS.get("cac-stage") === "on";
    g.classList.toggle("no-stage", !on);
    $("#btnStage").classList.toggle("on", on);
    $("#btnStage").setAttribute("aria-label", on ? "Masquer le plateau" : "Afficher le plateau");
    if (on) requestAnimationFrame(() => stage?.fit());
  };
  $("#btnStage").classList.toggle("hidden", !phone); $("#btnStage").innerHTML = icon("tv");
  $("#btnStage").onclick = $("#stageOn").onclick = () => { LS.set("cac-stage", g.classList.contains("no-stage") ? "on" : "off"); applyStage(); };
  applyStage();
  bindPanel();
  setMuteIcon();
  $("#btnFull").innerHTML = icon("full"); $("#btnQuit").innerHTML = icon("close");
  $("#btnMute").onclick = () => { setMuted(!isMuted()); setMuteIcon(); };
  $("#btnFull").onclick = () => { const el = $("#stageHost"); document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen?.(); };
  $("#btnQuit").onclick = () => { if (confirm("Quitter le plateau ?")) { SS.del("cac-session"); location.href = location.pathname; } };
  if (r === "tv") $("#stageHost").ondblclick = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.());
  setStatus("…");
  try { net = await connect(code, onMsg, setStatus); }
  catch (e) { setStatus("error"); toast("Connexion impossible : " + e.message + " (vérifie js/config.js)", 6000); }
  requestAnimationFrame(loop);
}

// ───────────────────────── PRÉSENTATEUR ─────────────────────────
function genCode() { const L = "ABCDEFGHJKLMNPQRSTUVWXYZ"; return Array.from({ length: 4 }, () => L[Math.floor(Math.random() * L.length)]).join(""); }
function newRoom(code) {
  return { code, hostName: myName, hostLook: myLook, cohost: null, phase: "lobby", duoCount: 3, players: {}, scores: zeros(), sel: { duo: 0, seat: 0 }, round: null, roundNo: 0 };
}
async function startHost(resume) {
  const code = resume || genCode();
  S = (resume && LS.get("cac-host-" + code)) || newRoom(code);
  if (myName) S.hostName = myName;
  S.hostLook = sanitizeLook(S.hostLook || myLook);
  for (const p of Object.values(S.players)) p.look = sanitizeLook(p.look);
  S.scores = [...S.scores, ...zeros()].slice(0, MAX_DUOS);
  if (!H.data) H.form.src = "bank";
  if (S.phase === "question" && S.round && !S.round.submitted) S.round.endsAt = Date.now() + S.round.timer * 1000;
  LS.set("cac-lasthost", code);
  SS.set("cac-session", { role: "host", code });
  await enter("host", code);
  commit();
  setInterval(hostTick, 200);
  setInterval(broadcast, 3000);
}
function publicState() {
  const s = clone(S);
  if (s.round) {
    if (s.phase !== "verdict") delete s.round.expected;
    if (s.phase === "question" || s.phase === "secret") delete s.round.answer;
  }
  return s;
}
function broadcast() {
  if (!net || role !== "host") return;
  net.send({ t: "state", s: publicState(), now: Date.now() });
  sendPriv();
}
function sendPriv() {
  if (!net || !S.cohost) return;
  const R = S.round;
  net.send({ t: "priv", to: S.cohost.id, expected: R?.expected || "", draft: H.draft, answer: R?.answer ?? null, secretIn: !!R?.secretIn });
}
function commit() { LS.set("cac-host-" + S.code, S); broadcast(); render(); }

function sit(id, duo, seat) {
  const p = S.players[id]; if (!p) return false;
  if (duo == null) { p.duo = null; p.seat = null; return true; }
  const occ = playerAt(duo, seat);
  if (occ && occ.id !== id) return false;
  p.duo = duo; p.seat = seat; return true;
}
function hostHandle(m) {
  const id = m.pid;
  switch (m.t) {
    case "hello": broadcast(); break;
    case "join": {
      if (!id) return;
      const was = S.players[id];
      S.players[id] = { duo: null, seat: null, ...(was || {}), id, name: clean(m.name, 14) || "Candidat", look: sanitizeLook(m.look) };
      if (!was) toast(`${S.players[id].name} a rejoint le plateau`);
      commit(); break;
    }
    case "cojoin": {
      if (!id) return;
      if (S.cohost && S.cohost.id !== id) return net.send({ t: "cofull", to: id });
      const was = S.cohost;
      S.cohost = { id, name: clean(m.name, 14) || "Co-présentateur", look: sanitizeLook(m.look) };
      if (!was) toast(`${S.cohost.name} rejoint la présentation`);
      commit(); break;
    }
    case "sit":
      if (!S.players[id]) return;
      if (S.round && ["secret", "question", "reveal"].includes(S.phase) && (target()?.id === id || partner()?.id === id)) return;
      if (sit(id, m.duo == null ? null : +m.duo, m.seat == null ? null : +m.seat)) commit(); else broadcast();
      break;
    case "draft":
      if (S.phase === "question" && !S.round.submitted && target()?.id === id) { H.draft = clean(m.text, 80); liveDraft(); sendPriv(); }
      break;
    case "submit":
      if (S.phase === "question" && !S.round.submitted && target()?.id === id) { S.round.answer = clean(m.text, 80); S.round.submitted = true; commit(); }
      break;
    case "secret":
      if (S.phase === "secret" && partner()?.id === id) { S.round.expected = clean(m.text, 80); S.round.secretIn = true; commit(); toast("Réponse secrète reçue"); }
      break;
    case "fx":
      if (S.cohost?.id === id) relayFx(m.kind);
      break;
    case "objection": {
      const R = S.round, p = S.players[id];
      if (S.phase !== "reveal" || !R || !p || p.duo == null || p.duo === R.duo) return;
      R.objections = R.objections || [];
      if (R.objections.some((o) => o.pid === id)) return;
      R.objections.push({ pid: id, name: p.name, duo: p.duo, answer: "", status: "pending" });
      commit(); break;
    }
    case "objText": {
      const o = S.round?.objections?.find((x) => x.pid === id && x.status === "pending");
      if (S.phase === "reveal" && o && !o.answer) { o.answer = clean(m.text, 80); commit(); }
      break;
    }
  }
}
function hostTick() {
  const R = S?.round;
  if (S?.phase === "intro" && Date.now() >= (S.introAt || 0) + INTRO_TOTAL + 400) HA.endIntro();
  if (S?.phase === "question" && R && !R.submitted && Date.now() >= R.endsAt + 700) { R.answer = H.draft || ""; R.submitted = true; R.timeUp = true; commit(); }
}
function liveDraft() { const el = $("#liveDraft"); if (el) el.textContent = (role === "co" ? CO.priv.draft : H.draft) || "…"; }

const HA = {
  duoCount(n) { S.duoCount = +n; for (const p of Object.values(S.players)) if (p.duo != null && p.duo >= S.duoCount) { p.duo = null; p.seat = null; } if (S.sel && S.sel.duo >= S.duoCount) S.sel = null; commit(); },
  assign(d, s, id) { const occ = playerAt(d, s); if (occ) { occ.duo = null; occ.seat = null; } if (id) sit(id, d, s); commit(); },
  kick(id) { const p = S.players[id]; if (p && confirm(`Retirer ${p.name} du plateau ?`)) { delete S.players[id]; commit(); } },
  uncohost() { if (S.cohost && confirm(`Retirer ${S.cohost.name} de la co-présentation ?`)) { S.cohost = null; commit(); } },
  editLook() { H.editLook = !H.editLook; render(); },
  start() { S.phase = "intro"; S.introAt = Date.now(); S.sel = null; S.round = null; resetForm(); commit(); },
  endIntro() { if (S.phase !== "intro") return; S.phase = "prep"; S.sel = null; commit(); },
  selDuo(d) { S.sel = { duo: +d, seat: S.sel?.seat ?? 0 }; refillQ(); commit(); },
  selSeat(s) { S.sel = { ...S.sel, seat: +s }; refillQ(); commit(); },
  cat(c) { H.form.cat = c; render(); },
  pickQ(i) { if (i === "") return; pickFrom(H.form.src, +i); render(); },
  rand() {
    const src = H.form.src;
    if (src === "form") { const n = H.data?.questions.length || 0; if (n) pickFrom("form", Math.floor(Math.random() * n)); }
    else if (src === "mine") { if (H.mine.length) pickFrom("mine", Math.floor(Math.random() * H.mine.length)); }
    else { const list = QUESTIONS.map((q, i) => [q, i]).filter(([q]) => H.form.cat === "Toutes" || q.c === H.form.cat); pickFrom("bank", list[Math.floor(Math.random() * list.length)][1]); }
    render();
  },
  src(v) { H.form.src = v; H.form.tpl = null; render(); },
  setCol(v) { H.form.col = v === "" ? null : +v; fromSheet(); render(); },
  setWho(v) { H.form.who = v; fromSheet(); render(); },
  saveQ() {
    const q = clean(H.form.q, 220); if (!q) return toast("Écris d'abord ta question.");
    if (!H.mine.includes(q)) { H.mine.unshift(q); LS.set("cac-myq", H.mine); }
    H.form.src = "mine"; H.form.tpl = H.mine.indexOf(q); toast("Question enregistrée dans « Mes questions »"); render();
  },
  delQ() {
    if (H.form.src !== "mine" || H.form.tpl == null) return;
    H.mine.splice(H.form.tpl, 1); LS.set("cac-myq", H.mine); H.form.tpl = null; render();
  },
  async sheetLoad() {
    const url = clean($("#sheetUrl")?.value, 500); if (!url) return toast("Colle le lien de ta feuille Google Sheets.");
    H.sheetBusy = true; H.sheetErr = ""; render();
    try { const rows = await fetchSheet(url); setSheet({ url, rows, nameCol: null }); toast(`Formulaire importé : ${H.data.people.length} joueurs, ${H.data.questions.length} questions`); }
    catch (e) { H.sheetErr = e.message + " Vérifie que la feuille est partagée « Tous les utilisateurs disposant du lien », ou importe le fichier CSV."; }
    H.sheetBusy = false; render();
  },
  sheetReload() { if (H.sheet?.url) { const i = $("#sheetUrl"); if (i) i.value = H.sheet.url; HA.sheetLoad(); } },
  sheetClear() { if (!confirm("Oublier les réponses du formulaire ?")) return; H.sheet = null; H.data = null; LS.set("cac-sheet", null); H.sheetV++; render(); },
  timer(t) { H.form.timer = Math.max(3, Math.min(300, +t || 20)); render(); },
  points(p) { H.form.points = +p; render(); },
  launch(secret) {
    if (!S.sel) return toast("Choisis d'abord le candidat à interroger.");
    const f = H.form, d = S.sel.duo, s = S.sel.seat;
    if (!f.q.trim()) return toast("Choisis ou écris une question d'abord.");
    if (!playerAt(d, s) || !playerAt(d, 1 - s)) return toast("Ce duo n'est pas complet sur le canapé.");
    H.asked = H.asked || {}; const aId = playerAt(d, s).id; H.asked[aId] = (H.asked[aId] || 0) + 1;
    S.round = { n: ++S.roundNo, duo: d, seat: s, objections: [], question: clean(f.q, 220), expected: clean(f.expected, 80), timer: f.timer, points: f.points, answer: null, submitted: false, verdict: null, endsAt: null, secretIn: false };
    H.draft = "";
    if (secret) { S.phase = "secret"; commit(); } else HA.ask();
  },
  ask() { S.round.endsAt = Date.now() + S.round.timer * 1000; S.round.submitted = false; S.phase = "question"; H.draft = ""; commit(); },
  stop() { const R = S.round; if (R && !R.submitted) { R.answer = H.draft || ""; R.submitted = true; R.timeUp = true; commit(); } },
  reveal() { S.phase = "reveal"; commit(); },
  verdict(v) { const R = S.round; R.verdict = v; if (v !== "bad") S.scores[R.duo] = (S.scores[R.duo] || 0) + R.points; S.phase = "verdict"; commit(); },
  objAccept(i) {
    const R = S.round, o = R?.objections?.[+i]; if (!o) return;
    for (const x of R.objections) if (x.status === "pending") x.status = "rejected";
    o.status = "accepted"; R.verdict = "steal"; R.stealDuo = o.duo; R.stealBy = o.name; R.stealPid = o.pid; R.stealAnswer = o.answer;
    S.scores[o.duo] = (S.scores[o.duo] || 0) + R.points; S.phase = "verdict"; commit();
  },
  objReject(i) { const o = S.round?.objections?.[+i]; if (!o) return; o.status = "rejected"; o.rejAt = Date.now(); commit(); },
  manche(m) { S.manche = +m; H.form.points = Math.min(3, +m); commit(); },
  pickP(d, s) { S.sel = { duo: +d, seat: +s }; refillQ(); commit(); },
  cancel() { S.round = null; S.phase = "prep"; commit(); },
  // « d-s » = candidat déjà choisi pour la question suivante ; vide = le présentateur choisira
  next(v) { const m = /^(\d+)-([01])$/.exec(v || ""); S.sel = m && playerAt(+m[1], +m[2]) ? { duo: +m[1], seat: +m[2] } : null; S.round = null; S.phase = "prep"; resetForm(); refillQ(); commit(); },
  final() { S.phase = "final"; commit(); },
  replay() { S.scores = zeros(); S.round = null; S.sel = null; H.asked = {}; S.phase = "prep"; resetForm(); commit(); },
  lobby() { S.round = null; S.phase = "lobby"; commit(); },
  score(d, delta) { S.scores[+d] = Math.max(0, (S.scores[+d] || 0) + +delta); commit(); },
  say(text) { const t = clean(text ?? H.say, 120); if (!t) return; sendReact(t); if (text == null) { H.say = ""; const i = $("#sayIn"); if (i) i.value = ""; } },
  fx(kind) { relayFx(kind); },
  copy() { navigator.clipboard?.writeText(shareLink()).then(() => toast("Lien copié")); },
};
function relayFx(kind) { if (!["applause", "ooh", "laugh", "drum"].includes(kind)) return; net?.send({ t: "fx", kind, from: "host" }); playFx(kind); }
function resetForm() { Object.assign(H.form, { tpl: null, q: "", expected: "", col: null, who: "" }); H.qv++; }
function refillQ() {
  if (H.form.src === "bank" && H.form.tpl != null) { H.form.q = fill(QUESTIONS[H.form.tpl].q, nm(S.sel && playerAt(S.sel.duo, 1 - S.sel.seat), "ton partenaire")); H.qv++; }
  guessWho(); fromSheet();
}
function pickFrom(src, i) {
  H.form.src = src; H.form.tpl = i;
  if (src === "form") { const q = H.data.questions[i]; H.form.q = q.text; H.form.col = q.col; }
  else if (src === "mine") H.form.q = H.mine[i];
  refillQ(); H.qv++;
}
// Devine quel prénom du formulaire correspond au partenaire assis sur le canapé
function guessWho() {
  if (!H.data) return;
  const B = S.sel && playerAt(S.sel.duo, 1 - S.sel.seat); if (!B) return;
  const k = H.data.people.findIndex((p) => norm(p.name) === norm(B.name));
  const k2 = k >= 0 ? k : H.data.people.findIndex((p) => norm(p.name).startsWith(norm(B.name)) || norm(B.name).startsWith(norm(p.name)));
  if (k2 >= 0) H.form.who = String(k2);
}
function fromSheet() {
  if (!H.data || H.form.col == null || H.form.who === "") return;
  const p = H.data.people[+H.form.who]; if (!p) return;
  H.form.expected = p.row[H.form.col] || ""; H.qv++;
}
function setSheet(sh) {
  H.sheet = sh; H.data = analyze(sh.rows, sh.nameCol); LS.set("cac-sheet", sh); H.sheetV++;
  if (H.data?.questions.length) H.form.src = "form";
  guessWho();
}
const shareLink = () => location.origin + location.pathname + "?r=" + S.code;

// ───────────────────────── CANDIDAT / CO / TV ─────────────────────────
async function startPlayer(code) {
  SS.set("cac-session", { role: "player", code });
  await enter("player", code);
  const tryJoin = () => { if (!net) return; if (S?.players[pid]) { joined = everJoined = true; return; } if (!joined) sendJoin(); };
  tryJoin(); setInterval(tryJoin, 1500);
  setTimeout(() => { if (!S) toast("Aucun présentateur trouvé pour ce code, on attend encore…", 5000); }, 7000);
  render();
}
const sendJoin = () => net?.send({ t: "join", pid, name: myName, look: myLook });
async function startCo(code) {
  SS.set("cac-session", { role: "co", code });
  await enter("co", code);
  const tryJoin = () => { if (!net) return; if (S?.cohost?.id === pid) { joined = everJoined = true; return; } if (!joined && !CO.full) net.send({ t: "cojoin", pid, name: myName, look: myLook }); };
  tryJoin(); setInterval(tryJoin, 1500);
  render();
}
async function startTV(code) {
  await enter("tv", code);
  const gate = $("#soundGate"); gate.classList.remove("hidden");
  gate.onclick = () => { unlock(); gate.classList.add("hidden"); document.documentElement.requestFullscreen?.().catch(() => {}); };
  const hello = setInterval(() => { if (S) clearInterval(hello); else net?.send({ t: "hello", pid }); }, 1500);
  net?.send({ t: "hello", pid });
}
const send = (m) => net?.send({ pid, ...m });

let lastReact = 0;
function sendReact(text) {
  if (Date.now() - lastReact < 700) return; lastReact = Date.now();
  const who = role === "host" ? "host" : role === "co" ? "cohost" : pid;
  net?.send({ t: "react", who, text });
  showReact(who, text);
}
function showReact(who, text) { stage?.bubble(who, clean(text, 120)); sfx.pop(); }
function playFx(kind) { sfx[kind]?.(); if (kind !== "drum") stage?.crowd(kind); }

function onMsg(m) {
  if (!m || typeof m !== "object") return;
  if (m.t === "react") return showReact(m.who, m.text);
  if (m.t === "fx" && m.from === "host") return playFx(m.kind);
  if (role === "host") return hostHandle(m);
  if (m.t === "priv" && m.to === pid) { CO.priv = m; liveDraft(); panelKey = ""; return renderPanel(); }
  if (m.t === "cofull" && m.to === pid) { CO.full = true; panelKey = ""; return renderPanel(); }
  if (m.t === "state" && m.s) {
    offset = m.now - Date.now();
    S = m.s;
    const present = role === "player" ? !!S.players[pid] : role === "co" ? S.cohost?.id === pid : true;
    if (present) joined = everJoined = true;
    else if (everJoined && joined) { joined = false; toast("Tu as été retiré du plateau."); }
    render();
  }
}

// ───────────────────────── rendu + effets ─────────────────────────
function render() {
  const prev = lastS;
  if (S) {
    lastS = clone(S);
    effects(prev, S);
    stage.update(S, { me: role === "player" ? pid : null, showCode: role === "tv" || S.phase === "lobby" });
  }
  renderPanel();
}
function effects(prev, S) {
  if (!prev) return;
  const R = S.round, pR = prev.round;
  if (Object.keys(S.players).length > Object.keys(prev.players).length) sfx.join();
  if (S.phase === "prep" && S.sel && JSON.stringify(S.sel) !== JSON.stringify(prev.phase === "prep" ? prev.sel : null)) {
    const a = playerAt(S.sel.duo, S.sel.seat);
    if (a) { sfx.pick(); stage.bubble("host", `${a.name}, c'est à toi !`, 2600); }
  }
  if (S.phase !== prev.phase) {
    if (prev.phase === "intro") playFx("applause");
    if (S.phase === "question" && R) { sfx.start(); setTimeout(() => stage.bubble("host", R.question, 6500), 350); }
    if (S.phase === "secret") stage.bubble("host", "Chut… on note la réponse en secret !", 3500);
    if (S.phase === "reveal") sfx.reveal();
    if (S.phase === "verdict" && R) {
      const v = R.verdict;
      if (v === "steal") {
        sfx.objection(); stage.stamp("steal"); stage.burst("good", stage.duoX(R.stealDuo), 48); stage.popHeart(R.stealDuo); setTimeout(() => playFx("ooh"), 200); setTimeout(() => playFx("applause"), 1100);
      } else {
        (v === "good" ? sfx.good : v === "just" ? sfx.just : sfx.bad)();
        stage.stamp(v);
        stage.burst(v, stage.duoX(R.duo), v === "bad" ? 14 : 44);
        if (v !== "bad") { stage.popHeart(R.duo); setTimeout(() => playFx("applause"), 500); } else setTimeout(() => playFx("ooh"), 300);
      }
    }
    if (S.phase === "final") { sfx.final(); stage.burst("final", 960, 80); setTimeout(() => playFx("applause"), 400); }
  }
  if (R && pR && R.n === pR.n && R.submitted && !pR.submitted) (R.timeUp ? sfx.timeup : sfx.pop)();
  if (R && pR && R.n === pR.n) {
    const now = R.objections || [], before = pR.objections || [];
    if (now.length > before.length) { const o = now[now.length - 1]; sfx.objection(); stage.objection(o.name, o.pid); }
    now.forEach((o, i) => {
      const b = before[i];
      if (o.answer && b && !b.answer) stage.bubble(o.pid, o.answer, 6000);
      if (o.status === "rejected" && b && b.status === "pending" && S.phase === "reveal") { sfx.bad(); stage.stamp("objno"); }
    });
  }
}

let introIdx = -1;
function introSound(i) {
  if (i < 0) return;
  if (i === 0) sfx.start(); else sfx.whoosh();
  const later = (ms, f) => setTimeout(() => S?.phase === "intro" && introIdx === i && f(), ms);
  if (i === 1) later(900, () => playFx("applause"));
  if (i === 5) [800, 1700, 2600].forEach((t, k) => later(t, () => (sfx.stamp(), k === 2 ? sfx.bad() : sfx.good())));
  if (i === 6) later(700, () => sfx.objection());
  if (i === 8) { [800, 1600, 2400].forEach((t) => later(t, () => sfx.count())); later(3100, () => sfx.final()); }
}
function loop() {
  requestAnimationFrame(loop);
  if (!S || !stage) return;
  const R = S.round;
  let rem = null, total = 1;
  if (S.phase === "question" && R && !R.submitted && R.endsAt) { rem = (R.endsAt - offset - Date.now()) / 1000; total = R.timer; }
  if (stage.setTimer(rem, total)) sfx.tick();
  if (S.phase === "intro") {
    const i = stage.intro(Date.now() + offset - (S.introAt || 0));
    if (i !== introIdx) { introIdx = i; introSound(i); }
  } else introIdx = -1;
  // on ne touche au texte que s'il change (sinon le téléphone redessine 60 fois par seconde)
  const tTxt = rem == null ? "" : Math.max(0, Math.ceil(rem)) + " s", tHurry = rem != null && rem <= 5;
  document.querySelectorAll("[data-timer]").forEach((e) => { if (e.textContent !== tTxt) e.textContent = tTxt; if (e.classList.contains("hurry") !== tHurry) e.classList.toggle("hurry", tHurry); });
  if (role === "player" && rem != null && rem <= 0 && target()?.id === pid && mySubmitN !== R.n) {
    mySubmitN = R.n; send({ t: "submit", text: myDraft }); panelKey = ""; renderPanel();
  }
}

// ───────────────────────── panneaux ─────────────────────────
function bindPanel() {
  const panel = $("#panel");
  panel.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b || b.disabled) return;
    const a = b.dataset.act, d = b.dataset;
    unlock();
    if (a === "edTab") { edTab = d.v; panelKey = ""; return render(); }
    if (a === "look" || a === "lookRand") return onLook(d);
    if (a === "react") return sendReact(d.v);
    if (role === "host") {
      const map = { objAccept: () => HA.objAccept(d.v), objReject: () => HA.objReject(d.v), manche: () => HA.manche(d.v), pickP: () => HA.pickP(d.d, d.s), src: () => HA.src(d.v), launch: () => HA.launch(d.v === "1"), say: () => HA.say(d.v), score: () => HA.score(d.d, d.v), timer: () => HA.timer(d.v), points: () => HA.points(d.v),
        next: () => HA.next(d.v), verdict: () => HA.verdict(d.v), duoCount: () => HA.duoCount(d.v), selDuo: () => HA.selDuo(d.v), selSeat: () => HA.selSeat(d.v), kick: () => HA.kick(d.v), fx: () => HA.fx(d.v) };
      return map[a] ? map[a]() : HA[a]?.();
    }
    if (role === "co") return COA[a]?.(d);
    PA[a]?.(d);
  });
  panel.addEventListener("input", (e) => {
    const i = e.target.dataset.in; if (!i) return;
    if (i === "q") { H.form.q = e.target.value; H.form.tpl = null; }
    if (i === "exp") H.form.expected = e.target.value;
    if (i === "say") (role === "co" ? CO : H).say = e.target.value;
    if (i === "slate") { myDraft = e.target.value.slice(0, 80); queueDraft(); }
    if (i === "msg") myMsg = e.target.value;
  });
  panel.addEventListener("change", (e) => {
    const t = e.target, i = t.dataset.in;
    if (i === "cat") HA.cat(t.value);
    if (i === "pickq") HA.pickQ(t.value);
    if (i === "col") HA.setCol(t.value);
    if (i === "who") HA.setWho(t.value);
    if (i === "nameCol") { setSheet({ ...H.sheet, nameCol: +t.value }); render(); }
    if (i === "sheetFile" && t.files?.[0]) { t.files[0].text().then((txt) => { setSheet({ url: "", rows: parseCSV(txt), nameCol: null }); toast(`Fichier importé : ${H.data.people.length} joueurs, ${H.data.questions.length} questions`); render(); }); }
    if (i === "tcustom") HA.timer(t.value);
    if (i === "assign") HA.assign(+t.dataset.d, +t.dataset.s, t.value);
  });
  panel.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const i = e.target.dataset.in;
    if (i === "say") { e.preventDefault(); role === "co" ? COA.say({}) : HA.say(); }
    if (i === "sheetUrl") { e.preventDefault(); HA.sheetLoad(); }
    if (i === "slate" && !e.shiftKey) { e.preventDefault(); PA.submit(); }
    if (i === "secretIn") { e.preventDefault(); PA.secret(); }
    if (i === "msg") { e.preventDefault(); PA.sendMsg(); }
    if (i === "objIn") { e.preventDefault(); PA.objText(); }
  });
}
function onLook(d) {
  if (role === "host") { S.hostLook = applyLookAct(S.hostLook, d); myLook = S.hostLook; saveMe(); commit(); return; }
  myLook = applyLookAct(myLook, d); saveMe(); panelKey = ""; renderPanel();
  clearTimeout(lookTimer);
  lookTimer = setTimeout(() => role === "co" ? net?.send({ t: "cojoin", pid, name: myName, look: myLook }) : sendJoin(), 150);
}
function queueDraft() {
  clearTimeout(draftTimer);
  const go = () => { lastDraftSent = Date.now(); send({ t: "draft", text: myDraft }); };
  if (Date.now() - lastDraftSent > 350) go(); else draftTimer = setTimeout(go, 350);
}
const PA = {
  sendMsg() { const t = clean(myMsg, 70); if (!t) return; sendReact(t); myMsg = ""; const i = $("#msgIn"); if (i) i.value = ""; },
  objection() { const R = S?.round; if (!R || myObjN === R.n) return; myObjN = R.n; send({ t: "objection" }); panelKey = ""; renderPanel(); },
  objText() { const R = S?.round; const v = clean($("#objIn")?.value, 80); if (!R || !v) return; myObjSentN = R.n; send({ t: "objText", text: v }); panelKey = ""; renderPanel(); },
  sit(d) { send({ t: "sit", duo: +d.d, seat: +d.s }); },
  stand() { send({ t: "sit", duo: null, seat: null }); },
  edit() { editing = !editing; panelKey = ""; renderPanel(); },
  submit() { const R = S?.round; if (!R || mySubmitN === R.n) return; mySubmitN = R.n; send({ t: "submit", text: myDraft }); panelKey = ""; renderPanel(); },
  secret() { const v = clean($("#secretIn")?.value, 80); if (!v) return; mySecretN = S.round.n; send({ t: "secret", text: v }); panelKey = ""; renderPanel(); },
  rejoin() { joined = false; everJoined = false; sendJoin(); },
};
const COA = {
  say(d) { const t = clean(d.v ?? CO.say, 120); if (!t) return; sendReact(t); if (d.v == null) { CO.say = ""; const i = $("#sayIn"); if (i) i.value = ""; } },
  fx(d) { net?.send({ t: "fx", kind: d.v, pid }); },
  edit() { editing = !editing; panelKey = ""; renderPanel(); },
  rejoin() { joined = false; everJoined = false; CO.full = false; net?.send({ t: "cojoin", pid, name: myName, look: myLook }); },
};

function renderPanel() {
  const v = role === "host" ? hostView() : role === "player" ? playerView() : role === "co" ? coView() : null;
  if (!v || v.key === panelKey) return;
  panelKey = v.key;
  const panel = $("#panel"), st = panel.scrollTop;
  panel.innerHTML = v.html;
  panel.scrollTop = st;
  v.after?.();
}

// ── blocs communs ──
const chip = (act, val, label, on) => `<button class="chip ${on ? "on" : ""}" data-act="${act}" data-v="${esc(val)}" aria-pressed="${!!on}">${label}</button>`;
function sayBox(st) {
  const quick = ["Applaudissez !", "Attention…", "Ohhh !", "Vous êtes sûrs ?", "Bravo !", "Silence sur le plateau !"];
  return `<section class="box"><h3>${icon("mic")}Parler au plateau</h3>
    <div class="row"><input id="sayIn" class="grow" data-in="say" maxlength="120" placeholder="Une phrase dans ta bulle…" value="${esc(st.say)}"/><button class="btn small primary" data-act="say">Dire</button></div>
    <div class="chips">${quick.map((q) => chip("say", q, esc(q))).join("")}</div></section>`;
}
function ambianceBox() {
  const fx = [["applause", "clap", "Applaudissements"], ["ooh", "wow", "Ohhh !"], ["laugh", "laugh", "Rires"], ["drum", "drum", "Roulement"]];
  return `<section class="box"><h3>${icon("users")}Ambiance du public</h3><div class="fx-grid">${fx.map(([k, ic, l]) => `<button class="fx-btn" data-act="fx" data-v="${k}">${icon(ic)}<span>${l}</span></button>`).join("")}</div></section>`;
}
function scoresBox() {
  return `<section class="box"><h3>${icon("heart")}Scores</h3>${[...Array(S.duoCount).keys()].map((d) =>
    `<div class="score-adj"><span>Duo ${d + 1} · ${esc(nm(playerAt(d, 0), "—"))} & ${esc(nm(playerAt(d, 1), "—"))}</span>
      <button class="btn small" data-act="score" data-d="${d}" data-v="-1" aria-label="Retirer un point">−</button><b>${S.scores[d] || 0}</b><button class="btn small" data-act="score" data-d="${d}" data-v="1" aria-label="Ajouter un point">+</button></div>`).join("")}
    <div class="row"><button class="btn small ghost" data-act="lobby">${btnIc("sofa", "Retour au salon")}</button><button class="btn small ghost" data-act="final">${btnIc("trophy", "Fin de l'émission")}</button></div></section>`;
}
// Après un verdict : interroger le binôme, passer au duo suivant ou choisir librement
function nextBox(R) {
  const asked = H.asked || {}, A = playerAt(R.duo, R.seat), B = playerAt(R.duo, 1 - R.seat);
  const n = S.duoCount, full = (d) => playerAt(d, 0) && playerAt(d, 1);
  let nd = -1; for (let i = 1; i <= n; i++) { const d = (R.duo + i) % n; if (d !== R.duo && full(d)) { nd = d; break; } }
  const ns = nd < 0 ? 0 : (asked[playerAt(nd, 1)?.id] || 0) < (asked[playerAt(nd, 0)?.id] || 0) ? 1 : 0;
  const opts = [];
  if (B) opts.push({ v: `${R.duo}-${1 - R.seat}`, label: `Interroger ${esc(B.name)}`, sub: `son binôme, sur ${esc(nm(A))}`, n: asked[B.id] || 0 });
  if (nd >= 0) opts.push({ v: `${nd}-${ns}`, label: `Duo ${nd + 1} : ${esc(playerAt(nd, ns).name)}`, sub: "duo suivant", n: asked[playerAt(nd, ns).id] || 0 });
  // le moins interrogé en premier
  opts.sort((a, b) => a.n - b.n);
  return `<section class="box"><h3>${icon("users")}Qui interroger ensuite ?</h3><div class="next-opts">${opts.map((o, i) =>
    `<button class="btn ${i ? "" : "primary"} big next-opt" data-act="next" data-v="${o.v}"><span class="no-l">${icon("next")}${o.label}</span><small>${o.sub}${o.n ? ` · déjà ${o.n}×` : ""}</small></button>`).join("")}
    <button class="btn ghost" data-act="next" data-v="">${btnIc("users", "Choisir un autre candidat")}</button></div></section>`;
}
function fiche(head, body) { return `<div class="fiche"><div class="f-h">${head}</div><span class="f-timer" data-timer></span>${body}</div>`; }

// ── formulaire Google ──
function sheetBox(compact) {
  const D = H.data;
  const status = D ? `<p class="mut ok-t">${icon("check")} ${D.people.length} joueur${D.people.length > 1 ? "s" : ""} et ${D.questions.length} question${D.questions.length > 1 ? "s" : ""} importés${H.sheet?.url ? "" : " (fichier)"}.</p>` : "";
  if (compact && D) return `<div class="row sheet-mini">${status}${H.sheet?.url ? `<button class="btn small ghost" data-act="sheetReload" ${H.sheetBusy ? "disabled" : ""}>${btnIc("refresh", H.sheetBusy ? "Lecture…" : "Recharger les réponses")}</button>` : ""}</div>`;
  const inner = `    <p class="mut">Les joueurs répondent à ton Google Form (avec une question « Ton prénom »). Colle ici le lien de la <b>feuille de réponses</b> Google Sheets, partagée « Tous les utilisateurs disposant du lien ».</p>
    <div class="row"><input id="sheetUrl" class="grow" data-in="sheetUrl" placeholder="https://docs.google.com/spreadsheets/d/…" value="${esc(H.sheet?.url || "")}" aria-label="Lien de la feuille Google Sheets"/>
      <button class="btn small primary" data-act="sheetLoad" ${H.sheetBusy ? "disabled" : ""}>${H.sheetBusy ? "Lecture…" : "Importer"}</button></div>
    <label class="file-l">ou un fichier CSV (Fichier › Télécharger › CSV)<input type="file" accept=".csv,text/csv" data-in="sheetFile"/></label>
    ${H.sheetErr ? `<p class="err">${esc(H.sheetErr)}</p>` : ""}
    ${status}
    ${D ? `<label>Colonne des prénoms<select data-in="nameCol">${D.headers.map((h, i) => `<option value="${i}" ${i === D.nameCol ? "selected" : ""}>${esc(h)}</option>`).join("")}</select></label>
      <div class="row">${H.sheet?.url ? `<button class="btn small ghost" data-act="sheetReload">${btnIc("refresh", "Recharger les réponses")}</button>` : ""}<button class="btn small ghost" data-act="sheetClear">${btnIc("x", "Oublier")}</button></div>` : ""}`;
  return compact === "inner" ? inner : `<section class="box"><h3>${icon("card")}Questions du formulaire</h3>${inner}</section>`;
}

function objBox(R) {
  const list = (R.objections || []);
  if (!list.length) return `<p class="mut center">Les candidats des autres duos peuvent crier « Objection ! » s'ils pensent avoir la bonne réponse.</p>`;
  return `<section class="box obj-box"><h3 class="obj-h">Objections</h3>${list.map((o, i) => `<div class="obj-item ${o.status}">
      <div><b>${esc(o.name)}</b> <span class="mut">Duo ${o.duo + 1}</span><div class="obj-a">${o.answer ? "« " + esc(o.answer) + " »" : `<span class="mut">écrit sa réponse…</span>`}</div></div>
      ${o.status === "pending" ? `<div class="obj-act"><button class="btn small ok" data-act="objAccept" data-v="${i}">Le point pour Duo ${o.duo + 1}</button><button class="btn small ghost" data-act="objReject" data-v="${i}">Rejeter</button></div>`
        : `<span class="obj-st">${o.status === "accepted" ? "Retenue" : "Rejetée"}</span>`}
    </div>`).join("")}</section>`;
}

// ── vue présentateur ──
function hostView() {
  const R = S.round, P = Object.values(S.players);
  const seatsSig = P.map((p) => `${p.id}:${p.name}:${p.duo}:${p.seat}`).join(",");
  const key = JSON.stringify([S.phase, S.duoCount, seatsSig, S.sel, S.scores, R?.n, R?.submitted, R?.secretIn, R?.verdict, H.form.tpl, H.form.cat, H.form.timer, H.form.points, H.qv, S.cohost, H.editLook, H.editLook && S.hostLook, edTab, H.form.src, H.form.col, H.form.who, H.sheetV, H.sheetBusy, H.sheetErr, H.mine.length, JSON.stringify(R?.objections || []), S.manche]);
  let html = "";
  const tName = nm(target()), pName = nm(partner());

  if (S.phase === "lobby") {
    const full = [...Array(S.duoCount).keys()].some((d) => playerAt(d, 0) && playerAt(d, 1));
    html += `<section class="box"><h3>${icon("link")}Invite tes candidats <small>${P.length} connecté${P.length > 1 ? "s" : ""}</small></h3>
      <div class="bigcode">${S.code}</div>
      <div class="share"><input readonly value="${esc(shareLink())}" aria-label="Lien d'invitation"/><button class="btn small" data-act="copy">${btnIc("copy", "Copier")}</button></div>
      ${isOnline() ? `<p class="mut">Envoie ce lien ou le code à chaque duo. Sur la télé, ouvre « Écran plateau ».</p>` : `<p class="mut warn">Mode local : les candidats doivent ouvrir ce lien dans <b>ce même navigateur</b>. Configure Supabase (voir README) pour jouer chacun sur son téléphone.</p>`}</section>
      ${sheetBox(false)}
      <section class="box"><h3>${icon("mic")}Co-présentateur</h3>
      ${S.cohost ? `<div class="pitem"><span class="mini-av">${avatarSVG(S.cohost.look, { pose: "sit" })}</span><b>${esc(S.cohost.name)}</b><span class="mut">à tes côtés</span><button class="btn small ghost" style="margin-left:auto" data-act="uncohost">Retirer</button></div>`
        : `<p class="mut">Un ami peut co-animer avec toi : sur l'accueil, il tape le code <b>${S.code}</b> et choisit « Co-animer ». Il apparaît à droite du plateau, peut parler, lancer l'ambiance et voit ta fiche.</p>`}</section>
      <section class="box"><h3>${icon("sparkle")}Ton personnage <button class="btn small ghost" style="margin-left:auto" data-act="editLook">${H.editLook ? "Fermer" : "Modifier"}</button></h3>
      ${H.editLook ? editorHTML(S.hostLook, { preview: false }) : `<p class="mut">Tu es debout au pupitre, à gauche du plateau.</p>`}</section>
      <section class="box"><h3>${icon("sofa")}Canapés</h3><div class="chips">${[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => chip("duoCount", n, String(n), S.duoCount === n)).join("")}<span class="mut">duos</span></div>
      <div class="seats">${[...Array(S.duoCount).keys()].map((d) => `<div class="seat-duo"><b>Duo ${d + 1}</b>${[0, 1].map((s) => {
        const cur = playerAt(d, s);
        return `<select data-in="assign" data-d="${d}" data-s="${s}" aria-label="Duo ${d + 1}, place ${s + 1}"><option value="">Place libre</option>${P.map((p) => `<option value="${p.id}" ${cur?.id === p.id ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select>`;
      }).join("")}</div>`).join("")}</div>
      <p class="mut">Les candidats choisissent leur place eux-mêmes ; tu peux aussi les placer ici.</p></section>
      <section class="box"><h3>${icon("users")}Candidats</h3><div class="plist">${P.length ? P.map((p) => `<div class="pitem"><span class="mini-av">${avatarSVG(p.look, { pose: "sit" })}</span>${esc(p.name)} <span class="mut">${p.duo != null ? `Duo ${p.duo + 1}` : "debout"}</span><button class="x" data-act="kick" data-v="${p.id}" aria-label="Retirer ${esc(p.name)}">${icon("x")}</button></div>`).join("") : `<p class="mut">Personne pour l'instant. Partage le lien ci-dessus.</p>`}</div></section>
      <button class="btn primary big" data-act="start" ${full ? "" : "disabled"}>${btnIc("play", full ? "Lancer l'émission" : P.length ? "En attente d'un duo complet" : "En attente des candidats")}</button>
      ${full ? "" : `<p class="start-why">${P.length
        ? `<b>${P.length} connecté${P.length > 1 ? "s" : ""}, ${P.filter((p) => p.duo != null).length} assis.</b> Il faut 2 candidats assis sur le <b>même canapé</b> pour lancer.`
        : `<b>Personne n'a encore rejoint.</b> Envoie le lien ou le code ${esc(S.code)} à tes potes : il faut au moins 2 candidats assis sur le même canapé pour lancer.`}</p>`}`;
  } else if (S.phase === "intro") {
    html += `<section class="box"><h3>${icon("play")}Générique en cours</h3><p class="mut">La vidéo des règles passe sur le plateau et sur les téléphones. Ensuite, tu choisis le premier candidat à interroger.</p></section>
      <button class="btn primary big" data-act="endIntro">${btnIc("next", "Passer les règles")}</button>`;
  } else if (S.phase === "prep") {
    const d = S.sel?.duo ?? -1, s = S.sel?.seat ?? 0;
    const A = playerAt(d, s), B = playerAt(d, 1 - s);
    const list = QUESTIONS.map((q, i) => [q, i]).filter(([q]) => H.form.cat === "Toutes" || q.c === H.form.cat);
    const D = H.data, src = H.form.src;
    const srcTabs = `<div class="src-tabs" role="tablist">${[["form", "Formulaire", D?.questions.length || 0], ["mine", "Mes questions", H.mine.length], ["bank", "Banque", QUESTIONS.length]].map(([k, l, n]) =>
      `<button role="tab" class="src-tab ${src === k ? "on" : ""}" aria-selected="${src === k}" data-act="src" data-v="${k}">${l}<small>${n}</small></button>`).join("")}</div>`;
    let srcBody = "";
    if (src === "form") srcBody = D?.questions.length
      ? `<div class="row"><select class="grow" data-in="pickq" aria-label="Questions du formulaire"><option value="">Choisir une question du formulaire</option>${D.questions.map((q, i) => `<option value="${i}" ${i === H.form.tpl ? "selected" : ""}>${esc(q.text)}</option>`).join("")}</select><button class="btn small gold" data-act="rand">${btnIc("dice", "Hasard")}</button></div>${sheetBox(true)}`
      : sheetBox("inner");
    else if (src === "mine") srcBody = H.mine.length
      ? `<div class="row"><select class="grow" data-in="pickq" aria-label="Mes questions"><option value="">Choisir une de mes questions</option>${H.mine.map((q, i) => `<option value="${i}" ${i === H.form.tpl ? "selected" : ""}>${esc(q)}</option>`).join("")}</select>${H.form.tpl != null ? `<button class="btn small ghost" data-act="delQ" aria-label="Supprimer cette question">${icon("x")}</button>` : ""}<button class="btn small gold" data-act="rand">${btnIc("dice", "Hasard")}</button></div>`
      : `<p class="mut">Écris une question ci-dessous puis « Enregistrer » : elle restera dans ta liste pour les prochaines émissions.</p>`;
    else srcBody = `<div class="row"><select class="grow" data-in="cat" aria-label="Catégorie">${["Toutes", ...CATEGORIES].map((c) => `<option ${c === H.form.cat ? "selected" : ""}>${c}</option>`).join("")}</select><button class="btn small gold" data-act="rand">${btnIc("dice", "Hasard")}</button></div>
        <select data-in="pickq" aria-label="Banque de questions"><option value="">Choisir dans la banque (${list.length})</option>${list.map(([q, i]) => `<option value="${i}" ${i === H.form.tpl ? "selected" : ""}>${esc(fill(q.q, nm(B, "…")))}</option>`).join("")}</select>`;
    const whoBox = D ? `<div class="who-grid">
        <label>Question du formulaire<select data-in="col"><option value="">Aucune</option>${D.questions.map((q) => `<option value="${q.col}" ${q.col === H.form.col ? "selected" : ""}>${esc(q.text)}</option>`).join("")}</select></label>
        <label>Réponse de<select data-in="who"><option value="">Choisir le joueur</option>${D.people.map((p, i) => `<option value="${i}" ${String(i) === H.form.who ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></label></div>` : "";
    const asked = (H.asked || {});
    html += `<section class="box"><h3>${icon("users")}Qui interroger ?</h3>
      <p class="mut">${S.sel ? "Choisis n'importe quel candidat, dans l'ordre que tu veux. Il répondra sur son partenaire." : "<b>Clique sur le candidat à interroger.</b> Il répondra sur son partenaire. Tu peux interroger les deux membres d'un duo, dans l'ordre que tu veux."}</p>
      <div class="pick-grid">${[...Array(S.duoCount).keys()].map((i) => `<div class="pick-duo ${i === d ? "on" : ""}"><span class="pd-h">Duo ${i + 1}<b>${S.scores[i] || 0} pts</b></span>${[0, 1].map((k) => {
        const p = playerAt(i, k); if (!p) return `<span class="pick-p empty">place libre</span>`;
        const n = asked[p.id] || 0;
        return `<button class="pick-p ${i === d && k === s ? "on" : ""}" data-act="pickP" data-d="${i}" data-s="${k}"><span class="mini-av">${avatarSVG(p.look, { pose: "sit" })}</span><span>${esc(p.name)}</span>${n ? `<small>${n}×</small>` : ""}</button>`;
      }).join("")}</div>`).join("")}</div>
      ${A && B ? `<p class="mut">Question à <b>${esc(A.name)}</b> sur <b>${esc(B.name)}</b>.</p>` : ""}</section>
      <section class="box"><h3>${icon("trophy")}Manche</h3><div class="chips">${[[1, "Manche 1 · 1 pt"], [2, "Manche 2 · 2 pts"], [3, "Finale · 3 pts"]].map(([m, l]) => chip("manche", m, l, (S.manche || 1) === m)).join("")}</div></section>`;
    html += `
      <section class="box"><h3>La question</h3>${srcTabs}${srcBody}
        <textarea data-in="q" rows="3" maxlength="220" placeholder="Ou écris ta propre question">${esc(H.form.q)}</textarea>
        <div class="row"><button class="btn small ghost" data-act="saveQ">${btnIc("pen", "Enregistrer dans mes questions")}</button><span class="mut">Tu peux modifier le texte librement avant de la poser.</span></div></section>
      <section class="box"><h3>La réponse sur ta fiche</h3>${whoBox}
        <input data-in="exp" maxlength="80" placeholder="Réponse de ${esc(nm(B, "son partenaire"))} (facultatif)" value="${esc(H.form.expected)}"/>
        <p class="mut">${D ? "Choisis la question du formulaire et le prénom du joueur : sa réponse s'écrit ici, tu peux la retoucher." : "Écris-la si tu la connais."} Tu peux aussi la faire écrire en secret par ${esc(nm(B, "le partenaire"))} sur son téléphone.</p></section>
      <section class="box"><h3>${icon("timer")}Chrono et points</h3>
        <div class="chips">${TIMERS.map((t) => chip("timer", t, t + " s", H.form.timer === t)).join("")}
          <input data-in="tcustom" type="number" min="3" max="300" class="num" placeholder="autre" aria-label="Chrono personnalisé" value="${TIMERS.includes(H.form.timer) ? "" : H.form.timer}"/></div>
        <div class="chips">${[1, 2, 3].map((p) => chip("points", p, p + (p > 1 ? " points" : " point"), H.form.points === p)).join("")}</div></section>
      <button class="btn primary big" data-act="launch" data-v="0" ${A && B ? "" : "disabled"}>${btnIc("play", A ? `Poser la question à ${esc(A.name)}` : "Choisis d'abord un candidat")}</button>
      <button class="btn" data-act="launch" data-v="1" ${A && B ? "" : "disabled"}>${btnIc("lock", `D'abord la réponse secrète de ${esc(nm(B, "…"))}`)}</button>`;
  } else if (S.phase === "secret") {
    html += fiche("Réponse secrète", `<div class="f-q">${esc(R.question)}</div>
        <div class="f-live">${R.secretIn ? `${esc(pName)} a répondu :` : `${esc(pName)} écrit sa réponse en secret…`}</div>
        ${R.secretIn ? `<div class="f-a">${esc(R.expected)}</div>` : ""}`) +
      `<button class="btn primary big" data-act="ask">${btnIc("play", `Poser la question à ${esc(tName)}`)}</button><button class="btn ghost" data-act="cancel">Annuler</button>`;
  } else if (S.phase === "question") {
    html += fiche(`Question pour ${esc(tName)}`, `<div class="f-q">${esc(R.question)}</div>
        <div class="f-live">Réponse sur ta fiche :</div><div class="f-a">${esc(R.expected || "aucune, à toi de juger")}</div>
        <div class="f-live">${icon("pen")} ${esc(tName)} écrit : <b id="liveDraft">${esc(R.submitted ? R.answer : H.draft || "…")}</b></div>`) +
      (R.submitted
        ? `<p class="big-msg">${R.timeUp ? "Temps écoulé ! " : ""}${esc(tName)} a posé son ardoise.</p><button class="btn gold big" data-act="reveal">${btnIc("flip", "Retourner l'ardoise")}</button>`
        : `<button class="btn ko" data-act="stop">${btnIc("stop", "Arrêter le chrono")}</button>`);
  } else if (S.phase === "reveal") {
    html += fiche("Verdict", `<div class="f-q">${esc(R.question)}</div>
        <div class="cmp"><div><small>Ardoise de ${esc(tName)}</small><b>${esc(R.answer || "(vide)")}</b></div><div><small>Ta fiche (${esc(pName)})</small><b>${esc(R.expected || "—")}</b></div></div>`) +
      `<div class="verdict-row"><button class="btn ok big" data-act="verdict" data-v="good">${btnIc("check", "Bonne réponse")}</button><button class="btn ko big" data-act="verdict" data-v="bad">${btnIc("x", "Mauvaise")}</button>
       <button class="btn gold" data-act="verdict" data-v="just">${btnIc("deal", `Justificatif accepté (+${R.points})`)}</button></div>` +
      objBox(R);
  } else if (S.phase === "verdict") {
    const lbl = { good: "Bonne réponse", bad: "Mauvaise réponse", just: "Justificatif accepté", steal: "Objection retenue" }[R.verdict];
    const sd = R.verdict === "steal" ? R.stealDuo : R.duo;
    html += `<section class="box"><h3>${icon(R.verdict === "bad" ? "x" : "check")}${lbl}</h3><p class="mut">${R.verdict === "steal" ? `${esc(R.stealBy)} vole le point : ` : ""}Duo ${sd + 1} : <b class="gold-t">${S.scores[sd]} pt${S.scores[sd] > 1 ? "s" : ""}</b></p></section>
` + nextBox(R)
    html += `<button class="btn gold" data-act="final">${btnIc("trophy", "Fin de l'émission")}</button>`;
  } else if (S.phase === "final") {
    html += `<section class="box"><h3>${icon("trophy")}Fin de l'émission</h3><p class="mut">Le classement est affiché sur le mur du plateau.</p></section>
      <button class="btn primary big" data-act="replay">${btnIc("refresh", "Nouvelle partie, scores à zéro")}</button><button class="btn" data-act="lobby">${btnIc("sofa", "Retour au salon")}</button>`;
  }
  html += sayBox(H) + ambianceBox();
  if (S.phase !== "lobby") html += scoresBox();
  return { key, html, after: liveDraft };
}

// ── vue co-présentateur ──
function coView() {
  if (CO.full) return { key: "cofull", html: `<p class="big-msg">Il y a déjà un co-présentateur dans cette émission.</p><button class="btn" data-act="rejoin">Réessayer</button>` };
  if (!S) return { key: "wait", html: `<p class="big-msg">${icon("wait", "ic-xl")}Connexion au plateau…<br><span class="mut">En attente du présentateur</span></p>` };
  if (S.cohost?.id !== pid) {
    if (everJoined) return { key: "cokicked", html: `<p class="big-msg">Le présentateur t'a retiré de la co-présentation.</p><button class="btn primary" data-act="rejoin">Revenir</button>` };
    return { key: "cojoining", html: `<p class="big-msg">${icon("wait", "ic-xl")}On t'installe à côté du présentateur…</p>` };
  }
  const R = S.round, P = CO.priv;
  const key = JSON.stringify([S.phase, R?.n, R?.submitted, R?.verdict, P.expected, P.answer, P.secretIn, editing, editing && myLook, S.scores, edTab]);
  let html = `<section class="box"><h3>${icon("mic")}Tu co-animes avec ${esc(S.hostName)} <button class="btn small ghost" style="margin-left:auto" data-act="edit">${editing ? "Fermer" : "Mon perso"}</button></h3>
    ${editing ? editorHTML(myLook, { preview: false }) : `<p class="mut">Tu es debout à droite du plateau. Le présentateur pose les questions et rend le verdict ; toi, tu mets l'ambiance.</p>`}</section>`;
  if (R && ["secret", "question", "reveal", "verdict"].includes(S.phase)) {
    html += fiche("Fiche du présentateur", `<div class="f-q">${esc(R.question)}</div>
      <div class="f-live">Réponse attendue :</div><div class="f-a">${esc(P.expected || "—")}</div>
      ${S.phase === "question" ? `<div class="f-live">${icon("pen")} ${esc(nm(target()))} écrit : <b id="liveDraft">${esc(P.draft || "…")}</b></div>` : ""}
      ${P.answer != null && S.phase !== "secret" ? `<div class="f-live">Ardoise : <b>${esc(P.answer || "(vide)")}</b></div>` : ""}`);
  } else html += `<p class="big-msg">${{ lobby: "Les candidats s'installent…", intro: "Le générique des règles passe à l'écran…", prep: "Le présentateur prépare sa question…", final: "Fin de l'émission !" }[S.phase] || ""}</p>`;
  html += sayBox(CO) + ambianceBox();
  return { key, html, after: liveDraft };
}

// ── vue candidat ──
function reactsBox() {
  const r = ["😍", "😂", "😱", "👏", "Hein ?!", "Menteur !", "Je t'aime", "Mais non !"];
  return `<section class="box"><h3>${icon("chat")}Réagir</h3>
    <div class="row"><input id="msgIn" class="grow" data-in="msg" maxlength="70" placeholder="Ton message dans ta bulle…" value="${esc(myMsg)}" aria-label="Message personnalisé"/><button class="btn small primary" data-act="sendMsg">Envoyer</button></div>
    <div class="reacts">${r.map((x) => `<button class="${x.length <= 2 ? "emo" : ""}" data-act="react" data-v="${esc(x)}">${esc(x)}</button>`).join("")}</div></section>`;
}
function playerView() {
  if (!S) return { key: "wait", html: `<p class="big-msg">${icon("wait", "ic-xl")}Connexion au plateau…<br><span class="mut">En attente du présentateur</span></p>` };
  const mine = S.players[pid];
  if (!mine) {
    if (everJoined) return { key: "kicked", html: `<p class="big-msg">Tu n'es plus sur le plateau.</p><button class="btn primary" data-act="rejoin">Revenir</button>` };
    return { key: "joining", html: `<p class="big-msg">${icon("wait", "ic-xl")}On t'installe…</p>` };
  }
  const R = S.round, seated = mine.duo != null;
  const isT = target()?.id === pid, isP = partner()?.id === pid;
  const mate = seated ? playerAt(mine.duo, 1 - mine.seat) : null;
  const seatsSig = seated ? "" : Object.values(S.players).map((p) => `${p.name}:${p.duo}:${p.seat}`).join(",") + S.duoCount;
  const key = JSON.stringify([S.phase, mine.duo, mine.seat, mate?.name, seatsSig, R?.n, R?.submitted, R?.verdict, isT, isP, mySubmitN === R?.n, mySecretN === R?.n, S.scores, S.sel?.duo, S.sel?.seat, editing, editing && myLook, edTab, JSON.stringify(R?.objections || []), myObjN === R?.n, myObjSentN === R?.n]);
  let html = "";
  const editBox = `<section class="box"><h3>${icon("sparkle")}Mon personnage <button class="btn small ghost" style="margin-left:auto" data-act="edit">${editing ? "Fermer" : "Modifier"}</button></h3>${editing ? editorHTML(myLook, { preview: false }) : ""}</section>`;

  if (!seated) {
    html += `<section class="box"><h3>${icon("sofa")}Choisis ta place</h3><p class="mut">Assieds-toi à côté de ton partenaire de duo.</p><div class="seats">${[...Array(S.duoCount).keys()].map((d) =>
      `<div class="seat-duo"><b>Duo ${d + 1}</b>${[0, 1].map((s) => {
        const p = playerAt(d, s);
        return p ? `<button class="seat-btn taken" disabled>${esc(p.name)}</button>` : `<button class="seat-btn" data-act="sit" data-d="${d}" data-s="${s}">S'asseoir ici</button>`;
      }).join("")}</div>`).join("")}</div></section>` + editBox;
  } else {
    html += `<section class="box"><h3>${icon("sofa")}Duo ${mine.duo + 1} <small>${S.scores[mine.duo] || 0} pts</small></h3>
      <p class="mut">Tu es à côté de <b>${esc(nm(mate, "personne pour l'instant"))}</b>.</p>
      ${S.phase === "lobby" ? `<button class="btn small ghost" data-act="stand">Changer de place</button>` : ""}</section>`;
    const ph = S.phase;
    if (ph === "lobby") html += `<p class="big-msg">L'émission va bientôt commencer…</p>` + editBox;
    else if (ph === "intro") html += `<p class="big-msg">Regarde l'écran : les règles du jeu !</p>`;
    else if (ph === "prep") html += `<p class="big-msg">${!S.sel ? "Le présentateur choisit qui interroger…" : S.sel.duo !== mine.duo ? "Le présentateur prépare sa question…" : S.sel.seat === mine.seat ? "C'est toi qu'on va interroger ! Prépare-toi…" : `Le présentateur va interroger ${esc(nm(mate))}… sur toi !`}</p>`;
    else if (ph === "secret") {
      if (isP) html += mySecretN === R.n
        ? `<p class="big-msg">Réponse envoyée au présentateur.</p>`
        : `<div class="my-slate"><div class="sq">En secret, ta vraie réponse :<br><b>${esc(R.question)}</b></div><input id="secretIn" class="chalk-in" data-in="secretIn" maxlength="80" placeholder="Ta réponse…"/><div class="st"><span></span><button class="btn small primary" data-act="secret">Envoyer</button></div></div>`;
      else if (isT) html += `<p class="big-msg">${esc(nm(mate))} écrit une réponse en secret… la question sera pour toi.</p>`;
      else html += `<p class="big-msg">Réponse secrète en cours…</p>`;
    } else if (ph === "question") {
      if (isT) html += mySubmitN === R.n || R.submitted
        ? `<p class="big-msg">Ardoise posée. Attends le verdict…</p>`
        : `<div class="my-slate"><div class="sq">${esc(R.question)}</div><textarea id="slateIn" data-in="slate" maxlength="80" placeholder="Écris ta réponse…">${esc(myDraft)}</textarea>
           <div class="st"><b data-timer></b><button class="btn primary" data-act="submit">${btnIc("check", "Poser l'ardoise")}</button></div></div>`;
      else if (isP) html += `<p class="big-msg">Chut ! ${esc(nm(mate))} répond à une question sur toi.</p>`;
      else html += `<p class="big-msg">${esc(nm(target()))} cherche la réponse…</p>`;
    } else if (ph === "reveal") {
      const mineObj = (R.objections || []).find((o) => o.pid === pid);
      if (mine.duo !== R.duo) {
        if (!mineObj && myObjN !== R.n) html += `<button class="objection-btn" data-act="objection"><span>OBJECTION !</span><small>Tu as la bonne réponse ? Vole le point !</small></button>`;
        else if (mineObj?.status === "rejected") html += `<p class="big-msg">Objection rejetée…</p>`;
        else if (mineObj?.answer || myObjSentN === R.n) html += `<p class="big-msg">Objection envoyée. Le présentateur tranche…</p>`;
        else html += `<div class="my-slate obj-slate"><div class="sq">OBJECTION ! Ta réponse :<br><b>${esc(R.question)}</b></div><input id="objIn" class="chalk-in" data-in="objIn" maxlength="80" placeholder="La vraie réponse…"/><div class="st"><span></span><button class="btn small primary" data-act="objText">Envoyer</button></div></div>`;
      } else html += `<p class="big-msg">On retourne l'ardoise…</p>`;
    }
    else if (ph === "verdict") html += `<p class="big-msg">${R.verdict === "steal" ? `${esc(R.stealBy)} vole le point !` : { good: "Bonne réponse !", bad: "Raté…", just: "Justificatif accepté !" }[R.verdict]}</p>`;
    else if (ph === "final") html += `<p class="big-msg">Fin de l'émission ! Ton duo : ${S.scores[mine.duo] || 0} pts</p>`;
  }
  html += reactsBox();
  return {
    key, html,
    after() {
      const t = $("#slateIn"); if (t) { myDraft = t.value; t.focus({ preventScroll: true }); t.setSelectionRange(t.value.length, t.value.length); t.closest(".my-slate").scrollIntoView({ block: "end", behavior: "smooth" }); }
      if (S.phase === "prep" || S.phase === "secret") myDraft = "";
      $("#secretIn")?.focus();
    },
  };
}

initHome();
