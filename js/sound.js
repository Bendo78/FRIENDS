// Petits jingles d'émission synthétisés (aucun fichier audio nécessaire).
let ctx = null;
let muted = false;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
export const unlock = () => { try { ac(); } catch {} };
export const setMuted = (m) => (muted = m);
export const isMuted = () => muted;

function tone(f, t0, d, type = "sine", g = 0.2) {
  if (muted || !ctx) return;
  const c = ctx, now = c.currentTime + t0;
  const o = c.createOscillator(), a = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, now);
  a.gain.setValueAtTime(0.0001, now);
  a.gain.linearRampToValueAtTime(g, now + 0.012);
  a.gain.exponentialRampToValueAtTime(0.0001, now + d);
  o.connect(a).connect(c.destination);
  o.start(now); o.stop(now + d + 0.05);
}
function noise(t0, d, g = 0.15, freq = 900) {
  if (muted || !ctx) return;
  const c = ctx, now = c.currentTime + t0;
  const buf = c.createBuffer(1, c.sampleRate * d, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.sin(i / 260));
  const src = c.createBufferSource(); src.buffer = buf;
  const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq;
  const a = c.createGain();
  a.gain.setValueAtTime(0.0001, now);
  a.gain.linearRampToValueAtTime(g, now + d * 0.85);
  a.gain.exponentialRampToValueAtTime(0.0001, now + d);
  src.connect(f).connect(a).connect(c.destination);
  src.start(now);
}

function clap(t0, g) {
  if (muted || !ctx) return;
  const c = ctx, now = c.currentTime + t0, d = 0.05;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * d), c.sampleRate), data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length / 5));
  const src = c.createBufferSource(); src.buffer = buf;
  const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 900 + Math.random() * 1600; f.Q.value = 0.8;
  const a = c.createGain(); a.gain.value = g;
  src.connect(f).connect(a).connect(c.destination); src.start(now);
}
function voice(f0, f1, t0, d, g) {
  if (muted || !ctx) return;
  const c = ctx, now = c.currentTime + t0;
  const o = c.createOscillator(), fl = c.createBiquadFilter(), a = c.createGain();
  o.type = "sawtooth"; o.frequency.setValueAtTime(f0, now); o.frequency.exponentialRampToValueAtTime(f1, now + d);
  fl.type = "lowpass"; fl.frequency.value = 900;
  a.gain.setValueAtTime(0.0001, now); a.gain.linearRampToValueAtTime(g, now + d * 0.3); a.gain.exponentialRampToValueAtTime(0.0001, now + d);
  o.connect(fl).connect(a).connect(c.destination); o.start(now); o.stop(now + d + 0.05);
}

export const sfx = {
  whoosh() { noise(0, 0.45, 0.16, 1400); tone(220, 0.05, 0.4, "sine", 0.05); },
  pick() { tone(330, 0, 0.12, "triangle", 0.12); tone(494, 0.1, 0.12, "triangle", 0.12); tone(659, 0.2, 0.3, "triangle", 0.14); },
  stamp() { noise(0, 0.08, 0.3, 300); tone(90, 0, 0.25, "sine", 0.3); },
  count() { tone(880, 0, 0.12, "square", 0.08); },
  objection() { noise(0, 0.12, 0.35, 1800); [196, 247, 294, 392].forEach((f) => tone(f, 0.02, 0.9, "sawtooth", 0.07)); [784, 988].forEach((f, i) => tone(f, 0.05 + i * 0.04, 0.35, "square", 0.06)); tone(98, 0, 1.1, "sine", 0.25); },
  applause() { for (let i = 0; i < 140; i++) { const t = Math.random() * 2.4; clap(t, 0.25 * (1 - t / 3)); } },
  ooh() { [180, 220, 260, 300, 150].forEach((f, i) => voice(f, f * 0.78, i * 0.03, 1.3, 0.05)); },
  laugh() { for (let i = 0; i < 6; i++) [260, 330, 390].forEach((f, j) => voice(f * (1 + j * 0.02), f * 0.85, i * 0.18 + j * 0.02, 0.14, 0.05)); },
  drum() { noise(0, 1.6, 0.2, 650); tone(110, 1.6, 0.4, "sine", 0.25); },
  start() { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.5, "triangle", 0.16)); tone(196, 0, 0.9, "sine", 0.12); },
  good() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.08, 0.45, "triangle", 0.17)); },
  just() { [784, 988, 1175, 1568, 1175, 1568, 2093].forEach((f, i) => tone(f, i * 0.07, 0.3, "triangle", 0.13)); },
  bad() { tone(150, 0, 0.7, "sawtooth", 0.14); tone(100, 0.02, 0.7, "square", 0.07); },
  tick() { tone(1300, 0, 0.05, "square", 0.05); },
  timeup() { tone(880, 0, 0.15, "square", 0.1); tone(660, 0.17, 0.15, "square", 0.1); tone(440, 0.34, 0.4, "square", 0.1); },
  reveal() { noise(0, 1.1, 0.18, 700); tone(523, 1.1, 0.4, "triangle", 0.15); },
  pop() { tone(900, 0, 0.07, "sine", 0.1); tone(1350, 0.05, 0.07, "sine", 0.08); },
  join() { tone(660, 0, 0.1, "sine", 0.1); tone(990, 0.09, 0.15, "sine", 0.1); },
  final() { [523, 659, 784, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, i * 0.12, 0.5, "triangle", 0.15)); },
};
