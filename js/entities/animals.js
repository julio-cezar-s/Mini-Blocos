/* MiniBlocos · Animais: modelos, IA e colisão */
// animais (modelos em metros, escala 1/S)
const bx=(w,h,d,c,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshLambertMaterial({color:c}));m.position.set(x,y,z);return m;};
// flags: bip = ave de duas patas · sk = distância (blocos) em que se assusta com o jogador · hop = anda aos pulinhos · swim = nada · vr = variações de cor (troca de cores)
const SPEC={
 pig:{b:[.5,.4,.8,'#f0a0a8'],l:[.14,.3,'#e08a96'],h:[.38,'#f0a0a8'],x:[[.2,.14,.1,'#d9707f',0,-.04,.2]],v:.9,r:.3,hh:.6},
 cow:{b:[.58,.54,1,'#f2f2f2'],l:[.11,.38,'#f2f2f2'],h:[.34,'#3a2a22'],nh:1,x:[],v:.7,r:.38,hh:.9},
 chicken:{b:[.3,.3,.45,'#fafafa'],l:[.05,.2,'#e8b020'],h:[.2,'#fafafa'],x:[[.08,.06,.1,'#e8a020',0,-.03,.13],[.06,.1,.06,'#d02020',0,.14,0]],v:1.1,r:.15,hh:.5,bip:1,sk:7},
 sheep:{b:[.55,.5,.8,'#ececec'],l:[.13,.3,'#555'],h:[.34,'#6a6a6a'],x:[],v:.8,r:.3,hh:.8,sk:7},
 rabbit:{b:[.22,.2,.34,'#c9b8a4'],l:[.06,.12,'#b8a690'],h:[.16,'#c9b8a4'],x:[[.04,.2,.03,'#c9b8a4',-.04,.17,-.02],[.04,.2,.03,'#c9b8a4',.04,.17,-.02]],v:.9,r:.12,hh:.3,hop:1,sk:11,
  vr:[{},{'#c9b8a4':'#8a6a4a','#b8a690':'#7a5a3a'},{'#c9b8a4':'#f4f4f4','#b8a690':'#e0e0e0'},{'#c9b8a4':'#6a6a6a','#b8a690':'#555555'}]},
 horse:{b:[.46,.5,1,'#8a5a36'],l:[.085,.58,'#6a4326'],h:[.01,'#8a5a36'],x:[],v:.95,r:.32,hh:1.25,nh:1,
  vr:[{},{'#8a5a36':'#2b2b2b','#6a4326':'#1c1c1c','#2e1f14':'#111111'},{'#8a5a36':'#e8e0d0','#6a4326':'#cfc6b4','#2e1f14':'#cfc6b4'},{'#8a5a36':'#c8923c','#6a4326':'#a97a2e','#2e1f14':'#efe6c8'},{'#8a5a36':'#9c4a24','#6a4326':'#7a381c','#2e1f14':'#6a2e18'},{'#8a5a36':'#9a9a9a','#6a4326':'#7d7d7d','#2e1f14':'#e6e6e6'}]},
 goat:{b:[.45,.42,.75,'#e8e0d4'],l:[.1,.32,'#8a7a6a'],h:[.28,'#e8e0d4'],x:[[.14,.14,.2,'#d8d0c4',0,-.07,.2]],v:.85,r:.28,hh:.75,sk:6,
  vr:[{},{'#e8e0d4':'#8a7a66','#d8d0c4':'#7a6a56','#c8c0b4':'#6a5a46'},{'#e8e0d4':'#3a3a3a','#d8d0c4':'#2e2e2e','#c8c0b4':'#222222'}]},
 duck:{b:[.28,.24,.42,'#8a6a42'],l:[.04,.1,'#e89a20'],h:[.17,'#2e7d4f'],x:[[.12,.04,.12,'#f0b020',0,-.03,.12]],v:.8,r:.14,hh:.4,bip:1,swim:1,sk:6,
  vr:[{},{'#8a6a42':'#f4f4f4','#2e7d4f':'#f4f4f4','#6e5230':'#e6e6e6'},{'#8a6a42':'#3a3a3a','#2e7d4f':'#1f4a6a','#6e5230':'#2a2a2a'}]}};
