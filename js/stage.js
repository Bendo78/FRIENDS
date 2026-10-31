// Le plateau télé : décor en profondeur, estrades en arc, canapés, présentateurs,
// public, projecteurs, ardoises, bulles, chrono, tampons. Repère fixe 1920×1080.
import { avatarSVG } from "./avatar.js";
import { introHTML, introTick } from "./intro.js";

const W = 1920, H = 1080;
const HOST = { x: 150, feet: 1012, k: 1 }, CO = { x: 1770, feet: 1012, k: 1 };
const LAMPS = [
  { x: 110, c: "warm" }, { x: 430, c: "pink" }, { x: 770, c: "warm" },
  { x: 1150, c: "violet" }, { x: 1490, c: "warm" }, { x: 1810, c: "pink" },
];
const SPAN = { 1: 0, 2: 900, 3: 1240, 4: 1440 };
// largeur occupée par un duo à l'échelle 1 (estrade + plaques), marge comprise
const FOOT = 520;
const SEAT_DX = 80;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Position de chaque duo : arc dont le centre est plus loin (plus haut, plus petit)
function layout(n) {
  const out = [];
  if (n <= 4) {
    // une seule rangée en arc : le centre est plus loin (plus haut, plus petit)
    const base = [...Array(n).keys()].map((d) => { const t = (d + 0.5) / n, depth = 1 - 4 * (t - 0.5) ** 2; return { t, depth, s: 1 - depth * 0.19 }; });
    const gap = n > 1 ? SPAN[n] / n : Infinity, k = Math.min(1, gap / (FOOT * Math.max(...base.map((b) => b.s))));
    for (const b of base) out.push({ x: W / 2 + (b.t - 0.5) * SPAN[n], y: 800 - b.depth * 118, s: b.s * k, row: 0 });
    return out;
  }
  // 5 à 10 duos : rangée de devant puis rangée du fond, en léger arc chacune
  const front = Math.ceil(n / 2), back = n - front;
  const row = (count, y, sMax, width, curve, rowId) => {
    const gap = Math.min(width / count, 560), s = Math.min(sMax, gap / FOOT);
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count, depth = 1 - 4 * (t - 0.5) ** 2;
      out.push({ x: W / 2 + (i + 0.5 - count / 2) * gap, y: y - depth * curve, s: s * (1 - depth * 0.06), row: rowId });
    }
  };
  row(front, 862, 0.8, 1560, 22, 0);
  row(back, 604, 0.5, 1440, 16, 1);
  return out;
}

