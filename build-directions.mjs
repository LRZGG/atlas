// Calcule la position de chaque sous-discipline et de chaque sujet à partir des liens mesurés,
// puis écrit directions.html (le gabarit + les données). Usage : node build-directions.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
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
const IT = 600, COH = Number(process.env.COH ?? 0.08), GRAV = Number(process.env.GRAV ?? 0.012), HOLE = Number(process.env.HOLE ?? 0.5);
for (let it = 0; it < IT; it++) {
  const f = pos.map(() => [0, 0]);
  for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) { const dx = pos[i][0] - pos[j][0], dy = pos[i][1] - pos[j][1], d2 = dx * dx + dy * dy + 1e-4, k = 0.0016 / d2; f[i][0] += dx * k; f[i][1] += dy * k; f[j][0] -= dx * k; f[j][1] -= dy * k; }
  for (const [i, j, w] of links) { const dx = pos[j][0] - pos[i][0], dy = pos[j][1] - pos[i][1], k = 0.09 * Math.sqrt(w / wmax); f[i][0] += dx * k; f[i][1] += dy * k; f[j][0] -= dx * k; f[j][1] -= dy * k; }
  // Cohésion : chaque sous-discipline est aussi attirée par le centre de sa discipline. C'est un choix éditorial (la hiérarchie d'OpenAlex), à côté de la mesure des liens.
  if (COH > 0) { const cx = fIds.map(() => [0, 0, 0]); pos.forEach((p, i) => { const c = cx[fIdx[s.subfields[sIds[i]].field]]; c[0] += p[0]; c[1] += p[1]; c[2]++; });
    pos.forEach((p, i) => { const c = cx[fIdx[s.subfields[sIds[i]].field]]; f[i][0] += (c[0] / c[2] - p[0]) * COH; f[i][1] += (c[1] / c[2] - p[1]) * COH; }); }
  const lim = 0.06 * (1 - it / IT) + 0.002;
  pos.forEach((p, i) => { f[i][0] -= p[0] * GRAV; f[i][1] -= p[1] * GRAV; const m = Math.hypot(f[i][0], f[i][1]), c = m > lim ? lim / m : 1; p[0] += f[i][0] * c; p[1] += f[i][1] * c; });
}
const rmax = Math.max(...pos.map(p => Math.hypot(p[0], p[1])));
pos.forEach(p => { p[0] /= rmax * 1.08; p[1] /= rmax * 1.08; });
assert(pos.every(p => Number.isFinite(p[0]) && Number.isFinite(p[1])), 'position invalide');

// Projection (choix de présentation, pas une mesure) : on dilate le centre autour du centre de l'anneau pour que le vide entre les disciplines ait la place de se lire.
// La transformation est radiale et croissante : l'ordre autour du centre et le voisinage sont conservés, seules les distances au centre changent.
{
  const cx = pos.reduce((a, p) => a + p[0], 0) / pos.length, cy = pos.reduce((a, p) => a + p[1], 0) / pos.length;
  const rr = pos.map(p => Math.hypot(p[0] - cx, p[1] - cy)), r0 = Math.min(...rr), r1 = Math.max(...rr);
  pos.forEach((p, i) => { const a = Math.atan2(p[1] - cy, p[0] - cx), r = (HOLE + (rr[i] - r0) / (r1 - r0) * (1 - HOLE)) * 0.926; p[0] = Math.cos(a) * r; p[1] = Math.sin(a) * r; });
}

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