function face(k,bg,hg,hs,hy,hz,bw,bh,bd,L){
  const f=hz+hs/2;
  // AH: peça da cabeça (coordenadas absolutas, convertidas para o pivô do pescoço); AT: peça do rabo (pivô já posicionado)
  const AH=(w,h,d,c,x,y,z,rz)=>{const o=bx(w,h,d,c,x,y-hy,z-bd/2);if(rz)o.rotation.z=rz;hg.add(o);return o;};
  const tg=new THREE.Group(),AT=(w,h,d,c,x,y,z)=>{tg.add(bx(w,h,d,c,x,y,z));},wings=[];
  const eyes=(dx,dy,sz)=>{for(const s of[-1,1]){AH(sz*1.6,sz*1.6,.02,'#fff',s*dx,hy+dy,f+.003);AH(sz,sz,.02,'#111',s*dx,hy+dy,f+.01);}};
  if(k==='pig'){
    eyes(hs*.27,hs*.12,.05);AH(.22,.15,.08,'#e07a88',0,hy-hs*.15,f+.04);
    for(const s of[-1,1]){AH(.04,.05,.02,'#8a3a48',s*.05,hy-hs*.15,f+.085);AH(.12,.12,.04,'#e08a96',s*(hs/2-.02),hy+hs/2+.03,hz-.02,-s*.5);}
    tg.position.set(0,L+bh*.8,-bd/2);AT(.05,.05,.12,'#e08a96',0,0,-.05);
  }else if(k==='cow'){   // cabeça com focinho rosado, faixa branca, chifres e orelhas; pescoço fixo em cowDetail()
    const HC='#3a2a22',PK='#e6b8a8',HN='#efe6cf';
    AH(.32,.3,.28,HC,0,hy,hz);AH(.1,.3,.02,'#f2f2f2',0,hy-.01,hz+.141);AH(.25,.17,.16,PK,0,hy-.09,hz+.21);AH(.2,.09,.04,'#d9a199',0,hy-.07,hz+.3);
    for(const s of[-1,1]){AH(.04,.04,.02,'#7a4a40',s*.055,hy-.07,hz+.325);
      AH(.065,.065,.02,'#ffffff',s*.1,hy+.06,hz+.145);AH(.035,.035,.02,'#111111',s*.1,hy+.06,hz+.152);
      AH(.15,.07,.04,'#2a2018',s*.24,hy+.07,hz-.05,s*.35);AH(.09,.035,.02,PK,s*.245,hy+.07,hz-.03,s*.35);
      AH(.05,.05,.05,HN,s*.14,hy+.17,hz-.04);AH(.04,.1,.04,HN,s*.18,hy+.23,hz-.04,-s*.45);}
    tg.position.set(0,L+bh*.92,-bd/2-.01);AT(.045,.4,.045,'#3a2a22',0,-.2,-.02);AT(.09,.12,.09,'#1a1410',0,-.44,-.02);
  }else if(k==='chicken'){
    eyes(hs*.3,hs*.15,.035);AH(.04,.07,.03,'#d02020',0,hy-hs*.35,f+.02);
    tg.position.set(0,L+bh*.8-.1,-bd/2);AT(.1,.2,.05,'#e8e8e8',0,.1,-.02);
    for(const s of[-1,1]){const wg=new THREE.Group();wg.position.set(s*(bw/2),L+bh*.55+.1,0);wg.add(bx(.04,.2,.3,'#e0e0e0',s*.02,-.1,0));wg.userData.s=s;bg.add(wg);wings.push(wg);}
  }else if(k==='rabbit'){
    eyes(hs*.32,hs*.12,.03);AH(.035,.03,.02,'#e07a88',0,hy-hs*.12,f+.01);
    tg.position.set(0,L+bh*.55,-bd/2);AT(.09,.09,.09,'#ffffff',0,0,-.04);
  }else if(k==='horse'){   // cabeça, pescoço e detalhes: ver horseDetail()
    tg.position.set(0,L+bh*.9,-bd/2-.02);tg.rotation.x=.2;AT(.06,.18,.06,'#2e1f14',0,-.09,-.02);AT(.11,.3,.08,'#2e1f14',0,-.32,-.05);AT(.08,.22,.07,'#2e1f14',0,-.58,-.07);
  }else if(k==='goat'){
    eyes(hs*.3,hs*.12,.04);AH(.12,.07,.04,'#444444',0,hy-hs*.3,hz+.32);
    for(const s of[-1,1]){AH(.05,.2,.05,'#5a4a3a',s*.06,hy+hs/2+.09,hz-.05,-s*.25);AH(.04,.1,.04,'#5a4a3a',s*.1,hy+hs/2+.2,hz-.08,-s*.55);AH(.1,.05,.04,'#d8d0c4',s*(hs/2+.05),hy+hs*.05,hz,s*.5);}
    AH(.05,.12,.04,'#c8c0b4',0,hy-hs*.5,hz+.24);   // barbicha
    tg.position.set(0,L+bh*.8,-bd/2);AT(.06,.12,.06,'#d8d0c4',0,.05,-.03);
  }else if(k==='duck'){
    eyes(hs*.3,hs*.15,.03);
    tg.position.set(0,L+bh*.7,-bd/2);AT(.1,.06,.12,'#6e5230',0,0,-.05);
    for(const s of[-1,1]){const wg=new THREE.Group();wg.position.set(s*(bw/2),L+bh*.55+.08,0);wg.add(bx(.03,.16,.28,'#6e5230',s*.015,-.08,0));wg.userData.s=s;bg.add(wg);wings.push(wg);}
  }else{
    eyes(hs*.27,hs*.12,.045);AH(.1,.07,.04,'#333',0,hy-hs*.25,f+.02);
    for(const s of[-1,1])AH(.14,.06,.04,'#5a5a5a',s*(hs/2+.06),hy+hs*.1,hz,s*.3);
    AH(hs*1.05,.1,hs*.8,'#f2f2f2',0,hy+hs/2+.03,hz-.03);bg.add(bx(.45,.45,.2,'#f5f5f5',0,hy-.05,bd/2-.05));
    tg.position.set(0,L+bh*.7,-bd/2);AT(.14,.14,.14,'#ececec',0,0,-.05);
  }
  bg.add(tg);return{tg,wings};}
