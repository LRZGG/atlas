// Maquettes « Mystères » (M1–M4) et « Folklore » (F1–F4) : huit styles sur les mêmes vraies données (labo-data.json, produit par fetch-labo.mjs).
// Usage : node build-labo.mjs → écrit docs/labo/*.html (page non indexée, hors plan du site). Polices libres hébergées dans docs/labo/fonts/ (licences à côté).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const D = JSON.parse(readFileSync('labo-data.json', 'utf8')), LAB = D.labels;
mkdirSync('docs/labo', { recursive: true });
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
function date(t) { if (!t) return null; const m = /^([+-])(\d+)-(\d\d)-(\d\d)/.exec(t); if (!m) return null; const y = +m[2], neg = m[1] === '-', mo = +m[3], d = +m[4]; const ys = neg ? y + ' av. J.-C.' : String(y); return d ? `${d === 1 ? '1er' : d} ${MOIS[mo - 1]} ${ys}` : mo ? `${MOIS[mo - 1]} ${ys}` : ys; }
const lab = id => LAB[id]?.fr || LAB[id]?.en || null;

// Contenu éditorial de démonstration : statut (à valider) et, pour quatre dossiers, « ce qu'on sait / ce qu'on ignore », brouillon IA à vérifier.
const ED = {
  wow: { q: "D'où venait le signal de 1977 ?", st: ['non', 'Énigme non résolue'], sait: ["Le 15 août 1977, le radiotélescope Big Ear (Ohio) a enregistré pendant 72 secondes un signal radio étroit et intense, près de la fréquence de 1 420 MHz, celle de l'hydrogène.", "L'astronome Jerry Ehman a entouré la ligne sur le listing et écrit « Wow! » dans la marge."], ignore: ["Son origine : naturelle, humaine ou autre.", "Le signal n'a jamais été reçu de nouveau malgré de nombreuses recherches : une seule détection, donc impossible à vérifier par répétition."] },
  voynich: { q: "Que dit ce livre, s'il dit quelque chose ?", st: ['non', 'Énigme non résolue'], sait: ["Le manuscrit est conservé à l'université Yale (bibliothèque Beinecke, MS 408).", "La datation au carbone 14 du vélin le place au début du XVe siècle."], ignore: ["La langue, ou même si le texte est un message.", "Les hypothèses sont nombreuses (code, langue inconnue, canular) ; aucune ne fait consensus."] },
  roanoke: { q: 'Que sont devenus les colons de 1587 ?', st: ['non', 'Énigme non résolue'] },
  phaistos: { q: 'Que dit le disque de Phaistos ?', st: ['non', 'Énigme non résolue'] },
  dyatlov: { q: 'Que s\'est-il passé au col Dyatlov ?', st: ['exp', 'Explication proposée'] },
  antikythere: { q: 'Comment fonctionnait cette machine ?', st: ['par', 'Partiellement expliqué'] },
  mothman: { q: "Qu'ont vu les témoins de Point Pleasant ?", st: ['tem', 'Folklore · témoignages non vérifiés'], sait: ["Les premiers récits datent de novembre 1966, à Point Pleasant (Virginie-Occidentale).", "Le pont Silver Bridge s'est effondré le 15 décembre 1967, faisant 46 morts. Les récits ont ensuite été associés à cet événement par la presse et par un livre (John Keel, 1975)."], ignore: ["Ce que les témoins ont réellement vu : des hypothèses évoquent un grand oiseau mal identifié.", "Aucune preuve matérielle de l'existence d'une créature n'a été présentée."] },
  yeti: { q: 'Un grand primate vit-il dans l\'Himalaya ?', st: ['fol', 'Folklore · aucune preuve scientifique'] },
  kappa: { q: 'Que raconte-t-on du kappa au Japon ?', st: ['fol', 'Folklore · tradition culturelle'] },
  nessie: { q: "Y a-t-il un monstre dans le loch Ness ?", st: ['fau', 'Légende · preuve célèbre démontrée fausse'], sait: ["La « photographie du chirurgien », publiée en 1934, est un canular : sa fabrication a été reconnue en 1994.", "Des analyses d'ADN environnemental menées en 2018 n'ont pas trouvé de trace d'un grand reptile."], ignore: ["Les observations anciennes et les témoignages restent difficiles à vérifier une à une.", "Aucune preuve scientifique ne soutient l'existence d'un grand animal inconnu dans le loch."] },
  bermudes: { q: 'Des navires disparaissent-ils plus qu\'ailleurs ?', st: ['fol', 'Légende · à vérifier contre les données'] },
  dameblanche: { q: "D'où vient le récit de la dame blanche ?", st: ['fol', 'Folklore · récit répandu'] }
};
const entries = [...D.mystere, ...D.folklore].map(r => {
  const e = ED[r.id] || {}, fr = r.fr || r.en, wd = r.wd || {};
  return { ...r, titre: fr.t, desc: (r.fr?.d || r.en?.d || ''), extrait: fr.x, extraitLang: r.fr ? 'fr' : 'en', wiki: fr.u, q: e.q || '', st: e.st || ['fol', ''], sait: e.sait || null, ignore: e.ignore || null,
    facts: [['Date de référence', date(wd.inception)], ['Lieu', [...(wd.loc || []), ...(wd.country || [])].map(lab).filter(Boolean).slice(0, 2).join(', ') || null], ['Nature', (wd.inst || []).map(lab).filter(Boolean).slice(0, 2).join(', ') || null]].filter(f => f[1]) };
});
const byId = Object.fromEntries(entries.map(e => [e.id, e]));
const clean = s => (s || '').replace(/Unknown author(Unknown author)?/g, 'auteur inconnu').replace(/^Credit:\s*/, '').replace(/\s+/g, ' ').trim().slice(0, 90);

const FONTS = `@font-face{font-family:"Special Elite";src:url(fonts/special-elite-latin-400-normal.woff2) format("woff2");font-display:swap}
@font-face{font-family:"Courier Prime";src:url(fonts/courier-prime-latin-400-normal.woff2) format("woff2");font-display:swap}
@font-face{font-family:"Courier Prime";font-style:italic;src:url(fonts/courier-prime-latin-400-italic.woff2) format("woff2");font-display:swap}
@font-face{font-family:"DotGothic16";src:url(fonts/dotgothic16-latin-400-normal.woff2) format("woff2");font-display:swap}
@font-face{font-family:"Old Standard TT";src:url(fonts/old-standard-tt-latin-400-normal.woff2) format("woff2");font-display:swap}
@font-face{font-family:"Old Standard TT";font-style:italic;src:url(fonts/old-standard-tt-latin-400-italic.woff2) format("woff2");font-display:swap}
@font-face{font-family:"Libre Caslon Text";src:url(fonts/libre-caslon-text-latin-400-normal.woff2) format("woff2");font-display:swap}
@font-face{font-family:"Libre Caslon Text";font-style:italic;src:url(fonts/libre-caslon-text-latin-400-italic.woff2) format("woff2");font-display:swap}
@font-face{font-family:"UnifrakturCook";font-weight:700;src:url(fonts/unifrakturcook-latin-700-normal.woff2) format("woff2");font-display:swap}
@font-face{font-family:"Shippori Mincho";font-weight:400;src:url(fonts/shippori-mincho-latin-400-normal.woff2) format("woff2");font-display:swap}
@font-face{font-family:"Shippori Mincho";font-weight:700;src:url(fonts/shippori-mincho-latin-700-normal.woff2) format("woff2");font-display:swap}
@font-face{font-family:"IM Fell DW Pica";src:url(../fonts/imfell.woff2) format("woff2");font-display:swap}
@font-face{font-family:"IM Fell DW Pica";font-style:italic;src:url(../fonts/imfell-italic.woff2) format("woff2");font-display:swap}
@font-face{font-family:"Archivo Narrow";font-weight:400 700;src:url(../fonts/archivo-narrow.woff2) format("woff2");font-display:swap}`;

const BASE = `*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;min-height:100vh}img{max-width:100%;display:block}a{color:inherit}
.maq{font:12px/1.3 "Archivo Narrow",sans-serif;letter-spacing:.04em;background:#111;color:#fff;padding:7px 14px;display:flex;gap:10px 18px;flex-wrap:wrap;align-items:center;position:relative;z-index:5}
.maq b{color:#ffd24a;font-weight:600;letter-spacing:.1em;text-transform:uppercase}.maq nav{display:flex;gap:4px;flex-wrap:wrap;margin-left:auto}.maq nav a{text-decoration:none;border:1px solid #666;padding:2px 8px}.maq nav a[aria-current]{background:#fff;color:#111;border-color:#fff}.maq nav i{font-style:normal;opacity:.6;margin:0 4px 0 10px}
a:focus-visible{outline:2px solid currentColor;outline-offset:3px}
figure{margin:0}.cap{font-size:12px}.prov{font-size:13px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px;margin:0;padding:0;list-style:none}.cards a{display:block;text-decoration:none;height:100%}.cards h3{margin:6px 0 2px}.cards p{margin:0}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`;

