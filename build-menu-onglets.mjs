// Page d'essai du menu des mondes : choisir la couleur, la police et l'animation, rejouer la transition. Le choix est mémorisé (localStorage) et appliqué à toutes les pages.
import { writeFileSync } from 'node:fs';
const html = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Essais du menu des mondes</title><script src="/menu-mondes.js" defer></script>
<style>*{box-sizing:border-box}@font-face{font-family:"Archivo Narrow";font-weight:400 700;src:url(../fonts/archivo-narrow.woff2) format("woff2")}@font-face{font-family:"IM Fell DW Pica";src:url(../fonts/imfell.woff2) format("woff2")}@font-face{font-family:"Special Elite";src:url(fonts/special-elite-latin-400-normal.woff2) format("woff2")}@font-face{font-family:"Old Standard TT";src:url(fonts/old-standard-tt-latin-400-normal.woff2) format("woff2")}@font-face{font-family:"Old Standard TT";font-weight:700;src:url(fonts/old-standard-tt-latin-400-normal.woff2) format("woff2")}
body{margin:0;background:#0f1113;color:#e9e6dc;font:15px/1.5 "Archivo Narrow",sans-serif}.w{max-width:900px;margin:0 auto;padding:70px 16px 60px}h1{font:400 28px "IM Fell DW Pica",serif;margin:0 0 6px}p{color:#c7cbd0;max-width:70ch}
fieldset{border:1px solid #ffffff44;margin:16px 0;padding:10px 14px}legend{letter-spacing:.14em;text-transform:uppercase;font-size:12px;color:#ffd24a;padding:0 6px}label{display:inline-flex;gap:6px;align-items:center;margin:4px 14px 4px 0;cursor:pointer}
.row{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.row button{font:inherit;letter-spacing:.1em;text-transform:uppercase;background:none;color:#fff;border:1px solid #ffffff88;padding:7px 14px;cursor:pointer}.row button:hover{background:#fff;color:#111}
.hint{font-size:13px;color:#9aa0a6}button:focus-visible,input:focus-visible{outline:2px solid #ffd24a;outline-offset:2px}</style>
<div class="w"><h1>Menu des trois mondes : essais</h1><p>La barre du haut est le vrai menu. Choisissez une couleur, une police et une animation ; le choix est mémorisé et s'applique à toutes les pages (carte, Mystères, Folklore). Les onglets ont tous la même taille et aucun vide : seule la plaque change d'onglet.</p>
<div id="ctl"></div><div class="row"><button type="button" data-p="0-1">Science → Mystères</button><button type="button" data-p="1-2">Mystères → Folklore</button><button type="button" data-p="2-0">Folklore → Science</button><button type="button" data-p="0-2">Science → Folklore</button></div>
<p class="hint">Les boutons rejouent la transition ici. Sur le site, l'animation joue au chargement de la page d'arrivée (le menu se souvient de l'onglet quitté).</p></div>
<script>addEventListener('load',function(){var M=window.__mm,ctl=document.getElementById('ctl'),pos=0;if(!M)return;
function grp(key,lab,obj){return '<fieldset><legend>'+lab+'</legend>'+Object.keys(obj).map(function(k){var n=typeof obj[k]==='string'?obj[k]:obj[k].n;return '<label><input type="radio" name="'+key+'" value="'+k+'"'+(M.cfg[key]===k?' checked':'')+'> '+n+'</label>'}).join('')+'</fieldset>'}
ctl.innerHTML=grp('c','Couleur',M.C)+grp('f','Police',M.F)+grp('a','Animation',M.A);
function show(from,to){M.render(M.cfg,from,to)}
ctl.onchange=function(e){var o={};o[e.target.name]=e.target.value;M.set(o);show(pos,(pos+1)%3);pos=(pos+1)%3};
document.querySelector('.row').onclick=function(e){var b=e.target.closest('button');if(!b)return;var a=b.dataset.p.split('-').map(Number);show(a[0],a[1]);pos=a[1]};
document.getElementById('mm').addEventListener('click',function(e){var a=e.target.closest('a');if(!a)return;e.preventDefault();var i=[].indexOf.call(this.querySelectorAll('a'),a);show(pos,i);pos=i});
show(0,0)})</script>`;
writeFileSync('docs/labo/menu-onglets.html', html); console.log('ok');
