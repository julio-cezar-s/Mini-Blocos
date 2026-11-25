/* MiniBlocos · Cama: ponto de retorno e dormir */
function tryBed(){const r=ray();if(!r||B[idx(r.x,r.y,r.z)]!==16)return false;
  bedPos=[r.x+.5,r.z+.5];
  if(Math.sin(Math.PI*2*(dayT-.25))>.1){toast('🛏️ Ponto de retorno definido. Só dá para dormir à noite');return true;}
  const f=document.getElementById('fade');f.style.opacity='1';toast('😴 Dormindo...');
  setTimeout(()=>{dayT=.27;hp=Math.min(20,hp+8);f.style.opacity='0';toast('☀️ Bom dia! Ponto de retorno definido');},1100);return true;}
