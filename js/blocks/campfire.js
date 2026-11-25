/* MiniBlocos · Assar carne na fogueira */
function tryCook(){const r=ray();if(!r||B[idx(r.x,r.y,r.z)]!==14)return false;
  if(meat<=0){toast(cooks.length?'Ainda assando...':'Sem carne crua para assar');return true;}
  const n=meat;meat=0;cooks.push({t:3+n,n});toast('🔥 Assando '+n+' carne...');return true;}
// persistência da carne que está assando
function cooksToSave(){return cooks.map(c=>({t:c.t,n:c.n}));}
function cooksFromSave(a){if(!Array.isArray(a))return;cooks.length=0;
  for(const c of a){if(c&&typeof c.t==='number'&&isFinite(c.t)&&c.n>=1){const n=Math.min(Math.floor(c.n),9999);cooks.push({t:Math.min(Math.max(c.t,0),3+n),n});}}}
