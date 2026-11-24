/* MiniBlocos · HUD: corações, fome, ar, toast e flash de dano */
const hudEl=document.getElementById('hearts'),foodEl=document.getElementById('food'),airEl=document.getElementById('air'),eatEl=document.getElementById('eatbtn');
const HS=c=>'<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.5-8 11-8 11z" fill="'+c+'"/></svg>';
const FS=c=>'<svg viewBox="0 0 24 24"><ellipse cx="9.5" cy="9.5" rx="7" ry="6.5" transform="rotate(-45 9.5 9.5)" fill="'+c+'"/><path d="M14 14l6 6" stroke="#f2e6c8" stroke-width="3" stroke-linecap="round"/><circle cx="20.5" cy="18" r="1.8" fill="#f2e6c8"/><circle cx="18" cy="20.5" r="1.8" fill="#f2e6c8"/></svg>';
const AS=c=>'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7.5" fill="'+c+'" stroke="#cfe8ff" stroke-width="1.6"/></svg>';
function icons(v,full,empty,fn){let s='';for(let i=0;i<10;i++){const u=v-i*2;s+='<span class="hi">'+fn(empty)+(u>0?'<span class="hf" style="clip-path:inset(0 '+(u>=2?0:50)+'% 0 0)">'+fn(full)+'</span>':'')+'</span>';}return s;}
function updateHud(){const key=hp+','+food+','+Math.ceil(air)+','+meat+','+apples+','+cooked;if(key===hudKey)return;hudKey=key;
  hudEl.innerHTML=icons(hp,'#e23b3b','#3b2a2a',HS);foodEl.innerHTML=icons(food,'#c86a2a','#3a3028',FS);
  const ca=Math.max(0,Math.ceil(air));airEl.style.display=ca<10?'flex':'none';airEl.innerHTML=icons(ca*2,'#6cc4ff','#2a3a48',AS);
  eatEl.textContent='🍖 Comer ('+(cooked+meat+apples)+')';}
function toast(t){const e=document.getElementById('toast');e.textContent=t;e.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>e.style.display='none',2400);}
function flash(){const h=document.getElementById('hurt');h.style.transition='none';h.style.opacity='.9';setTimeout(()=>{h.style.transition='opacity .6s';h.style.opacity='0';},40);}
