/* MiniBlocos · Rampas e escadas (ícone, física e malha) */
// rampas e escadas (blocos 26-29 rampa, 30-33 escada; orientação = direção da subida)
function drawSlopeIcon(g,t){g.fillStyle='#b8884c';g.strokeStyle='#5a3a1a';g.lineWidth=2;g.beginPath();
  if(t===24){g.moveTo(4,42);g.lineTo(44,42);g.lineTo(44,8);}else{[[4,42],[4,34],[14,34],[14,26],[24,26],[24,18],[34,18],[34,10],[44,10],[44,42]].forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));}
  g.closePath();g.fill();g.save();g.clip();g.strokeStyle='#8a5e2c';g.lineWidth=1.5;for(let yy=14;yy<42;yy+=7){g.beginPath();g.moveTo(0,yy);g.lineTo(48,yy);g.stroke();}g.restore();
  g.strokeStyle='#5a3a1a';g.lineWidth=2;g.stroke();}
function slopeY(t,lx,lz){const o=(t-26)&3,p=o===0?lx:(o===1?1-lx:(o===2?lz:1-lz));return t>=30?(p<.5?.5:1):p;}
// O corpo é um quadrado de lado ~1 bloco (mesmo tamanho usado por hit() nos blocos comuns). Rampas e escadas amostram os 4 cantos desse
// quadrado (a altura é monotônica dentro de cada célula, então o máximo sempre está num canto): o jogador apoia no ponto mais alto sob ele,
// como uma caixa sobre uma ladeira, e não entra mais de lado na rampa (antes só o ponto central era testado).
const PR=.3/S-1e-4,RAMP_PTS=[[-1,-1],[1,-1],[-1,1],[1,1]];
function rampSurface(px,py,pz){let best=null;const y0=Math.floor(py);
  for(const [sx,sz] of RAMP_PTS){const qx=px+sx*PR,qz=pz+sz*PR,xi=Math.floor(qx),zi=Math.floor(qz);
    for(let cy=y0;cy>=y0-1;cy--){const t=get(xi,cy,zi);if(t>=26&&t<=33){const h=cy+slopeY(t,qx-xi,qz-zi);if(h<=py+1.02&&(best===null||h>best))best=h;}}}
  return best;}
// Degrau máximo que dá para subir "andando" por uma rampa/escada (no chão / no ar). Acima disso a ponta alta, as laterais e a parte de baixo
// da rampa funcionam como parede/teto: há rampa cuja superfície, em algum ponto do corpo (dos pés à cabeça), fica mais de "cap" acima dos pés.
const RAMP_STEP=.62,RAMP_AIR=.3;
function rampWall(px,py,pz,cap){if(cap===undefined)cap=P.ground?RAMP_STEP:RAMP_AIR;const y0=Math.floor(py),y1=Math.floor(py+PH);
  for(const [sx,sz] of RAMP_PTS){const qx=px+sx*PR,qz=pz+sz*PR,xi=Math.floor(qx),zi=Math.floor(qz);
    for(let cy=y0;cy<=y1;cy++){const t=get(xi,cy,zi);if(t>=26&&t<=33&&cy+slopeY(t,qx-xi,qz-zi)-py>cap)return true;}}
  return false;}
function placeSlope(r){const it=names[cur];if(inv[it]<=0||!r.prev)return;const[x,y,z]=r.prev;
  if(x<0||z<0||x>=W||z>=D||y<0||y>=H)return;const g=B[idx(x,y,z)];if(g&&g!==8)return;
  const fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),o=Math.abs(fx)>Math.abs(fz)?(fx>0?0:1):(fz>0?2:3);
  B[idx(x,y,z)]=(it===24?26:30)+o;
  if(rampWall(P.x,P.y,P.z,RAMP_STEP)){B[idx(x,y,z)]=0;toast('Sem espaço: você está no lugar da rampa');return;}   // não coloca a rampa dentro do jogador (como nos blocos comuns)
  inv[it]--;renderBar();buildAt(x,y,z);}
function breakSlope(r){const t=B[idx(r.x,r.y,r.z)];if(t<26||t>33)return false;B[idx(r.x,r.y,r.z)]=0;inv[t>=30?25:24]++;renderBar();buildAt(r.x,r.y,r.z);return true;}
function shapeCell(t,x,y,z,v,tp,tc,tu,tf){
  const o=(t-26)&3,st=t>=30,fb=fireB(x,y,z,[0,0,0]);
  const M=(u,yy,w)=>{const a=o===0?[u,w]:(o===1?[1-u,1-w]:(o===2?[w,u]:[1-w,1-u]));return[x+a[0],y+yy,z+a[1]];};
  const cl=q=>Math.min(1,Math.max(0,q));
  const Qd=(P4,ax,sh)=>{const pts=P4.map(p=>M(p[0],p[1],p[2]));for(const i of TRI){const q=pts[i],rx=q[0]-x,ry=q[1]-y,rz=q[2]-z;
    let uu,vv;if(ax===0){uu=rz;vv=ry;}else if(ax===1){uu=rx;vv=rz;}else{uu=rx;vv=ry;}
    tp.push(q[0],q[1],q[2]);const f=v*sh;tc.push(f,f,f);tf.push(fb);
    tu.push((3+.03+cl(uu)*.94)/6,1-3/ATR+(.03+cl(vv)*.94)/ATR);}};
  Qd([[0,0,0],[1,0,0],[1,0,1],[0,0,1]],1,.5);
  if(!st){
    Qd([[0,0,0],[1,1,0],[1,1,1],[0,0,1]],1,1);
    Qd([[1,0,0],[1,1,0],[1,1,1],[1,0,1]],0,.7);
    Qd([[0,0,0],[1,0,0],[1,1,0],[1,1,0]],2,.8);
    Qd([[0,0,1],[1,0,1],[1,1,1],[1,1,1]],2,.8);
  }else{
    Qd([[0,0,0],[0,.5,0],[0,.5,1],[0,0,1]],0,.7);
    Qd([[0,.5,0],[.5,.5,0],[.5,.5,1],[0,.5,1]],1,1);
    Qd([[.5,.5,0],[.5,1,0],[.5,1,1],[.5,.5,1]],0,.75);
    Qd([[.5,1,0],[1,1,0],[1,1,1],[.5,1,1]],1,1);
    Qd([[1,0,0],[1,1,0],[1,1,1],[1,0,1]],0,.7);
    Qd([[0,0,0],[1,0,0],[1,.5,0],[0,.5,0]],2,.8);Qd([[.5,.5,0],[1,.5,0],[1,1,0],[.5,1,0]],2,.8);
    Qd([[0,0,1],[1,0,1],[1,.5,1],[0,.5,1]],2,.8);Qd([[.5,.5,1],[1,.5,1],[1,1,1],[.5,1,1]],2,.8);
  }}
