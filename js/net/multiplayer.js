/* MiniBlocos · Multijogador online por sala (Supabase Realtime, só "broadcast": sem tabelas e sem servidor próprio)
   Quem CRIA a sala é o anfitrião: o mundo dele é o mundo da sala (e o save dele continua sendo gravado no celular dele).
   Quem ENTRA gera o mesmo terreno pela seed (página recarrega com ?sala=CÓDIGO&seed=N), recebe do anfitrião o mundo atual
   (compactado em pedaços) e depois todos trocam: blocos colocados/quebrados, portas e posição. Cada um tem o próprio inventário.
   Não sincronizado nesta versão: animais, peixes, baús, fornos e água corrente (cada celular simula os seus). */
const netEl=id=>document.getElementById(id);
let netOn=false,netHost=false,netCode='',netCl=null,netCh=null,netApply=false,netReady=false,netT=0,netPT=0,netTm=0,netPosKey='',netSnap=null,netWait=0,netHello=0,netAuto=NETQ.get('sala')||'';
const netId=Math.random().toString(36).slice(2,8);
// perfil do jogador (nome e cor da camisa): fica salvo neste celular e vai junto com a posição para os outros
const NETCOLS=['#d93636','#e8892b','#e6c619','#3aa655','#2fa3d6','#3b5bdb','#9c4bd6','#e86fb0','#f2f2f2','#444444'];
const netCleanName=s=>String(s==null?'':s).replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,14);
const netCleanCol=c=>(typeof c==='string'&&/^#[0-9a-fA-F]{6}$/.test(c))?c:'';
const netProf={n:'Jogador '+netId.slice(0,3).toUpperCase(),c:NETCOLS[parseInt(netId,36)%NETCOLS.length]};
try{const q=JSON.parse(localStorage.getItem('miniblocos_perfil')||'null');if(q){if(netCleanName(q.n))netProf.n=netCleanName(q.n);if(netCleanCol(q.c))netProf.c=netCleanCol(q.c);}}catch(e){}
function netSaveProf(){try{localStorage.setItem('miniblocos_perfil',JSON.stringify(netProf));}catch(e){}netPosKey='';}   // netPosKey='' força reenviar já
const netPeers={},netQ=new Set(),netDr=[],netBuf=[],netLast=new Uint8Array(B.length);
const netSleep=ms=>new Promise(r=>setTimeout(r,ms));
const netOkId=v=>Number.isInteger(v)&&(v===0||!!T[v]||(v>=26&&v<=33));
const netLink=()=>location.origin+location.pathname+'?sala='+netCode+'&seed='+SEED;
function netStatus(s){const e=netEl('nst');if(e)e.textContent=s;}
function netRefresh(){const inRoom=netOn&&netReady,n=Object.keys(netPeers).length;
  netEl('nbtns').style.display=netOn?'none':'flex';netEl('njoin').style.display=netOn?'none':'flex';
  netEl('nroom').style.display=(netOn&&netHost)?'block':'none';netEl('nleave').style.display=netOn||NETQ.get('sala')?'block':'none';
  netEl('ncode').textContent=netCode?('Sala '+netCode):'';netEl('nlink').textContent=(netOn&&netHost)?netLink():'';
  if(inRoom)netStatus((netHost?'Sala aberta. ':'Conectado. ')+(n?('Jogadores na sala: você + '+n+'.'):'Ninguém mais entrou ainda.')+(netHost?' Deixe este jogo aberto.':''));}
// ---------- conexão ----------
function netLoadLib(cb){if(window.supabase&&supabase.createClient)return cb();
  const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
  s.onload=cb;s.onerror=()=>netStatus('Sem internet (ou a biblioteca do Supabase foi bloqueada).');document.head.appendChild(s);}
// confere o js/net/config.js e devolve {url,key} limpos ou {err: texto explicando o que está errado}
function netCfg(){
  if(typeof NETCFG==='undefined')return{err:'⚠️ O arquivo js/net/config.js não foi carregado.'};
  const clean=v=>String(v==null?'':v).trim().replace(/^['"`]+|['"`]+$/g,'').trim();
  let url=clean(NETCFG.url),key=clean(NETCFG.key);
  if(!url||!key||/COLE_AQUI/.test(url+key))return{err:'⚠️ Falta configurar o Supabase em js/net/config.js (veja PUBLICAR-E-JOGAR-ONLINE.md).'};
  url=url.replace(/\/+$/,'').replace(/\/(rest|realtime|auth|storage)\/v1.*$/i,'').replace(/\/+$/,'');   // aceita a URL copiada com barra ou /rest/v1 no fim
  if(!/^https:\/\/[^\/\s]+$/i.test(url))return{err:'⚠️ A URL do Supabase em config.js está errada. Use só o endereço do projeto, como https://abcdxyz.supabase.co (começa com https:// e não tem nada depois do .co).'};
  if(/\s/.test(key)||key.length<20)return{err:'⚠️ A chave do Supabase em config.js está errada (tem espaço, ficou cortada ou é curta demais). Copie de novo a chave "anon public".'};
  try{const pl=JSON.parse(atob(key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(pl.role==='service_role')return{err:'⚠️ Essa é a chave service_role (secreta). Use a chave "anon public" em config.js.'};}catch(e){}
  return{url,key};}
function netConnect(cb){
  const cf=netCfg();if(cf.err){netStatus(cf.err);return;}
  netStatus('Conectando…');
  netLoadLib(()=>{try{
    netCl=supabase.createClient(cf.url,cf.key,{realtime:{params:{eventsPerSecond:30}}});
    netCh=netCl.channel('mb-'+netCode,{config:{broadcast:{self:false,ack:false}}});
    netCh.on('broadcast',{event:'m'},ev=>{try{netRecv(ev.payload);}catch(e){console.error('[MiniBlocos] rede:',e);}});
    netCh.subscribe(st=>{
      if(st==='SUBSCRIBED'){if(!netOn){netOn=true;netLast.set(B);cb();}}
      else if(st==='CHANNEL_ERROR'||st==='TIMED_OUT')netStatus('Falha na conexão ('+st+'). Confira a URL e a chave em js/net/config.js e a internet.');
      else if(st==='CLOSED'&&netOn)netStatus('Conexão encerrada.');});
  }catch(e){netStatus('Erro ao conectar: '+e.message);}});}
function netSend(m){if(!netCh||!netOn)return;m.f=netId;try{netCh.send({type:'broadcast',event:'m',payload:m});}catch(e){}}
const netRand=()=>{const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<5;i++)s+=a[Math.floor(Math.random()*a.length)];return s;};
function netCreate(){netHost=true;netCode=netRand();
  netConnect(()=>{netReady=true;netRefresh();toast('🌐 Sala '+netCode+' criada');});}
function netJoin(code){netHost=false;netCode=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
  if(netCode.length<4){netStatus('Digite o código da sala.');return;}
  netConnect(()=>{netStatus('Procurando a sala…');let tries=0;
    const hello=()=>{if(netReady||netSnap||tries>=3)return;tries++;netSend({t:'hello',i:netId});netHello=setTimeout(hello,2500);};hello();
    netWait=setTimeout(()=>{if(!netReady&&!netSnap)netStatus('Não achei a sala. Confira o código e se o criador está com o jogo aberto.');},9000);});}
function netLeave(){try{netSend({t:'bye'});if(netCl&&netCh)netCl.removeChannel(netCh);}catch(e){}
  clearTimeout(netWait);clearTimeout(netHello);for(const id in netPeers)netDropPeer(id,true);
  netOn=false;netReady=false;netHost=false;netCh=null;netSnap=null;netBuf.length=0;netQ.clear();netDr.length=0;
  if(NETQ.get('sala')){location.replace(location.pathname);return;}   // volta ao seu mundo salvo
  netStatus('Desconectado.');netRefresh();}
// ---------- mensagens ----------
function netRecv(m){if(!m||m.f===netId)return;
  switch(m.t){
    case 'hello':if(netHost&&netReady)netServe(m.i);break;
    case 'welcome':if(m.to===netId&&!netReady&&!netSnap)netOnWelcome(m);break;
    case 'snap':if(m.to===netId&&netSnap)netOnSnap(m);break;
    case 'blk':if(netReady)netApplyBlocks(m);else if(netSnap)netBuf.push(m);break;
    case 'ps':if(netReady)netPeer(m);break;
    case 'bye':netDropPeer(m.f);break;
    case 'tm':if(netReady&&!netHost&&Number.isFinite(m.d))dayT=((m.d%1)+1)%1;break;}}
// anfitrião: envia o mundo atual para quem entrou
function netEncodeWorld(){const rle=[],n=B.length;let i=0;while(i<n){const v=B[i];let c=1;while(i+c<n&&B[i+c]===v&&c<255)c++;rle.push(v,c);i+=c;}
  const u=Uint8Array.from(rle),out=[],CH=36000;
  for(let k=0;k<u.length;k+=CH){const sub=u.subarray(k,Math.min(k+CH,u.length));let s='';for(let j=0;j<sub.length;j+=8192)s+=String.fromCharCode.apply(null,sub.subarray(j,j+8192));out.push(btoa(s));}
  return out;}
async function netServe(to){const enc=netEncodeWorld();
  const wd=waterToSave(),meta={doors:doors.map(d=>({cells:d.cells,s:d.s===-1?-1:1})),chests:chests,wd:wd.length<=30000?wd:[]};
  netSend({t:'welcome',to,seed:SEED,n:enc.length,pos:[P.x,P.y,P.z],dayT});
  await netSleep(250);netSend({t:'snap',to,k:-1,meta});
  for(let k=0;k<enc.length;k++){await netSleep(170);netSend({t:'snap',to,k,d:enc[k]});}}
// quem entra
function netOnWelcome(m){clearTimeout(netWait);clearTimeout(netHello);
  if(m.seed!==SEED){netStatus('Entrando na sala…');location.replace(location.pathname+'?sala='+netCode+'&seed='+m.seed);return;}   // mundo diferente: recarrega já com a seed da sala
  netSnap={n:m.n,parts:[],got:0,meta:null,pos:m.pos,dayT:m.dayT};netStatus('Baixando o mundo… 0/'+m.n);
  setTimeout(()=>{if(netSnap&&!netReady)netStatus('A transferência do mundo travou. Saia da sala e tente de novo.');},25000);}
function netOnSnap(m){if(m.k===-1){netSnap.meta=m.meta||{};}else if(typeof m.d==='string'&&!netSnap.parts[m.k]){netSnap.parts[m.k]=m.d;netSnap.got++;}
  netStatus('Baixando o mundo… '+netSnap.got+'/'+netSnap.n);
  if(netSnap.meta&&netSnap.got===netSnap.n)netApplySnap();}
function netApplySnap(){const sn=netSnap;
  try{let bin='';for(let k=0;k<sn.n;k++)bin+=atob(sn.parts[k]);
    const tmp=new Uint8Array(B.length);let pos=0;
    for(let k=0;k+1<bin.length;k+=2){const c=bin.charCodeAt(k+1);if(pos+c>tmp.length)throw new Error('mundo inválido');tmp.fill(bin.charCodeAt(k),pos,pos+c);pos+=c;}
    if(pos!==B.length)throw new Error('mundo incompleto');
    for(let i=0;i<tmp.length;i++)if(!netOkId(tmp[i]))throw new Error('bloco desconhecido');
    B.set(tmp);netLast.set(B);
    for(let x=0;x<W;x++)for(let z=0;z<D;z++){let y=H-1;while(y>0&&!B[idx(x,y,z)])y--;hm[x*D+z]=y;}
    const md=sn.meta;doors.length=0;if(Array.isArray(md.doors))md.doors.forEach(netDoorRec);
    for(const k in chests)delete chests[k];
    if(md.chests&&typeof md.chests==='object')for(const k in md.chests){const c=md.chests[k];if(!/^\d+,\d+,\d+$/.test(k)||!c||typeof c!=='object')continue;const o={};for(const q in c){const v=Math.floor(+c[q]);if(v>0&&Object.prototype.hasOwnProperty.call(inv,q))o[q]=Math.min(v,99999);}chests[k]=o;}
    for(const f of fires.slice())removeFire(f.x,f.y,f.z);
    for(let i=0;i<B.length;i++)if(B[i]===14)addFire(i%W,Math.floor(i/(W*D)),Math.floor(i/W)%D);else if(B[i]===15)addLamp(i%W,Math.floor(i/(W*D)),Math.floor(i/W)%D);
    if(Array.isArray(md.wd))waterFromSave(md.wd);
    build();
    if(Number.isFinite(sn.dayT))dayT=((sn.dayT%1)+1)%1;
    const ps=sn.pos||[SP0[0],0,SP0[1]],sp=safeSpawn(ps[0]+1.5,ps[2])||safeSpawn(SP0[0],SP0[1]);
    if(sp){P.x=sp.x;P.y=sp.y;P.z=sp.z;P.vx=P.vy=P.vz=0;fallMax=P.y;stepOff=0;}
    netQ.clear();netDr.length=0;netSnap=null;netReady=true;
    netBuf.splice(0).forEach(netApplyBlocks);
    netRefresh();toast('🌐 Você entrou na sala '+netCode);
  }catch(e){console.error('[MiniBlocos] snapshot:',e);netSnap=null;netStatus('Não consegui carregar o mundo da sala ('+e.message+'). Saia e tente de novo.');}}
// ---------- blocos e portas ----------
function netDoorRec(r){if(!r||!Array.isArray(r.cells)||r.cells.length!==6)return;
  if(!r.cells.every(c=>Array.isArray(c)&&c.length===3&&c.every(Number.isInteger)&&c[0]>=0&&c[0]<W&&c[1]>=0&&c[1]<H&&c[2]>=0&&c[2]<D))return;
  const c0=r.cells[0],d=doors.find(q=>q.cells[0][0]===c0[0]&&q.cells[0][1]===c0[1]&&q.cells[0][2]===c0[2]);
  if(d)d.s=r.s===-1?-1:1;else doors.push({cells:r.cells.map(c=>[c[0],c[1],c[2]]),s:r.s===-1?-1:1});}
function netApplyBlocks(m){const d=Array.isArray(m.d)?m.d:[],ch=new Set(),fireAt=[];netApply=true;
  try{if(Array.isArray(m.dr))m.dr.forEach(netDoorRec);
    for(let k=0;k+1<d.length;k+=2){const i=d[k],v=d[k+1];if(!(i>=0&&i<B.length)||!netOkId(v))continue;const o=B[i];if(o===v)continue;
      B[i]=v;netLast[i]=v;const x=i%W,z=Math.floor(i/W)%D,y=Math.floor(i/(W*D));
      if(o===14||o===15)removeFire(x,y,z);if(v===14)addFire(x,y,z);else if(v===15)addLamp(x,y,z);if(o===14||o===15||v===14||v===15)fireAt.push([x,z]);
      for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const nx=x+dx,nz=z+dz;if(nx>=0&&nz>=0&&nx<W&&nz<D)ch.add((nx>>4)+','+(nz>>4));}
      waterTouch(x,y,z);}
    for(let j=doors.length-1;j>=0;j--){const c=doors[j].cells[0],b=B[idx(c[0],c[1],c[2])];if(b!==20&&b!==21)doors.splice(j,1);}   // porta quebrada por outro jogador
    ch.forEach(k=>{const[a,b]=k.split(',');buildChunk(+a,+b);});
    fireAt.slice(0,6).forEach(([x,z])=>buildNear(x,z));
  }finally{netApply=false;}}
// ganchos: toda alteração local de bloco/porta entra numa fila e é enviada em lote (a cada ~0,12 s)
const _netBuildAt=buildAt;buildAt=function(x,y,z){_netBuildAt(x,y,z);if(netOn&&!netApply)netQ.add(idx(x,y,z));};
const _netRebuild=rebuildCells;rebuildCells=function(cells){_netRebuild(cells);
  if(netOn&&!netApply){cells.forEach(([x,y,z])=>netQ.add(idx(x,y,z)));const d=findDoor(cells[0][0],cells[0][1],cells[0][2]);if(d)netDr.push({cells:d.cells,s:d.s===-1?-1:1});}};
function netFlush(){if(!netQ.size&&!netDr.length)return;const d=[];
  for(const i of netQ){const v=B[i],o=netLast[i];if(v===o)continue;netLast[i]=v;if(v===8||(o===8&&v===0))continue;d.push(i,v);}   // água não é enviada (cada celular simula a sua)
  netQ.clear();const dr=netDr.splice(0);if(!d.length&&!dr.length)return;
  let k=0;do{netSend({t:'blk',d:d.slice(k,k+3000),dr:k?undefined:dr});k+=3000;}while(k<d.length);}
// ---------- outros jogadores ----------
// ---- boneco estilo Minecraft (proporções do Steve: cabeça 8, tronco 12, pernas 12; pele 64x64 pintada por código) ----
const NETSKINS=[['#f0c8a0','#4a3020'],['#d9a67a','#2a1c12'],['#b98860','#1a1210'],['#f5d5b8','#c89a50'],['#8d5a3b','#120c08'],['#e8b890','#8a3a1c']];   // [pele, cabelo]
const NETSHADE={top:1,front:.94,back:.8,right:.86,left:.86,bottom:.55};   // sombreamento "assado" na pele (o boneco não recebe luz)
// retângulos da pele (layout do Minecraft) de uma caixa w x h x d com canto superior esquerdo em (x,y)
const netRects=(x,y,w,h,d)=>({right:[x,y+d,d,h],front:[x+d,y+d,w,h],left:[x+d+w,y+d,d,h],back:[x+2*d+w,y+d,w,h],top:[x+d,y,w,d],bottom:[x+d+w,y,w,d]});
function netPaintSkin(cv,id,shirtHex){
  const g=cv.getContext('2d'),h=[...id].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7),sk=NETSKINS[h%NETSKINS.length];
  const hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
  const SK=hex(sk[0]),HR=hex(sk[1]),SH=hex(shirtHex),PN=[58,63,122],SO=[92,92,98],WH=[255,255,255];
  let seed=h;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const put=(x,y,c,sh)=>{const j=1+(rnd()-.5)*.1;g.fillStyle='rgb('+[0,1,2].map(i=>Math.max(0,Math.min(255,Math.round(c[i]*sh*j)))).join(',')+')';g.fillRect(x,y,1,1);};
  const rect=(r,c,f)=>{const sh=NETSHADE[f];for(let j=0;j<r[3];j++)for(let i=0;i<r[2];i++)put(r[0]+i,r[1]+j,c,sh);};
  const sub=(r,dx,dy,w,h2,c,f)=>rect([r[0]+dx,r[1]+dy,w,h2],c,f);
  // cabeça
  const hd=netRects(0,0,8,8,8);rect(hd.top,HR,'top');rect(hd.bottom,SK,'bottom');rect(hd.back,HR,'back');
  rect(hd.front,SK,'front');sub(hd.front,0,0,8,2,HR,'front');sub(hd.front,0,2,1,2,HR,'front');sub(hd.front,7,2,1,2,HR,'front');   // cabelo e costeletas
  sub(hd.front,1,3,2,1,HR,'front');sub(hd.front,5,3,2,1,HR,'front');                                                              // sobrancelhas
  for(const[ex,ic]of[[1,2],[6,5]]){put(hd.front[0]+ex,hd.front[1]+4,WH,.94);put(hd.front[0]+ic,hd.front[1]+4,[60,70,150],.94);}      // olhos
  sub(hd.front,3,5,2,1,SK.map(v=>v*.86),'front');sub(hd.front,3,6,2,1,[158,92,76],'front');                                        // nariz e boca
  for(const f of['right','left']){rect(hd[f],SK,f);sub(hd[f],0,0,8,2,HR,f);const bx0=f==='right'?0:5;sub(hd[f],bx0,2,3,3,HR,f);put(hd[f][0]+4,hd[f][1]+4,SK.map(v=>v*.8),NETSHADE[f]);}   // cabelo atrás e orelha
  // tronco (camisa na cor escolhida) e pescoço
  const tr=netRects(16,16,8,12,4);for(const f in tr)rect(tr[f],SH,f);sub(tr.front,2,0,4,1,SK,'front');sub(tr.front,0,11,8,1,SH.map(v=>v*.82),'front');
  // braços: manga curta (4 linhas) + pele
  for(const b of[[40,16],[32,48]]){const ar=netRects(b[0],b[1],4,12,4);for(const f in ar){rect(ar[f],SK,f);if(f==='top')rect(ar[f],SH,f);else if(f!=='bottom')sub(ar[f],0,0,ar[f][2],4,SH,f);}}
  // pernas: calça + sapato
  for(const b of[[0,16],[16,48]]){const lg=netRects(b[0],b[1],4,12,4);for(const f in lg){rect(lg[f],PN,f);if(f!=='top'&&f!=='bottom')sub(lg[f],0,10,lg[f][2],2,SO,f);if(f==='bottom')rect(lg[f],SO,f);}
    sub(lg.front,b[0]===0?3:0,0,1,12,PN.map(v=>v*.7),'front');}   // linha escura entre as duas pernas (borda interna de cada uma)
}
// caixa com a pele mapeada (ordem das faces do BoxGeometry: +x, -x, +y, -y, +z, -z; o boneco olha para -z)
function netBoxGeo(w,h,d,rects){const geo=new THREE.BoxGeometry(w,h,d),uv=geo.attributes.uv;
  ['right','left','top','bottom','back','front'].forEach((f,i)=>{const[x,y,rw,rh]=rects[f],u0=x/64,u1=(x+rw)/64,vt=1-y/64,vb=1-(y+rh)/64;
    uv.array.set(f==='top'?[u1,vb,u0,vb,u1,vt,u0,vt]:[u0,vt,u1,vt,u0,vb,u1,vb],i*8);});
  uv.needsUpdate=true;return geo;}
function netAvatar(id,name,col){const g=new THREE.Group(),U=3/32;
  const cv=document.createElement('canvas');cv.width=cv.height=64;netPaintSkin(cv,id,netCleanCol(col)||NETCOLS[parseInt(id,36)%NETCOLS.length]);
  const tex=new THREE.CanvasTexture(cv);tex.magFilter=tex.minFilter=THREE.NearestFilter;tex.generateMipmaps=false;
  const mat=new THREE.MeshBasicMaterial({map:tex});
  const part=(w,h,d,r)=>new THREE.Mesh(netBoxGeo(w*U,h*U,d*U,r),mat);
  const limb=(x,y,r,dy)=>{const p=new THREE.Group();p.position.set(x*U,y*U,0);const m=part(4,12,4,r);m.position.y=dy*U;p.add(m);g.add(p);return p;};
  // x>0 = lado direito do boneco (ele olha para -z)
  const legR=limb(2,12,netRects(0,16,4,12,4),-6),legL=limb(-2,12,netRects(16,48,4,12,4),-6);
  const armR=limb(6,22,netRects(40,16,4,12,4),-4),armL=limb(-6,22,netRects(32,48,4,12,4),-4);
  const torso=part(8,12,4,netRects(16,16,8,12,4));torso.position.y=18*U;g.add(torso);
  const head=new THREE.Group();head.position.y=24*U;g.add(head);   // pivô no pescoço: gira para cima/baixo conforme o outro olha
  const hm2=part(8,8,8,netRects(0,0,8,8,8));hm2.position.y=4*U;head.add(hm2);
  const item=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,.5),new THREE.MeshBasicMaterial({color:0xffffff}));item.position.set(0,-.95,-.3);item.visible=false;armR.add(item);   // bloco que o outro está segurando
  const nc=document.createElement('canvas');nc.width=256;nc.height=64;const c2=nc.getContext('2d');c2.font='bold 30px sans-serif';c2.textAlign='center';c2.fillStyle='#0008';c2.fillRect(8,8,240,48);c2.fillStyle='#fff';c2.fillText(String(name||'Jogador').slice(0,14),128,44);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(nc),transparent:true,depthTest:false}));sp.scale.set(2.4,.6,1);sp.position.y=3.45;sp.renderOrder=10;g.add(sp);
  return{g,legL,legR,armL,armR,head,item,tools:{},mat};}
