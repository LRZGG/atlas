// Complète labo-data.json pour les visualisations : dossiers supplémentaires (résumé Wikipédia), et pour tous : nombre d'éditions linguistiques de Wikipédia (via Wikidata), dates, coordonnées, pays d'origine, classes.
// Rien n'est inventé : une donnée absente de Wikidata reste absente (null) et les visualisations le disent.
import { readFileSync, writeFileSync } from 'node:fs';
const UA = { 'user-agent': 'unknownpedia-build/0.1 (open atlas prototype)' };
const get = async url => { for (let i = 0; i < 8; i++) { const r = await fetch(url, { headers: UA }); if (r.status !== 429) { await new Promise(s => setTimeout(s, 700)); return r; } await new Promise(s => setTimeout(s, (+r.headers.get('retry-after') || 15) * 1000 + 500)); } throw new Error('429 ' + url); };
const D = JSON.parse(readFileSync('labo-data.json', 'utf8'));
const MORE = {
  mystere: [['tunguska', 'Tunguska_event', 'Événement de la Toungouska'], ['kryptos', 'Kryptos', 'Kryptos'], ['beale', 'Beale_ciphers', 'Chiffres de Beale'], ['rongorongo', 'Rongorongo', 'Rongorongo'], ['lineara', 'Linear_A', 'Linéaire A'], ['indus', 'Indus_script', "Écriture de l'Indus"], ['danse', 'Dancing_plague_of_1518', 'Épidémie dansante de 1518'], ['flannan', 'Flannan_Isles_Lighthouse', 'Phare des îles Flannan'], ['celeste', 'Mary_Celeste', 'Mary Celeste'], ['earhart', 'Disappearance_of_Amelia_Earhart', "Disparition d'Amelia Earhart"], ['oak', 'Oak_Island_mystery', "Mystère de l'île Oak"], ['taos', 'Taos_Hum', 'Taos Hum'], ['hessdalen', 'Hessdalen_lights', 'Lumières de Hessdalen'], ['nazca', 'Nazca_Lines', 'Lignes de Nazca']],
  folklore: [['jersey', 'Jersey_Devil', 'Diable du New Jersey'], ['chupacabra', 'Chupacabra', 'Chupacabra'], ['bigfoot', 'Bigfoot', 'Bigfoot'], ['banshee', 'Banshee', 'Banshee'], ['wendigo', 'Wendigo', 'Wendigo'], ['kitsune', 'Kitsune', 'Kitsune'], ['slender', 'Slender_Man', 'Slender Man'], ['llorona', 'La_Llorona', 'La Llorona'], ['golem', 'Golem', 'Golem'], ['babayaga', 'Baba_Yaga', 'Baba Yaga'], ['kraken', 'Kraken', 'Kraken'], ['mokele', 'Mokele-mbembe', 'Mokele-mbembe'], ['tengu', 'Tengu', 'Tengu'], ['thunderbird', 'Thunderbird_(mythology)', 'Oiseau-tonnerre']]
};
const have = new Set([...D.mystere, ...D.folklore].map(r => r.id));
for (const [univ, list] of Object.entries(MORE)) for (const [id, en, fr] of list) { if (have.has(id)) continue; const rec = { id, univ, extra: true };
  for (const [lg, t] of [['en', en], ['fr', fr]]) { const r = await get(`https://${lg}.wikipedia.org/api/rest_v1/page/summary/` + encodeURIComponent(t.replace(/ /g, '_'))); if (!r.ok) { console.log('manque', lg, t, r.status); continue; } const j = await r.json(); rec[lg] = { t: j.title, d: j.description || '', x: j.extract, u: j.content_urls.desktop.page }; if (lg === 'en') rec.qid = j.wikibase_item; }
  if (rec.qid) D[univ].push(rec); console.log('+', id, rec.qid); }
const claim = (e, p) => (e.claims?.[p] || []).map(c => c.mainsnak?.datavalue?.value).filter(Boolean);
const need = new Set();
for (const r of [...D.mystere, ...D.folklore]) { const rr = await get(`https://www.wikidata.org/wiki/Special:EntityData/${r.qid}.json`); if (!rr.ok) { console.log('wd?', r.id); continue; } const e = (await rr.json()).entities[r.qid];
  const date = ['P571', 'P575', 'P585', 'P577', 'P1319', 'P580'].map(p => claim(e, p)[0]?.time).find(Boolean) || null;
  const wikis = Object.keys(e.sitelinks || {}).filter(k => /wiki$/.test(k) && !/^(commons|species|meta|wikidata|mediawiki)wiki$/.test(k) && !/^(simple)wiki$/.test(k)).length;
  const place = [...claim(e, 'P276'), ...claim(e, 'P495'), ...claim(e, 'P17')].map(v => v.id), co = claim(e, 'P625')[0];
  r.wd = { ...(r.wd || {}), date, wikis, coord: co ? [co.latitude, co.longitude] : null, place, classes: [...claim(e, 'P31'), ...claim(e, 'P279')].map(v => v.id) }; place.forEach(p => need.add(p)); r.wd.classes.forEach(p => need.add(p)); }
const lab = D.labels || {}, coords = {};
const ids = [...need]; for (let i = 0; i < ids.length; i += 40) { const r = await get('https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels|claims&languages=en|fr&ids=' + ids.slice(i, i + 40).join('|')); const j = await r.json(); for (const [k, v] of Object.entries(j.entities || {})) { lab[k] = { en: v.labels?.en?.value, fr: v.labels?.fr?.value }; const c = claim(v, 'P625')[0]; if (c) coords[k] = [c.latitude, c.longitude]; } }
for (const r of [...D.mystere, ...D.folklore]) if (!r.wd.coord) { const p = r.wd.place.find(x => coords[x]); r.wd.coord = p ? coords[p] : null; r.wd.coordFrom = p ? 'lieu lié : ' + (lab[p]?.fr || lab[p]?.en) : null; } else r.wd.coordFrom = 'coordonnées du sujet';
D.labels = lab; D.plus = new Date().toISOString().slice(0, 10); writeFileSync('labo-data.json', JSON.stringify(D, null, 1) + '\n'); console.log('ok', D.mystere.length, D.folklore.length);
