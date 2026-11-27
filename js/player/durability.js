/* MiniBlocos · Materiais das ferramentas, durabilidade e receitas de ferramentas/utensílios */
// ---- materiais: madeira, pedra, ferro, ouro e diamante para pá, machado, picareta e espada ----
const ST={sh:TOOLS[1].m.slice(),ax:TOOLS[2].m.slice(),pk:TOOLS[3].m.slice()};
const BASEI=[ICONS[1],ICONS[2],ICONS[3],ICONS[5]];   // ícones originais: pá, machado, picareta, espada
// ids = índices em TOOLS [pá, machado, picareta, espada] · sp = velocidade ao minerar · mx = durabilidade · ax/sw = dano do machado/espada · bn = bônus de carne da espada
// mat = bloco/minério usado · cost = quantidade do material por [pá, machado, picareta, espada] · hnd = tábuas do cabo
const TIERS=[
 {n:'madeira',sp:4,mx:60,ids:[1,2,3,5],hc:'#a8793b',sc:'#c9a56a',ax:2,sw:3,bn:1,mat:6,cost:[2,3,3,2],hnd:[0,0,0,0]},
 {n:'pedra',sp:5,mx:130,ids:[16,17,18,19],hc:'#8d8d8d',sc:'#a9a9a9',ax:3,sw:4,bn:1,mat:3,cost:[1,3,3,2],hnd:[2,2,2,1]},
 {n:'ferro',sp:8,mx:250,ids:[10,11,7,12],hc:'#d7dde3',sc:'#e8eef3',ax:4,sw:5,bn:2,mat:11,cost:[1,3,3,2],hnd:[2,2,2,1]},
 {n:'ouro',sp:12,mx:32,ids:[20,21,22,23],hc:'#f2c230',sc:'#f6d466',ax:2,sw:3,bn:3,mat:12,cost:[1,3,3,2],hnd:[2,2,2,1]},
 {n:'diamante',sp:10,mx:800,ids:[24,25,26,27],hc:'#4fe3e8',sc:'#8af2f4',ax:5,sw:7,bn:3,mat:46,cost:[1,3,3,2],hnd:[2,2,2,1]}];
TIERS.forEach(t=>{const nm=['Pá','Machado','Picareta','Espada'],de=['cava terra, grama, areia, neve, cascalho e argila','corta madeira e abóbora; machuca bem os animais','quebra pedra, minérios, tijolo e metal','dano alto e mais carne dos animais'];
  const props=[{m:ST.sh,sp:t.sp},{m:ST.ax,sp:t.sp,dm:t.ax},{m:ST.pk,sp:t.sp},{m:[],dm:t.sw,bonus:t.bn,sw:1}];
  for(let j=0;j<4;j++){const i=t.ids[j];TOOLS[i]=Object.assign({n:nm[j]+' de '+t.n,mx:t.mx,dig:1,d:de[j]+' ('+t.mx+' usos)'},props[j]);
    ICONS[i]=pixToolIcon(j,t.n);}});
// utensílios com durabilidade (0 = infinita): tesoura, lanterna (queima com o tempo), arco (por tiro) e vara (por lançamento)
TOOLS[6].mx=120;TOOLS[6].dig=1;TOOLS[8].mx=300;TOOLS[9].mx=200;TOOLS[15].mx=60;
// posse e durabilidade atual: OWN[i] = possui · TD[i] = durabilidade (0 = infinita, -1 = não possui)
const TOOL_START=[0,1,2,3,5],OWN=TOOLS.map((o,i)=>TOOL_START.includes(i)),TD=TOOLS.map((o,i)=>OWN[i]?(o.mx||0):-1),TWARN=[];
function toolPct(i){const mx=TOOLS[i].mx;return mx?Math.max(0,TD[i])/mx:1;}
function toolBarHTML(i,h){const p=toolPct(i),c=p>.5?'#6c6':(p>.25?'#ec4':'#e55');return '<span style="display:block;height:'+(h||4)+'px;background:#0007;border-radius:2px;margin-top:3px"><span style="display:block;height:100%;width:'+Math.round(p*100)+'%;background:'+c+';border-radius:2px"></span></span>';}
function toolLabel(i){const o=TOOLS[i];let s=(i===9?'Arco ('+arrows+')':o.n);if(o.mx&&TD[i]>0)s+=' <small style="opacity:.7">'+TD[i]+'/'+o.mx+'</small>';return s;}
function cycleTool(dir){let i=tool;for(let k=0;k<TOOLS.length;k++){i=(i+dir+TOOLS.length)%TOOLS.length;if(OWN[i]){setTool(i);return;}}}
// desgaste: ao zerar, a ferramenta quebra e some (fabrique outra na bancada)
function wearTool(n){const o=TOOLS[tool];if(!o.mx||!OWN[tool])return;TD[tool]-=(n||1);
  if(TD[tool]<=0){OWN[tool]=false;TD[tool]=-1;TWARN[tool]=false;toast('💥 '+o.n+' quebrou! Fabrique outra na bancada');setTool(0);return;}
  if(TD[tool]<=o.mx*.15&&!TWARN[tool]){TWARN[tool]=true;toast('⚠️ '+o.n+' está quase quebrando ('+TD[tool]+'/'+o.mx+')');}
  setTool(tool);}
