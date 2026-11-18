// Pour chaque sujet : nombre d'articles publiés par année, de 1990 à l'année en cours (OpenAlex, group_by=publication_year). Reprend là où il s'est arrêté.
// Usage : OPENALEX_API_KEY=… node fetch-annees.mjs → écrit annees.json (la clé n'est jamais écrite). Environ 4 500 requêtes.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const key = process.env.OPENALEX_API_KEY || (process.env.OPENALEX_KEY_FILE && existsSync(process.env.OPENALEX_KEY_FILE) ? readFileSync(process.env.OPENALEX_KEY_FILE, 'utf8').trim() : '');
if (!key) throw new Error('clé OpenAlex absente (OPENALEX_API_KEY)');
const sq = JSON.parse(readFileSync('squelette.json', 'utf8')), Y0 = 1990, Y1 = new Date().getFullYear();
const out = existsSync('annees.json') ? JSON.parse(readFileSync('annees.json', 'utf8')) : { fetched: new Date().toISOString().slice(0, 10), y0: Y0, y1: Y1, t: {} };
const todo = sq.topics.filter(t => !out.t[t.id]);
console.log(`${todo.length} sujets à télécharger`);
async function one(t) {
  for (let k = 0; k < 6; k++) {
    const r = await fetch(`https://api.openalex.org/works?filter=topics.id:${t.id}&group_by=publication_year&per-page=200`, { headers: { authorization: 'Bearer ' + key, 'user-agent': 'unknownpedia-build/0.1' } });
    if (r.status === 429) { await new Promise(s => setTimeout(s, (+r.headers.get('retry-after') || 5) * 1000)); continue; }
    if (!r.ok) { await new Promise(s => setTimeout(s, 2000)); continue; }
    const j = await r.json(), a = new Array(Y1 - Y0 + 1).fill(0); for (const g of j.group_by) { const y = +g.key; if (y >= Y0 && y <= Y1) a[y - Y0] = g.count; }
    out.t[t.id] = a; return;
  }
  console.log('échec', t.id);
}
let n = 0, i = 0; const W = 4;
await Promise.all(Array.from({ length: W }, async () => { while (i < todo.length) { const t = todo[i++]; await one(t); if (++n % 100 === 0) { writeFileSync('annees.json', JSON.stringify(out)); console.log(n); } } }));
writeFileSync('annees.json', JSON.stringify(out)); console.log('fini', Object.keys(out.t).length);
