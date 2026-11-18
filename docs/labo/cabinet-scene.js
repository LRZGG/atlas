// Le tiroir entier se déplace sur un seul axe, dans une ouverture réservée.
import * as THREE from './vendor/three.module.js';

const pitch = 2.52;
const step = 1.56;
const width = pitch - .12;
const height = step - .12;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const material = (color, extras = {}) => new THREE.MeshStandardMaterial({color, roughness: .78, ...extras});

function texture(canvas) {
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

function walnut() {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const pixels = ctx.createImageData(canvas.width, canvas.height);
  let seed = 1729;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const ring = y + 6 * Math.sin(x * .005 + y * .018) + 2.5 * Math.sin(x * .013 + y * .033);
      const grain = 4 * Math.sin(ring * 2.2) + 4 * Math.sin(ring * .24) - 12 * Math.pow(.5 + .5 * Math.sin(ring * .52), 10) + 9 * (seed / 4294967296 - .5);
      const i = (y * canvas.width + x) * 4;
      pixels.data.set([99 + grain, 75 + grain * .72, 53 + grain * .52, 255], i);
    }
  }
  ctx.putImageData(pixels, 0, 0);
  return texture(canvas);
}

function box(parent, w, h, d, x, y, z, mat) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function makeLabel(item, number) {
  const c = document.createElement('canvas');
  c.width = 800;
  c.height = 240;
  const g = c.getContext('2d');
  const wash = g.createLinearGradient(0, 0, 0, 240);
  wash.addColorStop(0, '#d7c69d');
  wash.addColorStop(.2, '#eee3c9');
  wash.addColorStop(1, '#e1d4b6');
  g.fillStyle = wash;
  g.fillRect(0, 0, 800, 240);
  g.strokeStyle = '#b4a47f';
  g.strokeRect(13, 12, 774, 215);
  g.textAlign = 'center';
  g.fillStyle = '#665132';
  g.font = '32px Archivo, sans-serif';
  g.fillText('FOL   /   ' + number, 400, 67);
  g.fillStyle = '#231e18';
  let size = 79;
  do { g.font = size-- + 'px Standard, Georgia, serif'; }
  while (g.measureText(item.titre).width > 730 && size > 20);
  g.fillText(item.titre, 400, 164);
  return texture(c);
}

