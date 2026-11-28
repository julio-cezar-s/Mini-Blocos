/* MiniBlocos · Nômades inteligentes: cada nômade tem um OFÍCIO e uma rotina.
   🪓 lenhador (derruba árvores) · ⛏️ minerador (pedra e minérios) · 🎣 pescador · 🧺 coletor (maçãs e abóboras) · 🔨 artesão (fabrica na bancada e assa peixe na fogueira)
   Rotina: de dia trabalham e levam o que juntaram para o BAÚ DA ALDEIA (na praça, ao lado da bancada); no fim da tarde se reúnem na fogueira;
   à noite dormem em casa. Fogem dos predadores para a fogueira. Desviam de obstáculos (paredes, água, buracos), pulam degraus de 1 bloco e desistem de alvos inalcançáveis.
   Eles dão ao jogador comida pronta (peixe assado, maçã) e o baú pode ser aberto por você (madeira, tábuas, cercas, pedra, minérios...).
   Carregue DEPOIS de js/entities/nomads.js (e depois do sound.js/leash.js, se usar) e ANTES de js/main.js. No multijogador eles não mexem nos blocos. */
(function(){
if(typeof VILLAGE==='undefined'||!VILLAGE||!SPEC.nomad)return;

// ---------- ajustes ----------
const WALK=1.8,RUN=3.2;      // multiplicadores da velocidade (1 = o andar lento original)
const VR=21;                  // raio protegido da aldeia (blocos): ninguém corta nem minera aqui
const SEARCH=36;              // até que distância da praça procuram trabalho
const CAP={lenhador:8,minerador:6,pescador:3,coletor:4,artesao:0};   // quanto carregam antes de levar ao baú
const CRAFTS=['Tábua','Cerca','Pedra lapidada','Fogueira'];            // receitas (nomes de RECIPES) que o artesão sabe fazer
const QUOTA={tree:3,rock:24};   // por nômade e por dia: evita desmatar a região e esburacar as montanhas
const JOBS=['lenhador','minerador','pescador','coletor','artesao'];
const ICON={lenhador:'🪓',minerador:'⛏️',pescador:'🎣',coletor:'🧺',artesao:'🔨'};
const rnd=Math.random,CX=VILLAGE.cx,CZ=VILLAGE.cz,Y0=VILLAGE.y0,TAU2=Math.PI*2;
const online=()=>noSave||(typeof netOn!=='undefined'&&netOn);
const hour=()=>typeof dayT==='number'?(dayT*24)%24:12;
const tnow=()=>performance.now()/1000;
const phase=()=>{const h=hour();return(h>=6.2&&h<17.5)?'work':(h>=17.5&&h<21)?'social':'sleep';};

// ---------- baú, bancada e estoque da aldeia ----------
const cxi=Math.floor(CX),czi=Math.floor(CZ),cy=Y0+1;
const CHEST={x:cxi+3,y:cy,z:czi},BENCH={x:cxi-3,y:cy,z:czi};
const ckey=()=>CHEST.x+','+CHEST.y+','+CHEST.z;
const chestOK=()=>get(CHEST.x,CHEST.y,CHEST.z)===18;
const store=()=>chests[ckey()]||(chests[ckey()]={});
const FOOD={fish:0,cooked:0,apples:0};
(function(){const VK='miniblocos_bau_aldeia_'+SEED;let done=false;
  if(!noSave){try{done=!!localStorage.getItem(VK);}catch(e){}}
  if(!done){
    if(!B[idx(CHEST.x,CHEST.y,CHEST.z)]&&solid(CHEST.x,CHEST.y-1,CHEST.z)){B[idx(CHEST.x,CHEST.y,CHEST.z)]=18;chests[ckey()]={};}
    if(!B[idx(BENCH.x,BENCH.y,BENCH.z)]&&solid(BENCH.x,BENCH.y-1,BENCH.z))B[idx(BENCH.x,BENCH.y,BENCH.z)]=22;
    if(!noSave){try{localStorage.setItem(VK,'1');}catch(e){}}}})();

// ---------- casas (para dormir) ----------
const HOMES=VILLAGE.doors.map(d=>{const vx=CX-d.x,vz=CZ-d.z,f=Math.abs(vx)>Math.abs(vz)?[Math.sign(vx),0]:[0,Math.sign(vz)];
  return{path:[{x:d.x,z:d.z},{x:d.x-f[0]*2,z:d.z-f[1]*2},{x:d.x-f[0]*5,z:d.z-f[1]*5}],n:0};});

// ---------- utilidades do mundo ----------
const MANID=new Uint8Array(256);[6,14,15,16,17,18,19,20,21,22,23,36,37,39,41,42,43,44,45,60,61].forEach(i=>MANID[i]=1);
for(let i=24;i<=33;i++)MANID[i]=1;for(let i=51;i<=67;i++)MANID[i]=1;
const inb=(x,z)=>x>=2&&z>=2&&x<W-2&&z<D-2;
const dVil=(x,z)=>Math.hypot(x-CX,z-CZ);
const topY=(x,z)=>{let y=H-1;while(y>0&&!B[idx(x,y,z)])y--;return y;};
function nearMan(x,y,z,r){for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)for(let dy=-1;dy<=3;dy++)if(MANID[get(x+dx,y+dy,z+dz)])return true;return false;}
function nextToWater(x,y,z){for(const[dx,dy,dz]of[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]])if(get(x+dx,y+dy,z+dz)===8)return true;return false;}
const floorOK=(x,y,z)=>{const t=get(x,y-1,z);return t>0&&t!==8&&solid(x,y-1,z);};
const standOK=(x,y,z)=>get(x,y,z)===0&&get(x,y+1,z)===0&&get(x,y+2,z)===0&&floorOK(x,y,z);
function commit(cells){const cols=new Set();cells.forEach(c=>cols.add(c[0]+','+c[2]));
  cols.forEach(k=>{const[x,z]=k.split(',').map(Number);hm[x*D+z]=topY(x,z);});
  try{rebuildCells(cells);}catch(e){}}