// ferramenta na mão: o ícone em pixel art (js/ui/pixel-icons.js) extrudado em 3D, como no Minecraft; criado só quando o outro jogador usa a ferramenta
function netToolModel(id){const holder=new THREE.Group(),grid=pixToolGridById(id);
  if(grid){const s=({4:.07,6:.085,8:.065,13:.06})[id]||.1,pv=pixPivotById(id),m=pixExtrude(grid,s,s*2);m.position.set(-(pv[0]-8)*s,(pv[1]-8)*s,0);   // a mão segura o ponto do cabo
    holder.add(m);holder.rotation.y=Math.PI/2;holder.rotation.z=-.35;}   // o ícone fica de lado, com a ponta para cima e para a frente
  holder.visible=false;return holder;}
function netSetItem(p){const a=p.av;a.item.visible=false;for(const k in a.tools)a.tools[k].visible=false;
  if(p.k){let m=a.tools[p.k];if(!m){m=netToolModel(p.k);m.position.set(0,-.9,-.12);a.armR.add(m);a.tools[p.k]=m;}m.visible=true;}   // ferramenta tem prioridade
  else if(p.h){a.item.visible=true;a.item.material.color.set(T[p.h][1]);}}
function netFreeAv(a){scene.remove(a.g);a.g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose();}});}
function netPeer(m){if(!Number.isFinite(m.x)||!Number.isFinite(m.y)||!Number.isFinite(m.z))return;let p=netPeers[m.f];
  const nm=netCleanName(m.n)||'Jogador',cl=netCleanCol(m.c);
  if(!p){p={av:netAvatar(m.f,nm,cl),nm,cl,x:m.x,y:m.y,z:m.z,r:m.r||0,sp:0,ph:0,pi:0,tp:0,h:0,k:0,hb:0};scene.add(p.av.g);netPeers[m.f]=p;toast('👤 '+nm+' entrou na sala');netRefresh();}
  else if(p.nm!==nm||p.cl!==cl){netFreeAv(p.av);p.av=netAvatar(m.f,nm,cl);p.nm=nm;p.cl=cl;scene.add(p.av.g);netSetItem(p);}   // o outro mudou de nome ou de cor
  p.tp=Number.isFinite(m.p)?Math.max(-1.3,Math.min(1.3,m.p)):0;p.rd=m.rd?1:0;if(Number.isFinite(m.hr))p.hr=m.hr;
  const h=(Number.isInteger(m.h)&&T[m.h])?m.h:0,k=(Number.isInteger(m.k)&&m.k>0&&m.k<TOOLS.length)?m.k:0;if(p.h!==h||p.k!==k||!p.hs){p.h=h;p.k=k;p.hs=1;netSetItem(p);}
  p.tx=m.x;p.ty=m.y;p.tz=m.z;p.tr=Number.isFinite(m.r)?m.r:p.r;p.seen=performance.now();}
