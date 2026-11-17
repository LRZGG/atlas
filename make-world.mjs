// Fond de carte du monde (terres émergées, Natural Earth via le paquet « world-atlas », domaine public / ISC) → chemin SVG en projection équirectangulaire (1000 × 142/360·1000, latitudes 84° à -58°).
// Usage : node make-world.mjs <dossier du paquet topojson-client> <land-110m.json> → écrit labo-world.json
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const [tc, landf] = process.argv.slice(2);
const { feature } = await import(pathToFileURL(tc + '/dist/topojson-client.js').href);
const topo = JSON.parse(readFileSync(landf, 'utf8')), land = feature(topo, topo.objects.land);
const W = 1000, H = 1000 * (84 + 58) / 360, X = lon => ((lon + 180) / 360 * W), Y = lat => ((84 - lat) / (84 + 58) * H);
const polys = land.type === 'FeatureCollection' ? land.features.flatMap(f => f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates]) : land.geometry.type === 'MultiPolygon' ? land.geometry.coordinates : [land.geometry.coordinates];
let d = '';
// On écarte l'Antarctique (hors cadre) et on coupe les anneaux qui franchissent l'antiméridien, sinon une ligne horizontale traverse la carte.
for (const poly of polys) for (const ring of poly) {
  if (ring.every(([, la]) => la < -58)) continue;
  let seg = [], prev = null; const flush = () => { if (seg.length > 2) d += 'M' + seg.join('L') + 'Z'; seg = []; };
  for (const [lo, la] of ring) { if (prev !== null && Math.abs(lo - prev) > 180) flush(); seg.push(X(lo).toFixed(1) + ' ' + Y(Math.max(-58, Math.min(84, la))).toFixed(1)); prev = lo; }
  flush();
}
writeFileSync('labo-world.json', JSON.stringify({ w: W, h: +H.toFixed(1), d, credit: 'Natural Earth (domaine public) via world-atlas 2.0.2 (ISC)' }) + '\n'); console.log('ok', d.length);