// ---- Les huit styles. Chacun : nom, résumé, critique honnête, feuille de style.
const S = {
  m1: { univ: 'mystere', nom: 'Dossier tapé', pitch: "Une chemise d'enquête : papier pelure, machine à écrire, tampon rouge, perforations. Les titres se tapent à l'écran.", risque: "Très lisible et très « enquête », mais déjà vu ; le tampon doit rester une étiquette de statut, pas un effet.", css: `
body{background:#1c2a2b;background-image:radial-gradient(#22343440 1px,transparent 1.5px);background-size:5px 5px;color:#16181a;font:17px/1.62 "Courier Prime",monospace;padding-bottom:60px}
.wrap{max-width:860px;margin:0 auto;padding:28px 14px}
.sheet{position:relative;background:#e9eeee;padding:44px 48px 40px 82px;box-shadow:0 1px 0 #fff8 inset,0 14px 34px -10px #000a;transform:rotate(-.25deg);margin-bottom:42px}
.sheet::before{content:"";position:absolute;left:24px;top:0;bottom:0;width:20px;background:radial-gradient(circle,#1c2a2b 6px,transparent 7px) 0 80px/20px 220px repeat-y}
.sheet::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent 0 31px,#2f6f8a14 31px 32px);pointer-events:none}
.sheet>*{position:relative;z-index:1}
.ref{font:13px "Special Elite",monospace;letter-spacing:.14em;color:#a11d23;text-transform:uppercase;max-width:calc(100% - 240px)}
h1{font:400 clamp(30px,5vw,46px)/1.12 "Special Elite",monospace;margin:.2em 0 .15em;color:#111}
.q{font:italic 19px/1.4 "Courier Prime",monospace;color:#a11d23;margin:0 0 22px}
.stamp{position:absolute;right:34px;top:30px;transform:rotate(7deg);border:3px double #a11d23;color:#a11d23;font:15px/1.15 "Special Elite",monospace;text-transform:uppercase;padding:8px 12px 6px;letter-spacing:.06em;mix-blend-mode:multiply;max-width:210px;text-align:center;opacity:.92}
.fig img{width:100%;max-height:420px;object-fit:cover;filter:grayscale(1) contrast(1.05);border:1px solid #16181a}.fig .cap{margin-top:6px;color:#444}
h2{font:400 14px "Special Elite",monospace;letter-spacing:.16em;text-transform:uppercase;margin:30px 0 6px;color:#16181a;border-bottom:1px solid #16181a;padding-bottom:3px}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:6px 36px}
ul.l{padding-left:20px}.l li{margin-bottom:8px}
dl.f{display:grid;grid-template-columns:max-content 1fr;gap:3px 18px;margin:0}dl.f dt{color:#555}dl.f dd{margin:0}
.type::after{content:"▌";animation:bl 1s steps(2) infinite;color:#a11d23}.type.done::after{content:""}@keyframes bl{50%{opacity:0}}
.prov{border:1px dashed #16181a;padding:8px 12px;margin-top:26px;background:#fff6}
.cards{margin-top:14px}.card{background:#e9eeee;padding:14px 16px;box-shadow:0 8px 20px -10px #000a;position:relative}.card:nth-child(odd){transform:rotate(.35deg)}.card:nth-child(even){transform:rotate(-.3deg)}.card h3{font:400 19px/1.2 "Special Elite",monospace}.card .s{font:12px "Special Elite",monospace;color:#a11d23;text-transform:uppercase;letter-spacing:.06em}.card p{font-size:14px;line-height:1.45;color:#333}
h2.cat{color:#cfe0df;border-color:#cfe0df}.sheet+h2.cat{margin-top:0}
@media(max-width:700px){.ref{max-width:none}.sheet{padding:30px 20px 28px 54px}.sheet::before{left:12px}.stamp{position:static;display:inline-block;margin:6px 0 10px;transform:rotate(-3deg)}.cols{grid-template-columns:1fr}}` },

  m2: { univ: 'mystere', nom: 'Listing', pitch: "Papier d'imprimante à bandes vertes, matrice de points, stylo rouge. C'est littéralement la matière du signal Wow!.", risque: "Très fort pour l'astronomie et l'informatique, trop étroit pour un mystère historique ou archéologique.", css: `
body{background:#dfe6df;color:#15222b;font:15px/1.7 "DotGothic16","Courier Prime",monospace;background-image:linear-gradient(90deg,transparent 0 56px,#9a352b33 56px 57px,transparent 57px)}
.wrap{max-width:980px;margin:0 auto;padding:0 18px 60px}
.paper{position:relative;background:repeating-linear-gradient(180deg,#f5f9f3 0 54px,#cfe8d6 54px 108px);padding:40px 56px 40px 68px;margin:24px 0;border-left:34px solid #eef2ec;border-right:34px solid #eef2ec;box-shadow:0 10px 30px -14px #0007}
.paper::before,.paper::after{content:"";position:absolute;top:0;bottom:0;width:34px;background:radial-gradient(circle,#7a8a7d 5px,#0000 5.5px) 50% 14px/34px 36px repeat-y}.paper::before{left:-34px}.paper::after{right:-34px}
.ref{font-size:13px;color:#27555d;letter-spacing:.16em}
h1{font:400 clamp(28px,5vw,48px)/1.15 "DotGothic16",monospace;margin:.1em 0 .1em;color:#0f1d2b;text-transform:uppercase;letter-spacing:.05em}
.q{margin:0 0 20px;color:#27555d}
.stamp{display:inline-block;background:#15222b;color:#f3f8f2;padding:3px 12px;font-size:15px;letter-spacing:.12em;text-transform:uppercase;position:relative}
.stamp::after{content:"";position:absolute;inset:-9px -16px -10px -14px;border:2.5px solid #c2231f;border-radius:50%;transform:rotate(-2.5deg);clip-path:polygon(0 0,100% 0,100% 82%,10% 92%,0 70%)}
.fig{margin:18px 0}.fig img{width:100%;max-height:400px;object-fit:cover;object-position:top;border:1px solid #15222b;filter:grayscale(.25) contrast(1.08)}.fig .cap{color:#27555d}
h2{font:400 15px "DotGothic16",monospace;letter-spacing:.2em;margin:28px 0 4px;color:#0f1d2b;text-transform:uppercase}h2::before{content:">> "}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:0 34px}ul.l{padding-left:18px;margin:0}
dl.f{display:grid;grid-template-columns:max-content 1fr;gap:0 18px;margin:0}dl.f dt{color:#27555d}dl.f dd{margin:0}
.prov{margin-top:24px;border-top:2px dashed #15222b;padding-top:8px;color:#27555d}
.card{background:repeating-linear-gradient(180deg,#f5f9f3 0 27px,#d8ecdc 27px 54px);padding:12px 14px;border:1px solid #bdd3c3}.card h3{font:400 16px "DotGothic16";text-transform:uppercase;letter-spacing:.06em}.card .s{color:#b3271f;font-size:12px;letter-spacing:.1em}.card p{font-size:13px;line-height:1.5}
h2.cat{color:#15222b}
@media(max-width:700px){.paper{padding:26px 14px 26px 18px;border-width:18px}.paper::before,.paper::after{width:18px}.paper::before{left:-18px}.paper::after{right:-18px}.cols{grid-template-columns:1fr}}` },

  m3: { univ: 'mystere', nom: 'Cyanotype', pitch: "Bleu de Prusse et blanc : l'estampe cyanotype des premiers herbiers. Les images deviennent des tirages bleus, uniformes d'un dossier à l'autre.", risque: "Magnifique et très cohérent ; la lecture longue en blanc sur bleu fatigue, et le bleu se rapproche de la planche scientifique.", css: `
body{background:#0e3a66;background-image:linear-gradient(#ffffff0a 1px,transparent 1px),linear-gradient(90deg,#ffffff0a 1px,transparent 1px);background-size:36px 36px;color:#e6f2fb;font:18px/1.65 "Libre Caslon Text",serif}
.wrap{max-width:1040px;margin:0 auto;padding:28px 18px 70px}
.sheet{border:1.5px solid #e6f2fb;outline:1px solid #e6f2fb;outline-offset:6px;padding:34px 38px;position:relative;display:grid;grid-template-columns:1.1fr .9fr;gap:6px 38px;margin:10px 8px 50px}
.sheet>.head{grid-column:1/-1}
.ref{font:13px "Archivo Narrow",sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#9fc7e8}
h1{font:italic 400 clamp(32px,5.2vw,58px)/1.06 "Libre Caslon Text",serif;margin:.1em 0 .1em;text-wrap:balance}
.q{font:16px "Libre Caslon Text",serif;color:#bcdcf3;margin:0 0 6px}
.stamp{display:inline-block;margin:6px 0 4px;border:1.5px solid #e6f2fb;padding:3px 12px;font:13px "Archivo Narrow",sans-serif;letter-spacing:.14em;text-transform:uppercase}
.fig{background:#cfe6f6;padding:12px;grid-row:2/span 3;align-self:start}.fig img{width:100%;max-height:520px;object-fit:cover;filter:url(#duo)}.fig .cap{color:#0e3a66;margin-top:8px;font-family:"Archivo Narrow",sans-serif}
h2{font:13px "Archivo Narrow",sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#9fc7e8;margin:22px 0 4px;border-bottom:1px solid #e6f2fb55;padding-bottom:3px}
.cols{display:block}ul.l{padding-left:20px}.l li{margin-bottom:6px}
dl.f{display:grid;grid-template-columns:max-content 1fr;gap:2px 16px;margin:0;font-size:15px}dl.f dt{color:#9fc7e8;font-style:italic}dl.f dd{margin:0}
.prov{grid-column:1/-1;font-family:"Archivo Narrow",sans-serif;color:#bcdcf3;border-top:1px solid #e6f2fb55;margin-top:14px;padding-top:8px}
.cards a{border:1px solid #e6f2fb88;padding:12px 14px;height:100%}.cards a:hover{background:#ffffff14}.card h3{font:italic 400 20px/1.2 "Libre Caslon Text",serif}.card .s{font:12px "Archivo Narrow";letter-spacing:.14em;text-transform:uppercase;color:#9fc7e8}.card p{font-size:14px;line-height:1.45;color:#cfe6f6}
h2.cat{font-size:14px}
@media(max-width:800px){.sheet{grid-template-columns:1fr;padding:22px 18px}.fig{grid-row:auto}}` },

  m4: { univ: 'mystere', nom: 'Coupure de presse', pitch: "Une page de journal ancien : colonnes, filets, titre massif, trame d'imprimerie sur les images. Fait parler l'histoire du mystère.", risque: "Le plus lisible et le plus vivant pour les mystères historiques ; attention à ne pas imiter un vrai journal (ici, un titre fictif clairement marqué).", css: `
body{background:#2a2622;color:#1d1b18;font:17px/1.55 "Old Standard TT",serif}
.wrap{max-width:1000px;margin:0 auto;padding:24px 14px 70px}
.sheet{background:#dad6cb;padding:22px 36px 34px;box-shadow:0 16px 40px -14px #000b;position:relative;margin-bottom:46px}
.sheet::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,#0000 0 3px,#00000006 3px 4px),radial-gradient(ellipse at 20% 0,#fff3 0,#0000 60%);pointer-events:none}
.mast{border-top:4px double #1d1b18;border-bottom:1px solid #1d1b18;text-align:center;padding:6px 0 4px;margin-bottom:10px;font:700 12px "Archivo Narrow",sans-serif;letter-spacing:.22em;text-transform:uppercase;display:flex;justify-content:space-between;gap:10px}
.sheet>.head{border-bottom:3px solid #1d1b18;padding-bottom:12px;margin-bottom:14px}
.ref{font:12px "Archivo Narrow",sans-serif;letter-spacing:.2em;text-transform:uppercase}
h1{font:700 clamp(36px,6.4vw,78px)/.98 "Old Standard TT",serif;margin:.1em 0 .1em;text-transform:uppercase;text-wrap:balance;letter-spacing:-.01em}
.q{font:italic 22px/1.3 "Old Standard TT",serif;margin:0}
.stamp{display:inline-block;margin-top:10px;background:#1d1b18;color:#dad6cb;font:700 13px "Archivo Narrow",sans-serif;letter-spacing:.16em;text-transform:uppercase;padding:3px 10px}
.body{column-count:2;column-gap:34px;column-rule:1px solid #1d1b1855}
.fig{break-inside:avoid;margin:0 0 14px}.fig .ph{position:relative;background:#fff}.fig img{width:100%;filter:grayscale(1) contrast(1.5);mix-blend-mode:multiply}.fig .ph::after{content:"";position:absolute;inset:0;background:radial-gradient(circle,#0000 38%,#dad6cb 40%) 0 0/3.5px 3.5px;mix-blend-mode:screen;opacity:.8}.fig .cap{font:italic 12px "Old Standard TT";margin-top:4px}
h2{font:700 13px "Archivo Narrow",sans-serif;letter-spacing:.2em;text-transform:uppercase;border-top:2px solid #1d1b18;margin:16px 0 4px;padding-top:4px;break-after:avoid}
.body p{margin:0 0 .8em;text-align:justify;hyphens:auto}.body p:first-of-type::first-letter{float:left;font:700 3.3em/.82 "Old Standard TT";padding:4px 6px 0 0}
ul.l{padding-left:18px;margin:0 0 .6em}dl.f{margin:0;display:grid;grid-template-columns:max-content 1fr;gap:2px 12px;font-size:15px}dl.f dt{font-style:italic}dl.f dd{margin:0}
.prov{border:1px solid #1d1b18;padding:7px 10px;margin-top:14px;font:12.5px/1.4 "Archivo Narrow",sans-serif;break-inside:avoid}
.card{background:#dad6cb;padding:14px 16px;border:1px solid #1d1b18}.card h3{font:700 22px/1.08 "Old Standard TT",serif;text-transform:uppercase}.card .s{font:700 11px "Archivo Narrow";letter-spacing:.16em;text-transform:uppercase;border-top:1px solid #1d1b18;display:inline-block;margin-bottom:4px}.card p{font-size:14px;line-height:1.4}
h2.cat{color:#e6e1d4;border-color:#e6e1d4}
@media(max-width:760px){.body{column-count:1}.sheet{padding:16px 18px 26px}}` },

  f1: { univ: 'folklore', nom: 'Bestiaire', pitch: "Un manuscrit enluminé : lettrine peinte, bleu outremer, vermillon, filets d'or, rubrique rouge pour le statut. Le folklore comme patrimoine, pas comme preuve.", risque: "Le plus évocateur ; le parchemin peut faire passer une légende pour une source ancienne. Le statut en rubrique doit être très visible.", css: `
body{background:#1a2a55;color:#2a1c10;font:19px/1.6 "IM Fell DW Pica",serif}
.wrap{max-width:900px;margin:0 auto;padding:26px 14px 70px}
.sheet{background:#dcc99d;background-image:radial-gradient(ellipse at 50% 40%,#e9dab4 0,#dcc99d 55%,#b99a5e 110%);border:2px solid #b8892b;outline:6px solid #1a2a55;box-shadow:0 0 0 8px #b8892b,0 18px 40px -8px #000b;padding:40px 52px;position:relative;margin-bottom:56px}
.sheet::before{content:"";position:absolute;inset:10px;border:1px solid #8b5e1a88;pointer-events:none}
.ref{font:italic 15px "IM Fell DW Pica",serif;color:#8d1f1f;letter-spacing:.05em}
h1{font:700 clamp(38px,6vw,64px)/1.04 "UnifrakturCook",serif;margin:.1em 0 .05em;color:#1a2a55;text-wrap:balance}
.q{font:italic 22px/1.3 "IM Fell DW Pica",serif;color:#8d1f1f;margin:0 0 14px}
.stamp{display:block;font:italic 17px "IM Fell DW Pica";color:#8d1f1f;border-top:2px solid #b8892b;border-bottom:2px solid #b8892b;padding:4px 0;margin:6px 0 18px;text-align:center;letter-spacing:.04em}.stamp::before{content:"❧ "}.stamp::after{content:" ❧"}
.fig{float:right;width:44%;margin:4px 0 12px 24px;border:3px double #b8892b;padding:6px;background:#1a2a55}.fig img{width:100%;max-height:360px;object-fit:cover;filter:sepia(.55) saturate(1.5) contrast(1.05)}.fig .cap{color:#e9dab4;font-size:12px;margin-top:5px}
.body p{margin:0 0 .8em;text-align:justify;hyphens:auto}.body p:first-of-type::first-letter{float:left;font:700 4.6em/.8 "UnifrakturCook";color:#8d1f1f;background:#1a2a55;border:2px solid #b8892b;padding:8px 10px 6px;margin:4px 12px 0 0}
h2{font:700 24px "UnifrakturCook",serif;color:#1a2a55;margin:18px 0 4px;clear:both}
ul.l{padding-left:22px}.l li{margin-bottom:6px}dl.f{display:grid;grid-template-columns:max-content 1fr;gap:2px 18px;margin:0}dl.f dt{font-style:italic;color:#8d1f1f}dl.f dd{margin:0}
.prov{clear:both;margin-top:22px;font-size:14px;border-top:1px solid #8b5e1a;padding-top:8px;color:#4a3115}
.card{background:#dcc99d;border:2px solid #b8892b;padding:14px 16px;outline:3px solid #1a2a55}.card h3{font:700 24px/1.1 "UnifrakturCook",serif;color:#1a2a55}.card .s{font-style:italic;color:#8d1f1f;font-size:14px}.card p{font-size:15px;line-height:1.4}
h2.cat{color:#e9dab4;font-size:30px}
@media(max-width:720px){.sheet{padding:26px 22px}.fig{float:none;width:100%;margin:0 0 14px}}` },

  f2: { univ: 'folklore', nom: 'Estampe', pitch: "Une estampe japonaise : titre vertical, sceau vermillon pour le statut, trait d'encre et à-plats. Idéal pour les yōkai, moins pour les légendes occidentales.", risque: "Très beau mais culturellement spécifique : à réserver aux dossiers japonais ou en faire un thème d'exception, sinon contresens.", css: `
body{background:#e8e4d8;color:#141a2e;font:17px/1.75 "Shippori Mincho",serif}
.wrap{max-width:1040px;margin:0 auto;padding:30px 18px 70px}
.sheet{display:grid;grid-template-columns:minmax(0,1fr) 130px;gap:0 34px;background:#f3f0e6;border:2px solid #141a2e;padding:36px 40px;position:relative;margin-bottom:56px;box-shadow:0 0 0 6px #f3f0e6,0 0 0 8px #141a2e}
.head{grid-column:2;grid-row:1/span 6;writing-mode:vertical-rl;display:flex;gap:18px;align-items:flex-start;justify-content:flex-start;border-left:1.5px solid #141a2e;padding-left:26px;height:100%}
.ref{font-size:13px;letter-spacing:.2em;color:#b3201f;order:3}
h1{font:700 clamp(34px,5vw,56px)/1.2 "Shippori Mincho",serif;margin:0;order:1}
.q{font-size:15px;margin:0;order:2;color:#2b3a6a}
.stamp{writing-mode:horizontal-tb;display:inline-block;background:#b3201f;color:#f3f0e6;font:700 14px/1.3 "Shippori Mincho",serif;padding:8px 10px;border-radius:2px;margin-top:6px;width:96px;text-align:center;box-shadow:inset 0 0 0 2px #b3201f,inset 0 0 0 3px #f3f0e6;order:4}
.fig{grid-column:1}.fig img{width:100%;max-height:430px;object-fit:contain;background:#efe6cf;padding:10px;border:1px solid #141a2e}.fig .cap{color:#2b3a6a;margin-top:5px}
.sheet>section,.sheet>.prov,.sheet>.fig{grid-column:1}
h2{font:700 15px "Shippori Mincho",serif;color:#b3201f;margin:22px 0 4px;letter-spacing:.14em}h2::before{content:"■ ";font-size:10px}
ul.l{padding-left:20px}.l li{margin-bottom:6px}dl.f{display:grid;grid-template-columns:max-content 1fr;gap:2px 18px;margin:0;font-size:15px}dl.f dt{color:#2b3a6a}dl.f dd{margin:0}
.prov{border-top:1px solid #141a2e;margin-top:22px;padding-top:8px;font-size:13px}
.card{background:#f3f0e6;border:2px solid #141a2e;padding:12px 14px}.card h3{font:700 20px/1.2 "Shippori Mincho"}.card .s{color:#b3201f;font-size:13px}.card p{font-size:14px;line-height:1.5}
h2.cat{color:#141a2e;border-bottom:2px solid #b3201f;display:inline-block}
@media(max-width:760px){.sheet{display:block;padding:22px 18px}.head{writing-mode:horizontal-tb;display:block;border:0;padding:0}.stamp{width:auto;margin:8px 0}}` },

  f3: { univ: 'folklore', nom: 'Cabinet de curiosités', pitch: "Étiquettes de spécimens sur fond vert sombre : planches numérotées, filets laiton, légendes en petites capitales. Traite la légende comme un objet de collection à classer.", risque: "Le plus sobre et le plus « sérieux » : il rassure, mais risque de donner à une légende l'allure d'une espèce observée. Le statut doit trancher.", css: `
body{background:#10241d;background-image:radial-gradient(#ffffff08 1px,transparent 1.4px);background-size:7px 7px;color:#1b1d1a;font:18px/1.6 "Libre Caslon Text",serif}
.wrap{max-width:980px;margin:0 auto;padding:28px 16px 70px}
.sheet{background:#eceae0;padding:34px 44px;border:1px solid #c9a24c;box-shadow:0 0 0 7px #eceae0,0 0 0 8px #c9a24c,0 20px 40px -10px #000c;position:relative;margin:0 8px 56px;display:grid;grid-template-columns:1fr 1fr;gap:0 40px}
.sheet>.head{grid-column:1/-1;display:flex;gap:18px;align-items:baseline;justify-content:space-between;border-bottom:1px solid #1b1d1a;margin-bottom:16px;padding-bottom:10px;flex-wrap:wrap}
.head .tt{flex:1 1 360px}
.ref{font:12px "Archivo Narrow",sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#7a5a12}
h1{font:400 clamp(30px,4.6vw,50px)/1.08 "Libre Caslon Text",serif;font-variant:small-caps;letter-spacing:.03em;margin:.1em 0 0}
.q{font-style:italic;font-size:17px;margin:2px 0 0;color:#444}
.stamp{background:#7a5a12;color:#f5eed2;font:12px "Archivo Narrow",sans-serif;letter-spacing:.16em;text-transform:uppercase;padding:7px 12px;border:1px solid #c9a24c;box-shadow:inset 0 0 0 2px #7a5a12,inset 0 0 0 3px #c9a24c;max-width:260px;text-align:center}
.fig{grid-row:2/span 4}.fig img{width:100%;max-height:520px;object-fit:cover;filter:grayscale(1) contrast(1.15) sepia(.25);border:1px solid #1b1d1a}.fig .cap{margin-top:6px;font-style:italic;color:#444}.fig .cap::before{content:"Fig. 1. ";font-style:normal;font-variant:small-caps}
h2{font:12px "Archivo Narrow",sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#7a5a12;margin:18px 0 4px;border-bottom:1px solid #c9a24c;padding-bottom:2px}
ul.l{padding-left:20px;margin:0}.l li{margin-bottom:6px}dl.f{display:grid;grid-template-columns:max-content 1fr;gap:2px 16px;margin:0;font-size:16px}dl.f dt{font-variant:small-caps}dl.f dd{margin:0}
.body p{margin:0}.prov{grid-column:1/-1;border-top:1px solid #1b1d1a;margin-top:18px;padding-top:8px;font:13px "Archivo Narrow",sans-serif}
.card{background:#eceae0;padding:12px 14px;border:1px solid #c9a24c;box-shadow:0 0 0 4px #eceae0,0 0 0 5px #c9a24c}.card h3{font:400 20px/1.15 "Libre Caslon Text";font-variant:small-caps}.card .s{font:11px "Archivo Narrow";letter-spacing:.16em;text-transform:uppercase;color:#7a5a12}.card p{font-size:14px;line-height:1.45}
h2.cat{color:#e6d9a8;border-color:#c9a24c}
@media(max-width:780px){.sheet{display:block;padding:22px 20px}.fig{margin-bottom:12px}}` },

  f4: { univ: 'folklore', nom: 'Bibliothèque bleue', pitch: "La littérature de colportage française : papier bleu, gravure sur bois au trait noir, grosses capitales. La légende comme récit populaire imprimé, ce qu'elle est réellement.", risque: "Le plus original et le plus honnête (une légende, c'est du colportage), mais fort contraste et lisibilité à surveiller.", css: `
body{background:#3d63a8;background-image:radial-gradient(#0000000d 1px,transparent 1.5px);background-size:4px 4px;color:#0b1020;font:18px/1.55 "Old Standard TT",serif}
.wrap{max-width:900px;margin:0 auto;padding:30px 16px 70px}
.sheet{border:5px solid #0b1020;padding:26px 34px 30px;position:relative;margin-bottom:54px;background:#4a74bb;filter:url(#rough)}
.sheet>*{filter:none}
.head{border-bottom:5px solid #0b1020;padding-bottom:10px;margin-bottom:16px}
.ref{font:700 13px "Archivo Narrow",sans-serif;letter-spacing:.22em;text-transform:uppercase}
h1{font:700 clamp(38px,7vw,84px)/.95 "Old Standard TT",serif;text-transform:uppercase;margin:.08em 0 .06em;letter-spacing:-.01em;text-wrap:balance}
.q{font:italic 22px "Old Standard TT";margin:0}
.stamp{display:inline-block;margin-top:10px;border:4px solid #0b1020;padding:2px 12px;font:700 15px "Archivo Narrow",sans-serif;letter-spacing:.12em;text-transform:uppercase;background:#f1d34a}
.fig{float:right;width:46%;margin:4px 0 10px 22px;border:5px solid #0b1020;background:#cdd9ee}.fig img{width:100%;max-height:380px;object-fit:cover;filter:url(#wood);mix-blend-mode:multiply}.fig .cap{background:#0b1020;color:#cdd9ee;padding:3px 8px;font-family:"Archivo Narrow",sans-serif}
.body p{margin:0 0 .8em;text-align:justify;hyphens:auto}.body p:first-of-type::first-letter{float:left;font:700 4em/.82 "Old Standard TT";background:#0b1020;color:#cdd9ee;padding:6px 10px 2px;margin:4px 10px 0 0}
h2{font:700 22px "Old Standard TT",serif;text-transform:uppercase;border-bottom:3px solid #0b1020;margin:18px 0 6px;clear:both}
ul.l{padding-left:22px}.l li{margin-bottom:6px}dl.f{display:grid;grid-template-columns:max-content 1fr;gap:2px 16px;margin:0;font-size:16px}dl.f dt{font-weight:700}dl.f dd{margin:0}
.prov{clear:both;margin-top:20px;border:3px solid #0b1020;padding:7px 10px;font:13px/1.4 "Archivo Narrow",sans-serif;background:#cdd9ee}
.card{background:#4a74bb;border:4px solid #0b1020;padding:12px 14px}.card h3{font:700 24px/1 "Old Standard TT";text-transform:uppercase}.card .s{display:inline-block;background:#f1d34a;border:2px solid #0b1020;font:700 11px "Archivo Narrow";letter-spacing:.12em;text-transform:uppercase;padding:0 6px;margin-bottom:4px}.card p{font-size:14px;line-height:1.4}
h2.cat{color:#0b1020;background:#cdd9ee;display:inline-block;padding:0 10px;border:4px solid #0b1020}
@media(max-width:720px){.fig{float:none;width:100%;margin:0 0 12px}.sheet{padding:18px}}` }
};

