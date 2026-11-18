// Visualisations « centre de l'univers » pour Mystères et Folklore (maquettes). Données : window.VIZ (voir build-viz.mjs). Aucune bibliothèque, aucun appel externe.
(function () {
  'use strict';
  const D = window.VIZ, I = D.items, W = D.world, byId = {}; I.forEach(i => { byId[i.id] = i; });
  const V = document.getElementById('v'), TABS = document.getElementById('tabs'), CARD = document.getElementById('card'), LEG = document.getElementById('leg');
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const yr = y => y == null ? 'date non renseignée' : y < 0 ? Math.abs(Math.round(y)) + ' av. J.-C.' : String(Math.floor(y));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const px = lon => (lon + 180) / 360 * W.w, py = lat => (84 - clamp(lat, -58, 84)) / 142 * W.h;
  const CODES = D.codes, MK = { non: 'N', exp: 'E', par: 'P', deb: 'D', cls: '?', fol: 'F', tem: 'T', fau: 'C', fic: 'A', leg: 'L' };
  const mk = i => `<span class="mk m-${i.st}" title="${esc(CODES[i.st])}">${MK[i.st]}</span>`;
  function legend(items) { const used = [...new Set(items.map(i => i.st))]; LEG.innerHTML = used.map(c => `<span>${mk({ st: c })} ${esc(CODES[c])}</span>`).join(''); }

  function showCard(id) {
    const i = byId[id]; if (!i) return;
    CARD.innerHTML = `<button class="x" type="button" aria-label="Fermer" data-x>×</button><p class="k">${mk(i)} ${esc(CODES[i.st])}</p><h3>${esc(i.titre)}</h3><p class="d">${esc(i.desc)}</p><dl><dt>Date de référence</dt><dd>${esc(yr(i.year))}</dd><dt>Lieu</dt><dd>${esc(i.place || 'non renseigné')}${i.coordFrom && i.coord ? ' <small>(' + esc(i.coordFrom) + ')</small>' : ''}</dd><dt>Éditions Wikipédia</dt><dd>${i.wikis != null ? i.wikis : 'n. d.'}</dd><dt>Famille (Wikidata)</dt><dd>${esc(i.cls || 'n. d.')}</dd></dl><p class="x2">${esc((i.x || '').slice(0, 360))}${(i.x || '').length > 360 ? '…' : ''}</p><p class="s"><a href="${esc(i.wiki)}" target="_blank" rel="noopener">Wikipédia</a> · <a href="https://www.wikidata.org/wiki/${i.qid}" target="_blank" rel="noopener">Wikidata ${i.qid}</a></p>`;
    CARD.hidden = false; document.querySelectorAll('[data-id]').forEach(e => e.classList.toggle('sel', e.dataset.id === id));
  }
  document.addEventListener('click', e => { if (e.target.closest('[data-x]')) { CARD.hidden = true; document.querySelectorAll('.sel').forEach(x => x.classList.remove('sel')); return; } const t = e.target.closest('[data-id]'); if (t) showCard(t.dataset.id); });
  document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.dataset && e.target.dataset.id) { e.preventDefault(); showCard(e.target.dataset.id); } if (e.key === 'Escape') { CARD.hidden = true; } });

  // Dispose des libellés sans chevauchement : essaie plusieurs positions autour du point, sinon abandonne (le libellé reste dans la fiche).
  function place(items, pos, fs, bd) {
    const B = bd || [2, 2, W.w - 2, W.h - 2], used = [], out = [], cw = fs * .56;
    for (const i of items) { const [x, y] = pos(i), w = i.titre.length * cw + 6, h = fs + 3;
      const c = [[x + 8, y + fs / 3, 'start'], [x - 8, y + fs / 3, 'end'], [x, y - 9, 'middle'], [x, y + fs + 8, 'middle']];
      for (const [tx, ty, a] of c) { const x0 = a === 'start' ? tx : a === 'end' ? tx - w : tx - w / 2, r = [x0, ty - fs, x0 + w, ty + 3]; if (r[0] < B[0] || r[2] > B[2] || r[1] < B[1] || r[3] > B[3]) continue; if (used.some(u => !(r[2] < u[0] || r[0] > u[2] || r[3] < u[1] || r[1] > u[3]))) continue; used.push(r); out.push([i, x, y, tx, ty, a]); break; }
      if (!out.length || out[out.length - 1][0] !== i) out.push([i, x, y, null, null, null]); }
    return out;
  }

  // ---- Vues ----
  // ---- Mappemonde ancienne : deux hémisphères (projection stéréographique équatoriale), mer gravée, rubans de côte, pains à cacheter pour les dossiers ----
  const HM = D.hemi, RR = HM ? HM.R : 240, rad = Math.PI / 180;
  const PJ = (lon, lat, l0) => { const d = (lon - l0) * rad, p = lat * rad, x = Math.cos(p) * Math.sin(d), y = Math.sin(p), z = Math.cos(p) * Math.cos(d); return { x: x / (1 + z) * RR, y: -y / (1 + z) * RR, z }; };
  const SEAL = { non: '#8f1d22', exp: '#4a4a46', par: '#4a4a46', deb: '#8a6a1f', cls: '#8a6a1f', fol: '#3a3a3a', tem: '#8f1d22', fau: '#3a3a3a', fic: '#3a3a3a', leg: '#3a3a3a' };
  function mappemonde(items, opt) {
    const C = [{ k: 'west', cx: 296, cy: 300, l0: HM.west.lon0 }, { k: 'east', cx: 824, cy: 300, l0: HM.east.lon0 }];
    const hemi = h => { const grat = (() => { let d = ''; const seg = pts => { let on = false; pts.forEach(p => { if (p.z >= 0) { d += (on ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1); on = true; } else on = false; }); };
        for (let lo = -180; lo < 180; lo += 15) { const pts = []; for (let la = -90; la <= 90; la += 3) pts.push(PJ(lo, la, h.l0)); seg(pts); }
        for (let la = -75; la <= 75; la += 15) { const pts = []; for (let lo = h.l0 - 90; lo <= h.l0 + 90; lo += 3) pts.push(PJ(lo, la, h.l0)); seg(pts); } return d; })();
      const circ = 2 * Math.PI * (RR + 9), ticks = circ / 72, id = h.k;
      let water = ''; for (let y = -RR; y <= RR; y += 5) { const w = Math.sqrt(RR * RR - y * y); water += `M${-w} ${y}H${w}`; }
      const ripples = [20, 15, 10, 6, 3].map((w, i) => `<use href="#land-${id}" class="rip ${i % 2 ? 'r1' : 'r0'}" style="stroke-width:${w}"/>`).join('');
      return `<g transform="translate(${h.cx} ${h.cy})"><clipPath id="clip-${id}"><circle r="${RR}"/></clipPath><defs><path id="land-${id}" d="${HM[h.k].d}"/></defs>
<circle r="${RR + 9}" class="ringb" style="stroke-dasharray:${ticks} ${ticks}"/><circle r="${RR + 15}" class="ringl"/><circle r="${RR}" class="sea"/>
<g clip-path="url(#clip-${id})"><path d="${water}" class="water"/>${ripples}<use href="#land-${id}" class="land2"/><use href="#land-${id}" class="hatch"/><path d="${grat}" class="gr2"/></g><circle r="${RR}" class="ringc"/></g>`; };
    const lbl = [['Oceanus Atlanticus', -35, 12, 1.0], ['Mare Pacificum', -145, 8, 1.0], ['Oceanus Indicus', 80, -22, 1.0], ['Mare Pacificum', 150, 0, .6], ['AMERICA', -100, 38, 1.4], ['AMERICA', -62, -14, 1.4], ['EUROPA', 12, 49, 1.4], ['AFRICA', 18, 4, 1.4], ['ASIA', 95, 48, 1.4], ['AUSTRALIA', 135, -26, 1.2]].map(([t, lo, la, sz]) => { let best = null; for (const h of C) { const p = PJ(lo, la, h.l0); if (p.z > .35 && (!best || p.z > best.z)) best = { x: h.cx + p.x, y: h.cy + p.y, z: p.z }; } return best ? `<text x="${best.x}" y="${best.y}" text-anchor="middle" class="${sz > 1.1 ? 'cont' : 'oc'}">${t}</text>` : ''; }).join('');
    const loc = items.filter(i => i.coord), no = items.filter(i => !i.coord);
    const pos = i => { let best = null; for (const h of C) { const p = PJ(i.coord[1], i.coord[0], h.l0); if (p.z >= 0 && (!best || p.z > best.z)) best = { x: h.cx + p.x, y: h.cy + p.y, z: p.z }; } return best ? [best.x, best.y] : null; };
    const vis = loc.filter(pos), pl = place(vis, pos, 12.5, [4, 4, 1116, 616]);
    const pins = pl.map(([i, x, y, tx, ty, a]) => `<g class="pin seal" data-id="${i.id}" tabindex="0" role="button" aria-label="${esc(i.titre)}"><circle cx="${x}" cy="${y}" r="13" class="hit"/><circle cx="${x}" cy="${y}" r="8.2" style="fill:${SEAL[i.st]}" class="wax"/><circle cx="${x}" cy="${y}" r="5.6" class="waxin"/><text x="${x}" y="${y + 3.4}" text-anchor="middle" class="wl">${MK[i.st]}</text>${tx != null ? `<text x="${tx}" y="${ty}" text-anchor="${a}" class="lb2">${esc(i.titre)}</text>` : ''}</g>`).join('');
    const rose = (() => { const cx = 560, cy = 590, r = 30; let d = ''; for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8, long = k % 4 === 0 ? r : k % 2 === 0 ? r * .72 : r * .5, w = .16, p0 = [cx + Math.sin(a - w) * r * .18, cy - Math.cos(a - w) * r * .18], p1 = [cx + Math.sin(a) * long, cy - Math.cos(a) * long], p2 = [cx + Math.sin(a + w) * r * .18, cy - Math.cos(a + w) * r * .18]; d += `M${cx} ${cy}L${p0}L${p1}L${p2}Z`; } return `<path d="${d}" class="rose"/><circle cx="${cx}" cy="${cy}" r="${r * .22}" class="roseb"/><text x="${cx}" y="${cy - r - 5}" text-anchor="middle" class="cont" style="font-size:11px">N</text>`; })();
    V.innerHTML = `<p class="note">${esc(opt.note)}</p><div class="mapwrap"><svg class="mappem" viewBox="0 0 1120 626" role="img" aria-label="Mappemonde des dossiers, deux hémisphères"><defs><filter id="wax"><feTurbulence type="fractalNoise" baseFrequency=".08" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .1  0 0 0 .22 0"/></filter><radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".42"/></radialGradient><pattern id="hp" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V4" class="hp"/></pattern></defs>
<rect width="1120" height="626" class="paperbg"/><rect width="1120" height="626" filter="url(#grain)" class="grain"/><rect x="10" y="10" width="1100" height="606" class="nl1"/><rect x="18" y="18" width="1084" height="590" class="nl2"/>
${C.map(hemi).join('')}${lbl}
<text x="560" y="40" text-anchor="middle" class="title">ORBIS DOSSIERUM · Mappemonde des énigmes</text>
<g transform="translate(0 0)">${rose}</g><text x="46" y="598" class="oc" style="font-size:12px;text-anchor:start">Deux hémisphères · projection stéréographique · positions selon Wikidata</text>
<rect width="1120" height="626" fill="url(#vig)" class="vigr"/>${pins}</svg></div>${no.length ? `<p class="note">Sans coordonnées dans Wikidata : ${no.map(i => `<a href="#" data-id="${i.id}">${esc(i.titre)}</a>`).join(', ')}.</p>` : ''}<p class="note small">Fond de carte : ${esc(HM.credit)}. Les rubans le long des côtes, les noms latins et les pains à cacheter sont des conventions de cartes anciennes ; les positions, elles, sont mesurées.</p>`;
  }

  const views = {
    mappemonde,
    salle(items, opt) { views.etagere(items, opt); V.insertAdjacentHTML('afterbegin', '<p class="cta"><a href="archives-3d.html">Entrer dans la salle des archives en 3D →</a></p>'); },
    carte(items, opt) {
      const loc = items.filter(i => i.coord), no = items.filter(i => !i.coord), cr = opt.crop || [-180, 180, 84, -58], bx0 = px(cr[0]), bx1 = px(cr[1]), by0 = py(cr[2]), by1 = py(cr[3]), pl = place(loc, i => [px(i.coord[1]), py(i.coord[0])], 11, [bx0 + 2, by0 + 2, bx1 - 2, by1 - 2]);
      let g = ''; for (let lo = -180; lo <= 180; lo += 30) g += `<line x1="${px(lo)}" y1="0" x2="${px(lo)}" y2="${W.h}"/>`; for (let la = -60; la <= 80; la += 20) g += `<line x1="0" y1="${py(la)}" x2="${W.w}" y2="${py(la)}"/>`;
      const pins = pl.map(([i, x, y, tx, ty, a]) => `<g class="pin" data-id="${i.id}" tabindex="0" role="button" aria-label="${esc(i.titre)}"><circle cx="${x}" cy="${y}" r="9" class="hit"/><circle cx="${x}" cy="${y}" r="4.2" class="dot"/>${tx != null ? `<text x="${tx}" y="${ty}" text-anchor="${a}" class="lb">${esc(i.titre)}</text>` : ''}</g>`).join('');
      V.innerHTML = `<p class="note">${esc(opt.note)}</p><svg class="map" viewBox="${bx0} ${by0} ${bx1 - bx0} ${by1 - by0}" role="img" aria-label="Carte du monde"><g class="grat">${g}</g><path d="${W.d}" class="land"/>${pins}</svg>${no.length ? `<p class="note">Sans coordonnées dans Wikidata : ${no.map(i => `<a href="#" data-id="${i.id}">${esc(i.titre)}</a>`).join(', ')}.</p>` : ''}<p class="note small">Fond de carte : ${esc(W.credit)}.</p>`;
    },
    strates(items) {
      const d = items.filter(i => i.year != null), nd = items.filter(i => i.year == null), NOW = 2026, H = Math.max(940, items.length * 34 + 120), top = 30, f = y => Math.sqrt(Math.max(0, NOW - y)), fm = f(Math.min(...d.map(i => i.year))), Y = y => top + (1 - f(y) / fm) * (H - 2 * top);
      const eras = [[-9999, 500, 'Antiquité'], [500, 1500, 'Moyen Âge'], [1500, 1900, 'Temps modernes'], [1900, 2000, 'XXe siècle'], [2000, 2027, 'XXIe siècle']];
      const mny = Math.min(...d.map(i => i.year)) - 80, bands = eras.map(([a, b, n], k) => { const a2 = Math.max(a, mny), b2 = Math.min(b, NOW); if (b2 <= a2) return ''; const y0 = Y(a2), y1 = Y(b2); return `<rect x="0" y="${y0}" width="1000" height="${y1 - y0}" class="band b${k % 2}"/><text x="14" y="${y0 + 18}" class="era">${n}</text>`; }).join('');
      const ticks = [-1500, 0, 500, 1000, 1500, 1800, 1900, 1950, 2000].filter(t => t >= Math.min(...d.map(i => i.year)) - 80).map(t => `<line x1="150" y1="${Y(t)}" x2="170" y2="${Y(t)}" class="tk"/><text x="146" y="${Y(t) + 4}" text-anchor="end" class="tt">${esc(yr(t))}</text>`).join('');
      const s = d.slice().sort((a, b) => a.year - b.year), ly = s.map(i => Y(i.year)); for (let k = 1; k < ly.length; k++) ly[k] = Math.max(ly[k], ly[k - 1] + 24); if (ly.length && ly[ly.length - 1] > H - 14) { ly[ly.length - 1] = H - 14; for (let k = ly.length - 2; k >= 0; k--) ly[k] = Math.min(ly[k], ly[k + 1] - 24); }
      const rows = s.map((i, k) => `<g class="row" data-id="${i.id}" tabindex="0" role="button" aria-label="${esc(i.titre)}"><line x1="170" y1="${Y(i.year)}" x2="215" y2="${ly[k]}" class="ld"/><circle cx="170" cy="${Y(i.year)}" r="4" class="dot"/><text x="222" y="${ly[k] + 4}" class="lb">${esc(i.titre)} <tspan class="yy">${esc(yr(i.year))}</tspan></text></g>`).join('');
      V.innerHTML = `<p class="note">La profondeur est le temps : plus c'est ancien, plus on descend. Échelle en racine carrée du nombre d'années écoulées (les siècles récents sont dilatés pour rester lisibles).</p><svg viewBox="0 0 1000 ${H}" role="img" aria-label="Strates chronologiques">${bands}<line x1="170" y1="${top}" x2="170" y2="${H - top}" class="ax"/>${ticks}${rows}</svg>${nd.length ? `<p class="note">Date non renseignée dans Wikidata : ${nd.map(i => `<a href="#" data-id="${i.id}">${esc(i.titre)}</a>`).join(', ')}.</p>` : ''}`;
    },
    liste(items) {
      let q = '', st = null, key = 'titre', dir = 1; const names = { titre: 'Titre', year: 'Date', wikis: 'Attention', st: 'Statut' };
      const draw = () => { const f = items.filter(i => (!st || i.st === st) && (!q || (i.titre + ' ' + (i.place || '')).toLowerCase().includes(q))).sort((a, b) => { const x = a[key], y = b[key]; if (x == null) return 1; if (y == null) return -1; return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y), 'fr')) * dir; });
        const used = [...new Set(items.map(i => i.st))], mx = Math.max(...items.map(i => i.wikis || 0));
        V.innerHTML = `<div class="lst"><div class="lh"><span>REGISTRE DES DOSSIERS</span><span>${f.length} / ${items.length} inscrits</span></div>
<div class="ctl"><label>Chercher <input type="search" id="lq" value="${esc(q)}" placeholder="titre ou lieu" autocomplete="off"></label><span class="chips">${used.map(c => `<button type="button" data-st="${c}" aria-pressed="${st === c}">${MK[c]} ${esc(CODES[c])}</button>`).join('')}</span><span class="chips">Classer par ${Object.entries(names).map(([k, n]) => `<button type="button" data-sk="${k}" aria-pressed="${key === k}">${n}${key === k ? (dir > 0 ? ' ↑' : ' ↓') : ''}</button>`).join('')}</span></div>
<ol class="rows">${f.map((i, n) => `<li class="r" data-id="${i.id}" tabindex="0" role="button"><span class="no">${String(n + 1).padStart(3, '0')}</span><span class="ti">${esc(i.titre.toUpperCase())}</span><i class="dl"></i><span class="da">${esc(i.year == null ? 'sans date' : yr(i.year))}</span><span class="sa">${mk(i)} ${esc(CODES[i.st])}</span><span class="xx" title="${i.wikis != null ? i.wikis + ' langues de Wikipédia' : ''}">${'x'.repeat(Math.round((i.wikis || 0) / mx * 14))}</span></li>`).join('')}</ol>
<p class="tot">${f.length ? '' : 'Aucun dossier ne correspond. '}Total : ${f.length} dossier(s) · ${f.filter(i => i.st === 'non').length} non résolu(s) · ligne de x = nombre de langues de Wikipédia (14 x = le plus grand dossier).</p></div>`;
        const inp = V.querySelector('#lq'); inp.oninput = () => { q = inp.value.toLowerCase().trim(); const p = inp.selectionStart; draw(); const n = V.querySelector('#lq'); n.focus(); n.setSelectionRange(p, p); };
        V.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { st = st === b.dataset.st ? null : b.dataset.st; draw(); });
        V.querySelectorAll('[data-sk]').forEach(b => b.onclick = () => { const k = b.dataset.sk; if (k === key) dir = -dir; else { key = k; dir = 1; } draw(); }); };
      draw();
    },
    registre(items) {
      let key = 'titre', dir = 1; const cols = [['titre', 'Dossier'], ['year', 'Date'], ['place', 'Lieu'], ['st', 'Statut'], ['wikis', 'Wikipédia (langues)']];
      const mx = Math.max(...items.map(i => i.wikis || 0));
      const draw = () => { const s = items.slice().sort((a, b) => { const x = a[key], y = b[key]; if (x == null) return 1; if (y == null) return -1; return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y), 'fr')) * dir; });
        V.innerHTML = `<table class="reg"><thead><tr>${cols.map(([k, n]) => `<th><button type="button" data-sort="${k}" aria-sort="${k === key ? (dir > 0 ? 'ascending' : 'descending') : 'none'}">${n}${k === key ? (dir > 0 ? ' ▲' : ' ▼') : ''}</button></th>`).join('')}</tr></thead><tbody>${s.map(i => `<tr data-id="${i.id}" tabindex="0"><td><b>${esc(i.titre)}</b></td><td>${esc(i.year == null ? '—' : yr(i.year))}</td><td>${esc(i.place || '—')}</td><td>${mk(i)} ${esc(CODES[i.st])}</td><td class="bar"><i style="width:${(i.wikis || 0) / mx * 100}%"></i><span>${i.wikis != null ? i.wikis : '—'}</span></td></tr>`).join('')}</tbody></table>`;
        V.querySelectorAll('[data-sort]').forEach(b => b.onclick = () => { const k = b.dataset.sort; if (k === key) dir = -dir; else { key = k; dir = 1; } draw(); }); };
      draw();
    },
    etagere(items, opt) {
      const s = items.slice().sort((a, b) => (b.wikis || 0) - (a.wikis || 0));
      V.innerHTML = `<p class="note">${esc(opt.note)}</p><div class="shelf">${s.map(i => `<button type="button" class="spine st-${i.st}" data-id="${i.id}" style="width:${Math.round(22 + 6.2 * Math.sqrt(i.wikis || 1))}px" aria-label="${esc(i.titre)}"><span class="n">${esc(i.titre)}</span><span class="c">${mk(i)}</span><span class="w">${i.wikis != null ? i.wikis : ''}</span></button>`).join('')}</div>`;
    },
    nuage(items) {
      const d = items.filter(i => i.year != null && i.wikis != null), nd = items.filter(i => !(i.year != null && i.wikis != null)), NOW = 2026, X0 = 90, X1 = 960, Y0 = 520, Y1 = 40;
      const fx = a => Math.log10(Math.max(a, 1)), xa = i => NOW - i.year, mxl = Math.log10(Math.max(...d.map(xa)) * 1.15), mnl = 0.9, X = a => X0 + (fx(a) - mnl) / (mxl - mnl) * (X1 - X0), mw = Math.max(...d.map(i => i.wikis)) * 1.1, Y = w => Y0 - w / mw * (Y0 - Y1);
      const xt = [10, 30, 100, 300, 1000, 3000].filter(t => t < Math.pow(10, mxl)).map(t => `<line x1="${X(t)}" y1="${Y0}" x2="${X(t)}" y2="${Y1}" class="gr"/><text x="${X(t)}" y="${Y0 + 18}" text-anchor="middle" class="tt">${t} ans</text>`).join('');
      const yt = [0, 20, 40, 60, 80, 100, 120].filter(t => t < mw).map(t => `<line x1="${X0}" y1="${Y(t)}" x2="${X1}" y2="${Y(t)}" class="gr"/><text x="${X0 - 8}" y="${Y(t) + 4}" text-anchor="end" class="tt">${t}</text>`).join('');
      const pl = place(d, i => [X(xa(i)), Y(i.wikis)], 11), W2 = { ...W, w: 1000, h: 560 };
      const pts = pl.map(([i, x, y, tx, ty, a]) => `<g class="pin" data-id="${i.id}" tabindex="0" role="button" aria-label="${esc(i.titre)}"><circle cx="${x}" cy="${y}" r="9" class="hit"/><circle cx="${x}" cy="${y}" r="4.6" class="dot"/>${tx != null ? `<text x="${tx}" y="${ty}" text-anchor="${a}" class="lb">${esc(i.titre)}</text>` : ''}</g>`).join('');
      V.innerHTML = `<p class="note">Chaque point : l'ancienneté du dossier (axe horizontal, échelle logarithmique, vers la gauche = récent) et le nombre de langues de Wikipédia qui ont un article dessus (axe vertical), une mesure de l'attention mondiale, pas de la vérité.</p><svg viewBox="0 0 1000 560" role="img" aria-label="Âge et attention des dossiers">${xt}${yt}<line x1="${X0}" y1="${Y0}" x2="${X1}" y2="${Y0}" class="ax"/><line x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y1}" class="ax"/><text x="${(X0 + X1) / 2}" y="552" text-anchor="middle" class="tt">ancienneté du dossier</text><text transform="translate(18 ${(Y0 + Y1) / 2}) rotate(-90)" text-anchor="middle" class="tt">langues de Wikipédia</text>${pts}</svg>${nd.length ? `<p class="note">Données manquantes (date ou langues) : ${nd.map(i => `<a href="#" data-id="${i.id}">${esc(i.titre)}</a>`).join(', ')}.</p>` : ''}`;
    },
    arbre(items) {
      const groups = {}; items.forEach(i => { (groups[i.cls || 'famille non renseignée'] = groups[i.cls || 'famille non renseignée'] || []).push(i); });
      const G = Object.entries(groups).sort((a, b) => b[1].length - a[1].length), cx = 500, cy = 470, R1 = 175, R2 = 395, n = items.length; let k = 0, out = '', lab = '';
      for (const [name, arr] of G) { const a0 = k / n * 2 * Math.PI - Math.PI / 2, a1 = (k + arr.length) / n * 2 * Math.PI - Math.PI / 2, am = (a0 + a1) / 2; const gx = cx + Math.cos(am) * R1, gy = cy + Math.sin(am) * R1;
        out += `<line x1="${cx}" y1="${cy}" x2="${gx}" y2="${gy}" class="ld"/><circle cx="${gx}" cy="${gy}" r="5" class="gdot"/>`;
        lab += `<text x="${gx + Math.cos(am) * 12}" y="${gy + Math.sin(am) * 12 + 4}" text-anchor="${Math.cos(am) > 0 ? 'start' : 'end'}" class="gl">${esc(name)}</text>`;
        arr.forEach((i, j) => { const a = a0 + (j + .5) / arr.length * (a1 - a0), lx = cx + Math.cos(a) * R2, ly = cy + Math.sin(a) * R2, right = Math.cos(a) >= 0;
          out += `<g class="leaf" data-id="${i.id}" tabindex="0" role="button" aria-label="${esc(i.titre)}"><line x1="${gx}" y1="${gy}" x2="${lx}" y2="${ly}" class="ld"/><circle cx="${lx}" cy="${ly}" r="4" class="dot"/><text x="${lx + (right ? 9 : -9)}" y="${ly + 4}" text-anchor="${right ? 'start' : 'end'}" class="lb">${esc(i.titre)}</text></g>`; });
        k += arr.length; }
      V.innerHTML = `<p class="note">Les dossiers sont regroupés selon la classe que leur donne Wikidata (« instance de » ou « sous-classe de »), pas selon notre jugement. Les familles à un seul dossier montrent que la classification de Wikidata est inégale.</p><svg viewBox="0 0 1000 940" role="img" aria-label="Arbre des familles">${out}<circle cx="${cx}" cy="${cy}" r="7" class="root"/>${lab}</svg>`;
    },
    abece(items) {
      const s = items.slice().sort((a, b) => a.titre.localeCompare(b.titre, 'fr')), L = {}; s.forEach(i => { const c = i.titre[0].toUpperCase(); (L[c] = L[c] || []).push(i); });
      V.innerHTML = `<div class="abc">${Object.entries(L).map(([c, a]) => `<section><h4>${esc(c)}</h4>${a.map(i => `<button type="button" class="plate" data-id="${i.id}">${i.img ? `<img src="${esc(i.img)}" alt="" loading="lazy">` : '<span class="noimg">pas d\'image libre</span>'}<b>${esc(i.titre)}</b><small>${mk(i)} ${esc(CODES[i.st])}</small></button>`).join('')}</section>`).join('')}</div>`;
    },
    frise(items) {
      const d = items.filter(i => i.year != null).sort((a, b) => a.year - b.year), nd = items.filter(i => i.year == null), mn = d[0] ? d[0].year : 1800, NOW = 2026, X0 = 40, X1 = 960, f = y => Math.sqrt(NOW - y), fm = f(mn), X = y => X0 + (1 - f(y) / fm) * (X1 - X0);
      const pl = place(d, i => [X(i.year), 160], 11); const rows = pl.map(([i, x, y, tx, ty, a], k) => `<g class="pin" data-id="${i.id}" tabindex="0" role="button" aria-label="${esc(i.titre)}"><line x1="${x}" y1="160" x2="${x}" y2="${60 + (k % 4) * 24}" class="ld"/><circle cx="${x}" cy="160" r="4.6" class="dot"/><text x="${x}" y="${52 + (k % 4) * 24}" text-anchor="middle" class="lb">${esc(i.titre)} ${esc(yr(i.year))}</text></g>`).join('');
      const tk = [-1500, 0, 1000, 1500, 1800, 1900, 1950, 2000].filter(t => t >= mn - 50).map(t => `<line x1="${X(t)}" y1="160" x2="${X(t)}" y2="172" class="tk"/><text x="${X(t)}" y="188" text-anchor="middle" class="tt">${esc(yr(t))}</text>`).join('');
      V.innerHTML = `<p class="note">Quand le récit a-t-il une date connue ? Seuls les dossiers datés dans Wikidata figurent sur la frise (échelle en racine carrée : le passé récent est dilaté). Les autres sont listés dessous, sans date inventée.</p><svg viewBox="0 0 1000 220" role="img" aria-label="Frise des dates"><line x1="${X0}" y1="160" x2="${X1}" y2="160" class="ax"/>${tk}${rows}</svg><p class="note">Date non renseignée : ${nd.map(i => `<a href="#" data-id="${i.id}">${esc(i.titre)}</a>`).join(', ')}.</p>`;
    },
    colonnes(items) {
      const cols = {}; items.forEach(i => { (cols[i.st] = cols[i.st] || []).push(i); });
      V.innerHTML = `<p class="note">Les statuts sont ceux de la maquette (éditoriaux, non validés). Un dossier appartient à une seule colonne : on voit d'un coup d'œil ce qui relève du fait, du récit ou du canular.</p><div class="cols">${Object.entries(cols).map(([c, a]) => `<section><h4>${mk({ st: c })} ${esc(CODES[c])} <small>${a.length}</small></h4>${a.map(i => `<button type="button" class="chip" data-id="${i.id}">${esc(i.titre)}</button>`).join('')}</section>`).join('')}</div>`;
    }
  };

  const cfg = D.views; let cur = 0;
  function show(k) { cur = k; const c = cfg[k]; TABS.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-selected', String(j === k))); CARD.hidden = true; views[c.fn](I, c); legend(I); location.hash = c.id; }
  TABS.innerHTML = cfg.map((c, k) => `<button type="button" role="tab" aria-selected="false" data-k="${k}"><b>${String.fromCharCode(65 + k)}</b> ${esc(c.nom)}</button>`).join('');
  TABS.onclick = e => { const b = e.target.closest('button'); if (b) show(+b.dataset.k); };
  const h = cfg.findIndex(c => c.id === location.hash.slice(1)); show(h >= 0 ? h : 0);
  const th = document.getElementById('theme'); if (th) { th.onclick = () => { const d = document.documentElement; d.dataset.theme = d.dataset.theme === 'dark' ? 'light' : 'dark'; }; }
})();
