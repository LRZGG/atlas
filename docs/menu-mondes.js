// Menu des trois mondes : une barre suspendue en haut de page, d'un seul bloc (aucun vide entre les onglets, tous de même taille), avec une plaque qui glisse sous l'onglet actif.
// Réglages (couleur, police, animation) lus dans localStorage « mm » ; la page /labo/menu-onglets.html permet de les essayer. Aucune dépendance.
(function () {
  if (window.__mm) return;
  var p = location.pathname, en = /^\/en\//.test(p);
  var FOL = /viz-folklore|cabinet-3d|\/f[1-4][a-z]*\.html/.test(p);
  var cur = FOL ? 2 : /\/labo\//.test(p) && !/passage|menus|menu-onglets|index\.html$|\/labo\/$/.test(p) ? 1 : 0;
  var W = [{ k: 'sci', n: 'Science', u: en ? '/en/' : '/fr/' }, { k: 'mys', n: en ? 'Mysteries' : 'Mystères', u: '/labo/viz-mystere.html' }, { k: 'fol', n: 'Folklore', u: '/labo/cabinet-3d.html' }];
  // Couleurs : bande (fond), bordure, texte des onglets inactifs, plaque et encre de la plaque (par monde).
  var dk = function () { return document.documentElement.dataset.theme === 'dark'; };
  var T = function (i) { var d = dk(); return [
    d ? { st: '#0b0d11', bd: '#e9ebee66', ti: '#c9ccd1', pl: '#e9ebee', pi: '#0b0d11' } : { st: '#fbfbf9', bd: '#15181d', ti: '#15181d', pl: '#15181d', pi: '#fbfbf9' },
    d ? { st: '#0a0d0e', bd: '#cdbf9c88', ti: '#cdbf9c', pl: '#cdbf9c', pi: '#0a0d0e' } : { st: '#e9dfc7', bd: '#3b2f20', ti: '#3b2f20', pl: '#3b2f20', pi: '#e9dfc7' },
    d ? { st: '#08090a', bd: '#ece8dd66', ti: '#ece8dd', pl: '#ece8dd', pi: '#17181a' } : { st: '#17181a', bd: '#ece8dd66', ti: '#ece8dd', pl: '#ece8dd', pi: '#17181a' }][i]; };
  var C = {
    theme: { n: 'Thème du monde', theme: true },
    matieres: { n: 'Matières', strip: '#14161a', bd: '#ffffff55', ti: '#d9d6cc', pl: ['#fbfbf9', '#d8caa7', '#ece8dd'], pi: ['#15181d', '#1d1c1b', '#17181a'] },
    encre: { n: 'Encre', strip: '#15181d', bd: '#ffffff40', ti: '#c9cbd0', pl: ['#fbfbf9', '#fbfbf9', '#fbfbf9'], pi: ['#15181d', '#15181d', '#15181d'] },
    laiton: { n: 'Laiton', strip: '#0d1011', bd: '#c9a24c', ti: '#cdbf9c', pl: ['#c9a24c', '#c9a24c', '#c9a24c'], pi: ['#0d1011', '#0d1011', '#0d1011'] },
    carmin: { n: 'Carmin', strip: '#fbfbf9', bd: '#15181d', ti: '#15181d', pl: ['#b3122f', '#b3122f', '#b3122f'], pi: ['#ffffff', '#ffffff', '#ffffff'] },
    papier: { n: 'Papier', strip: '#e6e1d2', bd: '#1d1c1b', ti: '#3b3a36', pl: ['#15181d', '#1d1c1b', '#17181a'], pi: ['#fbfbf9', '#e8dcb8', '#ece8dd'] }
  };
  // Même corps, même graisse, même interlettrage pour toutes les polices : seule la forme des lettres change.
  var F = {
    monde: { n: 'Par monde', f: ['"IM Fell DW Pica",Georgia,serif', '"Special Elite","Courier New",monospace', '"Old Standard TT",Georgia,serif'], w: [400, 400, 400], ls: ['.16em', '.16em', '.16em'], sz: [14, 14, 14] },
    fell: { n: 'Gravure', f: ['"IM Fell DW Pica",Georgia,serif'], w: [400], ls: ['.16em'], sz: [14] },
    narrow: { n: 'Étiquette', f: ['"Archivo Narrow","Arial Narrow",sans-serif'], w: [400], ls: ['.16em'], sz: [14] },
    machine: { n: 'Machine', f: ['"Special Elite","Courier New",monospace'], w: [400], ls: ['.16em'], sz: [14] }
  };
  var A = { glisse: 'Plaque qui glisse', rabat: 'Rabat qui descend', machine: 'Titre tapé', fondu: 'Fondu de matière', aucune: 'Aucune' };
  var cfg = { c: 'theme', f: 'monde', a: 'glisse' };
  try { var s = JSON.parse(localStorage.getItem('mm') || '{}'); ['c', 'f', 'a'].forEach(function (k) { if (s[k]) cfg[k] = s[k]; }); } catch (e) {}
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var css = '#mm{position:fixed;left:50%;top:-3px;padding-top:3px;transform:translateX(-50%);z-index:2147483000;display:flex;width:var(--mw);height:calc(var(--mh) + 3px);background:var(--st);border:1.4px solid var(--bd);border-top:0;border-radius:0 0 13px 13px;overflow:hidden;box-shadow:0 8px 18px -10px #000b;--mw:450px;--mh:36px;font-size:14px;line-height:1;transition:background .5s,border-color .5s}' +
    '#mm .pl{position:absolute;top:-3px;bottom:0;left:0;width:33.3334%;background:var(--pc);z-index:0;will-change:transform}' +
    '#mm a{position:relative;z-index:1;padding-top:3px!important;flex:1 1 0;display:flex;align-items:center;justify-content:center;text-decoration:none;color:var(--ti);text-transform:uppercase;white-space:nowrap;padding:0 6px;transition:color .35s,opacity .2s}' +
    '#mm a:hover{color:var(--hv,#fff)}#mm a[aria-current=page]{color:var(--pi)}#mm a:focus-visible{outline:2px solid #ffd24a;outline-offset:-4px}' +
    '#mm a+a::before{content:"";position:absolute;left:0;top:12px;bottom:9px;width:1px;background:var(--bd);opacity:.5}' +
    '@media(max-width:720px){#mm{--mw:min(330px,calc(100vw - 20px));--mh:32px;font-size:12px}}@media(prefers-reduced-motion:reduce){#mm *{transition:none!important}}' +
    'body.mm-labo .maq{padding-top:44px!important}body.mm-3d .bar{top:50px!important}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var nav, pl, links, timer;
  // Couleurs d'un onglet actif i selon le réglage : « thème du monde » reprend la matière du monde affiché (clair ou sombre), les autres sont fixes.
  function S(o, i) { var c = C[o.c] || C.theme; if (c.theme) return T(i); return { st: c.strip, bd: c.bd, ti: c.ti, pl: c.pl[i], pi: c.pi[i] }; }
  function apply(o, i) { var s = S(o, i), f = F[o.f] || F.monde;
    nav.style.setProperty('--st', s.st); nav.style.setProperty('--bd', s.bd); nav.style.setProperty('--ti', s.ti); nav.style.setProperty('--hv', o.c === 'carmin' || o.c === 'papier' || (o.c === 'theme' && !dk() && i !== 2) ? '#b3122f' : o.c === 'theme' ? s.pl : '#fff');
    nav.style.setProperty('--pc', s.pl); nav.style.setProperty('--pi', s.pi);
    links.forEach(function (a, k) { var g = f.f.length > 1 ? k : 0; a.style.fontFamily = f.f[g]; a.style.fontWeight = f.w[g]; a.style.letterSpacing = f.ls[g]; a.style.fontSize = f.sz[g] + 'px'; }); }
  function plate(i, s) { pl.style.background = s.pl; nav.style.setProperty('--pi', s.pi); pl.style.transform = 'translate3d(' + (i * 100) + '%,0,0)'; }
  function render(o, from, to, animate) {
    o = o || cfg; clearInterval(timer); var sf = from == null ? S(o, to) : S(o, from), s = S(o, to);
    links.forEach(function (a, k) { if (k === to) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); a.textContent = W[k].n; });
    var go = animate !== false && !reduced && from !== to && from != null && o.a !== 'aucune';
    pl.style.transition = 'none'; pl.getAnimations && pl.getAnimations().forEach(function (x) { x.cancel(); });
    if (!go) { apply(o, to); plate(to, s); return; }
    if (o.a === 'glisse') { apply(o, from); plate(from, sf); void pl.offsetWidth; pl.style.transition = 'transform .62s cubic-bezier(.3,1,.4,1),background .62s'; apply(o, to); plate(to, s); }
    else if (o.a === 'rabat') { apply(o, from); plate(to, sf); void pl.offsetWidth; apply(o, to); plate(to, s); pl.animate([{ transform: 'translate3d(' + to * 100 + '%,-101%,0)' }, { transform: 'translate3d(' + to * 100 + '%,0,0)' }], { duration: 520, easing: 'cubic-bezier(.2,.9,.25,1.05)' }); }
    else if (o.a === 'fondu') { apply(o, from); plate(to, sf); void pl.offsetWidth; pl.style.transition = 'background .7s'; apply(o, to); plate(to, s); }
    else if (o.a === 'machine') { apply(o, to); plate(to, s); var t = W[to].n, a = links[to], n = 0; a.textContent = ''; timer = setInterval(function () { n++; a.textContent = t.slice(0, n); if (n >= t.length) clearInterval(timer); }, 70); }
  }
  function mk() {
    nav = document.createElement('nav'); nav.id = 'mm'; nav.setAttribute('aria-label', 'Mondes');
    nav.innerHTML = '<i class="pl" aria-hidden="true"></i>' + W.map(function (w) { return '<a href="' + w.u + '"></a>'; }).join('');
    pl = nav.querySelector('.pl'); links = [].slice.call(nav.querySelectorAll('a')); document.body.appendChild(nav);
    if (/\/labo\//.test(p)) document.body.classList.add('mm-labo'); if (/-3d\.html/.test(p)) document.body.classList.add('mm-3d');
    var prev = null; try { prev = sessionStorage.getItem('mm_prev'); sessionStorage.setItem('mm_prev', String(cur)); } catch (e) {}
    render(cfg, prev == null ? null : +prev, cur, true);
    new MutationObserver(function () { apply(cfg, cur); plate(cur, S(cfg, cur)); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
  window.__mm = { C: C, F: F, A: A, W: W, cfg: cfg, render: function (o, from, to) { if (!nav) mk(); render(o, from, to, true); }, set: function (o) { Object.assign(cfg, o); try { localStorage.setItem('mm', JSON.stringify(cfg)); } catch (e) {} } , nav: function () { return nav; } };
  if (document.body) mk(); else document.addEventListener('DOMContentLoaded', mk);
})();
