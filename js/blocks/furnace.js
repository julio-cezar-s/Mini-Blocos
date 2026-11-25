/* MiniBlocos · Forno: fundir e assar, combustível */
// forno: funde e assa (combustível: carvão, tábua ou madeira)
const SMELT=[{n:'Areia → Vidro',i:7,o:17,on:'Vidro'},{n:'Terra → Telha',i:2,o:19,on:'Telha'},{n:'Madeira → Carvão',i:4,o:10,on:'Carvão'},{n:'Argila → Tijolo',i:35,o:36,on:'Tijolo'},{n:'Carne crua → assada',meat:1,on:'carne assada'}];
let furnOpen=false,furnKey=null,fuelLeft=0;const furns={};
const fuelTotal=()=>fuelLeft+inv[10]*8+inv[6]+inv[4]*2;
function useFuel(n){while(n>0){if(fuelLeft<=0){if(inv[10]>0){inv[10]--;fuelLeft=8;}else if(inv[6]>0){inv[6]--;fuelLeft=1;}else if(inv[4]>0){inv[4]--;fuelLeft=2;}else return false;}const u=Math.min(fuelLeft,n);fuelLeft-=u;n-=u;}return true;}
function startSmelt(s,all){if(furns[furnKey]){toast('O forno está ocupado');return;}
  const have=s.meat?meat:inv[s.i];if(have<=0){toast('Sem material para fundir');return;}
  let n=all?have:1;if(s.meat)meat-=n;else inv[s.i]-=n;
  const av=fuelTotal();
  if(av<=0){if(s.meat)meat+=n;else inv[s.i]+=n;toast('Sem combustível: use carvão, tábua ou madeira');return;}
  if(av<n){const back=n-av;if(s.meat)meat+=back;else inv[s.i]+=back;n=av;}
  useFuel(n);furns[furnKey]={t:1.5*n+1,n,s};renderBar();renderFurn();}
function furnTick(dt){for(const k in furns){const j=furns[k];j.t-=dt;
  if(j.t<=0){if(j.s.meat)cooked+=j.n;else inv[j.s.o]+=j.n;delete furns[k];renderBar();toast('🔥 Forno: '+j.n+'× '+j.s.on+' pronto');if(furnOpen)renderFurn();}}
  if(furnOpen){const j=furns[furnKey];document.getElementById('furnp').textContent='Combustível disponível: '+fuelTotal()+(j?' · Fundindo '+j.n+'… '+Math.ceil(j.t)+'s':' · Livre');}}
function renderFurn(){const box=document.getElementById('fulist');box.innerHTML='';
  SMELT.forEach(s=>{const have=s.meat?meat:inv[s.i],row=document.createElement('div');row.className='cr';
    row.innerHTML='<div class="tx"><b>'+s.n+'</b><br><span class="ci">Você tem: '+have+'</span></div><div class="cb'+(have>0?'':' off')+'">×1</div><div class="cb'+(have>0?'':' off')+'">Todos</div>';
    const bs=row.querySelectorAll('.cb');bs[0].onclick=()=>startSmelt(s,false);bs[1].onclick=()=>startSmelt(s,true);box.appendChild(row);});}
function openFurn(key){furnKey=key;furnOpen=true;document.getElementById('furn').style.display='flex';if(locked)document.exitPointerLock();if(isTouch)playing=false;renderFurn();}
function closeFurn(){furnOpen=false;document.getElementById('furn').style.display='none';if(isTouch)playing=msg.style.display==='none';else lockPointer();}
document.getElementById('cx4').onclick=()=>{if(furnOpen)closeFurn();};
function tryFurnace(){const r=ray();if(!r||B[idx(r.x,r.y,r.z)]!==23)return false;openFurn(r.x+','+r.y+','+r.z);return true;}
// persistência dos trabalhos em andamento (o objeto SMELT vira índice no save)
function furnsToSave(){const o={};for(const k in furns){const j=furns[k],si=SMELT.indexOf(j.s);if(si>=0)o[k]={t:j.t,n:j.n,si};}return o;}
function furnsFromSave(o){if(!o||typeof o!=='object')return;
  for(const k in o){const j=o[k],m=/^(\d+),(\d+),(\d+)$/.exec(k);if(!m||!j||typeof j!=='object')continue;
    const s=SMELT[j.si],n=Math.min(Math.floor(j.n),9999),t=j.t;
    if(!s||!(n>=1)||typeof t!=='number'||!isFinite(t))continue;
    const x=+m[1],y=+m[2],z=+m[3];
    if(x>=W||y>=H||z>=D||B[idx(x,y,z)]!==23){if(s.meat)meat+=n;else inv[s.i]+=n;continue;}   // o forno não existe mais: devolve o material
    furns[k]={t:Math.min(Math.max(t,0),1.5*n+1),n,s};}}
// quebrar o forno no meio de uma fundição: devolve o material (o combustível já foi queimado)
function furnBroken(key){const j=furns[key];if(!j)return;if(j.s.meat)meat+=j.n;else inv[j.s.i]+=j.n;delete furns[key];renderBar();toast('Forno quebrado: material devolvido');}
