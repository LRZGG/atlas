// Checks the sources of the verification ladders in ia.json: reachable? enough independent publishers for each "yes"?
// Writes checks/claims.md. A 403 means "blocked for robots", not "broken". Usage: node check-claims.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const E = JSON.parse(readFileSync('ia.json', 'utf8')).entries.filter(e => e.ladder), out = ['# Claim sources check', '', `Run: ${new Date().toISOString()}`, ''];
const status = async u => { try { const r = await fetch(u, { method: 'GET', redirect: 'follow', headers: { 'user-agent': 'unknownpedia-claims-check (public project)' } }); return r.status; } catch { return 'error'; } };
let bad = 0;
for (const e of E) { out.push(`## ${e.id}`, `Last checked by a person: ${e.checked}`, '');
  for (const r of e.ladder) { const pubs = new Set(r.src.map(s => s.pub)), ok = r.src.some(s => s.primary) || pubs.size >= 2;
    if (r.s === 'yes' && !ok) { out.push(`- **${r.k}**: marked yes with one non-primary source (the build shows it as partial)`); bad++; }
    for (const s of r.src) { const c = await status(s.u); const tag = c === 200 ? 'ok' : c === 403 ? 'blocked for robots (not necessarily broken)' : `PROBLEM (${c})`; if (c !== 200 && c !== 403) bad++; out.push(`- ${r.k}: ${s.pub} ${s.u} → ${tag}`); } }
  out.push(''); }
mkdirSync('checks', { recursive: true }); writeFileSync('checks/claims.md', out.join('\n')); console.log(`${E.length} claims checked, ${bad} problem(s). See checks/claims.md`);
