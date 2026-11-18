const $ = id => document.getElementById(id);
const {items, codes} = JSON.parse($('collection').textContent);
const byName = (a,b) => a.titre.localeCompare(b.titre,'fr');
const numbers = new Map([...items].sort(byName).map((item,i) => [item.id,String(i+1).padStart(2,'0')]));
const dates = new Intl.NumberFormat('fr');
const fields = {
  date: i=>i.year,
  attention: i=>i.wikis == null ? null : -i.wikis,
  longitude: i=>i.coord?.[1]
};

let sorted = [], page = 0, columns = 0, view, current, opener;
const perPage = () => columns*2;

function sortItems() {
  const key = $('order').value;
  sorted = [...items].sort((a,b) => {
    if (key==='alpha') return byName(a,b);
    if (key==='status') return codes[a.st].localeCompare(codes[b.st],'fr') || byName(a,b);
    const left=fields[key](a), right=fields[key](b);
    return (left==null)-(right==null) || left-right || byName(a,b);
  });
}

function entry(item,index) {
  const li = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'entry';
  const number = document.createElement('span');
  number.textContent = numbers.get(item.id);
  button.append(number,item.titre);
  button.onclick = () => {
    if(index) $('index').close();
    openItem(item,index ? $('index-button') : button);
  };
  li.append(button);
  return li;
}

function display() {
  const start = page*perPage();
  const batch = sorted.slice(start,start+perPage());
  view?.display(batch,columns,numbers);
  $('range').textContent = (start+1)+'–'+(start+batch.length)+' sur '+sorted.length;
  $('prev').disabled = page===0;
  $('next').disabled = start+batch.length>=sorted.length;
  if (!$('fallback').hidden) {
    const title = document.createElement('p');
    title.textContent = 'La 3D est indisponible. Les dossiers sont consultables ici.';
    const list = document.createElement('ol');
    list.replaceChildren(...batch.map(i=>entry(i,false)));
    $('fallback').replaceChildren(title,list);
  }
}

function closeDrawer() {
  current = null;
  view?.close();
}

function showRecord(item) {
  if(current!==item) return;
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

function openItem(item,trigger=$('index-button')) {
  const targetPage=Math.floor(sorted.indexOf(item)/perPage());
  if(page!==targetPage) {page=targetPage;display();}
  current=item;
  opener=trigger;
  if(view) view.open(item,()=>showRecord(item));
  else showRecord(item);
}

$('record').addEventListener('close',() => {
  closeDrawer();
  (opener?.isConnected ? opener : $('index-button')).focus({preventScroll:true});
});
for(const dialog of document.querySelectorAll('dialog')) {
  dialog.querySelector('.close').onclick=()=>dialog.close();
  dialog.addEventListener('click',e => {
    if(e.target!==dialog) return;
    const r=dialog.getBoundingClientRect();
    if(e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom) dialog.close();
  });
}
$('index-button').onclick=()=>{closeDrawer();$('index').showModal();};
$('order').onchange=()=>{
  closeDrawer();
  page=0;
  sortItems();
  $('entries').replaceChildren(...sorted.map(i=>entry(i,true)));
  display();
};
function turn(delta) {closeDrawer();page+=delta;display();}
$('next').onclick=()=>turn(1);
$('prev').onclick=()=>turn(-1);
addEventListener('keydown',e=>{if(e.key==='Escape' && !$('record').open) closeDrawer();});

function resize() {
  const width=$('stage').clientWidth;
  const next=width<540 ? 1 : width<900 ? 2 : 3;
  if(columns===next) {view?.resize();return;}
  const first=current ? sorted.indexOf(current) : page*columns*2;
  columns=next;
  page=Math.floor(first/perPage());
  display();
  if(current && !$('record').open) showRecord(current);
}
function fallback() {
  view=null;
  $('cabinet').hidden=true;
  $('loading').hidden=true;
  $('fallback').hidden=false;
  display();
  if(current && !$('record').open) showRecord(current);
}

sortItems();
resize();
$('entries').replaceChildren(...sorted.map(i=>entry(i,true)));
new ResizeObserver(resize).observe($('stage'));
$('cabinet').addEventListener('webglcontextlost',fallback);
try {
  const [{createCabinet}] = await Promise.all([
    import('./cabinet-scene.js'),
    document.fonts.load('18px Standard'),
    document.fonts.load('16px Archivo')
  ]);
  view=createCabinet($('cabinet'),item=>openItem(item));
  display();
  $('loading').hidden=true;
} catch(error) {
  console.warn('Cabinet 3D indisponible.',error);
  fallback();
}