function netFreeGhost(p){if(!p.gh)return;scene.remove(p.gh);p.gh.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose();}});p.gh=null;}
function netDropPeer(id,quiet){const p=netPeers[id];if(!p)return;netFreeAv(p.av);netFreeGhost(p);
  delete netPeers[id];if(!quiet){toast('👤 Um jogador saiu da sala');netRefresh();}}
function netUpdPeers(dt,now){const k=1-Math.exp(-dt*12);
  for(const id in netPeers){const p=netPeers[id];if(now-p.seen>6000){netDropPeer(id);continue;}
    const ox=p.x,oz=p.z;p.x+=(p.tx-p.x)*k;p.y+=(p.ty-p.y)*k;p.z+=(p.tz-p.z)*k;
    let dr=p.tr-p.r;dr=Math.atan2(Math.sin(dr),Math.cos(dr));p.r+=dr*k;
    const v=Math.hypot(p.x-ox,p.z-oz)/Math.max(dt,.001);p.sp+=(Math.min(v/(4.5/S),1)-p.sp)*Math.min(1,dt*8);p.ph+=dt*9*p.sp;
    const a=p.av,sw=Math.sin(p.ph)*.9*p.sp;a.g.position.set(p.x,p.y,p.z);a.g.rotation.y=p.r;
    if(typeof uDark!=='undefined'){const kb=Math.max(.35,uDark.value);a.mat.color.setRGB(kb,kb,kb);}   // escurece à noite como o resto do mundo
    p.pi+=(p.tp-p.pi)*k;p.hb+=(((p.h||p.k)?.8:0)-p.hb)*Math.min(1,dt*10);   // cabeça acompanha o olhar; braço direito levanta quando segura algo
    a.head.rotation.x=p.pi;a.legL.rotation.x=sw;a.legR.rotation.x=-sw;a.armL.rotation.x=-sw;a.armR.rotation.x=sw*(1-p.hb)+p.hb;
    if(p.rd){   // o outro está montado: aparece sentado num cavalo selado (só visual; os animais não são sincronizados)
      if(!p.gh){p.gh=mk('horse');horsePose(p.gh);addSaddle({g:p.gh});scene.add(p.gh);p.ghr=p.hr||0;}
      let dh=(p.hr||0)-p.ghr;dh=Math.atan2(Math.sin(dh),Math.cos(dh));p.ghr+=dh*k;
      p.gh.position.set(p.x,p.y-.88,p.z);p.gh.rotation.y=p.ghr;
      const gs=Math.sin(p.ph*1.3)*.8*Math.min(1,p.sp*1.5);p.gh.userData.legs.forEach((l,i)=>{l.rotation.x=i%2?gs:-gs;});
      a.g.position.y=p.y-.2;a.legL.rotation.x=a.legR.rotation.x=.45;a.armL.rotation.x=a.armR.rotation.x=.35;}
    else if(p.gh)netFreeGhost(p);}}