function wearBlock(t){const o=TOOLS[tool];if(!o.dig||!o.mx)return;if(tool===6&&!o.m.includes(t))return;wearTool(o.sw?2:1);}   // a espada gasta o dobro ao quebrar blocos
let lampAcc=0;function toolTick(dt){if(tool===8&&playing){lampAcc+=dt;if(lampAcc>=6){lampAcc=0;wearTool(1);}}}   // a lanterna gasta 1 de durabilidade a cada 6 s acesa
// ---- salvar / restaurar ----
function twToSave(){return{o:OWN.map(v=>v?1:0),d:TD.map(v=>Math.round(v))};}
function twFromSave(s){
  if(s&&typeof s==='object'&&Array.isArray(s.o)&&Array.isArray(s.d)){
    for(let i=0;i<TOOLS.length;i++){const mx=TOOLS[i].mx||0,own=s.o[i]===1||i===0;OWN[i]=own;
      TD[i]=!own?-1:(mx?Math.max(1,Math.min(mx,Number.isFinite(s.d[i])?Math.round(s.d[i]):mx)):0);}}
  else for(let i=0;i<TOOLS.length;i++){OWN[i]=i<=15;TD[i]=OWN[i]?(TOOLS[i].mx||0):-1;}   // save antigo: mantém todas as ferramentas que já existiam
  OWN[0]=true;TD[0]=0;}
// ---- receitas (usadas pela bancada) ----
const TOOL_RECIPES=[];
TIERS.forEach(t=>{for(let j=0;j<4;j++){const inp={};inp[t.mat]=t.cost[j];if(t.mat!==6)inp[6]=t.hnd[j];const rep={};rep[t.mat]=Math.max(1,Math.ceil(t.cost[j]/2));
  TOOL_RECIPES.push({n:TOOLS[t.ids[j]].n,tool:t.ids[j],inp,rep,cat:'ferr'});}});
[[6,{11:2},{11:1}],[4,{11:3},null],[9,{6:3,42:3},{42:1,6:1}],[15,{6:3,42:2},{42:1}],[8,{17:1,12:1,10:1},{10:1}],[13,{11:2,12:1},null],[14,{17:2,11:2,12:1},null]]
  .forEach(a=>TOOL_RECIPES.push({n:TOOLS[a[0]].n,tool:a[0],inp:a[1],rep:a[2],cat:'util'}));
function repairRecipes(){const out=[];for(const r of TOOL_RECIPES){const i=r.tool,mx=TOOLS[i].mx;
  if(r.rep&&mx&&OWN[i]&&TD[i]>0&&TD[i]<mx)out.push({n:'Consertar '+TOOLS[i].n+' ('+TD[i]+'/'+mx+')',repair:i,inp:r.rep,cat:'rep'});}return out;}
function toolInfo(i){const o=TOOLS[i],a=[];if(o.mx)a.push('durabilidade '+o.mx);if(o.sp)a.push('velocidade ×'+o.sp);if(o.dm)a.push('dano '+o.dm);return a.join(' · ');}