function burstPts() {
  const pts = [], n = 26;
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2, k = i % 2 ? 0.72 + ((i * 37) % 10) / 60 : 1;
    pts.push(`${(500 + Math.cos(a) * 480 * k).toFixed(0)},${(210 + Math.sin(a) * 200 * k).toFixed(0)}`);
  }
  return pts.join(" ");
}
// Grain de pellicule : une petite texture de bruit, faite une seule fois
let grainCache = "";
function grainURL() {
  if (grainCache) return grainCache;
  const c = document.createElement("canvas"); c.width = c.height = 256;
  const g = c.getContext("2d"), img = g.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (Math.random() - 0.5) * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  g.putImageData(img, 0, 0);
  return (grainCache = c.toDataURL());
}
// Étiquette de nom : rétrécit selon la longueur et reste dans l’image
function fitTag(el, name, a) {
  if (el.textContent !== name) el.textContent = name;
  const place = () => {
    if (!el.offsetWidth) return;
    let size = 28; el.style.fontSize = size + "px"; el.style.letterSpacing = "";
    while (el.offsetWidth > 250 && size > 17) { size -= 1; el.style.fontSize = size + "px"; if (size < 23) el.style.letterSpacing = "1px"; }
    const w = el.offsetWidth, m = 14, k = a.k;
    let off = 0;
    const left = a.x - k * w / 2, right = a.x + k * w / 2;
    if (left < m) off = (m - left) / k; else if (right > 1920 - m) off = -(right - (1920 - m)) / k;
    const lift = Math.max(0, a.feet + k * (8 + el.offsetHeight) - (1080 - 50)) / k;
    el.style.transform = `translate(calc(-50% + ${off.toFixed(1)}px), ${(-lift).toFixed(1)}px)`;
  };
  el._fit = place; place();
  if (document.fonts && !fitTag.wait) { fitTag.wait = true; document.fonts.ready.then(() => document.querySelectorAll(".anchor .tag").forEach((t) => t._fit?.())); }
}
let sid = 0;
function sofaSVG() {
  const k = "sf" + ++sid;
  const back = `<svg class="sofa-back" viewBox="0 0 400 250" width="400" height="250">
    <defs>
      <linearGradient id="${k}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f23a55"/><stop offset=".55" stop-color="#c3112f"/><stop offset="1" stop-color="#7c0619"/></linearGradient>
      <linearGradient id="${k}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5369"/><stop offset="1" stop-color="#b10e2b"/></linearGradient>
    </defs>
    <path d="M28 160 Q26 36 112 30 H288 Q374 36 372 160 Z" fill="url(#${k}a)"/>
    <path d="M60 44 Q112 34 200 34 Q288 34 340 44" stroke="#fff" stroke-opacity=".28" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${[56, 214].map((x) => `<rect x="${x}" y="54" width="130" height="112" rx="36" fill="url(#${k}b)"/>
      ${[0, 1, 2, 3].map((i) => `<path d="M${x + 26 + i * 26} 64 V158" stroke="#7c0619" stroke-opacity=".38" stroke-width="3" stroke-linecap="round"/>`).join("")}
      <ellipse cx="${x + 65}" cy="70" rx="44" ry="8" fill="#fff" opacity=".16"/>`).join("")}
  </svg>`;
  const front = `<svg class="sofa-front" viewBox="0 0 400 250" width="400" height="250">
    <defs>
      <linearGradient id="${k}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a70"/><stop offset="1" stop-color="#c0142f"/></linearGradient>
      <linearGradient id="${k}d" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9b0b24"/><stop offset=".45" stop-color="#f0324c"/><stop offset="1" stop-color="#a70d27"/></linearGradient>
      <linearGradient id="${k}e" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe7a3"/><stop offset="1" stop-color="#b27a17"/></linearGradient>
    </defs>
    <rect x="20" y="192" width="360" height="38" rx="14" fill="#64051a"/>
    <path d="M30 196 H370" stroke="url(#${k}e)" stroke-width="3"/>
    ${[52, 212].map((x) => `<rect x="${x}" y="148" width="136" height="54" rx="22" fill="url(#${k}c)"/><path d="M${x + 14} 156 H${x + 122}" stroke="#fff" stroke-opacity=".3" stroke-width="4" stroke-linecap="round"/>`).join("")}
    <rect x="4" y="102" width="60" height="124" rx="29" fill="url(#${k}d)"/><rect x="336" y="102" width="60" height="124" rx="29" fill="url(#${k}d)"/>
    <ellipse cx="34" cy="112" rx="20" ry="7" fill="#fff" opacity=".22"/><ellipse cx="366" cy="112" rx="20" ry="7" fill="#fff" opacity=".22"/>
    <rect x="184" y="116" width="32" height="110" rx="13" fill="url(#${k}d)"/>
    <path d="M38 230 L46 248 H58 L60 230 Z M340 230 L342 248 H354 L362 230 Z" fill="url(#${k}e)"/>
  </svg>`;
  return { back, front };
}
function riserSVG() {
  return `<svg class="riser" viewBox="0 0 560 150" width="560" height="150">
    <ellipse cx="280" cy="92" rx="268" ry="52" fill="#12041f"/>
    <path d="M12 66 V92 A268 52 0 0 0 548 92 V66" fill="#1c0830"/>
    <ellipse cx="280" cy="66" rx="268" ry="52" fill="#2a0c43"/>
    <ellipse cx="280" cy="66" rx="268" ry="52" fill="none" stroke="#ff4fa3" stroke-width="4" class="riser-rim"/>
    <ellipse cx="280" cy="66" rx="230" ry="40" fill="none" stroke="#ffd36b" stroke-opacity=".35" stroke-width="2" stroke-dasharray="3 10"/>
    <path d="M12 92 A268 52 0 0 0 548 92" fill="none" stroke="#ff4fa3" stroke-opacity=".55" stroke-width="3"/>
  </svg>`;
}
function audienceSVG() {
  let s = "", x = -20, i = 0;
  while (x < W + 40) {
    const r = 26 + ((i * 37) % 13), h = 64 + ((i * 53) % 30), y = 110 - h;
    s += `<g class="aud-p" style="animation-delay:${((i * 0.137) % 0.6).toFixed(2)}s"><circle cx="${x}" cy="${y}" r="${r}"/><path d="M${x - r * 1.9} 140 Q${x - r * 1.8} ${y + r * 1.1} ${x} ${y + r * 1.05} Q${x + r * 1.8} ${y + r * 1.1} ${x + r * 1.9} 140 Z"/></g>`;
    x += 58 + ((i * 29) % 26); i++;
  }
  return `<svg class="audience" viewBox="0 0 ${W} 140" width="${W}" height="140" preserveAspectRatio="none">${s}</svg>`;
}
function bulbs() {
  // ampoules autour du mur LED
  const L = 250, T = 70, Wd = 1420, Ht = 380, step = 34, out = [];
  let k = 0;
  const add = (x, y) => out.push(`<i class="bulb" style="left:${x}px;top:${y}px;animation-delay:${((k++ % 3) * 0.33).toFixed(2)}s"></i>`);
  for (let x = L; x <= L + Wd; x += step) { add(x, T - 16); add(x, T + Ht + 16); }
  for (let y = T + step - 16; y < T + Ht + 16; y += step) { add(L - 16, y); add(L + Wd + 16, y); }
  return out.join("");
}

