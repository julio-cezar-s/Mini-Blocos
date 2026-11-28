/* MiniBlocos · Estado do jogador (P), tamanho e colisão */
// jogador
const SP0=spawnSpot();const P={x:SP0[0],y:0,z:SP0[1],vx:0,vy:0,vz:0,ground:false,yaw:0,pitch:0};
for(let y=H-1;y>=0;y--)if(get(Math.floor(P.x),y,Math.floor(P.z))){P.y=y+1.01;break;}
if(SV&&SV.p){const q=SV.p,num=v=>typeof v==='number'&&isFinite(v);   // posição salva só vale se for válida e estiver dentro do mundo
  if([q.x,q.y,q.z,q.yaw,q.pitch].every(num)&&q.x>=0&&q.x<W&&q.z>=0&&q.z<D&&q.y>-5&&q.y<H+5){P.x=q.x;P.y=q.y;P.z=q.z;P.yaw=q.yaw;P.pitch=q.pitch;}}
const S=.6,PH=1.79/S,EY=1.6/S; // S = tamanho do bloco (menor = blocos menores)
const PRAD=.35;   // meia-largura do jogador, em blocos
function hit(px,py,pz){const r=PRAD;
  for(let x=Math.floor(px-r);x<=Math.floor(px+r);x++)for(let y=Math.floor(py);y<=Math.floor(py+PH);y++)for(let z=Math.floor(pz-r);z<=Math.floor(pz+r);z++)if(solid(x,y,z))return true;return false;}