// M5 : le dossier « administratif » : formulaire dactylographié, champs encadrés, pièces jointes. Agence fictive, aucun emblème réel.
S.m5 = { univ: 'mystere', nom: "Dossier d'archives", pitch: "Un formulaire d'archives sobre : en-tête à champs, sections numérotées, pièces jointes, photocopie. Ce qu'on ignore y est marqué « non documenté » en bande hachurée : l'inconnu devient une information visible.", risque: "Le plus pro et le plus crédible. Danger : l'allure « agence secrète » peut flatter le complotisme ; ici l'agence est fictive, le ton neutre, rien n'est « caviardé ».", css: `
body{background:#bfc4c8;background-image:linear-gradient(#0000000a 1px,transparent 1px);background-size:100% 6px;color:#1a1c1e;font:15.5px/1.6 "Courier Prime",monospace}
.wrap{max-width:900px;margin:0 auto;padding:26px 14px 70px}
.sheet{background:#f5f5f2;padding:0 0 30px;box-shadow:0 0 0 1px #8d9296,0 18px 40px -14px #000a;position:relative;margin-bottom:50px}
.sheet::after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 60px #00000014;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .07 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E")}
.agency{display:flex;justify-content:space-between;gap:12px;background:#1a1c1e;color:#f5f5f2;font:700 11.5px "Archivo Narrow",sans-serif;letter-spacing:.22em;text-transform:uppercase;padding:7px 28px}
.form{display:grid;grid-template-columns:repeat(6,1fr);margin:22px 28px 0;border:1.5px solid #1a1c1e}
.form>div{padding:5px 10px 6px;border-right:1px solid #1a1c1e;border-bottom:1px solid #1a1c1e;min-width:0}.form>div:last-child{border-bottom:0}
.form small{display:block;font:700 10.5px "Archivo Narrow",sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#4a4f54}
.form b{font-weight:400;font-size:15px}
.c6{grid-column:span 6}.c4{grid-column:span 4}.c3{grid-column:span 3}.c2{grid-column:span 2}
.form .st{background:#1a1c1e;color:#f5f5f2}.form .st small{color:#b9bec3}.form .st b{font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.sheet>section,.sheet>.fig,.sheet>.prov{margin-left:28px;margin-right:28px}
h1{font:700 clamp(24px,3.4vw,34px)/1.15 "Courier Prime",monospace;margin:0;text-transform:uppercase;letter-spacing:.02em}
.ref{display:none}.q{margin:2px 0 0;color:#4a4f54}
h2{font:700 13px "Archivo Narrow",sans-serif;letter-spacing:.2em;text-transform:uppercase;border-bottom:2px solid #1a1c1e;margin:26px 28px 8px;padding-bottom:2px;counter-increment:s}
h2::before{content:counter(s) ". "}
.sheet{counter-reset:s}
ul.l{padding-left:20px;margin:0 28px}.l li{margin-bottom:7px}
ul.ig{list-style:none;padding:0;margin:0 28px}ul.ig li{display:grid;grid-template-columns:118px 1fr;gap:12px;margin-bottom:8px;align-items:start}ul.ig li::before{content:"NON DOCUMENTÉ";font:700 10px/1 "Archivo Narrow",sans-serif;letter-spacing:.12em;padding:7px 6px;background:#1a1c1e;color:#f5f5f2;text-align:center;border-right:8px solid;border-image:repeating-linear-gradient(135deg,#1a1c1e 0 2px,#f5f5f2 2px 5px) 1}
.fig{margin:20px 28px 0;border:1px solid #1a1c1e;padding:8px;background:#fff}.fig img{width:100%;max-height:380px;object-fit:cover;filter:grayscale(1) contrast(1.1)}.fig .cap{margin-top:4px;font:12px "Archivo Narrow",sans-serif}.fig .cap::before{content:"PIÈCE JOINTE N°1 · ";font-weight:700}
.body p{margin:0 28px;text-align:justify}
.prov{margin-top:24px;border:1.5px solid #1a1c1e;padding:7px 10px;font:12.5px/1.4 "Archivo Narrow",sans-serif}
.card{background:#f5f5f2;border:1.5px solid #1a1c1e;padding:0}.card .s{display:block;background:#1a1c1e;color:#f5f5f2;font:700 10.5px "Archivo Narrow",sans-serif;letter-spacing:.16em;text-transform:uppercase;padding:3px 10px}.card h3{font:700 17px/1.2 "Courier Prime";margin:8px 10px 2px;text-transform:uppercase}.card p{margin:0 10px 10px;font-size:13.5px;line-height:1.45}
h2.cat{margin:0 0 12px;color:#1a1c1e;background:#f5f5f2;display:inline-block;padding:2px 12px;border:1.5px solid #1a1c1e}
@media(max-width:720px){.form{margin:16px 12px 0}.c4,.c3,.c2{grid-column:span 6}.sheet>section,.sheet>.fig,.sheet>.prov,ul.l,ul.ig,h2,.body p{margin-left:14px;margin-right:14px}.fig{margin-left:14px;margin-right:14px}.agency{padding:7px 14px;flex-direction:column;gap:2px}}` };
// F4 en version neutre (sans couleur) : papier blanc, papier journal gris, mode nuit. Le bleu historique (F4) reste comme référence.
const F4V = { f4w: ['Colportage blanc', "Papier blanc cassé, encre noire, gravure sur bois : la version la plus sobre et la plus lisible.", '#f3f1ea', '#d6d3c9', '#e4e0d4', '#ffffff', '#111111', ''], f4n: ['Colportage journal', "Papier journal gris, encre noire : la grisaille de la presse populaire, sans aucune teinte.", '#cfcfc8', '#8f8f89', '#e6e5df', '#f4f3ee', '#151515', ''], f4k: ['Colportage nuit', "Mode sombre : papier noir, encre ivoire. L'image reste en gravure noir et blanc sur une vignette claire.", '#17181a', '#08090a', '#2b2d30', '#ece8dd', '#ece8dd', '.fig{background:#ece8dd!important}.fig img{mix-blend-mode:multiply}.fig .cap{background:#ece8dd;color:#17181a}.stamp{color:#17181a}.body p:first-of-type::first-letter{background:#ece8dd;color:#17181a}.prov{background:#2b2d30}.card .s{color:#17181a}h2.cat{background:#2b2d30;color:#ece8dd}'] };
for (const [k, [nom, pitch, paper, bg, light, badge, ink, extra]] of Object.entries(F4V)) S[k] = { univ: 'folklore', nom, pitch, risque: "Même grammaire que F4 (gravure sur bois, capitales, filets épais), sans couleur. À juger sur la lisibilité et le caractère.", css: S.f4.css.replaceAll('#4a74bb', paper).replaceAll('#3d63a8', bg).replaceAll('#cdd9ee', light).replaceAll('#f1d34a', badge).replaceAll('#0b1020', ink) + extra };

