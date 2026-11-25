/* MiniBlocos · Geração do terreno: biomas, cavernas, minérios, rio, árvores, spawn */
// terreno (biomas, cavernas, minérios)
const NETQ=new URLSearchParams(location.search);   // ?sala=CODIGO&seed=N: entrar na sala de um amigo (mesmo terreno; o save local não é lido nem gravado)
let SEED=(NETQ.get('sala')&&Number.isInteger(+NETQ.get('seed'))&&+NETQ.get('seed')>0&&+NETQ.get('seed')<1e7)?+NETQ.get('seed'):Math.floor(Math.random()*900)+1;
const rnd=(x,z,s)=>{let h=(Math.imul(x,374761393)+Math.imul(z,668265263)+Math.imul(s,1274126177))|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;};
const vn=(x,z,s)=>{const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=xf*xf*(3-2*xf),v=zf*zf*(3-2*zf),a=rnd(xi,zi,s),b=rnd(xi+1,zi,s),c=rnd(xi,zi+1,s),d=rnd(xi+1,zi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};
const WL=8,hm=[],bio=[];
for(let x=0;x<W;x++)for(let z=0;z<D;z++){
  const n=vn(x*.04,z*.04,SEED)*.55+vn(x*.09,z*.09,SEED+1)*.3+vn(x*.2,z*.2,SEED+2)*.15;
  let h=7+n*13;const m=vn(x*.03,z*.03,SEED+9);if(m>.6)h+=(m-.6)*45;
  h=Math.max(2,Math.min(H-7,Math.floor(h)));hm.push(h);
  const tp=vn(x*.018,z*.018,SEED+50),b=tp<.36?2:(tp>.64?1:0);bio.push(b);
  const top=h<=WL+1?7:(h>=27?9:(h>=21?3:(b===1?7:(b===2?9:1))));
  for(let y=0;y<=h;y++){
    let t=3;
    if(y===h)t=top;else if(y>=h-3)t=(top===3||(top===9&&h>=27))?3:(top===7?7:2);
    if(false){const r=0;
      }
    const lim=(h>WL+2&&vn(x*.05,z*.05,SEED+40)>.68)?h:h-4;
    if(y>2&&y<=lim){const c1=vn(x*.08+y*.11,z*.08-y*.09,SEED+30),c2=vn(x*.1-y*.1,z*.1+y*.12,SEED+31);
      if(Math.abs(c1-.5)<.065&&Math.abs(c2-.5)<.085)t=0;}
    const cb=vn(x*.07,z*.07,SEED+35);if(cb>.74&&y>3&&y<h-4&&Math.abs(y-9)<(cb-.74)*45)t=0;
    B[idx(x,y,z)]=t;
  }
  for(let y=h+1;y<=WL;y++)B[idx(x,y,z)]=8;
}
// rio (bloco 8 = água)
// veios de minério: [tipo, tentativas, tamanho min, max, altura máx]
for(const [ot,tries,mn,mx,ym] of [[10,260,3,8,30],[11,120,3,6,16],[12,45,2,5,10],[46,18,1,3,8]])for(let k=0;k<tries*AF;k++){
  let x=Math.floor(rnd(k,ot,SEED+80)*W),z=Math.floor(rnd(k,ot+1,SEED+81)*D),y=3+Math.floor(rnd(k,ot+2,SEED+82)*(ym-3));
  const sz=mn+Math.floor(rnd(k,ot+3,SEED+83)*(mx-mn+1));
  for(let s=0;s<sz;s++){if(x>=0&&z>=0&&x<W&&z<D&&y>=1&&y<H&&B[idx(x,y,z)]===3)B[idx(x,y,z)]=ot;
    const r=Math.floor(rnd(k*13+s,ot,SEED+84)*6);if(r===0)x++;else if(r===1)x--;else if(r===2)z++;else if(r===3)z--;else if(r===4)y++;else y--;}
}
const rc=x=>D/2+14*Math.sin(x*.07+1)+4*Math.sin(x*.19);
for(let x=0;x<W;x++)for(let z=0;z<D;z++){
  const d=Math.abs(z-rc(x));if(d>=7)continue;
  const h=hm[x*D+z];
  const nh=d<3?WL-2:Math.max(WL+1,Math.min(h,WL+1+Math.floor((d-3)*2.2)));
  for(let y=0;y<H;y++)B[idx(x,y,z)]=0;
  for(let y=0;y<=nh;y++)B[idx(x,y,z)]=y<nh-3?3:(y<nh?2:(d<4?7:1));
  if(d<3)for(let y=nh+1;y<=WL;y++)B[idx(x,y,z)]=8;
  hm[x*D+z]=nh;
}
// árvores e cactos
for(let x=3;x<W-3;x++)for(let z=3;z<D-3;z++){
  const b=bio[x*D+z],h=hm[x*D+z],tt=B[idx(x,h,z)];
  if(h<=WL+1||h>=27||Math.abs(x-W/2)+Math.abs(z-D/2)<6)continue;
  const r=rnd(x,z,SEED+70);
  if(b===1){if(r<.006&&tt===7){const ch=2+Math.floor(rnd(x,z,SEED+71)*3);for(let y=1;y<=ch;y++)B[idx(x,h+y,z)]=13;}continue;}
  const dens=vn(x*.05,z*.05,SEED+60)>.55?.035:.004;
  if(r>=dens||(tt!==1&&tt!==9))continue;
  const th=4+Math.floor(rnd(x,z,SEED+72)*2);
  for(let y=1;y<=th;y++)B[idx(x,h+y,z)]=4;
  for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)for(let dy=th-1;dy<=th+1;dy++){
    if(Math.abs(dx)+Math.abs(dz)+(dy>th?1:0)>3)continue;
    if(!get(x+dx,h+dy,z+dz))B[idx(x+dx,h+dy,z+dz)]=5;}
}
// leitos de rio e lago: manchas de cascalho e argila
for(let x=1;x<W-1;x++)for(let z=1;z<D-1;z++){
  let yy=WL;if(B[idx(x,yy,z)]!==8)continue;
  while(yy>1&&B[idx(x,yy,z)]===8)yy--;
  const t=B[idx(x,yy,z)];if(t!==7&&t!==2&&t!==1)continue;
  const n=vn(x*.12,z*.12,SEED+120);
  if(n>.64){B[idx(x,yy,z)]=34;if(B[idx(x,yy-1,z)]===2)B[idx(x,yy-1,z)]=34;}
  else if(n<.3){B[idx(x,yy,z)]=35;if(B[idx(x,yy-1,z)]===2||B[idx(x,yy-1,z)]===7)B[idx(x,yy-1,z)]=35;}
}
// abóboras espalhadas na grama (mais comuns em manchas)
for(let x=3;x<W-3;x++)for(let z=3;z<D-3;z++){
  const h=hm[x*D+z];if(h<=WL+1||h>=21||B[idx(x,h,z)]!==1||B[idx(x,h+1,z)]!==0||Math.abs(x-W/2)+Math.abs(z-D/2)<6)continue;
  if(rnd(x,z,SEED+130)<(vn(x*.06,z*.06,SEED+131)>.72?.03:.0012))B[idx(x,h+1,z)]=40;
}
function spawnSpot(){for(let r=0;r<45;r++)for(let a=0;a<12;a++){const x=Math.floor(W/2+Math.cos(a*.52)*r),z=Math.floor(D/2+Math.sin(a*.52)*r);
  for(let y=H-1;y>=0;y--){const t=B[idx(x,y,z)];if(t){if(t!==8&&t!==5&&t!==4&&t!==13&&y>WL+1&&y===hm[x*D+z])return[x+.5,z+.5];break;}}}return[W/2,D/2];}