export class Stage {
  constructor(root) {
    this.root = root;
    root.classList.add("stage-root");
    root.innerHTML = `
      <div class="stage idle">
       <div class="rig"><div class="cam">
        <div class="st-bg"></div>
        <div class="pillar l"><i></i></div><div class="pillar r"><i></i></div>
        <div class="ledwall">
          <div class="led-grid"></div><div class="led-hearts"></div>
          <svg class="led-heart" viewBox="0 0 200 180"><path d="M100 168 C40 124 6 92 6 52 C6 24 28 6 54 6 C74 6 90 18 100 34 C110 18 126 6 146 6 C172 6 194 24 194 52 C194 92 160 124 100 168 Z"/></svg>
          <div class="logo"><span class="l1">FRI</span><span class="l3">ENDS</span><span class="slogan">Qui connaît le mieux son pote ?</span></div>
          <div class="led-board"></div>
          <div class="timer"><svg viewBox="0 0 120 120"><circle class="tr-bg" cx="60" cy="60" r="52"/><circle class="tr-fg" cx="60" cy="60" r="52"/></svg><b>0</b></div>
        </div>
        <div class="bulbs">${bulbs()}</div>
        <div class="truss">${LAMPS.map((l) => `<i class="lamp ${l.c}" style="left:${l.x}px"><b class="flare"></b></i>`).join("")}</div>
        <div class="floor"><div class="floor-grid"></div><div class="floor-glow"></div>
          <svg class="floor-ring" viewBox="0 0 1200 300"><ellipse cx="600" cy="150" rx="560" ry="120" class="fr1"/><ellipse cx="600" cy="150" rx="430" ry="90" class="fr2"/><ellipse cx="600" cy="150" rx="300" ry="60" class="fr3"/></svg>
        </div>
        <div class="haze back"></div>
        <div class="pools">${"<i class=\"pool\"><b></b></i>".repeat(5)}</div>
        <div class="duos"></div>
        <div class="haze front"></div>
        <div class="st-embers">${"<i></i>".repeat(18)}</div>
        ${audienceSVG()}
        <div class="anchor host" style="left:${HOST.x}px;top:${HOST.feet}px"><div class="anchor-av"></div><div class="tag"></div></div>
        <div class="anchor co hidden" style="left:${CO.x}px;top:${CO.feet}px"><div class="anchor-av"></div><div class="tag"></div></div>
        <div class="keys">${"<i class=\"key\"></i>".repeat(5)}</div>
        <svg class="dim" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">
          <defs>
            <filter id="holeBlur" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><feGaussianBlur stdDeviation="46"/></filter>
            <mask id="dimMask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">
              <rect width="${W}" height="${H}" fill="#fff"/>
              <g filter="url(#holeBlur)">${"<ellipse class=\"hole\" cx=\"960\" cy=\"600\" rx=\"0\" ry=\"0\" fill=\"#000\"/>".repeat(5)}</g>
            </mask>
            <radialGradient id="vign" cx="50%" cy="55%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
          </defs>
          <rect class="dim-fill" width="${W}" height="${H}" mask="url(#dimMask)"/>
          <rect width="${W}" height="${H}" fill="url(#vign)"/>
        </svg>
        <div class="beams">${LAMPS.map((l, i) => `<div class="beam ${l.c}" data-i="${i}" style="left:${l.x}px"><div class="cone"></div></div>`).join("")}</div>
        <div class="bubbles"></div>
        <div class="fx"></div>
       </div></div>
        <div class="intro" aria-hidden="true"></div>
        <div class="grade"></div><div class="grain"></div><div class="bars"><i></i><i></i></div>
        <div class="lower3"><div class="l3-tag"></div><div class="l3-text"></div></div>
        <div class="objection" aria-hidden="true"><div class="obj-lines"></div><svg class="obj-burst" viewBox="0 0 1000 420"><polygon points="${burstPts()}"/></svg><div class="obj-text">OBJECTION !</div><div class="obj-name"></div></div>
        <div class="live-badge"><i></i>EN DIRECT</div><div class="manche-badge"></div>
        <div class="room-badge"></div>
        <div class="stamp"></div>
      </div>`;
    this.el = root.querySelector(".stage");
    this.q = (s) => this.el.querySelector(s);
    this.n = 0; this.L = []; this.keys = {};
    this.q(".grain").style.backgroundImage = `url(${grainURL()})`;
    new ResizeObserver(() => this.fit()).observe(root);
    this.fit();
  }

