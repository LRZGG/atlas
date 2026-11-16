// Socle commun des prototypes (inséré dans proto-planche.html et proto-chambre.html par build-proto.mjs).
// Données réelles de la carte : sujets, sous-disciplines, liens, questions. Fournit : vue (zoom, déplacement), relief calculé (densité + courbes de niveau),
// recherche du sujet le plus proche, fiche de question. Chaque page définit `hooks` (survol, clic) et sa fonction `draw`.
const $ = id => document.getElementById(id), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const { T, S, F, D, L, Q, SRC } = DATA, N = T.length / 5;
const cv = $('cv'), ctx = cv.getContext('2d');
let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
for (let i = 0; i < N; i++) { x0 = Math.min(x0, T[i * 5]); x1 = Math.max(x1, T[i * 5]); y0 = Math.min(y0, T[i * 5 + 1]); y1 = Math.max(y1, T[i * 5 + 1]); }
const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, ext = Math.max(x1 - x0, y1 - y0);
let W = 0, H = 0, DPR = 1, s0 = 1, tgt = null; const view = { x: 0, y: 0, k: 1 };
function resize() { const r = cv.getBoundingClientRect(); DPR = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); s0 = Math.min(W, H) * .84 / ext; }
const toScreen = (wx, wy) => [W / 2 + (wx - mx - view.x) * s0 * view.k, H / 2 + (wy - my - view.y) * s0 * view.k];
const toWorld = (px, py) => [(px - W / 2) / (s0 * view.k) + mx + view.x, (py - H / 2) / (s0 * view.k) + my + view.y];
function zoomAt(px, py, f) { const [wx, wy] = toWorld(px, py); view.k = clamp(view.k * f, .8, 14); view.x = wx - mx - (px - W / 2) / (s0 * view.k); view.y = wy - my - (py - H / 2) / (s0 * view.k); tgt = null; }
const flyTo = (wx, wy, k) => { tgt = { x: wx - mx, y: wy - my, k }; };
function stepView() { if (!tgt) return; view.x += (tgt.x - view.x) * .16; view.y += (tgt.y - view.y) * .16; view.k += (tgt.k - view.k) * .16; if (Math.abs(tgt.k - view.k) < .004 && Math.abs(tgt.x - view.x) < .0004) tgt = null; }
// Centre de chaque discipline (moyenne pondérée par le nombre d'articles) et voisinage des sous-disciplines.
const FC = F.map(() => ({ x: 0, y: 0, w: 0 })); for (let i = 0; i < N; i++) { const f = FC[S[T[i * 5 + 3]].f], w = T[i * 5 + 2] + 1; f.x += T[i * 5] * w; f.y += T[i * 5 + 1] * w; f.w += w; } FC.forEach(f => { f.x /= f.w; f.y /= f.w; });
const ADJ = S.map(() => []); L.forEach(([i, j]) => { ADJ[i].push(j); ADJ[j].push(i); });
// Relief : densité de recherche (somme de noyaux gaussiens, comme sur la carte), ramenée à 8 niveaux avec la même compression (0,42).
const GN = 220, PAD = .06, gx0 = x0 - PAD, gy0 = y0 - PAD, GW = x1 - x0 + 2 * PAD, GH = y1 - y0 + 2 * PAD, CELLW = GW / GN, CELLH = GH / GN, SIG = .035;
const G = new Float32Array(GN * GN);
for (let i = 0; i < N; i++) {
  const cx = (T[i * 5] - gx0) / CELLW, cy = (T[i * 5 + 1] - gy0) / CELLH, wt = Math.log10(1 + T[i * 5 + 2]), rx = Math.ceil(3 * SIG / CELLW), ry = Math.ceil(3 * SIG / CELLH);
  for (let j = Math.max(0, Math.floor(cy) - ry); j <= Math.min(GN - 1, Math.floor(cy) + ry); j++) for (let k = Math.max(0, Math.floor(cx) - rx); k <= Math.min(GN - 1, Math.floor(cx) + rx); k++) { const dx = (k - cx) * CELLW, dy = (j - cy) * CELLH; G[j * GN + k] += wt * Math.exp(-(dx * dx + dy * dy) / (2 * SIG * SIG)); }
}
let gmax = 0; for (const v of G) gmax = Math.max(gmax, v);
const V = G.map(v => Math.pow(v / gmax, .42) * 8);
function contours(levels) {
  const out = levels.map(() => []);
  for (let j = 0; j < GN - 1; j++) for (let i = 0; i < GN - 1; i++) {
    const a = V[j * GN + i], b = V[j * GN + i + 1], c = V[(j + 1) * GN + i + 1], d = V[(j + 1) * GN + i];
    levels.forEach((lv, li) => {
      const idx = (a > lv ? 8 : 0) | (b > lv ? 4 : 0) | (c > lv ? 2 : 0) | (d > lv ? 1 : 0); if (idx === 0 || idx === 15) return;
      const E = { t: () => [i + (lv - a) / (b - a), j], r: () => [i + 1, j + (lv - b) / (c - b)], b: () => [i + (lv - d) / (c - d), j + 1], l: () => [i, j + (lv - a) / (d - a)] };
      const pairs = { 1: ['l', 'b'], 2: ['b', 'r'], 3: ['l', 'r'], 4: ['t', 'r'], 5: ['l', 't', 'b', 'r'], 6: ['t', 'b'], 7: ['l', 't'], 8: ['l', 't'], 9: ['t', 'b'], 10: ['l', 'b', 't', 'r'], 11: ['t', 'r'], 12: ['l', 'r'], 13: ['b', 'r'], 14: ['l', 'b'] }[idx];
      for (let p = 0; p < pairs.length; p += 2) { const u = E[pairs[p]](), w = E[pairs[p + 1]](); out[li].push(gx0 + u[0] * CELLW, gy0 + u[1] * CELLH, gx0 + w[0] * CELLW, gy0 + w[1] * CELLH); }
    });
  }
  return out;
}
const valueAt = (wx, wy) => { const i = clamp(Math.round((wx - gx0) / CELLW), 0, GN - 1), j = clamp(Math.round((wy - gy0) / CELLH), 0, GN - 1); return V[j * GN + i]; };
// Recherche du sujet le plus proche d'un point, par cases de 0,03.
const BK = .03, bucket = new Map(); for (let i = 0; i < N; i++) { const key = Math.floor(T[i * 5] / BK) + ',' + Math.floor(T[i * 5 + 1] / BK); (bucket.get(key) || bucket.set(key, []).get(key)).push(i); }
function nearestTopic(wx, wy, rw) { let best = -1, bd = rw; const cx = Math.floor(wx / BK), cy = Math.floor(wy / BK), n = Math.ceil(rw / BK); for (let a = -n; a <= n; a++) for (let b = -n; b <= n; b++) for (const i of bucket.get((cx + a) + ',' + (cy + b)) || []) { const d = Math.hypot(T[i * 5] - wx, T[i * 5 + 1] - wy); if (d < bd) { bd = d; best = i; } } return best; }
// Fiche d'une question dans le panneau latéral.
const STATUT = { ouverte: 'Question ouverte', evaluation: "Résolution proposée, en cours d'évaluation", avancee: 'Largement avancée depuis 2005' };
const panel = $('panel');
function showPanel(html) { panel.innerHTML = '<button id="pclose" type="button" aria-label="Fermer">×</button>' + html; panel.hidden = false; $('pclose').onclick = hidePanel; document.body.classList.add('panel-open'); }
function hidePanel() { panel.hidden = true; document.body.classList.remove('panel-open'); if (hooks.closed) hooks.closed(); }
function questionHTML(q) {
  const prov = q.f ? `Brouillon rédigé avec une IA ; références vérifiées dans OpenAlex ; pas encore relu par un spécialiste. <a href="https://unknownpedia.org/fr/q/${esc(q.id)}/" target="_blank" rel="noopener">Lire la fiche</a>` : 'Fiche détaillée en préparation.';
  return `<p class="kicker">${esc(STATUT[q.st] || 'Question')}${q.t ? ' · transversale' : ''}</p><h2>${esc(q.qq.fr)}</h2><p>${esc(q.cc.fr)}</p>` + (q.no ? `<p class="small">${esc(q.no.fr)}</p>` : '') + `<h3>Disciplines touchées</h3><p class="small">${q.subs.map(i => esc(S[i].n)).join(' · ')}</p><h3>Source</h3><p class="small">${esc(SRC[q.s].n.fr)}</p><p class="prov">${prov}</p>`;
}
// Déplacement, zoom à la molette, boutons.
let drag = null, moved = 0; const hooks = { hover() {}, click() {} };
const rel = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY }; moved = 0; });
cv.addEventListener('pointermove', e => { const [px, py] = rel(e); if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved += Math.abs(dx) + Math.abs(dy); if (moved > 5) { view.x -= dx / (s0 * view.k); view.y -= dy / (s0 * view.k); tgt = null; cv.style.cursor = 'grabbing'; } drag = { x: e.clientX, y: e.clientY }; } else hooks.hover(px, py); });
cv.addEventListener('pointerup', e => { const [px, py] = rel(e); if (drag && moved < 6) hooks.click(px, py); drag = null; cv.style.cursor = ''; });
cv.addEventListener('pointerleave', () => hooks.hover(-1, -1));
cv.addEventListener('wheel', e => { e.preventDefault(); const [px, py] = rel(e); zoomAt(px, py, Math.exp(-e.deltaY * .0015)); }, { passive: false });
$('zi').onclick = () => zoomAt(W / 2, H / 2, 1.5); $('zo').onclick = () => zoomAt(W / 2, H / 2, 1 / 1.5); $('zr').onclick = () => { flyTo(mx, my, 1); };
addEventListener('keydown', e => { if (e.key === 'Escape') hidePanel(); if (e.key === '+' || e.key === '=') zoomAt(W / 2, H / 2, 1.3); if (e.key === '-') zoomAt(W / 2, H / 2, 1 / 1.3); });
addEventListener('resize', resize); resize();
// Priorité des étiquettes de questions : les transversales d'abord. Gabarit de placement sans chevauchement.
const QORD = Q.map((q, i) => i).sort((a, b) => (Q[b].t - Q[a].t) || (a - b));
const labeller = () => { const used = []; return (txt, px, py, size, align) => { const w = ctx.measureText(txt).width, bx = align === 'right' ? px - w : align === 'center' ? px - w / 2 : px, r = [bx - 4, py - size, bx + w + 4, py + 5]; if (used.some(u => !(r[2] < u[0] || r[0] > u[2] || r[3] < u[1] || r[1] > u[3]))) return false; used.push(r); ctx.textAlign = align; ctx.fillText(txt, px, py); return true; }; };
function loop(draw) { const f = t => { stepView(); draw(t); requestAnimationFrame(f); }; requestAnimationFrame(f); }
