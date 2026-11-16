// Fabrique maquettes.html : quatre directions artistiques dessinées sur les vraies données de la carte (positions des 4 516 sujets, liens entre sous-disciplines, questions).
// Usage : node build-maquettes.mjs   (lit carte-de-l-inconnu.html pour les données, produit maquettes.html à partir de maquettes.tpl.html)
import { readFileSync, writeFileSync } from 'node:fs';
const h = readFileSync('carte-de-l-inconnu.html', 'utf8'), a = h.indexOf('const DATA = ') + 13, b = h.indexOf(';\nconst { F, S, L');
const D = JSON.parse(h.slice(a, b)), r3 = v => +v.toFixed(3);
const T = []; for (let i = 0; i < D.T.length / 5; i++) T.push(r3(D.T[i * 5]), r3(D.T[i * 5 + 1]), Math.round(D.T[i * 5 + 2]), D.S[D.T[i * 5 + 3]].f);
const out = {
  T, F: D.F.map(f => ({ n: f.nn.fr, d: f.d })), S: D.S.map(s => [s.x, s.y]), L: D.L,
  Q: D.Q.map(q => ({ n: q.nmm.fr, x: q.x, y: q.y, t: q.t ? 1 : 0 })), D: D.D.map(d => d.fr), hole: D.hole
};
writeFileSync('maquettes.html', readFileSync('maquettes.tpl.html', 'utf8').replace('/*DATA*/null', () => JSON.stringify(out)));
console.log(`${T.length / 4} sujets, ${out.Q.length} questions, ${out.L.length} liens`);
