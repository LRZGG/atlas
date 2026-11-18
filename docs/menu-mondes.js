// Menu des trois mondes : onglets de chemise (Science, Mystères, Folklore), posés en haut de chaque page. Un seul fichier, aucune dépendance.
(function () {
  if (window.__mm) return; window.__mm = 1;
  var p = location.pathname, en = /^\/en\//.test(p);
  var cur = /viz-folklore|\/f[1-4][a-z]?\.html|passage/.test(p) && !/passage/.test(p) ? 'fol' : /\/labo\//.test(p) && !/viz-folklore|\/f[1-4][a-z]?\.html/.test(p) ? 'mys' : 'sci';
  if (/viz-folklore|\/f[1-4][a-z]*\.html/.test(p)) cur = 'fol';
  var W = [
    { k: 'sci', n: en ? 'Science' : 'Science', u: en ? '/en/' : '/fr/', t: 'La carte de la recherche' },
    { k: 'mys', n: en ? 'Mysteries' : 'Mystères', u: '/labo/viz-mystere.html', t: 'Le fichier des mystères' },
    { k: 'fol', n: 'Folklore', u: '/labo/viz-folklore.html', t: 'Le bestiaire du monde' }
  ];
  var css = '#mm{position:fixed;left:50%;top:0;transform:translateX(-50%);z-index:2147483000;display:flex;align-items:flex-end;height:38px;padding:0 14px;font:13px/1 "Archivo Narrow","Arial Narrow",sans-serif;pointer-events:none}' +
    '#mm a{pointer-events:auto;position:relative;display:block;margin:0 -7px;padding:12px 30px 9px;text-decoration:none;letter-spacing:.16em;text-transform:uppercase;white-space:nowrap;height:33px;border-radius:0 0 11px 11px;border:1.4px solid var(--c);border-top:0;background:var(--b);color:var(--c);box-shadow:0 5px 10px -6px #0008;transform:translateY(-6px);transition:transform .28s cubic-bezier(.2,.9,.3,1.2),box-shadow .28s;clip-path:polygon(0 0,100% 0,96% 100%,4% 100%)}' +
    '#mm a::after{content:"";position:absolute;left:8px;right:8px;bottom:3px;height:1px;background:var(--c);opacity:.35}' +
    '#mm a:hover{transform:translateY(-1px)}#mm a:focus-visible{outline:2px solid #ffd24a;outline-offset:-3px}' +
    '#mm a[aria-current=page]{transform:translateY(0);height:40px;padding-top:14px;z-index:3;box-shadow:0 7px 12px -6px #000a}' +
    '#mm a[aria-current=page]::before{content:"";position:absolute;left:-1px;right:-1px;top:0;height:3px;background:var(--b)}' +
    '#mm .s{--b:#fbfbf9;--c:#15181d;font-family:"IM Fell DW Pica",Georgia,serif;font-size:15px;letter-spacing:.2em}' +
    '#mm .m{--b:#d8caa7;--c:#1d1c1b;font-family:"Special Elite","Courier New",monospace;font-size:12px;letter-spacing:.1em;z-index:2}' +
    '#mm .f{--b:#17181a;--c:#ece8dd;font-family:"Old Standard TT",Georgia,serif;font-weight:700;font-size:13px;letter-spacing:.08em}' +
    '#mm a[aria-current=page]{background:var(--b)}' +
    '@media(max-width:720px){#mm{height:32px;padding:0 6px}#mm a{padding:10px 14px 7px;font-size:11px;height:28px;letter-spacing:.08em}#mm a[aria-current=page]{height:33px;padding-top:11px}#mm .s{font-size:12px}}' +
    '@media(prefers-reduced-motion:reduce){#mm a{transition:none}}' +
    'body.mm-labo .maq{padding-top:40px!important}body.mm-3d .bar{top:48px!important}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function mk() {
    var nav = document.createElement('nav'); nav.id = 'mm'; nav.setAttribute('aria-label', 'Mondes');
    nav.innerHTML = W.map(function (w) { return '<a class="' + w.k.charAt(0) + '" href="' + w.u + '" title="' + w.t + '"' + (w.k === cur ? ' aria-current="page"' : '') + '>' + w.n + '</a>'; }).join('');
    document.body.appendChild(nav);
    if (/\/labo\//.test(p)) document.body.classList.add('mm-labo'); if (/archives-3d/.test(p)) document.body.classList.add('mm-3d');
  }
  if (document.body) mk(); else document.addEventListener('DOMContentLoaded', mk);
})();
