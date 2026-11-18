import * as THREE from './vendor/three.module.js';

const height = 1.32;
const depth = .83;
const shelfPitch = 1.59;
const gap = .045;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = THREE.MathUtils.clamp;

function canvasMap(w, h, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext('2d'), w, h);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

const clothColors = ['#4f5247', '#51433c', '#555b56', '#514c43', '#424c49'];
function spine(item, index, width) {
  return canvasMap(Math.round(510 * width), Math.round(510 * height), (g, w, h) => {
    g.fillStyle = clothColors[index % clothColors.length];
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff0a';
    for (let y = 1; y < h; y += 4) g.fillRect(0, y, w, 1);
    g.fillStyle = '#0e110d1f';
    for (let x = 0; x < w; x += 3) g.fillRect(x, 0, 1, h);
    const fold = g.createLinearGradient(0, 0, w, 0);
    for (const [stop, tone] of [[0,'#0006'],[.045,'#fff2'],[.085,'#0002'],[.15,'#0000'],[.91,'#0000'],[1,'#0006']]) fold.addColorStop(stop, tone);
    g.fillStyle = fold;
    g.fillRect(0, 0, w, h);
    g.translate(w / 2, h * .45);
    g.rotate(-Math.PI / 2);
    const length = h * .69, label = w * .73;
    g.fillStyle = '#cdbf9f';
    g.fillRect(-length/2, -label/2, length, label);
    g.strokeStyle = '#877c67';
    g.lineWidth = 1.6;
    g.strokeRect(-length/2+6, -label/2+6, length-12, label-12);
    g.fillStyle = '#252720';
    g.textAlign = 'center';
    let size = 54;
    do { g.font = size-- + 'px Standard,Georgia,serif'; }
    while (g.measureText(item.titre).width > length-32 && size > 18);
    g.textBaseline = 'middle';
    g.fillText(item.titre, 0, -label*.065);
    g.font = '18px Archivo,sans-serif';
    g.fillStyle = '#5c5545';
    g.fillText('FOL  /  '+String(index+1).padStart(2,'0'), 0, label*.26);
    g.resetTransform();
    // Œillet de préhension, imprimé dans le matériau de la tranche.
    const r = w*.115, cy = h*.884;
    const ring = g.createLinearGradient(0,cy-r,0,cy+r);
    ring.addColorStop(0,'#b7a482'); ring.addColorStop(.6,'#605847'); ring.addColorStop(1,'#b0a07e');
    g.fillStyle = ring;
    g.beginPath(); g.arc(w/2, cy, r, 0, Math.PI*2); g.fill();
    g.fillStyle = '#171916';
    g.beginPath(); g.arc(w/2, cy, r*.75, 0, Math.PI*2); g.fill();
  });
}

