// Share images (1200 x 630): the real map, centred on the question, with its statement. One per question page, plus one for the home page.
// Usage: serve docs/ (python -m http.server -d docs 8123), then node build-partage.mjs -> writes docs/partage/*.png (to commit).
// Development tool: needs Playwright (already installed in the cloud environment); not used by the site itself.
import { readdirSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const URL0 = process.env.SITE || 'http://localhost:8123';
const ids = readdirSync('docs/fr/q');
mkdirSync('docs/partage', { recursive: true });
const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.addInitScript(() => localStorage.setItem('theme', 'light'));
await p.goto(URL0 + '/fr/'); await p.waitForTimeout(1500);
await p.addStyleTag({ content: '#mast,#margin,#sheet #marginHandle,#colophon{display:none} #figure{position:absolute;inset:20px}' });
await p.evaluate(() => resize());
const bandeau = (txt, sub) => p.evaluate(([txt, sub]) => {
  document.getElementById('bandeau')?.remove(); const d = document.createElement('div'); d.id = 'bandeau';
  d.style.cssText = 'position:absolute;z-index:9;left:50px;right:50px;bottom:44px;background:var(--paper);border:1px solid var(--ink);padding:14px 18px';
  d.innerHTML = '<div style="font:12px var(--sans);letter-spacing:.22em;text-transform:uppercase;color:var(--dim)">Unknownpedia</div><div style="font:400 34px/1.15 var(--serif);margin-top:4px"></div><div style="font:13px var(--sans);color:var(--dim);margin-top:6px"></div>';
  d.children[1].textContent = txt; d.children[2].textContent = sub; document.getElementById('sheet').appendChild(d);
}, [txt, sub]);
await bandeau('Ce que personne ne sait encore', 'Atlas des questions non résolues de la science · unknownpedia.org'); await p.evaluate(() => { tgt = null; view.x = 0; view.y = 0; view.k = 1.05; }); await p.waitForTimeout(300);
await p.screenshot({ path: 'docs/partage/carte.png' });
for (const id of ids) {
  const r = await p.evaluate(id => { const i = Q.findIndex(q => q.id === id); if (i < 0) return null; const q = Q[i]; tgt = null; view.k = 3.6; view.x = q.x - mx; view.y = q.y - my + 70 / (s0 * view.k); hoverQ = i; return loc(q.qq); }, id);
  if (!r) { console.log('unknown question', id); continue; }
  await bandeau(r, 'Question ouverte · brouillon rédigé avec une IA · unknownpedia.org'); await p.waitForTimeout(300);
  await p.screenshot({ path: `docs/partage/${id}.png` }); console.log(id);
}
await b.close();