// ---- cavalo: corpo com peito e garupa, pescoço inclinado com crina, cabeça alongada, pernas com articulação, casco escuro, patas brancas e manchas ----
function horseDetail(g,bg,hg,L,bw,bh,bd,rv){
  const C='#8a5a36',D='#6a4326',M='#2e1f14',W='#f4f0e6',nl=.46,nth=.62,ngY=L+bh*.82,ngZ=bd/2-.08;
  bg.add(bx(bw*1.02,bh*1.08,.26,C,0,L+bh*.5-.02,bd/2-.1));        // peito fundo
  bg.add(bx(bw*1.06,bh,.3,C,0,L+bh*.52+.02,-bd/2+.12));            // garupa arredondada
  bg.add(bx(.3,.07,.3,C,0,L+bh+.035,-bd/2+.14));                   // topo da anca
  bg.add(bx(.26,.08,.26,C,0,L+bh+.04,bd/2-.18));                   // cernelha
  bg.add(bx(bw*.9,.07,bd*.8,D,0,L+.035,0));                        // barriga mais escura
  const ng=new THREE.Group();ng.position.set(0,ngY,ngZ);ng.rotation.x=nth;   // pescoço (inclina ao pastar)
  ng.add(bx(.26,.24,.3,C,0,.1,0));ng.add(bx(.22,.22,.26,C,0,.28,0));ng.add(bx(.19,.2,.23,C,0,.44,0));ng.add(bx(.06,.54,.1,M,0,.28,-.15));bg.add(ng);   // pescoço e crina
  const hd=new THREE.Group();hd.rotation.x=.95;hd.position.set(0,0,.02);hd.scale.setScalar(1.15);hg.add(hd);   // cabeça apontando para frente e para baixo
  hd.add(bx(.19,.22,.24,C,0,0,.06));hd.add(bx(.17,.13,.18,C,0,-.07,.1));hd.add(bx(.14,.16,.22,C,0,-.03,.28));   // crânio, mandíbula e focinho
  hd.add(bx(.125,.12,.04,'#3a2a22',0,-.045,.405));hd.add(bx(.145,.012,.17,'#1a1210',0,-.103,.31));hd.add(bx(.1,.1,.06,M,0,.13,.08));   // ponta do nariz, boca e franja
  for(const s of[-1,1]){hd.add(bx(.02,.05,.05,'#111111',s*.101,.04,.09));hd.add(bx(.021,.015,.015,'#ffffff',s*.102,.055,.1));
    hd.add(bx(.03,.035,.02,'#1a1210',s*.04,-.04,.415));const e=bx(.05,.14,.045,C,s*.065,.15,-.02);e.rotation.z=-s*.2;hd.add(e);}   // olhos, narinas e orelhas
  if(rv()<.45){hd.add(bx(.05,.012,.24,W,0,.112,.1));hd.add(bx(.05,.012,.2,W,0,.052,.28));}   // estrela/listra branca no rosto
  const sock=rv()<.35;
  g.userData.legs.forEach(lg=>{const hind=lg.position.z<0;
    lg.add(hind?bx(.115,.24,.17,C,0,-.12,0):bx(.1,.2,.12,C,0,-.1,0));    // coxa / antebraço (só um leve engrossamento no alto)
    lg.add(bx(.095,.035,.095,D,0,-.3,0));                                // joelho / curvilhão
    lg.add(bx(.105,.06,.105,'#1b1612',0,-L+.03,0));                      // casco
    if(sock)lg.add(bx(.092,.15,.092,W,0,-(L-.11),0));});                 // meias brancas
  if(rv()<.2){for(let i=0;i<4;i++)bg.add(bx(.16+rv()*.16,.012,.2+rv()*.25,'#f2ede0',(rv()-.5)*.25,L+bh+.006,(rv()-.5)*.7));   // pintado (manchas brancas)
    for(const sx of[-1,1])for(let i=0;i<2;i++)bg.add(bx(.012,.16+rv()*.16,.2+rv()*.25,'#f2ede0',sx*(bw/2+.006),L+bh*(.3+rv()*.4),(rv()-.5)*.65));}
  Object.assign(g.userData,{ng,ngY,ngZ,nl,nth});}
