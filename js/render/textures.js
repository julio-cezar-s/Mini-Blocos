/* MiniBlocos · Texturas procedurais, atlas 16x16 e água */
// texturas procedurais: casca, anel do tronco, folhas e água
const mkTex=(w,h,fn,rep)=>{const cv=document.createElement('canvas');cv.width=w;cv.height=h;const g=cv.getContext('2d'),im=g.createImageData(w,h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=fn(x,y),o=(y*w+x)*4;im.data[o]=c[0];im.data[o+1]=c[1];im.data[o+2]=c[2];im.data[o+3]=c.length>3?c[3]:255;}
  g.putImageData(im,0,0);const t=new THREE.CanvasTexture(cv);if(rep)t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;};
// atlas de texturas 16x16 (6x3 tiles) para todos os blocos
const TMAP={1:[3,4,5],2:[5,5,5],3:[6,6,6],4:[1,0,1],5:[2,2,2],6:[15,15,15],7:[7,7,7],9:[8,8,8],10:[10,10,10],11:[11,11,11],12:[12,12,12],13:[14,13,14],14:[16,17,17],15:[19,18,19],16:[20,21,21],17:[22,22,22],18:[23,24,23],19:[25,25,25],20:[26,26,26],21:[27,27,27],22:[28,29,29],23:[32,30,31]};
const TILE=(t,ci)=>TMAP[t][ci];
const pk=(a,r)=>a[Math.min(a.length-1,Math.floor(r*a.length))],jt=(c,k)=>[c[0]+k,c[1]+k,c[2]+k];
const dirtP=(x,y,s)=>{let c=pk([[121,85,58],[134,96,64],[104,72,48],[146,108,74]],rnd(x,y,s));if(rnd(x>>1,y>>1,s+5)<.1)c=jt(c,-26);else if(rnd(x,y,s+9)>.93)c=jt(c,24);return c;};
const stoneP=(x,y,s)=>{let c=pk([[128,128,128],[140,140,140],[116,116,116],[150,150,150]],rnd(x>>1,y>>1,s));if(rnd(x,y,s+3)<.07)c=jt(c,-34);if((x*3+y*5+s)%11===0&&rnd(x,y,s+4)<.5)c=jt(c,-28);return c;};
const oreP=(i,pal)=>{const bl=[];for(let k=0;k<6;k++)bl.push([1+Math.floor(rnd(k,i,40)*12),1+Math.floor(rnd(k,i,41)*13),1+Math.floor(rnd(k,i,42)*2)]);
  return(x,y)=>{for(const [bx,by,sz] of bl)if(x>=bx&&x<=bx+sz&&y>=by&&y<=by+1)return pk(pal,rnd(x,y,43+i));return stoneP(x,y,30+i);};};
