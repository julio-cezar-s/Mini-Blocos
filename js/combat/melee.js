/* MiniBlocos · Ataque corpo a corpo contra animais */
function tint(a,c){a.g.traverse(m=>{if(m.material&&m.material.emissive)m.material.emissive.setHex(c);});}
function hitAnimal(){const now=performance.now();if(now-atkCool<350)return false;
  const d=new THREE.Vector3();camera.getWorldDirection(d);const o=camera.position;let best=null,bt=1e9;
  for(const a of animals){const s=SPEC[a.k],cx=a.x-o.x,cy=a.y+s.hh/S*.5-o.y,cz=a.z-o.z,t=cx*d.x+cy*d.y+cz*d.z;
    if(t<0||t>3.2/S)continue;const px=cx-d.x*t,py=cy-d.y*t,pz=cz-d.z*t,rr=Math.max(s.r,.3)/S+.25;
    if(px*px+py*py+pz*pz<rr*rr&&t<bt){bt=t;best=a;}}
  if(!best)return false;
  const r=ray();if(r&&Math.hypot(r.x+.5-o.x,r.y+.5-o.y,r.z+.5-o.z)<bt-1)return false;
  if(best.k==='horse'&&rideTry(best))return true;   // selar / montar o cavalo (não ataca)
  atkCool=now;const a=best,dm0=TOOLS[tool].dm||1,bn0=TOOLS[tool].bonus||0;a.hp=(a.hp===undefined?AHP[a.k]:a.hp)-dm0;
  a.vy=7;a.flee=2.5;a.mv=true;a.th=Math.atan2(d.x,d.z);a.tt=2.5;a.hit=.25;tint(a,0x771111);
  if(a.hp<=0){killAnimal(a);const dr=DROP[a.k]+bn0;meat+=dr;toast('🍖 +'+dr+' carne');}
  if(TOOLS[tool].dm)wearTool(1);return true;}
