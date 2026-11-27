/* MiniBlocos · Ícones das ferramentas em pixel art 16x16 (estilo Minecraft), gerados por código */
// pixGrid → desenha com pixSet/pixPatch/pixLine → pixOutline (contorno escuro) → pixSvg (retângulos nítidos, sem suavização)
const PIX_OUT='#1b1411';
// paletas por material: [escuro, médio, claro, brilho]
const TIERPAL={madeira:['#6e4a22','#8d6130','#a8793b','#c9a56a'],pedra:['#5c5c5c','#7a7a7a','#979797','#b9b9b9'],ferro:['#8c959d','#bcc4cb','#dbe1e6','#f6f9fb'],ouro:['#c68a0e','#f0bc20','#f8d95a','#fff3a6'],diamante:['#1c9fa8','#33cfd6','#76eef1','#c6fcfd']};
const PIXHANDLE=['#4a2f14','#6b4423','#8a5a2b'];   // cabo: escuro, médio, claro
function pixGrid(){const g=[];for(let y=0;y<16;y++)g.push(new Array(16).fill(null));return g;}
function pixSet(g,x,y,c){if(c&&x>=0&&y>=0&&x<16&&y<16)g[y][x]=c;}
function pixPatch(g,x0,y0,rows,pal){rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){const k=r[i];if(k!=='.'&&k!==' ')pixSet(g,x0+i,y0+j,pal[k]);}});}
function pixLine(g,x0,y0,x1,y1,fn){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++){const t=n?i/n:0;fn(Math.round(x0+(x1-x0)*t),Math.round(y0+(y1-y0)*t),i);}}
function pixOutline(g,col){const o=g.map(r=>r.slice());
  for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(!g[y][x])for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<16&&ny<16&&g[ny][nx]){o[y][x]=col;break;}}
  return o;}
