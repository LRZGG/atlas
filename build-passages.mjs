// Passer d'un monde à l'autre : sept transitions (passages.html) entre la carte scientifique, les Mystères et le Folklore, sur les vraies pages en iframes, plus une version « la matière change en défilant » (passage-matiere.html).
import { writeFileSync } from 'node:fs';
const T = [
  ['iris', 'Iris', "Un cercle s'ouvre depuis l'endroit où l'on clique et révèle l'autre monde. Net, rapide, très lisible.", "Le plus propre et le plus sûr. Peu de personnalité par lui-même."],
  ['vide', 'Plongée dans le vide', "On zoome dans le centre de la carte, la planche se dissout, l'autre monde émerge. C'est l'idée « terra incognita » en geste.", "Le plus cohérent avec le projet : la porte des Mystères est le vide central. À réserver aux passages depuis la carte."],
  ['calque', 'Papier calque', "L'autre monde glisse par-dessus comme un calque translucide, puis se fixe. Le premier reste visible en dessous un instant.", "Très élégant, cartographique. Le plus doux."],
  ['negatif', 'Négatif', "Un éclair de négatif photographique, grain compris, puis l'autre monde. Instantané.", "Spectaculaire et bon marché, mais à utiliser avec parcimonie (fatigue visuelle, accessibilité)."],
  ['rabat', 'Chemise qu\'on ouvre', "Le monde actuel s'ouvre comme la couverture d'une chemise sur son bord gauche et révèle l'autre dessous, en 3D.", "Très physique, parfait pour aller vers un dossier ; moins pertinent vers le folklore."],
  ['strates', 'Descente en strates', "Des bandes de papier balaient l'écran de bas en haut, chacune d'une époque, comme une coupe géologique. Du plus récent au plus ancien.", "Raconte le temps : science (surface) → mystères → folklore (le plus ancien)."],
  ['torche', 'Lampe torche', "On regarde l'autre monde à travers un cercle de lumière qui suit le curseur ; un clic y entre. Le passage devient un geste d'exploration.", "Le plus ludique et le plus à propos pour le mystère ; demande une souris ou un doigt, donc à doubler d'une version simple au clavier."]
];
const W = [['sci', 'Science', '../fr/', '#f4f3ef', 'La carte de la recherche'], ['mys', 'Mystères', 'viz-mystere.html#carte', '#1b2829', 'Le fichier des mystères'], ['fol', 'Folklore', 'viz-folklore.html#carte', '#d6d3c9', 'Le bestiaire du monde']];
const page = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Passages entre les mondes · maquette</title>
<style>*{box-sizing:border-box}html,body{margin:0;height:100%;overflow:hidden;background:#0b0d0f;font:14px/1.45 "Archivo Narrow",system-ui,sans-serif;color:#fff}
@font-face{font-family:"Archivo Narrow";font-weight:400 700;src:url(../fonts/archivo-narrow.woff2) format("woff2")}@font-face{font-family:"IM Fell DW Pica";src:url(../fonts/imfell.woff2) format("woff2")}
#stage{position:fixed;inset:0;perspective:1800px;overflow:hidden}.world{position:absolute;inset:0;background:#fff;will-change:transform,opacity,clip-path,filter}.world iframe{width:100%;height:100%;border:0;display:block;pointer-events:none;background:#fff}.world.live iframe{pointer-events:auto}
.world[hidden]{display:none}
#hud{position:fixed;left:12px;top:12px;z-index:50;display:flex;flex-direction:column;gap:8px;max-width:min(430px,calc(100vw - 24px))}
.panel{background:#0c0e10e6;border:1px solid #ffffff55;padding:10px 12px;backdrop-filter:blur(6px)}.panel h1{font:400 20px "IM Fell DW Pica",serif;margin:0 0 6px;letter-spacing:.04em}
.row{display:flex;gap:6px;flex-wrap:wrap}.row button{font:inherit;letter-spacing:.06em;text-transform:uppercase;background:none;color:#fff;border:1px solid #ffffff88;padding:5px 10px;cursor:pointer}.row button[aria-pressed=true]{background:#fff;color:#111}
label{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#ffffffaa;display:block;margin:8px 0 4px}
.desc{margin:8px 0 0;font-size:13px}.desc b{color:#ffd24a;font-weight:600}
button:focus-visible{outline:2px solid #ffd24a;outline-offset:2px}
.portal{position:fixed;z-index:40;border:1.5px solid #fff;background:#0c0e10cc;color:#fff;padding:9px 16px;font:700 13px "Archivo Narrow";letter-spacing:.14em;text-transform:uppercase;cursor:pointer;backdrop-filter:blur(4px)}
#p-vide{left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;width:150px;height:150px;white-space:normal;text-align:center;line-height:1.25;padding:0}
#p-bord{right:18px;bottom:18px}#p-back{right:18px;top:18px}
.ov{position:fixed;inset:0;z-index:30;pointer-events:none}
.band{position:absolute;left:0;right:0;height:20%;display:flex;align-items:center;padding:0 5vw;font:400 26px "IM Fell DW Pica",serif;letter-spacing:.2em;text-transform:uppercase;transform:translateY(120%)}
#grain{position:fixed;inset:0;z-index:31;pointer-events:none;opacity:0;mix-blend-mode:overlay;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")}
@media(max-width:700px){#hud{max-width:calc(100vw - 24px)}.desc{display:none}#p-vide{width:110px;height:110px;font-size:11px}}</style>
<div id="stage">${W.map(([k, , src]) => `<div class="world live" id="w-${k}" ${k === 'sci' ? '' : 'hidden'}><iframe src="${src}" title="${k}"></iframe></div>`).join('')}</div>
<div class="ov" id="ov"></div><div id="grain"></div>
<button class="portal" id="p-vide" type="button">Entrer dans le vide<br>→ Mystères</button><button class="portal" id="p-bord" type="button">Au-delà du bord → Folklore</button><button class="portal" id="p-back" type="button" hidden>← Carte de la science</button>
<div id="hud"><div class="panel"><h1>Passer d'un monde à l'autre</h1><label>Monde</label><div class="row" id="wbtn">${W.map(([k, n]) => `<button type="button" data-w="${k}" aria-pressed="false">${n}</button>`).join('')}</div><label>Transition</label><div class="row" id="tbtn">${T.map(([k, n]) => `<button type="button" data-t="${k}" aria-pressed="false">${n}</button>`).join('')}</div><p class="desc" id="desc"></p></div></div>
<script>(function(){
const T=${JSON.stringify(T)},W=${JSON.stringify(W)},$=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let cur='sci',tr='iris',busy=false,last=[innerWidth/2,innerHeight/2];const el=k=>$('w-'+k);
addEventListener('pointerdown',e=>{last=[e.clientX,e.clientY]},true);
function setActive(){document.querySelectorAll('#wbtn button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.w===cur)));document.querySelectorAll('#tbtn button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.t===tr)));const t=T.find(x=>x[0]===tr);$('desc').innerHTML=t[2]+'<br><b>Avis :</b> '+t[3];
 $('p-vide').hidden=cur!=='sci';$('p-bord').hidden=cur!=='sci';$('p-back').hidden=cur==='sci';}
const A=(e,k,o)=>reduced?Promise.resolve():e.animate(k,Object.assign({fill:'forwards',easing:'cubic-bezier(.65,0,.25,1)'},o)).finished;
function reset(){document.querySelectorAll('.world').forEach(w=>{w.style.cssText='';w.getAnimations().forEach(a=>a.cancel())});$('stage').style.cssText='';$('ov').innerHTML='';$('grain').style.opacity=0}
async function go(to,opt){if(busy||to===cur)return;busy=true;const out=el(cur),inn=el(to);inn.hidden=false;inn.style.zIndex=2;out.style.zIndex=1;const [x,y]=(opt&&opt.at)||last,tt=(opt&&opt.t)||tr;
 if(reduced){}else if(tt==='iris'){await A(inn,[{clipPath:'circle(0% at '+x+'px '+y+'px)'},{clipPath:'circle(150% at '+x+'px '+y+'px)'}],{duration:1100});}
 else if(tt==='vide'){const o=(opt&&opt.at)?x+'px '+y+'px':'50% 50%';out.style.transformOrigin=o;inn.style.transformOrigin='50% 50%';A(out,[{transform:'scale(1)',opacity:1,filter:'blur(0)'},{transform:'scale(6)',opacity:0,filter:'blur(10px)'}],{duration:1200,easing:'cubic-bezier(.6,0,.9,.4)'});await A(inn,[{transform:'scale(.72)',opacity:0,filter:'blur(8px)'},{transform:'scale(1)',opacity:1,filter:'blur(0)'}],{duration:1100,delay:380,easing:'cubic-bezier(.2,.6,.2,1)'});}
 else if(tt==='calque'){inn.style.mixBlendMode='multiply';A(out,[{transform:'translateX(0)',filter:'brightness(1)'},{transform:'translateX(-6%)',filter:'brightness(.7)'}],{duration:1100});await A(inn,[{transform:'translateX(104%)',opacity:.88},{transform:'translateX(0)',opacity:.88,offset:.85},{transform:'translateX(0)',opacity:1}],{duration:1300});}
 else if(tt==='negatif'){inn.style.opacity=0;const g=$('grain');g.style.opacity=.5;const s=$('stage');await A(s,[{filter:'none'},{filter:'invert(1) contrast(1.5) brightness(1.2)',offset:.4},{filter:'invert(1) contrast(1.8) brightness(1.5)',offset:.55},{filter:'none'}],{duration:800,easing:'linear'}).then?null:null;}
 else if(tt==='rabat'){$('stage').style.perspective='1800px';out.style.transformOrigin='0 50%';inn.style.transform='scale(.96)';A(inn,[{transform:'scale(.95)',filter:'brightness(.6)'},{transform:'scale(1)',filter:'brightness(1)'}],{duration:1200});await A(out,[{transform:'rotateY(0deg)',boxShadow:'0 0 0 #0000'},{transform:'rotateY(-104deg)',boxShadow:'30px 0 80px #000a'}],{duration:1200});}
 else if(tt==='strates'){const cols=['#efe9d8','#d8caa7','#c2b08a','#a89574','#8d7d5e'],lab={sci:['2026','1900','1500','500','Antiquité'],mys:['2026','1900','1500','500','Antiquité'],fol:['Aujourd\\'hui','XIXe','Moyen Âge','Antiquité','Temps immémorial']};const ov=$('ov');ov.innerHTML=cols.map((c,i)=>'<div class="band" style="top:'+i*20+'%;background:'+c+';color:#2a2216">'+lab[to][i]+'</div>').join('');const bands=[...ov.children];inn.style.opacity=0;
  await Promise.all(bands.map((b,i)=>A(b,[{transform:'translateY(120%)'},{transform:'translateY(0)',offset:.45},{transform:'translateY(0)',offset:.6},{transform:'translateY(-120%)'}],{duration:1500,delay:i*110,easing:'cubic-bezier(.5,0,.3,1)'}))).catch(()=>{});
 }
 else if(tt==='torche'){await torche(inn,out,x,y);}
 if(tt==='negatif'||tt==='strates'){}
 reset();out.hidden=true;cur=to;busy=false;setActive();}
// mi-parcours pour les transitions à rideau : le nouveau monde apparaît quand l'écran est couvert
const _go=go;
async function go2(to,opt){const tt=(opt&&opt.t)||tr;if(tt==='negatif'||tt==='strates'){if(busy||to===cur)return;const out=el(cur),inn=el(to);const half=tt==='negatif'?330:700;setTimeout(()=>{inn.hidden=false;inn.style.opacity=1;inn.style.zIndex=2;out.hidden=true},half);}return _go(to,opt)}
function torche(inn,out,x0,y0){return new Promise(res=>{let x=x0,y=y0,r=0,tr=1,done=false;inn.style.clipPath='circle(0px at '+x+'px '+y+'px)';$('desc').innerHTML='<b>Lampe torche :</b> déplacez le curseur pour regarder dans l\\'autre monde, <b>cliquez</b> pour y entrer (Échap : annuler).';
 const move=e=>{x=e.clientX;y=e.clientY},click=()=>{done=true;cleanup();inn.animate([{clipPath:'circle('+r+'px at '+x+'px '+y+'px)'},{clipPath:'circle(170% at '+x+'px '+y+'px)'}],{duration:900,fill:'forwards',easing:'ease-in'}).finished.then(res)},key=e=>{if(e.key==='Escape'){done=true;cleanup();inn.hidden=true;res()}};
 function cleanup(){removeEventListener('pointermove',move);removeEventListener('click',click,true);removeEventListener('keydown',key)}
 addEventListener('pointermove',move);setTimeout(()=>addEventListener('click',click,true),250);addEventListener('keydown',key);
 (function f(){if(done)return;r+=(170-r)*.12;inn.style.clipPath='circle('+r+'px at '+x+'px '+y+'px)';requestAnimationFrame(f)})()})}
$('wbtn').onclick=e=>{const b=e.target.closest('button');if(b)go2(b.dataset.w)};
$('tbtn').onclick=e=>{const b=e.target.closest('button');if(b){tr=b.dataset.t;setActive();if(cur!=='sci'||true){const next=cur==='sci'?'mys':'sci';go2(next)}}};
$('p-vide').onclick=e=>{go2('mys',{t:'vide',at:[innerWidth/2,innerHeight/2]})};$('p-bord').onclick=()=>go2('fol',{t:'strates'});$('p-back').onclick=()=>go2('sci');
addEventListener('keydown',e=>{if(e.key==='1')go2('sci');if(e.key==='2')go2('mys');if(e.key==='3')go2('fol')});
setActive();window.__go=go2;
})()</script>`;
writeFileSync('docs/labo/passages.html', page);

// ---- La matière change en défilant : les « jetons » de style (couleurs, textures, polices) glissent d'un monde au suivant ----
const mat = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>La matière change en défilant · maquette</title>
<style>*{box-sizing:border-box}@font-face{font-family:"IM Fell DW Pica";src:url(../fonts/imfell.woff2) format("woff2")}@font-face{font-family:"Archivo Narrow";font-weight:400 700;src:url(../fonts/archivo-narrow.woff2) format("woff2")}@font-face{font-family:"Special Elite";src:url(fonts/special-elite-latin-400-normal.woff2) format("woff2")}@font-face{font-family:"Courier Prime";src:url(fonts/courier-prime-latin-400-normal.woff2) format("woff2")}@font-face{font-family:"Old Standard TT";src:url(fonts/old-standard-tt-latin-400-normal.woff2) format("woff2")}
html{scroll-behavior:smooth}body{margin:0;background:rgb(var(--bg));color:rgb(var(--ink));font:17px/1.6 "Archivo Narrow",sans-serif;transition:none}
.maq{position:fixed;left:0;right:0;top:0;z-index:20;font:12px "Archivo Narrow",sans-serif;background:#111;color:#fff;padding:6px 14px;display:flex;gap:14px;align-items:center}.maq a{color:#fff;border:1px solid #666;padding:1px 8px;text-decoration:none}.maq b{color:#ffd24a;letter-spacing:.1em;text-transform:uppercase}
.sticky{position:fixed;left:0;right:0;top:34px;z-index:10;padding:18px 6vw 0;pointer-events:none}.titles{position:relative;height:92px}.titles h1{position:absolute;left:0;top:0;margin:0;font-size:clamp(34px,6vw,78px);line-height:1;white-space:nowrap}
.t0{font:400 clamp(34px,6vw,78px)/1 "IM Fell DW Pica",serif;letter-spacing:.14em;text-transform:uppercase}.t1{font:400 clamp(30px,5.4vw,70px)/1 "Special Elite",monospace;letter-spacing:.04em;text-transform:uppercase}.t2{font:700 clamp(34px,6vw,78px)/.96 "Old Standard TT",serif;text-transform:uppercase}
.grain{position:fixed;inset:0;pointer-events:none;z-index:5;mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 .25 0 0 0 0 .2 0 0 0 0 .1 0 0 0 .2 0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E")}
.frame{position:fixed;inset:10px;border:2px solid rgb(var(--ink));pointer-events:none;z-index:6;border-radius:var(--r)}.frame::after{content:"";position:absolute;inset:5px;border:.7px solid rgb(var(--ink));border-radius:var(--r)}
section{min-height:120vh;padding:170px 6vw 80px;position:relative;z-index:2}section .c{max-width:62ch}section h2{font-size:15px;letter-spacing:.2em;text-transform:uppercase;opacity:.7}
.stamp{display:inline-block;border:2px solid rgb(var(--acc));color:rgb(var(--acc));padding:4px 12px;letter-spacing:.14em;text-transform:uppercase;font:700 13px "Archivo Narrow";transform:rotate(var(--rot))}
.leg{position:fixed;right:18px;bottom:16px;z-index:12;font:12px "Archivo Narrow";letter-spacing:.1em;text-transform:uppercase;background:rgb(var(--bg));border:1px solid rgb(var(--ink));padding:6px 10px}
.body{font-family:var(--bf)}</style>
<div class="maq"><b>Maquette</b><span>La matière change en défilant : couleurs, cadre, texture, titre</span><a href="index.html">Labo</a><a href="passages.html">Autres passages</a></div>
<div class="sticky"><div class="titles"><h1 class="t0">Science</h1><h1 class="t1">Mystères</h1><h1 class="t2">Folklore</h1></div></div><div class="frame"></div><div class="grain" id="gr"></div><div class="leg" id="leg">Science</div>
<section><div class="c body"><h2>1 · Ce qu'on mesure</h2><p>La carte de la recherche : 4 516 sujets, des courbes de niveau, le « ? » en carmin pour chaque question que personne n'a résolue. Papier blanc, encre noire, cadre à double filet.</p><p><span class="stamp">Question ouverte</span></p><p>Faites défiler : la matière du site change doucement, sans coupure, jusqu'au monde suivant.</p></div></section>
<section><div class="c body"><h2>2 · Ce qui a laissé des traces</h2><p>Les dossiers : le signal Wow!, le manuscrit de Voynich, la colonie de Roanoke. Le papier jaunit, le titre se tape à la machine, le cadre s'adoucit, un grain de photocopie apparaît.</p><p><span class="stamp">Énigme non résolue</span></p></div></section>
<section><div class="c body"><h2>3 · Ce qu'on a raconté</h2><p>Le bestiaire : le loch Ness, le yéti, le kappa. Le fond devient noir d'encre, les capitales deviennent gravées, le cadre s'épaissit : l'imprimé populaire.</p><p><span class="stamp">Folklore · récit répandu</span></p></div></section>
<script>(function(){
const S=[{bg:[251,251,249],ink:[21,24,29],acc:[179,18,47],r:0,rot:0,g:0,bf:'"Archivo Narrow",sans-serif',fw:1,name:'Science'},{bg:[236,231,214],ink:[29,28,27],acc:[161,29,35],r:2,rot:-4,g:.75,bf:'"Courier Prime",monospace',fw:1,name:'Mystères'},{bg:[26,26,28],ink:[236,232,221],acc:[236,232,221],r:0,rot:0,g:.15,bf:'"Old Standard TT",serif',fw:1,name:'Folklore'}];
const lerp=(a,b,t)=>a+(b-a)*t,mix=(a,b,t)=>a.map((v,i)=>Math.round(lerp(v,b[i],t))),ease=t=>t*t*(3-2*t);
function upd(){const h=document.documentElement,max=h.scrollHeight-innerHeight,p=Math.max(0,Math.min(1,scrollY/max))*2,i=Math.min(1,Math.floor(p)),t=ease(p-i),a=S[i],b=S[i+1]||S[2],tt=i>=1&&p>=2?1:t;
 const r=h.style;r.setProperty('--bg',mix(a.bg,b.bg,tt).join(','));r.setProperty('--ink',mix(a.ink,b.ink,tt).join(','));r.setProperty('--acc',mix(a.acc,b.acc,tt).join(','));r.setProperty('--r',lerp(a.r,b.r,tt)+'px');r.setProperty('--rot',lerp(a.rot,b.rot,tt)+'deg');r.setProperty('--bf',tt<.5?a.bf:b.bf);
 document.getElementById('gr').style.opacity=lerp(a.g,b.g,tt);document.getElementById('gr').style.mixBlendMode=i===1&&tt>.4?'screen':'multiply';
 const op=[1-Math.min(1,p),1-Math.abs(p-1),Math.max(0,p-1)];document.querySelectorAll('.titles h1').forEach((e,k)=>{e.style.opacity=Math.max(0,Math.min(1,op[k]*1.3));e.style.transform='translateY('+((k-p)*14)+'px)';e.style.color='rgb('+mix(a.ink,b.ink,tt).join(',')+')'});
 document.getElementById('leg').textContent=S[Math.round(p)].name}
addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd()})()</script>`;
writeFileSync('docs/labo/passage-matiere.html', mat);
console.log('passages : 2 pages');
