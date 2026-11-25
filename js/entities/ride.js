/* MiniBlocos · Sela e montaria: selar o cavalo, montar, cavalgar, descer */
// Item 68 (Sela). Selecione a sela e toque num cavalo para selá-lo (a sela não se gasta). Cavalo selado: toque nele de mão vazia
// (ou com a sela na mão) para montar. Montado: andar/olhar como sempre; o cavalo corre mais rápido e o pulo salta bloco.
// Descer: botão "⬇ Descer" (celular) ou Shift (teclado). O cavalo só guarda a sela enquanto o jogo está aberto (os animais não são salvos).
const RIDE_V=11;   // velocidade do cavalo montado (blocos/s); a pé são ~7,5
const RIDE_HH=3.9; // altura de cavalo + cavaleiro (blocos): não passa por vãos mais baixos
let mounted=null;
const rideBtn=document.getElementById('dismount');
function horsePose(g){const u=g.userData;if(u.ng){u.ng.rotation.x=u.nth;u.hg.position.set(0,u.ngY+u.nl*Math.cos(u.nth),u.ngZ+u.nl*Math.sin(u.nth));}}   // pescoço/cabeça em repouso (modelos sem IA)
// sela no modelo do cavalo (assento, arções, abas e estribos)
function addSaddle(a){const u=a.g.userData;if(u.saddle)return;const s=SPEC.horse,L=s.l[1],bh=s.b[1],bw=s.b[0],sd=new THREE.Group(),Y=L+bh;
  sd.add(bx(bw*.98,.05,.36,'#7a4a24',0,Y+.025,-.02));sd.add(bx(.2,.07,.07,'#5e3719',0,Y+.07,.17));sd.add(bx(.26,.09,.07,'#5e3719',0,Y+.08,-.2));
  for(const sx of[-1,1]){sd.add(bx(.03,.3,.3,'#7a4a24',sx*(bw/2+.012),Y-.12,-.02));            // aba da sela
    sd.add(bx(.02,.2,.02,'#555555',sx*(bw/2+.05),Y-.22,-.02));sd.add(bx(.06,.02,.08,'#c9c9c9',sx*(bw/2+.05),Y-.33,-.02));}   // estribo
  u.bg.add(sd);u.saddle=sd;a.sd=true;}
// animal sob a mira (mesma regra do ataque corpo a corpo)
function pickAnimal(){const d=new THREE.Vector3();camera.getWorldDirection(d);const o=camera.position;let best=null,bt=1e9;
  for(const a of animals){const s=SPEC[a.k],cx=a.x-o.x,cy=a.y+s.hh/S*.5-o.y,cz=a.z-o.z,t=cx*d.x+cy*d.y+cz*d.z;if(t<0||t>3.2/S)continue;
    const px=cx-d.x*t,py=cy-d.y*t,pz=cz-d.z*t,rr=Math.max(s.r,.3)/S+.25;if(px*px+py*py+pz*pz<rr*rr&&t<bt){bt=t;best=a;}}
  return best;}
// true = a ação foi "selar/montar" (não ataca); false = segue o ataque normal
function rideTry(a){if(a.k!=='horse')return false;if(a===mounted)return true;
  const sad=names[cur]===68&&inv[68]>0;
  if(!a.sd){if(sad){addSaddle(a);toast('🐴 Cavalo selado! Toque nele de mão vazia para montar');return true;}return false;}
  if(sad||tool===0){mountHorse(a);return true;}return false;}
function tryMount(){if(mounted)return false;const a=pickAnimal();return !!a&&rideTry(a);}
function mountHorse(a){if(mounted)return;const s=SPEC.horse,r=s.r/S;
  if(hitB(a.x,a.y,a.z,r,RIDE_HH)){toast('Sem espaço para montar aqui');return;}
  mounted=a;a.rider=true;a.mv=false;a.flee=0;a.al=0;a.gz=false;a.rideIn=null;P.vx=P.vz=P.vy=0;
  if(rideBtn)rideBtn.style.display='block';
  toast(isTouch?'🐎 Montado! Use ⬇ Descer para apear':'🐎 Montado! Shift para descer');}