const TP=[
 (x,y)=>{let b=.6+.35*rnd(x,3,11)+.14*(rnd(x,y,12)-.5);if(x%5===2)b*=.55;return[118*b,84*b,42*b];},
 (x,y)=>{const r=Math.floor(Math.max(Math.abs(x-7.5),Math.abs(y-7.5))),nz=(rnd(x,y,15)-.5)*14,c=r<=1?[212,170,100]:(r>=7?[110,78,40]:(r%2?[160,122,64]:[185,144,80]));return jt(c,nz);},
 (x,y)=>{const bx=x>>1,by=y>>1;if(rnd(bx,by,13)<.28)return[0,0,0,0];const c=pk([[44,128,44],[60,152,56],[34,104,38],[86,172,70]],rnd(bx,by,14));return jt(c,(x%2===0&&y%2===0)?26:((x%2&&y%2)?-22:0));},
 (x,y)=>{let c=pk([[84,158,48],[96,172,56],[68,132,38],[110,184,70]],rnd(x,y,20));if(rnd(x,y,21)>.88)c=jt(c,-28);return c;},
 (x,y)=>{const fd=3+Math.floor(rnd(x,0,22)*3);if(y<fd){let c=pk([[84,158,48],[96,172,56],[68,132,38]],rnd(x,y,20));if(y===fd-1)c=jt(c,-30);return c;}return dirtP(x,y,23);},
 (x,y)=>dirtP(x,y,24),
 (x,y)=>stoneP(x,y,25),
 (x,y)=>{let c=pk([[228,214,150],[238,226,166],[216,200,138]],rnd(x,y,26));if(rnd(x,y,27)>.95)c=jt(c,-30);return c;},
 (x,y)=>{let c=pk([[244,248,252],[232,240,248],[250,252,255]],rnd(x>>1,y>>1,28));if(rnd(x,y,29)>.96)c=[255,255,255];else if(rnd(x,y,31)<.06)c=[214,226,242];return c;},
 (x,y)=>stoneP(x,y,60),
 oreP(10,[[28,28,28],[44,44,44],[60,60,60]]),
 oreP(11,[[216,170,128],[190,140,100],[236,200,160]]),
 oreP(12,[[246,214,60],[220,180,30],[255,240,130]]),
 (x,y)=>{let c=pk([[46,125,50],[58,140,62],[40,110,44]],rnd(x,y,50));if(x%4===0)c=jt(c,-22);if(x===0||x===15)c=jt(c,-30);if(rnd(x,y,51)>.93)c=[225,225,170];return c;},
 (x,y)=>{const r=Math.floor(Math.max(Math.abs(x-7.5),Math.abs(y-7.5)));return r>=7?[30,90,34]:(r<=1?[120,180,110]:(r%2?[70,150,70]:[58,130,60]));},
 (x,y)=>{const bd=Math.floor(y/4);let c=pk([[184,140,84],[172,128,76],[196,152,92]],rnd(bd,x>>3,52));if(rnd(x>>1,y,53)<.12)c=jt(c,-16);if(y%4===3)c=jt(c,-45);if((x===2||x===13)&&y%4===1)c=[96,66,34];return c;},
 (x,y)=>{if(rnd(x,y,54)<.3)return pk([[255,110,20],[255,180,40],[220,60,10]],rnd(x,y,55));return jt([52,40,34],(rnd(x,y,56)-.5)*16);},
 (x,y)=>{if(y%5===4)return[34,24,18];if(x<2||x>13)return[196,150,90];return pk([[96,68,40],[82,56,32],[110,78,46]],rnd(x>>1,y,57));}
];
TP.push(
 (x,y)=>{if(x<2||x>13||y<2||y>13)return jt([70,64,56],(rnd(x,y,70)-.5)*14);if(x===7||x===8||y===7||y===8)return[150,120,50];return jt([255,226,120],-Math.hypot(x-7.5,y-7.5)*6+(rnd(x,y,71)-.5)*14);},
 (x,y)=>(x<3||x>12||y<3||y>12)?jt([70,64,56],(rnd(x,y,72)-.5)*14):[255,236,150],
 (x,y)=>{if(y<5&&x>1&&x<14)return jt([240,240,235],(rnd(x,y,73)-.5)*12);let c=[176,38,42];if(y%4===0)c=jt(c,-18);return jt(c,(rnd(x,y,74)-.5)*14);},
 (x,y)=>y<7?(y<3?jt([240,240,235],(rnd(x,y,78)-.5)*10):jt([176,38,42],(rnd(x,y,79)-.5)*12)):jt([150,106,60],(rnd(x,y,75)-.5)*16),
 (x,y)=>{if(x===0||x===15||y===0||y===15)return[190,225,240,255];if((x+y===6||x+y===7||x+y===19)&&x>1&&y>1)return[235,248,255,255];return[0,0,0,0];},
 (x,y)=>{if(x<1||x>14||y<1||y>14)return[70,44,20];return jt([150,102,48],(rnd(x,y,76)-.5)*16+(y%5===0?-20:0));},
 (x,y)=>{if(x<1||x>14||y<1||y>14)return[70,44,20];if(y>=5&&y<=7)return[120,120,128];if(x>=6&&x<=9&&y>=4&&y<=9)return[230,200,60];return jt([150,102,48],(rnd(x,y,77)-.5)*16+(y%5===0?-20:0));},
 (x,y)=>{const row=y>>2,off=(row%2)*4,tx=(x+off)%8,ti=Math.floor((x+off)/8);let c=pk([[196,86,50],[184,76,44],[206,98,58]],rnd(row,ti,90));if(y%4===3)c=jt(c,-48);else if(tx===0)c=jt(c,-30);else if(y%4===0&&tx>1&&tx<6)c=jt(c,14);return jt(c,(rnd(x,y,91)-.5)*10);},
 (x,y)=>{if(x<2||x>13||y<2||y>13)return jt([96,62,30],(rnd(x,y,92)-.5)*12);if(x<4||x>11||y<4||y>11)return jt([122,82,40],(rnd(x,y,93)-.5)*12);return jt([158,112,58],(rnd(x,y,94)-.5)*14+(x%3===0?-10:0));},
 (x,y)=>(x<2||x>13||y<2||y>13)?[96,62,30,255]:[0,0,0,0],
 (x,y)=>{if(x<1||x>14||y<1||y>14)return[84,54,26];if(x===5||x===10||y===5||y===10)return[110,74,36];return jt([172,126,70],(rnd(x,y,95)-.5)*14);},
 (x,y)=>{if(x<1||x>14)return[84,54,26];if(y<4)return jt([120,84,42],(rnd(x,y,96)-.5)*10);if(x>=3&&x<=12&&y>=7&&y<=8)return[170,176,184];if(x>=11&&x<=12&&y>=9&&y<=12)return[200,60,50];return jt([150,106,58],(rnd(x,y,97)-.5)*14+(y%5===0?-14:0));},
 (x,y)=>{if(x>=4&&x<=11&&y>=5&&y<=12){if(y>=10)return rnd(x,y,98)<.5?[255,140,40]:[200,70,20];return[34,28,26];}let c=stoneP(x,y,99);if(x%8===0||y%8===0)c=jt(c,-34);return c;},
 (x,y)=>{let c=stoneP(x,y,99);if(x%8===0||y%8===0)c=jt(c,-34);return c;},
 (x,y)=>{if(x>5&&x<10&&y>5&&y<10)return[34,28,26];let c=stoneP(x,y,99);if(x%8===0||y%8===0)c=jt(c,-34);return c;});
