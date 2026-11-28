/* MiniBlocos · Animais perigosos: lobo, urso, cobra, onça, javali e aranha (atacam o jogador, mas também podem ser mortos)
   Reaproveita o sistema de animais (animals.js): mesmo combate (espada/machado/arco), mesma morte e mesmos drops.
   Carregue DEPOIS de js/entities/animals.js. */
(function(){
// pred: ataca o jogador · det: distância (blocos) em que percebe o jogador · lose: distância em que desiste
// reach: alcance da mordida (blocos) · dm: dano em pontos de vida (jogador tem 20) · cd: segundos entre ataques
// coward: foge quando está quase morto · poison: envenena (dano ao longo do tempo)
// pounce: dá um salto de ataque ao chegar perto · knock: empurra o jogador para trás (blocos) ao acertar
SPEC.wolf ={b:[.36,.4,.85,'#8a8a8a'],l:[.09,.42,'#6e6e74'],h:[.26,'#8a8a8a'],x:[],v:1.7,r:.25,hh:.8,pred:1,det:16,lose:38,reach:1.9,dm:3,cd:.9,coward:1};
SPEC.bear ={b:[.8,.72,1.25,'#5a3c26'],l:[.26,.42,'#4a3020'],h:[.4,'#5a3c26'],x:[],v:1.2,r:.45,hh:1.3,pred:1,det:11,lose:30,reach:2.5,dm:5,cd:1.4};
SPEC.snake={b:[.09,.07,.7,'#4a6a2a'],l:[.01,.02,'#3a5420'],h:[.11,'#4a6a2a'],x:[],v:.8,r:.1,hh:.2,pred:1,det:4.5,lose:10,reach:1.4,dm:1,cd:1.2,poison:1};
SPEC.jaguar={b:[.4,.42,1,'#d8a040'],l:[.1,.4,'#c89030'],h:[.28,'#d8a040'],x:[],v:1.75,r:.28,hh:.8,pred:1,det:14,lose:34,reach:2,dm:4,cd:1,pounce:1};   // onça-pintada: rápida, salta em cima de você
SPEC.boar ={b:[.5,.5,.9,'#4a3a30'],l:[.1,.3,'#3a2c24'],h:[.3,'#4a3a30'],x:[],v:1.4,r:.3,hh:.7,pred:1,det:9,lose:24,reach:1.9,dm:3,cd:1.2,knock:3.5};   // javali: investe e joga você longe
SPEC.spider={b:[.34,.2,.4,'#2a2228'],l:[.03,.18,'#1c1618'],h:[.2,'#3a3038'],x:[],v:1.8,r:.2,hh:.3,pred:1,det:7,lose:16,reach:1.5,dm:2,cd:1.1,poison:1};   // aranha gigante: pequena, rápida e venenosa
AHP.wolf=8;AHP.bear=16;AHP.snake=2;AHP.jaguar=10;AHP.boar=10;AHP.spider=4;          // vida dos bichos (espada = 3 de dano, machado de ferro = 4, flecha = 4)
DROP.wolf=2;DROP.bear=5;DROP.snake=1;DROP.jaguar=3;DROP.boar=4;DROP.spider=1;        // carne que soltam ao morrer
const MSG={wolf:'🐺 O lobo te mordeu!',bear:'🐻 O urso te atacou!',snake:'🐍 A cobra te picou!',jaguar:'🐆 A onça te atacou!',boar:'🐗 O javali te acertou!',spider:'🕷️ A aranha te picou!'};
const TARGET={wolf:Math.round(4*AA),bear:Math.round(2*AA),snake:Math.round(3*AA),jaguar:Math.round(2*AA),boar:Math.round(3*AA),spider:Math.round(3*AA)};   // quantos existem no mundo

// ---------- modelos ----------
function legs(g,s,col,claw){const[bw,,bd]=s.b,L=s.l[1],lw=s.l[0];
  for(const sx of[-1,1])for(const sz of[-1,1]){const lg=new THREE.Group();lg.position.set(sx*(bw/2-lw/2),L,sz*(bd/2-lw/2));
    lg.add(bx(lw,L,lw,col,0,-L/2,0));lg.add(bx(lw*1.1,.05,lw*1.1,'#1c1c1c',0,-L+.025,0));
    if(claw)lg.add(bx(lw*.8,.04,.06,'#eeeeee',0,-L+.02,lw/2+.03));
    lg.userData.ph=(sx*sz>0)?0:Math.PI;g.add(lg);g.userData.legs.push(lg);}}
function mkPred(k){
  const s=SPEC[k],g=new THREE.Group(),bg=new THREE.Group(),hg=new THREE.Group(),tg=new THREE.Group(),[bw,bh,bd]=s.b,L=s.l[1],rv=Math.random;
  g.userData.legs=[];g.userData.segs=[];g.add(bg);
  const hy=L+bh*.85,bz=bd/2;hg.position.set(0,hy,bz);tg.position.set(0,hy,-bd/2);
  if(k==='wolf'){
    const P0=[['#8a8a8a','#6e6e74','#cfcfcf'],['#5e5e66','#45454c','#9a9aa0'],['#b8b8b8','#9a9a9a','#eeeeee'],['#7a6a58','#5e5042','#c8bba8']][Math.floor(rv()*4)],C=P0[0],D=P0[1],Lt=P0[2];
    bg.add(bx(bw,bh,bd,C,0,L+bh/2,0));bg.add(bx(bw*.9,.07,bd*.8,Lt,0,L+.035,0));bg.add(bx(bw*1.05,bh*.9,.3,D,0,L+bh*.55,bd/2-.12));   // barriga clara, peito peludo
    bg.add(bx(.22,.26,.24,C,0,L+bh*.78,bd/2-.04));                                                                                   // pescoço
    legs(g,s,D,false);
    hg.add(bx(.24,.22,.22,C,0,0,.1));hg.add(bx(.12,.1,.16,Lt,0,-.05,.27));hg.add(bx(.06,.05,.03,'#111111',0,-.02,.36));
    for(const sx of[-1,1]){hg.add(bx(.06,.11,.04,D,sx*.08,.15,.03));hg.add(bx(.045,.035,.02,'#e8c020',sx*.085,.04,.212));hg.add(bx(.015,.035,.015,'#ffffff',sx*.04,-.1,.33));}
    tg.add(bx(.09,.09,.32,D,0,-.06,-.15));
  }else if(k==='bear'){
    const C=rv()<.25?'#2a2422':'#5a3c26',D=C==='#2a2422'?'#1c1816':'#4a3020';
    bg.add(bx(bw,bh,bd,C,0,L+bh/2,0));bg.add(bx(.7,.3,.5,C,0,L+bh+.05,bd/2-.3));bg.add(bx(.5,.5,.4,C,0,L+bh*.8,bd/2-.05));            // corpo, corcova e pescoço grosso
    legs(g,s,D,true);
    hg.add(bx(.4,.36,.34,C,0,0,.14));hg.add(bx(.22,.17,.2,'#b08c66',0,-.08,.38));hg.add(bx(.09,.07,.04,'#111111',0,-.03,.49));
    for(const sx of[-1,1]){hg.add(bx(.13,.13,.06,C,sx*.17,.22,.06));hg.add(bx(.05,.05,.02,'#111111',sx*.1,.06,.316));hg.add(bx(.025,.05,.02,'#ffffff',sx*.06,-.17,.44));}
    tg.add(bx(.12,.12,.1,D,0,-.05,-.05));
  }else if(k==='jaguar'){
    const C='#d8a040',D='#c89030',Lt='#f0dcb0';
    bg.add(bx(bw,bh,bd,C,0,L+bh/2,0));bg.add(bx(bw*.9,.07,bd*.8,Lt,0,L+.035,0));bg.add(bx(.26,.3,.28,C,0,L+bh*.8,bd/2-.04));         // corpo, barriga clara, pescoço
    for(let i=0;i<9;i++)bg.add(bx(.07+rv()*.05,.012,.07+rv()*.05,'#2a1a0e',(rv()-.5)*(bw-.1),L+bh+.006,(rv()-.5)*(bd-.1)));         // manchas no dorso
    for(const sx of[-1,1])for(let i=0;i<3;i++)bg.add(bx(.012,.07,.08,'#2a1a0e',sx*(bw/2+.006),L+bh*(.3+i*.2),(rv()-.5)*(bd-.2)));    // manchas nas laterais
    legs(g,s,D,true);
    hg.add(bx(.26,.24,.24,C,0,0,.1));hg.add(bx(.13,.1,.12,Lt,0,-.06,.26));hg.add(bx(.06,.04,.03,'#e08a96',0,-.02,.33));
    for(const sx of[-1,1]){hg.add(bx(.07,.07,.04,D,sx*.1,.15,.03));hg.add(bx(.045,.04,.02,'#5ac050',sx*.085,.04,.222));hg.add(bx(.015,.04,.015,'#ffffff',sx*.04,-.12,.3));}
    tg.add(bx(.07,.07,.55,D,0,-.05,-.27));tg.add(bx(.075,.075,.08,'#2a1a0e',0,-.05,-.55));         // cauda longa com a ponta escura
  }else if(k==='boar'){
    const C='#4a3a30',D='#3a2c24';
    bg.add(bx(bw,bh,bd,C,0,L+bh/2,0));bg.add(bx(.1,.12,bd*.8,'#2a2018',0,L+bh+.06,0));bg.add(bx(.4,.42,.4,C,0,L+bh*.8,bd/2-.05));   // corpo, crina de cerdas e ombros fortes
    legs(g,s,D,false);
    hg.add(bx(.3,.28,.3,C,0,0,.12));hg.add(bx(.16,.14,.18,'#6a5446',0,-.07,.3));hg.add(bx(.1,.08,.03,'#e08a96',0,-.06,.4));
    for(const sx of[-1,1]){hg.add(bx(.03,.1,.03,'#f4f0e0',sx*.07,-.04,.36));hg.add(bx(.08,.1,.04,D,sx*.13,.17,.04));hg.add(bx(.04,.04,.02,'#d02020',sx*.09,.06,.272));}   // presas, orelhas e olhos vermelhos
    tg.add(bx(.04,.04,.14,D,0,-.03,-.07));
  }else if(k==='spider'){
    const C='#2a2228';
    bg.add(bx(bw,bh,bd,C,0,L+bh/2,0));bg.add(bx(.36,.26,.4,C,0,L+bh/2+.04,-.3));bg.add(bx(.12,.012,.16,'#c02020',0,L+bh/2+.175,-.3));   // corpo, abdômen grande e mancha vermelha
    for(const sx of[-1,1])for(let i=0;i<4;i++){const lz=.12-i*.09,m=bx(.2,.025,.025,'#1c1618',sx*(bw/2+.08),L+.1,lz);m.rotation.z=-sx*.5;bg.add(m);   // pernas extras, só enfeite
      const m2=bx(.025,.15,.025,'#1c1618',sx*(bw/2+.17),L-.02,lz);bg.add(m2);}
    legs(g,s,'#1c1618',false);
    hg.add(bx(.2,.16,.18,'#3a3038',0,0,.08));
    for(const sx of[-1,1]){hg.add(bx(.03,.03,.02,'#e02020',sx*.04,.04,.172));hg.add(bx(.03,.03,.02,'#e02020',sx*.075,.0,.172));hg.add(bx(.02,.07,.02,'#e8e0d0',sx*.04,-.08,.15));}   // olhos vermelhos e presas
  }else{   // cobra
    const A='#4a6a2a',Bc='#5c7a32',St='#c8b020';
    for(let i=0;i<8;i++){const m=bx(.09,.07,.1,i%3===1?St:(i%2?Bc:A),0,L+.04,-.3+i*.085);m.userData.x0=0;bg.add(m);g.userData.segs.push(m);}
    hg.add(bx(.11,.07,.14,A,0,.02,.05));hg.add(bx(.02,.012,.07,'#d02020',0,0,.15));
    for(const sx of[-1,1])hg.add(bx(.02,.02,.02,'#e8c020',sx*.045,.05,.1));
    tg.position.set(0,L,-bd/2);tg.add(bx(.05,.04,.16,'#3a5420',0,.04,-.08));
  }
  bg.add(hg);bg.add(tg);
  const jt=.94+rv()*.1;g.traverse(m=>{if(m.material&&m.material.color)m.material.color.multiplyScalar(jt);});
  const sh=new THREE.Mesh(new THREE.CircleGeometry(1,14),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.28,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  sh.rotation.x=-Math.PI/2;sh.scale.set(bw*.8+.1,bd*.7,1);sh.position.y=.02;g.add(sh);
  Object.assign(g.userData,{bg,hg,sh,tg,wings:[],hy,bz});
  g.scale.setScalar((1/S)*(.94+rv()*.12));return g;}

// o mk() original continua cuidando dos animais normais
const _mk=mk;mk=function(k){return(SPEC[k]&&SPEC[k].pred)?mkPred(k):_mk(k);};

// ---------- comportamento ----------
function los(a){for(let i=1;i<6;i++){const t=i/6,x=a.x+(P.x-a.x)*t,y=a.y+.6+(P.y+1-a.y-.6)*t,z=a.z+(P.z-a.z)*t;if(solid(Math.floor(x),Math.floor(y),Math.floor(z)))return false;}return true;}
// luz de fogueira (raio 8) ou lampião (raio 5,5) afasta os predadores
function lightNear(a){for(const f of fires){const R=f.lamp?5.5:8,dx=a.x-(f.x+.5),dz=a.z-(f.z+.5);if(dx*dx+dz*dz<R*R&&Math.abs(a.y-f.y)<6)return{x:f.x+.5,z:f.z+.5};}return null;}
let poisN=0,poisT=0;
const _updA=updA;
updA=function(a,dt){
  const s=SPEC[a.k];
  if(!s||!s.pred||a.rider){_updA(a,dt);return;}
  const u=a.g.userData;if(a.hp===undefined)a.hp=AHP[a.k];
  const live=typeof playing!=='undefined'&&playing&&hp>0,dx=P.x-a.x,dz=P.z-a.z,dist=Math.hypot(dx,dz);
  a.ac=Math.max(0,(a.ac||0)-dt);a.atk=Math.max(0,(a.atk||0)-dt);a.ag=Math.max(0,(a.ag||0)-dt);
  // percebeu o jogador (ou levou dano): fica agressivo por alguns segundos; o bando de lobos avisa uns aos outros
  const wasAg=a.ag>0;
  if(live&&(a.hit>0||(dist<s.det&&Math.abs(P.y-a.y)<8)))a.ag=a.hit>0?10:7;
  if(a.ag>0&&(!live||dist>s.lose))a.ag=0;
  if(a.ag>0&&!wasAg&&a.k==='wolf')for(const b of animals)if(b!==a&&b.k==='wolf'&&Math.hypot(b.x-a.x,b.z-a.z)<16)b.ag=Math.max(b.ag||0,7);
  const scared=s.coward&&a.hp<AHP[a.k]*.3&&a.ag>0;
  if(scared){a.th=Math.atan2(-dx,-dz);a.mv=true;a.gz=false;a.tt=.5;a.flee=.3;}
  else if(a.ag>0){
    a.th=Math.atan2(dx,dz);a.gz=false;a.tt=.5;a.al=0;a.flee=.25;   // flee>0 = corre 2,4x mais rápido e vira rápido
    const near=dist<s.reach*.8;a.mv=!near;
    a.lp=Math.max(0,(a.lp||0)-dt);
    if(s.pounce&&a.gr&&a.lp<=0&&dist>s.reach&&dist<5&&los(a)){a.vy=9;a.lp=2.5;}   // onça: salta em cima de você
    if(near&&a.ac<=0&&Math.abs(P.y-a.y)<1.8&&los(a)){
      a.ac=s.cd;a.atk=.3;a.vy=Math.max(a.vy,3);
      damage(s.dm);toast(MSG[a.k]);
      if(s.knock&&dist>.01){const kx=dx/dist*s.knock/4,kz=dz/dist*s.knock/4;   // javali: empurra o jogador (para se bater numa parede)
        for(let i=0;i<4;i++){if(!hit(P.x+kx,P.y,P.z)&&!hit(P.x,P.y,P.z+kz)){P.x+=kx;P.z+=kz;}else break;}P.vy=5/S;P.ground=false;}
      if(s.poison){poisN=5;poisT=1.5;toast('☠️ Você foi envenenado!');}}
  }else a.flee=0;   // sem ameaça: passeia como os outros animais
  _updA(a,dt);
  // animação de ataque (cabeça avança) e ondulação da cobra
  if(a.atk>0)u.hg.rotation.x+=Math.sin(a.atk/.3*Math.PI)*.7;
  if(u.segs.length){const mv=Math.min(1.5,a.spd/(s.v/S)),tm=(a.t||0)*9;u.segs.forEach((m,i)=>{m.position.x=Math.sin(tm-i*.9)*.05*(.3+mv);});}
};

// veneno: 1 de dano a cada 1,5 s, 5 vezes (dá para morrer se já estiver fraco); some ao desmaiar
const _vitals=vitals;vitals=function(dt){_vitals(dt);
  if(poisN>0&&typeof playing!=='undefined'&&playing){poisT-=dt;if(poisT<=0){poisT=1.5;poisN--;damage(1);if(poisN===0)toast('Você se recuperou do veneno');}}};
const _respawn=respawn;respawn=function(){poisN=0;_respawn();};

// ---------- aparecem no mundo e renascem longe do jogador ----------
function count(k){let c=0;for(const a of animals)if(a.k===k)c++;return c;}
for(const k in TARGET)for(let t=0;count(k)<TARGET[k]&&t<60;t++)spawnAnimal(k,28);
let respT=0;const _resp=respawnAnimals;
respawnAnimals=function(dt){_resp(dt);respT+=dt;if(respT<25)return;respT=0;
  for(const k in TARGET)if(count(k)<TARGET[k]){spawnAnimal(k,34);break;}};
})();
