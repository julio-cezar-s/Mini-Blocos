/* MiniBlocos · Raycast, quebrar/colocar blocos e tryUse */
function ray(){const d=new THREE.Vector3();camera.getWorldDirection(d);const o=camera.position;let prev=null;
  for(let t=0;t<5/S;t+=.04){const px=o.x+d.x*t,py=o.y+d.y*t,pz=o.z+d.z*t,x=Math.floor(px),y=Math.floor(py),z=Math.floor(pz);
    const hl=hatchLidAt(px,py,pz,x,y,z);if(hl)return{x:hl[0],y:hl[1],z:hl[2],prev};   // tampa do alçapão aberto
    const dl=doorLeafHit(px,py,pz);if(dl)return{x:dl[0],y:dl[1],z:dl[2],prev};   // folha de porta aberta
    const gh=gateHitAt(px,py,pz,x,y,z);if(gh)return{x:gh[0],y:gh[1],z:gh[2],prev};   // poste/folha de portão aberto
    const gv=get(x,y,z);if(gv&&gv!==8&&gv!==21&&!(gv>=56&&gv<=59)&&!(gv>=64&&gv<=67))return{x,y,z,prev};if(!prev||prev[0]!==x||prev[1]!==y||prev[2]!==z)prev=[x,y,z];}return null;}
function act(breakIt){const r=ray();if(!r)return;if(breakIt&&r.y===0)return;   // y=0 é o fundo do mundo: indestrutível
  if(!breakIt&&tryUse())return;if(breakIt&&(breakDoor(r)||breakSlope(r)||breakHatch(r)||breakGate(r)))return;if(!breakIt&&(names[cur]===24||names[cur]===25)){placeSlope(r);return;}if(!breakIt&&names[cur]===20){placeDoor(r);return;}if(!breakIt&&names[cur]===51){placeHatch(r);return;}if(!breakIt&&names[cur]===61){placeGate(r);return;}if(!breakIt&&names[cur]===68){toast('Toque num cavalo para selá-lo');return;}
  if(breakIt){const t=B[idx(r.x,r.y,r.z)];B[idx(r.x,r.y,r.z)]=0;if(t===14||t===15)removeFire(r.x,r.y,r.z);if(t===23)furnBroken(r.x+','+r.y+','+r.z);if(t===18){const ck=r.x+','+r.y+','+r.z,ch=chests[ck];if(ch){for(const q in ch)inv[q]+=ch[q];delete chests[ck];}}inv[t]++;if(t===5&&tool!==6&&Math.random()<.12){apples++;toast('🍎 Você achou uma maçã');}renderBar();buildAt(r.x,r.y,r.z);if(t===14||t===15)buildNear(r.x,r.z);waterTouch(r.x,r.y,r.z);wearBlock(t);}
  else if(r.prev){const[x,y,z]=r.prev;if(x<0||y<0||z<0||x>=W||y>=H||z>=D)return;
    if((B[idx(x,y,z)]>=56&&B[idx(x,y,z)]<=59)||(B[idx(x,y,z)]>=64&&B[idx(x,y,z)]<=67)||B[idx(x,y,z)]===21){toast('Feche ou quebre a porta/alçapão/portão antes');return;}
    const t=names[cur];if(inv[t]<=0)return;
    B[idx(x,y,z)]=t;if(hit(P.x,P.y,P.z)){B[idx(x,y,z)]=0;return;}inv[t]--;if(t===15)addLamp(x,y,z);if(t===16)toast('🛏️ Cama colocada: clique direito (ou toque) nela para definir o ponto de retorno e dormir à noite');if(t===18)toast('📦 Baú colocado: clique direito (ou toque) nele para guardar blocos');if(t===22)toast('🔨 Bancada colocada: clique direito (ou toque) para fabricar');if(t===23)toast('🔥 Forno colocado: clique direito (ou toque) para fundir e assar');if(t===14){addFire(x,y,z);toast('🔥 Fogueira colocada: com carne crua, clique direito (ou toque) nela para assar');}renderBar();buildAt(x,y,z);if(t===14||t===15)buildNear(x,z);waterTouch(x,y,z);}}
function tryUse(){return tryCook()||tryBed()||tryChest()||tryDoor()||tryHatch()||tryGate()||tryMount()||tryBench()||tryFurnace();}