export function createCabinet(canvas, onPick) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias: true, powerPreference: 'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#111713');
  const camera = new THREE.PerspectiveCamera(31, 1, .1, 65);
  const woodMap = walnut();
  const wood = material('#ffffff', {map: woodMap, roughness:.73});
  const trim = material('#c7b9a8', {map: woodMap, roughness:.62});
  const inset = material('#453126');
  const brass = material('#bc995e', {metalness:.47, roughness:.37});
  const paper = material('#baaa84');
  const fileMats = ['#768076','#a18d66','#977563'].map(color => material(color));
  const cabinet = new THREE.Group();
  scene.add(cabinet);
  const floor = box(scene, 80, .1, 60, 0, -.055, -5, material('#34372f'));
  floor.castShadow = false;
  box(scene, 45, 22, .2, 0, 10, -1.03, material('#393e33'));

  // Une seule source physique, avec un point chaud et une couronne diffuse.
  const beam = document.createElement('canvas');
  beam.width = beam.height = 256;
  const ctx = beam.getContext('2d');
  const gradient = ctx.createRadialGradient(128,128,0,128,128,129);
  for (const [radius, color] of [[0,'#fffdf7'],[.16,'#f8f5eb'],[.38,'#d1cbc1'],[.7,'#ada79f'],[.91,'#7d776e'],[1,'#4c4743']]) gradient.addColorStop(radius,color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,256,256);
  const torch = new THREE.SpotLight(0xfff5e3, 1, 0, .71, .52, 2);
  torch.map = texture(beam);
  torch.castShadow = true;
  torch.shadow.mapSize.set(1024,1024);
  torch.shadow.bias = -.00025;
  torch.shadow.normalBias = .008;
  scene.add(torch, torch.target);

  const drawers = [];
  const pulls = new THREE.CatmullRomCurve3([[-.32,0,0],[-.30,-.035,.13],[-.21,-.085,.19],[.21,-.085,.19],[.30,-.035,.13],[.32,0,0]].map(p => new THREE.Vector3(...p)));
  const handleShape = new THREE.TubeGeometry(pulls,22,.036,8,false);
  const pinShape = new THREE.SphereGeometry(.033,10,6);
  const pickRay = new THREE.Raycaster();
  const cursor = new THREE.Vector2();
  const beamRay = new THREE.Raycaster();
  const beamPoint = new THREE.Vector3();
  const frontPlane = new THREE.Plane(new THREE.Vector3(0,0,1), -.6);
  let columns = 0, openSlot = -1, frame = 0, last = 0, afterOpen;
  let cabinetWidth = 0;
  const base = .33;
  const caseHeight = step * 2 + base;

  function rebuild(count) {
    for (const drawer of drawers) drawer.label.material.map?.dispose();
    cabinet.traverse(o => {
      if (o.geometry && o.geometry !== handleShape && o.geometry !== pinShape) o.geometry.dispose();
    });
    drawers.forEach(d => d.label.material.dispose());
    cabinet.clear();
    drawers.length = 0;
    columns = count;
    cabinetWidth = columns * pitch + .22;
    const W = cabinetWidth;
    box(cabinet,W,caseHeight, .1,0,caseHeight/2,-.82,inset);
    for (const side of [-1,1]) box(cabinet,.13,caseHeight,1.65,side*(W-.13)/2,caseHeight/2,-.01,wood);
    for (let row = 0; row <= 2; row++) {
      box(cabinet,W-.26,.075,1.58,0,base+step*row,-.01,trim);
    }
    for (let col=1; col<columns; col++) box(cabinet,.075,step*2,.11,(col-columns/2)*pitch,base+step,.73,trim);
    for (const [extra,h,y] of [[.08,.23,.12],[.23,.085,.25],[.12,.085,caseHeight+.065],[.27,.105,caseHeight+.16]]) {
      box(cabinet,W+extra,h,1.7+extra,0,y,0,trim);
    }
    for (let i=0; i<columns*2; i++) {
      const group = new THREE.Group();
      group.position.set((i%columns-(columns-1)/2)*pitch,base+(1.5-Math.floor(i/columns))*step,0);
      cabinet.add(group);
      box(group,width,height,.11,0,0,.76,wood);
      box(group,width-.14,height-.14,.044,0,0,.83,trim);
      box(group,width-.23,height-.23,.038,0,0,.859,wood);
      // Le porte-étiquette et la poignée sont fixés au même panneau.
      box(group,1.95,.62,.055,0,.20,.907,brass);
      const label = new THREE.Mesh(new THREE.PlaneGeometry(1.78,.535),new THREE.MeshLambertMaterial({color:'#ffffff'}));
      label.position.set(0,.20,.937);
      label.receiveShadow = true;
      group.add(label);
      for(const x of [-.925,.925,-.32,.32]) {
        const pin = new THREE.Mesh(pinShape,brass);
        pin.position.set(x, Math.abs(x)>.5 ? .20 : -.31, Math.abs(x)>.5 ? .936 : .91);
        group.add(pin);
      }
      const handle = new THREE.Mesh(handleShape,brass);
      handle.position.set(0,-.31,.91);
      handle.castShadow = true;
      group.add(handle);
      for (const side of [-1,1]) box(group,.045,.63,1.4,side*(width-.16)/2,-.25,0,wood);
      box(group,width-.16,.05,1.4,0,-.55,0,wood);
      for (let j=0;j<4;j++) {
        const z=.43-j*.28;
        box(group,width-.28,.83,.045,0,-.08,z,fileMats[j%3]);
        box(group,.52,.085,.045,(j%3-1)*.58,.372,z,fileMats[j%3]);
        box(group,width-.34,.69,.095,0,-.08,z-.079,paper);
      }
      drawers.push({group,label,item:null});
    }
  }

  function resize() {
    const {width:w,height:h} = canvas.getBoundingClientRect();
    renderer.setSize(Math.max(w,1), Math.max(h,1),false);
    camera.aspect = w/Math.max(h,1);
    const middle = caseHeight/2;
    const distance = Math.max(4.4,(cabinetWidth+.65)/camera.aspect) / (2*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))) + 1.25;
    camera.position.set(distance*.18,middle+distance*.31,distance);
    camera.lookAt(0,middle,0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    torch.position.copy(camera.position);
    torch.position.x -= .24;
    torch.position.y += .11;
    torch.intensity = distance*distance*3.9;
    aim(true);
    requestRender();
  }

  function aim(snap) {
    beamRay.setFromCamera(cursor,camera);
    beamRay.ray.intersectPlane(frontPlane,beamPoint);
    if (snap) torch.target.position.copy(beamPoint);
  }
  function requestRender() {
    if (!frame) frame = requestAnimationFrame(render);
  }
  function render(time) {
    frame = 0;
    const dt = Math.min((time-last)/1000,.055);
    last = time;
    const ease = reduced.matches ? 1 : 1-Math.exp(-12*dt);
    let moving = false;
    torch.target.position.lerp(beamPoint,ease);
    for (const [i,d] of drawers.entries()) {
      const target = i===openSlot ? 1.02 : 0;
      const delta = target-d.group.position.z;
      if (Math.abs(delta)>.003) {
        d.group.position.z += delta*ease;
        moving = true;
      } else d.group.position.z = target;
    }
    renderer.render(scene,camera);
    if (afterOpen && openSlot>=0 && drawers[openSlot].group.position.z>.97) {
      const done = afterOpen;
      afterOpen = null;
      done();
    }
    if (moving || torch.target.position.distanceToSquared(beamPoint)>.0001) requestRender();
  }

  function point(event) {
    const r = canvas.getBoundingClientRect();
    cursor.set(2*(event.clientX-r.left)/r.width-1,1-2*(event.clientY-r.top)/r.height);
    aim(reduced.matches);
    requestRender();
    pickRay.setFromCamera(cursor,camera);
    const hit = pickRay.intersectObject(cabinet,true).find(hit => hit.object.parent.visible);
    return drawers.find(d => d.item && hit?.object.parent===d.group);
  }
  canvas.addEventListener('pointermove',e => { canvas.style.cursor = point(e) ? 'pointer' : 'default'; });
  canvas.addEventListener('pointerleave',() => { if (openSlot>=0) return; cursor.set(0,0); aim(reduced.matches); requestRender(); });
  canvas.addEventListener('click',e => { const d = point(e); if(d) onPick(d.item); });

  return {
    display(items, count, numbers) {
      openSlot = -1;
      afterOpen = null;
      if (columns!==count) rebuild(count);
      drawers.forEach((d,i) => {
        d.group.position.z = 0;
        d.item = items[i];
        // Un tiroir vide reste fermé ; il garde une façade sans étiquette.
        d.label.material.map?.dispose();
        d.label.material.map = d.item ? makeLabel(d.item,numbers.get(d.item.id)) : null;
        d.label.material.color.set(d.item ? '#ffffff' : '#a8a08b');
        d.label.material.needsUpdate = true;
      });
      resize();
    },
    open(item,done) {
      openSlot = drawers.findIndex(d=>d.item===item);
      if(openSlot<0) { done(); return; }
      const selected = drawers[openSlot].group.position;
      beamPoint.set(selected.x,selected.y,.85);
      afterOpen = done;
      requestRender();
    },
    close() { openSlot=-1; afterOpen=null; requestRender(); },
    resize
  };
}
