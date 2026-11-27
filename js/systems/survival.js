/* MiniBlocos · Vida, fome, ar, dano, respawn, comer e vitals */
// vida e fome
let hp=20,food=20,air=10,hungerT=0,regT=0,airT=0,fallMax=0,meat=0,apples=0,cooked=0,cooks=[],atkCool=0,hudKey='';
let playerDead=false;
const AHP={pig:3,cow:4,chicken:2,sheep:3,rabbit:1,horse:5,goat:3,duck:2},DROP={pig:3,cow:3,chicken:1,sheep:2,rabbit:1,horse:4,goat:2,duck:1};
function damage(n){
  if(hp<=0||playerDead)return;

  hp=Math.max(0,hp-n);
  flash();

  if(hp<=0){
    playerDead=true;
  }
}
// ---- respawn seguro: nunca na água, em cima de árvore, em parede ou na cama destruída ----
// ponto onde dá para ficar de pé: bloco sólido (não folha) com 3 células livres acima e sem água na altura do corpo
function standOk(x,y,z){if(x<0||z<0||x>=W||z>=D||y<1||y+3>=H)return false;
  if(!solid(x,y,z)||B[idx(x,y,z)]===5)return false;
  for(let k=1;k<=3;k++){const tk=B[idx(x,y+k,z)];if(solid(x,y+k,z)||(tk>=26&&tk<=33))return false;}
  return B[idx(x,y+1,z)]!==8&&B[idx(x,y+2,z)]!==8;}
// topo do terreno na coluna (ignora folhas, para não nascer em cima da copa de uma árvore)
function groundY(x,z){for(let y=H-1;y>=1;y--)if(solid(x,y,z)&&B[idx(x,y,z)]!==5)return y;return -1;}
// ponto seguro mais próximo da coluna (fx,fz), procurando em anéis de raio crescente
function safeSpawn(fx,fz){const cx=Math.floor(fx),cz=Math.floor(fz);
  for(let r=0;r<=12;r++)for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++){if(Math.max(Math.abs(dx),Math.abs(dz))!==r)continue;
    const x=cx+dx,z=cz+dz;if(x<0||z<0||x>=W||z>=D)continue;const y=groundY(x,z);if(y>0&&standOk(x,y,z))return{x:x+.5,y:y+1.01,z:z+.5};}
  return null;}
// ponto de retorno da cama: null = sem cama definida | undefined = a cama não existe mais
function bedSpawn(){if(!bedPos)return null;const bx=Math.floor(bedPos[0]),bz=Math.floor(bedPos[1]);let by=-1;
  for(let y=H-1;y>=0;y--)if(B[idx(bx,y,bz)]===16){by=y;break;}
  if(by<0)return undefined;
  if(standOk(bx,by,bz))return{x:bx+.5,y:by+1.01,z:bz+.5};
  for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const dy of[0,-1,1])if((dx||dz)&&standOk(bx+dx,by+dy,bz+dz))return{x:bx+dx+.5,y:by+dy+1.01,z:bz+dz+.5};
  return safeSpawn(bx,bz);}
function respawn(){
  playerDead=false;
  let sp=null,msg='Você desmaiou e voltou ao início';
  if(bedPos){const b=bedSpawn();if(b===undefined){bedPos=null;msg='Você desmaiou. Sua cama foi destruída: voltou ao início';}else sp=b;}
  if(!sp)sp=safeSpawn(SP0[0],SP0[1]);
  if(sp){P.x=sp.x;P.y=sp.y;P.z=sp.z;}
  else{P.x=SP0[0];P.z=SP0[1];for(let y=H-1;y>=0;y--)if(get(Math.floor(P.x),y,Math.floor(P.z))){P.y=y+1.01;break;}}   // último recurso
  P.vx=P.vz=P.vy=0;P.ground=false;stepOff=0;hp=20;food=20;air=10;fallMax=P.y;toast(msg);}
function eat(){if(cooked+meat+apples<=0){toast('Sem comida: bata nos animais ou colha maçãs das folhas');return;}
  if(food>=20){toast('Você já está satisfeito');return;}
  if(cooked>0){cooked--;food=Math.min(20,food+14);}else if(meat>0){meat--;food=Math.min(20,food+4);}else{apples--;food=Math.min(20,food+4);}}
function vitals(dt){
  furnTick(dt);
  for(let i=cooks.length-1;i>=0;i--){const c=cooks[i];c.t-=dt;if(c.t<=0){cooked+=c.n;cooks.splice(i,1);toast('🍗 '+c.n+' carne assada pronta!');}}
  if(playing){
    const moving=P.vx||P.vz;hungerT+=dt*(moving?1.6:1);if(hungerT>=20){hungerT=0;if(food>0)food--;}
    regT+=dt;
    if(!playerDead){
      if(food>=14&&hp<20&&regT>=4){
        hp++;
        regT=0;
      }
      else if(food<=0&&hp>2&&regT>=4){
        damage(1);
        regT=0;
      }
    }
    if(get(Math.floor(P.x),Math.floor(P.y+EY),Math.floor(P.z))===8){airT+=dt;if(airT>=1.5){airT=0;if(air>0)air--;else damage(2);}}
    else{air=Math.min(10,air+dt*6);airT=0;}
  }
  updateHud();}
document.getElementById('eatbtn').onclick=eat;
