/* MiniBlocos · Ferramentas extras: Bússola, Luneta e Vara de pescar (índices em TOOLS) */
const T_COMPASS=13,T_SPY=14,T_ROD=15;
const ZS=()=>camera.fov/75;   // a sensibilidade do olhar acompanha o zoom da luneta

// ---- Bússola: seta para o norte, direção, coordenadas e distância até o alfinete ----
const cmpEl=document.createElement('div');cmpEl.id='compass';
cmpEl.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 2l5 11H7z" fill="#e33" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/><path d="M12 22l-5-9h10z" fill="#9aa" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/></svg><span></span>';
document.body.appendChild(cmpEl);
const CARD=['N','NE','L','SE','S','SO','O','NO'];let cmpTxt='';
function updateCompass(){
  if(tool!==T_COMPASS){cmpEl.style.display='none';return;}
  cmpEl.style.display='flex';
  cmpEl.firstChild.style.transform='rotate('+P.yaw.toFixed(3)+'rad)';   // a ponta vermelha aponta para o norte
  const deg=((-P.yaw*180/Math.PI)%360+360)%360;
  let tx=CARD[Math.round(deg/45)%8]+' '+Math.round(deg)+'°<br><small>x '+Math.floor(P.x)+' · z '+Math.floor(P.z);
  if(typeof pin!=='undefined'&&pin)tx+=' · 📍 '+Math.round(Math.hypot(pin.x-P.x,pin.z-P.z))+' m';
  tx+='</small>';if(tx!==cmpTxt){cmpTxt=tx;cmpEl.lastChild.innerHTML=tx;}}

// ---- Luneta: aproxima a visão (zoom suave) com moldura circular ----
const spyEl=document.createElement('div');spyEl.id='spyglass';document.body.appendChild(spyEl);
function updateZoom(dt){const tf=tool===T_SPY?25:75;
  if(Math.abs(camera.fov-tf)>.05){camera.fov+=(tf-camera.fov)*Math.min(1,dt*10);camera.updateProjectionMatrix();}
  else if(camera.fov!==tf){camera.fov=tf;camera.updateProjectionMatrix();}
  spyEl.style.opacity=Math.max(0,Math.min(1,(75-camera.fov)/45)).toFixed(2);}

// ---- Vara de pescar: mire na água perto de peixes, lance, espere um se aproximar e puxe ----
const rod={s:0,x:0,y:0,z:0,t:0,bt:0,f:null};   // s: 0 parado, 1 esperando, 2 fisgou
const bobber=new THREE.Mesh(new THREE.BoxGeometry(.2,.2,.2),new THREE.MeshBasicMaterial({color:0xe53935}));
const bobTop=new THREE.Mesh(new THREE.BoxGeometry(.2,.08,.2),new THREE.MeshBasicMaterial({color:0xffffff}));bobTop.position.y=.14;bobber.add(bobTop);
bobber.visible=false;scene.add(bobber);
const lineG=new THREE.BufferGeometry();lineG.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(6),3));
const lineO=new THREE.LineSegments(lineG,new THREE.LineBasicMaterial({color:0xffffff}));lineO.frustumCulled=false;lineO.visible=false;scene.add(lineO);
const _fd=new THREE.Vector3(),_fh=new THREE.Vector3();
function waterTarget(){camera.getWorldDirection(_fd);const o=camera.position;
  for(let t=0;t<5/S;t+=.05){const x=Math.floor(o.x+_fd.x*t),y=Math.floor(o.y+_fd.y*t),z=Math.floor(o.z+_fd.z*t),g=get(x,y,z);
    if(g===8)return get(x,y+1,z)===8?null:{x:x+.5,y:y+.88,z:z+.5};   // só a superfície da água
    if(g)return null;}
  return null;}
function fishReset(){if(rod.f){rod.f.lure=false;rod.f.arrived=false;rod.f=null;}rod.s=0;bobber.visible=false;lineO.visible=false;}
function fishUse(){
  if(rod.s===0){const w=waterTarget();if(!w){toast('🎣 Mire na água para lançar a linha');return;}
    const f=nearestFish(w.x,w.y,w.z,10);if(!f){toast('🐟 Não há peixes por perto. Tente outro trecho de água');return;}
    rod.s=1;rod.x=w.x;rod.y=w.y;rod.z=w.z;rod.t=16;rod.f=f;f.lure=true;f.arrived=false;f.flee=0;bobber.visible=true;lineO.visible=true;toast('🎣 Linha lançada... espere um peixe se aproximar');wearTool(1);}
  else if(rod.s===1){if(rod.f)rod.f.flee=2;fishReset();toast('🎣 Você puxou cedo demais e assustou o peixe');}
  else{const f=rod.f,n=f?f.kd.y+(f.sz>(f.kd.sz[0]+f.kd.sz[1])/2?1:0):1,nm=f?f.kd.n:'Peixe',rare=f&&f.kd.w<=1;if(f)killFish(f);meat+=n;toast((rare?'✨ ':'🐟 ')+nm+' fisgado! +'+n+' carne');fishReset();}}
function updateFish(dt,now){
  if(rod.s===0)return;
  if(tool!==T_ROD||Math.hypot(rod.x-P.x,rod.z-P.z)>14||(rod.f&&fishes.indexOf(rod.f)<0)){fishReset();return;}   // trocou de ferramenta, se afastou ou o peixe sumiu
  if(rod.s===1){rod.t-=dt;
    if(rod.f&&rod.f.arrived){rod.s=2;rod.bt=1.4;toast('🐟 Fisgou! Toque para puxar!');}
    else if(rod.t<=0){fishReset();toast('🎣 Os peixes ignoraram a isca. Tente de novo');return;}}
  else{rod.bt-=dt;if(rod.bt<=0){if(rod.f)rod.f.flee=3;fishReset();toast('🐟 O peixe escapou...');return;}}
  bobber.position.set(rod.x,rod.y+Math.sin(now/300)*.03-(rod.s===2?.14+Math.sin(now/45)*.05:0),rod.z);
  _fh.set(.35,-.3,-.7).applyQuaternion(camera.quaternion).add(camera.position);   // ponta da vara
  const a=lineG.attributes.position;a.array[0]=_fh.x;a.array[1]=_fh.y;a.array[2]=_fh.z;a.array[3]=bobber.position.x;a.array[4]=bobber.position.y;a.array[5]=bobber.position.z;a.needsUpdate=true;}

function updateExtraTools(dt,now){toolTick(dt);updateCompass();updateZoom(dt);updateFishes(dt,now);updateFish(dt,now);}
