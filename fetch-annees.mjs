// For each topic: number of papers published per year, from 1990 to the current year (OpenAlex, group_by=publication_year). Resumes where it stopped.
// Usage: OPENALEX_API_KEY=... node fetch-annees.mjs -> writes annees.json (the key is never written). About 4,500 requests.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const key = process.env.OPENALEX_API_KEY || (process.env.OPENALEX_KEY_FILE && existsSync(process.env.OPENALEX_KEY_FILE) ? readFileSync(process.env.OPENALEX_KEY_FILE, 'utf8').trim() : '');
if (!key) throw new Error('OpenAlex key missing (OPENALEX_API_KEY)');
const sq = JSON.parse(readFileSync('squelette.json', 'utf8')), Y0 = 1990, Y1 = new Date().getFullYear();
const OUTF = process.env.ANNEES_OUT || 'annees.json'; // ANNEES_OUT and REVERSE=1 let a second process run in the opposite direction; merge the files afterwards
const out = existsSync(OUTF) ? JSON.parse(readFileSync(OUTF, 'utf8')) : { fetched: new Date().toISOString().slice(0, 10), y0: Y0, y1: Y1, t: {} };
const done0 = existsSync('annees.json') ? JSON.parse(readFileSync('annees.json', 'utf8')).t : {};
const todo = sq.topics.filter(t => !out.t[t.id] && !(process.env.ANNEES_OUT && done0[t.id])); if (process.env.REVERSE) todo.reverse();
console.log(`${todo.length} topics to download`);
async function one(t) {
  for (let k = 0; k < 6; k++) {
    const r = await fetch(`https://api.openalex.org/works?filter=topics.id:${t.id}&group_by=publication_year&per-page=200`, { headers: { authorization: 'Bearer ' + key, 'user-agent': 'unknownpedia-build/0.1' } });
    if (r.status === 429) { await new Promise(s => setTimeout(s, (+r.headers.get('retry-after') || 5) * 1000)); continue; }
    if (!r.ok) { await new Promise(s => setTimeout(s, 2000)); continue; }
    const j = await r.json(), a = new Array(Y1 - Y0 + 1).fill(0); for (const g of j.group_by) { const y = +g.key; if (y >= Y0 && y <= Y1) a[y - Y0] = g.count; }
    out.t[t.id] = a; return;
  }
  console.log('failed', t.id);
}
let n = 0, i = 0; const W = 4;
await Promise.all(Array.from({ length: W }, async () => { while (i < todo.length) { const t = todo[i++]; await one(t); if (++n % 100 === 0) { writeFileSync(OUTF, JSON.stringify(out)); console.log(n); } } }));
writeFileSync(OUTF, JSON.stringify(out)); console.log('done', Object.keys(out.t).length);
