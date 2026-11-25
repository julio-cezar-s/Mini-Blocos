/* MiniBlocos · Leitura do save (localStorage + RLE) */
// salvar/carregar mundo (localStorage, blocos comprimidos por RLE)
const SAVE_KEY='miniblocos_v1';let SV=null,noSave=!!NETQ.get('sala'),loadWarn='';
{let raw=null;
  try{raw=NETQ.get('sala')?null:localStorage.getItem(SAVE_KEY);if(raw){const o=JSON.parse(raw);if(o&&o.v===1&&o.w===W&&o.d===D&&o.h===H&&typeof o.b==='string'){
    const bin=atob(o.b),tmp=new Uint8Array(B.length);let pos=0;
    for(let k=0;k<bin.length;k+=2){const c=bin.charCodeAt(k+1);tmp.fill(bin.charCodeAt(k),pos,pos+c);pos+=c;}
    // só aceita se todos os ids de bloco forem conhecidos (um id inválido quebraria a geração das malhas)
    const okId=new Uint8Array(256);okId[0]=1;for(const k in T)okId[+k]=1;for(let q=26;q<=33;q++)okId[q]=1;
    let valid=pos===B.length;for(let i=0;valid&&i<tmp.length;i++)if(!okId[tmp[i]])valid=false;
    if(valid){B.set(tmp);SV=o;if(Number.isFinite(o.seed))SEED=o.seed;}}}}
  catch(e){SV=null;}
  // save que existe mas não pôde ser lido: guarda uma cópia antes de ele ser sobrescrito pelo mundo novo
  if(raw&&!SV){try{localStorage.setItem(SAVE_KEY+'_backup',raw);}catch(e){}
    loadWarn='\u26a0\ufe0f O save anterior \u00e9 de outro tamanho de mundo ou n\u00e3o p\u00f4de ser lido. Uma c\u00f3pia foi guardada e um mundo novo foi criado.';}}
if(SV)for(let x=0;x<W;x++)for(let z=0;z<D;z++){let y=H-1;while(y>0&&!B[idx(x,y,z)])y--;hm[x*D+z]=y;}
