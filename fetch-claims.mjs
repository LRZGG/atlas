// Finds CANDIDATE announcements in public feeds (arXiv API, Quanta RSS) and writes claims-inbox.json.
// Nothing here is verified: items only appear in the app under "Recently detected, not yet assessed".
// A person (or a reviewing AI session) turns a candidate into an entry of ia.json with a verification ladder.
// Usage: node fetch-claims.mjs   (no key needed; run weekly by .github/workflows/frontier.yml)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const KEY = /\b(open problem|conjecture|millennium|erd[őo]s|navier|riemann|lean|formali[sz]|autonomous|language model|llm|AI[- ](?:system|model|agent)|proof)\b/i;
const STRONG = /\b(open problems?|conjectures?|millennium|erd[őo]s|riemann|navier|counterexample|disprov\w*|unsolved)\b/i;
const SPECIFIC = /\b(conjectures?|millennium|erd[őo]s|riemann|navier|counterexample|disprov\w*)\b/i;
const AI = /\b(AI|artificial intelligence|language model|LLM|GPT|Claude|Gemini|DeepMind|OpenAI|Anthropic|agent)\b/i;
const get = async (u) => { const r = await fetch(u, { headers: { 'user-agent': 'unknownpedia-claims-watch (public project)' } }); if (!r.ok) throw new Error(u + ' ' + r.status); return r.text(); };
const strip = s => s.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, '’').replace(/&#8211;/g, '–').replace(/\s+/g, ' ').trim();
const tag = (x, n) => { const m = x.match(new RegExp('<' + n + '[^>]*>([\\s\\S]*?)</' + n + '>')); return m ? strip(m[1]) : ''; };
const items = [];
try { // arXiv: recent papers that mention an AI system and formal proof / open problems
  const q = encodeURIComponent('(abs:"open problem" OR abs:conjecture) AND (abs:"language model" OR abs:"AI system" OR abs:autonomous OR abs:Lean)');
  const x = await get(`https://export.arxiv.org/api/query?search_query=${q}&sortBy=submittedDate&sortOrder=descending&max_results=30`);
  for (const e of x.split('<entry>').slice(1)) { const t = tag(e, 'title'), u = (e.match(/<id>([^<]+)<\/id>/) || [])[1], d = tag(e, 'published').slice(0, 10), s = tag(e, 'summary');
    if (u && AI.test(t + ' ' + s) && (STRONG.test(t) || SPECIFIC.test(s))) items.push({ t, u: u.replace('http://', 'https://'), src: 'arXiv', d, score: (STRONG.test(t) ? 3 : 2) + (/lean/i.test(s) ? 1 : 0) }); }
} catch (e) { console.warn('arXiv failed:', e.message); }
try { // Quanta Magazine RSS
  const x = await get('https://www.quantamagazine.org/feed/');
  for (const e of x.split('<item>').slice(1)) { const t = tag(e, 'title'), u = tag(e, 'link'), d = new Date(tag(e, 'pubDate')).toISOString().slice(0, 10), s = tag(e, 'description');
    if (u && AI.test(t + ' ' + s) && KEY.test(t + ' ' + s)) items.push({ t, u, src: 'Quanta Magazine', d, score: 2 }); }
} catch (e) { console.warn('Quanta failed:', e.message); }
const old = existsSync('claims-inbox.json') ? JSON.parse(readFileSync('claims-inbox.json', 'utf8')).items : [], seen = new Set(), all = [];
for (const it of [...items, ...old]) if (!seen.has(it.u)) { seen.add(it.u); all.push(it); }
all.sort((a, b) => b.d.localeCompare(a.d) || b.score - a.score);
writeFileSync('claims-inbox.json', JSON.stringify({ at: new Date().toISOString(), items: all.slice(0, 60) }, null, 1));
console.log(`${items.length} candidates fetched, ${Math.min(all.length, 60)} kept in claims-inbox.json`);
