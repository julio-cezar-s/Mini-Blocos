/* MiniBlocos · Corda (item 69): amarre um animal e puxe-o junto com você.
   Uso: selecione a Corda na barra, deixe a ferramenta em "Mão" e toque/clique no animal (de novo para soltar).
   Cada animal amarrado gasta 1 corda (volta ao soltar). Máximo de 3 animais ao mesmo tempo. Receita na bancada: 3 Feno = 2 Cordas.
   Predadores e nômades não aceitam corda. Os animais amarrados não são salvos nem aparecem no multijogador (como a sela).
   Este arquivo se registra sozinho (item, receita, ícone): carregue DEPOIS de js/core/loop.js (junto do sound.js) e ANTES de js/main.js. */
(function(){
const ID=69,LEN=5,MAXL=3;
ALL.push(ID);nm[ID]='Corda';inv[ID]=2;
RECIPES.push({n:'Corda',out:[ID,2],inp:{41:3}});

// ícone: rolo de corda
(function(){const cv=document.createElement('canvas');cv.width=cv.height=48;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.lineCap='round';
  const ring=(r)=>{g.save();g.translate(22,25);g.scale(1,.78);
    g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.lineWidth=8;g.strokeStyle='#4a3012';g.stroke();
    g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.lineWidth=5;g.strokeStyle='#c9a45c';g.stroke();
    g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.lineWidth=1.5;g.strokeStyle='#e8d08e';g.setLineDash([3,4]);g.stroke();g.restore();};
  ring(16);ring(10);ring(4);
  g.beginPath();g.moveTo(34,36);g.quadraticCurveTo(42,38,44,45);g.lineWidth=6;g.strokeStyle='#4a3012';g.stroke();
  g.beginPath();g.moveTo(34,36);g.quadraticCurveTo(42,38,44,45);g.lineWidth=3.5;g.strokeStyle='#c9a45c';g.stroke();
  cCache[ID]=cv.toDataURL();})();

// ---------- amarrar / soltar ----------
const lead=[],geo=new THREE.BoxGeometry(.05,.05,1),rmat=new THREE.MeshBasicMaterial({color:0x9b7b45});
const click=f=>{if(typeof SND!=='undefined')SND.tone({f:f,f2:f*.7,d:.08,v:.25,type:'triangle'});};
const canLeash=a=>{const s=SPEC[a.k];return !!s&&!s.pred&&a.k!=='nomad';};
function attach(a){
  if(lead.length>=MAXL){toast('Você já está puxando '+MAXL+' animais');return;}
  if(inv[ID]<=0){toast('Sem cordas! Faça na bancada: 3 Feno');return;}
  inv[ID]--;a.leash=true;const m=new THREE.Mesh(geo,rmat);m.frustumCulled=false;scene.add(m);lead.push({a,m});
  renderBar();click(420);toast('🪢 Animal amarrado! Toque nele de novo para soltar');}
function release(a,refund){
  const i=lead.findIndex(l=>l.a===a);if(i<0)return;scene.remove(lead[i].m);lead.splice(i,1);a.leash=false;a.flee=0;
  if(refund)inv[ID]++;renderBar();}
function use(){
  const a=pickAnimal();if(!a)return false;
  if(!canLeash(a)){toast('Esse bicho não aceita corda');return true;}
  if(a.leash){release(a,true);click(300);toast('Animal solto');}else attach(a);
  return true;}
const holding=()=>names[cur]===ID&&tool===0&&!mounted;
const _ha=hitAnimal;hitAnimal=function(){if(holding()&&use())return true;return _ha();};
const _act=act;act=function(b){if(!b&&holding()){if(!use())toast('Aponte a corda para um animal');return;}_act(b);};
const _rs=respawn;respawn=function(){while(lead.length)release(lead[0].a,true);_rs.apply(this,arguments);};

// ---------- o animal amarrado segue e é puxado quando a corda estica ----------
const _updA=updA;
updA=function(a,dt){
  if(a.leash&&!a.rider){
    const s=SPEC[a.k],r=s.r/S,hh=s.hh/S,dx=P.x-a.x,dz=P.z-a.z,dist=Math.hypot(dx,dz);
    if(dist>20||Math.abs(P.y-a.y)>14){   // ficou longe demais: aparece atrás do jogador
      const sp=safeSpawn(P.x+Math.sin(P.yaw)*3,P.z+Math.cos(P.yaw)*3);if(sp){a.x=sp.x;a.y=sp.y;a.z=sp.z;a.vy=0;}
    }else{
      a.al=0;a.gz=false;a.tt=Math.max(a.tt||0,1);a.flee=dist>LEN*.8?.25:0;   // longe: trota para alcançar
      if(dist>3.2){a.th=Math.atan2(dx,dz);a.mv=true;}else if(dist<2.4)a.mv=false;
      if(dist>LEN){   // corda esticada: puxa o animal (sem atravessar blocos)
        const pull=(dist-LEN)*Math.min(1,dt*5),nx=a.x+dx/dist*pull,nz=a.z+dz/dist*pull;
        if(!hitB(nx,a.y,a.z,r,hh)&&(s.swim||!wet(nx,a.z)))a.x=nx;
        if(!hitB(a.x,a.y,nz,r,hh)&&(s.swim||!wet(a.x,nz)))a.z=nz;}
    }
  }
  _updA(a,dt);
};

// ---------- desenha a corda e limpa animais que sumiram ----------
function tickLeash(){
  const cy=Math.cos(P.yaw),sy=Math.sin(P.yaw);
  for(let i=lead.length-1;i>=0;i--){const l=lead[i],a=l.a;
    if(!animals.includes(a)){scene.remove(l.m);lead.splice(i,1);a.leash=false;inv[ID]++;renderBar();continue;}   // morreu/sumiu: a corda volta
    if(a.rider){release(a,true);continue;}                                                                       // montou no cavalo amarrado
    const s=SPEC[a.k],sx=P.x+cy*.45-sy*.5,sz=P.z-sy*.45-cy*.5,sY=P.y+PH*.5,
      ex=a.x+Math.sin(a.rot)*s.b[2]/S*.45,ez=a.z+Math.cos(a.rot)*s.b[2]/S*.45,ey=a.y+s.hh/S*.72,
      len=Math.hypot(ex-sx,ey-sY,ez-sz);
    l.m.position.set((sx+ex)/2,(sY+ey)/2,(sz+ez)/2);l.m.scale.set(1,1,Math.max(.01,len));l.m.lookAt(ex,ey,ez);}
}
const _frame=frame;frame=function(now){_frame(now);try{tickLeash();}catch(e){}};
})();
