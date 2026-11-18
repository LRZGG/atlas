// Mesure les liens entre sujets : pour chaque sujet S, parmi les articles dont le sujet principal est S, quels autres sujets portent-ils aussi ?
// Keeps the 40 most frequent topics. Writes liens-sujets.json and resumes where it stopped if run again.
// Usage: node fetch-liens-sujets.mjs [--limit N] [--wait-key]
//   API key (optional, multiplies the daily budget by 10): OPENALEX_API_KEY variable, or OPENALEX_KEY_FILE pointing to a file that contains it.
//   --wait-key: a freshly requested key only works after clicking the link received by e-mail; the script waits for activation, then starts.
// shortcut: 4 parallel calls and simple resume, no fine budget handling; it stops on error and is rerun the next day.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const sleep = ms => new Promise(r => setTimeout(r, ms));
const sq = JSON.parse(readFileSync('squelette.json', 'utf8'));
const OUT = 'liens-sujets.json', short = u => +String(u).split('/').pop().replace('T', '');
const limit = process.argv.includes('--limit') ? Number(process.argv[process.argv.indexOf('--limit') + 1]) : Infinity;
const ids = sq.topics.map(t => short(t.id)).slice(0, limit);

let key = process.env.OPENALEX_API_KEY || '';
if (!key && process.env.OPENALEX_KEY_FILE && existsSync(process.env.OPENALEX_KEY_FILE)) key = readFileSync(process.env.OPENALEX_KEY_FILE, 'utf8').trim();
const headers = key ? { authorization: 'Bearer ' + key } : {}; // the key travels in a header, never in a URL

async function cleActive() { const r = await fetch('https://api.openalex.org/works?per-page=1&select=id', { headers }); return r.ok; }
if (process.argv.includes('--wait-key')) {
  if (!key) throw new Error('--wait-key needs a key (OPENALEX_API_KEY ou OPENALEX_KEY_FILE)');
  for (let n = 0; !(await cleActive()); n++) { if (n % 20 === 0) console.log('key not active yet: click the link received by e-mail'); if (n > 5760) throw new Error('key never activated'); await sleep(30000); }
  console.log('key active');
}

const data = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { fetched: null, liens: {} };
const todo = ids.filter(id => !(id in data.liens));
let cost = 0, fait = 0;
const save = () => { data.fetched = new Date().toISOString().slice(0, 10); writeFileSync(OUT, JSON.stringify(data)); };

async function lien(id) {
  let dernier = '';
  for (let essai = 0; essai < 10; essai++) {
    let r; try { r = await fetch(`https://api.openalex.org/works?filter=primary_topic.id:T${id}&group_by=topics.id&per-page=200`, { headers }); } catch (e) { dernier = 'network: ' + e.message; await sleep(Math.min(1000 * 2 ** essai, 30000)); continue; }
    if (r.status === 429 || r.status >= 500) { dernier = 'statut ' + r.status; await sleep(Math.min(1000 * 2 ** essai, 30000)); continue; }
    if (!r.ok) throw new Error(`OpenAlex ${r.status} for topic T${id}`);
    const j = await r.json(); cost += j.meta.cost_usd || 0;
    return j.group_by.map(g => [short(g.key), g.count]).filter(([k]) => k !== id).sort((a, b) => b[1] - a[1]).slice(0, 40);
  }
  throw new Error(`too many failures for topic T${id} (last error: ${dernier})`);
}

console.log(`${todo.length} topics to measure out of ${ids.length}${key ? ' (with key)' : ' (without key)'}`);
let next = 0;
async function worker() {
  while (next < todo.length) {
    const id = todo[next++]; data.liens[id] = await lien(id); fait++;
    if (fait % 150 === 0) { save(); console.log(`${fait} / ${todo.length}, cost ${cost.toFixed(4)} $`); }
  }
}
try { await Promise.all([worker(), worker(), worker(), worker()]); } finally { save(); }
console.log(`done: ${Object.keys(data.liens).length} topics measured, cost ${cost.toFixed(4)} $`);
