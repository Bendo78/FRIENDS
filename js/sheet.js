// Lecture des réponses du formulaire Google (feuille Google Sheets liée).
// Une ligne = un joueur ; une colonne = une question ; une colonne contient le prénom.

// Transforme n'importe quel lien de feuille Google en lien CSV lisible depuis le navigateur.
export function toCsvUrl(raw) {
  const url = String(raw || "").trim();
  if (!url) return null;
  if (/[?&](output=csv|format=csv)|tqx=out:csv/.test(url)) return url;
  const gid = (url.match(/[#&?]gid=(\d+)/) || [])[1];
  const pub = url.match(/\/spreadsheets\/d\/e\/([\w-]+)/);
  if (pub) return `https://docs.google.com/spreadsheets/d/e/${pub[1]}/pub?output=csv${gid ? "&gid=" + gid : ""}`;
  const id = url.match(/\/spreadsheets\/d\/([\w-]+)/);
  if (id) return `https://docs.google.com/spreadsheets/d/${id[1]}/gviz/tq?tqx=out:csv${gid ? "&gid=" + gid : ""}`;
  return null;
}

// Analyseur CSV (guillemets, retours à la ligne dans les cellules, ; ou ,)
export function parseCSV(text) {
  text = String(text || "").replace(/^﻿/, "");
  const first = text.split(/\r?\n/)[0] || "";
  const sep = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ";" : ",";
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === sep) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim() !== ""));
}

const NAME_RE = /pr[ée]nom|^nom\b|\bnom\b|name|pseudo|qui es[- ]tu/i;
const SKIP_RE = /horodat|timestamp|date|heure|adresse e-?mail|e-?mail|score/i;

// Construit { headers, nameCol, questions:[{col,text}], people:[{name,row}] }
export function analyze(rows, nameColForced) {
  if (!rows.length) return null;
  const headers = rows[0].map((h, i) => h.trim() || `Colonne ${i + 1}`);
  let nameCol = Number.isInteger(nameColForced) && nameColForced >= 0 && nameColForced < headers.length ? nameColForced : headers.findIndex((h) => NAME_RE.test(h) && !SKIP_RE.test(h));
  if (nameCol < 0) nameCol = headers.findIndex((h) => !SKIP_RE.test(h));
  const empty = (col) => !rows[0][col]?.trim() && rows.slice(1).every((r) => !(r[col] || "").trim());
  const questions = headers.map((text, col) => ({ col, text })).filter((q) => q.col !== nameCol && !SKIP_RE.test(q.text) && !empty(q.col));
  const people = rows.slice(1).map((r) => ({ name: (r[nameCol] || "").trim(), row: r.map((x) => x.trim()) })).filter((p) => p.name);
  return { headers, nameCol, questions, people };
}

export async function fetchSheet(url) {
  const csv = toCsvUrl(url);
  if (!csv) throw new Error("Ce lien n'est pas un lien Google Sheets.");
  const res = await fetch(csv, { cache: "no-store" });
  if (!res.ok) throw new Error("Google a refusé l'accès (" + res.status + ").");
  const text = await res.text();
  if (/^\s*<(!doctype|html)/i.test(text)) throw new Error("La feuille n'est pas partagée publiquement.");
  return parseCSV(text);
}

// Comparaison de prénoms tolérante (accents, casse, espaces)
export const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