  fit() {
    const r = this.root.getBoundingClientRect();
    const s = Math.min(r.width / W, r.height / H) || 0.1;
    this.el.style.transform = `translate(${(r.width - W * s) / 2}px, ${(r.height - H * s) / 2}px) scale(${s})`;
  }

  build(n) {
    this.n = n; this.L = layout(n); this.keys = {};
    const wide = n > 6;
    Object.assign(HOST, wide ? { x: 112, feet: 1040, k: 0.8 } : { x: 150, feet: 1012, k: 1 });
    Object.assign(CO, wide ? { x: 1808, feet: 1040, k: 0.8 } : { x: 1770, feet: 1012, k: 1 });
    for (const [sel, p] of [[".anchor.host", HOST], [".anchor.co", CO]]) {
      const a = this.q(sel); a.style.left = p.x + "px"; a.style.top = p.feet + "px"; a.style.transform = `scale(${p.k})`;
    }
    // les duos du fond d'abord, ceux de devant par-dessus
    const order = [...this.L.keys()].sort((a, b) => this.L[a].y - this.L[b].y);
    this.q(".duos").innerHTML = order.map((d) => {
      const p = this.L[d], sofa = sofaSVG();
      return `<div class="duo${p.row ? " far" : ""}" data-d="${d}" style="transform:translate(${p.x}px,${p.y}px) scale(${p.s})">
        ${riserSVG()}
        ${sofa.back}
        <div class="seatpl s0" style="left:${-SEAT_DX}px"></div><div class="seatpl s1" style="left:${SEAT_DX}px"></div>
        ${sofa.front}
        <div class="duo-heart"><span>0</span></div>
        <div class="slate s0" style="left:${-SEAT_DX}px"><div class="slate-in"><div class="sl-front"><span class="chalk-q">?</span></div><div class="sl-back"><span></span></div></div></div>
        <div class="slate s1" style="left:${SEAT_DX}px"><div class="slate-in"><div class="sl-front"><span class="chalk-q">?</span></div><div class="sl-back"><span></span></div></div></div>
        <div class="plate s0" style="left:${-SEAT_DX - 34}px"></div><div class="plate s1" style="left:${SEAT_DX + 34}px"></div>
        <div class="duo-num">Duo ${d + 1}</div>
      </div>`;
    }).join("");
  }
  seat(d, s) { const p = this.L[d]; return { x: p.x + (s ? SEAT_DX : -SEAT_DX) * p.s, head: p.y - 228 * p.s, s: p.s }; }
  duoX(d) { return this.L[d]?.x ?? W / 2; }

  setAvatar(el, key, look, opts) {
    if (this.keys[key] === JSON.stringify([look, opts])) return;
    this.keys[key] = JSON.stringify([look, opts]);
    el.innerHTML = look ? avatarSVG(look, opts) : "";
  }

