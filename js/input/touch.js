/* MiniBlocos · Controles de toque (botões, olhar, quebrar/colocar) */
// toque
const tk={f:0,s:0};let placeMode=false;
function hold(id,fn){const e=document.getElementById(id);
  e.addEventListener('touchstart',ev=>{ev.preventDefault();fn(1);},{passive:false});
  e.addEventListener('touchend',ev=>{ev.preventDefault();fn(0);},{passive:false});
  e.addEventListener('touchcancel',ev=>{ev.preventDefault();fn(0);},{passive:false});}
const dpad={bu:0,bd:0,bl:0,br:0};const dpadUpdate=()=>{tk.f=dpad.bu-dpad.bd;tk.s=dpad.br-dpad.bl;};
let sprint=false,lastUp=0;
hold('bu',v=>{if(v){const n=Date.now();sprint=n-lastUp<350;lastUp=sprint?0:n;}else sprint=false;dpad.bu=v;dpadUpdate();});
const bm=document.getElementById('bm');
bm.addEventListener('touchstart',e=>{e.preventDefault();placeMode=!placeMode;bm.textContent=placeMode?'Colocar':'Quebrar';},{passive:false});
let lt=null,moved=0,t0=0,mtm=0;
cv.addEventListener('touchstart',e=>{if(!playing)return;const t=e.changedTouches[0];lt={x:t.clientX,y:t.clientY,id:t.identifier};moved=0;t0=Date.now();if(tool===9&&arrows>0){drawing=true;drawT=0;}if(!placeMode&&tool!==4&&tool!==9&&tool!==15){clearTimeout(mtm);mtm=setTimeout(()=>{if(lt&&moved<14)mining=true;},200);}});
cv.addEventListener('touchmove',e=>{if(!lt)return;for(const t of e.changedTouches)if(t.identifier===lt.id){
  const dx=t.clientX-lt.x,dy=t.clientY-lt.y;moved+=Math.abs(dx)+Math.abs(dy);if(moved>=14){mining=false;clearTimeout(mtm);}
  P.yaw-=dx*.005*ZS();P.pitch=Math.max(-1.55,Math.min(1.55,P.pitch-dy*.005*ZS()));lt.x=t.clientX;lt.y=t.clientY;}});
cv.addEventListener('touchend',()=>{clearTimeout(mtm);mining=false;const tap=lt&&moved<12&&Date.now()-t0<300;
  if(tool===9&&tap){drawing=false;drawT=0;}fireBow();   // toque curto com o arco = usar/colocar; segurar = atirar
  if(tap){if(tool===15){if(!tryUse())fishUse();}else if(tool===4){if(!tryUse())bucketUse();}else if(placeMode)act(false);else if(tool===9||!hitAnimal())tryUse();}lt=null;});
cv.addEventListener('touchcancel',()=>{clearTimeout(mtm);mining=false;drawing=false;drawT=0;lt=null;});
