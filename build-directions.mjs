// Calcule la position de chaque sous-discipline et de chaque sujet à partir des liens mesurés,
// puis écrit directions.html (le gabarit + les données). Usage : node build-directions.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import assert from 'node:assert';

const s = JSON.parse(readFileSync('squelette.json'));
const FR = { 'Agricultural and Biological Sciences': 'Agriculture et biologie', 'Arts and Humanities': 'Arts et humanités', 'Biochemistry, Genetics and Molecular Biology': 'Biochimie et génétique', 'Business, Management and Accounting': 'Gestion et commerce', 'Chemical Engineering': 'Génie chimique', 'Chemistry': 'Chimie', 'Computer Science': 'Informatique', 'Decision Sciences': 'Sciences de la décision', 'Earth and Planetary Sciences': 'Terre et planètes', 'Economics, Econometrics and Finance': 'Économie et finance', 'Energy': 'Énergie', 'Engineering': 'Ingénierie', 'Environmental Science': 'Environnement', 'Immunology and Microbiology': 'Immunologie et microbiologie', 'Materials Science': 'Matériaux', 'Mathematics': 'Mathématiques', 'Medicine': 'Médecine', 'Neuroscience': 'Neurosciences', 'Nursing': 'Soins infirmiers', 'Pharmacology, Toxicology and Pharmaceutics': 'Pharmacologie', 'Physics and Astronomy': 'Physique et astronomie', 'Psychology': 'Psychologie', 'Social Sciences': 'Sciences sociales', 'Veterinary': 'Médecine vétérinaire', 'Dentistry': 'Dentaire', 'Health Professions': 'Professions de santé', 'Physical Sciences': 'Sciences physiques', 'Life Sciences': 'Sciences du vivant', 'Health Sciences': 'Santé' };
const fr = n => FR[n] || n;

// Les compteurs aberrants (erreurs de classement d'OpenAlex) sont plafonnés au 99e centile.
const sorted = s.topics.map(t => t.works).sort((a, b) => a - b), cap = sorted[Math.floor(sorted.length * 0.99)];
const dIds = Object.keys(s.domains), fIds = Object.keys(s.fields).sort((a, b) => s.fields[a].domain.localeCompare(s.fields[b].domain)), sIds = Object.keys(s.subfields);
const sIdx = Object.fromEntries(sIds.map((id, i) => [id, i])), fIdx = Object.fromEntries(fIds.map((id, i) => [id, i]));
const sw = sIds.map(() => 0), sn = sIds.map(() => 0);
for (const t of s.topics) { sw[sIdx[t.subfield]] += Math.min(t.works, cap); sn[sIdx[t.subfield]]++; }

// Force d'un lien = articles partagés, rapportés à la taille des deux sous-disciplines.
const pair = new Map();
for (const [a, b, c] of s.subfieldLinks) { const i = sIdx[a], j = sIdx[b]; if (i == null || j == null) continue; const k = i < j ? i + '-' + j : j + '-' + i; pair.set(k, (pair.get(k) || 0) + c); }
const per = sIds.map(() => []);
for (const [k, c] of pair) { const [i, j] = k.split('-').map(Number), w = c / Math.sqrt((sw[i] + 1) * (sw[j] + 1)); per[i].push([j, w]); per[j].push([i, w]); }
const linkSet = new Map();
per.forEach((l, i) => l.sort((a, b) => b[1] - a[1]).slice(0, 6).forEach(([j, w]) => linkSet.set(i < j ? i + '-' + j : j + '-' + i, w)));
const links = [...linkSet].map(([k, w]) => [...k.split('-').map(Number), w]), wmax = Math.max(...links.map(l => l[2]));

let seed = 7; const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const gauss = () => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());

// Placement par forces : les liens rapprochent, tout le monde se repousse un peu.
const pos = sIds.map(id => { const a = fIdx[s.subfields[id].field] / fIds.length * 2 * Math.PI; return [Math.cos(a) + gauss() * .12, Math.sin(a) + gauss() * .12]; });
const IT = 600;
for (let it = 0; it < IT; it++) {
  const f = pos.map(() => [0, 0]);
  for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) { const dx = pos[i][0] - pos[j][0], dy = pos[i][1] - pos[j][1], d2 = dx * dx + dy * dy + 1e-4, k = 0.0016 / d2; f[i][0] += dx * k; f[i][1] += dy * k; f[j][0] -= dx * k; f[j][1] -= dy * k; }
  for (const [i, j, w] of links) { const dx = pos[j][0] - pos[i][0], dy = pos[j][1] - pos[i][1], k = 0.09 * Math.sqrt(w / wmax); f[i][0] += dx * k; f[i][1] += dy * k; f[j][0] -= dx * k; f[j][1] -= dy * k; }
  const lim = 0.06 * (1 - it / IT) + 0.002;
  pos.forEach((p, i) => { f[i][0] -= p[0] * 0.012; f[i][1] -= p[1] * 0.012; const m = Math.hypot(f[i][0], f[i][1]), c = m > lim ? lim / m : 1; p[0] += f[i][0] * c; p[1] += f[i][1] * c; });
}
const rmax = Math.max(...pos.map(p => Math.hypot(p[0], p[1])));
pos.forEach(p => { p[0] /= rmax * 1.08; p[1] /= rmax * 1.08; });
assert(pos.every(p => Number.isFinite(p[0]) && Number.isFinite(p[1])), 'position invalide');

const r3 = v => Math.round(v * 1000) / 1000;
const T = [];
for (const t of s.topics) { const i = sIdx[t.subfield], r = 0.011 * Math.sqrt(sn[i]); T.push(r3(pos[i][0] + gauss() * r), r3(pos[i][1] + gauss() * r), t.works, i, t.name); }
assert.equal(T.length, s.topics.length * 5);

const DATA = {
  fetched: s.fetched, cap,
  D: dIds.map(d => fr(s.domains[d])),
  F: fIds.map(f => ({ n: fr(s.fields[f].name), d: dIds.indexOf(s.fields[f].domain) })),
  S: sIds.map((id, i) => ({ n: s.subfields[id].name, f: fIdx[s.subfields[id].field], x: r3(pos[i][0]), y: r3(pos[i][1]), w: sw[i] })),
  L: links.map(([i, j]) => [i, j]), T
};
// Chaque page sort deux fois : le fragment (pour un aperçu Claude) et la page complète dans docs/ (pour GitHub Pages).
const HEAD = '<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>';
mkdirSync('docs', { recursive: true });
for (const [tpl, out, site] of [['directions.tpl.html', 'directions.html', 'docs/directions.html'], ['carte.tpl.html', 'carte-de-l-inconnu.html', 'docs/index.html']]) { const page = readFileSync(tpl, 'utf8').replace('/*DATA*/null', () => JSON.stringify(DATA)); writeFileSync(out, page); writeFileSync(site, HEAD + page); }
console.log(`plafond ${cap} articles, ${links.length} liens gardés, ${T.length / 5} sujets placés`);