  // ───── mise à jour depuis l'état ─────
  update(S, opt = {}) {
    if (!S) return;
    if (S.duoCount !== this.n) this.build(S.duoCount);
    const el = this.el, R = S.round, ph = S.phase;
    this.q(".room-badge").textContent = opt.showCode ? `Room ${S.code}` : "";
    this.q(".manche-badge").textContent = ph === "lobby" || ph === "final" ? "" : ({ 1: "Manche 1", 2: "Manche 2", 3: "Finale" }[S.manche || 1]);

    // Expressions selon le moment
    const tgtId = R ? Object.values(S.players).find((p) => p.duo === R.duo && p.seat === R.seat)?.id : null;
    const prtId = R ? Object.values(S.players).find((p) => p.duo === R.duo && p.seat === 1 - R.seat)?.id : null;
    const exprFor = (id) => {
      if (R?.stealPid === id && ph === "verdict") return "happy";
      if (R && ph === "reveal" && (R.objections || []).some((o) => o.pid === id && o.status === "pending")) return "o";
      if (!R || (id !== tgtId && id !== prtId)) return "smile";
      if (ph === "verdict" && R.verdict === "steal") return "sad";
      if (ph === "verdict") return R.verdict === "bad" ? "sad" : "happy";
      if (ph === "question") return id === tgtId ? (R.submitted ? "smile" : "think") : "shh";
      if (ph === "secret") return id === prtId ? "think" : "shh";
      if (ph === "reveal") return "o";
      return "smile";
    };
    const anchorExpr = ph === "verdict" ? (R?.verdict === "bad" ? "o" : "happy") : ph === "reveal" ? "o" : ph === "final" ? "happy" : "smile";

    // Générique des règles
    el.classList.toggle("introing", ph === "intro");
    if (ph === "intro" && this._introAt !== S.introAt) { this._introAt = S.introAt; clearTimeout(this._introClr); this.q(".intro").innerHTML = introHTML(S); }
    if (ph !== "intro" && this._introAt) { this._introAt = null; this._introClr = setTimeout(() => (this.q(".intro").innerHTML = ""), 1000); }

    // Présentateur et co-présentateur
    const host = this.q(".anchor.host");
    this.setAvatar(host.querySelector(".anchor-av"), "host", S.hostLook, { pose: "stand", expr: anchorExpr });
    fitTag(host.querySelector(".tag"), S.hostName || "Présentateur", HOST);
    host.classList.toggle("talking", ["question", "secret", "reveal"].includes(ph));
    const co = this.q(".anchor.co");
    co.classList.toggle("hidden", !S.cohost);
    if (S.cohost) {
      this.setAvatar(co.querySelector(".anchor-av"), "co", S.cohost.look, { pose: "stand", expr: anchorExpr });
      fitTag(co.querySelector(".tag"), S.cohost.name, CO);
    }

    // Candidats
    const bySeat = {};
    for (const p of Object.values(S.players)) if (p.duo != null && p.seat != null && p.duo < S.duoCount) bySeat[p.duo + "-" + p.seat] = p;
    this.bySeat = bySeat;
    for (let d = 0; d < S.duoCount; d++) {
      const duoEl = el.querySelector(`.duo[data-d="${d}"]`);
      duoEl.querySelector(".duo-heart span").textContent = S.scores[d] ?? 0;
      for (let s = 0; s < 2; s++) {
        const p = bySeat[d + "-" + s];
        const slot = duoEl.querySelector(`.seatpl.s${s}`);
        const was = this.keys["p" + d + s];
        this.setAvatar(slot, "p" + d + s, p ? p.look : null, { pose: "sit", expr: p ? exprFor(p.id) : "smile" });
        if (p && (!was || was.startsWith("[null"))) slot.firstElementChild?.classList.add("arrive");
        slot.classList.toggle("empty", !p);
        const plate = duoEl.querySelector(`.plate.s${s}`);
        plate.textContent = p ? p.name : "Place libre";
        plate.classList.toggle("empty", !p);
        plate.classList.toggle("me", !!p && p.id === opt.me);
        const active = R && R.duo === d && R.seat === s;
        slot.classList.toggle("active", !!active && ["question", "reveal", "verdict"].includes(ph));
        slot.classList.toggle("writing", !!active && ph === "question" && !R.submitted);
        slot.classList.toggle("chosen", ph === "prep" && !!p && S.sel?.duo === d && S.sel?.seat === s);

        const slate = duoEl.querySelector(`.slate.s${s}`);
        const show = !!active && ["question", "reveal", "verdict"].includes(ph);
        slate.classList.toggle("show", show);
        slate.classList.toggle("flip", show && (ph === "reveal" || ph === "verdict"));
        slate.classList.toggle("posed", show && ph === "question" && !!R.submitted);
        if (show && R.answer != null) slate.querySelector(".sl-back span").textContent = R.answer || "…";
        for (const v of ["good", "bad", "just"]) slate.classList.toggle("v-" + v, show && ph === "verdict" && (R.verdict === v || (v === "bad" && R.verdict === "steal")));
      }
      duoEl.classList.toggle("sel", (ph === "prep" && S.sel?.duo === d) || (!!R && R.duo === d && ph !== "prep"));
    }

    // Bandeau
    const l3 = this.q(".lower3");
    const tgt = R ? bySeat[R.duo + "-" + R.seat] : null, prt = R ? bySeat[R.duo + "-" + (1 - R.seat)] : null;
    let tag = "", text = "";
    if (ph === "lobby") { tag = "Installez-vous"; text = `Rejoignez la room <b>${esc(S.code)}</b> et prenez place sur un canapé`; }
    else if (ph === "prep") {
      const a = S.sel ? bySeat[S.sel.duo + "-" + S.sel.seat] : null, b = S.sel ? bySeat[S.sel.duo + "-" + (1 - S.sel.seat)] : null;
      if (a) { tag = `Duo ${S.sel.duo + 1}`; text = b ? `<b>${esc(a.name)}</b> va répondre sur ${esc(b.name)}` : `Prochaine question pour <b>${esc(a.name)}</b>`; }
      else { tag = "Qui sera le prochain ?"; text = "Le présentateur choisit le candidat…"; }
    }
    else if (ph === "secret") { tag = "Chut…"; text = `${esc(prt?.name || "Le partenaire")} note sa réponse en secret`; }
    else if (ph === "question" || ph === "reveal") { tag = `Question pour ${esc(tgt?.name || "?")}`; text = esc(R.question); }
    else if (ph === "verdict") {
      tag = { good: "Bonne réponse", bad: "Mauvaise réponse", just: "Justificatif accepté", steal: "Objection retenue" }[R.verdict] || "";
      text = R.verdict === "steal" ? `${esc(R.stealBy)} (Duo ${R.stealDuo + 1}) vole le point avec :<b>${esc(R.stealAnswer || "…")}</b>` : R.expected ? `Réponse de ${esc(prt?.name || "son partenaire")} :<b>${esc(R.expected)}</b>` : esc(R.question);
    } else if (ph === "final") { tag = "Fin de l'émission"; text = "Merci à nos candidats !"; }
    l3.querySelector(".l3-tag").innerHTML = tag;
    l3.querySelector(".l3-text").innerHTML = text;
    l3.className = "lower3 show ph-" + ph + (ph === "verdict" && R?.verdict ? " v-" + R.verdict : "");
    const pend = ph === "reveal" ? (R?.objections || []).filter((o) => o.status === "pending") : [];
    if (pend.length) { const o = pend[pend.length - 1]; l3.querySelector(".l3-tag").innerHTML = "Objection !"; l3.querySelector(".l3-text").innerHTML = `${esc(o.name)} (Duo ${o.duo + 1}) conteste la réponse${o.answer ? ` :<b>${esc(o.answer)}</b>` : "…"}`; l3.classList.add("v-obj"); }

    // Classement
    if (ph === "final") {
      const ranks = [...Array(S.duoCount).keys()].filter((d) => bySeat[d + "-0"] || bySeat[d + "-1"]).sort((a, b) => (S.scores[b] || 0) - (S.scores[a] || 0));
      this.q(".led-board").innerHTML = `<div class="rank-title">Classement</div>` + ranks.map((d, i) =>
        `<div class="rank r${i}"><span class="pos">${i + 1}</span><span class="nm">${esc(bySeat[d + "-0"]?.name || "?")} & ${esc(bySeat[d + "-1"]?.name || "?")}</span><span class="sc">${S.scores[d] || 0} pt${(S.scores[d] || 0) > 1 ? "s" : ""}</span></div>`).join("");
    }
    el.classList.toggle("final", ph === "final");
    el.classList.toggle("timing", ph === "question" && !!R && !R.submitted);
    this.aim(S, ph, R);
  }

