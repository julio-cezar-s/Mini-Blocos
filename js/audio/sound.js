/* MiniBlocos · Sons: tudo sintetizado com Web Audio (não precisa de arquivos .mp3/.ogg).
   Este arquivo "embrulha" funções que já existem (damage, act, tint, killAnimal, ...), então não é preciso mexer nos outros arquivos.
   Carregue DEPOIS de js/core/loop.js e ANTES de js/main.js. Botão 🔊 no canto superior direito (ou tecla N) liga/desliga. */
(function(){
const AC=window.AudioContext||window.webkitAudioContext;
let ctx=null,bus=null,lpf=null,nbuf=null,muted=false,active=0;
const VOL=.8;
const SOM_NOMADE=false,SOM_FOGUEIRA=false,VOL_PASSOS=.3;
try{muted=localStorage.getItem('mb_mute')==='1';}catch(e){}
const rnd=Math.random,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));

// ---------- motor de áudio ----------
function init(){
  if(ctx||!AC)return;
  try{
    ctx=new AC();
    bus=ctx.createGain();bus.gain.value=muted?0:VOL;
    lpf=ctx.createBiquadFilter();lpf.type='lowpass';lpf.frequency.value=20000;   // abafa o som debaixo d'água
    const comp=ctx.createDynamicsCompressor();
    bus.connect(lpf);lpf.connect(comp);comp.connect(ctx.destination);
    nbuf=ctx.createBuffer(1,ctx.sampleRate*1.5,ctx.sampleRate);
    const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=rnd()*2-1;
  }catch(e){ctx=null;}
}
function unlock(){init();if(ctx&&ctx.state!=='running'&&!muted)ctx.resume();}
['pointerdown','touchstart','mousedown','keydown','click','touchend','pointerup','mouseup'].forEach(ev=>addEventListener(ev,unlock,{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)ctx.suspend();else if(!muted)ctx.resume();});
const ready=()=>ctx&&ctx.state==='running'&&!muted&&active<48;

function voice(vol,pan,delay){
  const t=ctx.currentTime+(delay||0),g=ctx.createGain();g.gain.value=0;
  if(pan&&ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=clamp(pan,-1,1);g.connect(p);p.connect(bus);}else g.connect(bus);
  return{g,t};}
// o: f, f2 (desliza até), d, type, v, pan, delay, a (ataque), lp (passa-baixa), vib:[Hz, profundidade]
function tone(o){
  if(!ready())return;const d=o.d||.15,{g,t}=voice(o.v,o.pan,o.delay),os=ctx.createOscillator();
  os.type=o.type||'sine';os.frequency.setValueAtTime(o.f,t);if(o.f2)os.frequency.exponentialRampToValueAtTime(Math.max(20,o.f2),t+d);
  let n=os;if(o.lp){const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;os.connect(f);n=f;}
  if(o.vib){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=o.vib[0];lg.gain.value=o.vib[1];l.connect(lg);lg.connect(os.frequency);l.start(t);l.stop(t+d+.05);}
  n.connect(g);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(Math.max(.0002,o.v),t+(o.a||.006));g.gain.exponentialRampToValueAtTime(.0001,t+d);
  active++;os.onended=()=>{active--;};os.start(t);os.stop(t+d+.05);}
// o: d, v, type (lowpass/bandpass/highpass), f, f2, q, pan, delay, a
function noise(o){
  if(!ready())return;const d=o.d||.1,{g,t}=voice(o.v,o.pan,o.delay),s=ctx.createBufferSource(),f=ctx.createBiquadFilter();
  s.buffer=nbuf;s.loop=true;f.type=o.type||'lowpass';f.frequency.setValueAtTime(o.f||1000,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(Math.max(20,o.f2),t+d);f.Q.value=o.q||.7;
  s.connect(f);f.connect(g);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(Math.max(.0002,o.v),t+(o.a||.004));g.gain.exponentialRampToValueAtTime(.0001,t+d);
  active++;s.onended=()=>{active--;};s.start(t,rnd()*.8);s.stop(t+d+.05);}

// posição do som no mundo -> volume e balanço esquerda/direita (null = longe demais)
function spat(x,z,range){
  const dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz);range=range||18;if(d>range)return null;
  return{k:Math.pow(1-d/range,1.5),pan:d>.5?(dx*Math.cos(P.yaw)-dz*Math.sin(P.yaw))/d:0};}

