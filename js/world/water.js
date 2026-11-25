/* MiniBlocos · Água que preenche buracos e seca quando a fonte some */
// WTY (por célula) = tipo da água:  0 = natural (fonte, permanente)   1..7 = água que escorreu (distância da fonte; 7 não escorre mais)
//                                  8 = despejada do balde (fonte que não escorre para os lados)
// Água que escorreu só existe enquanto estiver "alimentada": água acima dela, ou uma vizinha lateral com WTY menor. Sem isso, seca.
const WTY=new Uint8Array(W*D*H),WMAX=7,WSRC=8,wq=[],wset=new Set(),wRef=[],wHold=new Set(),wFlow=new Set(),wDirty=new Set(),W4=[[1,0],[-1,0],[0,1],[0,-1]];
let wAcc=0;
function wEnq(x,y,z){if(x<0||y<0||z<0||x>=W||y>=H||z>=D)return;const i=idx(x,y,z);if(!wset.has(i)){wset.add(i);wq.push(i);}}
// avisa que algo mudou nesta posição: ela e as vizinhas serão reavaliadas (enchem ou secam)
function waterTouch(x,y,z){wEnq(x,y,z);wEnq(x+1,y,z);wEnq(x-1,y,z);wEnq(x,y+1,z);wEnq(x,y-1,z);wEnq(x,y,z+1);wEnq(x,y,z-1);}
// a água que escorreu (WTY w) está alimentada?
function waterFed(x,y,z,w){if(get(x,y+1,z)===8)return true;
  for(const d of W4)if(get(x+d[0],y,z+d[1])===8&&WTY[idx(x+d[0],y,z+d[1])]<w)return true;
  return false;}
// WTY que a água teria neste espaço vazio, ou -1 se nenhuma água válida chega até ele
function waterFillWD(x,y,z){
  if(get(x,y+1,z)===8){const a=WTY[idx(x,y+1,z)];if(a===0||a===WSRC||waterFed(x,y+1,z,a))return a===0?1:(a===WSRC?WMAX:a);}   // cai de cima
  let best=99;for(const d of W4){const nx=x+d[0],nz=z+d[1];if(get(nx,y,nz)===8){const w=WTY[idx(nx,y,nz)];if(w<WMAX&&w+1<best&&(w===0||waterFed(nx,y,nz,w)))best=w+1;}}
  return best<99?best:-1;}
function wMark(x,z){wDirty.add((x>>4)+','+(z>>4));if((x&15)===0)wDirty.add(((x>>4)-1)+','+(z>>4));if((x&15)===15)wDirty.add(((x>>4)+1)+','+(z>>4));
  if((z&15)===0)wDirty.add((x>>4)+','+((z>>4)-1));if((z&15)===15)wDirty.add((x>>4)+','+((z>>4)+1));}
function wSet(i,x,y,z,w){B[i]=8;WTY[i]=w;if(w>0)wFlow.add(i);else wFlow.delete(i);wMark(x,z);waterTouch(x,y,z);}
function wFill(x,y,z){const i=idx(x,y,z);if(B[i]!==0||wHold.has(i))return false;const w=waterFillWD(x,y,z);if(w<0)return false;wSet(i,x,y,z,w);return true;}
function wDrain(x,y,z){const i=idx(x,y,z);B[i]=0;WTY[i]=0;wFlow.delete(i);wMark(x,z);waterTouch(x,y,z);}
// balde despejou água aqui
function waterPoured(x,y,z){const i=idx(x,y,z);WTY[i]=WSRC;wFlow.add(i);waterTouch(x,y,z);}
// balde pegou água aqui: o buraco é preenchido de novo em instantes (com o mesmo tipo de água de antes) se ainda houver água válida ao lado ou acima
function waterRefill(x,y,z){const i=idx(x,y,z);wHold.add(i);wRef.push({x,y,z,i,w0:WTY[i],t:.8});}
function updateWater(dt){
  wAcc+=dt;if(wAcc<.1)return;wAcc=0;
  for(let k=wRef.length-1;k>=0;k--){const r=wRef[k];r.t-=.1;if(r.t<=0){wRef.splice(k,1);wHold.delete(r.i);
    if(B[r.i]===0&&waterFillWD(r.x,r.y,r.z)>=0)wSet(r.i,r.x,r.y,r.z,r.w0);else waterTouch(r.x,r.y,r.z);}}
  let n=0;
  while(wq.length&&n<20){const i=wq.shift();wset.delete(i);n++;const x=i%W,y=(i/(W*D))|0,z=((i/W)|0)%D;
    if(B[i]===0)wFill(x,y,z);
    else if(B[i]===8&&WTY[i]>0&&WTY[i]<WSRC&&!waterFed(x,y,z,WTY[i]))wDrain(x,y,z);}   // sem alimentação: seca
  if(wDirty.size){for(const k of wDirty){const p=k.split(','),cx=+p[0],cz=+p[1];if(cx>=0&&cz>=0&&cx<W/CS&&cz<D/CS)buildChunk(cx,cz);}wDirty.clear();}}
// salvar/restaurar a água que não é natural: lista plana [índice, tipo, índice, tipo...]
function waterToSave(){const a=[];for(const i of wFlow)if(B[i]===8&&WTY[i]>0)a.push(i,WTY[i]);return a;}
function waterFromSave(a){if(!Array.isArray(a))return;const n=Math.min(a.length,400000);
  for(let k=0;k+1<n;k+=2){const i=a[k],w=a[k+1];if(Number.isInteger(i)&&i>=0&&i<B.length&&Number.isInteger(w)&&w>0&&w<=WSRC&&B[i]===8){WTY[i]=w;wFlow.add(i);wEnq(i%W,(i/(W*D))|0,((i/W)|0)%D);}}}