  aim(S, ph, R) {
    const el = this.el;
    const beams = [...el.querySelectorAll(".beam")], lamps = [...el.querySelectorAll(".lamp")];
    const pools = [...el.querySelectorAll(".pool")], keys = [...el.querySelectorAll(".key")], holes = [...el.querySelectorAll(".hole")];

    // Chaque cible éclairée : position du visage, zone du corps, sol sous ses pieds
    const seatT = (d, s, o = {}) => {
      const st = this.seat(d, s);
      return { x: st.x, y: st.head, cy: st.head + 112 * st.s, rx: 120 * st.s, ry: 178 * st.s, floor: this.L[d].y + 6, sc: st.s, slot: `.duo[data-d="${d}"] .seatpl.s${s}`, ...o };
    };
    const anchorT = (a, sel, o = {}) => ({ x: a.x, y: a.feet - 400 * a.k, cy: a.feet - 230 * a.k, rx: 128 * a.k, ry: 258 * a.k, floor: a.feet - 8, sc: 1.05 * a.k, slot: sel, ...o });
    let T = [], mode = "idle";
    if (ph === "prep" && S.sel?.duo != null && S.sel.duo < S.duoCount) {
      mode = "soft";
      T = [seatT(S.sel.duo, S.sel.seat, { main: true }), seatT(S.sel.duo, 1 - S.sel.seat, { weak: true }), anchorT(HOST, ".anchor.host")];
    } else if (ph === "secret" && R) {
      mode = "focus";
      T = [seatT(R.duo, 1 - R.seat, { main: true }), seatT(R.duo, R.seat, { weak: true }), anchorT(HOST, ".anchor.host", { weak: true })];
    } else if ((ph === "question" || ph === "reveal") && R) {
      mode = "focus";
      T = [seatT(R.duo, R.seat, { main: true }), seatT(R.duo, 1 - R.seat, { weak: true }), anchorT(HOST, ".anchor.host")];
      const ob = ph === "reveal" ? (R.objections || []).filter((o) => o.status === "pending").pop() : null;
      const op = ob && S.players[ob.pid];
      if (op && op.duo != null) T.splice(2, 0, seatT(op.duo, op.seat));
    } else if (ph === "verdict" && R && R.verdict === "steal") {
      mode = "focus";
      const sp = S.players[R.stealPid];
      T = sp && sp.duo != null ? [seatT(sp.duo, sp.seat, { main: true }), seatT(R.duo, R.seat, { weak: true }), anchorT(HOST, ".anchor.host", { weak: true })] : [seatT(R.duo, R.seat)];
    } else if (ph === "verdict" && R) {
      mode = R.verdict === "bad" ? "focus" : "party";
      T = [seatT(R.duo, R.seat, { main: true }), seatT(R.duo, 1 - R.seat)];
    } else if (ph === "final") mode = "party";
    const idle = mode === "idle" || mode === "party";
    const main = T.find((t) => t.main) || (mode === "soft" ? T[0] : null);
    const zoom = !main ? 1 : mode === "soft" ? 1.03 : ph === "question" || ph === "secret" ? 1.075 : 1.05;
    const cam = this.q(".cam");
    if (main) cam.style.transformOrigin = `${main.x.toFixed(0)}px ${(main.cy ?? main.y).toFixed(0)}px`;
    cam.style.transform = `scale(${zoom})`;
    const focus = new Set(T.filter((t) => t.slot.startsWith(".duo")).map((t) => t.slot.match(/data-d="(\d+)"/)[1]));
    el.querySelectorAll(".duo").forEach((d) => d.classList.toggle("focus", focus.has(d.dataset.d)));
    el.classList.toggle("cine", ["secret", "question", "reveal"].includes(ph) && !!R);
    if (S.cohost && !idle) T.push(anchorT(CO, ".anchor.co", { weak: true }));

    el.classList.toggle("idle", idle);
    el.classList.toggle("party", mode === "party");
    el.classList.toggle("soft", mode === "soft");
    el.classList.toggle("bad", ph === "verdict" && R?.verdict === "bad");
    el.classList.toggle("dimmed", !idle);

    // Projecteurs : la cible principale reçoit trois faisceaux qui se croisent sur elle
    const want = idle ? [] : T.flatMap((t) => (t.main ? [t, t, t] : [t]));
    const free = beams.map((_, i) => i), assign = new Map();
    for (const t of want) {
      free.sort((a, b) => Math.abs(LAMPS[a].x - t.x) - Math.abs(LAMPS[b].x - t.x));
      const i = free[0];
      if (i != null && (Math.abs(LAMPS[i].x - t.x) < 760 || !assign.size)) { free.shift(); assign.set(i, t); }
    }
    beams.forEach((b, i) => {
      const t = assign.get(i);
      if (idle) { b.classList.remove("off", "weak"); lamps[i].classList.add("on"); b.style.setProperty("--rot", "0deg"); b.style.setProperty("--len", "1100px"); return; }
      b.classList.toggle("off", !t);
      lamps[i].classList.toggle("on", !!t);
      if (!t) return;
      b.classList.toggle("weak", !!t.weak || mode === "soft");
      const lx = LAMPS[i].x, ly = 40, ty = t.floor;
      b.style.setProperty("--rot", (-Math.atan2(t.x - lx, ty - ly) * 180 / Math.PI).toFixed(1) + "deg");
      b.style.setProperty("--len", Math.hypot(t.x - lx, ty - ly).toFixed(0) + "px");
    });

    // Trous de lumière dans la pénombre, lumière chaude sur les corps, flaques au sol
    el.querySelectorAll(".lit").forEach((n) => n.classList.remove("lit", "lit-weak"));
    holes.forEach((h, i) => {
      const t = idle ? null : T[i];
      h.style.setProperty("cx", (t ? t.x : 960) + "px");
      h.style.setProperty("cy", (t ? t.cy : 600) + "px");
      h.style.setProperty("rx", (t ? t.rx * (t.weak ? 0.92 : 1.08) : 0) + "px");
      h.style.setProperty("ry", (t ? t.ry * (t.weak ? 0.92 : 1.08) : 0) + "px");
      h.style.setProperty("fill-opacity", t ? (t.weak ? 0.6 : 1) : 0);
    });
    keys.forEach((k, i) => {
      const t = idle ? null : T[i];
      k.className = "key" + (t ? " on" + (t.weak ? " weak" : "") : "");
      if (!t) return;
      k.style.left = t.x + "px"; k.style.top = t.cy + "px";
      k.style.width = t.rx * 2.4 + "px"; k.style.height = t.ry * 2.3 + "px";
    });
    pools.forEach((p, i) => {
      const t = idle ? null : T[i];
      p.className = "pool" + (t ? " on" + (t.weak ? " weak" : "") : "");
      if (!t) return;
      p.style.left = t.x + "px"; p.style.top = t.floor + "px";
      p.style.setProperty("--ps", t.sc);
    });
    if (!idle) for (const t of T) el.querySelector(t.slot)?.classList.add("lit", ...(t.weak ? ["lit-weak"] : []));
  }