// Placement des sujets d'après leurs liens mesurés (liens-sujets.json, produit par fetch-liens-sujets.mjs) :
// chaque sujet est tiré vers ceux dont il partage le plus d'articles, et retenu par une attache faible à sa sous-discipline, qui garde la structure d'ensemble.
// Sans ce fichier, les sujets restent tirés au hasard autour de leur sous-discipline (position non mesurée).
const LIENS_F = process.env.LIENS || 'liens-sujets.json';
if (existsSync(LIENS_F)) {
  const liens = JSON.parse(readFileSync(LIENS_F, 'utf8')).liens, n = s.topics.length, idx = new Map(s.topics.map((t, i) => [+t.id.replace('T', ''), i]));
  const X = new Float64Array(n), Y = new Float64Array(n), AX = new Float64Array(n), AY = new Float64Array(n);
  s.topics.forEach((t, i) => { X[i] = T[i * 5]; Y[i] = T[i * 5 + 1]; AX[i] = pos[sIdx[t.subfield]][0]; AY[i] = pos[sIdx[t.subfield]][1]; });
  const tops = k => (liens[k] || []).filter(([j]) => idx.has(j));
  // Arêtes : les 8 sujets les plus liés à chaque sujet, pondérés par leur part dans ses liens (robuste aux compteurs aberrants), puis symétrisées.
  const E = new Map(); let nm = 0;
  for (const k in liens) { const i = idx.get(+k); if (i == null) continue; const top = tops(k).slice(0, 8), tot = top.reduce((a, l) => a + l[1], 0); if (!tot) continue; nm++;
    for (const [j, c] of top) { const a = idx.get(j), key = i < a ? i * n + a : a * n + i; E.set(key, (E.get(key) || 0) + c / tot); } }
  const edges = [...E].map(([k, w]) => [Math.floor(k / n), k % n, w]);
  const d5 = () => { let a = 0, m = 0; for (const k in liens) { const i = idx.get(+k); if (i == null) continue; for (const [j] of tops(k).slice(0, 5)) { const b = idx.get(j); a += Math.hypot(X[i] - X[b], Y[i] - Y[b]); m++; } } return m ? a / m : 0; };
  // Contrôle sans triche : les liens de rang 9 à 13 ne servent pas au placement. S'ils se rapprochent aussi, c'est que les positions reflètent une vraie structure.
  const dh = () => { let a = 0, m = 0; for (const k in liens) { const i = idx.get(+k); if (i == null) continue; for (const [j] of tops(k).slice(8, 13)) { const b = idx.get(j); a += Math.hypot(X[i] - X[b], Y[i] - Y[b]); m++; } } return m ? a / m : 0; };
  const avantH = dh();
  let alea = 0; for (let k = 0; k < 20000; k++) { const a = Math.floor(rnd() * n), b = Math.floor(rnd() * n); alea += Math.hypot(X[a] - X[b], Y[a] - Y[b]); } alea /= 20000;
  const avant = d5();
  const KA = Number(process.env.KA ?? 0.12), KANC = Number(process.env.KANC ?? 0.4), R0 = Number(process.env.R0 ?? 0.012), KR = 0.4, IT2 = 250, fx = new Float64Array(n), fy = new Float64Array(n);
  for (let it = 0; it < IT2; it++) {
    fx.fill(0); fy.fill(0);
    for (const [a, b, w] of edges) { const dx = X[b] - X[a], dy = Y[b] - Y[a]; fx[a] += KA * w * dx; fy[a] += KA * w * dy; fx[b] -= KA * w * dx; fy[b] -= KA * w * dy; }
    for (let i = 0; i < n; i++) { fx[i] += KANC * (AX[i] - X[i]); fy[i] += KANC * (AY[i] - Y[i]); }
    const grid = new Map(); for (let i = 0; i < n; i++) { const c = Math.floor(X[i] / R0) * 100003 + Math.floor(Y[i] / R0); (grid.get(c) || grid.set(c, []).get(c)).push(i); }
    for (let i = 0; i < n; i++) { const cx = Math.floor(X[i] / R0), cy = Math.floor(Y[i] / R0);
      for (let gx = -1; gx <= 1; gx++) for (let gy = -1; gy <= 1; gy++) for (const j of grid.get((cx + gx) * 100003 + cy + gy) || []) { if (j <= i) continue; let dx = X[i] - X[j], dy = Y[i] - Y[j], d = Math.hypot(dx, dy); if (d >= R0) continue; if (d < 1e-9) { dx = rnd() - 0.5; dy = rnd() - 0.5; d = Math.hypot(dx, dy); } const p = KR * (R0 - d) / d; fx[i] += dx * p; fy[i] += dy * p; fx[j] -= dx * p; fy[j] -= dy * p; } }
    const lim = 0.01 * (1 - it / IT2) + 0.0005;
    for (let i = 0; i < n; i++) { const m = Math.hypot(fx[i], fy[i]), c = m > lim ? lim / m : 1; X[i] += fx[i] * c; Y[i] += fy[i] * c; }
  }
  for (let i = 0; i < n; i++) { T[i * 5] = r3(X[i]); T[i * 5 + 1] = r3(Y[i]); }
  console.log(`sujets placés d'après leurs liens : ${nm} sujets mesurés sur ${n} ; distance moyenne aux 5 sujets les plus liés : ${avant.toFixed(3)} avant, ${d5().toFixed(3)} après (deux sujets au hasard : ${alea.toFixed(3)})\n  contrôle sur les liens de rang 9 à 13, non utilisés pour le placement : ${avantH.toFixed(3)} avant, ${dh().toFixed(3)} après`);
}

