/* MiniBlocos · Mensagem inicial, pointer lock, teclado e mouse */
const msg=document.getElementById('msg');
const isTouch=matchMedia('(pointer:coarse)').matches;
let locked=false,playing=false;
msg.onclick=()=>{if(isTouch){playing=true;msg.style.display='none';document.getElementById('touch').style.display='block';}else lockPointer();};
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===cv;playing=locked;msg.style.display=(locked||invOpen||mapOpen||chestOpen||craftOpen||furnOpen)?'none':'flex';});
addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyE'&&chestOpen)closeChest();if(e.code==='KeyE'&&craftOpen)closeCraft();if(e.code==='KeyE'&&furnOpen)closeFurn();if(e.code==='KeyM'&&(playing||mapOpen))toggleMap();if(e.code==='KeyF'&&playing)eat();if(e.code==='KeyE'&&(playing||invOpen))toggleInv();if(e.code==='KeyQ'&&playing)cycleTool(1);if(e.code==='KeyR'&&playing){const i=ALL.indexOf(names[cur]);let j=(i+1)%ALL.length;for(let q=0;q<ALL.length&&names.includes(ALL[j])&&ALL[j]!==names[cur];q++)j=(j+1)%ALL.length;names[cur]=ALL[j];renderBar();}const n=parseInt(e.key);if(n>=1&&n<=6)pick(n-1);if(e.code==='Space')e.preventDefault();});
addEventListener('keyup',e=>keys[e.code]=false);
addEventListener('mousemove',e=>{if(!locked)return;P.yaw-=e.movementX*.0025*ZS();P.pitch=Math.max(-1.55,Math.min(1.55,P.pitch-e.movementY*.0025*ZS()));});
addEventListener('wheel',e=>{if(playing)pick(cur+(e.deltaY>0?1:-1));});
addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('mousedown',e=>{if(!locked)return;if(tool===15){if(!tryUse())fishUse();return;}if(tool===9){if(e.button===0){if(arrows>0){drawing=true;drawT=0;}else toast('Sem flechas');}else if(e.button===2)act(false);return;}if(tool===4){if(e.button===2&&tryUse())return;bucketUse();return;}if(e.button===0){if(hitAnimal())return;mining=true;}else if(e.button===2)act(false);});
addEventListener('mouseup',()=>{mining=false;fireBow();});
// --- pointer lock robusto: se o navegador recusar, a tela inicial volta e dá para clicar de novo ---
const panelOpen=()=>invOpen||mapOpen||chestOpen||craftOpen||furnOpen;
function showStart(){locked=false;playing=false;if(!panelOpen())msg.style.display='flex';}
function lockPointer(){
  try{const p=cv.requestPointerLock();if(p&&p.catch)p.catch(showStart);}catch(e){showStart();}
  setTimeout(()=>{if(!locked&&!panelOpen()&&msg.style.display==='none')showStart();},700);}
document.addEventListener('pointerlockerror',showStart);
// --- ao perder o foco da janela, solta teclas e ações em andamento ---
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;mining=false;tk.f=0;tk.s=0;});
