// Mesure les liens entre sujets : pour chaque sujet S, parmi les articles dont le sujet principal est S, quels autres sujets portent-ils aussi ?
// On garde les 40 sujets les plus fréquents. Écrit liens-sujets.json et reprend là où il s'est arrêté s'il est relancé.
// Usage : node fetch-liens-sujets.mjs [--limit N] [--attendre-cle]
//   Clé d'API (facultative, elle multiplie le budget quotidien par 10) : variable OPENALEX_API_KEY, ou OPENALEX_KEY_FILE pointant vers un fichier qui la contient.
//   --attendre-cle : une clé fraîchement demandée ne marche qu'après le clic sur le lien reçu par e-mail ; le script attend l'activation puis démarre.
// shortcut: 4 appels en parallèle et reprise simple, pas de gestion fine du budget ; il s'arrête sur erreur et se relance le lendemain.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const sq = JSON.parse(readFileSync('squelette.json', 'utf8'));
const OUT = 'liens-sujets.json', short = u => +String(u).split('/').pop().replace('T', '');
const limit = process.argv.includes('--limit') ? Number(process.argv[process.argv.indexOf('--limit') + 1]) : Infinity;
const ids = sq.topics.map(t => short(t.id)).slice(0, limit);

let key = process.env.OPENALEX_API_KEY || '';
if (!key && process.env.OPENALEX_KEY_FILE && existsSync(process.env.OPENALEX_KEY_FILE)) key = readFileSync(process.env.OPENALEX_KEY_FILE, 'utf8').trim();
const headers = key ? { authorization: 'Bearer ' + key } : {}; // la clé voyage dans un en-tête, jamais dans une adresse

async function cleActive() { const r = await fetch('https://api.openalex.org/works?per-page=1&select=id', { headers }); return r.ok; }
if (process.argv.includes('--attendre-cle')) {
  if (!key) throw new Error('--attendre-cle demande une clé (OPENALEX_API_KEY ou OPENALEX_KEY_FILE)');
  for (let n = 0; !(await cleActive()); n++) { if (n % 20 === 0) console.log('clé pas encore activée : cliquer sur le lien reçu par e-mail'); if (n > 5760) throw new Error('clé jamais activée'); await sleep(30000); }
  console.log('clé active');
}

const data = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { fetched: null, liens: {} };
const todo = ids.filter(id => !(id in data.liens));
let cost = 0, fait = 0;
const save = () => { data.fetched = new Date().toISOString().slice(0, 10); writeFileSync(OUT, JSON.stringify(data)); };

async function lien(id) {
  let dernier = '';
  for (let essai = 0; essai < 10; essai++) {
    let r; try { r = await fetch(`https://api.openalex.org/works?filter=primary_topic.id:T${id}&group_by=topics.id&per-page=200`, { headers }); } catch (e) { dernier = 'réseau : ' + e.message; await sleep(Math.min(1000 * 2 ** essai, 30000)); continue; }
    if (r.status === 429 || r.status >= 500) { dernier = 'statut ' + r.status; await sleep(Math.min(1000 * 2 ** essai, 30000)); continue; }
    if (!r.ok) throw new Error(`OpenAlex ${r.status} pour le sujet T${id}`);
    const j = await r.json(); cost += j.meta.cost_usd || 0;
    return j.group_by.map(g => [short(g.key), g.count]).filter(([k]) => k !== id).sort((a, b) => b[1] - a[1]).slice(0, 40);
  }
  throw new Error(`trop d'échecs pour le sujet T${id} (dernière erreur : ${dernier})`);
}

console.log(`${todo.length} sujets à mesurer sur ${ids.length}${key ? ' (avec clé)' : ' (sans clé)'}`);
let next = 0;
async function worker() {
  while (next < todo.length) {
    const id = todo[next++]; data.liens[id] = await lien(id); fait++;
    if (fait % 150 === 0) { save(); console.log(`${fait} / ${todo.length}, coût ${cost.toFixed(4)} $`); }
  }
}
try { await Promise.all([worker(), worker(), worker(), worker()]); } finally { save(); }
console.log(`terminé : ${Object.keys(data.liens).length} sujets mesurés, coût ${cost.toFixed(4)} $`);
