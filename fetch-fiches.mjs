// Pour chaque question qui a une fiche dans questions.json : télécharge l'extrait de la page Wikipédia choisie, dans chaque langue où un titre est donné,
// et vérifie chaque référence dans OpenAlex (titre, auteurs, année, lien). Une page ou une référence introuvable fait échouer le script.
// Usage : node fetch-fiches.mjs   → écrit fiches.json (lu par build-directions.mjs)
// Clé OpenAlex facultative : variable OPENALEX_API_KEY ou OPENALEX_KEY_FILE (un fichier qui la contient).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const HEAD = { 'user-agent': 'carte-de-l-inconnu/0.1 (prototype)' };
let key = process.env.OPENALEX_API_KEY || '';
if (!key && process.env.OPENALEX_KEY_FILE && existsSync(process.env.OPENALEX_KEY_FILE)) key = readFileSync(process.env.OPENALEX_KEY_FILE, 'utf8').trim();
const OA = key ? { ...HEAD, authorization: 'Bearer ' + key } : HEAD;
const qs = JSON.parse(readFileSync('questions.json', 'utf8')).questions.filter(q => q.fiche);
const out = {};
const cut = (t, max = 520) => { if (t.length <= max) return t; const s = t.slice(0, max), i = Math.max(s.lastIndexOf('. '), s.lastIndexOf('; ')); return (i > 200 ? s.slice(0, i + 1) : s.slice(0, s.lastIndexOf(' ')) + '…'); };

for (const q of qs) {
  const f = q.fiche, w = {};
  for (const [lang, titre] of Object.entries(f.wiki)) {
    const r = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/` + encodeURIComponent(titre.replace(/ /g, '_')), { headers: HEAD });
    if (!r.ok) throw new Error(`Wikipédia ${lang} : ${r.status} pour « ${titre} » (${q.id})`);
    const j = await r.json();
    if (!j.extract || j.type === 'disambiguation') throw new Error(`page Wikipédia inutilisable : ${lang} « ${titre} »`);
    w[lang] = { t: j.title, x: cut(j.extract), u: j.content_urls.desktop.page };
  }
  const refs = [];
  for (const ref of f.refs) {
    if (ref.doi) {
      const a = await fetch(`https://api.openalex.org/works/https://doi.org/${ref.doi}?select=title,publication_year,authorships,doi`, { headers: OA });
      if (!a.ok) throw new Error(`OpenAlex ${a.status} pour le DOI ${ref.doi} (${q.id})`);
      const j = await a.json(), au = j.authorships.map(x => x.author.display_name);
      refs.push({ t: j.title, a: au.length > 3 ? au.slice(0, 3).join(', ') + ' et al.' : au.join(', '), y: j.publication_year, u: 'https://doi.org/' + ref.doi });
    } else {
      const a = await fetch(ref.url, { headers: HEAD }); if (!a.ok) throw new Error(`lien inaccessible : ${ref.url} (${a.status})`);
      refs.push({ t: ref.t, a: ref.a, y: null, u: ref.url });
    }
  }
  out[q.id] = { w, r: refs };
  console.log(`${q.id} : ${Object.entries(w).map(([l, x]) => `${l} « ${x.t} »`).join(', ')} ; ${refs.length} références vérifiées`);
}
writeFileSync('fiches.json', JSON.stringify({ fetched: new Date().toISOString().slice(0, 10), fiches: out }, null, 2) + '\n');
