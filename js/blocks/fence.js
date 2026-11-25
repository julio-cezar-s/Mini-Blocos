/* MiniBlocos · Cerca (bloco 60) e Portão (item 61; no mundo 62-67): postes que se ligam sozinhos às cercas e aos blocos vizinhos */
// Cerca: poste de 1,5 bloco de altura e duas travessas em direção a cada vizinho (outra cerca, portão ou bloco maciço).
// Portão: 62 = fechado com a largura em x, 63 = fechado com a largura em z; 64/65 = aberto (largura x, folha para +z / -z); 66/67 = aberto (largura z, folha para +x / -x).
// Colisão: cerca e portão FECHADO contam a célula e a de cima como sólidas (solid() em world/constants.js): não dá para subir andando; aberto não tem colisão.
Object.assign(HARD,{60:.8,62:.8,63:.8,64:.8,65:.8,66:.8,67:.8});
function drawFenceIcon(g){g.lineJoin='round';g.lineWidth=2;g.strokeStyle='#4a2f14';
  const bar=(x0,y0,x1,y1)=>{g.fillStyle='#b8894a';g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1-4);g.lineTo(x1,y1+1);g.lineTo(x0,y0+5);g.closePath();g.fill();g.stroke();};
  bar(4,24,44,14);bar(4,36,44,26);   // travessas
  for(const x of[8,24,40]){g.fillStyle='#9a6a34';g.fillRect(x-3,8,6,34);g.strokeRect(x-3,8,6,34);g.fillStyle='#c79a5a';g.fillRect(x-3,8,6,4);}}   // postes
function drawGateIcon(g){g.lineJoin='round';g.lineWidth=2;g.strokeStyle='#4a2f14';
  const post=x=>{g.fillStyle='#9a6a34';g.fillRect(x-4,8,8,36);g.strokeRect(x-4,8,8,36);g.fillStyle='#c79a5a';g.fillRect(x-4,8,8,4);};
  const bar=(y)=>{g.fillStyle='#b8894a';g.fillRect(10,y,28,6);g.strokeRect(10,y,28,6);};
  bar(18);bar(30);g.fillStyle='#b8894a';g.fillRect(21,24,6,6);g.strokeRect(21,24,6,6);post(8);post(40);}
