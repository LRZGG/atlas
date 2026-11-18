// « La salle des archives » : une travée d'étagères métalliques en 3D (WebGL, three.js hébergé sur place). Chaque boîte est un dossier ; son épaisseur est le nombre de langues de Wikipédia.
// On parcourt la travée au glisser, on trie les boîtes (elles glissent à leur nouvelle place), on sort une boîte pour ouvrir sa fiche. Lampe torche : la salle s'éteint, le curseur éclaire.
import * as THREE from './vendor/three.module.js';
const A = window.ARC, TH = Object.assign({ base: ['#b29a72', '#c9b58b', '#a98f66'], label: '#efe9d6', ink: '#1d1c1b', dim: '#5a5750', font: 'Special Elite', card: 0xb59d74, top: 0x9a8461, wall: 0x1b2321, stat: null }, A.theme || {}), I = A.items, CODES = A.codes, MK = { non: 'N', exp: 'E', par: 'P', deb: 'D', cls: '?', fol: 'F', tem: 'T', fau: 'C', fic: 'A', leg: 'L' };
const $ = id => document.getElementById(id), esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const yr = y => y == null ? 'date non renseignée' : y < 0 ? Math.abs(Math.round(y)) + ' av. J.-C.' : String(Math.floor(y));
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const STAT0 = { non: '#8f1d22', exp: '#2e3a34', par: '#2e3a34', deb: '#8a6a1f', cls: '#8a6a1f', fol: '#26292b', tem: '#8f1d22', fau: '#26292b', fic: '#26292b', leg: '#26292b' };
const STAT = new Proxy(STAT0, { get: (t, k) => TH.stat || t[k] });

function fail(msg) { $('fallback').hidden = false; $('fallback').querySelector('p').textContent = msg; $('ui').hidden = true; }
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas: $('gl'), antialias: true, powerPreference: 'high-performance' }); } catch (e) { fail("Votre navigateur ne sait pas afficher la 3D (WebGL). Voici la vue à plat des mêmes dossiers."); throw e; }
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .85;
renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x060809); scene.fog = new THREE.FogExp2(0x060809, .075);
const camera = new THREE.PerspectiveCamera(38, 1, .1, 60);