// ---- vaca: pescoço grosso, cernelha, barriga, úbere e pernas com coxa ----
function cowDetail(g,bg,L,bw,bh,bd,brown){
  const C=brown?'#9a6a44':'#f2f2f2',B=brown?'#7a5232':'#d6d6d6',PK='#e6b8a8';
  bg.add(bx(.3,.36,.32,C,0,L+bh*.78,bd/2-.01));                    // pescoço (fixo; a cabeça gira no pivô)
  bg.add(bx(.5,.1,.3,C,0,L+bh+.04,bd/2-.18));                      // cernelha
  bg.add(bx(bw*.9,.06,bd*.8,B,0,L+.03,0));                         // barriga mais escura
  bg.add(bx(.2,.09,.22,PK,0,L-.02,-bd*.25));                       // úbere
  for(const sx of[-1,1])for(const sz of[-1,1])bg.add(bx(.03,.05,.03,'#d9a199',sx*.05,L-.075,-bd*.25+sz*.06));   // tetas
  g.userData.legs.forEach(lg=>{const hind=lg.position.z<0;
    lg.add(hind?bx(.14,.2,.2,C,0,-.1,0):bx(.125,.16,.15,C,0,-.08,0));  // coxa / antebraço (leve engrossamento no alto)
    lg.add(bx(.12,.035,.12,B,0,-.23,0));                              // joelho
    if(brown)lg.children[0].material.color.setHex(0x7a5232);});}