// M6 : mélange de M1 (chemise, machine à écrire, tampon) et M5 (formulaire sobre) : le sérieux de M5, la matière de M1.
S.m6 = { univ: 'mystere', nom: "Dossier d'archives, chemise", pitch: "M5 posé sur une chemise kraft avec son onglet : champs de formulaire en machine à écrire, tampon de statut sobre, titre tapé à l'écran. Le sérieux du formulaire, la matière du dossier.", risque: "Le meilleur équilibre : pro sans être froid. Il faut que le tampon reste un simple libellé de statut, sans effet gadget.", css: S.m5.css + `
body{background:#23282b;background-image:radial-gradient(#ffffff0a 1px,transparent 1.5px);background-size:6px 6px}
.folder{position:relative;background:#a98558;border-radius:4px 4px 2px 2px;padding:46px 18px 22px;margin-bottom:50px;box-shadow:0 16px 40px -14px #000c}
.folder::before{content:"";position:absolute;inset:0;border-radius:inherit;background:repeating-linear-gradient(90deg,#0000 0 5px,#0000000a 5px 6px);pointer-events:none}
.folder .tab{position:absolute;top:-1px;left:26px;transform:translateY(-100%);background:#a98558;border-radius:5px 5px 0 0;padding:6px 18px 5px;font:700 12px "Archivo Narrow",sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#2e2112;box-shadow:inset 0 1px 0 #ffffff33}
.folder .sheet{margin:0;transform:rotate(-.25deg)}
.form small{font-family:"Archivo Narrow",sans-serif}.form b,h1,.q{font-family:"Special Elite","Courier Prime",monospace}h1{font-weight:400;letter-spacing:.02em}
.form b{font-size:14.5px;letter-spacing:.01em}
.form .st b{display:inline-block;border:2.5px solid #a11d23;transform:rotate(-3deg);padding:4px 9px 2px;mix-blend-mode:multiply;font-size:14px;line-height:1.15}
.form .st{background:#f5f5f2;color:#1a1c1e}.form .st small{color:#4a4f54}.form .st b{font-weight:400;color:#a11d23}
.type::after{content:"▌";animation:bl 1s steps(2) infinite;color:#a11d23}.type.done::after{content:""}@keyframes bl{50%{opacity:0}}
@media(max-width:720px){.folder{padding:40px 8px 16px}}` };