function block(parent, w, h, d, x, y, z, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x,y,z);
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function createShelves(canvas, items, showRecord) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#121510');
  const camera = new THREE.PerspectiveCamera(39, 1, .06, 40);
  const mat = (color, extra={}) => new THREE.MeshStandardMaterial({color,roughness:.84,...extra});
  const wood = mat('#584a39', {map: canvasMap(512,128,(g,w,h)=>{
    g.fillStyle='#d6c5ae'; g.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=2) {
      g.fillStyle='rgba(72,52,34,'+(.08+.06*Math.sin(y*1.7))+')';
      g.fillRect(0,y,w,1);
    }
  })});
  const iron = mat('#53564d',{metalness:.38});
  const backing = mat('#424739');
  const pages = mat('#b9ac8c',{map:canvasMap(128,128,(g,w,h)=>{
    g.fillStyle='#e8decb'; g.fillRect(0,0,w,h);
    g.fillStyle='#ae9f82';
    for(let x=2;x<w;x+=5) g.fillRect(x,0,1,h);
  })});
  const folders = [];
  const frame = new THREE.Group();
  scene.add(frame);
  const perRow = Math.ceil(items.length/2);
  const bays = Math.ceil(perRow/5);
  const widthOf = item => .40 + .022*Math.sqrt(item.wikis ?? 4);
  const rows = [items.slice(0,perRow), items.slice(perRow)];
  const bayWidths = Array.from({length:bays}, (_,i) => .40 + Math.max(...rows.map(row =>
    row.slice(i*5,i*5+5).reduce((sum,item)=>sum+widthOf(item)+gap,0))));
  const fullWidth = bayWidths.reduce((a,b)=>a+b,0);
  const bottom = .22;
  for (let row=0;row<=2;row++) {
    block(frame, fullWidth+.15,.09,1.12,0,bottom+row*shelfPitch-.045,0,wood);
  }
  let left = -fullWidth/2;
  for (const [bay,bayWidth] of bayWidths.entries()) {
    for (const [row,contents] of rows.entries()) {
      let x = left+.17;
      for (const [slot,item] of contents.slice(bay*5,bay*5+5).entries()) {
        const index = row*perRow+bay*5+slot;
        const w = widthOf(item);
        const folder = new THREE.Group();
        const cover = mat(clothColors[index%clothColors.length]);
        const y = bottom+(1-row)*shelfPitch+height/2+.004;
        folder.position.set(x+w/2,y,.035+.014*Math.sin(index*3));
        const home = folder.position.z;
        frame.add(folder);
        block(folder,w-.048,height-.06,depth-.09,0,-.009,-.015,pages);
        for(const side of [-1,1]) block(folder,.018,height,depth-.03,side*(w-.018)/2,0,-.015,cover);
        const face = new THREE.MeshLambertMaterial({map:spine(item,index,w)});
        block(folder,w,height,.03,0,0,(depth-.03)/2,[cover,cover,cover,cover,face,cover]);
        folder.userData.index = index;
        folders[index] = {folder,home,item};
        x += w+gap;
      }
    }
    for(const z of [-.51,.51]) block(frame,.059,shelfPitch*2+.21,.058,left,bottom+shelfPitch-.05,z,iron);
    left += bayWidth;
  }
  for(const z of [-.51,.51]) block(frame,.059,shelfPitch*2+.21,.058,left,bottom+shelfPitch-.05,z,iron);
  block(frame,fullWidth+.15,shelfPitch*2+.14,.07,0,bottom+shelfPitch-.02,-.61,backing);
  block(scene,55,.10,40,0,-.055,0,mat('#46463d'));
  block(scene,55,18,.1,0,8,-.73,mat('#494a40'));

  const torch = new THREE.SpotLight(0xfff2db, 1, 0, .77, .76, 2);
  torch.map = canvasMap(256,256,(g,w,h)=>{
    const gradient = g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
    for(const [r,c] of [[0,'#ffffff'],[.19,'#f4eee4'],[.44,'#c6c0b5'],[.8,'#aba496'],[1,'#777064']]) gradient.addColorStop(r,c);
    g.fillStyle=gradient; g.fillRect(0,0,w,h);
  });
  torch.castShadow=true;
  torch.shadow.mapSize.set(1024,1024);
  torch.shadow.bias=-.0003;
  torch.shadow.normalBias=.007;
  scene.add(torch, torch.target);

  const ray = new THREE.Raycaster(), cursor = new THREE.Vector2();
  const aim = new THREE.Vector3();
  const plane = new THREE.Plane(new THREE.Vector3(0,0,1),-.46);
  let center = -fullWidth/2+.8, limit = 0, viewWidth = 0, distance = 0;
  let selected = -1, focused = -1, pending = false, drag = null;
  let raf = 0, last = 0, running = true;
  function redraw() {
    if(running && !raf) raf=requestAnimationFrame(render);
  }
  function positionCamera() {
    const y = bottom+shelfPitch;
    camera.position.set(center+.22,y+.36,distance);
    camera.lookAt(center,y,0);
    camera.updateMatrixWorld();
    torch.position.copy(camera.position);
    torch.position.x-=.14;
    torch.position.y+=.09;
    torch.intensity=distance*distance*4.0;
    ray.setFromCamera(cursor,camera);
    ray.ray.intersectPlane(plane,aim);
    if(focused>=0 || selected>=0) {
      const f = folders[selected>=0 ? selected : focused].folder.position;
      aim.set(f.x,f.y,.5);
    }
    torch.target.position.copy(aim);
  }
  function resize() {
    const {width:w,height:h}=canvas.getBoundingClientRect();
    camera.aspect=w/h;
    const visibleHeight=3.76;
    distance=.5+visibleHeight/(2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2)));
    viewWidth=visibleHeight*camera.aspect;
    limit=Math.max(0,fullWidth/2-Math.min(viewWidth*.35,fullWidth*.30));
    center=clamp(center,-limit,limit);
    camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);
    positionCamera();
    redraw();
  }
  function render(now) {
    raf=0;
    const ease=reduced.matches ? 1 : 1-Math.exp(-13*Math.max(0,(now-last)/1000));
    last=now;
    let moving=false;
    for(const [index,f] of folders.entries()) {
      const target=f.home+(index===selected ? .69 : index===focused ? .11 : 0);
      const delta=target-f.folder.position.z;
      if(Math.abs(delta)>.002) {
        f.folder.position.z+=delta*ease;
        moving=true;
      } else f.folder.position.z=target;
    }
    renderer.render(scene,camera);
    if(pending && selected>=0 && folders[selected].folder.position.z-folders[selected].home>.66) {
      pending=false;
      showRecord(folders[selected].item);
    }
    if(moving) redraw();
  }
  function point(event) {
    const r=canvas.getBoundingClientRect();
    cursor.set(2*(event.clientX-r.left)/r.width-1,1-2*(event.clientY-r.top)/r.height);
    positionCamera();
    redraw();
  }
  function hit() {
    ray.setFromCamera(cursor,camera);
    const nearest=ray.intersectObject(frame,true)[0];
    return nearest?.object.parent.userData.index ?? -1;
  }
  function open(index) {
    if(index<0) return;
    last=performance.now();
    selected=index;
    pending=true;
    positionCamera();
    redraw();
  }
  function close() {
    last=performance.now();
    selected=-1;
    pending=false;
    positionCamera();
    redraw();
  }
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  canvas.addEventListener('pointerdown',e=>{
    if(drag || (e.button!==0 && e.button!==2)) return;
    point(e);
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,center,pan:e.button===2 || e.pointerType!=='mouse',pick:e.button===0,moved:false};
    canvas.setPointerCapture(e.pointerId);
    if(!drag.pick) canvas.style.cursor='grabbing';
  });
  canvas.addEventListener('pointermove',e=>{
    if(drag && drag.id!==e.pointerId) return;
    if(drag) {
      const dx=e.clientX-drag.x;
      if(Math.hypot(dx,e.clientY-drag.y)>5) drag.moved=true;
      if(drag.pan && drag.moved) {
        center=clamp(drag.center-dx*viewWidth/canvas.clientWidth,-limit,limit);
        if(pending) close();
      }
    }
    point(e);
    canvas.style.cursor=drag?.pan ? 'grabbing' : hit()>=0 ? 'pointer' : 'default';
  });
  canvas.addEventListener('pointerup',e=>{
    if(drag?.id!==e.pointerId) return;
    point(e);
    if(drag.pick && !drag.moved) open(hit());
    drag=null;
    canvas.style.cursor='';
  });
  function cancelDrag(){drag=null;canvas.style.cursor='';}
  canvas.addEventListener('pointercancel',cancelDrag);
  canvas.addEventListener('lostpointercapture',cancelDrag);
  const observer=new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  return {
    open, close,
    focus(index) {
      focused=index;
      center=clamp(folders[index].folder.position.x,-limit,limit);
      positionCamera();
      redraw();
    },
    unfocus(){focused=-1;positionCamera();redraw();},
    stop(){running=false;cancelAnimationFrame(raf);observer.disconnect();}
  };
}
