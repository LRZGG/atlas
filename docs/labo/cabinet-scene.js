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

// Grain continu à l’échelle du meuble, y compris sur le chant chanfreiné.
function oakGrain() {
  const map = canvasMap(1024, 256, (g, w, h) => {
    const image = g.createImageData(w, h);
    let seed = 524;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        const a = x / w * Math.PI * 2, b = y / h * Math.PI * 2;
        const ripple = 3.6 * Math.sin(a + b) + 1.5 * Math.cos(2*a - b);
        const rings = b * 10 + ripple + 1.2 * Math.sin(2*b + a);
        const pore = Math.max(0, Math.sin(rings * 4 + .9*Math.cos(4*a))) ** 9;
        const grain = 10*Math.sin(rings) - 15*pore + 4*Math.sin(81*b + ripple) + 10*(seed/4294967296 - .5);
        const i = (y*w+x)*4;
        image.data[i] = 136 + grain;
        image.data[i+1] = 105 + grain*.83;
        image.data[i+2] = 76 + grain*.62;
        image.data[i+3] = 255;
      }
    }
    g.putImageData(image, 0, 0);
  });
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  return map;
}

function shelfBoard(frame, width, top, row, wood) {
  const shape = new THREE.Shape();
  const halfDepth = .565, thickness = .119, bevel = .012;
  // Section de la planche, du fond vers l’arête avant.
  shape.moveTo(-halfDepth, 0);
  shape.lineTo(halfDepth-bevel, 0);
  shape.lineTo(halfDepth, -bevel);
  shape.lineTo(halfDepth, bevel-thickness);
  shape.lineTo(halfDepth-bevel, -thickness);
  shape.lineTo(-halfDepth, -thickness);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {depth:width, bevelEnabled:false});
  geometry.rotateY(-Math.PI/2);
  geometry.translate(width/2, 0, 0);
  const {position, normal, uv} = geometry.attributes;
  for (let i=0; i<position.count; i++) {
    const x=position.getX(i), y=position.getY(i), z=position.getZ(i);
    const along = Math.abs(normal.getX(i))>.9 ? z : x;
    const across = Math.abs(normal.getY(i))>.9 ? z : y;
    uv.setXY(i, along/3.5 + row*.31, across/.86 + row*.39);
  }
  const mesh = new THREE.Mesh(geometry, wood);
  mesh.position.y = top;
  mesh.castShadow = mesh.receiveShadow = true;
  frame.add(mesh);
}

