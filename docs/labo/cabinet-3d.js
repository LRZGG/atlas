const $ = id => document.getElementById(id);
const {items, codes} = JSON.parse($('collection').textContent);
const byName = (a,b) => a.titre.localeCompare(b.titre,'fr');
const numbers = new Map([...items].sort(byName).map((item,i) => [item.id,String(i+1).padStart(2,'0')]));
const dates = new Intl.NumberFormat('fr');
const folders = [...items].sort(byName);
let scene;

function showRecord(item) {
  $('reference').textContent = 'FOL / '+numbers.get(item.id)+' · '+codes[item.st];
  $('record-title').textContent = item.titre;
  $('description').textContent = item.desc;
  const date = item.year == null ? 'Non renseignée' : item.year<0 ? dates.format(-item.year)+' av. J.-C.' : String(item.year);
  $('facts').replaceChildren();
  for (const [label,value] of [['Date de référence',date],['Lieu',item.place || 'Non renseigné'],['Éditions Wikipédia',item.wikis ?? 'Non renseignées']]) {
    const dt=document.createElement('dt'), dd=document.createElement('dd');
    dt.textContent=label;
    dd.textContent=value;
    $('facts').append(dt,dd);
  }
  $('summary').textContent = item.x || '';
  $('sources').replaceChildren();
  for(const [label,url] of [['Wikipédia',item.wiki],['Wikidata','https://www.wikidata.org/wiki/'+item.qid]]) {
    const a=document.createElement('a');
    a.href=url;
    a.target='_blank';
    a.rel='noopener';
    a.textContent=label+' ↗';
    $('sources').append(a);
  }
  $('record').showModal();
  $('record').scrollTop = 0;
}

const record = $('record');
for (const [index, item] of folders.entries()) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = item.titre;
  button.onfocus = () => scene?.focus(index);
  button.onblur = () => scene?.unfocus();
  button.onclick = () => {
    if (scene) scene.open(index);
    else showRecord(item);
  };
  $('folders').append(button);
}
function closeRecord() {
  scene?.close();
  record.close();
}
record.querySelector('.close').onclick = closeRecord;
record.addEventListener('cancel', event => { event.preventDefault(); closeRecord(); });
record.addEventListener('click', event => {
  if (event.target !== record) return;
  const r = record.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) closeRecord();
});

const canvas = $('cabinet');
function fallback() {
  scene?.stop();
  scene = null;
  canvas.hidden = true;
  $('folders').classList.add('fallback');
}
canvas.addEventListener('webglcontextlost', fallback);
try {
  const [{createShelves}] = await Promise.all([
    import('./cabinet-scene.js'),
    document.fonts.load('24px Standard'),
    document.fonts.load('16px Archivo')
  ]);
  scene = createShelves(canvas, folders, showRecord);
} catch (error) {
  console.warn('Affichage des dossiers sans WebGL.', error);
  fallback();
}