function sfx(a,mat,kind,v){if(typeof SND==='undefined')return;const d=Math.hypot(a.x-P.x,a.z-P.z);if(d>16)return;
  const pan=d>.5?((a.x-P.x)*Math.cos(P.yaw)-(a.z-P.z)*Math.sin(P.yaw))/d:0;SND.blockSnd(mat,kind,pan,(v||1)*Math.pow(1-d/16,1.5));}

// ---------- desvio de obstáculos ----------
function canStep(px,y,pz,r,hh){
  if(wet(px,pz))return false;
  let yy=y;if(hitB(px,yy,pz,r,hh)){if(hitB(px,yy+1.05,pz,r,hh))return false;yy+=1.05;}   // degrau de 1 bloco: o base pula
  for(let d=0;d<=2;d++)if(solid(Math.floor(px),Math.floor(yy-.15-d),Math.floor(pz)))return true;   // chão a no máximo 2 blocos abaixo
  return false;}
const OFFS=[0,.4,.8,1.3,1.9,2.6];
function steer(a,h0){
  const ai=a.ai,r=SPEC.nomad.r/S,hh=SPEC.nomad.hh/S,side=ai.side||1;
  const ok=(ang,d)=>canStep(a.x+Math.sin(ang)*d,a.y,a.z+Math.cos(ang)*d,r,hh);
  for(const off of OFFS)for(const sg of(off===0?[1]:[side,-side])){const ang=h0+off*sg;if(ok(ang,.9)&&ok(ang,1.8)){if(off>0)ai.side=sg;return ang;}}
  return null;}