function rackPost(frame, x, bottom, iron, uprightFace, boltMaterial) {
  const postHeight = bottom+2*shelfPitch+.045;
  // Cornière repliée. Sa semelle porte le bois ; les boulons restent entre les dossiers.
  for (const z of [-.595,.59]) {
    const flange = z>0 ? [iron,iron,iron,iron,uprightFace,iron] : iron;
    block(frame,.103,postHeight,.021,x,postHeight/2,z,flange);
    block(frame,.017,postHeight,.075,x-.043,postHeight/2,z-Math.sign(z)*.048,iron);
  }
  for (let level=0; level<=2; level++) {
    const top = bottom + level*shelfPitch;
    block(frame,.17,.025,1.12,x,top-.132,0,iron);
    const head = new THREE.Mesh(new THREE.CylinderGeometry(.028,.031,.018,6), boltMaterial);
    head.rotation.x = Math.PI/2;
    head.position.set(x,top-.06,.609);
    head.castShadow = true;
    frame.add(head);
  }
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
  const grain = oakGrain();
  const wood = mat('#dbc8ae', {map:grain, bumpMap:grain, bumpScale:.016, roughness:.71});
  const iron = mat('#575950', {metalness:.43, roughness:.62});
  const uprightFace = mat('#aaa797', {metalness:.35, roughness:.66, map:canvasMap(48,1024,(g,w,h)=>{
    const fold = g.createLinearGradient(0,0,w,0);
    for (const [x,tone] of [[0,'#aaa697'],[.10,'#656861'],[.18,'#77796f'],[.94,'#7a7b70'],[1,'#a8a69a']]) fold.addColorStop(x,tone);
    g.fillStyle=fold; g.fillRect(0,0,w,h);
    for(let y=22;y<h;y+=42) {
      g.fillStyle='#aaa896';
      g.fillRect(20,y,9,16);
      g.fillStyle='#292d2a';
      g.fillRect(20,y,9,14);
    }
  })});
  const bolts = mat('#968776', {metalness:.55, roughness:.48});
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
    shelfBoard(frame, fullWidth+.15, bottom+row*shelfPitch, row, wood);
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
    rackPost(frame, left, bottom, iron, uprightFace, bolts);
    left += bayWidth;
  }
  rackPost(frame, left, bottom, iron, uprightFace, bolts);
  block(frame,fullWidth+.15,shelfPitch*2+.14,.07,0,bottom+shelfPitch-.02,-.61,backing);
  block(scene,55,.10,40,0,-.055,0,mat('#46463d'));
  block(scene,55,18,.1,0,8,-.73,mat('#494a40'));

  const torch = new THREE.SpotLight(0xfff4e4, 1, 0, .45, .55, 2);
  torch.map = canvasMap(256,256,(g,w,h)=>{
    const gradient = g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
    for(const [r,c] of [[0,'#ffffff'],[.09,'#f8f4ed'],[.22,'#beb9ad'],[.35,'#797469'],[.51,'#48443b'],[.72,'#2b2924'],[1,'#1c1b19']]) gradient.addColorStop(r,c);
    g.fillStyle=gradient; g.fillRect(0,0,w,h);
  });
  torch.castShadow=true;
  torch.shadow.mapSize.set(1024,1024);
  torch.shadow.bias=-.0003;
  torch.shadow.normalBias=.007;
  scene.add(torch, torch.target);

  const ray = new THREE.Raycaster(), cursor = new THREE.Vector2(0, .24);
  const aim = new THREE.Vector3();
  const plane = new THREE.Plane(new THREE.Vector3(0,0,1),-.46);
  let center = -fullWidth/2+.8, limit = 0, viewWidth = 0, distance = 0;
  let selected = -1, focused = -1, pending = false, drag = null;
  let raf = 0, last = 0, running = true;
  function redraw() {
    if(running && !raf) {
      last=performance.now();
      raf=requestAnimationFrame(render);
    }
  }
  function positionCamera() {
    const y = bottom+shelfPitch;
    camera.position.set(center+.22,y+.36,distance);
    camera.lookAt(center,y,0);
    camera.updateMatrixWorld();
    torch.position.copy(camera.position);
    torch.position.x-=.14;
    torch.position.y+=.09;
    torch.intensity=distance*distance*3.2;
    updateAim();
  }
  function updateAim() {
    ray.setFromCamera(cursor,camera);
    ray.ray.intersectPlane(plane,aim);
  }
  function resize() {
    const {width:w,height:h}=canvas.getBoundingClientRect();
    camera.aspect=w/h;
    torch.angle=Math.atan(.45*Math.min(1,camera.aspect));
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
    const elapsed = Math.max(0, (now-last)/1000);
    last=now;
    const ease = reduced.matches ? 1 : 1-Math.exp(-13*elapsed);
    const tracking = reduced.matches ? 1 : 1-Math.exp(-28*elapsed);
    const target = torch.target.position;
    target.lerp(aim,tracking);
    let moving = target.distanceToSquared(aim)>.000001;
    if (!moving) target.copy(aim);
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
    if(moving && running && !raf) raf=requestAnimationFrame(render);
  }
  function point(event) {
    const r=canvas.getBoundingClientRect();
    cursor.set(2*(event.clientX-r.left)/r.width-1,1-2*(event.clientY-r.top)/r.height);
    updateAim();
    redraw();
  }
  function hit() {
    ray.setFromCamera(cursor,camera);
    const nearest=ray.intersectObject(frame,true)[0];
    return nearest?.object.parent.userData.index ?? -1;
  }
  function open(index) {
    if(index<0) return;
    selected=index;
    pending=true;
    redraw();
  }
  function close() {
    selected=-1;
    pending=false;
    redraw();
  }
  // Le dialogue, son fond et les onglets reçoivent eux aussi les mouvements du pointeur.
  const trackingEvents = new AbortController();
  for (const type of ['pointermove','pointerdown','pointerup']) {
    window.addEventListener(type, event => {
      if (event.isPrimary) point(event);
    }, {capture:true, passive:true, signal:trackingEvents.signal});
  }
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  canvas.addEventListener('pointerdown',e=>{
    if(drag || (e.button!==0 && e.button!==2)) return;
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
        positionCamera();
        if(pending) close();
      }
    }
    canvas.style.cursor=drag?.pan ? 'grabbing' : hit()>=0 ? 'pointer' : 'default';
  });
  canvas.addEventListener('pointerup',e=>{
    if(drag?.id!==e.pointerId) return;
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
  torch.target.position.copy(aim);
  return {
    open, close,
    focus(index, restore) {
      focused=index;
      if(restore) { redraw(); return; }
      center=clamp(folders[index].folder.position.x,-limit,limit);
      positionCamera();
      const spineCenter = folders[index].folder.position.clone();
      spineCenter.z+=depth/2;
      spineCenter.project(camera);
      cursor.set(spineCenter.x,spineCenter.y);
      updateAim();
      redraw();
    },
    unfocus(){focused=-1;redraw();},
    stop(){running=false;trackingEvents.abort();cancelAnimationFrame(raf);observer.disconnect();}
  };
}