// ---------- materiais dos blocos ----------
function mat(t){
  if(t===1||t===2||t===34||t===35)return'dirt';
  if(t===7||t===11||t===12)return'sand';
  if(t===9)return'snow';
  if(t===5||t===13||t===40||t===41||t===42)return'leaf';
  if(t===17||t===15)return'glass';
  if(t===47||t===48||t===50)return'metal';
  if(t===4||t===6||t===14||t===16||t===18||t===20||t===21||t===22||(t>=24&&t<=33)||(t>=51&&t<=67))return'wood';
  return'stone';}
// kind: break | place | dig (martelando) | step ; m = multiplicador de volume
function blockSnd(m,kind,pan,mul){
  if(!ready())return;
   const ld=(kind==='break'?1:kind==='place'?.75:kind==='dig'?.55:.42*VOL_PASSOS)*(mul||1),
   switch(m){
    case'dirt':noise({d:L,v:.5*ld,type:'lowpass',f:800*r,f2:300,pan});tone({f:120*r,f2:60,d:L,v:.4*ld,pan});break;
    case'sand':noise({d:L*1.3,v:.3*ld,type:'bandpass',f:2600*r,q:.5,pan});break;
    case'snow':noise({d:L*1.5,v:.35*ld,type:'bandpass',f:3600*r,f2:1800,q:.6,pan});break;
    case'leaf':noise({d:L*1.4,v:.3*ld,type:'highpass',f:2600*r,pan});break;
    case'wood':tone({f:270*r,f2:130,d:L,v:.5*ld,type:'triangle',pan});noise({d:L*.5,v:.25*ld,type:'bandpass',f:900*r,q:1,pan});break;
    case'glass':tone({f:2600*r,d:.25,v:.22*ld,pan});tone({f:3900*r,d:.2,v:.15*ld,pan});if(kind==='break')noise({d:.22,v:.35*ld,type:'highpass',f:6000,pan});break;
    case'metal':tone({f:880*r,d:.35,v:.3*ld,pan});tone({f:1320*r,d:.25,v:.15*ld,pan});noise({d:.03,v:.2*ld,type:'bandpass',f:3000,pan});break;
    case'water':noise({d:.2,v:.3*ld,type:'bandpass',f:1000,f2:600,pan});break;
    default:noise({d:L,v:.5*ld,type:'bandpass',f:1400*r,q:1.2,pan});tone({f:220*r,f2:110,d:L*.8,v:.35*ld,pan});
      if(kind==='break')noise({d:.08,v:.3*ld,type:'bandpass',f:2200*r,q:1,pan,delay:.06});}}
function hoof(){const q=VOL_PASSOS;tone({f:150,f2:90,d:.07,v:.3*q});noise({d:.05,v:.25*q,type:'bandpass',f:700,q:1});tone({f:140,f2:85,d:.07,v:.25*q,delay:.1});noise({d:.05,v:.2*q,type:'bandpass',f:700,q:1,delay:.1});}
function splash(m){const ld=m||1;noise({d:.35,v:.45*ld,type:'bandpass',f:1200,f2:400,q:.6});noise({d:.25,v:.3*ld,type:'lowpass',f:350});tone({f:300,f2:120,d:.2,v:.2*ld});}