// anda até (gx,gz); devolve 'arrived' | 'moving' | 'stuck'
function walk(a,gx,gz,tol,sp){
  const ai=a.ai,dt=ai.dt,dx=gx-a.x,dz=gz-a.z,d=Math.hypot(dx,dz);ai.sp=sp||WALK;
  if(d<tol){a.mv=false;ai.sk=0;ai.pd=1e9;return'arrived';}
  ai.pt=(ai.pt||0)+dt;
  if(ai.pt>=1.5){ai.pt=0;if(d>(ai.pd||1e9)-.4){ai.sk=(ai.sk||0)+1;if(ai.sk===1||ai.sk===2){ai.det=1.2;ai.detA=(rnd()<.5?1:-1)*(1.3+rnd()*.7);}}else ai.sk=0;ai.pd=d;}
  if(ai.sk>=3){ai.sk=0;ai.pd=1e9;return'stuck';}
  const h0=Math.atan2(dx,dz)+(ai.det>0?ai.detA:0);if(ai.det>0)ai.det-=dt;
  ai.stT=(ai.stT||0)-dt;if(ai.stT<=0){ai.stT=.12;ai.h=steer(a,h0);}
  if(ai.h===null||ai.h===undefined){ai.bl=(ai.bl||0)+dt;a.mv=false;if(ai.bl>1.2){ai.bl=0;return'stuck';}a.th=h0;return'moving';}
  ai.bl=0;a.th=ai.h;a.mv=true;a.gz=false;a.tt=1;return'moving';}
function follow(a,path,tol){const ai=a.ai;if(ai.pi===undefined)ai.pi=0;
  const p=path[Math.min(ai.pi,path.length-1)],r=walk(a,p.x,p.z,ai.pi>=path.length-1?tol:1.1,WALK);
  if(r==='arrived'&&ai.pi<path.length-1){ai.pi++;return'moving';}if(r==='arrived'&&ai.pi>=path.length-1)return'arrived';return r;}

// ---------- reservas de alvos ----------
const claims=new Map(),bad=new Map();
const isBad=k=>(bad.get(k)||0)>tnow();
const markBad=(k,s)=>bad.set(k,tnow()+(s||90));
function release(a){const t=a.ai&&a.ai.tg;if(t&&claims.get(t.key)===a)claims.delete(t.key);if(a.ai)a.ai.tg=null;}
const free=(k,a)=>(!claims.has(k)||claims.get(k)===a)&&!isBad(k);
const fruitCd=new Map();

// ---------- procura de alvos ----------
function scanArea(fn){const R=SEARCH,x0=Math.max(2,Math.floor(CX-R)),x1=Math.min(W-3,Math.floor(CX+R)),z0=Math.max(2,Math.floor(CZ-R)),z1=Math.min(D-3,Math.floor(CZ+R));
  for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){const dv=dVil(x+.5,z+.5);if(dv<VR||dv>R)continue;fn(x,z);}}
function treeAt(x,z){let y=topY(x,z);while(y>0&&B[idx(x,y,z)]===5)y--;if(B[idx(x,y,z)]!==4)return null;
  let by=y;while(by>1&&B[idx(x,by-1,z)]===4)by--;const g=B[idx(x,by-1,z)];if(g!==1&&g!==2)return null;   // árvore natural: tronco em grama/terra
  let lv=0;for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)for(let dy=0;dy<=3;dy++)if(get(x+dx,y+dy,z+dz)===5)lv++;
  if(lv<4||nearMan(x,by,z,3))return null;return{by,top:y};}
function standNear(bx,by,bz,a,reach){reach=reach||1;let best=null,bd=1e9;   // reach 1: só os 4 lados; reach 2: também diagonais e 2 blocos de distância (copa baixa de árvore)
  for(let dx=-reach;dx<=reach;dx++)for(let dz=-reach;dz<=reach;dz++){if(!dx&&!dz)continue;if(reach===1&&dx&&dz)continue;
    const sx=bx+dx,sz=bz+dz;if(!standOK(sx,by,sz))continue;const d=(sx+.5-a.x)**2+(sz+.5-a.z)**2+6*(dx*dx+dz*dz);if(d<bd){bd=d;best={x:sx+.5,z:sz+.5,y:by};}}
  return best;}
