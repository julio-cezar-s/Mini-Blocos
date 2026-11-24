/* MiniBlocos · Barra de itens, seletor de bloco (picker) e renderBar/pick */
const bar=document.getElementById('bar');
let pkOpen=false;
function closePk(){document.getElementById('pk').style.display='none';pkOpen=false;}
function openPk(){const pk=document.getElementById('pk');pk.innerHTML='';
  ALL.forEach(t=>{const d=document.createElement('div');d.className='pi'+(names[cur]===t?' on':'');
    d.innerHTML=cube(t)+'<b>'+inv[t]+'</b><i>'+nm[t]+'</i>';
    d.onclick=e=>{e.stopPropagation();const j=names.indexOf(t);if(j>=0&&j!==cur)names[j]=names[cur];names[cur]=t;closePk();renderBar();};pk.appendChild(d);});
  pk.style.display='flex';pkOpen=true;}
document.addEventListener('click',()=>{if(pkOpen)closePk();});
names.forEach((t,i)=>{const d=document.createElement('div');d.className='slot';
  d.onclick=e=>{e.stopPropagation();if(i===cur&&!pkOpen)openPk();else{closePk();pick(i);}};bar.appendChild(d);});
// O DOM de cada slot é criado uma vez; depois só muda o que mudou (ícone ao trocar de bloco, número ao mudar a quantidade).
function renderBar(){[...bar.children].forEach((d,i)=>{const t=names[i];
  if(!d._s){d.innerHTML='<span></span><img><b></b>';d._s=d.children[0];d._i=d.children[1];d._b=d.children[2];d._s.textContent=i+1;d._t=-1;d._n=-1;}
  d.style.background='';
  if(d._t!==t){d._i.src=cubeSrc(t);d._t=t;}
  const n=inv[t];if(d._n!==n){d._b.textContent=n;d._n=n;}
  d.classList.toggle('on',i===cur);d.classList.toggle('z',n<=0);});}
function pick(i){cur=(i+names.length)%names.length;renderBar();}
