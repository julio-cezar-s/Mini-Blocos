/* MiniBlocos · Malha dos chunks: faces, minério, água, build/buildAt */
const FACES=[[[1,0,0],[[1,0,0],[1,1,0],[1,1,1],[1,0,1]],.8,1],[[-1,0,0],[[0,0,0],[0,0,1],[0,1,1],[0,1,0]],.8,1],
[[0,1,0],[[0,1,0],[0,1,1],[1,1,1],[1,1,0]],1,0],[[0,-1,0],[[0,0,0],[1,0,0],[1,0,1],[0,0,1]],.5,2],
[[0,0,1],[[0,0,1],[1,0,1],[1,1,1],[0,1,1]],.65,1],[[0,0,-1],[[0,0,0],[0,1,0],[1,1,0],[1,0,0]],.65,1]];
// constantes reaproveitadas na montagem das malhas (antes eram arrays novos a cada face)
const TRI=[0,1,2,0,2,3],WD=W*D,cellV=(x,y,z)=>.9+((x*73856093^y*19349663^z*83492791)>>>0)%100/500;
// a face entre uma célula de tipo t e o vizinho nb fica escondida?  (mesma regra de antes, em forma de função)
const OPQ=(nb,t)=>nb&&nb!==8&&((nb!==17&&nb!==20&&nb!==21&&(nb<60||nb>67)&&(nb<26||nb>33)&&(nb<52||nb>59))||t===nb);
// oclusão ambiente: escurece cantos e encontros de blocos
const AOV=[.55,.72,.88,1],aoF=[1,1,1,1];
const aoOcc=(x,y,z)=>{const b=get(x,y,z);return(b&&b!==8&&b!==17&&b!==20&&b!==21&&(b<60||b>67)&&(b<26||b>33)&&(b<52||b>59))?1:0;};
function aoAt(x,y,z,n,q){const t1=n[0]?1:0,t2=n[2]?1:2,d1=q[t1]*2-1,d2=q[t2]*2-1,bx=x+n[0],by=y+n[1],bz=z+n[2],
  dx1=t1===0?d1:0,dy1=t1===1?d1:0,dy2=t2===1?d2:0,dz2=t2===2?d2:0,
  s1=aoOcc(bx+dx1,by+dy1,bz),s2=aoOcc(bx,by+dy2,bz+dz2),c=aoOcc(bx+dx1,by+dy1+dy2,bz+dz2);
  return AOV[(s1&&s2)?0:3-(s1+s2+c)];}