function findTree(a,fruit){let best=null,bd=1e9;
  scanArea((x,z)=>{const key=(fruit?'a':'t')+x+','+z;if(!free(key,a))return;if(fruit&&(fruitCd.get(key)||0)>tnow())return;
    const d=(x-a.x)**2+(z-a.z)**2;if(d>=bd)return;const t=treeAt(x,z);if(!t)return;const st=standNear(x,t.by,z,a,2);if(!st)return;
    bd=d;best={kind:fruit?'fruit':'tree',key,bx:x,bz:z,by:t.by,top:t.top,x:x+.5,z:z+.5,stand:st};});
  return best;}
function findRock(a){let best=null,bd=1e9;
  scanArea((x,z)=>{const t=topY(x,z);for(let y=t;y>=Math.max(2,t-8);y--){const id=B[idx(x,y,z)];const ore=id===10||id===11||id===12||id===46;if(!ore&&!(id===3&&y>=t-3))continue;
    if(y<WL+2)continue;const key='r'+x+','+y+','+z;if(!free(key,a))continue;
    const d=((x-a.x)**2+(z-a.z)**2+(y-a.y)**2)*(ore?.3:1);if(d>=bd)continue;
    if(nextToWater(x,y,z)||nearMan(x,y,z,2))continue;
    const st=standNear(x,y,z,a);if(!st)continue;bd=d;best={kind:'rock',key,bx:x,by:y,bz:z,id,x:x+.5,z:z+.5,stand:st};}});
  return best;}
function findShore(a){let best=null,bd=1e9;
  scanArea((x,z)=>{const ws=topY(x,z);if(B[idx(x,ws,z)]!==8||B[idx(x,ws-1,z)]!==8)return;
    for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const sx=x+dx,sz=z+dz;if(!inb(sx,sz))continue;const g=topY(sx,sz);if(B[idx(sx,g,sz)]===8||g<ws-1||g>ws+1)continue;
      const key='f'+sx+','+sz;if(!free(key,a))continue;if(!standOK(sx,g+1,sz))continue;const d=(sx+.5-a.x)**2+(sz+.5-a.z)**2;if(d>=bd)continue;
      bd=d;best={kind:'fish',key,x:x+.5,z:z+.5,stand:{x:sx+.5,z:sz+.5,y:g+1}};}});
  return best;}
function findPumpkin(a){let best=null,bd=1e9;
  scanArea((x,z)=>{const t=topY(x,z);if(B[idx(x,t,z)]!==40)return;const key='p'+x+','+t+','+z;if(!free(key,a)||nearMan(x,t,z,2))return;
    const d=(x-a.x)**2+(z-a.z)**2;if(d>=bd)return;const st=standNear(x,t,z,a);if(!st)return;bd=d;best={kind:'pumpkin',key,bx:x,by:t,bz:z,x:x+.5,z:z+.5,stand:st};});
  return best;}

