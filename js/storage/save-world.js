/* MiniBlocos · Salvar o mundo (automático e botões) */
// salvar e restaurar estado
function saveWorld(msg){if(noSave)return;
  try{const rle=[];const n=B.length;let i=0;while(i<n){const v=B[i];let c=1;while(i+c<n&&B[i+c]===v&&c<255)c++;rle.push(v,c);i+=c;}
    const u=Uint8Array.from(rle);let str='';for(let k=0;k<u.length;k+=8192)str+=String.fromCharCode.apply(null,u.subarray(k,k+8192));
    localStorage.setItem(SAVE_KEY,JSON.stringify({v:1,w:W,d:D,h:H,seed:SEED,b:btoa(str),p:{x:P.x,y:P.y,z:P.z,yaw:P.yaw,pitch:P.pitch},
      s:{hp,food,air,meat,apples,cooked,dayT,inv,names,cur,tool,bFull,arrows,chests,bedPos,doors,cooks:cooksToSave(),fuelLeft,furns:furnsToSave(),pin:pin,wd:waterToSave(),tw:twToSave()}}));
    if(msg)toast('\ud83d\udcbe Mundo salvo');}
  catch(e){if(msg)toast('N\u00e3o foi poss\u00edvel salvar neste navegador');}}
setInterval(()=>saveWorld(false),15000);
addEventListener('pagehide',()=>saveWorld(false));
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveWorld(false);});
document.getElementById('savenow').onclick=()=>saveWorld(true);
let nwAsk=0;const nwEl=document.getElementById('newworld');
nwEl.onclick=()=>{if(!nwAsk){nwAsk=1;nwEl.textContent='\u26a0\ufe0f Apagar tudo? Toque de novo';setTimeout(()=>{nwAsk=0;nwEl.textContent='\ud83d\uddd1 Novo mundo';},3500);}
  else{noSave=true;try{localStorage.removeItem(SAVE_KEY);}catch(e){}location.reload();}};
// restauração tolerante: cada campo é validado; o que estiver inválido mantém o valor padrão
const _num=(v,d,lo,hi)=>(typeof v==='number'&&isFinite(v))?Math.min(hi,Math.max(lo,v)):d;
const _int=(v,d,lo,hi)=>Math.floor(_num(v,d,lo,hi));
const _has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function restoreState(s){
  if(!s||typeof s!=='object')return;
  hp=_int(s.hp,hp,1,20);food=_int(s.food,food,0,20);air=_num(s.air,air,0,10);
  meat=_int(s.meat,meat,0,99999);apples=_int(s.apples,apples,0,99999);cooked=_int(s.cooked,cooked,0,99999);
  dayT=_num(s.dayT,dayT,0,.999999);arrows=_int(s.arrows,arrows,0,99999);
  if(s.inv&&typeof s.inv==='object')for(const k in s.inv)if(_has(inv,k))inv[k]=_int(s.inv[k],inv[k],0,99999);
  if(Array.isArray(s.names))for(let i=0;i<names.length;i++)if(ALL.includes(s.names[i]))names[i]=s.names[i];
  bFull=!!s.bFull;ICONS[4]=bFull?BF:BE;
  if(s.chests&&typeof s.chests==='object')for(const k in s.chests){const c=s.chests[k];if(!/^\d+,\d+,\d+$/.test(k)||!c||typeof c!=='object')continue;
    const o={};for(const q in c){const v=_int(c[q],0,0,99999);if(v>0&&_has(inv,q))o[q]=v;}chests[k]=o;}
  if(Array.isArray(s.bedPos)&&s.bedPos.length>=2&&s.bedPos.slice(0,2).every(v=>typeof v==='number'&&isFinite(v)))bedPos=[s.bedPos[0],s.bedPos[1]];
  if(Array.isArray(s.doors))for(const d of s.doors)if(d&&Array.isArray(d.cells)&&d.cells.length>0&&d.cells.every(c=>Array.isArray(c)&&c.length===3&&c.every(Number.isInteger)
    &&c[0]>=0&&c[0]<W&&c[1]>=0&&c[1]<H&&c[2]>=0&&c[2]<D&&(B[idx(c[0],c[1],c[2])]===20||B[idx(c[0],c[1],c[2])]===21)))doors.push({cells:d.cells.map(c=>[c[0],c[1],c[2]]),s:d.s===-1?-1:1});
  doors.forEach(d=>rebuildCells(d.cells));   // as malhas foram montadas antes de as portas serem restauradas
  cooksFromSave(s.cooks);fuelLeft=_num(s.fuelLeft,0,0,8);furnsFromSave(s.furns);restorePin(s.pin);waterFromSave(s.wd);
  twFromSave(s.tw);
  pick(_int(s.cur,0,0,names.length-1));setTool(_int(s.tool,0,0,TOOLS.length-1));fallMax=P.y;hudKey='';}
