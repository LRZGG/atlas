// Deux hémisphères (projection stéréographique équatoriale, comme les mappemondes du XVIIe siècle) depuis Natural Earth 1:50 millions (domaine public) via « world-atlas ».
// Usage : node make-hemi.mjs <dossier du paquet topojson-client> <land-50m.json> → écrit labo-hemi.json. Détourage exact de l'hémisphère visible (Sutherland–Hodgman sur la sphère).
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const [tc, landf] = process.argv.slice(2);
const { feature } = await import(pathToFileURL(tc + '/dist/topojson-client.js').href);
const topo = JSON.parse(readFileSync(landf, 'utf8')), land = feature(topo, topo.objects.land), R = 240, rad = Math.PI / 180;
const polys = land.type === 'FeatureCollection' ? land.features.flatMap(f => f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates]) : land.geometry.type === 'MultiPolygon' ? land.geometry.coordinates : [land.geometry.coordinates];
const vec = (lo, la, l0) => { const d = (lo - l0) * rad, p = la * rad; return [Math.cos(p) * Math.sin(d), Math.sin(p), Math.cos(p) * Math.cos(d)]; };
const proj = v => [(v[0] / (1 + v[2]) * R), (-v[1] / (1 + v[2]) * R)];
const norm = v => { const n = Math.hypot(...v); return v.map(c => c / n); };
function clip(ring, l0) {
  const V = ring.map(([lo, la]) => vec(lo, la, l0)), out = [];
  const cut = (a, b) => { const t = a[2] / (a[2] - b[2]), p = norm([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]), 0]); p[2] = 0; return p; };
  for (let i = 0; i < V.length; i++) { const a = V[(i + V.length - 1) % V.length], b = V[i], ia = a[2] >= 0, ib = b[2] >= 0;
    if (ia && ib) out.push(b); else if (ia && !ib) out.push(cut(a, b)); else if (!ia && ib) { out.push(cut(a, b)); out.push(b); } }
  // arcs de bord : entre une sortie et la rentrée suivante, on suit le cercle limite au lieu d'une corde
  const res = []; for (let i = 0; i < out.length; i++) { const a = out[i], b = out[(i + 1) % out.length]; res.push(a);
    if (Math.abs(a[2]) < 1e-9 && Math.abs(b[2]) < 1e-9 && (Math.hypot(a[0] - b[0], a[1] - b[1]) > 0.02)) { const t0 = Math.atan2(a[1], a[0]); let dt = Math.atan2(b[1], b[0]) - t0; dt = Math.atan2(Math.sin(dt), Math.cos(dt)); const n = Math.max(2, Math.ceil(Math.abs(dt) / (3 * rad))); for (let k = 1; k < n; k++) res.push([Math.cos(t0 + dt * k / n), Math.sin(t0 + dt * k / n), 0]); } }
  return res;
}
function path(l0) { let d = ''; for (const poly of polys) for (const ring of poly) { const c = clip(ring, l0); if (c.length < 3) continue; d += 'M' + c.map(v => { const [x, y] = proj(v); return x.toFixed(1) + ' ' + y.toFixed(1); }).join('L') + 'Z'; } return d; }
const out = { R, west: { lon0: -100, d: path(-100) }, east: { lon0: 70, d: path(70) }, credit: 'Natural Earth (domaine public) via world-atlas 2.0.2 (ISC)' };
writeFileSync('labo-hemi.json', JSON.stringify(out) + '\n'); console.log('ok', out.west.d.length, out.east.d.length);
