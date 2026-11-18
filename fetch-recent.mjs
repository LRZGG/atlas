// Papers published in the last 30 days, per topic (OpenAlex, topics.id filter + dates). One request per topic (about 4,500).
// Usage: OPENALEX_API_KEY=... node fetch-recent.mjs -> writes recent.json. LIMIT=30 for a trial. The key is never written.
// We stop 3 days before today: recent papers reach OpenAlex with a delay, so the count at the edge would be too low.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const key = process.env.OPENALEX_API_KEY || (process.env.OPENALEX_KEY_FILE && existsSync(process.env.OPENALEX_KEY_FILE) ? readFileSync(process.env.OPENALEX_KEY_FILE, 'utf8').trim() : '');
if (!key) throw new Error('OpenAlex key missing (OPENALEX_API_KEY)');
const day = d => d.toISOString().slice(0, 10), DAYS = 30, to = new Date(Date.now() - 3 * 864e5), from = new Date(to.getTime() - (DAYS - 1) * 864e5);
const sq = JSON.parse(readFileSync('squelette.json', 'utf8')), topics = sq.topics.slice(0, +process.env.LIMIT || 1e9), out = { fetched: day(new Date()), from: day(from), to: day(to), days: DAYS, t: {} };
async function one(t) {
  for (let k = 0; k < 6; k++) {
    const r = await fetch(`https://api.openalex.org/works?filter=topics.id:${t.id},from_publication_date:${out.from},to_publication_date:${out.to}&per-page=1&select=id`, { headers: { authorization: 'Bearer ' + key, 'user-agent': 'unknownpedia-build/0.1' } });
    if (r.status === 429) { await new Promise(s => setTimeout(s, (+r.headers.get('retry-after') || 5) * 1000)); continue; }
    if (!r.ok) { await new Promise(s => setTimeout(s, 2000)); continue; }
    out.t[t.id] = (await r.json()).meta.count; return;
  }
  console.log('failed', t.id);
}
let i = 0, n = 0; await Promise.all(Array.from({ length: 8 }, async () => { while (i < topics.length) { const t = topics[i++]; await one(t); if (++n % 500 === 0) console.log(n); } }));
if (Object.keys(out.t).length < topics.length * 0.98) throw new Error('too many failures: recent.json not written');
writeFileSync('recent.json', JSON.stringify(out) + '\n'); console.log('done', Object.keys(out.t).length, out.from, out.to);