// ---------- vozes dos animais ----------
// mode: hurt (apanhou) | idle (ambiente, baixinho) | die | growl (predador percebeu o jogador)
function cry(k,mode,x,z){
  if(!ready()||(k==='nomad'&&!SOM_NOMADE))return;
  const s=spat(x,z,mode==='idle'?16:26);if(!s)return;
  const pan=s.pan,vm=(mode==='idle'?.4:1)*Math.max(.18,s.k),pm=mode==='hurt'?1.12:mode==='die'?.78:mode==='idle'?.95+rnd()*.1:1,sl=mode==='die'?1.3:1;
  switch(k){
    case'pig':tone({f:320*pm,f2:190*pm,d:.22*sl,v:.35*vm,type:'sawtooth',lp:1500,vib:[28,18],pan});tone({f:280*pm,f2:170*pm,d:.18*sl,v:.3*vm,type:'sawtooth',lp:1500,vib:[28,18],pan,delay:.22});break;
    case'cow':tone({f:120*pm,f2:85*pm,d:.8*sl,v:.5*vm,type:'sawtooth',lp:700,vib:[5,6],pan});tone({f:240*pm,f2:170*pm,d:.8*sl,v:.15*vm,type:'sawtooth',lp:900,pan});break;
    case'chicken':for(let i=0;i<3;i++)tone({f:700*pm,f2:1000*pm,d:.07,v:.25*vm,type:'square',lp:3000,pan,delay:i*.1});break;
    case'sheep':tone({f:380*pm,f2:330*pm,d:.6*sl,v:.35*vm,type:'sawtooth',lp:1400,vib:[32,45],pan});noise({d:.6*sl,v:.08*vm,type:'bandpass',f:1200,pan});break;
    case'goat':tone({f:470*pm,f2:400*pm,d:.45*sl,v:.35*vm,type:'sawtooth',lp:1500,vib:[26,40],pan});break;
    case'rabbit':tone({f:1900*pm,f2:1300*pm,d:.09,v:.25*vm,pan});tone({f:1800*pm,f2:1200*pm,d:.09,v:.2*vm,pan,delay:.1});break;
    case'horse':tone({f:560*pm,f2:900*pm,d:.25,v:.3*vm,type:'sawtooth',lp:2000,vib:[8,12],pan});tone({f:880*pm,f2:380*pm,d:.45*sl,v:.3*vm,type:'sawtooth',lp:2000,vib:[8,12],pan,delay:.25});noise({d:.6,v:.08*vm,type:'bandpass',f:1500,pan});break;
    case'duck':tone({f:520*pm,f2:330*pm,d:.14,v:.3*vm,type:'square',lp:1400,pan});tone({f:500*pm,f2:320*pm,d:.14,v:.28*vm,type:'square',lp:1400,pan,delay:.17});break;
    case'wolf':tone({f:90*pm,f2:60*pm,d:.6,v:.45*vm,type:'sawtooth',lp:500,vib:[14,10],pan});noise({d:.6,v:.2*vm,type:'lowpass',f:600,pan});break;
    case'bear':tone({f:60*pm,f2:45*pm,d:.8,v:.5*vm,type:'sawtooth',lp:400,vib:[10,8],pan});noise({d:.8,v:.25*vm,type:'lowpass',f:500,pan});break;
    case'snake':noise({d:.7,v:.3*vm,type:'highpass',f:5000,pan});break;
    case'jaguar':tone({f:140*pm,f2:90*pm,d:.5,v:.45*vm,type:'sawtooth',lp:600,vib:[16,10],pan});noise({d:.5,v:.2*vm,type:'lowpass',f:700,pan});break;
    case'boar':for(let i=0;i<2;i++)tone({f:150*pm,f2:100*pm,d:.25,v:.35*vm,type:'sawtooth',lp:600,pan,delay:i*.28});noise({d:.5,v:.15*vm,type:'lowpass',f:500,pan});break;
    case'spider':for(let i=0;i<3;i++)noise({d:.03,v:.25*vm,type:'highpass',f:6000,pan,delay:i*.07});break;
    case'monkey':for(let i=0;i<3;i++)tone({f:900*pm,f2:1300*pm,d:.1,v:.25*vm,pan,delay:i*.12});break;
    case'nomad':tone({f:130*pm,f2:100*pm,d:.2,v:.35*vm,type:'sawtooth',lp:500,pan});break;
    default:tone({f:400*pm,f2:300*pm,d:.2,v:.3*vm,type:'triangle',pan});}}
