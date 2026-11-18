// Articles publiés ces 30 derniers jours, par sujet (OpenAlex, filtre topics.id + dates). Une requête par sujet (environ 4 500).
// Usage : OPENALEX_API_KEY=… node fetch-recent.mjs → écrit recent.json. LIMIT=30 pour un essai. La clé n'est jamais écrite.
// On s'arrête 3 jours avant aujourd'hui : les articles récents arrivent dans OpenAlex avec du retard, le décompte du bord serait trop bas.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const key = process.env.OPENALEX_API_KEY || (process.env.OPENALEX_KEY_FILE && existsSync(process.env.OPENALEX_KEY_FILE) ? readFileSync(process.env.OPENALEX_KEY_FILE, 'utf8').trim() : '');
if (!key) throw new Error('clé OpenAlex absente (OPENALEX_API_KEY)');
const day = d => d.toISOString().slice(0, 10), DAYS = 30, to = new Date(Date.now() - 3 * 864e5), from = new Date(to.getTime() - (DAYS - 1) * 864e5);
const sq = JSON.parse(readFileSync('squelette.json', 'utf8')), topics = sq.topics.slice(0, +process.env.LIMIT || 1e9), out = { fetched: day(new Date()), from: day(from), to: day(to), days: DAYS, t: {} };
async function one(t) {
  for (let k = 0; k < 6; k++) {
    const r = await fetch(`https://api.openalex.org/works?filter=topics.id:${t.id},from_publication_date:${out.from},to_publication_date:${out.to}&per-page=1&select=id`, { headers: { authorization: 'Bearer ' + key, 'user-agent': 'unknownpedia-build/0.1' } });
    if (r.status === 429) { await new Promise(s => setTimeout(s, (+r.headers.get('retry-after') || 5) * 1000)); continue; }
    if (!r.ok) { await new Promise(s => setTimeout(s, 2000)); continue; }
    out.t[t.id] = (await r.json()).meta.count; return;
  }
  console.log('échec', t.id);
}
let i = 0, n = 0; await Promise.all(Array.from({ length: 8 }, async () => { while (i < topics.length) { const t = topics[i++]; await one(t); if (++n % 500 === 0) console.log(n); } }));
if (Object.keys(out.t).length < topics.length * 0.98) throw new Error('trop d\'échecs : recent.json non écrit');
writeFileSync('recent.json', JSON.stringify(out) + '\n'); console.log('fini', Object.keys(out.t).length, out.from, out.to);
