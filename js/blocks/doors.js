/* MiniBlocos · Portas 2x3 estilo Minecraft: porta dupla de folhas finas (colocar, abrir/fechar girando na dobradiça, quebrar) */
// fechada = bloco 20 (sólido, folhas finas no meio da célula), aberta = bloco 21 (sem colisão, folhas giradas 90° nas dobradiças)
// d = {cells:[6 células, índice = a*3+h (a: 0..1 folha, h: 0..2 altura)], s:+1/-1 = para que lado as folhas abrem}
const doors=[];const DOORT=.19;
const findDoor=(x,y,z)=>doors.find(d=>d.cells.some(c=>c[0]===x&&c[1]===y&&c[2]===z));
function rebuildCells(cells){const s=new Set();cells.forEach(([x,y,z])=>{const cx=x>>4,cz=z>>4,lx=x&15,lz=z&15;s.add(cx+','+cz);
  if(lx===0&&cx>0)s.add((cx-1)+','+cz);if(lx===15&&cx<W/CS-1)s.add((cx+1)+','+cz);if(lz===0&&cz>0)s.add(cx+','+(cz-1));if(lz===15&&cz<D/CS-1)s.add(cx+','+(cz+1));});
  // as folhas abertas saem 1 bloco para a frente/trás da porta: reconstrói também os chunks vizinhos dessa faixa
  cells.forEach(([x,y,z])=>{for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz;if(nx>=0&&nz>=0&&nx<W&&nz<D)s.add((nx>>4)+','+(nz>>4));}});
  s.forEach(k=>{const[a,b]=k.split(',');buildChunk(+a,+b);});}
// geometria da porta: ax 0 = largura em x (espessura em z); ax 1 = largura em z. P = início da largura, qc = centro da espessura
function doorGeom(d){const c=d.cells;if(c.length!==6)return null;
  const ax=c[3][0]!==c[0][0]?0:1,P=c[0][ax?2:0],qc=c[0][ax?0:2]+.5,s=d.s===-1?-1:1,lv=[];
  for(let a=0;a<2;a++){const p0=a?P+2-DOORT:P,p1=a?P+2:P+DOORT,q0=s>0?qc:qc-1,q1=s>0?qc+1:qc;lv.push(ax?[q0,q1,p0,p1]:[p0,p1,q0,q1]);}   // [xmin,xmax,zmin,zmax] das folhas abertas
  return{ax,P,qc,s,y0:c[0][1],lv};}
// o raio atravessa a porta aberta, mas "toca" nas folhas (para fechar ou quebrar)
function doorLeafHit(px,py,pz){for(const d of doors){const c0=d.cells[0];if(B[idx(c0[0],c0[1],c0[2])]!==21)continue;
  if(Math.abs(px-c0[0])>4||Math.abs(pz-c0[2])>4)continue;const g=doorGeom(d);if(!g||py<g.y0||py>g.y0+3)continue;
  for(const b of g.lv)if(px>=b[0]&&px<=b[1]&&pz>=b[2]&&pz<=b[3])return c0;}return null;}
function placeDoor(r){if(inv[20]<=0||!r.prev)return;const[cx,cy,cz]=r.prev;
  const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),alongZ=Math.abs(fz)>Math.abs(fx),cells=[];
  for(let a=0;a<2;a++)for(let h=0;h<3;h++)cells.push(alongZ?[cx+a,cy+h,cz]:[cx,cy+h,cz+a]);
  for(const[x,y,z]of cells){if(x<0||z<0||x>=W||z>=D||y<0||y>=H){toast('Sem espaço para a porta');return;}const g=B[idx(x,y,z)];if(g&&g!==8){toast('Sem espaço para a porta');return;}}
  cells.forEach(([x,y,z])=>B[idx(x,y,z)]=20);
  if(hit(P.x,P.y,P.z)){cells.forEach(([x,y,z])=>B[idx(x,y,z)]=0);toast('Saia da frente para colocar a porta');return;}
  doors.push({cells,s:1});inv[20]--;renderBar();rebuildCells(cells);toast('🚪 Porta colocada: clique direito (ou toque) para abrir e fechar');}