// ---------- trabalhos: duração e efeito ----------
const DUR={tree:3.4,rock:2.4,fish:9,fruit:2.6,pumpkin:1.6};
const gain=(a,id,n)=>{const c=a.ai.carry;c[id]=(c[id]||0)+n;};
const carried=a=>{let n=0;for(const k in a.ai.carry)n+=a.ai.carry[k];return n;};
const matOf=id=>typeof SND!=='undefined'?SND.mat(id):'stone';
function finish(a,tg){
  const ai=a.ai;if(tg.kind==='tree'||tg.kind==='rock')ai.q++;
  if(tg.kind==='tree'){const cells=[];let wood=0;
    for(let y=tg.by;y<H&&B[idx(tg.bx,y,tg.bz)]===4;y++){B[idx(tg.bx,y,tg.bz)]=0;cells.push([tg.bx,y,tg.bz]);wood++;}
    let lv=0;const top=tg.by+wood-1;
    for(let dx=-3;dx<=3;dx++)for(let dz=-3;dz<=3;dz++)for(let dy=-3;dy<=3;dy++){const x=tg.bx+dx,y=top+dy,z=tg.bz+dz;if(inb(x,z)&&get(x,y,z)===5){B[idx(x,y,z)]=0;cells.push([x,y,z]);lv++;}}
    commit(cells);gain(a,4,wood);if(lv>=10)gain(a,'ap',Math.floor(lv/25));sfx(a,'wood','break');markBad(tg.key,600);}
  else if(tg.kind==='rock'){if(B[idx(tg.bx,tg.by,tg.bz)]===tg.id){B[idx(tg.bx,tg.by,tg.bz)]=0;commit([[tg.bx,tg.by,tg.bz]]);gain(a,tg.id,1);sfx(a,matOf(tg.id),'break');}}
  else if(tg.kind==='fish'){if(rnd()<.62){gain(a,'f',1);}}
  else if(tg.kind==='fruit'){gain(a,'ap',1+(rnd()<.4?1:0));fruitCd.set(tg.key,tnow()+240);}
  else if(tg.kind==='pumpkin'){if(B[idx(tg.bx,tg.by,tg.bz)]===40){B[idx(tg.bx,tg.by,tg.bz)]=0;commit([[tg.bx,tg.by,tg.bz]]);gain(a,40,1);}}
}
const valid=tg=>tg.kind==='tree'?B[idx(tg.bx,tg.by,tg.bz)]===4:tg.kind==='rock'?B[idx(tg.bx,tg.by,tg.bz)]===tg.id:tg.kind==='pumpkin'?B[idx(tg.bx,tg.by,tg.bz)]===40:true;
function tick(a,tg){   // som e pancadas durante o trabalho
  const ai=a.ai;ai.hit=(ai.hit||0)-ai.dt;if(ai.hit>0)return;
  if(tg.kind==='tree'){ai.hit=.6;sfx(a,'wood','dig');}else if(tg.kind==='rock'){ai.hit=.55;sfx(a,matOf(tg.id),'dig');}
  else if(tg.kind==='pumpkin'||tg.kind==='fruit'){ai.hit=.7;sfx(a,'leaf','dig',.6);}
  else if(tg.kind==='fish'&&rnd()<.15){ai.hit=1.2;if(typeof SND!=='undefined')sfx(a,'water','step',1.6);}}

// ---------- depósito ----------
function deposit(a){const c=a.ai.carry,st=store();
  if(chestOK()){for(const k in c){if(k==='f')FOOD.fish+=c[k];else if(k==='ap')FOOD.apples+=c[k];else st[k]=(st[k]||0)+c[k];}a.ai.carry={};sfx(a,'wood','place');}}

// ---------- IA ----------
function newAI(a){const cnt={};animals.forEach(n=>{if(n.k==='nomad'&&n.ai)cnt[n.ai.job]=(cnt[n.ai.job]||0)+1;});
  let job=JOBS[0],mn=1e9;JOBS.forEach(j=>{if((cnt[j]||0)<mn){mn=cnt[j]||0;job=j;}});
  let hm_=HOMES[0],hn=1e9;HOMES.forEach(h=>{if(h.n<hn){hn=h.n;hm_=h;}});hm_.n++;
  const ai={job,home:hm_,q:0,st:'idle',t:0,dt:.016,carry:{},tg:null,wt:0,cool:rnd()*2,seat:null,sp:WALK,side:rnd()<.5?1:-1,safeT:0};
  a.ai=ai;addLabel(a);addTool(a);return ai;}