// Trois nouvelles lectures de M1 (dossier tapé), plus adultes : rapport dactylographié, fiches de catalogue, dactylo en direct.
const TYPED = `
body{background:#2a2d30;color:#17181a;font:16px/1.75 "Courier Prime",monospace}
.wrap{max-width:900px;margin:0 auto;padding:30px 14px 80px}
.sheet{background:#f8f8f5;padding:56px 72px 52px;box-shadow:0 18px 44px -16px #000c;position:relative;margin-bottom:50px}
.hd{display:flex;justify-content:space-between;gap:12px;font-size:12.5px;letter-spacing:.12em;text-transform:uppercase;color:#17181a}
.eq{overflow:hidden;white-space:nowrap;letter-spacing:0;color:#17181a;line-height:1;margin:6px 0 24px;font-size:14px;user-select:none}
h1{font:400 clamp(26px,4vw,38px)/1.25 "Courier Prime",monospace;font-weight:700;margin:0 0 4px;text-transform:uppercase;letter-spacing:.03em}
.q{margin:0 0 18px;font-style:italic;color:#444}
.row{display:flex;align-items:baseline;gap:0}.row i{flex:1;border-bottom:2px dotted #17181a88;margin:0 8px 5px}.row b{font-weight:400}.row .red{color:#b3262b;font-weight:700;text-transform:uppercase}
.meta{margin-bottom:6px}
h2{font:700 15px "Courier Prime",monospace;letter-spacing:.14em;text-transform:uppercase;margin:34px 0 0}
h2+.eq{margin:2px 0 12px}
p,li{margin:0 0 .7em}ul.l{list-style:none;padding:0;margin:0}ul.l li{padding-left:3.2ch;text-indent:-3.2ch}ul.l li::before{content:"— ";}
.ig li{color:#b3262b}.ig li::after{content:" [non documenté]";font-size:.8em;letter-spacing:.06em;text-transform:uppercase}
.fig{margin:22px 0 0}.fig img{width:100%;max-height:380px;object-fit:cover;filter:grayscale(1) contrast(1.08);opacity:.92}.fig .cap{font-size:12.5px;margin-top:6px}.fig .cap::before{content:"Pièce jointe n°1. ";font-weight:700}
.prov{margin-top:34px;border-top:2px dotted #17181a88;padding-top:10px;font-size:12.5px;line-height:1.55;color:#333}
.card{background:#f8f8f5;padding:12px 14px;box-shadow:0 10px 24px -14px #000}.card h3{font:700 16px/1.25 "Courier Prime";text-transform:uppercase;margin:4px 0}.card .s{font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:#b3262b}.card p{font-size:13.5px;line-height:1.5}
h2.cat{color:#d9dcdd;margin-top:0}.eq.cat{color:#d9dcdd}
@media(max-width:720px){.sheet{padding:30px 20px}.hd{flex-direction:column;gap:2px}}`;
S.m1b = { univ: 'mystere', nom: 'Rapport tapé', pitch: "Un rapport dactylographié sans folklore : papier blanc plat, titres soulignés de « = » tapés, repères avec points de conduite, ce qu'on ignore tapé au ruban rouge. Aucun tampon, aucun gadget.", risque: "Le plus adulte et le plus lisible. Moins de personnalité visuelle que M1 ; tout repose sur la typographie et le rythme.", css: TYPED };
S.m1d = { univ: 'mystere', nom: 'Dactylo en direct', pitch: "Le même rapport, mais tapé sous vos yeux, lettre à lettre, avec un curseur ; un bouton « Passer » affiche tout d'un coup. L'effet « machine à écrire » devient le geste signature, sans décor.", risque: "Mémorable et fidèle à l'idée d'enquête qu'on rédige. À borner : sans JavaScript ou avec « moins d'animations », tout s'affiche immédiatement.", css: TYPED + `
.skip{position:fixed;right:18px;bottom:18px;z-index:9;font:13px "Archivo Narrow",sans-serif;letter-spacing:.1em;text-transform:uppercase;background:#f8f8f5;color:#17181a;border:1px solid #17181a;padding:8px 14px;cursor:pointer}
.sheet .o{opacity:0}.sheet .lastc::after{content:"";display:inline-block;width:.6em;height:1.05em;background:#b3262b;vertical-align:-.15em;margin-left:1px;animation:bl .6s steps(2) infinite}@keyframes bl{50%{opacity:0}}
.roller{height:22px;background:linear-gradient(180deg,#0c0d0e,#3a3d40 40%,#0c0d0e);position:relative;margin:-56px -72px 34px;border-radius:2px 2px 0 0}
.roller::after{content:"";position:absolute;left:0;right:0;bottom:-6px;height:6px;background:repeating-linear-gradient(90deg,#17181a 0 1px,#0000 1px 10px)}
@media(max-width:720px){.roller{margin:-30px -20px 24px}}` };
S.m1c = { univ: 'mystere', nom: 'Fiches de catalogue', pitch: "Des fiches cartonnées tapées à la machine, comme un fichier de bibliothèque : une fiche par rubrique, filet rouge sous l'en-tête, onglet de repère, trou de tringle. Le dossier devient un fichier qu'on feuillette.", risque: "Très « archives » et très lisible par blocs. Le cartonnage crème est classique : le fond vert sombre et le filet rouge doivent faire le caractère.", css: `
body{background:#183029;background-image:radial-gradient(#ffffff0a 1px,transparent 1.5px);background-size:6px 6px;color:#1a1814;font:15.5px/1.65 "Courier Prime",monospace}
.wrap{max-width:820px;margin:0 auto;padding:40px 14px 80px}
.drawer{display:grid;gap:34px}
.ic{background:#efe9d6;border:1px solid #cdc4a6;box-shadow:0 12px 26px -14px #000d;padding:18px 36px 54px;position:relative}.ic:nth-child(odd){transform:rotate(.15deg)}.ic:nth-child(even){transform:rotate(-.15deg)}
.ic .top{display:flex;justify-content:space-between;gap:12px;font-size:12.5px;letter-spacing:.1em;text-transform:uppercase;padding:0 0 8px;border-bottom:2px solid #b3262b;margin:0 0 14px}
.ic::after{content:"";position:absolute;left:50%;bottom:14px;width:15px;height:15px;margin-left:-7px;border-radius:50%;background:#183029;box-shadow:inset 0 2px 3px #000a}
.ic .tab{position:absolute;top:-23px;left:34px;background:#efe9d6;border:1px solid #cdc4a6;border-bottom:0;padding:3px 16px 2px;font:700 11.5px "Archivo Narrow",sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#7a1f23;border-radius:4px 4px 0 0}
h1{font:700 clamp(24px,3.6vw,34px)/1.2 "Courier Prime",monospace;text-transform:uppercase;margin:0 0 2px}
.q{margin:0;font-style:italic}
.row{display:flex}.row i{flex:1;border-bottom:2px dotted #1a181488;margin:0 8px 5px}.row .red{color:#b3262b;font-weight:700;text-transform:uppercase}
p,li{margin:0 0 .6em}ul.l{list-style:none;padding:0;margin:0}ul.l li{padding-left:3.2ch;text-indent:-3.2ch}ul.l li::before{content:"— "}
.ig li{color:#b3262b}.ig li::after{content:" [non documenté]";font-size:.8em;letter-spacing:.06em;text-transform:uppercase}
.fig img{width:100%;max-height:340px;object-fit:cover;filter:grayscale(1) contrast(1.08)}.fig .cap{font-size:12.5px;margin-top:6px}
.prov{font-size:12.5px;line-height:1.5}
.card{background:#efe9d6;padding:12px 14px;border:1px solid #cdc4a6;box-shadow:0 10px 24px -14px #000}.card h3{font:700 16px/1.2 "Courier Prime";text-transform:uppercase;margin:4px 0}.card .s{font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;color:#b3262b}.card p{font-size:13.5px;line-height:1.5}
h2.cat{color:#e4dcc2;font:700 15px "Courier Prime";letter-spacing:.14em;text-transform:uppercase;margin:40px 0 12px}
@media(max-width:720px){.ic{padding:16px 18px 46px}.ic .top{flex-direction:column;gap:2px}}` };

