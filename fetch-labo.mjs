// Données de démonstration pour les maquettes « Mystères » et « Folklore » (hors site) : résumé Wikipédia (CC BY-SA), faits Wikidata (CC0), image Wikimedia Commons avec sa licence.
// Usage : node fetch-labo.mjs → écrit labo-data.json et télécharge les images libres dans docs/labo/img/. Attend quand le service limite le débit (429).
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
const UA = { 'user-agent': 'unknownpedia-build/0.1 (open atlas prototype)' };
const get = async url => { for (let i = 0; i < 8; i++) { const r = await fetch(url, { headers: UA }); if (r.status !== 429) { await new Promise(s => setTimeout(s, 800)); return r; } await new Promise(s => setTimeout(s, (+r.headers.get('retry-after') || 15) * 1000 + 500)); } throw new Error('429 ' + url); };
const L = {
  mystere: [['wow', 'Wow!_signal', 'Signal Wow!'], ['voynich', 'Voynich_manuscript', 'Manuscrit de Voynich'], ['roanoke', 'Roanoke_Colony', 'Colonie de Roanoke'], ['phaistos', 'Phaistos_Disc', 'Disque de Phaistos'], ['dyatlov', 'Dyatlov_Pass_incident', 'Incident du col Dyatlov'], ['antikythere', 'Antikythera_mechanism', "Mécanisme d'Anticythère"]],
  folklore: [['mothman', 'Mothman', 'Mothman'], ['yeti', 'Yeti', 'Yéti'], ['kappa', 'Kappa_(folklore)', 'Kappa'], ['nessie', 'Loch_Ness_Monster', 'Monstre du Loch Ness'], ['bermudes', 'Bermuda_Triangle', 'Triangle des Bermudes'], ['dameblanche', 'White_Lady', 'Dame blanche']]
};
mkdirSync('docs/labo/img', { recursive: true });
const out = { fetched: new Date().toISOString().slice(0, 10), mystere: [], folklore: [] };
const claim = (e, p) => (e.claims?.[p] || []).map(c => c.mainsnak?.datavalue?.value).filter(Boolean);
for (const [univ, list] of Object.entries(L)) for (const [id, en, fr] of list) {
  const rec = { id, univ };
  for (const [lg, t] of [['en', en], ['fr', fr]]) { const r = await get(`https://${lg}.wikipedia.org/api/rest_v1/page/summary/` + encodeURIComponent(t.replace(/ /g, '_'))); if (!r.ok) { console.log('manque', lg, t, r.status); continue; } const j = await r.json(); rec[lg] = { t: j.title, d: j.description || '', x: j.extract, u: j.content_urls.desktop.page }; if (lg === 'en') { rec.qid = j.wikibase_item; rec.img = (j.originalimage?.source || j.thumbnail?.source || '').split('?')[0] || null; rec.coord = j.coordinates; } }
  if (rec.qid) { const r = await get(`https://www.wikidata.org/wiki/Special:EntityData/${rec.qid}.json`); if (r.ok) { const e = (await r.json()).entities[rec.qid]; rec.wd = { inception: claim(e, 'P571')[0]?.time || claim(e, 'P585')[0]?.time || claim(e, 'P577')[0]?.time || null, coord: claim(e, 'P625')[0] || null, label: e.labels?.en?.value, inst: claim(e, 'P31').map(v => v.id), country: claim(e, 'P17').map(v => v.id), loc: claim(e, 'P276').map(v => v.id) }; } }
  if (rec.img) { const name = decodeURIComponent(rec.img.split('?')[0].split('/').pop()).replace(/^\d+px-/, ''); const r = await get('https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=extmetadata|url&iiurlwidth=1100&titles=' + encodeURIComponent('File:' + name)); const j = await r.json(), p = Object.values(j.query?.pages || {})[0], ii = p?.imageinfo?.[0];
    if (ii) { const m = ii.extmetadata || {}, lic = m.LicenseShortName?.value || ''; rec.imgmeta = { file: name, lic, author: (m.Artist?.value || '').replace(/<[^>]+>/g, '').slice(0, 120), credit: (m.Credit?.value || '').replace(/<[^>]+>/g, '').slice(0, 160), page: ii.descriptionurl, free: /^(public domain|no restrictions|pd|cc0|cc by(-sa)? \d)/i.test(lic) || /public domain/i.test(m.Copyrighted?.value || '') };
      if (rec.imgmeta.free) { const ir = await get(ii.thumburl || ii.url); const buf = Buffer.from(await ir.arrayBuffer()); const ext = (ii.thumburl || ii.url).split('?')[0].split('.').pop().toLowerCase(); rec.imgfile = `img/${id}.${ext}`; writeFileSync('docs/labo/' + rec.imgfile, buf); } } }
  out[univ].push(rec); console.log(id, rec.qid, rec.imgmeta ? rec.imgmeta.lic + (rec.imgfile ? ' ✓' : ' ✗') : 'pas d\'image');
}
// libellés des QID cités
const ids = [...new Set(Object.values(out).flat().filter(r => r.wd).flatMap(r => [...r.wd.inst, ...r.wd.country, ...r.wd.loc]))];
const lab = {}; for (let i = 0; i < ids.length; i += 40) { const r = await get('https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels&languages=en|fr&ids=' + ids.slice(i, i + 40).join('|')); const j = await r.json(); for (const [k, v] of Object.entries(j.entities || {})) lab[k] = { en: v.labels?.en?.value, fr: v.labels?.fr?.value }; }
out.labels = lab; writeFileSync('labo-data.json', JSON.stringify(out, null, 1) + '\n'); console.log('ok');
