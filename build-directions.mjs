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
const IT = 600, COH = Number(process.env.COH ?? 0.08);
for (let it = 0; it < IT; it++) {
  const f = pos.map(() => [0, 0]);
  for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) { const dx = pos[i][0] - pos[j][0], dy = pos[i][1] - pos[j][1], d2 = dx * dx + dy * dy + 1e-4, k = 0.0016 / d2; f[i][0] += dx * k; f[i][1] += dy * k; f[j][0] -= dx * k; f[j][1] -= dy * k; }
  for (const [i, j, w] of links) { const dx = pos[j][0] - pos[i][0], dy = pos[j][1] - pos[i][1], k = 0.09 * Math.sqrt(w / wmax); f[i][0] += dx * k; f[i][1] += dy * k; f[j][0] -= dx * k; f[j][1] -= dy * k; }
  // Cohésion : chaque sous-discipline est aussi attirée par le centre de sa discipline. C'est un choix éditorial (la hiérarchie d'OpenAlex), à côté de la mesure des liens.
  if (COH > 0) { const cx = fIds.map(() => [0, 0, 0]); pos.forEach((p, i) => { const c = cx[fIdx[s.subfields[sIds[i]].field]]; c[0] += p[0]; c[1] += p[1]; c[2]++; });
    pos.forEach((p, i) => { const c = cx[fIdx[s.subfields[sIds[i]].field]]; f[i][0] += (c[0] / c[2] - p[0]) * COH; f[i][1] += (c[1] / c[2] - p[1]) * COH; }); }
  const lim = 0.06 * (1 - it / IT) + 0.002;
  pos.forEach((p, i) => { f[i][0] -= p[0] * 0.012; f[i][1] -= p[1] * 0.012; const m = Math.hypot(f[i][0], f[i][1]), c = m > lim ? lim / m : 1; p[0] += f[i][0] * c; p[1] += f[i][1] * c; });
}
const rmax = Math.max(...pos.map(p => Math.hypot(p[0], p[1])));
pos.forEach(p => { p[0] /= rmax * 1.08; p[1] /= rmax * 1.08; });
assert(pos.every(p => Number.isFinite(p[0]) && Number.isFinite(p[1])), 'position invalide');

// Contrôle de la disposition : parmi les 5 sous-disciplines les plus proches d'une sous-discipline, quelle part est du même domaine / de la même discipline ?
{
  const dom = sIds.map(id => s.fields[s.subfields[id].field].domain), fld = sIds.map(id => s.subfields[id].field);
  let pd = 0, pf = 0; const bad = [];
  pos.forEach((p, i) => { const nn = pos.map((o, j) => [Math.hypot(o[0] - p[0], o[1] - p[1]), j]).filter(e => e[1] !== i).sort((a, b) => a[0] - b[0]).slice(0, 5).map(e => e[1]);
    const a = nn.filter(j => dom[j] === dom[i]).length / 5; pd += a; pf += nn.filter(j => fld[j] === fld[i]).length / 5; bad.push([a, s.subfields[sIds[i]].name, s.domains[dom[i]]]); });
  console.log(`pureté : ${Math.round(pd / pos.length * 100)} % de voisines du même domaine, ${Math.round(pf / pos.length * 100)} % de la même discipline`);
  if (process.argv.includes('--diag')) bad.sort((a, b) => a[0] - b[0]).slice(0, 14).forEach(b => console.log(`  ${Math.round(b[0] * 100)} %  ${b[1]} (${b[2]})`));
}

const r3 = v => Math.round(v * 1000) / 1000;
const T = [];
for (const t of s.topics) { const i = sIdx[t.subfield], r = 0.011 * Math.sqrt(sn[i]); T.push(r3(pos[i][0] + gauss() * r), r3(pos[i][1] + gauss() * r), t.works, i, t.name); }
assert.equal(T.length, s.topics.length * 5);

// La densité de recherche, calculée comme sur la carte (même noyau, même seuil), pour savoir où s'arrête le connu.
const G = 300, EXT = 1.1, LMAXB = Math.log10(cap), nrmB = w => Math.max(0, Math.min(1, (Math.log10(Math.max(w, 1)) - 2) / (LMAXB - 2)));
const dg = new Float32Array(G * G);
for (let i = 0; i < T.length; i += 5) { const v = nrmB(T[i + 2]), wt = 0.05 + v * v, cx = G / 2 + T[i] * G / 2 / EXT, cy = G / 2 + T[i + 1] * G / 2 / EXT;
  for (let dy = -7; dy <= 7; dy++) for (let dx = -7; dx <= 7; dx++) { const gx = Math.round(cx) + dx, gy = Math.round(cy) + dy; if (gx < 0 || gy < 0 || gx >= G || gy >= G) continue; const ex = gx - cx, ey = gy - cy; dg[gy * G + gx] += wt * Math.exp(-(ex * ex + ey * ey) / (2 * 2.4 * 2.4)); } }
