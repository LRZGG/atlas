// For each question that has a fiche in questions.json: downloads the excerpt of the chosen Wikipedia page, in each language for which a title is given,
// and verifies every reference in OpenAlex (title, authors, year, link). A page or reference that cannot be found makes the script fail.
// Usage: node fetch-fiches.mjs   -> writes fiches.json (read by build-directions.mjs)
// OpenAlex key optional: OPENALEX_API_KEY variable or OPENALEX_KEY_FILE (a file that contains it).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const HEAD = { 'user-agent': 'carte-de-l-inconnu/0.1 (prototype)' };
let key = process.env.OPENALEX_API_KEY || '';
if (!key && process.env.OPENALEX_KEY_FILE && existsSync(process.env.OPENALEX_KEY_FILE)) key = readFileSync(process.env.OPENALEX_KEY_FILE, 'utf8').trim();
const OA = key ? { ...HEAD, authorization: 'Bearer ' + key } : HEAD;
const qs = JSON.parse(readFileSync('questions.json', 'utf8')).questions.filter(q => q.fiche);
const out = {};
// Wikipedia and OpenAlex rate-limit (code 429): wait for the requested delay, then retry.
const get = async (url, opts) => { for (let i = 0; i < 8; i++) { const r = await fetch(url, opts); if (r.status !== 429) { await new Promise(s => setTimeout(s, 700)); return r; } await new Promise(s => setTimeout(s, (+r.headers.get('retry-after') || 15) * 1000 + 500)); } throw new Error('too many requests (429): ' + url); };
const cut = (t, max = 520) => { if (t.length <= max) return t; const s = t.slice(0, max), i = Math.max(s.lastIndexOf('. '), s.lastIndexOf('; ')); return (i > 200 ? s.slice(0, i + 1) : s.slice(0, s.lastIndexOf(' ')) + '…'); };

for (const q of qs) {
  const f = q.fiche, w = {};
  for (const [lang, titre] of Object.entries(f.wiki)) {
    const r = await get(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/` + encodeURIComponent(titre.replace(/ /g, '_')), { headers: HEAD });
    if (!r.ok) throw new Error(`Wikipedia ${lang}: ${r.status} for "${titre}" (${q.id})`);
    const j = await r.json();
    if (!j.extract || j.type === 'disambiguation') throw new Error(`unusable Wikipedia page: ${lang} "${titre}"`);
    w[lang] = { t: j.title, x: cut(j.extract), u: j.content_urls.desktop.page };
  }
  const refs = [];
  for (const ref of f.refs) {
    if (ref.doi) {
      const a = await get(`https://api.openalex.org/works/https://doi.org/${ref.doi}?select=title,publication_year,authorships,doi`, { headers: OA });
      if (!a.ok) throw new Error(`OpenAlex ${a.status} for DOI ${ref.doi} (${q.id})`);
      const j = await a.json(), au = j.authorships.map(x => x.author.display_name);
      // `t` and `a` are optional in questions.json: use them only if OpenAlex mangled the title or names (accents, punctuation); the DOI is still verified.
      refs.push({ t: ref.t || j.title, a: ref.a || (au.length > 3 ? au.slice(0, 3).join(', ') + ' et al.' : au.join(', ')), y: j.publication_year, u: 'https://doi.org/' + ref.doi });
    } else {
      const a = await get(ref.url, { headers: HEAD }); if (!a.ok) throw new Error(`unreachable link: ${ref.url} (${a.status})`);
      refs.push({ t: ref.t, a: ref.a, y: null, u: ref.url });
    }
  }
  out[q.id] = { w, r: refs };
  console.log(`${q.id} : ${Object.entries(w).map(([l, x]) => `${l} "${x.t}"`).join(', ')} ; ${refs.length} references verified`);
}
writeFileSync('fiches.json', JSON.stringify({ fetched: new Date().toISOString().slice(0, 10), fiches: out }, null, 2) + '\n');
