/* MiniBlocos · Alçapão: porta de chão que abre para cima (colocar, abrir/fechar, quebrar, malha) */
// item 51 (inventário). No mundo: 52-55 = fechado, 56-59 = aberto.
// (id-52)&3 = lado da dobradiça: 0 = +x, 1 = -x, 2 = +z, 3 = -z (sempre o lado para onde o jogador olhava ao colocar)
// Fechado: placa fina no topo da célula, rente ao chão, sólida (dá para andar em cima).
// Aberto: a tampa fica em pé na dobradiça (sem colisão) e a célula vira um buraco de 1 bloco.
const HT=.19;   // espessura da tampa
const HOK=[1,2,3,4,6,7,9,10,11,12,19,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50];   // blocos que o alçapão pode substituir
Object.assign(HARD,{52:1,53:1,54:1,55:1,56:1,57:1,58:1,59:1});
if(typeof MCol!=='undefined')for(let k=52;k<=59;k++)MCol[k]=new THREE.Color('#9e703a');
const hatchM=(o,u,w)=>o===0?[u,w]:(o===1?[1-u,1-w]:(o===2?[w,u]:[1-w,1-u]));
function drawHatchIcon(g){g.lineJoin='round';g.lineWidth=2;g.strokeStyle='#4a2f14';
  g.fillStyle='#6e4a22';g.beginPath();g.moveTo(4,26);g.lineTo(24,36);g.lineTo(24,43);g.lineTo(4,33);g.closePath();g.fill();g.stroke();
  g.fillStyle='#55391a';g.beginPath();g.moveTo(24,36);g.lineTo(44,26);g.lineTo(44,33);g.lineTo(24,43);g.closePath();g.fill();g.stroke();
  g.fillStyle='#a8742f';g.beginPath();g.moveTo(4,26);g.lineTo(24,16);g.lineTo(44,26);g.lineTo(24,36);g.closePath();g.fill();
  g.save();g.clip();g.strokeStyle='#7a4f22';g.lineWidth=1.5;for(let i=1;i<4;i++){g.beginPath();g.moveTo(4+i*10,26-i*5);g.lineTo(24+i*10,36-i*5);g.stroke();}g.restore();
  g.strokeStyle='#4a2f14';g.lineWidth=2;g.beginPath();g.moveTo(4,26);g.lineTo(24,16);g.lineTo(44,26);g.lineTo(24,36);g.closePath();g.stroke();
  g.fillStyle='#d8dce4';g.strokeStyle='#555';g.lineWidth=1.2;g.beginPath();g.ellipse(24,26,4.5,2.4,0,0,Math.PI*2);g.fill();g.stroke();
  g.fillStyle='#1e1814';g.beginPath();g.ellipse(24,26,2,1,0,0,Math.PI*2);g.fill();}
function placeHatch(r){if(inv[51]<=0||!r.prev)return;
  let x,y,z,old;
  if(r.prev[0]===r.x&&r.prev[2]===r.z&&r.prev[1]===r.y+1){   // mirou no topo de um bloco: o alçapão entra no lugar dele, rente ao chão
    x=r.x;y=r.y;z=r.z;old=B[idx(x,y,z)];if(!HOK.includes(old)){toast('Aqui não dá para colocar o alçapão');return;}}
  else{[x,y,z]=r.prev;old=B[idx(x,y,z)];if(old&&old!==8)return;}   // mirou na parede/teto de um buraco: entra na célula vazia
  if(x<0||z<0||x>=W||z>=D||y<1||y>=H)return;
  const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),o=Math.abs(fx)>Math.abs(fz)?(fx>0?0:1):(fz>0?2:3);
  B[idx(x,y,z)]=52+o;
  if(hit(P.x,P.y,P.z)){B[idx(x,y,z)]=old;toast('Saia da frente para colocar o alçapão');return;}
  if(old&&old!==8)inv[old]++;   // devolve o bloco que foi substituído
  inv[51]--;renderBar();buildAt(x,y,z);waterTouch(x,y,z);
  toast('🚪 Alçapão colocado: toque nele para abrir (sobe) e fechar');}
