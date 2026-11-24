/* MiniBlocos · Peixes: nadam em cardumes nos rios e lagos e são atraídos pela isca da vara */
const fishes=[];
// n: nome · c1/c2: cores · sh: forma · y: carne base · w: raridade (peso) · sz: faixa de tamanho (comprimento) · v: velocidade relativa · spots: pintas
const FKINDS=[
 {n:'Peixe laranja',c1:'#ff8a2a',c2:'#fff2dc',sh:'std',y:1,w:3,sz:[.32,.6]},
 {n:'Peixe azul',c1:'#5aa0d6',c2:'#dfe9f2',sh:'std',y:1,w:3,sz:[.32,.6]},
 {n:'Peixe prateado',c1:'#c9d3dc',c2:'#8aa0b3',sh:'std',y:1,w:3,sz:[.32,.6]},
 {n:'Peixe vermelho',c1:'#e04a4a',c2:'#f2c0a0',sh:'std',y:1,w:2,sz:[.32,.6]},
 {n:'Peixe verde',c1:'#6fbf73',c2:'#d9eed8',sh:'std',y:1,w:2,sz:[.32,.6]},
 {n:'Tilápia',c1:'#9fb0b8',c2:'#e8d8c0',sh:'deep',y:2,w:3,sz:[.4,.65]},
 {n:'Truta',c1:'#7a9a6a',c2:'#e6d8b0',sh:'std',y:2,w:2,sz:[.4,.65],spots:1},
 {n:'Dourado',c1:'#e8b030',c2:'#fff0c0',sh:'deep',y:3,w:1,sz:[.45,.7]},
 {n:'Baiacu',c1:'#e8d060',c2:'#a08030',sh:'puffer',y:1,w:1,sz:[.28,.4],v:.6},
 {n:'Moreia',c1:'#5a6a3a',c2:'#c8c040',sh:'eel',y:2,w:1,sz:[.6,.95],v:.8},
 {n:'Arraia',c1:'#6a7a8a',c2:'#c8d0d8',sh:'ray',y:3,w:1,sz:[.5,.75],v:.6}];