  setTimer(remaining, total) {
    const t = this.q(".timer");
    if (remaining == null) { t.classList.remove("show"); this.lastSec = null; return false; }
    t.classList.add("show");
    const r = Math.max(0, remaining), sec = Math.ceil(r), C = 2 * Math.PI * 52;
    if (this.lastSec !== sec) t.querySelector("b").textContent = sec;
    const fg = t.querySelector(".tr-fg");
    fg.style.strokeDasharray = C; fg.style.strokeDashoffset = C * (1 - r / total);
    t.classList.toggle("hurry", r <= 5);
    const changed = this.lastSec !== sec; this.lastSec = sec;
    return changed && sec <= 5 && sec > 0;
  }

  bubble(who, text, ms = 4200) {
    let x, y;
    if (who === "host") { x = HOST.x + 30; y = HOST.feet - 452 * HOST.k; }
    else if (who === "cohost") { x = CO.x - 30; y = CO.feet - 452 * CO.k; }
    else {
      const ent = Object.entries(this.bySeat || {}).find(([, p]) => p.id === who);
      if (!ent) return;
      const [d, s] = ent[0].split("-").map(Number);
      const st = this.seat(d, s); x = st.x; y = st.head - 50 * st.s;
    }
    const cx = Math.min(Math.max(x, 250), W - 250);
    const layer = this.q(".bubbles");
    layer.querySelectorAll(`.bubble[data-who="${who}"]`).forEach((b) => b.remove());
    const b = document.createElement("div");
    b.className = "bubble" + (who === "host" || who === "cohost" ? " anchor-b" : "") + (text.length > 60 ? " long" : "");
    b.dataset.who = who;
    b.style.left = cx + "px"; b.style.top = y + "px";
    b.style.setProperty("--tail", x - cx + "px");
    b.textContent = text;
    layer.appendChild(b);
    setTimeout(() => b.classList.add("out"), ms);
    setTimeout(() => b.remove(), ms + 400);
  }