function buildNear(x,z){for(let cx=Math.max(0,(x-8)>>4);cx<=Math.min(W/CS-1,(x+8)>>4);cx++)for(let cz=Math.max(0,(z-8)>>4);cz<=Math.min(D/CS-1,(z+8)>>4);cz++)buildChunk(cx,cz);}
const CS=16,cmesh={};
const matS=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide});
const matW=new THREE.MeshBasicMaterial({map:waterTex,vertexColors:true,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false});
function geo(p,c,u,f){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));if(u)g.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));if(f)g.setAttribute('fb',new THREE.Float32BufferAttribute(f,1));return g;}
function buildChunk(cx,cz){fireChunk(cx,cz);
  const p=[],c=[],wp=[],wc=[],wu=[],tp=[],tc=[],tu=[],pf=[],wf=[],tf=[];
  for(let y=0;y<H;y++)for(let z=cz*CS;z<cz*CS+CS;z++)for(let x=cx*CS;x<cx*CS+CS;x++){
    const t=B[idx(x,y,z)];if(!t)continue;
    if(t>=26&&t<=33){shapeCell(t,x,y,z,cellV(x,y,z),tp,tc,tu,tf);continue;}
    if(t>=52&&t<=59){hatchCell(t,x,y,z,cellV(x,y,z),tp,tc,tu,tf);continue;}
    if((t===20||t===21)&&doorCell(t,x,y,z,cellV(x,y,z),tp,tc,tu,tf))continue;
    if(t===60){fenceCell(t,x,y,z,cellV(x,y,z),tp,tc,tu,tf);continue;}
    if(t>=62&&t<=67){gateCell(t,x,y,z,cellV(x,y,z),tp,tc,tu,tf);continue;}
    // célula totalmente cercada por blocos opacos: nenhuma face visível (a maioria das células do subsolo)
    if(t!==8&&x>0&&x<W-1&&y>0&&y<H-1&&z>0&&z<D-1){const i0=x+z*W+y*WD;
      if(OPQ(B[i0+1],t)&&OPQ(B[i0-1],t)&&OPQ(B[i0+W],t)&&OPQ(B[i0-W],t)&&OPQ(B[i0+WD],t)&&OPQ(B[i0-WD],t))continue;}
    const v=cellV(x,y,z);   // variação de brilho por bloco (só calculada para células com alguma face visível)
    for(let fi=0;fi<6;fi++){const FC=FACES[fi],n=FC[0],cs=FC[1],sh=FC[2],ci=FC[3];
      const nb=get(x+n[0],y+n[1],z+n[2]);if(t===8?nb!==0:(nb&&nb!==8&&((nb!==17&&nb!==20&&nb!==21&&(nb<60||nb>67)&&(nb<26||nb>33)&&(nb<52||nb>59))||t===nb)))continue;if(y===0&&n[1]<0)continue;
      const k=col[t][ci],f=sh*v,pp=t===8?wp:p,cc=t===8?wc:c,dy=t===8?-.12:0;const fb=fireB(x,y,z,n);
      if(t!==8){const tile=TILE(t,ci),side=n[1]===0;
        for(let k=0;k<4;k++)aoF[k]=aoAt(x,y,z,n,cs[k]);
        for(const i of TRI){const q=cs[i],ao=aoF[i];tp.push(x+q[0],y+q[1],z+q[2]);tc.push(f*ao,f*ao,f*ao);tf.push(fb);
          const u=side?(n[0]!==0?q[2]:q[0]):q[0],w=side?q[1]:q[2];tu.push(((tile%6)+.03+u*.94)/6,1-(Math.floor(tile/6)+1)/ATR+(.03+w*.94)/ATR);}
        continue;}
      if(t>=10&&t<=12){const base=col[3][ci],sp=ORE[t],c0=cs[0],c1=cs[1],c3=cs[3];
        for(let a=0;a<4;a++)for(let b=0;b<4;b++){const k2=rnd(x*7+a+ci*3,z*11+b+y*5,SEED+t+n[0]*2+n[1]*3+n[2]*5)<.4?sp:base;
          const Q=(u,w)=>[x+c0[0]+u*(c1[0]-c0[0])+w*(c3[0]-c0[0]),y+c0[1]+u*(c1[1]-c0[1])+w*(c3[1]-c0[1]),z+c0[2]+u*(c1[2]-c0[2])+w*(c3[2]-c0[2])];
          const qq=[Q(a/4,b/4),Q((a+1)/4,b/4),Q((a+1)/4,(b+1)/4),Q(a/4,(b+1)/4)];
          for(const m2 of TRI){p.push(qq[m2][0],qq[m2][1],qq[m2][2]);c.push(k2.r*f,k2.g*f,k2.b*f);pf.push(fb);}}
        continue;}
      for(const i of TRI){const q=cs[i];pp.push(x+q[0],y+q[1]+(q[1]?dy:0),z+q[2]);cc.push(k.r*f,k.g*f,k.b*f);(t===8?wf:pf).push(fb);if(t===8)wu.push(n[1]?(x+q[0])*.25:(x+q[0]+z+q[2])*.25,n[1]?(z+q[2])*.25:(y+q[1])*.25);}
    }
  }
  const o=cmesh[cx+','+cz]||(cmesh[cx+','+cz]={});
  if(o.m){scene.remove(o.m);o.m.geometry.dispose();}
  if(o.w){scene.remove(o.w);o.w.geometry.dispose();}
  if(o.t){scene.remove(o.t);o.t.geometry.dispose();}
  o.m=p.length?new THREE.Mesh(geo(p,c,null,pf),matS):null;if(o.m)scene.add(o.m);
  o.w=wp.length?new THREE.Mesh(geo(wp,wc,wu,wf),matW):null;if(o.w)scene.add(o.w);
  o.t=tp.length?new THREE.Mesh(geo(tp,tc,tu,tf),matT):null;if(o.t)scene.add(o.t);fireCand=null;
}
function build(){for(let cx=0;cx<W/CS;cx++)for(let cz=0;cz<D/CS;cz++)buildChunk(cx,cz);}
function buildAt(x,y,z){const cx=x>>4,cz=z>>4,lx=x&15,lz=z&15;buildChunk(cx,cz);
  if(lx===0&&cx>0)buildChunk(cx-1,cz);if(lx===15&&cx<W/CS-1)buildChunk(cx+1,cz);
  if(lz===0&&cz>0)buildChunk(cx,cz-1);if(lz===15&&cz<D/CS-1)buildChunk(cx,cz+1);}
