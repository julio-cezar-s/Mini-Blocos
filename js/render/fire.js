/* MiniBlocos · Fogueiras e lampiões (chamas, luz, brilho nos blocos) */
// fogueiras: chamas que piscam + luz
const fires=[];
// Só estas luzes existem na cena (número fixo => colocar/quebrar fogueira não recompila os shaders dos animais/flechas).
// A cada quadro elas são movidas para as fogueiras mais próximas do jogador; o brilho nos blocos vem do atributo "fb" das malhas.
const FIRE_LIGHTS=2,lightPool=[];
for(let i=0;i<FIRE_LIGHTS;i++){const l=new THREE.PointLight(0xff8a30,0,10);scene.add(l);lightPool.push(l);}
function updateFireLights(now){const t=now/1000,cand=[];
  for(const f of fires)if(!f.lamp)cand.push([(f.x+.5-P.x)*(f.x+.5-P.x)+(f.z+.5-P.z)*(f.z+.5-P.z)+(f.y-P.y)*(f.y-P.y),f]);
  cand.sort((a,b)=>a[0]-b[0]);
  lightPool.forEach((l,i)=>{const e=cand[i];if(!e){l.intensity=0;return;}const f=e[1];
    l.position.set(f.x+.5,f.y+1.9,f.z+.5);l.intensity=1.5+.45*Math.sin(t*11)+.25*Math.sin(t*27);});}
// fogueiras/lampiões perto do chunk que está sendo montado (evita testar todas para cada face)
let fireCand=null;
function fireChunk(cx,cz){if(!fires.length){fireCand=null;return;}const x0=cx*16-9,x1=cx*16+25,z0=cz*16-9,z1=cz*16+25;
  fireCand=fires.filter(f=>f.x+.5>=x0&&f.x+.5<=x1&&f.z+.5>=z0&&f.z+.5<=z1);}
function fireB(x,y,z,n){const L=fireCand||fires;if(!L.length)return 0;let b=0;const cx=x+.5+n[0]*.5,cy=y+.5+n[1]*.5,cz=z+.5+n[2]*.5;
  for(const f of L){const dx=cx-f.x-.5,dy=cy-f.y-(f.lamp?.5:1),dz=cz-f.z-.5;if(dx*dx+dy*dy+dz*dz>64.001)continue;   // rejeição barata antes do hypot
    const d=Math.hypot(dx,dy,dz);if(d<8){const w=1-d/8;b+=w*w;}}return Math.min(b,1);}
function addFire(x,y,z){const g=new THREE.Group();g.position.set(x+.5,y+1,z+.5);const fl=[];
  [[.46,.34,0xff4d12],[.32,.5,0xff8a1a],[.17,.62,0xffd23a]].forEach(([w,h,c])=>{const geo=new THREE.BoxGeometry(w,h,w);geo.translate(0,h/2,0);
    const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:c}));g.add(m);fl.push(m);});
  scene.add(g);fires.push({x,y,z,g,fl});}
function addLamp(x,y,z){fires.push({x,y,z,lamp:true});}
function removeFire(x,y,z){const i=fires.findIndex(f=>f.x===x&&f.y===y&&f.z===z);if(i>=0){if(fires[i].g){scene.remove(fires[i].g);fires[i].g.children.forEach(m=>{if(m.geometry)m.geometry.dispose();if(m.material)m.material.dispose();});}fires.splice(i,1);}}
function flick(f,now){if(f.lamp)return;const t=now/1000;f.fl.forEach((m,i)=>{m.scale.y=1+.28*Math.sin(t*9+i*2)+.1*Math.sin(t*23+i);m.position.x=.04*Math.sin(t*7+i*3);m.position.z=.04*Math.cos(t*6+i);});}
