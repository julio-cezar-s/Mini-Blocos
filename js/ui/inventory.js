/* MiniBlocos · Painel do inventário, arrastar e soltar, botão da mochila */
const invEl=document.getElementById('inv'),grid=document.getElementById('grid');let invOpen=false;
function assign(i,t){const j=names.indexOf(t);if(j>=0&&j!==i)names[j]=names[i];names[i]=t;cur=i;renderBar();renderInv();}
function swapSlots(a,b){[names[a],names[b]]=[names[b],names[a]];cur=b;renderBar();renderInv();}
let lastDrag=0;
function drag(el,data){   // mouse: arrasta após 8px | toque: segure ~0,25s e arraste (deslizar antes disso rola o painel)
  el.addEventListener('pointerdown',e=>{
    const x0=e.clientX,y0=e.clientY,touch=e.pointerType==='touch';
    let g=null,on=false,armed=!touch,timer=0;
    const noScroll=ev=>{if(armed&&ev.cancelable)ev.preventDefault();};
    const end=()=>{clearTimeout(timer);el.classList.remove('arm');
      removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);removeEventListener('touchmove',noScroll);};
    const mv=ev=>{
      if(!on&&Math.hypot(ev.clientX-x0,ev.clientY-y0)>8){
        if(!armed){end();return;}   // o dedo andou antes do toque longo: é rolagem do painel
        on=true;g=document.createElement('div');g.className='ghost';g.innerHTML=cube(data.t);document.body.appendChild(g);}
      if(on){g.style.left=ev.clientX+'px';g.style.top=ev.clientY+'px';}};
    const up=ev=>{end();
      if(on){lastDrag=Date.now();g.remove();const e2=document.elementFromPoint(ev.clientX,ev.clientY),hs=e2&&e2.closest('.hs');
        if(hs){const i=+hs.dataset.i;if(data.s!==undefined)swapSlots(data.s,i);else assign(i,data.t);}}};
    if(touch)timer=setTimeout(()=>{armed=true;el.classList.add('arm');},260);
    addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up);
    if(touch)addEventListener('touchmove',noScroll,{passive:false});});}
function renderInv(){grid.innerHTML='';
  const l0=document.createElement('div');l0.className='lbl';l0.textContent=isTouch?'Barra de itens: toque num slot e depois num bloco, ou segure e arraste':'Barra de itens: toque num slot e depois num bloco, ou arraste';grid.appendChild(l0);
  names.forEach((t,i)=>{const d=document.createElement('div');d.className='it hs'+(i===cur?' sel':'');d.dataset.i=i;
    d.innerHTML='<i>'+(i+1)+'</i>'+cube(t)+'<b>'+inv[t]+'</b>';
    d.onclick=()=>{if(Date.now()-lastDrag<300)return;cur=i;renderBar();renderInv();};drag(d,{t,s:i});grid.appendChild(d);});
  const l1=document.createElement('div');l1.className='lbl';l1.textContent='Blocos';grid.appendChild(l1);
  ALL.forEach(t=>{const d=document.createElement('div');d.className='it';
    d.innerHTML='<i>'+nm[t]+'</i>'+cube(t)+'<b>'+inv[t]+'</b>';
    d.onclick=()=>{if(Date.now()-lastDrag<300)return;assign(cur,t);};drag(d,{t});grid.appendChild(d);});
  const l=document.createElement('div');l.className='lbl';l.textContent='Ferramentas';grid.appendChild(l);
  TOOLS.forEach((o,i)=>{const d=document.createElement('div');d.className='it';d.style.background='#3a3a3a';
    if(i===tool)d.style.borderColor='#fff';const own=OWN[i];if(!own)d.style.opacity='.35';d.innerHTML='<i>'+o.n+'</i>'+ICONS[i]+(own&&o.mx?toolBarHTML(i,3):'');
    d.onclick=()=>{if(!own){toast('🔒 '+o.n+': fabrique na bancada');return;}setTool(i);if(o.d)toast(o.n+': '+o.d);};grid.appendChild(d);});}
function toggleInv(){invOpen=!invOpen;invEl.style.display=invOpen?'flex':'none';
  if(invOpen){renderInv();if(locked)document.exitPointerLock();if(isTouch)playing=false;}
  else{if(isTouch)playing=msg.style.display==='none';else lockPointer();}}
document.getElementById('ib').onclick=toggleInv;
document.getElementById('ix').onclick=()=>{if(invOpen)toggleInv();};
