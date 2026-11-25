/* MiniBlocos · Bancada de trabalho e receitas */
// bancada de trabalho (receitas)
const RECIPES=[
 {n:'Tábua',out:[6,4],inp:{4:1}},
 {n:'Telha',out:[19,4],inp:{2:4,3:1}},
 {n:'Vidro',out:[17,2],inp:{7:4}},
 {n:'Fogueira',out:[14,1],inp:{4:3,10:1}},
 {n:'Lampião',out:[15,2],inp:{17:1,12:1,10:1}},
 {n:'Cama',out:[16,1],inp:{6:3,5:3}},
 {n:'Baú',out:[18,1],inp:{6:8}},
 {n:'Porta',out:[20,1],inp:{6:6}},
 {n:'Alçapão',out:[51,1],inp:{6:4}},
 {n:'Cerca',out:[60,3],inp:{6:2}},
 {n:'Portão',out:[61,1],inp:{6:3}},
 {n:'Sela',out:[68,1],inp:{42:3,6:2}},
 {n:'Bancada',out:[22,1],inp:{6:4}},
 {n:'Forno',out:[23,1],inp:{3:8}},
 {n:'Rampa',out:[24,4],inp:{6:3}},
 {n:'Escada',out:[25,4],inp:{6:3}},
 {n:'Pedra lapidada',out:[37,4],inp:{3:4}},
 {n:'Pedra musgosa',out:[38,2],inp:{3:2,5:2}},
 {n:'Piso xadrez',out:[39,4],inp:{37:3,10:1}},
 {n:'Feno',out:[41,1],inp:{5:6}},
 {n:'Lã',out:[42,2],inp:{5:4}},
 {n:'Terracota amarela',out:[43,4],inp:{19:4,12:1}},
 {n:'Terracota cinza',out:[44,4],inp:{19:4,10:1}},
 {n:'Terracota laranja',out:[45,4],inp:{19:4,11:1}},
 {n:'Bloco de ferro',out:[47,1],inp:{11:4}},
 {n:'Bloco de ouro',out:[48,1],inp:{12:4}},
 {n:'Bloco de carvão',out:[49,1],inp:{10:4}},
 {n:'Bloco de diamante',out:[50,1],inp:{46:4}},
 {n:'Flechas',arrow:8,inp:{4:1,3:1}}];
let craftOpen=false,craftTab='pos';
const canCraft=r=>{
  if(r.tool!==undefined&&OWN[r.tool])return false;   // você já possui essa ferramenta
  if(r.repair!==undefined&&!(OWN[r.repair]&&TD[r.repair]>0&&TD[r.repair]<TOOLS[r.repair].mx))return false;
  for(const k in r.inp)if((inv[k]||0)<r.inp[k])return false;return true;};
function doCraft(r){if(!canCraft(r))return;for(const k in r.inp)inv[k]-=r.inp[k];
  if(r.tool!==undefined){OWN[r.tool]=true;TD[r.tool]=TOOLS[r.tool].mx||0;TWARN[r.tool]=false;toast('🔨 '+TOOLS[r.tool].n+' fabricada!');setTool(tool===0?r.tool:tool);}
  else if(r.repair!==undefined){TD[r.repair]=TOOLS[r.repair].mx;TWARN[r.repair]=false;toast('🔧 '+TOOLS[r.repair].n+' consertada');setTool(tool);}
  else if(r.arrow){arrows+=r.arrow;setTool(tool);}else inv[r.out[0]]+=r.out[1];renderBar();renderCraft();}
// todas as receitas: blocos, ferramentas/utensílios e consertos das ferramentas que você tem
const allRecipes=()=>RECIPES.map(r=>Object.assign({cat:r.arrow?'util':'bloc'},r)).concat(TOOL_RECIPES,repairRecipes());
const CTABS=[['pos','✅ Posso fazer'],['ferr','⛏️ Ferramentas'],['rep','🔧 Consertar'],['bloc','🧱 Blocos'],['todos','Tudo']];
const inTab=(r,t)=>t==='todos'||(t==='pos'?canCraft(r):(t==='ferr'?(r.cat==='ferr'||r.cat==='util'):r.cat===t));
function renderCraft(){const box=document.getElementById('crlist');box.innerHTML='';
  const all=allRecipes(),n=all.filter(canCraft).length;
  const sum=document.createElement('div');sum.className='csum';sum.textContent=n?('Com o que você tem agora dá para fabricar '+n+' '+(n===1?'item':'itens')+'.'):'Com o que você tem agora ainda não dá para fabricar nada: junte mais blocos e minérios.';box.appendChild(sum);
  const tabs=document.createElement('div');tabs.className='ctabs';
  CTABS.forEach(c=>{const b=document.createElement('div');b.className='ctab'+(craftTab===c[0]?' on':'');b.textContent=c[1];b.onclick=()=>{craftTab=c[0];renderCraft();};tabs.appendChild(b);});box.appendChild(tabs);
  const list=all.filter(r=>inTab(r,craftTab)).map(r=>[r,canCraft(r)]).sort((a,b)=>b[1]-a[1]);
  if(!list.length){const e=document.createElement('div');e.className='csum';e.textContent=craftTab==='rep'?'Nenhuma ferramenta danificada para consertar.':'Nada nesta aba com o que você tem agora.';box.appendChild(e);}
  list.forEach(p=>{const r=p[0],ok=p[1],row=document.createElement('div');row.className='cr'+(ok?' ok':'');
    const ti=r.tool!==undefined?r.tool:r.repair,hasT=ti!==undefined;
    const out=hasT?'<div class="oi">'+ICONS[ti]+'</div>':(r.arrow?'<div class="oi" style="font-size:30px;text-align:center;line-height:40px">🏹</div>':'<div class="oi">'+cube(r.out[0])+'</div>');
    let ins='';for(const k in r.inp){const have=inv[k]||0;ins+='<span class="ci">'+cube(+k)+'<b class="'+(have>=r.inp[k]?'':'no')+'">'+have+'/'+r.inp[k]+'</b></span>';}
    const info=r.tool!==undefined?'<br><span style="font-size:11px;opacity:.7">'+toolInfo(r.tool)+'</span>':'';
    const btn=r.tool!==undefined&&OWN[r.tool]?'Possui':(r.repair!==undefined?'Consertar':'Fazer');
    row.innerHTML=out+'<div class="tx"><b>'+r.n+(r.arrow?' ×'+r.arrow:(r.out&&r.out[1]>1?' ×'+r.out[1]:''))+'</b>'+info+'<br>'+ins+'</div><div class="cb'+(ok?'':' off')+'">'+btn+'</div>';
    row.querySelector('.cb').onclick=()=>doCraft(r);box.appendChild(row);});}
function openCraft(){craftOpen=true;document.getElementById('craft').style.display='flex';if(locked)document.exitPointerLock();if(isTouch)playing=false;renderCraft();}
function closeCraft(){craftOpen=false;document.getElementById('craft').style.display='none';if(isTouch)playing=msg.style.display==='none';else lockPointer();}
document.getElementById('cx3').onclick=()=>{if(craftOpen)closeCraft();};
function tryBench(){const r=ray();if(!r||B[idx(r.x,r.y,r.z)]!==22)return false;openCraft();return true;}