  stamp(kind) {
    const s = this.q(".stamp");
    s.className = "stamp"; void s.offsetWidth;
    s.textContent = { good: "Bonne réponse !", bad: "Raté !", just: "Justificatif accepté !", final: "Bravo !", steal: "Point volé !", objno: "Objection rejetée" }[kind];
    s.className = "stamp show k-" + kind;
  }

  // Avance le générique ; renvoie le numéro du plan affiché (-1 = terminé)
  intro(ms) { return this._introAt ? introTick(this.q(".intro"), ms) : -1; }

  objection(name) {
    const o = this.q(".objection");
    o.querySelector(".obj-name").textContent = name;
    o.classList.remove("show"); this.el.classList.remove("shake"); void o.offsetWidth;
    o.classList.add("show"); this.el.classList.add("shake");
    clearTimeout(this._ob); this._ob = setTimeout(() => { o.classList.remove("show"); this.el.classList.remove("shake"); }, 2300);
  }

  crowd(kind) {
    const el = this.el;
    el.classList.remove("cheer", "gasp"); void el.offsetWidth;
    el.classList.add(kind === "ooh" ? "gasp" : "cheer");
    clearTimeout(this._cr); this._cr = setTimeout(() => el.classList.remove("cheer", "gasp"), 2600);
  }

  burst(kind, x = W / 2, count = 36) {
    const fx = this.q(".fx");
    const shapes = kind === "bad" ? ["x"] : ["h", "h", "s", "c"];
    for (let i = 0; i < count; i++) {
      const e = document.createElement("i");
      e.className = "spark k-" + kind + " sh-" + shapes[i % shapes.length];
      const ang = (Math.random() - 0.5) * Math.PI * 1.1, dist = 260 + Math.random() * 440;
      e.style.left = x + "px"; e.style.top = "620px";
      e.style.setProperty("--tx", Math.sin(ang) * dist + "px");
      e.style.setProperty("--ty", -Math.cos(ang) * dist * 0.9 - 60 + "px");
      e.style.setProperty("--r", (Math.random() * 240 - 120).toFixed(0) + "deg");
      e.style.setProperty("--sz", (18 + Math.random() * 30).toFixed(0) + "px");
      e.style.animationDelay = (Math.random() * 0.25).toFixed(2) + "s";
      fx.appendChild(e);
      setTimeout(() => e.remove(), 2300);
    }
  }
  popHeart(d) {
    const h = this.el.querySelector(`.duo[data-d="${d}"] .duo-heart`);
    if (h) { h.classList.remove("pop"); void h.offsetWidth; h.classList.add("pop"); }
  }
}