// ---- tiles 33 a 51: blocos novos ----
const stBrick=(x,y,s)=>{const c=stoneP(x,y,s),lx=x%8,ly=y%8;if(lx===7||ly===7)return jt(c,-46);if(lx===0||ly===0)return jt(c,12);return c;};
const terra=(c,s)=>(x,y)=>jt(c,(rnd(x,y,s)-.5)*10-((x%8===0||y%8===0)?12:0));
const blk=(base,hi,lo,s)=>(x,y)=>{const e=Math.min(x,y,15-x,15-y);let c=e===0?lo:(e===1?jt(base,14):base);if(e>=2&&e<=13&&(x-y+16)%8===0)c=hi;return jt(c,(rnd(x,y,s)-.5)*8);};
TP.push(
 (x,y)=>{let c=pk([[132,130,128],[152,150,148],[112,110,110],[168,164,160]],rnd(x>>1,y>>1,200));if(rnd(x,y,201)<.12)c=jt(c,-30);if((x+y*2)%9===0&&rnd(x,y,202)<.5)c=jt(c,22);return c;},   // 33 cascalho
 (x,y)=>jt(pk([[158,164,178],[150,158,172],[166,172,186]],rnd(x>>2,y>>2,203)),(rnd(x,y,204)-.5)*8),   // 34 argila
 (x,y)=>{const row=y>>2,off=(row%2)*4,tx=(x+off)%8;if(y%4===3||tx===7)return jt([186,180,170],(rnd(x,y,205)-.5)*10);return jt(pk([[150,64,50],[140,58,46],[162,74,58]],rnd(row,(x+off)>>3,206)),(rnd(x,y,207)-.5)*12);},   // 35 tijolo
 (x,y)=>stBrick(x,y,208),   // 36 pedra lapidada
 (x,y)=>{if(rnd(x>>1,y>>1,209)<.45||rnd(x,y,210)<.08)return jt(pk([[70,122,50],[84,140,58],[58,104,44]],rnd(x,y,211)),(rnd(x,y,212)-.5)*10);return stBrick(x,y,213);},   // 37 pedra musgosa
 (x,y)=>{const w=((x>>3)+(y>>3))%2===0;return jt(w?[232,232,234]:[38,38,42],(rnd(x,y,214)-.5)*8+((x%8===0||y%8===0)?(w?-14:10):0));},   // 38 piso xadrez
 (x,y)=>{let c=pk([[226,122,26],[216,112,22],[234,134,36]],rnd(x>>1,y,215));if(x%4===0)c=jt(c,-34);else if(x%4===1)c=jt(c,10);return jt(c,(rnd(x,y,216)-.5)*8);},   // 39 abóbora (lado)
 (x,y)=>{if(x>=6&&x<=9&&y>=6&&y<=9)return jt([92,108,38],(rnd(x,y,217)-.5)*14);const r=Math.hypot(x-7.5,y-7.5);let c=r>6.2?[170,86,14]:pk([[226,122,26],[216,112,22]],rnd(x,y,218));if(Math.round(r)%3===0&&r>3)c=jt(c,-18);return jt(c,(rnd(x,y,219)-.5)*8);},   // 40 abóbora (topo)
 (x,y)=>{if(x===3||x===4||x===11||x===12)return jt([134,92,46],(rnd(x,y,220)-.5)*14);return jt(pk([[226,196,84],[214,182,70],[236,208,100]],rnd(x,y>>1,221)),(rnd(x,y,222)-.5)*14+(y%4===0?-18:0));},   // 41 feno (lado)
 (x,y)=>{const r=Math.floor(Math.max(Math.abs(x-7.5),Math.abs(y-7.5)));return jt(r<=1?[236,208,100]:(r%2?[220,190,78]:[200,170,64]),(rnd(x,y,223)-.5)*14);},   // 42 feno (topo)
 (x,y)=>jt(pk([[236,236,238],[246,246,248],[224,224,228]],rnd(x>>1,y>>1,224)),(rnd(x,y,225)-.5)*6),   // 43 lã
 terra([222,172,62],226),terra([122,114,110],227),terra([204,112,52],228),   // 44 a 46 terracotas
 oreP(13,[[96,232,236],[140,246,250],[60,204,218]]),   // 47 minério de diamante
 blk([214,214,220],[240,240,246],[150,150,160],229),blk([250,212,58],[255,240,140],[190,140,16],230),blk([36,36,40],[64,64,70],[18,18,22],231),blk([100,226,232],[190,250,252],[40,150,170],232));   // 48 a 51 blocos de ferro, ouro, carvão e diamante