function tryDoor(){const r=ray();if(!r)return false;const t=B[idx(r.x,r.y,r.z)];if(t!==20&&t!==21)return false;
  const d=findDoor(r.x,r.y,r.z);if(!d)return false;const nt=t===20?21:20;
  if(nt===21){const g=doorGeom(d);   // abre para o lado oposto ao jogador; se estiver bloqueado, tenta o outro lado
    if(g){const pq=g.ax?P.x:P.z,pref=pq<g.qc?1:-1;let ok=0;
      for(const s of[pref,-pref]){let free=true;
        for(let a=0;a<2&&free;a++)for(let h=0;h<3&&free;h++){const c=d.cells[a*3+h],fx=g.ax?c[0]+s:c[0],fz=g.ax?c[2]:c[2]+s;
          if(fx<0||fz<0||fx>=W||fz>=D||B[idx(fx,c[1],fz)])free=false;}
        if(free){d.s=s;ok=1;break;}}
      if(!ok){toast('Sem espaço para abrir a porta');return true;}}}
  d.cells.forEach(([x,y,z])=>B[idx(x,y,z)]=nt);
  if(nt===20&&hit(P.x,P.y,P.z)){d.cells.forEach(([x,y,z])=>B[idx(x,y,z)]=21);toast('Saia da porta para fechá-la');return true;}
  rebuildCells(d.cells);return true;}
function breakDoor(r){const t=B[idx(r.x,r.y,r.z)];if(t!==20&&t!==21)return false;const d=findDoor(r.x,r.y,r.z);
  if(d){d.cells.forEach(([x,y,z])=>B[idx(x,y,z)]=0);doors.splice(doors.indexOf(d),1);inv[20]++;renderBar();rebuildCells(d.cells);}
  else{B[idx(r.x,r.y,r.z)]=0;buildAt(r.x,r.y,r.z);}return true;}
// malha de uma célula da porta (devolve false se a célula não pertence a uma porta conhecida: aí vale o desenho de bloco antigo)
function doorCell(t,x,y,z,v,tp,tc,tu,tf){
  const d=findDoor(x,y,z);if(!d)return false;const g=doorGeom(d);if(!g)return false;
  const i=d.cells.findIndex(c=>c[0]===x&&c[1]===y&&c[2]===z),a=(i/3)|0,h=i%3,open=t===21,P0=g.P,qc=g.qc,s=g.s,ax=g.ax,fb=fireB(x,y,z,[0,0,0]);
  const hing=a?P0+2:P0,tl=h===1?55:54,cl=q=>Math.min(1,Math.max(0,q));
  let p0,p1,q0,q1,y0=y,y1=y+1;
  if(open){p0=a?P0+2-DOORT:P0+.004;p1=a?P0+2-.004:P0+DOORT;q0=s>0?qc:qc-1;q1=s>0?qc+1:qc;if(h===0)y0+=.004;if(h===2)y1-=.004;}
  else{p0=P0+a;p1=P0+a+1;q0=qc-DOORT/2;q1=qc+DOORT/2;}
  const pt=(p,yy,q)=>ax?[q,yy,p]:[p,yy,q];
  const F=[['p',1,.8,[[p1,y0,q0],[p1,y1,q0],[p1,y1,q1],[p1,y0,q1]]],['p',-1,.8,[[p0,y0,q0],[p0,y0,q1],[p0,y1,q1],[p0,y1,q0]]],
    ['q',1,.65,[[p0,y0,q1],[p1,y0,q1],[p1,y1,q1],[p0,y1,q1]]],['q',-1,.65,[[p0,y0,q0],[p0,y1,q0],[p1,y1,q0],[p1,y0,q0]]],
    ['y',1,1,[[p0,y1,q0],[p0,y1,q1],[p1,y1,q1],[p1,y1,q0]]],['y',-1,.5,[[p0,y0,q0],[p1,y0,q0],[p1,y0,q1],[p0,y0,q1]]]];
  for(const[n,sg,sh,cs]of F){
    if(!open&&n!=='q')continue;   // fechada: só as duas faces grandes (as bordas ficam coladas na parede)
    if(open&&n==='y'&&!((sg>0&&h===2)||(sg<0&&h===0)))continue;
    const big=open?n==='p':n==='q',tile=big?tl:53;
    for(const k of TRI){const c=cs[k],w=pt(c[0],c[1],c[2]);tp.push(w[0],w[1],w[2]);const f=v*sh;tc.push(f,f,f);tf.push(fb);
      const uu=big?cl(open?Math.abs(c[2]-qc):Math.abs(c[0]-hing)):.5,vv=big?cl(c[1]-y):.5;   // u: 0 na dobradiça, 1 na ponta livre (puxador)
      tu.push(((tile%6)+.03+uu*.94)/6,1-(Math.floor(tile/6)+1)/ATR+(.03+vv*.94)/ATR);}}
  return true;}