const FBL={std:.34,deep:.3,puffer:.24,eel:.9,ray:.55};   // comprimento do modelo base de cada forma
const FSCH={std:[3,3],deep:[2,2],puffer:[1,2],eel:[1,2],ray:[1,1]};   // tamanho do cardume: mínimo e variação
let fishInit=false,fishCand=[],FISH_N=0,fishRespT=0;
function mkFishModel(kd){const g=new THREE.Group(),c1=kd.c1,c2=kd.c2,sh=kd.sh;g.rotation.order='YXZ';
  const eye=(dx,dy,dz,sz)=>{for(const s of[-1,1])g.add(bx(.02,sz,sz,'#111',s*dx,dy,dz));};
  if(sh==='std'||sh==='deep'){const d=sh==='deep',bh=d?.22:.16;
    g.add(bx(.12,bh,.34,c1,0,0,0));g.add(bx(.1,bh*.88,.1,c1,0,0,.2));g.add(bx(.02,d?.14:.09,.16,c2,0,bh/2+(d?.05:.04),-.02));g.add(bx(.02,.04,.1,c2,0,-bh/2-.02,.04));
    eye(.055,.03,.23,.035);
    if(kd.spots)for(let i=0;i<7;i++)g.add(bx(.122,.025,.025,'#2a3a24',0,(Math.random()-.5)*.1,-.12+Math.random()*.28));   // pintas
    const tg=new THREE.Group();tg.position.z=-.17;tg.add(bx(.02,d?.26:.2,.15,c2,0,0,-.07));g.add(tg);g.userData.tg=tg;
  }else if(sh==='puffer'){
    g.add(bx(.22,.22,.24,c1,0,0,0));g.add(bx(.16,.14,.04,c2,0,-.06,.13));
    for(const p of[[.115,.05,-.05],[-.115,.05,-.05],[0,.115,0],[.115,-.04,.06],[-.115,-.04,.06]])g.add(bx(.03,.03,.03,c2,p[0],p[1],p[2]));   // espinhos
    eye(.11,.06,.1,.05);
    const fins=[];for(const s of[-1,1]){const fg=new THREE.Group();fg.position.set(s*.11,-.02,.02);fg.add(bx(.01,.07,.06,c2,s*.01,0,0));fg.userData.s=s;g.add(fg);fins.push(fg);}g.userData.fins=fins;
    const tg=new THREE.Group();tg.position.z=-.12;tg.add(bx(.02,.1,.07,c2,0,0,-.03));g.add(tg);g.userData.tg=tg;
  }else if(sh==='eel'){const segs=[];let par=g;
    for(let i=0;i<6;i++){const sg=new THREE.Group(),w=i?.08-i*.008:.09;sg.position.z=i?-.15:.3;
      sg.add(bx(w,w,i?.15:.17,i%3===1?c2:c1,0,0,0));if(i)sg.add(bx(.012,.03,.15,c2,0,w/2+.012,0));   // listras e nadadeira
      if(!i)for(const s of[-1,1])sg.add(bx(.02,.025,.025,'#111',s*.045,.02,.06));
      par.add(sg);par=sg;segs.push(sg);}
    g.userData.segs=segs;
  }else{   // arraia
    g.add(bx(.3,.05,.3,c1,0,0,0));g.add(bx(.26,.02,.26,c2,0,-.03,0));g.add(bx(.03,.03,.5,c2,0,0,-.38));g.add(bx(.08,.03,.08,c1,0,.03,.1));
    for(const s of[-1,1])g.add(bx(.03,.03,.03,'#111',s*.04,.055,.13));
    const wl=[];for(const s of[-1,1]){const wg=new THREE.Group();wg.position.set(s*.15,0,0);wg.add(bx(.2,.025,.28,c1,s*.1,0,0));wg.add(bx(.18,.015,.24,c2,s*.1,-.02,0));wg.userData.s=s;g.add(wg);wl.push(wg);}g.userData.wings=wl;}
  return g;}
function pickFishKind(){let tot=0;for(const k of FKINDS)tot+=k.w;let r=Math.random()*tot;for(const k of FKINDS){r-=k.w;if(r<=0)return k;}return FKINDS[0];}
function spawnFishAt(x,y,z,kd){const sz=kd.sz[0]+Math.random()*(kd.sz[1]-kd.sz[0]),g=mkFishModel(kd);g.scale.setScalar(sz/FBL[kd.sh]);g.position.set(x,y,z);scene.add(g);
  const f={g,x,y,z,kd,sz,rot:Math.random()*6.283,th:0,tt:0,dy:0,flee:0,lure:false,arrived:false,off:Math.random()*10,t:0};f.th=f.rot;fishes.push(f);return f;}
function killFish(f){const i=fishes.indexOf(f);if(i>=0)fishes.splice(i,1);scene.remove(f.g);}
function spawnSchool(){if(!fishCand.length)return;
  for(let tr=0;tr<30;tr++){const c=fishCand[Math.floor(Math.random()*fishCand.length)];if(get(c[0],c[1],c[2])!==8||get(c[0],c[1]-1,c[2])!==8)continue;
    const kd=pickFishKind(),sc=FSCH[kd.sh],k=sc[0]+Math.floor(Math.random()*(sc[1]+1));
    for(let i=0;i<k;i++){const x=c[0]+.5+(Math.random()-.5)*2.5,y=c[1]+.4+Math.random()*.2,z=c[2]+.5+(Math.random()-.5)*2.5;
      if(get(Math.floor(x),Math.floor(y),Math.floor(z))===8)spawnFishAt(x,y,z,kd);}
    return;}}
function initFish(){fishInit=true;   // cria os peixes depois que o mundo (ou o save) já está carregado
  for(let x=0;x<W;x++)for(let z=0;z<D;z++)for(let y=1;y<H;y++)if(B[idx(x,y,z)]===8&&B[idx(x,y-1,z)]===8)fishCand.push([x,y,z]);
  FISH_N=fishCand.length<30?0:Math.min(26,Math.floor(fishCand.length/40));
  for(let i=0;i<8&&fishes.length<FISH_N;i++)spawnSchool();}