const lblTex={};
function lbl(job){if(!lblTex[job]){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.font='44px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(ICON[job],32,36);lblTex[job]=new THREE.CanvasTexture(c);}return lblTex[job];}
function addLabel(a){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:lbl(a.ai.job),transparent:true,depthTest:false}));sp.scale.set(.55,.55,1);sp.position.set(0,a.g.userData.hy+.95,0);sp.renderOrder=10;sp.visible=false;a.g.add(sp);a.ai.lb=sp;}
function addTool(a){const arm=a.g.userData.legs[3];if(!arm)return;const g=new THREE.Group(),w='#7a5a32',m='#9aa0a6';
  switch(a.ai.job){
    case'lenhador':g.add(bx(.05,.45,.05,w,0,-.8,.04));g.add(bx(.05,.16,.22,m,0,-1.02,.13));break;
    case'minerador':g.add(bx(.05,.45,.05,w,0,-.8,.04));g.add(bx(.05,.08,.42,m,0,-1.02,.04));break;
    case'pescador':g.add(bx(.03,.03,.85,w,0,-.6,.45));break;
    case'coletor':g.add(bx(.24,.14,.24,'#b88a4a',0,-.66,.14));g.add(bx(.2,.04,.2,'#c0392b',0,-.6,.14));break;
    default:g.add(bx(.05,.4,.05,w,0,-.78,.04));g.add(bx(.2,.1,.12,m,0,-.98,.04));}
  arm.add(g);a.ai.arm=arm;}
function pose(a,dt){const ai=a.ai;if(!ai)return;
  if(ai.lb){const d=Math.hypot(a.x-P.x,a.z-P.z);ai.lb.visible=d<14;}
  if(!ai.arm)return;const t=performance.now()/1000;
  if(ai.st==='work'){const j=ai.job;
    if(j==='pescador')ai.arm.rotation.x=-1.0+Math.sin(t*1.5)*.06;
    else if(j==='coletor')ai.arm.rotation.x=-.7+Math.sin(t*5)*.35;
    else ai.arm.rotation.x=-.5-(.5+.5*Math.sin(t*9))*1.2;}}

function danger(a){for(const b of animals){const s=SPEC[b.k];if(!s||!s.pred)continue;if(Math.abs(b.y-a.y)<8&&Math.hypot(b.x-a.x,b.z-a.z)<13)return true;}return false;}
function setIdle(a){const ai=a.ai;release(a);ai.st='idle';ai.cool=1+rnd()*2;ai.pi=undefined;ai.pd=1e9;ai.sk=0;ai.wt=0;}
function wander(a,R0,R1){const ang=rnd()*TAU2,r=R0+rnd()*(R1-R0);return{x:CX+Math.sin(ang)*r,z:CZ+Math.cos(ang)*r};}

