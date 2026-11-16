// Pour chaque question qui a une fiche dans questions.json : télécharge l'extrait de la page Wikipédia choisie et
// vérifie chaque référence dans OpenAlex (titre, auteurs, année, lien). Une référence introuvable fait échouer le script.
// Usage : node fetch-fiches.mjs   → écrit fiches.json (lu par build-directions.mjs)
import { readFileSync, writeFileSync } from 'node:fs';

const HEAD = { headers: { 'user-agent': 'carte-de-l-inconnu/0.1 (prototype)' } };
const qs = JSON.parse(readFileSync('questions.json', 'utf8')).questions.filter(q => q.fiche);
const out = {};
const cut = (t, max = 520) => { if (t.length <= max) return t; const s = t.slice(0, max), i = Math.max(s.lastIndexOf('. '), s.lastIndexOf('; ')); return (i > 200 ? s.slice(0, i + 1) : s.slice(0, s.lastIndexOf(' ')) + '…'); };

for (const q of qs) {
  const f = q.fiche, r = await fetch('https://fr.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(f.wiki.replace(/ /g, '_')), HEAD);
  if (!r.ok) throw new Error(`Wikipédia ${r.status} pour « ${f.wiki} » (${q.id})`);
  const w = await r.json();
  if (!w.extract || w.type === 'disambiguation') throw new Error(`page Wikipédia inutilisable : ${f.wiki}`);
  const refs = [];
  for (const ref of f.refs) {
    if (ref.doi) {
      const a = await fetch(`https://api.openalex.org/works/https://doi.org/${ref.doi}?select=title,publication_year,authorships,doi`, HEAD);
      if (!a.ok) throw new Error(`OpenAlex ${a.status} pour le DOI ${ref.doi} (${q.id})`);
      const j = await a.json(), au = j.authorships.map(x => x.author.display_name);
      refs.push({ t: j.title, a: au.length > 3 ? au.slice(0, 3).join(', ') + ' et al.' : au.join(', '), y: j.publication_year, u: 'https://doi.org/' + ref.doi });
    } else {
      const a = await fetch(ref.url, HEAD); if (!a.ok) throw new Error(`lien inaccessible : ${ref.url} (${a.status})`);
      refs.push({ t: ref.t, a: ref.a, y: null, u: ref.url });
    }
  }
  out[q.id] = { w: { t: w.title, x: cut(w.extract), u: w.content_urls.desktop.page }, r: refs };
  console.log(`${q.id} : « ${w.title} », ${refs.length} références vérifiées`);
}
writeFileSync('fiches.json', JSON.stringify({ fetched: new Date().toISOString().slice(0, 10), fiches: out }, null, 2) + '\n');