const FILTERS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<filter id="duo" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="table" tableValues="0.039 0.9"/><feFuncG type="table" tableValues="0.165 0.949"/><feFuncB type="table" tableValues="0.302 0.984"/></feComponentTransfer></filter>
<filter id="wood" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="discrete" tableValues="0 0 0 0 1 1 1"/><feFuncG type="discrete" tableValues="0 0 0 0 1 1 1"/><feFuncB type="discrete" tableValues="0 0 0 0 1 1 1"/></feComponentTransfer></filter>
<filter id="rough"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter></defs></svg>`;

const HIDE = new Set(['m6', 'f4', 'f4n']); // écartés après revue (M6 jugé raté ; colportage : blanc et nuit retenus)
const ks = u => Object.keys(S).filter(k => S[k].univ === u && !HIDE.has(k));
const nav = cur => `<nav aria-label="Styles"><i>Mystères</i>${ks('mystere').map(k => `<a href="${k}.html"${k === cur ? ' aria-current="page"' : ''}>${k.toUpperCase()} ${S[k].nom}</a>`).join('')}<i>Folklore</i>${ks('folklore').map(k => `<a href="${k}.html"${k === cur ? ' aria-current="page"' : ''}>${k.toUpperCase()} ${S[k].nom}</a>`).join('')}</nav>`;

function figure(e) { if (!e.imgfile) return ''; const m = e.imgmeta || {}; return `<figure class="fig"><div class="ph"><img src="${e.imgfile}" alt="${esc(e.titre)}" loading="lazy"></div><figcaption class="cap">${esc(clean(m.author) || clean(m.credit))} · ${esc(m.lic)} · <a href="${esc(m.page)}" target="_blank" rel="noopener">Wikimedia Commons</a></figcaption></figure>`; }
function dossier(e, k) {
  const m4 = k === 'm4', ex = esc(e.extrait || '');
  const ig = (k === 'm5' || k === 'm6') ? ' class="ig"' : ' class="l"';
  const sait = e.sait ? `<section><h2>Ce qu'on sait</h2><ul class="l">${e.sait.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section><section><h2>Ce qu'on ignore</h2><ul${ig}>${e.ignore.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>` : `<section><h2>Ce qu'on sait, ce qu'on ignore</h2><p class="small">Fiche à rédiger. Cette maquette ne montre ici que le résumé public ci-dessus.</p></section>`;
  const facts = e.facts.length ? `<section><h2>Repères (Wikidata)</h2><dl class="f">${e.facts.map(f => `<dt>${esc(f[0])}</dt><dd>${esc(f[1])}</dd>`).join('')}<dt>Identifiant</dt><dd><a href="https://www.wikidata.org/wiki/${e.qid}" target="_blank" rel="noopener">${e.qid}</a></dd></dl></section>` : '';
  const head = `<div class="head"><div class="tt"><p class="ref">${esc(e.univ === 'mystere' ? 'Dossier' : 'Fiche')} · ${esc(e.desc)}</p><h1 class="type" data-t="${esc(e.titre)}">${esc(e.titre)}</h1><p class="q">${esc(e.q)}</p></div><span class="stamp">${esc(e.st[1])}</span></div>`;
  const prov = `<p class="prov">Maquette. Brouillon rédigé avec une IA, statut de démonstration, rien n'a été relu par un spécialiste. Résumé : <a href="${esc(e.wiki)}" target="_blank" rel="noopener">Wikipédia</a> (CC BY-SA, ${e.extraitLang === 'fr' ? 'français' : 'anglais'}). Repères : <a href="https://www.wikidata.org/wiki/${e.qid}" target="_blank" rel="noopener">Wikidata</a> (CC0). Image : Wikimedia Commons, licence indiquée sous l'image.</p>`;
  const mast = m4 ? `<div class="mast"><span>La Gazette de l'inconnu</span><span>Journal fictif, maquette</span><span>Édition de démonstration</span></div>` : '';
  const flow = k === 'f1' || k.startsWith('f4');
  const body = m4 ? `<div class="body">${figure(e)}<p>${ex}</p>${facts}${sait}</div>` : flow ? `${figure(e)}<div class="body"><p>${ex}</p></div>${facts}${sait}` : `${figure(e)}<section class="body"><h2>Résumé</h2><p>${ex}</p></section>${facts}${sait}`;
  if (k === 'm1b' || k === 'm1d' || k === 'm1c') {
    const f = Object.fromEntries(e.facts), tw = k === 'm1d' ? ' tw' : '', R = ['I', 'II', 'III', 'IV', 'V'];
    const row = (a, b, red) => `<div class="row"><span>${esc(a)}</span><i></i><b class="${red ? 'red' : ''}">${esc(b)}</b></div>`;
    const eq = '<div class="eq" aria-hidden="true">' + '='.repeat(120) + '</div>';
    const secs = [['Résumé', `<p class="${tw.trim()}">${ex}</p>`]];
    if (e.sait) { secs.push(["Ce qu'on sait", `<ul class="l">${e.sait.map(x => `<li class="${tw.trim()}">${esc(x)}</li>`).join('')}</ul>`]); secs.push(["Ce qu'on ignore", `<ul class="l ig">${e.ignore.map(x => `<li class="${tw.trim()}">${esc(x)}</li>`).join('')}</ul>`]); } else secs.push(["Ce qu'on sait, ce qu'on ignore", '<p>Fiche à rédiger. Cette maquette ne montre ici que le résumé public.</p>']);
    const meta = [row('Statut', e.st[1], true), row('Date de référence', f['Date de référence'] || 'non établie'), row('Lieu', f['Lieu'] || 'non établi'), row('Nature', f['Nature'] || 'non précisée'), row('Identifiant Wikidata', e.qid), row('Rédaction', 'brouillon IA, non relu')].join('');
    const fig = e.imgfile ? figure(e) : '';
    if (k === 'm1c') {
      const card = (tab, inner, top) => `<section class="ic"><span class="tab">${tab}</span><div class="top"><span>UNK-${esc(e.id.toUpperCase())}</span><span>${esc(top || e.titre)}</span></div>${inner}</section>`;
      return `<div class="drawer"><section class="ic" id="${e.id}"><div class="top"><span>Unknownpedia · fichier documentaire</span><span>Fiche 1</span></div><h1>${esc(e.titre)}</h1><p class="q">${esc(e.q)}</p><div style="margin-top:12px">${meta}</div></section>${secs.map(([t, h]) => card(t, h)).join('')}${fig ? card('Pièce jointe', fig) : ''}${card('Sources', prov.replace('class="prov"', 'class="prov"'))}</div>`;
    }
    return `<article class="sheet" id="${e.id}">${k === 'm1d' ? '<div class="roller" aria-hidden="true"></div>' : ''}<div class="hd"><span>Unknownpedia · archives documentaires</span><span>Dossier UNK-${esc(e.id.toUpperCase())} · feuillet 1/1</span></div>${eq}<h1${k === 'm1b' ? ` class="type" data-t="${esc(e.titre)}"` : ''}>${esc(e.titre)}</h1><p class="q${tw}">Objet : ${esc(e.q)}</p><div class="meta">${meta}</div>${fig}${secs.map(([t, h], i) => `<h2>${R[i]}. ${esc(t)}</h2>${eq.replace('class="eq"', 'class="eq" style="font-size:12px"')}${h}`).join('')}${prov}</article>`;
  }
  if (k === 'm5' || k === 'm6') { const f = Object.fromEntries(e.facts), six = k === 'm6'; const art = `<article class="sheet" id="${e.id}"><div class="agency"><span>Bureau d'archives d'Unknownpedia · maquette</span><span>Dossier UNK-${esc(e.id.toUpperCase())}</span></div><div class="form"><div class="c6"><small>Objet</small><h1${six ? ` class="type" data-t="${esc(e.titre)}"` : ''}>${esc(e.titre)}</h1><p class="q">${esc(e.q)}</p></div><div class="c2"><small>Date de référence</small><b>${esc(f['Date de référence'] || 'non établie')}</b></div><div class="c2"><small>Lieu</small><b>${esc(f['Lieu'] || 'non établi')}</b></div><div class="c2"><small>Identifiant Wikidata</small><b>${e.qid}</b></div><div class="c4"><small>Rédaction</small><b>Brouillon IA · non relu par un spécialiste</b></div><div class="c2 st"><small>Statut</small><b>${esc(e.st[1])}</b></div></div>${figure(e)}<section class="body"><h2>Résumé</h2><p>${ex}</p></section>${sait}${prov}</article>`; return six ? `<div class="folder"><span class="tab">Dossier UNK-${esc(e.id.toUpperCase())}</span>${art}</div>` : art; }
  return `<article class="sheet" id="${e.id}">${mast}${head}${body}${prov}</article>`;
}
function cards(list) { return `<ul class="cards">${list.map(e => `<li><a class="card" href="#${e.id}"><span class="s">${esc(e.st[1])}</span><h3>${esc(e.titre)}</h3><p>${esc(e.q || e.desc)}</p></a></li>`).join('')}</ul>`; }