// La densité de recherche, calculée comme sur la carte (même noyau, même seuil), pour savoir où s'arrête le connu.
const G = 300, EXT = 1.1, LMAXB = Math.log10(cap), nrmB = w => Math.max(0, Math.min(1, (Math.log10(Math.max(w, 1)) - 2) / (LMAXB - 2)));
// Réglages du relief, partagés avec la carte : largeur du noyau (unités de la carte), exponent de compression, premier niveau visible.
const RL = { sig: Number(process.env.SIG ?? 0.035), gam: Number(process.env.GAM ?? 0.42), b0: Number(process.env.B0 ?? 2) };
const SC = RL.sig * G / (2 * EXT), RR = Math.ceil(2.9 * SC);
const dg = new Float32Array(G * G);
for (let i = 0; i < T.length; i += 5) { const v = nrmB(T[i + 2]), wt = 0.05 + v * v, cx = G / 2 + T[i] * G / 2 / EXT, cy = G / 2 + T[i + 1] * G / 2 / EXT;
  for (let dy = -RR; dy <= RR; dy++) for (let dx = -RR; dx <= RR; dx++) { const gx = Math.round(cx) + dx, gy = Math.round(cy) + dy; if (gx < 0 || gy < 0 || gx >= G || gy >= G) continue; const ex = gx - cx, ey = gy - cy; dg[gy * G + gx] += wt * Math.exp(-(ex * ex + ey * ey) / (2 * SC * SC)); } }
const dmax = Math.max(...dg), EDGE = Math.pow(RL.b0 / 8, 1 / RL.gam); // premier niveau visible du relief (les îlots plus faibles ne sont pas dessinés)
// Le vide central : le plus grand disque sans relief visible, cherché autour du centre.
const dense = []; for (let gy = 0; gy < G; gy += 2) for (let gx = 0; gx < G; gx += 2) if (dg[gy * G + gx] / dmax >= EDGE) dense.push([(gx - G / 2) * 2 * EXT / G, (gy - G / 2) * 2 * EXT / G]);
let hole = { x: 0, y: 0, r: 0 };
for (let x = -0.5; x <= 0.5; x += 0.025) for (let y = -0.5; y <= 0.5; y += 0.025) { if (x * x + y * y > 0.35 * 0.35) continue; let m = Infinity; for (const p of dense) { const d = (p[0] - x) ** 2 + (p[1] - y) ** 2; if (d < m) m = d; } m = Math.sqrt(m); if (m > hole.r) hole = { x: r3(x), y: r3(y), r: r3(m) }; }
console.log(`vide central : rayon ${hole.r}, centre (${hole.x}, ${hole.y})`);
const dens = (x, y) => { const fx = G / 2 + x * G / 2 / EXT, fy = G / 2 + y * G / 2 / EXT; if (fx < 0 || fy < 0 || fx >= G - 1 || fy >= G - 1) return 0; const x0 = fx | 0, y0 = fy | 0, tx = fx - x0, ty = fy - y0; return ((dg[y0 * G + x0] * (1 - tx) + dg[y0 * G + x0 + 1] * tx) * (1 - ty) + (dg[(y0 + 1) * G + x0] * (1 - tx) + dg[(y0 + 1) * G + x0 + 1] * tx) * ty) / dmax; };
// Du point (x,y), distance jusqu'au bord du connu dans la direction a, ou null si le vide n'est pas franc.
function toEdge(x, y, a) { for (let d = 0.004; d < 0.45; d += 0.004) { if (dens(x + Math.cos(a) * d, y + Math.sin(a) * d) >= EDGE) continue; let dark = true; for (let e = 0.006; e <= 0.036; e += 0.006) if (dens(x + Math.cos(a) * (d + e), y + Math.sin(a) * (d + e)) >= EDGE * 1.5) dark = false; if (dark) return d; } return null; }