function think(a,dt){
  if(a.flee>.02){if(a.ai){a.ai.st='idle';release(a);}return 1;}   // levou pancada: foge como antes
  const ai=a.ai||newAI(a);ai.dt=dt;ai.t+=dt;ai.sp=WALK;
  const ph=phase(),live=typeof playing!=='undefined'&&playing&&hp>0,pd=Math.hypot(P.x-a.x,P.z-a.z);

  // presente para o jogador
  ai.gift=Math.max(0,(ai.gift||0)-dt);
  if(live&&pd<3.2&&ai.gift<=0&&(FOOD.cooked>0||FOOD.apples>0)&&ai.gw===undefined)ai.gw=1.6;
  if(ai.gw!==undefined){ai.gw-=dt;a.mv=false;a.th=Math.atan2(P.x-a.x,P.z-a.z);
    if(ai.gw<=0){ai.gw=undefined;ai.gift=150+rnd()*60;
      if(FOOD.cooked>0&&(rnd()<.6||FOOD.apples<=0)){const n=Math.min(FOOD.cooked,1+Math.floor(rnd()*2));FOOD.cooked-=n;cooked+=n;toast('🍖 '+a.nm+' te deu '+n+(n>1?' peixes assados!':' peixe assado!'));}
      else if(FOOD.apples>0){const n=Math.min(FOOD.apples,1+Math.floor(rnd()*2));FOOD.apples-=n;apples+=n;toast('🍎 '+a.nm+' te deu '+n+(n>1?' maçãs!':' maçã!'));}}
    return 1;}

  // perigo: corre para a fogueira da praça
  if(ai.st!=='panic'&&danger(a)&&dVil(a.x,a.z)>5){release(a);ai.st='panic';ai.safeT=0;ai.pi=undefined;}
  if(ai.st==='panic'){ai.safeT=danger(a)?0:ai.safeT+dt;
    const r=walk(a,CX+Math.sin(a.ai.t)*2.5,CZ+2.5,2.2,RUN);if(ai.safeT>5||(r==='arrived'&&!danger(a)))setIdle(a);return RUN;}

  // noite: dorme em casa
  if(ph==='sleep'){
    if(ai.st!=='home'){release(a);ai.st='home';ai.pi=0;ai.pd=1e9;ai.sk=0;}
    const r=follow(a,ai.home.path,.8);if(r==='arrived'){a.mv=false;a.gz=false;}else if(r==='stuck'){ai.pi=0;}
    return ai.sp;}
  if(ai.st==='home'){release(a);ai.st='exit';ai.q=0;ai.pi=0;ai.pd=1e9;ai.sk=0;ai.ex=ai.home.path.slice().reverse();}   // amanheceu: sai pela porta e ganha nova cota do dia

  // fim da tarde: leva o que carrega ao baú e se reúne na fogueira
  if(ph==='social'){
    if(carried(a)>0&&chestOK()&&ai.st!=='deposit'){release(a);ai.st='deposit';ai.pi=undefined;ai.wt=0;}
    if(ai.st!=='deposit'){
      if(ai.st!=='social'){release(a);ai.st='social';const ang=rnd()*TAU2,r=2.8+rnd()*1.6;ai.seat={x:CX+Math.sin(ang)*r,z:CZ+Math.cos(ang)*r};ai.pd=1e9;ai.sk=0;}
      const r=walk(a,ai.seat.x,ai.seat.z,.9,WALK);if(r==='arrived'){a.mv=false;a.gz=false;a.th=Math.atan2(CX-a.x,CZ-a.z);}else if(r==='stuck'){ai.seat=wander(a,3,5);}
      return ai.sp;}}

  // dia: trabalho
  const canEdit=!online();
  switch(ai.st){
    case'idle':{
      ai.cool-=dt;a.mv=false;
      if(pd<5&&live){a.th=Math.atan2(P.x-a.x,P.z-a.z);}
      if(ai.cool>0)break;
      if(carried(a)>=CAP[ai.job]&&CAP[ai.job]>0||(carried(a)>0&&ai.job!=='artesao'&&ai.nojob>2)){if(chestOK()){ai.st='deposit';ai.pi=undefined;ai.wt=0;ai.nojob=0;break;}}
      let tg=null;
      if(ai.job==='lenhador'&&canEdit&&ai.q<QUOTA.tree)tg=findTree(a,false);
      else if(ai.job==='minerador'&&canEdit&&ai.q<QUOTA.rock)tg=findRock(a);
      else if(ai.job==='pescador')tg=findShore(a);
      else if(ai.job==='coletor')tg=(canEdit&&findPumpkin(a))||findTree(a,true);
      else if(ai.job==='artesao'){const rc=chestOK()?pickCraft():null;
        if(rc){ai.tg={kind:'craft',key:'craft',rc,x:BENCH.x+.5,z:BENCH.z+.5,stand:{x:BENCH.x+.5+1.3,z:BENCH.z+.5,y:cy}};ai.st='goto';ai.pd=1e9;ai.sk=0;break;}
        if(FOOD.fish>0){ai.tg={kind:'cook',key:'cook',x:CX,z:CZ,stand:{x:CX,z:CZ+1.6,y:cy}};ai.st='goto';ai.pd=1e9;ai.sk=0;break;}}
      if(tg){claims.set(tg.key,a);ai.tg=tg;ai.st='goto';ai.pd=1e9;ai.sk=0;ai.nojob=0;break;}
      ai.nojob=(ai.nojob||0)+1;ai.st='wander';ai.wp=wander(a,4,ai.job==='artesao'?6:12);ai.pd=1e9;ai.sk=0;break;}
    case'exit':{const r=follow(a,ai.ex,1.2);if(r==='arrived'||r==='stuck')setIdle(a);break;}
    case'wander':{const r=walk(a,ai.wp.x,ai.wp.z,1.2,1);if(r!=='moving')setIdle(a);break;}
    case'goto':{const tg=ai.tg;if(!tg||!valid(tg)){setIdle(a);break;}
      const r=walk(a,tg.stand.x,tg.stand.z,.7,WALK);
      if(r==='arrived'||(r==='moving'&&Math.hypot(a.x-tg.stand.x,a.z-tg.stand.z)<.9&&Math.abs(a.y-(tg.stand.y+.01))<1.6)){ai.st='work';ai.wt=0;a.mv=false;}
      else if(r==='stuck'){markBad(tg.key,120);setIdle(a);}
      if(Math.abs(a.y-tg.stand.y)>6){markBad(tg.key,120);setIdle(a);}
      break;}
    case'work':{const tg=ai.tg;if(!tg||!valid(tg)){setIdle(a);break;}
      a.mv=false;a.gz=false;a.th=Math.atan2(tg.x-a.x,tg.z-a.z);ai.wt+=dt;
      if(tg.kind==='craft'){if(ai.wt%.7<dt)sfx(a,'wood','dig');if(ai.wt>=5){const rc=tg.rc,st=store();
          if(chestOK()&&Object.keys(rc.inp).every(k=>(st[k]||0)>=rc.inp[k]*1)){for(const k in rc.inp)st[k]-=rc.inp[k];st[rc.out[0]]=(st[rc.out[0]]||0)+rc.out[1];sfx(a,'wood','place');}setIdle(a);}break;}
      if(tg.kind==='cook'){if(ai.wt%.9<dt)sfx(a,'leaf','dig',.5);if(ai.wt>=4){if(FOOD.fish>0){FOOD.fish--;FOOD.cooked++;}setIdle(a);}break;}
      tick(a,tg);
      if(ai.wt>=DUR[tg.kind]*(tg.kind==='fish'?(.7+rnd()*.6):1)){finish(a,tg);const k=tg.key;release(a);
        if(tg.kind==='fish'&&carried(a)<CAP.pescador&&phase()==='work'){ai.tg=tg;claims.set(k,a);ai.wt=0;}   // continua pescando no mesmo lugar
        else setIdle(a);}
      break;}
    case'deposit':{const r=walk(a,CHEST.x+.5-1.3,CHEST.z+.5,.8,WALK);
      if(r==='arrived'){a.mv=false;a.th=Math.atan2(CHEST.x+.5-a.x,CHEST.z+.5-a.z);ai.wt+=dt;if(ai.wt>1.3){deposit(a);setIdle(a);}}
      else if(r==='stuck'){setIdle(a);}
      break;}
    default:setIdle(a);}
  return ai.sp;
}
function pickCraft(){const st=store();
  for(const n of CRAFTS){const r=RECIPES.find(q=>q.n===n);if(!r)continue;if((st[r.out[0]]||0)>=40)continue;
    if(Object.keys(r.inp).every(k=>(st[k]||0)>=r.inp[k]*2))return r;}   // só fabrica se sobrar o dobro: guarda matéria-prima
  return null;}

// ---------- liga na atualização dos animais ----------
const _updA=updA;
updA=function(a,dt){
  if(a.k!=='nomad'||a.rider){_updA(a,dt);return;}
  let mult=1;
  try{mult=think(a,dt)||1;}catch(e){console.error('[nomad-ai]',e);if(a.ai){release(a);a.ai.st='idle';}mult=1;}
  a.tt=Math.max(a.tt||0,.5);            // impede o passeio aleatório dos animais: quem decide é a IA
  if(!(a.flee>0))a.flee=1e-4;          // pula a lógica antiga de "cumprimentar / voltar para a aldeia"
  const s=SPEC.nomad,o=s.v;s.v=o*mult;
  try{_updA(a,dt);}finally{s.v=o;}
  try{pose(a,dt);}catch(e){}
};
window.NOMAD_AI={FOOD,CHEST,BENCH,claims};
})();