function poof(x,z,delay){const s=spat(x,z,20);if(!s)return;noise({d:.35,v:.25*Math.max(.2,s.k),type:'lowpass',f:900,f2:300,pan:s.pan,delay});}

// ---------- efeitos avulsos ----------
const door=(()=>{let flip=false;return()=>{flip=!flip;tone({f:150,f2:flip?240:110,d:.18,v:.25,type:'sawtooth',lp:900});noise({d:.15,v:.15,type:'bandpass',f:500,q:1});
  tone({f:100,f2:60,d:.1,v:.35,delay:.17});noise({d:.08,v:.25,type:'lowpass',f:400,delay:.17});};})();
const chestSnd=()=>{tone({f:200,f2:300,d:.25,v:.22,type:'sawtooth',lp:800});noise({d:.2,v:.12,type:'bandpass',f:600,q:1});tone({f:130,f2:80,d:.12,v:.3,delay:.22,type:'triangle'});};
const hurtSnd=()=>{tone({f:260,f2:120,d:.25,v:.4,type:'sawtooth',lp:1200});noise({d:.1,v:.3,type:'lowpass',f:800});};
const deathSnd=()=>{tone({f:300,f2:60,d:.9,v:.4,type:'sawtooth',lp:900,vib:[6,10]});noise({d:.5,v:.25,type:'lowpass',f:500});};
const hitSnd=()=>{noise({d:.08,v:.4,type:'bandpass',f:1800,f2:700,q:.8});tone({f:160,f2:70,d:.1,v:.45});};
const biteSnd=()=>{for(let i=0;i<2;i++){noise({d:.06,v:.35,type:'bandpass',f:2000,q:1,delay:i*.16});tone({f:300,f2:200,d:.05,v:.15,delay:i*.16});}};
const bowSnd=()=>{noise({d:.12,v:.25,type:'bandpass',f:2500,f2:800,q:.8});tone({f:330,f2:110,d:.14,v:.35,type:'triangle'});};
const sizzleSnd=()=>{noise({d:.6,v:.3,type:'highpass',f:3500});};
const saddleSnd=()=>{noise({d:.15,v:.2,type:'bandpass',f:800,q:1});tone({f:150,f2:110,d:.15,v:.2,type:'triangle'});};

// ---------- envolve funções do jogo ----------
const _damage=damage;damage=function(n){const h=hp;_damage(n);if(hp<h){if(hp<=0)deathSnd();else hurtSnd();}};
const _act=act;act=function(b){
  let r=null,t0=0,p0=0,pi=-1,ti=-1;
  try{r=ray();if(r){ti=idx(r.x,r.y,r.z);t0=B[ti];if(r.prev){const q=r.prev;if(q[0]>=0&&q[1]>=0&&q[2]>=0&&q[0]<W&&q[1]<H&&q[2]<D){pi=idx(q[0],q[1],q[2]);p0=B[pi];}}}}catch(e){}
  _act(b);
  try{if(r){if(b){if(t0&&B[ti]!==t0)blockSnd(mat(t0),'break');}else if(pi>=0&&!p0&&B[pi])blockSnd(mat(B[pi]),'place');}}catch(e){}};