const SCRIPT = `<script>(function(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;var el=document.querySelector('h1.type');if(!el||!document.body.classList.contains('typing'))return;var t=el.dataset.t;el.textContent='';var i=0;(function n(){el.textContent=t.slice(0,++i);if(i<t.length)setTimeout(n,55);else el.classList.add('done')})()})()</script>`;
const LIVE = `<script>(function(){var b=document.body;if(!b.classList.contains('live')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;var els=[].slice.call(document.querySelectorAll('.tw')),spans=[];els.forEach(function(el){var t=el.textContent;el.innerHTML='';for(var i=0;i<t.length;i++){var s=document.createElement('span');s.className='o';s.textContent=t[i];el.appendChild(s);spans.push(s)}});var i=0,last=null,done=false,btn=document.createElement('button');btn.className='skip';btn.type='button';btn.textContent='Passer';document.body.appendChild(btn);function end(){done=true;spans.forEach(function(s){s.className=''});if(last)last.classList.remove('lastc');btn.remove()}btn.onclick=end;(function step(){if(done)return;var n=3;while(n--&&i<spans.length){if(last)last.classList.remove('lastc');var s=spans[i++];s.className='lastc';last=s}if(last){var r=last.getBoundingClientRect();if(r.bottom>innerHeight-60)scrollBy(0,r.bottom-innerHeight+120)}if(i<spans.length)setTimeout(step,24);else end()})()})()</script>`;