function tryHatch(){const r=ray();if(!r)return false;const i=idx(r.x,r.y,r.z),t=B[i];if(t<52||t>59)return false;
  const nt=t<56?t+4:t-4;B[i]=nt;
  if(nt<56&&hit(P.x,P.y,P.z)){B[i]=t;toast('Saia do buraco para fechar o alçapão');return true;}
  buildAt(r.x,r.y,r.z);return true;}
function breakHatch(r){const t=B[idx(r.x,r.y,r.z)];if(t<52||t>59)return false;
  B[idx(r.x,r.y,r.z)]=0;inv[51]++;renderBar();buildAt(r.x,r.y,r.z);waterTouch(r.x,r.y,r.z);return true;}
// a tampa aberta fica em pé na célula de CIMA do alçapão: o raio precisa conseguir "tocar" nela (e atravessar o resto do buraco)
function hatchLidAt(px,py,pz,x,y,z){const b=get(x,y-1,z);if(b<56||b>59)return null;
  const o=b-56,lx=px-x,lz=pz-z,u=o===0?lx:(o===1?1-lx:(o===2?lz:1-lz));
  return u>=1-HT-.05?[x,y-1,z]:null;}
function hatchCell(t,x,y,z,v,tp,tc,tu,tf){
  const open=t>=56,o=(t-52)&3,fb=fireB(x,y,z,[0,0,0]),cl=q=>Math.min(1,Math.max(0,q)),ext=(q,a,b)=>b>a?cl((q-a)/(b-a)):0;
  const M=(u,yy,w)=>{const a=hatchM(o,u,w);return[x+a[0],y+yy,z+a[1]];};
  // caixa em coordenadas locais (u: dobradiça em u=1, y, w). bigAx = eixo das faces grandes (0=u, 1=y); cull = esconde faces coladas em bloco opaco
  const box=(u0,u1,y0,y1,w0,w1,bigAx,cull)=>{
    const FS=[[1,0,0,.8,[[u1,y0,w0],[u1,y1,w0],[u1,y1,w1],[u1,y0,w1]]],[-1,0,0,.8,[[u0,y0,w0],[u0,y0,w1],[u0,y1,w1],[u0,y1,w0]]],
      [0,1,0,1,[[u0,y1,w0],[u0,y1,w1],[u1,y1,w1],[u1,y1,w0]]],[0,-1,0,.5,[[u0,y0,w0],[u1,y0,w0],[u1,y0,w1],[u0,y0,w1]]],
      [0,0,1,.65,[[u0,y0,w1],[u1,y0,w1],[u1,y1,w1],[u0,y1,w1]]],[0,0,-1,.65,[[u0,y0,w0],[u0,y1,w0],[u1,y1,w0],[u1,y0,w0]]]];
    for(const [nu,ny,nw,sh,cs] of FS){
      if(cull&&((nu===1&&u1===1)||(nu===-1&&u0===0)||(nw===1&&w1===1)||(nw===-1&&w0===0)||(ny===1&&y1===1))){
        const c0=M(.5,.5,.5),c1=M(.5+nu,.5+ny,.5+nw);
        if(OPQ(get(x+Math.round(c1[0]-c0[0]),y+Math.round(c1[1]-c0[1]),z+Math.round(c1[2]-c0[2])),0))continue;}
      const tile=((bigAx===1&&ny!==0)||(bigAx===0&&nu!==0))?52:53;
      for(const i of TRI){const q=cs[i],p=M(q[0],q[1],q[2]);tp.push(p[0],p[1],p[2]);const f=v*sh;tc.push(f,f,f);tf.push(fb);
        let uu,vv;if(nu!==0){uu=ext(q[2],w0,w1);vv=ext(q[1],y0,y1);}else if(ny!==0){uu=ext(q[0],u0,u1);vv=ext(q[2],w0,w1);}else{uu=ext(q[0],u0,u1);vv=ext(q[1],y0,y1);}
        tu.push(((tile%6)+.03+uu*.94)/6,1-(Math.floor(tile/6)+1)/ATR+(.03+vv*.94)/ATR);}}};
  if(open)box(1-HT-.01,.99,1,2,0,1,0,false);   // tampa em pé na dobradiça (na célula de cima)
  else box(0,1,1-HT,1,0,1,1,true);}              // tampa deitada, rente ao topo da célula