// vizinho que "segura" a travessa: outra cerca, portão alinhado ou bloco opaco (ax 0 = vizinho em x, 1 = vizinho em z)
const fenceConn=(nb,ax)=>nb===60||!!OPQ(nb,0)||(ax===0?(nb===62||nb===64||nb===65):(nb===63||nb===66||nb===67));
// caixa em coordenadas locais da célula; skip*: não desenha a ponta colada no vizinho; noBottom: apoia no chão
function fbox(x,y,z,v,fb,tp,tc,tu,tf,x0,x1,y0,y1,z0,z1,skipX0,skipX1,skipZ0,skipZ1,noBottom){
  const tile=TMAP[6][1],cl=q=>Math.min(1,Math.max(0,q));
  const FS=[[0,.8,[[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1]],skipX1],[0,.8,[[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0]],skipX0],
    [1,1,[[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0]],0],[1,.5,[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1]],noBottom],
    [2,.65,[[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],skipZ1],[2,.65,[[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[x1,y0,z0]],skipZ0]];   // [eixo da face (0=x,1=y,2=z), sombra, cantos, pular?]
  for(const[ax,sh,cs,skip]of FS){if(skip)continue;
    for(const k of TRI){const c=cs[k];tp.push(x+c[0],y+c[1],z+c[2]);const f=v*sh;tc.push(f,f,f);tf.push(fb);
      let uu,vv;if(ax===0){uu=cl(c[2]);vv=cl(c[1]/1.5);}else if(ax===1){uu=cl(c[0]);vv=cl(c[2]);}else{uu=cl(c[0]);vv=cl(c[1]/1.5);}
      tu.push(((tile%6)+.03+uu*.94)/6,1-(Math.floor(tile/6)+1)/ATR+(.03+vv*.94)/ATR);}}}
const FRAILS=[[.45,.65],[.95,1.15]];
function fenceCell(t,x,y,z,v,tp,tc,tu,tf){
  const fb=fireB(x,y,z,[0,0,0]),bx=(...a)=>fbox(x,y,z,v,fb,tp,tc,tu,tf,...a);
  const cn=[fenceConn(get(x+1,y,z),0),fenceConn(get(x-1,y,z),0),fenceConn(get(x,y,z+1),1),fenceConn(get(x,y,z-1),1)];
  bx(.375,.625,0,1.5,.375,.625,0,0,0,0,1);   // poste
  for(const[r0,r1]of FRAILS){
    if(cn[0])bx(.625,1,r0,r1,.45,.55,0,1,0,0,0);
    if(cn[1])bx(0,.375,r0,r1,.45,.55,1,0,0,0,0);
    if(cn[2])bx(.45,.55,r0,r1,.625,1,0,0,0,1,0);
    if(cn[3])bx(.45,.55,r0,r1,0,.375,0,0,1,0,0);}
  return true;}
// ---- portão ----
function gateGeom(t){return t===62?{ax:0,open:0,s:0}:t===63?{ax:1,open:0,s:0}:{ax:t<66?0:1,open:1,s:(t===64||t===66)?1:-1};}
function gateCell(t,x,y,z,v,tp,tc,tu,tf){
  const g=gateGeom(t),fb=fireB(x,y,z,[0,0,0]);
  // p = largura do portão, q = espessura (em x/z conforme o eixo)
  const gb=(p0,p1,y0,y1,q0,q1,sP0,sP1,sQ0,sQ1,nb)=>g.ax?fbox(x,y,z,v,fb,tp,tc,tu,tf,q0,q1,y0,y1,p0,p1,sQ0,sQ1,sP0,sP1,nb):fbox(x,y,z,v,fb,tp,tc,tu,tf,p0,p1,y0,y1,q0,q1,sP0,sP1,sQ0,sQ1,nb);
  gb(0,.15,0,1.5,.375,.625,0,0,0,0,1);gb(.85,1,0,1.5,.375,.625,0,0,0,0,1);   // os dois postes
  if(!g.open){for(const[r0,r1]of FRAILS)gb(.15,.85,r0,r1,.45,.55,1,1,0,0,0);gb(.45,.55,.65,.95,.45,.55,0,0,0,0,0);}   // travessas e barra central
  else{const q0=g.s>0?.625:-.325,q1=g.s>0?1.325:.375,e0=g.s>0?q1-.1:q0,e1=g.s>0?q1:q0+.1;
    for(const[r0,r1]of FRAILS)gb(.04,.14,r0,r1,q0,q1,0,0,g.s>0,g.s<0,0);   // folha girada na dobradiça (poste do lado de p=0)
    gb(.04,.14,.45,1.15,e0,e1,0,0,0,0,0);}   // barra da ponta livre
  return true;}
// o raio atravessa o portão aberto, mas "toca" nos postes e na folha (para fechar ou quebrar)
function gateHitAt(px,py,pz,x,y,z){
  for(let dy=0;dy<=1;dy++)for(const[dx,dz]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const cx=x+dx,cy=y-dy,cz=z+dz,b=get(cx,cy,cz);if(b<64||b>67)continue;
    const g=gateGeom(b),ly=py-cy;if(ly<0||ly>1.5)continue;
    const lx=px-cx,lz=pz-cz,p=g.ax?lz:lx,q=g.ax?lx:lz,q0=g.s>0?.375:-.325,q1=g.s>0?1.325:.625;
    if((p<=.15&&q>=q0&&q<=q1)||(p>=.85&&q>=.375&&q<=.625))return[cx,cy,cz];}
  return null;}
function placeGate(r){if(inv[61]<=0||!r.prev)return;const[x,y,z]=r.prev,old=B[idx(x,y,z)];
  if((old&&old!==8)||x<0||z<0||x>=W||z>=D||y<1||y>=H)return;
  const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw);
  B[idx(x,y,z)]=Math.abs(fz)>Math.abs(fx)?62:63;   // olhando ao longo de z, a largura do portão fica em x (e vice-versa)
  if(hit(P.x,P.y,P.z)){B[idx(x,y,z)]=old;toast('Saia da frente para colocar o portão');return;}
  inv[61]--;renderBar();buildAt(x,y,z);waterTouch(x,y,z);toast('🚪 Portão colocado: toque nele para abrir e fechar');}
function tryGate(){const r=ray();if(!r)return false;const i=idx(r.x,r.y,r.z),t=B[i];if(t<62||t>67)return false;
  const g=gateGeom(t);
  if(!g.open){   // abrir: a folha vai para o lado oposto ao jogador; se estiver ocupado, tenta o outro
    const pq=g.ax?P.x:P.z,qc=(g.ax?r.x:r.z)+.5,pref=pq<qc?1:-1;let s=0;
    for(const c of[pref,-pref]){const nx=g.ax?r.x+c:r.x,nz=g.ax?r.z:r.z+c;if(nx>=0&&nz>=0&&nx<W&&nz<D&&!B[idx(nx,r.y,nz)]){s=c;break;}}
    if(!s){toast('Sem espaço para abrir o portão');return true;}
    B[i]=g.ax?(s>0?66:67):(s>0?64:65);}
  else{B[i]=g.ax?63:62;if(hit(P.x,P.y,P.z)){B[i]=t;toast('Saia do portão para fechá-lo');return true;}}
  buildAt(r.x,r.y,r.z);return true;}
function breakGate(r){const t=B[idx(r.x,r.y,r.z)];if(t<62||t>67)return false;
  B[idx(r.x,r.y,r.z)]=0;inv[61]++;renderBar();buildAt(r.x,r.y,r.z);waterTouch(r.x,r.y,r.z);return true;}
