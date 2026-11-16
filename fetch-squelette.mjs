// Télécharge le squelette réel de la carte depuis OpenAlex : sujets, hiérarchie, liens mesurés.
// Usage : node fetch-squelette.mjs [--subfields]   (--subfields ajoute les liens entre sous-disciplines, 252 appels)
// shortcut: sans clé d'API, budget partagé de 0,10 $/jour ; passer OPENALEX_KEY si ça bloque.
import { writeFileSync } from 'node:fs';
import assert from 'node:assert';

const API = 'https://api.openalex.org', KEY = process.env.OPENALEX_KEY ? `&api_key=${process.env.OPENALEX_KEY}` : '';
let cost = 0;
async function get(path) {
  const r = await fetch(API + path + KEY);
  if (!r.ok) throw new Error(`${r.status} sur ${path} : ${(await r.text()).slice(0, 200)}`);
  const j = await r.json(); cost += j.meta?.cost_usd || 0; return j;
}
const short = url => url.split('/').pop();

// 1. Tous les sujets, avec leur place dans l'arbre et leur nombre d'articles.
const topics = [], fields = {}, subfields = {}, domains = {};
let page = 1, total = 0;
while (page) {
  const j = await get(`/topics?per-page=200&page=${page}&sort=id&select=id,display_name,works_count,subfield,field,domain`);
  total = j.meta.count;
  for (const t of j.results) {
    const f = short(t.field.id), s = short(t.subfield.id), d = short(t.domain.id);
    domains[d] = t.domain.display_name; fields[f] = { name: t.field.display_name, domain: d }; subfields[s] = { name: t.subfield.display_name, field: f };
    topics.push({ id: short(t.id), name: t.display_name, works: t.works_count, subfield: s });
  }
  page = j.results.length === 200 ? page + 1 : 0;
}
assert.equal(topics.length, total, 'nombre de sujets incomplet');

// 2. Liens mesurés : pour les articles dont la discipline principale est A, combien portent aussi un sujet de B.
async function links(level, ids) {
  const out = [];
  for (const a of ids) {
    const j = await get(`/works?filter=primary_topic.${level}.id:${a}&group_by=topics.${level}.id&per-page=200`);
    for (const g of j.group_by) { const b = short(g.key); if (b !== a && g.count) out.push([a, b, g.count]); }
    process.stderr.write('.');
  }
  return out;
}
const fieldLinks = await links('field', Object.keys(fields));
const subfieldLinks = process.argv.includes('--subfields') ? await links('subfield', Object.keys(subfields)) : null;

writeFileSync('squelette.json', JSON.stringify({ source: 'OpenAlex', fetched: new Date().toISOString().slice(0, 10), domains, fields, subfields, topics, fieldLinks, subfieldLinks }));
console.log(`\n${Object.keys(domains).length} domaines, ${Object.keys(fields).length} disciplines, ${Object.keys(subfields).length} sous-disciplines, ${topics.length} sujets`);
console.log(`${fieldLinks.length} liens entre disciplines${subfieldLinks ? `, ${subfieldLinks.length} entre sous-disciplines` : ''} — coût API ${cost.toFixed(4)} $`);