function mk(k){const s=SPEC[k],g=new THREE.Group(),bg=new THREE.Group(),[bw,bh,bd,bc]=s.b,L=s.l[1],lw=s.l[0],rv=Math.random;
  g.add(bg);
  // variação de pelagem: vaca branca com manchas (ou marrom), galinha branca ou marrom
  const bodyC=(k==='cow'&&rv()<.3)?'#9a6a44':bc;
  bg.add(bx(bw,bh,bd,bodyC,0,L+bh/2,0));
  (s.p||[]).forEach(p=>bg.add(bx(p[0],p[1],p[2],p[3],p[4],L+bh/2+p[5],p[6])));
  if(k==='cow'&&bodyC===bc){
    for(let i=0;i<4;i++){const sw=.12+rv()*.2,sd=.15+rv()*.25;bg.add(bx(sw,.012,sd,'#2a2018',(rv()-.5)*(bw-sw),L+bh+.006,(rv()-.5)*(bd-sd)));}
    for(const sx of[-1,1])for(let i=0;i<2;i++)bg.add(bx(.012,.14+rv()*.12,.18+rv()*.2,'#2a2018',sx*(bw/2+.006),L+bh*(.3+rv()*.4),(rv()-.5)*(bd-.3)));
  }
  g.userData.legs=[];for(const sx of[-1,1])for(const sz of(s.bip?[0]:[-1,1])){const lg=new THREE.Group();lg.position.set(sx*(bw/2-lw/2),L,sz*(bd/2-lw/2));lg.add(bx(lw,L,lw,s.l[2],0,-L/2,0));if(!s.bip)lg.add(bx(lw*1.08,.06,lw*1.08,'#222',0,-L+.03,0));else lg.add(bx(.1,.03,.12,s.l[2],0,-L+.015,.03));lg.userData.ph=(s.bip?sx>0:sx*sz>0)?0:Math.PI;g.add(lg);g.userData.legs.push(lg);}
  // cabeça num grupo com pivô no pescoço (permite pastar, olhar em volta, balançar)
  const hs=s.h[0],hy=L+bh*.85,hz=bd/2+hs*.35,hg=new THREE.Group();hg.position.set(0,hy,bd/2);
  if(!s.nh)hg.add(bx(hs,hs,hs,s.h[1],0,0,hz-bd/2));
  s.x.forEach(p=>hg.add(bx(p[0],p[1],p[2],p[3],p[4],p[5],hz-bd/2+p[6])));
  bg.add(hg);
  const fx=face(k,bg,hg,hs,hy,hz,bw,bh,bd,L);
  if(k==='horse')horseDetail(g,bg,hg,L,bw,bh,bd,rv);
  if(k==='cow')cowDetail(g,bg,L,bw,bh,bd,bodyC!==bc);
  let vmap=null;if(s.vr){const v=s.vr[Math.floor(rv()*s.vr.length)];vmap={};for(const key in v)vmap[parseInt(key.slice(1),16)]=parseInt(v[key].slice(1),16);}   // variação de cor
  const jt=.94+rv()*.1,brown=k==='chicken'&&rv()<.35;
  g.traverse(m=>{if(m.material&&m.material.color){const hx=m.material.color.getHex();if(vmap&&vmap[hx]!==undefined)m.material.color.setHex(vmap[hx]);
    if(brown){if(hx===0xfafafa)m.material.color.setHex(0xa9702f);else if(hx===0xe0e0e0||hx===0xe8e8e8)m.material.color.setHex(0x8a5a26);}
    m.material.color.multiplyScalar(jt);}});
  // sombra suave no chão
  const sh=new THREE.Mesh(new THREE.CircleGeometry(1,14),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.28,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  sh.rotation.x=-Math.PI/2;sh.scale.set(bw*.8,bd*.7,1);sh.position.y=.02;g.add(sh);
  Object.assign(g.userData,{bg,hg,sh,tg:fx.tg,wings:fx.wings,hy,bz:bd/2});
  g.scale.setScalar((1/S)*(.92+rv()*.16));return g;}
// rampas/escadas (ids 26-33) não são "sólidas" para o jogador (ele sobe pela superfície inclinada), mas para os animais valem como bloco cheio
const aSlope=(x,y,z)=>{if(x<0||z<0||y<0||x>=W||z>=D||y>=H)return false;const b=B[idx(x,y,z)];return b>=26&&b<=33;};
function hitB(px,py,pz,r,hh){
  for(let x=Math.floor(px-r);x<=Math.floor(px+r);x++)for(let y=Math.floor(py);y<=Math.floor(py+hh);y++)for(let z=Math.floor(pz-r);z<=Math.floor(pz+r);z++)if(solid(x,y,z)||aSlope(x,y,z))return true;return false;}
// Colisão horizontal dos animais com o jogador ou seu corpo de morte
function hitPlayerAnimal(a,x,y,z,r,hh){
  if(a.rider)return false;

  let px,py,pz,pr,ph;

  if(playerDead&&deathActor){
    px=deathActor.position.x;
    py=deathActor.position.y-1.42;
    pz=deathActor.position.z;
    pr=.55;
    ph=2.55;
  }else{
    px=P.x;
    py=P.y;
    pz=P.z;
    pr=.3/S;
    ph=PH;
  }

  if(y+hh<=py||y>=py+ph)return false;

  const dx=x-px;
  const dz=z-pz;
  const min=pr+r;
  const dist=Math.hypot(dx,dz);
  const oldDist=Math.hypot(a.x-px,a.z-pz);

  return dist<min&&dist<oldDist;
}
// animal preso dentro de um bloco (alguém colocou um bloco, fechou porta/portão ou o terreno mudou em cima dele): tira de lá
function unstick(a,r,hh){
  for(let dy=.25;dy<=2.5;dy+=.25)if(!hitB(a.x,a.y+dy,a.z,r,hh)){a.y+=dy;a.vy=0;return true;}   // sobe um pouco
  for(let rad=.5;rad<=4;rad+=.5)for(let k=0;k<8;k++){const an=k*Math.PI/4,nx=a.x+Math.sin(an)*rad,nz=a.z+Math.cos(an)*rad;   // ou sai para o lado
    for(let dy=0;dy<=3;dy+=.5)if(!hitB(nx,a.y+dy,nz,r,hh)&&!wet(nx,nz)){a.x=nx;a.z=nz;a.y+=dy;a.vy=0;return true;}}
  for(let dy=3;dy<=10;dy+=.5)if(!hitB(a.x,a.y+dy,a.z,r,hh)){a.y+=dy;a.vy=0;return true;}          // último recurso: sobe mais
  return false;}
const animals=[],KINDS=['pig','cow','chicken','sheep','rabbit','horse','goat','duck'];let animalT=0;
// cria um animal em terra firme (a pelo menos minDist blocos do jogador); devolve true se conseguiu
// patos nascem boiando na superfície da água
function spawnOnWater(k,minDist){for(let i=0;i<120;i++){const x=Math.floor(3+Math.random()*(W-6)),z=Math.floor(3+Math.random()*(D-6));let y=-1;
    for(let yy=H-1;yy>0;yy--){const t=get(x,yy,z);if(t){if(t===8&&get(x,yy-1,z)===8&&!get(x,yy+1,z))y=yy;break;}}
    if(y<0)continue;if(minDist&&Math.hypot(x-P.x,z-P.z)<minDist)continue;
    const g=mk(k);scene.add(g);animals.push({k,g,x:x+.5,y:y+.88,z:z+.5,vy:0,th:Math.random()*6.28,tt:Math.random()*3,mv:false,gr:true,bl:0});return true;}return false;}
function spawnAnimal(k,minDist){if(SPEC[k].swim)return spawnOnWater(k,minDist);for(let i=0;i<80;i++){const x=3+Math.random()*(W-6),z=3+Math.random()*(D-6);let y=-1;
    for(let yy=H-1;yy>=0;yy--)if(get(Math.floor(x),yy,Math.floor(z))){y=yy;break;}
    if(y<0||y!==hm[Math.floor(x)*D+Math.floor(z)])continue;const t=get(Math.floor(x),y,Math.floor(z));if(t===4||t===5||t===8||t===13)continue;
    if(minDist&&Math.hypot(x-P.x,z-P.z)<minDist)continue;
    const g=mk(k);scene.add(g);animals.push({k,g,x,y:y+1.01,z,vy:0,th:Math.random()*6.28,tt:Math.random()*3,mv:false,gr:false,bl:0});return true;}return false;}
for(let n=0,tries=0;n<Math.round(36*AA)&&tries<Math.round(70*AA);tries++)if(spawnAnimal(KINDS[tries%KINDS.length],0))n++;
// os animais renascem aos poucos (longe do jogador) quando sobram menos de 20: um a cada 12 s, sempre da espécie mais rara
// ---- morte: o animal tomba de lado, estrebucha, encolhe e some numa nuvenzinha ----
const dying=[],puffs=[],puffG=new THREE.BoxGeometry(.22,.22,.22),puffM=new THREE.MeshBasicMaterial({color:0xeeeeee});
function killAnimal(a){const i=animals.indexOf(a);if(i>=0)animals.splice(i,1);
  a.dt=0;a.dir=Math.random()<.5?-1:1;a.pf=false;a.g.userData.sh.visible=false;a.g.userData.s0=a.g.scale.x;dying.push(a);}
function updDying(dt){
  for(let i=dying.length-1;i>=0;i--){const a=dying[i],u=a.g.userData,s=SPEC[a.k],r=s.r/S,hh=s.hh/S;a.dt+=dt;const t=a.dt;
    const p=Math.min(1,t/.45),roll=a.dir*Math.PI/2*(1-Math.pow(1-p,3));
    if(t<.5){const v=3*(1-p)*dt,dx=Math.sin(a.th)*v,dz=Math.cos(a.th)*v;   // escorregão pelo golpe
      if(!hitB(a.x+dx,a.y,a.z,r,hh)&&!wet(a.x+dx,a.z))a.x+=dx;if(!hitB(a.x,a.y,a.z+dz,r,hh)&&!wet(a.x,a.z+dz))a.z+=dz;}
    a.vy-=24/S*dt;{let rem=a.vy*dt;while(Math.abs(rem)>1e-4){const st=Math.max(-.4,Math.min(.4,rem));if(hitB(a.x,a.y+st,a.z,r,hh)){a.vy=0;break;}a.y+=st;rem-=st;}}
    u.legs.forEach((lg,k)=>{lg.rotation.x=Math.sin(t*34+k*1.7)*.6*Math.max(0,1-t/1.1);});   // estrebucha
    u.hg.rotation.x+=(.55-u.hg.rotation.x)*Math.min(1,dt*6);u.hg.rotation.y*=.9;
    u.wings.forEach(w=>{w.rotation.z=w.userData.s*(.5+Math.sin(t*30)*.4*Math.max(0,1-t/.9));});
    a.g.rotation.set(0,a.rot,roll);a.g.position.set(a.x,a.y+Math.sin(Math.abs(roll))*s.b[0]/2*u.s0,a.z);
    if(t>1.5){if(!a.pf){a.pf=true;for(let n=0;n<8;n++){const m=new THREE.Mesh(puffG,puffM);m.position.set(a.x,a.y+.35,a.z);scene.add(m);
        puffs.push({m,l:.5,vx:(Math.random()-.5)*3,vy:.8+Math.random()*1.6,vz:(Math.random()-.5)*3});}}
      a.g.scale.setScalar(u.s0*Math.max(0,1-(t-1.5)/.4));}
    if(t>1.9){scene.remove(a.g);dying.splice(i,1);}}
  for(let i=puffs.length-1;i>=0;i--){const q=puffs[i];q.l-=dt;if(q.l<=0){scene.remove(q.m);puffs.splice(i,1);continue;}
    q.m.position.x+=q.vx*dt;q.m.position.y+=q.vy*dt;q.m.position.z+=q.vz*dt;q.m.scale.setScalar(q.l/.5);}}
function respawnAnimals(dt){updDying(dt);animalT+=dt;if(animalT<12)return;animalT=0;if(animals.length>=Math.round(28*AA))return;
  const cnt=KINDS.map(k=>[k,animals.filter(a=>a.k===k).length]).sort((p,q)=>p[1]-q[1]);for(const c of cnt)if(spawnAnimal(c[0],24))break;}   // espécie mais rara primeiro
function wet(x,z){const xi=Math.floor(x),zi=Math.floor(z);for(let y=H-1;y>=0;y--){const t=get(xi,y,zi);if(t)return t===8;}return false;}
function updA(a,dt){
  const s=SPEC[a.k],r=s.r/S,hh=a.rider?RIDE_HH:s.hh/S,u=a.g.userData,TAU=Math.PI*2;
  if(a.rot===undefined){a.rot=a.th;a.spd=0;a.ph=Math.random()*6;a.off=Math.random()*10;a.gz=false;a.gzv=0;a.lk=1;a.hy2=0;a.t=0;a.al=0;a.alv=0;}
  if(hitB(a.x,a.y,a.z,r,hh)){   // preso dentro de bloco
    if(!unstick(a,r,hh)){a.stk=(a.stk||0)+dt;if(a.stk>2){scene.remove(a.g);const i=animals.indexOf(a);if(i>=0)animals.splice(i,1);}return;}}   // sem saída: some e renasce em outro lugar
  else a.stk=0;
  a.t+=dt;
  if(a.flee>0){a.flee-=dt;a.gz=false;}
  if(a.hit>0){a.hit-=dt;if(a.hit<=0)tint(a,0);}
  // susto: galinhas e ovelhas param, levantam a cabeça e fogem quando o jogador se aproxima correndo (ou chega muito perto)
  if(s.sk){
    const sx=a.x-P.x,sz=a.z-P.z,sd=Math.hypot(sx,sz);
    if(a.al>0){a.al-=dt;if(a.al<=0){a.flee=1.6+Math.random()*.8;a.mv=true;a.gz=false;a.tt=a.flee;a.th=Math.atan2(sx,sz)+(Math.random()-.5)*.8;if(s.bip&&!s.swim&&a.gr)a.vy=4;
      for(const b of animals)if(b!==a&&SPEC[b.k].sk&&!(b.flee>.3)&&!(b.al>0)&&Math.hypot(b.x-a.x,b.z-a.z)<6)b.al=.15+Math.random()*.3;}}   // o bando inteiro se assusta
    else if(!(a.flee>.3)&&typeof playing!=='undefined'&&playing&&sd<s.sk&&(sd<2.2||(P.vx*sx+P.vz*sz)/sd>3)){a.al=.2+Math.random()*.15;a.mv=false;a.gz=false;}
  }
  a.alv+=((a.al>0?1:0)-a.alv)*Math.min(1,dt*10);
  a.tt-=dt;
  // comportamento: anda (virando aos poucos), pasta ou fica olhando em volta
  if(a.tt<=0&&!(a.flee>0)&&!(a.al>0)&&!a.rider){const q=Math.random();
    if(q<.5){a.mv=true;a.gz=false;a.th=a.rot+(Math.random()-.5)*2.6;a.tt=2+Math.random()*3;}
    else if(q<.8){a.mv=false;a.gz=true;a.tt=3+Math.random()*4;}
    else{a.mv=false;a.gz=false;a.tt=2+Math.random()*3;if(Math.random()<.5)a.th=a.rot+(Math.random()-.5)*1.5;}}
  // montado: o jogador dirige (rideIn vem de ride.js; sem entrada o cavalo para)
  if(a.rider){const ri=a.rideIn;a.rideIn=null;a.flee=0;a.gz=false;a.tt=5;if(ri&&Math.hypot(ri.x,ri.z)>.1){a.th=Math.atan2(ri.x,ri.z);a.mv=true;}else a.mv=false;if(ri&&ri.jump&&a.gr)a.vy=11;}
  // giro suave em direção a a.th
  let d=((a.th-a.rot+Math.PI)%TAU+TAU)%TAU-Math.PI;
  const tr=(a.rider?6:a.flee>0?7:2.6)*dt,st=Math.max(-tr,Math.min(tr,d));a.rot+=st;const e=d-st;
  // aceleração: arranca e para aos poucos; só anda a toda velocidade quando já está de frente para o destino
  const vmax=a.rider?RIDE_V:s.v/S*(a.flee>0?2.4:1),want=a.mv?vmax*Math.max(0,Math.cos(e)):0;
  a.spd+=(want-a.spd)*Math.min(1,dt*(want>a.spd?4:7));
    let blocked=false,byP=false;
  if(a.spd>.01){const v=a.spd*dt,n=Math.max(1,Math.ceil(v/.3)),dx=Math.sin(a.rot)*v/n,dz=Math.cos(a.rot)*v/n;
    for(let i=0;i<n;i++){
      if(hitPlayerAnimal(a,a.x+dx,a.y,a.z,r,hh)){blocked=true;byP=true;break;}
      if(!hitB(a.x+dx,a.y,a.z,r,hh)&&(s.swim||!wet(a.x+dx,a.z)))a.x+=dx;else{blocked=true;break;}
      if(hitPlayerAnimal(a,a.x,a.y,a.z+dz,r,hh)){blocked=true;byP=true;break;}
      if(!hitB(a.x,a.y,a.z+dz,r,hh)&&(s.swim||!wet(a.x,a.z+dz)))a.z+=dz;else{blocked=true;break;}}}
  if(blocked){a.bl+=dt;if(!byP&&a.gr&&a.bl<.5)a.vy=10;if(a.bl>(byP?.5:.8)){a.th=a.rot+(Math.random()<.5?-1:1)*(1.2+Math.random()*1.4);a.bl=0;}}else a.bl=0;
   // se o jogador andou para cima do animal, empurra o animal para fora (sem atravessar blocos)
  if(!a.rider){
    const dead=playerDead&&deathActor,px=dead?deathActor.position.x:P.x,pz=dead?deathActor.position.z:P.z,
      py=dead?deathActor.position.y-1.42:P.y,ph=dead?2.55:PH,mn=(dead?.55:.3/S)+r,
      ddx=a.x-px,ddz=a.z-pz,dd=Math.hypot(ddx,ddz);
    if(dd<mn&&a.y+hh>py&&a.y<py+ph){
      const ux=dd>.001?ddx/dd:Math.sin(a.rot),uz=dd>.001?ddz/dd:Math.cos(a.rot),pu=(mn-dd)*Math.min(1,dt*10);
      if(!hitB(a.x+ux*pu,a.y,a.z,r,hh)&&(s.swim||!wet(a.x+ux*pu,a.z)))a.x+=ux*pu;
      if(!hitB(a.x,a.y,a.z+uz*pu,r,hh)&&(s.swim||!wet(a.x,a.z+uz*pu)))a.z+=uz*pu;}}
 // separação: animais não ficam um dentro do outro
  for(const b of animals){if(b===a)continue;const ddx=a.x-b.x,ddz=a.z-b.z,dd=Math.hypot(ddx,ddz),rr=(r+SPEC[b.k].r/S)*.9;
    if(dd>.001&&dd<rr){const p=(rr-dd)*.5*Math.min(1,dt*4),nx=a.x+ddx/dd*p,nz=a.z+ddz/dd*p;
      if(!hitB(nx,a.y,a.z,r,hh)&&(s.swim||!wet(nx,a.z)))a.x=nx;if(!hitB(a.x,a.y,nz,r,hh)&&(s.swim||!wet(a.x,nz)))a.z=nz;}}
  let sy=Math.floor(a.y+.05);const inW=s.swim&&get(Math.floor(a.x),sy,Math.floor(a.z))===8;
  if(inW){while(get(Math.floor(a.x),sy+1,Math.floor(a.z))===8&&sy<H-2)sy++;a.vy+=((sy+.88-a.y)*14-a.vy*4)*dt;}   // pato boia na superfície
  else{a.vy-=24/S*dt;if(s.bip&&a.vy<-2.5)a.vy=-2.5;}   // aves planam batendo as asas
  let rem=a.vy*dt,hitV=false;
  while(Math.abs(rem)>1e-4){const st=Math.max(-.4,Math.min(.4,rem));if(hitV=hitB(a.x,a.y+st,a.z,r,hh))break;a.y+=st;rem-=st;}
  if(hitV){if(a.vy<0)a.gr=true;a.vy=0;}else a.gr=false;
  if(a.y<-10){a.y=H;a.vy=0;}
  if(inW)a.gr=true;
  if(s.hop){a.hopT=(a.hopT||0)-dt;if(a.gr&&a.spd>.4&&a.hopT<=0){a.vy=a.flee>0?7:4.5;a.gr=false;a.hopT=.12+Math.random()*.1;}}   // coelho anda aos pulinhos
  // ---- animação ----
  const sr=a.spd/(s.v/S),mvF=Math.min(1,sr),tm=a.t+a.off;
  if(a.gr)a.ph+=dt*(6+s.v*4)*Math.min(sr,2.4);
  const amp=Math.min(.9,.7*mvF+.1*Math.max(0,sr-1))*(a.gr?1:.3);
  u.legs.forEach(lg=>{lg.rotation.x=Math.sin(a.ph+lg.userData.ph)*amp;});
  const bg=u.bg;bg.position.y=Math.abs(Math.sin(a.ph))*.018*mvF;bg.rotation.z=Math.sin(a.ph)*.035*mvF;bg.scale.y=1+Math.sin(tm*2.1)*.012;if(s.hop)bg.rotation.x=-Math.max(-.3,Math.min(.3,a.vy*.05));
  // cabeça: pasta/bica, balança ao andar e acompanha o jogador com o olhar quando está parado
  a.gzv+=((a.gz&&!a.mv&&!(a.flee>0)?1:0)-a.gzv)*Math.min(1,dt*3);const g1=a.gzv,hg=u.hg;
  a.lk+=((a.mv||g1>.5?0:1)-a.lk)*Math.min(1,dt*3);
  let ly=Math.sin(tm*.7)*.5;const pdx=P.x-a.x,pdz=P.z-a.z;
  if(!a.rider&&pdx*pdx+pdz*pdz<64){const an=((Math.atan2(pdx,pdz)-a.rot+Math.PI)%TAU+TAU)%TAU-Math.PI;if(Math.abs(an)<2.2)ly=Math.max(-.9,Math.min(.9,an));}
  a.hy2+=(ly-a.hy2)*Math.min(1,dt*4);hg.rotation.y=a.hy2*a.lk;
  if(s.bip){const pk=Math.max(0,Math.sin(tm*6))*g1;hg.rotation.x=pk*1.0-.3*a.alv;hg.position.set(0,u.hy-pk*.1,u.bz+Math.sin(a.ph)*.04*mvF+pk*.04);}
  else if(a.k==='horse'){const th=u.nth+g1*1.15+(1-g1)*Math.sin(a.ph)*.04*mvF-.25*a.alv+g1*Math.sin(tm*9)*.03;   // abaixa o pescoço para pastar
    u.ng.rotation.x=th;hg.position.set(0,u.ngY+u.nl*Math.cos(th),u.ngZ+u.nl*Math.sin(th));hg.rotation.x=(th-u.nth)*.6;}
  else{hg.rotation.x=g1*(.8+Math.sin(tm*9)*.03)+(1-g1)*Math.sin(a.ph)*.04*mvF-.3*a.alv;hg.position.set(0,u.hy-g1*.14,u.bz+g1*.1);}
  const tg=u.tg;
  if(a.k==='cow'||a.k==='horse')tg.rotation.z=Math.sin(tm*1.6)*.25+Math.sin(a.ph)*.15*mvF;
  else if(a.k==='pig')tg.rotation.y=Math.sin(tm*4)*.4*(.4+mvF);
  else if(a.k==='sheep'||a.k==='goat'||a.k==='rabbit')tg.rotation.y=Math.sin(tm*5)*.35*(.3+mvF);
  else tg.rotation.x=-.1+Math.sin(tm*3)*.05+Math.sin(a.ph*2)*.15*mvF;
  if(u.wings.length){const fl=(a.flee>0||(!a.gr&&a.vy<-1))?.55+Math.sin(a.t*28)*.45:.08;u.wings.forEach(w=>{w.rotation.z=w.userData.s*fl;});}
  a.g.position.set(a.x,a.y,a.z);a.g.rotation.y=a.rot;}
