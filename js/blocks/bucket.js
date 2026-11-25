/* MiniBlocos · Balde: pega e solta água */
// balde: pega e solta água
function rayW(){const d=new THREE.Vector3();camera.getWorldDirection(d);const o=camera.position;let prev=null;
  for(let t=0;t<5/S;t+=.04){const x=Math.floor(o.x+d.x*t),y=Math.floor(o.y+d.y*t),z=Math.floor(o.z+d.z*t),g=get(x,y,z);
    if(g)return{x,y,z,g,prev};if(!prev||prev[0]!==x||prev[1]!==y||prev[2]!==z)prev=[x,y,z];}return null;}
function bucketUse(){const r=rayW();if(!r)return;
  if(!bFull){if(r.g===8){B[idx(r.x,r.y,r.z)]=0;bFull=true;ICONS[4]=BF;setTool(tool);buildAt(r.x,r.y,r.z);waterRefill(r.x,r.y,r.z);}return;}
  if(!r.prev)return;const[x,y,z]=r.prev;
  if(x<0||y<0||z<0||x>=W||y>=H||z>=D)return;
  const g=get(x,y,z);if(g&&g!==8)return;
  B[idx(x,y,z)]=8;bFull=false;ICONS[4]=BE;setTool(tool);buildAt(x,y,z);waterPoured(x,y,z);}
