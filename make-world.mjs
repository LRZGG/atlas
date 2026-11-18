// World base map (land, Natural Earth via the "world-atlas" package, public domain / ISC) -> SVG path in equirectangular projection (1000 x 142/360*1000, latitudes 84 to -58).
// Usage: node make-world.mjs <topojson-client package folder> <land-110m.json> -> writes labo-world.json
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const [tc, landf] = process.argv.slice(2);
const { feature } = await import(pathToFileURL(tc + '/dist/topojson-client.js').href);
const topo = JSON.parse(readFileSync(landf, 'utf8')), land = feature(topo, topo.objects.land);
const W = 1000, H = 1000 * (84 + 58) / 360, X = lon => ((lon + 180) / 360 * W), Y = lat => ((84 - lat) / (84 + 58) * H);
const polys = land.type === 'FeatureCollection' ? land.features.flatMap(f => f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates]) : land.geometry.type === 'MultiPolygon' ? land.geometry.coordinates : [land.geometry.coordinates];
let d = '';
// Antarctica is dropped (out of frame) and rings crossing the antimeridian are cut, otherwise a horizontal line crosses the map.
for (const poly of polys) for (const ring of poly) {
  if (ring.every(([, la]) => la < -58)) continue;
  let seg = [], prev = null; const flush = () => { if (seg.length > 2) d += 'M' + seg.join('L') + 'Z'; seg = []; };
  for (const [lo, la] of ring) { if (prev !== null && Math.abs(lo - prev) > 180) flush(); seg.push(X(lo).toFixed(1) + ' ' + Y(Math.max(-58, Math.min(84, la))).toFixed(1)); prev = lo; }
  flush();
}
writeFileSync('labo-world.json', JSON.stringify({ w: W, h: +H.toFixed(1), d, credit: 'Natural Earth (public domain) via world-atlas 2.0.2 (ISC)' }) + '\n'); console.log('ok', d.length);