// Les questions ouvertes. Une question qui touche une seule région se pose au bord du connu, tendue vers le noir.
// Une question qui relie des régions éloignées reste entre elles, dans le vide central : c'est elle qui fait le pont.
const FI = existsSync('fiches.json') ? JSON.parse(readFileSync('fiches.json', 'utf8')).fiches : {};
const SPREAD_MIN = 0.4; // coupure naturelle dans la répartition des écarts (0,33 puis 0,43)
const qs = JSON.parse(readFileSync('questions.json')), byName = Object.fromEntries(sIds.map((id, i) => [s.subfields[id].name, i]));
assert.equal(Object.keys(byName).length, sIds.length, 'noms de sous-disciplines en double');
const Q = qs.questions.map(q => {
  const subs = q.subs.map(n => { assert(n in byName, `sous-discipline inconnue : ${n} (${q.id})`); return byName[n]; });
  assert(qs.sources[q.src], `source inconnue : ${q.src}`);
  const bx = subs.reduce((a, j) => a + pos[j][0], 0) / subs.length, by = subs.reduce((a, j) => a + pos[j][1], 0) / subs.length;
  const spread = Math.sqrt(subs.reduce((a, j) => a + (pos[j][0] - bx) ** 2 + (pos[j][1] - by) ** 2, 0) / subs.length), nf = new Set(subs.map(j => s.subfields[sIds[j]].field)).size, nd = new Set(subs.map(j => s.fields[s.subfields[sIds[j]].field].domain)).size, t = (nf >= 3 && nd >= 2) || spread > SPREAD_MIN;
  let x = bx, y = by;
  if (!t && dens(bx, by) >= EDGE) { let best = null; for (let k = 0; k < 48; k++) { const a = k / 48 * 2 * Math.PI, d = toEdge(bx, by, a); if (d != null && (!best || d < best.d)) best = { d, a }; } if (best) { x = bx + Math.cos(best.a) * best.d; y = by + Math.sin(best.a) * best.d; } }
  // Le texte « terra incognita » occupe une bande au centre du vide : une question transversale se pose juste au-dessus ou au-dessous, pas dessus.
  if (t) { const a = hole.r * 0.8, b = hole.r * 0.14; if (((x - hole.x) / a) ** 2 + ((y - hole.y) / b) ** 2 < 1) y = hole.y + (y >= hole.y ? 1 : -1) * b * 1.3; }
  if (process.argv.includes('--diag')) console.log(`  ${t ? 'TRANSVERSALE' : 'bord        '} écart ${spread.toFixed(2)}  ${q.id}`);
  // La fiche détaillée (s'il y en a une) : texte écrit à la main dans questions.json, extrait Wikipédia et références vérifiées par fetch-fiches.mjs.
  const fi = q.fiche && FI[q.id]; assert(!q.fiche || fi, `fiche non téléchargée pour ${q.id} : lancer node fetch-fiches.mjs`);
  // Par langue : le texte de la fiche. L'extrait Wikipédia vient de fiches.json (par langue aussi), les références sont communes aux deux langues.
  const f = q.fiche ? { w: fi.w, r: fi.r } : null;
  if (f) for (const l of ['fr', 'en']) if (q.fiche[l]) f[l] = { s: q.fiche[l].savoir, i: q.fiche[l].ignore, d: q.fiche[l].dur, e: q.fiche[l].enjeu, c: q.fiche[l].commencer };
  return { id: q.id, qq: q.q, nmm: q.nom, cc: q.ctx, no: q.note || null, s: q.src, st: q.status || 'ouverte', subs, t, x, y, f };
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
  fetched: s.fetched, cap, hole, edge: EDGE, rl: RL,
  D: dIds.map(d => ({ fr: fr(s.domains[d]), en: s.domains[d] })),
  F: fIds.map(f => ({ nn: { fr: fr(s.fields[f].name), en: s.fields[f].name }, d: dIds.indexOf(s.fields[f].domain) })),
  S: sIds.map((id, i) => ({ n: s.subfields[id].name, f: fIdx[s.subfields[id].field], x: r3(pos[i][0]), y: r3(pos[i][1]), w: sw[i] })),
  L: links.map(([i, j]) => [i, j]), T, Q, SRC: qs.sources,
  TXT: JSON.parse(readFileSync('textes.json', 'utf8'))
};
// La carte sort en trois pages pour GitHub Pages : la racine, qui détecte la langue du navigateur (anglais par défaut), puis /fr/ et /en/ qui la fixent
// (un lien partagé garde sa langue, et chaque page a sa langue déclarée pour les moteurs de recherche). Le fragment sans enveloppe sert d'aperçu.
// La page de comparaison des trois directions garde l'ancienne forme des données (noms français).
const BASE = process.env.BASE || 'https://lorenzo1208.github.io/atlas';
const esc = t => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const STYLE = '<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>';
function head(lang, path, forced) {
  const t = DATA.TXT[lang], url = BASE + path, alt = [['fr', '/fr/'], ['en', '/en/'], ['x-default', '/']].map(([h, p]) => `<link rel="alternate" hreflang="${h}" href="${BASE}${p}">`).join('');
  return `<!doctype html><html lang="${lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="description" content="${esc(t.desc)}"><link rel="canonical" href="${url}">${alt}<meta property="og:type" content="website"><meta property="og:title" content="${esc(t.titre)}"><meta property="og:description" content="${esc(t.desc)}"><meta property="og:url" content="${url}"><meta name="twitter:card" content="summary">${STYLE}${forced ? `<script>window.__LANG="${lang}"</script>` : ''}`;
}
const carte = readFileSync('carte.tpl.html', 'utf8').replace('/*DATA*/null', () => JSON.stringify(DATA));
const titre = lang => carte.replace(/<title>[^<]*<\/title>/, `<title>${esc(DATA.TXT[lang].titre)}</title>`);
const LEG = { ...DATA, D: DATA.D.map(d => d.fr), F: DATA.F.map(f => ({ n: f.nn.fr, d: f.d })) };
const dirs = readFileSync('directions.tpl.html', 'utf8').replace('/*DATA*/null', () => JSON.stringify(LEG));
for (const d of ['docs', 'docs/fr', 'docs/en']) mkdirSync(d, { recursive: true });
writeFileSync('carte-de-l-inconnu.html', titre('en'));
writeFileSync('directions.html', dirs);
writeFileSync('docs/directions.html', '<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' + STYLE + dirs);
writeFileSync('docs/index.html', head('en', '/', false) + titre('en'));
writeFileSync('docs/fr/index.html', head('fr', '/fr/', true) + titre('fr'));
writeFileSync('docs/en/index.html', head('en', '/en/', true) + titre('en'));
writeFileSync('docs/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);
writeFileSync('docs/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['/', '/fr/', '/en/'].map(p => `  <url><loc>${BASE}${p}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log(`plafond ${cap} articles, ${links.length} liens gardés, ${T.length / 5} sujets placés, ${Q.length} questions`);