// chamado todo quadro por core/loop.js
function netTick(dt,now){
  if(netAuto){const c=netAuto;netAuto='';netOpen();netStatus('Entrando na sala '+c+'…');netJoin(c);}
  if(!netOn)return;
  if(netReady){netT+=dt;if(netT>=.12){netT=0;netFlush();}
    netPT+=dt;if(netPT>=.125){const tl=(typeof tool==='number'&&tool>0&&tool<TOOLS.length)?tool:0,hd=(typeof names!=='undefined'&&Number.isInteger(names[cur])&&T[names[cur]])?names[cur]:0,key=[P.x.toFixed(2),P.y.toFixed(2),P.z.toFixed(2),P.yaw.toFixed(2),P.pitch.toFixed(1),hd,tl,mounted?1:0].join();
      if(key!==netPosKey||netPT>=1){netPosKey=key;netPT=0;netSend({t:'ps',n:netProf.n,c:netProf.c,x:+P.x.toFixed(2),y:+P.y.toFixed(2),z:+P.z.toFixed(2),r:+P.yaw.toFixed(2),p:+P.pitch.toFixed(2),h:hd,k:tl,rd:mounted?1:0,hr:mounted?+mounted.rot.toFixed(2):0});}}
    if(netHost){netTm+=dt;if(netTm>15){netTm=0;netSend({t:'tm',d:dayT});}}}
  netUpdPeers(dt,now);}