const _tD=tryDoor;tryDoor=function(){const r=_tD();if(r)door();return r;};
const _tH=tryHatch;tryHatch=function(){const r=_tH();if(r)door();return r;};
const _tG=tryGate;tryGate=function(){const r=_tG();if(r)door();return r;};
const _tC=tryChest;tryChest=function(){const r=_tC();if(r)chestSnd();return r;};
const _tB=tryBench;tryBench=function(){const r=_tB();if(r)blockSnd('wood','place');return r;};
const _tF=tryFurnace;tryFurnace=function(){const r=_tF();if(r){blockSnd('stone','place');noise({d:.4,v:.2,type:'lowpass',f:400});}return r;};
const _tK=tryCook;tryCook=function(){const r=_tK();if(r)sizzleSnd();return r;};
const _tBed=tryBed;tryBed=function(){const r=_tBed();if(r){tone({f:660,d:.3,v:.15});tone({f:880,d:.4,v:.12,delay:.12});}return r;};
const _rT=rideTry;rideTry=function(a){const m0=mounted,r=_rT(a);if(mounted!==m0&&mounted){saddleSnd();cry('horse','idle',a.x,a.z);}return r;};
const _eat=eat;eat=function(){const f0=cooked+meat+apples;_eat();if(cooked+meat+apples<f0)biteSnd();};
const _ha=hitAnimal;hitAnimal=function(){const c0=atkCool,r=_ha();if(atkCool!==c0)hitSnd();return r;};
const _tint=tint;tint=function(a,c){_tint(a,c);if(c===0x771111&&a&&a.k&&a.hp>0)cry(a.k,'hurt',a.x,a.z);};
const _ka=killAnimal;killAnimal=function(a){_ka(a);if(a&&a.k){cry(a.k,'die',a.x,a.z);poof(a.x,a.z,1.5);}};
const _fb=fireBow;fireBow=function(){const a0=arrows;_fb();if(arrows<a0)bowSnd();};

// ---------- tick por quadro: passos, pulo, queda, água, ambiente ----------
let lx,lz,lastG=true,lastVy=0,lastW=false,stepD=0,idleT=6,ambT=3,fireT=0,swimT=0,digT=0,lastNow=0;
const isNight=()=>typeof dayT!=='undefined'&&Math.sin(Math.PI*2*(dayT-.25))<-.05;
function tick(now){
  const dt=Math.min(.1,Math.max(.001,(now-lastNow)/1000));lastNow=now;
  if(!ctx||ctx.state!=='running')return;
  const cp=camera.position,under=get(Math.floor(cp.x),Math.floor(cp.y),Math.floor(cp.z))===8;
  lpf.frequency.setTargetAtTime(under?500:20000,ctx.currentTime,.05);
  if(!playing||playerDead){lx=P.x;lz=P.z;lastG=P.ground;lastVy=0;return;}
  const mv=lx===undefined?0:Math.hypot(P.x-lx,P.z-lz),sp=mv/dt;lx=P.x;lz=P.z;
  const bx=Math.floor(P.x),bz=Math.floor(P.z),inW=get(bx,Math.floor(P.y+.05),bz)===8,below=get(bx,Math.floor(P.y-.1),bz);
  // passos (a pé ou a cavalo)
  if(P.ground&&sp>1.5&&sp<30){stepD+=mv;if(stepD>=(mounted?2.4:2.9)){stepD=0;if(mounted)hoof();else blockSnd(inW?'water':mat(below),'step');}}
  // pulo, queda e água
  if(lastG&&!P.ground&&P.vy>2&&!inW)noise({d:.08,v:.15,type:'bandpass',f:600,q:.8});
  if(!lastG&&P.ground&&lastVy<-14&&!inW)blockSnd(mat(below),'place',0,.6+clamp((-lastVy-14)/25,0,1));
  if(inW&&!lastW)splash(clamp(-lastVy/20,.4,1.2));else if(!inW&&lastW)splash(.4);
  if(inW&&sp>1){swimT-=dt;if(swimT<=0){swimT=.55;noise({d:.25,v:.18,type:'bandpass',f:900,f2:500,q:.5});}}
  lastG=P.ground;lastVy=P.vy;lastW=inW;
  // martelando um bloco
  if(typeof mining!=='undefined'&&mining&&mp>0&&mt){digT-=dt;if(digT<=0){digT=.27;const q=String(mt).split(',').map(Number);blockSnd(mat(get(q[0],q[1],q[2])),'dig');}}else digT=0;
  // animais: grunhidos ao acaso e rosnado dos predadores que percebem você
  idleT-=dt;
  if(idleT<=0){idleT=5+rnd()*9;if(!(isNight()&&rnd()<.6)){const c=animals.filter(a=>a.k&&!(SPEC[a.k]&&SPEC[a.k].pred)&&a.k!=='nomad'&&!a.rider&&Math.hypot(a.x-P.x,a.z-P.z)<16);if(c.length){const a=c[Math.floor(rnd()*c.length)];cry(a.k,'idle',a.x,a.z);}}}
  for(const a of animals){const s=SPEC[a.k];if(!s||!s.pred)continue;const ag=a.ag>0;if(ag&&!a._ag)cry(a.k,'growl',a.x,a.z);a._ag=ag;}
  // fogueira estalando por perto
  fireT-=dt;
    if(SOM_FOGUEIRA&&fireT<=0){fireT=.15+rnd()*.5;let best=null,bd=9;for(const f of fires){if(f.lamp)continue;const d=Math.hypot(f.x+.5-P.x,f.z+.5-P.z);if(d<bd){bd=d;best=f;}}
    if(best){const k=Math.pow(1-bd/9,1.5),pan=bd>.5?((best.x+.5-P.x)*Math.cos(P.yaw)-(best.z+.5-P.z)*Math.sin(P.yaw))/bd:0;
      noise({d:.03+rnd()*.05,v:.25*k,type:'highpass',f:2500+rnd()*2000,pan});if(rnd()<.2)tone({f:900+rnd()*600,f2:300,d:.04,v:.12*k,pan});}}
  // ambiente: passarinhos de dia, grilos à noite (só ao ar livre, acima do nível da água)
  ambT-=dt;
  if(ambT<=0&&!under&&P.y>(typeof WL!=='undefined'?WL:8)-3){
    if(isNight()){ambT=1.2+rnd()*1.6;for(let i=0;i<4;i++)tone({f:4300,d:.03,v:.035,delay:i*.05,pan:rnd()*2-1});}
    else{ambT=4+rnd()*8;const pan=rnd()*2-1,f=2600+rnd()*1600,n=2+Math.floor(rnd()*3);for(let i=0;i<n;i++)tone({f:f*(1+i*.08),f2:f*(1.15+i*.08),d:.07,v:.07,pan,delay:i*.1});}}
  else if(ambT<=0)ambT=2;}