const dmax = Math.max(...dg), EDGE = Math.pow(1 / 8, 1 / 0.42); // premier niveau visible du relief
const dens = (x, y) => { const fx = G / 2 + x * G / 2 / EXT, fy = G / 2 + y * G / 2 / EXT; if (fx < 0 || fy < 0 || fx >= G - 1 || fy >= G - 1) return 0; const x0 = fx | 0, y0 = fy | 0, tx = fx - x0, ty = fy - y0; return ((dg[y0 * G + x0] * (1 - tx) + dg[y0 * G + x0 + 1] * tx) * (1 - ty) + (dg[(y0 + 1) * G + x0] * (1 - tx) + dg[(y0 + 1) * G + x0 + 1] * tx) * ty) / dmax; };
// Du point (x,y), distance jusqu'au bord du connu dans la direction a, ou null si le vide n'est pas franc.
function toEdge(x, y, a) { for (let d = 0.004; d < 0.45; d += 0.004) { if (dens(x + Math.cos(a) * d, y + Math.sin(a) * d) >= EDGE) continue; let dark = true; for (let e = 0.006; e <= 0.036; e += 0.006) if (dens(x + Math.cos(a) * (d + e), y + Math.sin(a) * (d + e)) >= EDGE * 1.5) dark = false; if (dark) return d; } return null; }

// Les questions ouvertes. Une question qui touche une seule région se pose au bord du connu, tendue vers le noir.
// Une question qui relie des régions éloignées reste entre elles, dans le vide central : c'est elle qui fait le pont.
const SPREAD_MIN = 0.3;
const qs = JSON.parse(readFileSync('questions.json')), byName = Object.fromEntries(sIds.map((id, i) => [s.subfields[id].name, i]));
assert.equal(Object.keys(byName).length, sIds.length, 'noms de sous-disciplines en double');
const Q = qs.questions.map(q => {
  const subs = q.subs.map(n => { assert(n in byName, `sous-discipline inconnue : ${n} (${q.id})`); return byName[n]; });
  assert(qs.sources[q.src], `source inconnue : ${q.src}`);
  const bx = subs.reduce((a, j) => a + pos[j][0], 0) / subs.length, by = subs.reduce((a, j) => a + pos[j][1], 0) / subs.length;
  const spread = Math.sqrt(subs.reduce((a, j) => a + (pos[j][0] - bx) ** 2 + (pos[j][1] - by) ** 2, 0) / subs.length), nf = new Set(subs.map(j => s.subfields[sIds[j]].field)).size, t = nf >= 3 || spread > SPREAD_MIN;
  let x = bx, y = by;
  if (!t && dens(bx, by) >= EDGE) { let best = null; for (let k = 0; k < 48; k++) { const a = k / 48 * 2 * Math.PI, d = toEdge(bx, by, a); if (d != null && (!best || d < best.d)) best = { d, a }; } if (best) { x = bx + Math.cos(best.a) * best.d; y = by + Math.sin(best.a) * best.d; } }
  if (process.argv.includes('--diag')) console.log(`  ${t ? 'TRANSVERSALE' : 'bord        '} écart ${spread.toFixed(2)}  ${q.id}`);
  return { id: q.id, q: q.q, c: q.ctx, s: q.src, st: q.status || 'ouverte', n: q.note || '', subs, t, x, y };
});
assert.equal(new Set(Q.map(q => q.id)).size, Q.length, 'identifiants de questions en double');
// Deux anneaux superposés seraient illisibles : on les écarte du minimum nécessaire.
for (let it = 0; it < 60; it++) for (let i = 0; i < Q.length; i++) for (let j = i + 1; j < Q.length; j++) {
  let dx = Q[j].x - Q[i].x, dy = Q[j].y - Q[i].y, d = Math.hypot(dx, dy); if (d >= 0.045) continue;
  if (d < 1e-6) { dx = Math.cos(i + j); dy = Math.sin(i + j); d = 1; }
  const p = (0.045 - Math.min(d, 0.045)) / 2 / d; Q[i].x -= dx * p; Q[i].y -= dy * p; Q[j].x += dx * p; Q[j].y += dy * p;
}
Q.forEach(q => { q.x = r3(q.x); q.y = r3(q.y); });

const DATA = {
  fetched: s.fetched, cap,
  D: dIds.map(d => fr(s.domains[d])),
  F: fIds.map(f => ({ n: fr(s.fields[f].name), d: dIds.indexOf(s.fields[f].domain) })),
  S: sIds.map((id, i) => ({ n: s.subfields[id].name, f: fIdx[s.subfields[id].field], x: r3(pos[i][0]), y: r3(pos[i][1]), w: sw[i] })),
  L: links.map(([i, j]) => [i, j]), T, Q, SRC: qs.sources
};
// Chaque page sort deux fois : le fragment (pour un aperçu Claude) et la page complète dans docs/ (pour GitHub Pages).
const HEAD = '<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>';
mkdirSync('docs', { recursive: true });
for (const [tpl, out, site] of [['directions.tpl.html', 'directions.html', 'docs/directions.html'], ['carte.tpl.html', 'carte-de-l-inconnu.html', 'docs/index.html']]) { const page = readFileSync(tpl, 'utf8').replace('/*DATA*/null', () => JSON.stringify(DATA)); writeFileSync(out, page); writeFileSync(site, HEAD + page); }
console.log(`plafond ${cap} articles, ${links.length} liens gardés, ${T.length / 5} sujets placés, ${Q.length} questions`);