// ---------- painel ----------
function netOpen(){netEl('net').style.display='flex';netRefresh();}
netEl('nx').onclick=()=>{netEl('net').style.display='none';};
netEl('ncreate').onclick=()=>{if(!netOn)netCreate();};
netEl('njoinb').onclick=()=>{if(!netOn)netJoin(netEl('nin').value);};
netEl('ncopy').onclick=()=>{const l=netLink();if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(l).then(()=>toast('🔗 Link copiado'),()=>prompt('Copie o link:',l));else prompt('Copie o link:',l);};
netEl('nleave').onclick=netLeave;
['nin','nname'].forEach(id=>['keydown','keyup','keypress'].forEach(ev=>netEl(id).addEventListener(ev,e=>e.stopPropagation())));
netEl('nname').value=netProf.n;
netEl('nname').oninput=()=>{const v=netCleanName(netEl('nname').value);if(v){netProf.n=v;netSaveProf();}};
netEl('nname').onchange=()=>{netEl('nname').value=netProf.n;};
function netDrawCols(){netEl('ncols').innerHTML=NETCOLS.map(c=>'<span class="ncol'+(c===netProf.c?' on':'')+'" data-c="'+c+'" style="background:'+c+'"></span>').join('');}
netDrawCols();
netEl('ncols').onclick=e=>{const c=e.target&&e.target.dataset&&e.target.dataset.c;if(c&&netCleanCol(c)){netProf.c=c;netSaveProf();netDrawCols();}};   // digitar o código não pode mexer o jogador
['netopen','netopen2'].forEach(id=>{const e=netEl(id);if(e)e.onclick=ev=>{ev.stopPropagation();netOpen();};});
addEventListener('pagehide',()=>{if(netOn)netSend({t:'bye'});});