// peixe mais próximo (de uma isca) dentro de maxD blocos
function nearestFish(x,y,z,maxD){let best=null,bd=maxD;for(const f of fishes){const d=Math.hypot(f.x-x,f.y-y,f.z-z);if(d<bd){bd=d;best=f;}}return best;}
function updFish(f,dt,now){
  f.t+=dt;if(f.flee>0)f.flee-=dt;
  const cx=Math.floor(f.x),cy=Math.floor(f.y),cz=Math.floor(f.z);
  if(get(cx,cy,cz)!==8)return false;   // a água sumiu: peixe removido
  let sp=(.7+f.sz*.4)*(f.kd.v||1),luring=f.lure&&typeof rod!=='undefined'&&rod.f===f&&rod.s>=1;
  if(luring){const dx=rod.x-f.x,dy=(rod.y-.4)-f.y,dz=rod.z-f.z,d=Math.hypot(dx,dy,dz);
    if(d<.7)f.arrived=true;
    if(f.arrived){sp=0;f.th=Math.atan2(dx,dz);}else{sp=1.5;f.th=Math.atan2(dx,dz);f.dy=Math.max(-.8,Math.min(.8,dy));}}
  else{f.tt-=dt;if(f.tt<=0){f.th=Math.random()*6.283;f.dy=(Math.random()-.5)*.5;f.tt=2+Math.random()*4;}
    if(f.flee>0)sp=2.2;}
  let d=((f.th-f.rot+Math.PI)%6.283+6.283)%6.283-Math.PI;const tr=(f.flee>0?5:2.5)*dt;f.rot+=Math.max(-tr,Math.min(tr,d));
  if(sp>0){const v=sp*dt,sn=Math.sin(f.rot),co=Math.cos(f.rot),nx=f.x+sn*v,nz=f.z+co*v,ny=f.y+f.dy*v;
    const lx=f.x+sn*.3,lz=f.z+co*.3;   // olha um pouco à frente para não bater na parede
    if(get(Math.floor(lx),Math.floor(ny),Math.floor(lz))!==8){f.th=f.rot+Math.PI*(.6+Math.random()*.8);f.tt=2;f.dy=0;}
    else{f.x=nx;f.z=nz;if(get(Math.floor(nx),Math.floor(ny),Math.floor(nz))===8&&(ny-Math.floor(ny)<.7||get(Math.floor(nx),Math.floor(ny)+1,Math.floor(nz))===8)&&ny>1)f.y=ny;else f.dy=0;}}
  const u=f.g.userData,moving=sp>0?1:.35,ph=f.t*(8+sp*4)+f.off;
  if(u.segs)u.segs.forEach((sg,i)=>{sg.rotation.y=Math.sin(f.t*(4+sp*3)+f.off-i*.9)*.3*moving;});   // moreia ondula
  else{if(u.tg)u.tg.rotation.y=Math.sin(ph)*.5*moving;
    if(u.wings)u.wings.forEach(w=>{w.rotation.z=w.userData.s*Math.sin(f.t*3+f.off)*.35*(sp>0?1:.5);});   // arraia bate as asas
    if(u.fins)u.fins.forEach(w=>{w.rotation.z=w.userData.s*(.3+.3*Math.sin(ph*1.5));});}
  f.g.position.set(f.x,f.y+(sp===0&&f.arrived?Math.sin(f.t*30)*.02:0),f.z);f.g.rotation.set(-Math.max(-.6,Math.min(.6,f.dy*.6)),f.rot,0);
  return true;}
function updateFishes(dt,now){
  if(!fishInit)initFish();
  for(let i=fishes.length-1;i>=0;i--)if(!updFish(fishes[i],dt,now))killFish(fishes[i]);
  fishRespT+=dt;if(fishRespT>15){fishRespT=0;if(fishes.length<FISH_N)spawnSchool();}}