Object.assign(TMAP,{34:[33,33,33],35:[34,34,34],36:[35,35,35],37:[36,36,36],38:[37,37,37],39:[38,38,38],40:[40,39,39],41:[42,41,42],42:[43,43,43],43:[44,44,44],44:[45,45,45],45:[46,46,46],46:[47,47,47],47:[48,48,48],48:[49,49,49],49:[50,50,50],50:[51,51,51]});
// ---- tiles 52 e 53: alçapão (face grande com argola de ferro e lateral de madeira) ----
TP.push(
 (x,y)=>{if(x<1||x>14||y<1||y>14)return[62,40,18];const r=Math.hypot(x-7.5,y-7.5);if(r<1.6)return[30,24,20];if(r<3.1)return[198,202,210];
  if(x===3||x===12)return[104,104,112];if(y%4===0)return[84,56,28];return jt([156,108,52],(rnd(x,y,100)-.5)*16);},   // 52 alçapão (face)
 (x,y)=>jt([118,82,40],(rnd(x,y,101)-.5)*14+(x%6===0?-16:0)),   // 53 alçapão (lateral)
 (x,y)=>{if(x<1||x>14||y<1||y>14)return[66,42,20];const pn=x>=3&&x<=12&&y>=3&&y<=12;if(pn&&(x===3||x===12||y===3||y===12))return[104,70,34];
  if(pn)return jt([170,122,64],(rnd(x,y,102)-.5)*12);return jt([146,100,48],(rnd(x,y,103)-.5)*14+(x%5===0?-10:0));},   // 54 porta (trecho de baixo/de cima)
 (x,y)=>{if(x>=10&&x<=12&&y>=7&&y<=9)return[236,206,70];if(x>=9&&x<=13&&y>=5&&y<=11)return[150,150,158];if(x<1||x>14||y<1||y>14)return[66,42,20];
  const pn=x>=3&&x<=12&&y>=3&&y<=12;if(pn&&(x===3||x===12||y===3||y===12))return[104,70,34];
  if(pn)return jt([170,122,64],(rnd(x,y,104)-.5)*12);return jt([146,100,48],(rnd(x,y,105)-.5)*14+(x%5===0?-10:0));});   // 55 porta (trecho do meio, com puxador)
TMAP[51]=[52,53,53];TMAP[60]=TMAP[6];TMAP[61]=TMAP[6];TMAP[68]=TMAP[6];   // 60 = cerca (visual em blocks/fence.js)
const ATR=10;   // linhas do atlas (6 colunas x 10 linhas = 60 tiles de 16x16)
while(TP.length<ATR*6)TP.push((x,y)=>stoneP(x,y,80));
const atlas=mkTex(96,16*ATR,(X,Y)=>TP[Math.floor(Y/16)*6+Math.floor(X/16)](X%16,Y%16));
atlas.magFilter=atlas.minFilter=THREE.NearestFilter;atlas.generateMipmaps=false;
const waterTex=mkTex(64,64,(x,y)=>{const a=Math.PI*2,f1=Math.sin(a*(2*x/64+.15*Math.sin(a*y/64))),f2=Math.sin(a*(3*y/64+.12*Math.sin(a*2*x/64))),b=Math.round(205+30*f1+20*f2);return[b,b,Math.min(255,b+15)];},true);
const matT=new THREE.MeshBasicMaterial({map:atlas,vertexColors:true,alphaTest:.5,side:THREE.DoubleSide});
const ORE={10:new THREE.Color('#1c1c1c'),11:new THREE.Color('#dba56c'),12:new THREE.Color('#f7d63c')};