function pixSvg(g){let s='';for(let y=0;y<16;y++){let x=0;while(x<16){const c=g[y][x];if(!c){x++;continue;}let w=1;while(x+w<16&&g[y][x+w]===c)w++;s+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="1" fill="'+c+'"/>';x+=w;}}
  return '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" style="image-rendering:pixelated">'+s+'</svg>';}
// cabo diagonal (de baixo-esquerda para cima-direita)
function pixHandle(g,x0,y0,x1,y1){const[d,m,l]=PIXHANDLE;pixLine(g,x0,y0,x1,y1,(x,y,i)=>{pixSet(g,x,y,i%2?l:m);pixSet(g,x+1,y,d);});}
// ---- ferramentas com material (t = 'madeira' | 'pedra' | 'ferro' | 'ouro' | 'diamante') ----
function pixShovel(t){const g=pixGrid(),c=TIERPAL[t],P={'1':c[0],'2':c[1],'3':c[2],'4':c[3]};
  pixHandle(g,2,13,8,7);
  pixPatch(g,7,0,['...4433','..443322','.4433222','.4332221','.3322211','..22211.','...111..'],P);   // pá: lâmina de ponta arredondada
  return pixOutline(g,PIX_OUT);}
// preenche um polígono (pixel dentro = centro do pixel dentro do polígono); fn(x,y) devolve a cor
function pixPoly(g,pts,fn){for(let y=0;y<16;y++)for(let x=0;x<16;x++){let ins=false;const px=x+.5,py=y+.5;
  for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if((yi>py)!==(yj>py)&&px<(xj-xi)*(py-yi)/(yj-yi)+xi)ins=!ins;}
  if(ins)pixSet(g,x,y,fn(x,y));}}
function pixAxe(t){const g=pixGrid(),c=TIERPAL[t];
  pixHandle(g,2,13,9,6);
  // cabeça de machado: quadrilátero com o gume reto (de (5,0) a (1,6)), mais claro perto do gume e mais escuro perto do cabo
  const E=[[5,0],[1,6]],len=Math.hypot(E[1][0]-E[0][0],E[1][1]-E[0][1]);
  pixPoly(g,[[5,0],[11,2],[10,8],[1,6]],(x,y)=>{const d=Math.abs((E[1][0]-E[0][0])*(E[0][1]-(y+.5))-(E[0][0]-(x+.5))*(E[1][1]-E[0][1]))/len;return d<1.4?c[3]:d<2.8?c[2]:d<4.6?c[1]:c[0];});
  pixLine(g,5,0,1,6,(x,y)=>pixSet(g,x,y,c[3]));   // fio do gume
  return pixOutline(g,PIX_OUT);}
function pixPick(t){const g=pixGrid(),c=TIERPAL[t];
  pixHandle(g,2,13,10,5);
  // cabeça em arco (curva de Bézier), perpendicular ao cabo, com as pontas caindo para o lado do cabo; faixa grossa sem falhas
  const A=[4,5],C=[12,-1],B=[13,10];
  for(let i=0;i<=40;i++){const q=i/40,x=Math.round((1-q)*(1-q)*A[0]+2*q*(1-q)*C[0]+q*q*B[0]),y=Math.round((1-q)*(1-q)*A[1]+2*q*(1-q)*C[1]+q*q*B[1]);
    pixSet(g,x-1,y+1,c[0]);pixSet(g,x,y+1,c[1]);pixSet(g,x-1,y,c[1]);pixSet(g,x,y,c[2]);}
  for(let i=0;i<=40;i++){const q=i/40,x=Math.round((1-q)*(1-q)*A[0]+2*q*(1-q)*C[0]+q*q*B[0]),y=Math.round((1-q)*(1-q)*A[1]+2*q*(1-q)*C[1]+q*q*B[1]);
    if(i>8&&i<32)pixSet(g,x+1,y-1,c[3]);}   // brilho no lado de fora
  return pixOutline(g,PIX_OUT);}
function pixSword(t){const g=pixGrid(),c=TIERPAL[t],gold=['#b8860b','#e0b030','#f5d36a'],[d,m,l]=PIXHANDLE;
  for(let i=0;i<=9;i++){const x=14-i,y=1+i;pixSet(g,x,y,c[2]);pixSet(g,x-1,y,c[1]);if(i<8)pixSet(g,x+1,y,c[3]);}   // lâmina com fio claro
  pixSet(g,15,0,c[3]);pixSet(g,14,0,c[2]);                                                                          // ponta
  pixLine(g,3,8,7,12,(x,y,i)=>pixSet(g,x,y,i%2?gold[1]:gold[2]));pixSet(g,3,8,gold[0]);pixSet(g,7,12,gold[0]);        // guarda dourada
  pixSet(g,4,11,m);pixSet(g,3,12,l);pixSet(g,2,13,gold[1]);pixSet(g,1,14,gold[0]);                                     // cabo e pomo
  return pixOutline(g,PIX_OUT);}
// ---- demais itens ----
const PIXFIXED={
 hand:()=>{const g=pixGrid(),P={a:'#e8b98a',b:'#d49c6a',c:'#f3cfa8'};
  pixPatch(g,3,1,['..c.c.c.....','.cac.aca.c..','.cac.aca.ac.','.cac.aca.ac.','.cab.aba.ab.','.cab.aba.ab.','.cabbbbbbabc','.cabbbbbbbb.','..abbbbbbb..','...abbbbbb..','...aabbbbb..','....aabbb...'],P);
  return pixOutline(g,PIX_OUT);},
 bucket:(full)=>{const g=pixGrid(),P={r:'#6f7780',m:'#b8c0c8',l:'#dde3e8',d:'#7f8890',w:full?'#3a78c8':'#4a4f55',v:full?'#6aa6ee':'#5a6068'};
  pixPatch(g,2,6,['rwwwwwwwwwwr','rvvvwwwwvvvr','.dlmmmmmmmmd.','.dlmmmmmmmmd.','.dlmmmmmmmdd.','..dlmmmmmdd..','..dlmmmmmdd..','..dmmmmmmdd..','..ddmmmmddd..','...dddddddd..'],P);
  pixLine(g,3,6,3,4,(x,y)=>pixSet(g,x,y,'#6f7780'));pixLine(g,12,6,12,4,(x,y)=>pixSet(g,x,y,'#6f7780'));pixLine(g,4,3,11,3,(x,y)=>pixSet(g,x,y,'#8c959d'));pixSet(g,3,4,'#8c959d');pixSet(g,12,4,'#8c959d');
  return pixOutline(g,PIX_OUT);},
 shears:()=>{const g=pixGrid(),S=['#7c858d','#c3cbd3','#eef2f5'],R=['#a3231f','#d9382f','#f06a5e'];
  pixLine(g,7,8,13,1,(x,y,i)=>{pixSet(g,x,y,S[2]);pixSet(g,x-1,y,S[1]);});pixLine(g,8,8,3,1,(x,y,i)=>{pixSet(g,x,y,S[2]);pixSet(g,x+1,y,S[1]);});   // lâminas em X
  pixSet(g,7,8,'#555b61');pixSet(g,8,8,'#555b61');
  pixPatch(g,2,10,['.rrr..','rRRRr.','rR.Rr.','rRRRr.','.rrr..'],{r:R[0],R:R[1]});pixPatch(g,9,10,['..rrr.','.rRRRr','.rR.Rr','.rRRRr','..rrr.'],{r:R[0],R:R[1]});   // cabos vermelhos
  pixLine(g,6,9,4,10,(x,y)=>pixSet(g,x,y,S[0]));pixLine(g,9,9,11,10,(x,y)=>pixSet(g,x,y,S[0]));
  return pixOutline(g,PIX_OUT);},
 lantern:()=>{const g=pixGrid(),P={m:'#6c7279',d:'#444a50',y:'#f6d24a',w:'#fff4b0',o:'#e0a020',b:'#8a5a2b'};
  pixPatch(g,5,1,['..mmm..','.m...m.','.m...m.'],P);   // argola
  pixPatch(g,3,4,['.dddddddddd.','.dmmmmmmmmd.','..doooooood..','..dowwyyyod..','..dowwwyyod..','..dowwwyyod..','..doyyyyyod..','..doooooood..','.dmmmmmmmmd.','.dddddddddd.'],P);
  return pixOutline(g,PIX_OUT);},
 bow:()=>{const g=pixGrid(),W=['#4a2f14','#6b4423','#8a5a2b'];
  pixLine(g,4,1,12,1,()=>{});   // (reservado)
  const arc=[[11,1],[12,2],[12,3],[13,4],[13,5],[13,6],[13,7],[12,8],[12,9],[11,10],[10,11],[9,12],[8,13],[7,14]];
  arc.forEach(([x,y],i)=>{pixSet(g,x,y,i%2?W[2]:W[1]);pixSet(g,x-1,y,W[0]);});
  pixLine(g,10,2,3,14,(x,y)=>pixSet(g,x,y,'#f2f2ee'));   // corda
  pixLine(g,5,5,12,12,(x,y,i)=>pixSet(g,x,y,i%3?'#9b7b4a':'#b99a62'));pixSet(g,13,13,'#9aa3ab');pixSet(g,12,13,'#9aa3ab');pixSet(g,13,12,'#9aa3ab');pixSet(g,14,14,'#c9d0d6');   // flecha
  return pixOutline(g,PIX_OUT);},
 compass:()=>{const g=pixGrid(),P={b:'#6b4423',B:'#8a5a2b',c:'#e8ddc0',C:'#cdbf9a',r:'#d9382f',s:'#4a4f6a',w:'#ffffff'};
  pixPatch(g,2,2,['....bbbbbb....','..bbBBBBBBbb..','.bBBccccccBBb.','.bBccccccccBb.','bBccccrccccCBb','bBcccrrrcccCBb','bBccrrwrrccCBb','bBccsswsscccBb','bBcccssscccCBb','.bBccccsccCBb.','.bBBcccccCBBb.','..bbBBBBBBbb..','....bbbbbb....'],P);
  return pixOutline(g,PIX_OUT);},
 spyglass:()=>{const g=pixGrid(),B=['#5b3a1c','#8a5a2b','#b07a3c'],G=['#b8860b','#e0b030','#f5d36a'];
  pixLine(g,2,13,9,6,(x,y,i)=>{pixSet(g,x,y,B[1]);pixSet(g,x+1,y,B[0]);pixSet(g,x,y-1,B[2]);});
  pixLine(g,8,8,13,3,(x,y)=>{pixSet(g,x,y,G[1]);pixSet(g,x+1,y,G[0]);pixSet(g,x,y-1,G[2]);});   // tubo dourado
  pixPatch(g,12,0,['.ww.','wbbw','wbbw','.ww.'],{w:'#f5d36a',b:'#7ec8f0'});   // lente
  pixSet(g,3,12,G[1]);pixSet(g,2,13,G[0]);
  return pixOutline(g,PIX_OUT);},
 rod:()=>{const g=pixGrid(),W=PIXHANDLE;
  pixLine(g,2,14,12,4,(x,y,i)=>{pixSet(g,x,y,i%2?W[2]:W[1]);pixSet(g,x+1,y,W[0]);});
  pixPatch(g,4,10,['.gg.','gddg','.gg.'],{g:'#6c7279',d:'#444a50'});   // carretel
  pixLine(g,13,3,14,5,(x,y)=>pixSet(g,x,y,'#f2f2ee'));pixLine(g,14,5,14,9,(x,y)=>pixSet(g,x,y,'#f2f2ee'));
  pixPatch(g,13,10,['.rr.','rrrr','wwww','.ww.'],{r:'#d9382f',w:'#f4f4f4'});   // boia
  return pixOutline(g,PIX_OUT);}
};
// grade de uma ferramenta por tipo: 0 pá, 1 machado, 2 picareta, 3 espada
function pixToolGrid(j,tier){return [pixShovel,pixAxe,pixPick,pixSword][j](tier);}
function pixToolIcon(j,tier){return pixSvg(pixToolGrid(j,tier));}
function pixFixedIcon(k,arg){return pixSvg(PIXFIXED[k](arg));}
// grade de uma ferramenta pelo índice em TOOLS (usa TIERS de player/durability.js); null = sem modelo (mão)
function pixToolGridById(id){const T=typeof TIERS!=='undefined'?TIERS.find(t=>t.ids.includes(id)):null;
  if(T)return pixToolGrid(T.ids.indexOf(id),T.n);
  const k={4:'bucket',6:'shears',8:'lantern',9:'bow',13:'compass',14:'spyglass',15:'rod'}[id];return k?PIXFIXED[k](false):null;}
// ponto da grade onde a mão segura cada ferramenta (cabo: canto inferior esquerdo; redondos: centro)
function pixPivotById(id){return [4,8,13].includes(id)?[8,8]:[2.5,13.5];}
// ---- versão 3D: cada pixel vira um cubinho (só as faces visíveis), como o item na mão do Minecraft ----
function pixExtrude(g,s,depth){const pos=[],col=[],z=depth/2;
  const C=(hex,k)=>{const n=parseInt(hex.slice(1),16);return[(n>>16&255)/255*k,(n>>8&255)/255*k,(n&255)/255*k];};
  const has=(x,y)=>x>=0&&y>=0&&x<16&&y<16&&!!g[y][x];
  const quad=(a,b,c,d,rgb)=>{for(const p of[a,b,c,a,c,d]){pos.push(p[0],p[1],p[2]);col.push(rgb[0],rgb[1],rgb[2]);}};
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){const c=g[y][x];if(!c)continue;const x0=(x-8)*s,x1=(x+1-8)*s,y1=(8-y)*s,y0=(7-y)*s;
    quad([x0,y0,z],[x1,y0,z],[x1,y1,z],[x0,y1,z],C(c,1));quad([x1,y0,-z],[x0,y0,-z],[x0,y1,-z],[x1,y1,-z],C(c,.78));
    if(!has(x,y-1))quad([x0,y1,z],[x1,y1,z],[x1,y1,-z],[x0,y1,-z],C(c,.95));
    if(!has(x,y+1))quad([x0,y0,-z],[x1,y0,-z],[x1,y0,z],[x0,y0,z],C(c,.6));
    if(!has(x-1,y))quad([x0,y0,-z],[x0,y0,z],[x0,y1,z],[x0,y1,-z],C(c,.8));
    if(!has(x+1,y))quad([x1,y0,z],[x1,y0,-z],[x1,y1,-z],[x1,y1,z],C(c,.85));}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  return new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}));}
