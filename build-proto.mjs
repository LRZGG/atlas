// Fabrique les prototypes locaux proto-planche.html et proto-chambre.html : pages autonomes (données incluses) pour les essayer en double-cliquant.
// Usage : node build-proto.mjs   (lit carte-de-l-inconnu.html pour les données, proto-common.js et les gabarits proto-*.tpl.html)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const h = readFileSync('carte-de-l-inconnu.html', 'utf8'), a = h.indexOf('const DATA = ') + 13, b = h.indexOf(';\nconst { F, S, L');
const D = JSON.parse(h.slice(a, b));
const data = {
  T: D.T.map((v, i) => i % 5 === 4 ? v : Math.round(v * 1000) / 1000), F: D.F, D: D.D, S: D.S.map(s => ({ n: s.n, f: s.f, x: s.x, y: s.y, w: s.w })), L: D.L,
  Q: D.Q.map(q => ({ id: q.id, qq: q.qq, nmm: q.nmm, cc: q.cc, no: q.no, s: q.s, st: q.st, subs: q.subs, t: q.t ? 1 : 0, x: q.x, y: q.y, f: !!q.f })),
  SRC: Object.fromEntries(Object.entries(D.SRC).map(([k, v]) => [k, { n: v.n }]))
};
const common = readFileSync('proto-common.js', 'utf8'), json = JSON.stringify(data);
for (const n of ['chambre']) {
  const tpl = `proto-${n}.tpl.html`; if (!existsSync(tpl)) { console.log('absent :', tpl); continue; }
  writeFileSync(`proto-${n}.html`, readFileSync(tpl, 'utf8').replace('/*DATA*/null', () => json).replace('/*COMMON*/', () => common));
  console.log(`proto-${n}.html écrit`);
}
