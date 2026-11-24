/* MiniBlocos · Baú: guardar e pegar itens */
// baú, cama e uso de blocos
let chestOpen=false,chestKey=null,bedPos=null;const chests={};
function renderChest(){const c=chests[chestKey],cg=document.getElementById('cgrid'),ig=document.getElementById('igrid');cg.innerHTML='';ig.innerHTML='';
  const mkI=(box,t,n,fn)=>{const d=document.createElement('div');d.className='it';d.innerHTML='<i>'+nm[t]+'</i>'+cube(t)+'<b>'+n+'</b>';d.onclick=fn;box.appendChild(d);};
  for(const k in c)if(c[k]>0)mkI(cg,+k,c[k],()=>{c[k]--;inv[k]++;renderBar();renderChest();});
  ALL.forEach(t=>{if(inv[t]>0)mkI(ig,t,inv[t],()=>{inv[t]--;c[t]=(c[t]||0)+1;renderBar();renderChest();});});}
function openChest(key){chestKey=key;if(!chests[key])chests[key]={};chestOpen=true;document.getElementById('chest').style.display='flex';
  if(locked)document.exitPointerLock();if(isTouch)playing=false;renderChest();}
function closeChest(){chestOpen=false;document.getElementById('chest').style.display='none';if(isTouch)playing=msg.style.display==='none';else lockPointer();}
document.getElementById('cx2').onclick=()=>{if(chestOpen)closeChest();};
document.getElementById('putall').onclick=()=>{const c=chests[chestKey];ALL.forEach(t=>{if(inv[t]>0){c[t]=(c[t]||0)+inv[t];inv[t]=0;}});renderBar();renderChest();};
document.getElementById('takeall').onclick=()=>{const c=chests[chestKey];for(const k in c){inv[k]+=c[k];c[k]=0;}renderBar();renderChest();};
function tryChest(){const r=ray();if(!r||B[idx(r.x,r.y,r.z)]!==18)return false;openChest(r.x+','+r.y+','+r.z);return true;}