function page(k) {
  const s = S[k], feat = byId[s.univ === 'mystere' ? 'wow' : 'nessie'], others = entries.filter(e => e.univ === s.univ && e.id !== feat.id);
  const title = `${s.nom} · maquette ${s.univ === 'mystere' ? 'Mystères' : 'Folklore'}`;
  return `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)}</title>
<style>${FONTS}${BASE}${s.css}</style>${FILTERS}
<body class="${k === 'm1' || k === 'm6' || k === 'm1b' ? 'typing' : k === 'm1d' ? 'live' : ''}"><div class="maq"><b>Maquette</b><span>${esc(title)} · données réelles, contenu de démonstration</span><a href="index.html">Tous les styles</a>${nav(k)}</div>
<div class="wrap"><main>${dossier(feat, k)}<h2 class="cat">Autres dossiers</h2>${cards(others)}</main></div>${SCRIPT}${LIVE}`;
}
for (const k of Object.keys(S)) if (!HIDE.has(k)) writeFileSync(`docs/labo/${k}.html`, page(k));

// Page d'accueil du labo : les huit styles, leur résumé et leur risque.
const idx = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Labo des styles · Unknownpedia</title>
<style>${FONTS}${BASE}body{background:#f4f3ef;color:#15181d;font:16px/1.5 "Archivo Narrow",sans-serif}.wrap{max-width:1100px;margin:0 auto;padding:30px 18px 70px}h1{font:400 34px/1.1 "IM Fell DW Pica",serif;margin:.2em 0}h2{font:400 22px "IM Fell DW Pica",serif;margin:34px 0 10px;border-bottom:1px solid #15181d;padding-bottom:4px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px}.t{border:1px solid #15181d;background:#fff;display:flex;flex-direction:column;text-decoration:none}.t img{width:100%;aspect-ratio:4/3;object-fit:cover;object-position:top;border-bottom:1px solid #15181d;background:#ddd}.t div{padding:10px 12px}.t b{font:400 20px "IM Fell DW Pica",serif;display:block}.t small{display:block;margin-top:6px;color:#555}.t span{color:#b3122f;font-size:12px;letter-spacing:.1em;text-transform:uppercase}</style>
<div class="maq"><b>Maquette</b><span>Labo des styles pour les deux nouveaux univers · hors site, non indexé</span></div>
<div class="wrap"><h1>Labo des styles</h1><p>Huit directions pour « Mystères » et « Folklore », sur de vraies données publiques (Wikipédia, Wikidata, Wikimedia Commons). Le contenu est de démonstration : statuts non validés, brouillons IA, aucune relecture. La planche de brevet (science) n'est pas touchée.</p>
${['mystere', 'folklore'].map(u => `<h2>${u === 'mystere' ? 'Mystères et enquêtes documentées' : 'Mythes et folklore'}</h2><div class="g">${Object.entries(S).filter(([k, s]) => s.univ === u && !HIDE.has(k)).map(([k, s]) => `<a class="t" href="${k}.html"><img src="vignettes/${k}.png" alt="" loading="lazy" onerror="this.style.display='none'"><div><span>${k.toUpperCase()}</span><b>${esc(s.nom)}</b>${esc(s.pitch)}<small>Risque : ${esc(s.risque)}</small></div></a>`).join('')}</div>`).join('')}</div>`;
writeFileSync('docs/labo/index.html', idx);
console.log('labo : 8 styles + index');
