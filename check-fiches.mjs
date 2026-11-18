// Automatic check of the fiches (no AI, no network): flags what a human should look at first.
// Usage: node check-fiches.mjs  -> writes checks/report.json and checks/report.md
// Human decisions (who ruled, when) live in checks/decisions.json: a decided point is no longer "open".
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const qs = JSON.parse(readFileSync('questions.json', 'utf8')).questions.filter(q => q.fiche), FI = JSON.parse(readFileSync('fiches.json', 'utf8')).fiches;
const DEC = existsSync('checks/decisions.json') ? JSON.parse(readFileSync('checks/decisions.json', 'utf8')) : [];
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
// Numbers of at least 2 digits, thousands separators removed (1 420, 1,420), English ordinals (19th) ignored.
const digits = s => (String(s).replace(/\b\d{1,2}(st|nd|rd|th)\b/g, ' ').replace(/(\d)[,   ](?=\d{3}\b)/g, '$1').match(/\d+/g) || []).filter(x => x.length >= 2);
const key = (id, type, text) => id + ':' + type + ':' + createHash('sha1').update(text).digest('hex').slice(0, 8);
const out = { date: new Date().toISOString().slice(0, 10), fiches: {} }; let total = 0, open = 0;
for (const q of qs) {
  const f = q.fiche, fi = FI[q.id] || { w: {}, r: [] }, pts = [];
  const add = (type, text) => { const k = key(q.id, type, text), d = DEC.find(x => x.key === k); pts.push({ key: k, type, text, status: d ? d.status : 'open', by: d ? d.by : null, date: d ? d.date : null }); };
  const all = lang => [...(f[lang]?.savoir || []), ...(f[lang]?.ignore || []), ...(f[lang]?.dur || []), f[lang]?.enjeu || '', ...(f[lang]?.commencer || [])].join(' ');
  const textFr = all('fr'), textEn = all('en');
  // 1. References
  if (!fi.r.length) add('no-reference', 'The fiche cites no article or document verified in OpenAlex.');
  // 2. Numbers: any number of 2+ digits must appear in the Wikipedia excerpt, a reference title or year, or the question's statement or context.
  const sources = norm([fi.w?.fr?.x, fi.w?.en?.x, ...fi.r.map(r => r.t + ' ' + r.y), q.q.fr, q.q.en, q.ctx.fr, q.ctx.en].join(' ')).replace(/[   ]/g, '');
  const seen = new Set();
  for (const n of digits(textFr)) { if (seen.has(n)) continue; seen.add(n); if (!sources.includes(n)) add('number-without-source', `The number "${n}" appears neither in the Wikipedia excerpt, nor in the references, nor in the question statement: to verify.`); }
  // 3. French / English parity: same numbers on both sides.
  if (textEn) { const a = new Set(digits(textFr)), b = new Set(digits(textEn)); for (const n of a) if (!b.has(n)) add('fr-en-mismatch', `The number "${n}" is in the French version but not in the English one.`); for (const n of b) if (!a.has(n)) add('fr-en-mismatch', `The number "${n}" is in the English version but not in the French one.`); }
  else add('no-translation', 'No English version of the fiche.');
  // 4. Off-topic references? A word of 6+ letters of the title should appear in the excerpt or the English text of the fiche.
  const ref = norm([fi.w?.en?.x, textEn, q.q.en, q.nom?.en].join(' '));
  for (const r of fi.r) { if (!r.y) continue; const words = norm(r.t).split(/[^a-z]+/).filter(w => w.length > 5); if (words.length && !words.some(w => ref.includes(w.slice(0, 6)))) add('reference-off-topic', `No word of the title of "${r.t}" is found in the fiche: reference to verify.`); }
  // 5. Strong claims ("proved", "never", "no ...") must be backed by a source.
  for (const s of [...(f.fr.savoir || []), ...(f.fr.ignore || [])]) if (/\b(démontr|prouv|jamais|aucun[e]? )/i.test(s)) add('strong-claim', `Strong claim to confirm with a source: "${s.slice(0, 140)}${s.length > 140 ? '…' : ''}"`);
  // 6. Review
  if (!f.relue) add('not-reviewed', 'No named specialist has reviewed this fiche.');
  out.fiches[q.id] = pts; total += pts.length; open += pts.filter(p => p.status === 'open').length;
}
mkdirSync('checks', { recursive: true }); writeFileSync('checks/report.json', JSON.stringify(out, null, 1) + '\n');
const T = { 'no-reference': 'No reference', 'number-without-source': 'Numbers without a source', 'fr-en-mismatch': 'FR / EN mismatches', 'no-translation': 'No translation', 'reference-off-topic': 'References possibly off-topic', 'strong-claim': 'Strong claims', 'not-reviewed': 'Not reviewed' };
let md = `# Automatic fiche check\n\nGenerated on ${out.date} by \`check-fiches.mjs\` (no AI, no network). ${open} open point(s) out of ${total}, ${Object.keys(out.fiches).length} fiches.\n\nAn open point is a **question put to a human**, not a confirmed error. To rule on it: open a "Correct a fiche" issue on GitHub, or add a line to \`checks/decisions.json\` (\`key\`, \`status\`: confirmed / corrected / rejected, \`by\`, \`date\`).\n\n`;
for (const [id, pts] of Object.entries(out.fiches)) { md += `<a id="${id}"></a>\n## ${id}\n\n`; const o = pts.filter(p => p.status === 'open' && p.type !== 'not-reviewed'); md += (o.length ? o.map(p => `- **${T[p.type]}**: ${p.text}  \n  \`${p.key}\``).join('\n') : '- No open point apart from review.') + '\n\n'; }
writeFileSync('checks/report.md', md); if (!existsSync('checks/decisions.json')) writeFileSync('checks/decisions.json', '[]\n');
console.log(`${open} open points out of ${total} (${Object.keys(out.fiches).length} fiches)`);