function dismount(){if(!mounted)return;const a=mounted;mounted=null;a.rider=false;a.rideIn=null;a.mv=false;a.spd=0;if(rideBtn)rideBtn.style.display='none';
  const sn=Math.sin(a.rot),cs=Math.cos(a.rot);let ok=null;
  const groundAt=(px,pz)=>{for(let y=Math.floor(a.y+2);y>=0&&y>a.y-6;y--)if(solid(Math.floor(px),y,Math.floor(pz)))return y+1.01;return null;};   // chão perto do cavalo (mesmo que ele esteja pulando)
  for(const[ox,oz]of[[cs,-sn],[-cs,sn],[-sn,-cs],[sn,cs]]){for(const dist of[1.8,2.4]){const px=a.x+ox*dist,pz=a.z+oz*dist,gy=groundAt(px,pz);   // desce pelo lado, depois atrás, depois pela frente
    if(gy!==null&&!hit(px,gy,pz)){ok=[px,gy,pz];break;}}if(ok)break;}
  if(!ok)ok=[a.x,a.y+1,a.z];
  P.x=ok[0];P.y=ok[1];P.z=ok[2];P.vx=P.vy=P.vz=0;P.ground=false;fallMax=P.y;stepOff=0;}
// chamado no lugar da física do jogador enquanto montado; devolve true se tratou o quadro
function rideTick(dt){const a=mounted;
  if(!a||animals.indexOf(a)<0||dying.indexOf(a)>=0){dismount();return false;}   // cavalo sumiu/morreu: volta ao normal
  const f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)+tk.f,sd=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+tk.s,sn=Math.sin(P.yaw),cs=Math.cos(P.yaw);
  a.rideIn={x:-sn*f+cs*sd,z:-cs*f-sn*sd,jump:!!keys.Space};
  return true;}
// depois de mover o cavalo: o jogador acompanha a sela
function rideSync(){const a=mounted;if(!a)return;const s=SPEC.horse,sc=a.g.scale.x;
  P.x=a.x-Math.sin(a.rot)*.1*sc;P.z=a.z-Math.cos(a.rot)*.1*sc;P.y=a.y+(s.b[1]+s.l[1]-.55)*sc;P.vx=P.vz=P.vy=0;P.ground=true;fallMax=P.y;stepOff=0;}
addEventListener('keydown',e=>{if(mounted&&(e.code==='ShiftLeft'||e.code==='ShiftRight'))dismount();});
if(rideBtn){rideBtn.addEventListener('touchstart',e=>{e.preventDefault();dismount();},{passive:false});rideBtn.addEventListener('click',dismount);}
// item sela no ícone
function drawSaddleIcon(g){g.lineJoin='round';g.lineWidth=2;g.strokeStyle='#3a210e';
  g.fillStyle='#5e3719';g.beginPath();g.moveTo(8,26);g.quadraticCurveTo(10,40,16,42);g.lineTo(32,42);g.quadraticCurveTo(38,40,40,26);g.closePath();g.fill();g.stroke();   // abas
  g.fillStyle='#7a4a24';g.beginPath();g.moveTo(6,24);g.quadraticCurveTo(14,18,24,22);g.quadraticCurveTo(34,18,42,24);g.quadraticCurveTo(24,32,6,24);g.closePath();g.fill();g.stroke();   // assento
  g.fillStyle='#5e3719';g.fillRect(10,14,6,10);g.strokeRect(10,14,6,10);g.fillRect(34,12,6,12);g.strokeRect(34,12,6,12);   // arções
  g.strokeStyle='#555';g.lineWidth=2;g.beginPath();g.moveTo(14,34);g.lineTo(14,44);g.stroke();g.fillStyle='#c9c9c9';g.fillRect(10,43,8,3);}
