// Contrôle automatique des fiches (aucune IA, aucun réseau) : repère ce qu'un humain doit regarder en premier.
// Usage : node verifier-fiches.mjs → écrit controle/rapport.json et controle/rapport.md
// Les décisions des humains (qui a tranché, quand) sont dans controle/decisions.json : un point décidé n'est plus « ouvert ».
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const qs = JSON.parse(readFileSync('questions.json', 'utf8')).questions.filter(q => q.fiche), FI = JSON.parse(readFileSync('fiches.json', 'utf8')).fiches;
const DEC = existsSync('controle/decisions.json') ? JSON.parse(readFileSync('controle/decisions.json', 'utf8')) : [];
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
// Nombres d'au moins 2 chiffres, séparateurs de milliers retirés (1 420, 1,420), ordinaux anglais (19th) ignorés.
const digits = s => (String(s).replace(/\b\d{1,2}(st|nd|rd|th)\b/g, ' ').replace(/(\d)[,   ](?=\d{3}\b)/g, '$1').match(/\d+/g) || []).filter(x => x.length >= 2);
const key = (id, type, texte) => id + ':' + type + ':' + createHash('sha1').update(texte).digest('hex').slice(0, 8);
const out = { date: new Date().toISOString().slice(0, 10), fiches: {} }; let total = 0, ouverts = 0;
for (const q of qs) {
  const f = q.fiche, fi = FI[q.id] || { w: {}, r: [] }, pts = [];
  const add = (type, texte) => { const k = key(q.id, type, texte), d = DEC.find(x => x.cle === k); pts.push({ cle: k, type, texte, statut: d ? d.statut : 'ouvert', par: d ? d.par : null, date: d ? d.date : null }); };
  const all = lang => [...(f[lang]?.savoir || []), ...(f[lang]?.ignore || []), ...(f[lang]?.dur || []), f[lang]?.enjeu || '', ...(f[lang]?.commencer || [])].join(' ');
  const textFr = all('fr'), textEn = all('en');
  // 1. Références
  if (!fi.r.length) add('sans-reference', 'La fiche ne cite aucun article ou document vérifié dans OpenAlex.');
  // 2. Chiffres : tout nombre d'au moins 2 chiffres doit se retrouver dans l'extrait Wikipédia, un titre ou une année de référence, l'énoncé ou le contexte de la question.
  const sources = norm([fi.w?.fr?.x, fi.w?.en?.x, ...fi.r.map(r => r.t + ' ' + r.y), q.q.fr, q.q.en, q.ctx.fr, q.ctx.en].join(' ')).replace(/[   ]/g, '');
  const seen = new Set();
  for (const n of digits(textFr)) { if (seen.has(n)) continue; seen.add(n); if (!sources.includes(n)) add('chiffre-sans-source', `Le nombre « ${n} » n'apparaît ni dans l'extrait Wikipédia, ni dans les références, ni dans l'énoncé : à vérifier.`); }
  // 3. Parité français / anglais : mêmes nombres des deux côtés.
  if (textEn) { const a = new Set(digits(textFr)), b = new Set(digits(textEn)); for (const n of a) if (!b.has(n)) add('parite-fr-en', `Le nombre « ${n} » est dans la version française mais pas dans l'anglaise.`); for (const n of b) if (!a.has(n)) add('parite-fr-en', `Le nombre « ${n} » est dans la version anglaise mais pas dans la française.`); }
  else add('sans-traduction', 'Pas de version anglaise de la fiche.');
  // 4. Références hors sujet ? Un mot de plus de 5 lettres du titre doit apparaître dans l'extrait ou dans le texte anglais de la fiche.
  const ref = norm([fi.w?.en?.x, textEn, q.q.en, q.nom?.en].join(' '));
  for (const r of fi.r) { if (!r.y) continue; const words = norm(r.t).split(/[^a-z]+/).filter(w => w.length > 5); if (words.length && !words.some(w => ref.includes(w.slice(0, 6)))) add('reference-hors-sujet', `Aucun mot du titre de « ${r.t} » ne se retrouve dans la fiche : référence à vérifier.`); }
  // 5. Affirmations fortes : « démontré », « prouvé », « jamais », « aucun » (à confirmer par une source).
  for (const s of [...(f.fr.savoir || []), ...(f.fr.ignore || [])]) if (/\b(démontr|prouv|jamais|aucun[e]? )/i.test(s)) add('affirmation-forte', `Affirmation forte à confirmer par une source : « ${s.slice(0, 140)}${s.length > 140 ? '…' : ''} »`);
  // 6. Relecture
  if (!f.relue) add('non-relue', 'Aucun spécialiste nommé n\'a relu cette fiche.');
  out.fiches[q.id] = pts; total += pts.length; ouverts += pts.filter(p => p.statut === 'ouvert').length;
}
mkdirSync('controle', { recursive: true }); writeFileSync('controle/rapport.json', JSON.stringify(out, null, 1) + '\n');
const T = { 'sans-reference': 'Sans référence', 'chiffre-sans-source': 'Chiffres sans source', 'parite-fr-en': 'Écarts FR / EN', 'sans-traduction': 'Sans traduction', 'reference-hors-sujet': 'Références hors sujet ?', 'affirmation-forte': 'Affirmations fortes', 'non-relue': 'Non relue' };
let md = `# Contrôle automatique des fiches\n\nGénéré le ${out.date} par \`verifier-fiches.mjs\` (aucune IA, aucun réseau). ${ouverts} point(s) ouvert(s) sur ${total}, ${Object.keys(out.fiches).length} fiches.\n\nUn point ouvert est une **question posée à un humain**, pas une erreur confirmée. Pour trancher : ouvrir une demande « Corriger une fiche » sur GitHub, ou ajouter une ligne à \`controle/decisions.json\` (\`cle\`, \`statut\` : confirmé / corrigé / rejeté, \`par\`, \`date\`).\n\n`;
for (const [id, pts] of Object.entries(out.fiches)) { const o = pts.filter(p => p.statut === 'ouvert' && p.type !== 'non-relue'); md += `## ${id}\n\n` + (o.length ? o.map(p => `- **${T[p.type]}** — ${p.texte}  \n  \`${p.cle}\``).join('\n') : '- Aucun point ouvert hors relecture.') + '\n\n'; }
writeFileSync('controle/rapport.md', md); if (!existsSync('controle/decisions.json')) writeFileSync('controle/decisions.json', '[]\n');
console.log(`${ouverts} points ouverts sur ${total} (${Object.keys(out.fiches).length} fiches)`);
const bytype = {}; for (const p of Object.values(out.fiches).flat()) if (p.statut === 'ouvert') bytype[p.type] = (bytype[p.type] || 0) + 1; console.log(bytype);
