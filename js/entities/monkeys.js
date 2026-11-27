/* MiniBlocos · Macacos: bandos de 3 a 4 macacos que vivem perto de árvores. Pacíficos e ariscos: pulam bastante e fogem de você.
   Podem ser caçados (soltam carne). Reaproveita o sistema de animais (animals.js). Carregue DEPOIS de js/entities/animals.js. */
(function(){
SPEC.monkey={b:[.3,.34,.4,'#4a3322'],l:[.07,.3,'#3a281a'],h:[.24,'#4a3322'],x:[],v:1.3,r:.2,hh:.6,sk:8};   // sk: foge quando você chega perto
AHP.monkey=6;DROP.monkey=2;
const TROOPS=Math.round(2*AA),SIZE=3;   // quantos bandos existem (cerca de 3 macacos cada)

// ---------- modelo ----------
function mkMonkey(){
  const rv=Math.random,s=SPEC.monkey,g=new THREE.Group(),bg=new THREE.Group(),hg=new THREE.Group(),tg=new THREE.Group(),[bw,bh,bd]=s.b,lw=s.l[0],L=s.l[1];
  const P0=[['#4a3322','#3a281a','#e8d8b8'],['#8a5a30','#6a4424','#f0dcb8'],['#2e2a28','#1e1a18','#c8b89a']][Math.floor(rv()*3)],C=P0[0],D=P0[1],F=P0[2];   // pelo, pelo escuro, rosto
  g.userData.legs=[];g.add(bg);
  bg.add(bx(bw,bh,bd,C,0,L+bh/2,0));bg.add(bx(bw*.8,bh*.6,.05,F,0,L+bh*.45,bd/2));bg.add(bx(bw*1.05,.2,.18,D,0,L+bh*.9,bd/2-.12));   // corpo, peito claro e ombros
  for(const sx of[-1,1])for(const sz of[-1,1]){   // quatro patas; as da frente (braços) são mais compridas
    const lg=new THREE.Group(),ln=sz>0?L+.08:L;lg.position.set(sx*(bw/2-lw/2),L+(sz>0?.08:0),sz*(bd/2-lw/2));
    lg.add(bx(lw,ln,lw,D,0,-ln/2,0));lg.add(bx(lw*1.2,.05,lw*1.4,F,0,-ln+.025,.02));lg.userData.ph=(sx*sz>0)?0:Math.PI;g.add(lg);g.userData.legs.push(lg);}
  const hy=L+bh*.85,bz=bd/2;hg.position.set(0,hy,bz);tg.position.set(0,L+bh*.8,-bd/2);
  hg.add(bx(.24,.22,.22,C,0,0,.1));hg.add(bx(.17,.15,.04,F,0,-.01,.215));hg.add(bx(.1,.07,.05,'#d8b890',0,-.06,.25));hg.add(bx(.2,.03,.03,D,0,.07,.225));   // cabeça, rosto claro, focinho, sobrancelha
  for(const sx of[-1,1]){hg.add(bx(.045,.045,.02,'#111111',sx*.05,.03,.24));hg.add(bx(.06,.08,.03,F,sx*.14,0,.08));}   // olhos e orelhas
  hg.add(bx(.03,.02,.02,'#2a1a14',0,-.07,.28));
  tg.add(bx(.045,.045,.2,D,0,0,-.1));tg.add(bx(.045,.22,.045,D,0,.11,-.2));tg.add(bx(.045,.045,.1,D,0,.22,-.15));   // rabo comprido enrolado para cima
  bg.add(hg);bg.add(tg);
  const sh=new THREE.Mesh(new THREE.CircleGeometry(1,14),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.28,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  sh.rotation.x=-Math.PI/2;sh.scale.set(bw*.9+.1,bd*.7,1);sh.position.y=.02;g.add(sh);
  Object.assign(g.userData,{bg,hg,sh,tg,wings:[],hy,bz});
  g.scale.setScalar((1/S)*(.92+rv()*.16));return g;}
const _mk=mk;mk=function(k){return k==='monkey'?mkMonkey():_mk(k);};

// ---------- onde nascem: bandos perto de árvores ----------
const gy=(x,z)=>{for(let y=H-1;y>0;y--){const t=B[idx(x,y,z)];if(t&&t!==4&&t!==5&&t!==13&&t!==40)return y;}return 0;};   // chão, ignorando árvores
function nearTree(x,z,g){for(let dx=-4;dx<=4;dx++)for(let dz=-4;dz<=4;dz++)for(let y=g+1;y<=g+5;y++)if(get(x+dx,y,z+dz)===4)return true;return false;}
function put(x,z){const g=gy(Math.floor(x),Math.floor(z)),m=mk('monkey');scene.add(m);
  animals.push({k:'monkey',g:m,x,y:g+1.01,z,vy:0,th:Math.random()*6.28,tt:Math.random()*3,mv:false,gr:true,bl:0});}
function spawnTroop(minD){
  for(let i=0;i<300;i++){
    const x=4+Math.floor(Math.random()*(W-8)),z=4+Math.floor(Math.random()*(D-8)),g=gy(x,z),t=B[idx(x,g,z)];
    if(g<=WL+1||t===8||t===3||t===9||Math.hypot(x-P.x,z-P.z)<minD)continue;   // só em terra firme (nada de água, pedra ou neve)
    if(i<250&&!nearTree(x,z,g))continue;                                       // nas primeiras tentativas exige uma árvore por perto
    for(let n=0;n<SIZE+(Math.random()<.5?1:0);n++){const mx=x+.5+(Math.random()-.5)*4,mz=z+.5+(Math.random()-.5)*4;
      if(gy(Math.floor(mx),Math.floor(mz))>g+1)continue;put(mx,mz);}
    return true;}
  return false;}
const count=()=>animals.filter(a=>a.k==='monkey').length;
for(let i=0;i<TROOPS;i++)spawnTroop(26);

// ---------- comportamento: bem saltitantes ----------
const _updA=updA;
updA=function(a,dt){
  if(a.k==='monkey'&&a.gr&&a.mv){a.jt=(a.jt||0)-dt;if(a.jt<=0){a.vy=7;a.jt=.8+Math.random()*2;}}   // dá pulinhos enquanto anda
  _updA(a,dt);};

// repõe bandos que sumirem (conferido de 40 em 40 segundos, longe do jogador)
let chkT=0;const _resp=respawnAnimals;
respawnAnimals=function(dt){_resp(dt);chkT+=dt;if(chkT<40)return;chkT=0;if(count()<TROOPS*SIZE)spawnTroop(34);};
})();