// ---- Les boîtes ----
await Promise.all([document.fonts.load('20px "' + TH.font + '"'), document.fonts.load('16px "Courier Prime"')]);
const thick = i => .2 + .052 * Math.sqrt(i.wikis || 4), BH = 1.08, BD = .82, GAP = .028, ROWS = 3, ROWY = [0, 1.26, 2.52];
function spine(item, w) {
  const S = 460, pw = Math.max(96, Math.round(w * S)), ph = Math.round(BH * S), c = document.createElement('canvas'); c.width = pw; c.height = ph; const g = c.getContext('2d');
  const base = g.createLinearGradient(0, 0, pw, 0); base.addColorStop(0, TH.base[0]); base.addColorStop(.5, TH.base[1]); base.addColorStop(1, TH.base[2]); g.fillStyle = base; g.fillRect(0, 0, pw, ph);
  for (let k = 0; k < pw * ph / 60; k++) { g.fillStyle = `rgba(${Math.random() < .5 ? '60,40,10' : '255,240,200'},${Math.random() * .08})`; g.fillRect(Math.random() * pw, Math.random() * ph, 1 + Math.random() * 2, 1); }
  g.fillStyle = STAT[item.st]; g.fillRect(0, 0, pw, ph * .035);                                  // bandeau de statut
  g.fillStyle = '#2a2016'; g.beginPath(); g.ellipse(pw / 2, ph * .105, pw * .2, ph * .03, 0, 0, 7); g.fill(); g.strokeStyle = '#00000055'; g.lineWidth = 3; g.stroke(); // trou de préhension
  const lx = pw * .13, ly = ph * .2, lw = pw * .74, lh = ph * .74; g.fillStyle = TH.label; g.fillRect(lx, ly, lw, lh); g.strokeStyle = '#2a2016'; g.lineWidth = 2; g.strokeRect(lx + 4, ly + 4, lw - 8, lh - 8);
  g.save(); g.translate(lx + lw / 2, ly + lh / 2); g.rotate(-Math.PI / 2);                              // texte vertical, de bas en haut
  const tt = item.titre.toUpperCase(); let fs = Math.min(lw * .5, 40); g.font = `${fs}px "${TH.font}"`; while (g.measureText(tt).width > lh - 80 && fs > 14) { fs -= 2; g.font = `${fs}px "${TH.font}"`; }
  g.fillStyle = TH.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tt, 0, -lw * .1);
  g.font = `${Math.min(lw * .26, 22)}px "Courier Prime"`; g.fillStyle = TH.dim; g.fillText('UNK-' + item.id.toUpperCase() + (item.year != null ? ' · ' + yr(item.year) : ''), 0, lw * .26); g.restore();
  g.fillStyle = STAT[item.st]; g.fillRect(lx + 8, ly + 8, pw * .2, pw * .2); g.fillStyle = TH.label; g.font = `700 ${pw * .15}px "${TH.font}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(MK[item.st], lx + 8 + pw * .1, ly + 8 + pw * .105);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const cardMat = new THREE.MeshStandardMaterial({ color: TH.card, roughness: .92 }), topMat = new THREE.MeshStandardMaterial({ color: TH.top, roughness: .95 });
const boxes = I.map(item => { const w = thick(item), mat = new THREE.MeshStandardMaterial({ map: spine(item, w), roughness: .85 }), m = new THREE.Mesh(new THREE.BoxGeometry(w, BH, BD), [cardMat, cardMat, topMat, topMat, mat, cardMat]); m.castShadow = true; m.receiveShadow = true; m.userData.item = item; scene.add(m); return { item, w, mesh: m, bx: 0, by: 0, pull: 0, pullT: 0, rot: 0, rotT: 0 }; });
const byMesh = new Map(boxes.map(b => [b.mesh, b]));

// ---- La travée : sol, mur, montants, planches, plaques de rangée ----
const mkS = (w, h, d, color, metal) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, metalness: metal ? .65 : 0, roughness: metal ? .42 : .9 })); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; };
const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x141718, roughness: .78 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -.06; floor.receiveShadow = true; scene.add(floor);
const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 14), new THREE.MeshStandardMaterial({ color: TH.wall, roughness: .95 })); wall.position.set(0, 5.5, -.55); wall.receiveShadow = true; scene.add(wall);
const ROWW = 5.6, boards = [], plaques = [];
for (let r = 0; r < ROWS; r++) { const b = mkS(ROWW + .4, .05, BD + .08, 0x535a5f, true); b.position.set(0, ROWY[r] - .025, 0); boards.push(b);
  const lip = mkS(ROWW + .4, .1, .02, 0x535a5f, true); lip.position.set(0, ROWY[r] - .06, BD / 2 + .05);
  const pc = document.createElement('canvas'); pc.width = 768; pc.height = 96; const pt = new THREE.CanvasTexture(pc); pt.colorSpace = THREE.SRGBColorSpace; const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.35, .17), new THREE.MeshBasicMaterial({ map: pt })); pl.position.set(-ROWW / 2 + .9, ROWY[r] - .075, BD / 2 + .062); scene.add(pl); plaques.push({ c: pc, t: pt }); }
for (const x of [-ROWW / 2 - .2, -ROWW / 2 + 1.9, ROWW / 2 - 1.9, ROWW / 2 + .2]) for (const z of [-BD / 2 - .02, BD / 2 + .02]) { const p = mkS(.06, ROWY[ROWS - 1] + 1.5, .06, 0x3d4448, true); p.position.set(x, (ROWY[ROWS - 1] + 1.3) / 2 - .05, z); }
const top = mkS(ROWW + .4, .05, BD + .08, 0x535a5f, true); top.position.set(0, ROWY[ROWS - 1] + 1.3, 0);

// La feuille du dossier : tapée sur une texture, elle sort de la boîte sélectionnée.
const SW = .66, SH = .86, sheet = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), new THREE.MeshStandardMaterial({ roughness: .9, side: THREE.DoubleSide })); sheet.castShadow = true; sheet.visible = false; let slide = 0, slideT = 0, sheetOwner = null;
function sheetTex(i) { const c = document.createElement('canvas'); c.width = 660; c.height = 860; const g = c.getContext('2d'); g.fillStyle = '#f3efe3'; g.fillRect(0, 0, 660, 860); for (let k = 0; k < 4000; k++) { g.fillStyle = `rgba(80,60,20,${Math.random() * .05})`; g.fillRect(Math.random() * 660, Math.random() * 860, 2, 1); }
  g.fillStyle = '#1d1c1b'; g.font = '19px "Special Elite"'; g.fillText('UNKNOWNPEDIA · NOTE DE DOSSIER', 40, 56); g.fillRect(40, 66, 580, 2); g.font = '34px "Special Elite"';
  const wrap = (t, x, y, w, lh, n) => { const words = t.split(' '); let l = '', k = 0; for (const wd of words) { if (g.measureText(l + wd).width > w) { g.fillText(l, x, y + k * lh); l = ''; k++; if (k >= n) return; } l += wd + ' '; } g.fillText(l, x, y + k * lh); };
  g.fillStyle = '#1d1c1b'; wrap(i.titre.toUpperCase(), 40, 120, 580, 40, 2); g.font = '20px "Courier Prime"'; g.fillStyle = '#8f1d22'; g.fillText(CODES[i.st].toUpperCase(), 40, 220);
  g.fillStyle = '#1d1c1b'; g.fillText('Date : ' + yr(i.year), 40, 262); g.fillText('Lieu : ' + (i.place || 'non renseigné').slice(0, 40), 40, 290); g.fillText('Wikipédia : ' + (i.wikis != null ? i.wikis + ' langues' : 'n. d.'), 40, 318);
  g.font = '18px "Courier Prime"'; g.fillStyle = '#333'; wrap((i.x || '').slice(0, 520), 40, 372, 580, 28, 14);
  g.save(); g.translate(500, 780); g.rotate(-.12); g.strokeStyle = '#8f1d22'; g.lineWidth = 3; g.strokeRect(-110, -34, 220, 68); g.fillStyle = '#8f1d22'; g.font = '22px "Special Elite"'; g.textAlign = 'center'; g.fillText('MAQUETTE', 0, 8); g.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
// Échelle roulante contre la travée
{ const ladder = new THREE.Group(), rm = new THREE.MeshStandardMaterial({ color: 0x6b5a3e, roughness: .7 }); for (const x of [-.22, .22]) { const r = new THREE.Mesh(new THREE.BoxGeometry(.05, 3.4, .05), rm); r.position.set(x, 1.7, 0); r.castShadow = true; ladder.add(r); } for (let k = 0; k < 9; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(.44, .04, .05), rm); s.position.set(0, .35 + k * .37, 0); s.castShadow = true; ladder.add(s); } ladder.position.set(ROWW / 2 + .75, 0, BD / 2 + 1.15); ladder.rotation.x = -.38; ladder.rotation.z = .05; scene.add(ladder); }

// ---- Lumières : trois lampes chaudes, une lueur froide, la lampe torche ----
scene.add(new THREE.HemisphereLight(0x25343a, 0x0a0a0a, .3));
const lamps = [-1.9, 0, 1.9].map(x => { const s = new THREE.SpotLight(0xffd29a, 95, 0, .5, .85, 1.6); s.position.set(x * 1.35, 4.6, 3.2); s.target.position.set(x * 1.35, 1.5, 0); s.castShadow = true; s.shadow.mapSize.set(1024, 1024); s.shadow.bias = -.0004; scene.add(s, s.target);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3.8, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe2b0, transparent: true, opacity: .022, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); cone.position.set(x * 1.35, 4.3 - 1.9, 2.6 - .25); cone.rotation.x = .12; scene.add(cone);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(.3, .22, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0x1a1d1e, metalness: .6, roughness: .5, side: THREE.DoubleSide, emissive: 0xffb866, emissiveIntensity: .25 })); shade.position.set(x * 1.35, 4.38, 2.6); scene.add(shade); return s; });
const rim = new THREE.DirectionalLight(0x6f8f9a, .5); rim.position.set(-4, 2.5, 3); scene.add(rim);
const torch = new THREE.SpotLight(0xfff0cf, 0, 0, .34, .85, 1.4); torch.castShadow = true; torch.shadow.mapSize.set(1024, 1024); scene.add(torch, torch.target);
let torchOn = false, lampK = 1;
// poussière
const NP = 260, dp = new Float32Array(NP * 3); for (let k = 0; k < NP; k++) { dp[k * 3] = (Math.random() - .5) * 8; dp[k * 3 + 1] = Math.random() * 4; dp[k * 3 + 2] = Math.random() * 4.5 - .3; }
const dust = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(dp, 3)), new THREE.PointsMaterial({ color: 0xffe9c4, size: .018, transparent: true, opacity: .5, depthWrite: false })); scene.add(dust);

// ---- Rangement : tri animé ----
const ORD = {
  alpha: { nom: 'Alphabétique', f: (a, b) => a.item.titre.localeCompare(b.item.titre, 'fr'), lab: b => b.item.titre[0].toUpperCase() },
  date: { nom: 'Par date', f: (a, b) => (a.item.year == null) - (b.item.year == null) || a.item.year - b.item.year, lab: b => b.item.year == null ? '—' : yr(b.item.year) },
  attention: { nom: 'Par attention', f: (a, b) => (b.item.wikis || 0) - (a.item.wikis || 0), lab: b => (b.item.wikis || 0) + ' langues' },
  statut: { nom: 'Par statut', f: (a, b) => a.item.st.localeCompare(b.item.st) || a.item.titre.localeCompare(b.item.titre, 'fr'), lab: b => MK[b.item.st] },
  lieu: { nom: 'Par longitude', f: (a, b) => (a.item.coord == null) - (b.item.coord == null) || (a.item.coord ? a.item.coord[1] - b.item.coord[1] : 0), lab: b => b.item.coord ? Math.round(b.item.coord[1]) + '°' : '—' }
};
let cur = 'alpha';
function arrange(key, instant) {
  cur = key; const sorted = boxes.slice().sort(ORD[key].f), per = Math.ceil(sorted.length / ROWS);
  for (let r = 0; r < ROWS; r++) { const row = sorted.slice(r * per, (r + 1) * per), tot = row.reduce((s, b) => s + b.w + GAP, -GAP); let x = -tot / 2;
    row.forEach(b => { b.bx = x + b.w / 2; b.by = ROWY[r] + BH / 2 + .005; x += b.w + GAP; if (instant) { b.mesh.position.set(b.bx, b.by, 0); } });
    const p = plaques[r], g = p.c.getContext('2d'); g.fillStyle = '#e9e3cf'; g.fillRect(0, 0, 768, 96); g.strokeStyle = '#2a2016'; g.lineWidth = 4; g.strokeRect(4, 4, 760, 88); g.fillStyle = '#1d1c1b'; g.font = '44px "Special Elite"'; g.textBaseline = 'middle';
    g.fillText(['I', 'II', 'III'][r] + ' · ' + (row.length ? ORD[key].lab(row[0]) + ' → ' + ORD[key].lab(row[row.length - 1]) : ''), 22, 50); p.t.needsUpdate = true; }
  document.querySelectorAll('#sort button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === key)));
}
$('sort').innerHTML = Object.entries(ORD).map(([k, o]) => `<button type="button" data-k="${k}" aria-pressed="false">${o.nom}</button>`).join('');
$('sort').onclick = e => { const b = e.target.closest('button'); if (b) { arrange(b.dataset.k); close(); } };

// ---- Caméra : glisser pour parcourir, molette = défilement, flèches, + / − ----
const Z0 = 6.5, cam = { x: 0, y: 1.8, z: Z0, tx: 0, ty: 1.8, tz: Z0 }, M = { px: 0, py: 0 };
const lim = () => ({ x: ROWW / 2 - 1.2, y0: 1.2, y1: ROWY[ROWS - 1] + .2 });
function clampCam() { const l = lim(); cam.tx = Math.max(-l.x, Math.min(l.x, cam.tx)); cam.ty = Math.max(l.y0, Math.min(l.y1, cam.ty)); cam.tz = Math.max(3, Math.min(12, cam.tz)); }
const cv = $('gl'); let drag = null;
cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, tx: cam.tx, ty: cam.ty, moved: false }; });
cv.addEventListener('pointermove', e => { M.px = e.clientX / innerWidth * 2 - 1; M.py = e.clientY / innerHeight * 2 - 1; M.cx = e.clientX; M.cy = e.clientY;
  if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 6) drag.moved = true; if (drag.moved) { const k = cam.tz * Math.tan(camera.fov * Math.PI / 360) * 2 / innerHeight; cam.tx = drag.tx - dx * k; cam.ty = drag.ty + dy * k; clampCam(); sel && close(true); } } else hover(e); });
cv.addEventListener('pointerup', e => { if (drag && !drag.moved) pick(e); drag = null; });
cv.addEventListener('pointerleave', () => { hov = null; $('tip').hidden = true; });
cv.addEventListener('wheel', e => { e.preventDefault(); cam.tx += (e.deltaX || e.deltaY) * .0035 * (cam.tz / 4); if (e.shiftKey) { cam.ty -= e.deltaY * .003; } clampCam(); }, { passive: false });
addEventListener('keydown', e => { const k = e.key; if (k === 'ArrowLeft') cam.tx -= .35; else if (k === 'ArrowRight') cam.tx += .35; else if (k === 'ArrowUp') cam.ty += .35; else if (k === 'ArrowDown') cam.ty -= .35; else if (k === '+' || k === '=') cam.tz -= .4; else if (k === '-') cam.tz += .4; else if (k === 'Escape') close(); else return; clampCam(); });

// ---- Survol, sélection ----
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let hov = null, sel = null;
function cast(e) { const r = cv.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); const h = ray.intersectObjects(boxes.map(b => b.mesh), false)[0]; return h ? byMesh.get(h.object) : null; }
function hover(e) { const b = cast(e); hov = b; cv.style.cursor = b ? 'pointer' : 'grab'; const t = $('tip'); if (b && b !== sel) { t.hidden = false; t.innerHTML = `<b>${esc(b.item.titre)}</b><br>${esc(CODES[b.item.st])} · ${b.item.wikis != null ? b.item.wikis + ' langues' : ''}`; t.style.left = Math.min(e.clientX + 16, innerWidth - 240) + 'px'; t.style.top = e.clientY + 16 + 'px'; } else t.hidden = true; }
function pick(e) { const b = cast(e); if (b) open(b); else close(); }
function open(b) { if (sel === b) return; if (sel) { sel.pullT = 0; sel.rotT = 0; } sel = b; b.pullT = 1.15; b.rotT = -.28; if (sheetOwner && sheetOwner !== b.mesh) sheetOwner.remove(sheet); sheet.material.map = sheetTex(b.item); sheet.material.needsUpdate = true; b.mesh.add(sheet); sheetOwner = b.mesh; sheet.position.set(0, BH / 2 - SH / 2 - .05, 0); slide = 0; slideT = 1; sheet.visible = true; cam.tx = b.bx - .35; cam.ty = b.by + .45; cam.tz = 4.6; clampCam(); card(b.item); }
function close(keepCam) { if (sel) { sel.pullT = 0; sel.rotT = 0; sel = null; slideT = 0; } $('card').hidden = true; if (!keepCam) { cam.tz = Z0 * ZF; cam.ty = 1.8; } }
function card(i) { const c = $('card'); c.hidden = false; c.innerHTML = `<button class="x" type="button" aria-label="Fermer" id="cx">×</button><p class="k">${MK[i.st]} · ${esc(CODES[i.st])}</p><h3>${esc(i.titre)}</h3><p class="d">${esc(i.desc)}</p><dl><dt>Date de référence</dt><dd>${esc(yr(i.year))}</dd><dt>Lieu</dt><dd>${esc(i.place || 'non renseigné')}</dd><dt>Éditions Wikipédia</dt><dd>${i.wikis != null ? i.wikis : 'n. d.'}</dd></dl><p class="x2">${esc((i.x || '').slice(0, 340))}${(i.x || '').length > 340 ? '…' : ''}</p><p class="s"><a href="${esc(i.wiki)}" target="_blank" rel="noopener">Wikipédia</a> · <a href="https://www.wikidata.org/wiki/${i.qid}" target="_blank" rel="noopener">Wikidata ${i.qid}</a>${i.id === 'wow' ? ' · <a href="m1r.html">Dossier tapé complet</a>' : ''}</p>`; $('cx').onclick = () => close(); }
$('torch').onclick = () => { torchOn = !torchOn; $('torch').setAttribute('aria-pressed', String(torchOn)); };

// ---- Boucle ----
let ZF = 1;
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); ZF = camera.aspect < .8 ? 1.7 : 1; if (!sel) { cam.tz = Z0 * ZF; cam.z = cam.tz; } } addEventListener('resize', resize); resize();
arrange('alpha', true); boxes.forEach(b => { b.mesh.position.set(b.bx, b.by, 0); });
const tgt = new THREE.Vector3(), tmpv = new THREE.Vector3(); let last = performance.now();
renderer.setAnimationLoop(now => {
  const dt = Math.min(.05, (now - last) / 1000); last = now; const k = REDUCED ? 1 : 1 - Math.pow(.0009, dt);
  for (const b of boxes) { b.pullT = b === hov && b !== sel ? .2 : b === sel ? 1.15 : 0; b.pull += (b.pullT - b.pull) * k; b.rot += (b.rotT - b.rot) * k; b.mesh.position.x += (b.bx - b.mesh.position.x) * k * .7; b.mesh.position.y += (b.by - b.mesh.position.y) * k * .7; b.mesh.position.z = b.pull; b.mesh.rotation.y = b.rot; }
  slide += (slideT - slide) * k * .5; if (sheetOwner) { sheet.position.y = BH / 2 - SH / 2 - .05 + slide * (SH * .78); sheet.rotation.x = -.1 * slide; sheet.position.z = .02 + slide * .08; if (slideT === 0 && slide < .01) { sheet.visible = false; sheetOwner.remove(sheet); sheetOwner = null; } }
  cam.x += (cam.tx - cam.x) * k * .8; cam.y += (cam.ty - cam.y) * k * .8; cam.z += (cam.tz - cam.z) * k * .8;
  camera.position.set(cam.x + M.px * .22, cam.y - M.py * .12, cam.z); camera.lookAt(cam.x + M.px * .05, cam.y - .05 - M.py * .04, 0);
  lampK += ((torchOn ? .06 : 1) - lampK) * k * .6; lamps.forEach(l => { l.intensity = 95 * lampK; }); torch.intensity += ((torchOn ? 140 : 0) - torch.intensity) * k * .6;
  if (torchOn && M.cx != null) { const r = cv.getBoundingClientRect(); ndc.set((M.cx - r.left) / r.width * 2 - 1, -((M.cy - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); const o = ray.ray.origin, d = ray.ray.direction, t = (0 - o.z) / d.z; tgt.set(o.x + d.x * t, o.y + d.y * t, 0); torch.position.copy(camera.position).add(tmpv.set(0, .3, 0)); torch.target.position.copy(tgt); }
  const pa = dust.geometry.attributes.position; for (let j = 0; j < NP; j++) { pa.array[j * 3 + 1] += dt * .02 * (1 + (j % 3)); if (pa.array[j * 3 + 1] > 4) pa.array[j * 3 + 1] = 0; pa.array[j * 3] += Math.sin(now * .0003 + j) * dt * .01; } pa.needsUpdate = true;
  renderer.render(scene, camera);
});
$('ui').hidden = false; $('loading').hidden = true;
window.__arc = { boxes, cam, open: id => open(boxes.find(b => b.item.id === id)), arrange };