const _frame=frame;frame=function(now){_frame(now);try{tick(now);}catch(e){}};

// ---------- botão 🔊 / tecla N ----------
function setMute(m){muted=m;try{localStorage.setItem('mb_mute',m?'1':'0');}catch(e){}
  if(bus)bus.gain.value=m?0:VOL;if(ctx){if(m)ctx.suspend();else ctx.resume();}btn.textContent=m?'🔇':'🔊';}
const btn=document.createElement('div');btn.id='sndbtn';btn.textContent=muted?'🔇':'🔊';
btn.style.cssText=[
'position:fixed',
'right:calc(10px + env(safe-area-inset-right,0px))',
'top:calc(156px + env(safe-area-inset-top,0px))',
'width:36px',
'height:36px',
'border-radius:10px',
'background:#0006',
'color:#fff',
'display:flex',
'align-items:center',
'justify-content:center',
'font-size:20px',
'z-index:5',
'cursor:pointer',
'user-select:none',
'-webkit-user-select:none',
'touch-action:manipulation'
].join(';');
['pointerdown','touchstart','mousedown'].forEach(ev=>btn.addEventListener(ev,e=>e.stopPropagation()));
let lastTog=0;
const tog=e=>{e.stopPropagation();e.preventDefault();const n=Date.now();if(n-lastTog<400)return;lastTog=n;init();setMute(!muted);};
btn.addEventListener('touchend',tog,{passive:false});
btn.addEventListener('pointerup',tog);
btn.addEventListener('click',tog);
document.body.appendChild(btn);
addEventListener('keydown',e=>{if(e.code==='KeyN'&&!e.repeat){init();setMute(!muted);}});

window.SND={blockSnd,cry,tone,noise,mat,toggle:()=>setMute(!muted)};
})();
