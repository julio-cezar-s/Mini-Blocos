/* MiniBlocos · Mapa do mundo */
// mapa do mundo todo
let mapOpen=false;
const mapEl=document.getElementById('map'),mcv=document.getElementById('mc'),mctx=mcv.getContext('2d'),mb=document.createElement('canvas');
mb.width=W;mb.height=D;
const MC={1:'#5fae3c',2:'#7b5130',3:'#8a8a8a',4:'#6e4f26',5:'#2f8a2f',6:'#c9a05a',7:'#e4d58f',8:'#3a78c8',9:'#f4f8fb',10:'#454545',11:'#c8a98a',12:'#e8c93a',13:'#2f7a2f',14:'#ff7a1a',15:'#ffe27a',16:'#b02a2e',17:'#cfe8f5',18:'#966630',19:'#c4572f',20:'#8a5a2c',21:'#8a5a2c',22:'#ac7e46',23:'#7a7a7a',34:'#8a8886',35:'#9aa2b4',36:'#963e30',37:'#808080',38:'#6a8a5a',39:'#b8b8ba',40:'#e07a1a',41:'#dcbc50',42:'#ececee',43:'#dcac3e',44:'#7a726e',45:'#cc7034',46:'#60e0e8',47:'#d6d6dc',48:'#fad43a',49:'#242428',50:'#64e2e8'},MCol={};
for(const k in MC)MCol[k]=new THREE.Color(MC[k]);
function drawMapBase(){const g=mb.getContext('2d'),im=g.createImageData(W,D);
  for(let z=0;z<D;z++)for(let x=0;x<W;x++){let y=H-1;while(y>0&&!B[idx(x,y,z)])y--;
    const t=B[idx(x,y,z)],c=MCol[t]||MCol[3],f=t===8?1:.72+.5*y/H,o=(z*W+x)*4;
    im.data[o]=c.r*255*f;im.data[o+1]=c.g*255*f;im.data[o+2]=c.b*255*f;im.data[o+3]=255;}
  g.putImageData(im,0,0);}
function drawMap(){const s=mcv.width,k=s/W;mctx.imageSmoothingEnabled=false;mctx.drawImage(mb,0,0,s,s);
  mctx.fillStyle='#fff';animals.forEach(a=>mctx.fillRect(a.x*k-2,a.z*k-2,4,4));
  if(pin){const qx=pin.x*k,qz=pin.z*k;   // linha tracejada até o alfinete e o alfinete
    mctx.save();mctx.setLineDash([6,5]);mctx.strokeStyle='#fffc';mctx.lineWidth=2;mctx.beginPath();mctx.moveTo(P.x*k,P.z*k);mctx.lineTo(qx,qz);mctx.stroke();mctx.restore();
    mctx.fillStyle='#ff3b3b';mctx.strokeStyle='#fff';mctx.lineWidth=2;mctx.beginPath();mctx.moveTo(qx,qz);mctx.lineTo(qx-6,qz-10);mctx.lineTo(qx+6,qz-10);mctx.closePath();mctx.fill();
    mctx.beginPath();mctx.arc(qx,qz-14,7,0,6.283);mctx.fill();mctx.stroke();mctx.fillStyle='#fff';mctx.beginPath();mctx.arc(qx,qz-14,2.5,0,6.283);mctx.fill();}
  const px=P.x*k,pz=P.z*k,dx=-Math.sin(P.yaw),dz=-Math.cos(P.yaw);
  mctx.fillStyle='#e22';mctx.strokeStyle='#fff';mctx.lineWidth=2;mctx.beginPath();
  mctx.moveTo(px+dx*11,pz+dz*11);mctx.lineTo(px-dx*6-dz*6,pz-dz*6+dx*6);mctx.lineTo(px-dx*6+dz*6,pz-dz*6-dx*6);mctx.closePath();mctx.fill();mctx.stroke();
  mctx.fillStyle='#fff';mctx.font='bold 16px sans-serif';mctx.fillText('N',s/2-5,16);}
function toggleMap(){mapOpen=!mapOpen;mapEl.style.display=mapOpen?'flex':'none';
  if(mapOpen){drawMapBase();drawMap();if(locked)document.exitPointerLock();if(isTouch)playing=false;}
  else{if(isTouch)playing=msg.style.display==='none';else lockPointer();}}
document.getElementById('mapbtn').onclick=toggleMap;
document.getElementById('mx').onclick=()=>{if(mapOpen)toggleMap();};

// ---- alfinete: toque no mapa marca um lugar; uma seta no canto da tela aponta para ele ----
let pin=null;
const pinEl=document.createElement('div');pinEl.id='pinarrow';
pinEl.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 2l7 18-7-4-7 4z" fill="#ff3b3b" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg><span></span>';
document.body.appendChild(pinEl);
const pinClr=document.getElementById('pinclr');
function setPin(x,z){pin=(x==null)?null:{x:x,z:z};pinClr.style.display=pin?'inline-block':'none';updatePin();if(mapOpen)drawMap();}
function restorePin(p){if(p&&typeof p==='object'&&typeof p.x==='number'&&typeof p.z==='number'&&isFinite(p.x)&&isFinite(p.z))setPin(Math.min(W,Math.max(0,p.x)),Math.min(D,Math.max(0,p.z)));}
mcv.addEventListener('click',e=>{const r=mcv.getBoundingClientRect(),bw=mcv.clientLeft,bh=mcv.clientTop;
  const x=(e.clientX-r.left-bw)/(r.width-2*bw)*W,z=(e.clientY-r.top-bh)/(r.height-2*bh)*D;
  if(x<0||z<0||x>W||z>D)return;setPin(x,z);toast('📍 Alfinete marcado');});
pinClr.onclick=()=>{setPin(null);toast('📍 Alfinete removido');};
let pinTxt='';
function updatePin(){
  if(!pin){pinEl.style.display='none';return;}
  const dx=pin.x-P.x,dz=pin.z-P.z,d=Math.hypot(dx,dz);
  if(d<2.5&&playing){toast('📍 Você chegou ao alfinete!');setPin(null);return;}
  const sn=Math.sin(P.yaw),cs=Math.cos(P.yaw),fw=-dx*sn-dz*cs,rt=dx*cs-dz*sn;   // frente/direita em relação a para onde você olha
  pinEl.style.display='flex';pinEl.firstChild.style.transform='rotate('+Math.atan2(rt,fw).toFixed(3)+'rad)';
  const tx=Math.round(d)+' m';if(tx!==pinTxt){pinTxt=tx;pinEl.lastChild.textContent=tx;}}
