/* MiniBlocos · Aldeia nômade: acha um terreno plano, nivela e constrói 5 casas pequenas + praça com fogueira
   Carrega DEPOIS de js/storage/load-world.js e ANTES de js/main.js (a fogueira e os lampiões são ligados no main.js).
   O resultado fica em VILLAGE ({cx,cz,y0,doors}); os nômades (js/entities/nomads.js) nascem a partir dele. */
const VILLAGE=(function(){
  const R=17;                                   // raio do terreno nivelado (blocos)
  const VKEY='miniblocos_aldeia_'+SEED;         // guarda onde a aldeia foi feita (mundos salvos)
  // casas: posição em relação à praça. A porta sempre olha para a praça
  const OFFS=[[0,-12],[11,-4],[7,10],[-7,10],[-11,-4]];
  // wall/stripe/corner/roof/floor = ids de bloco (36 tijolo, 6 tábua, 4 madeira, 41 feno, 42 lã, 43-45 terracota, 19 telha)
  const KINDS=[
    {wall:42,stripe:45,corner:45,roof:42,band:45,floor:41,glass:false},   // tenda branca com faixas laranja
    {wall:36,stripe:0,corner:36,roof:41,band:0,floor:6,glass:true},       // casinha de tijolo com teto de feno
    {wall:6,stripe:0,corner:4,roof:19,band:0,floor:6,glass:true},         // casinha de madeira com telhas
    {wall:41,stripe:43,corner:4,roof:41,band:43,floor:41,glass:false},    // tenda de feno com faixas amarelas
    {wall:43,stripe:0,corner:45,roof:45,band:0,floor:39,glass:true}       // casa de barro (adobe)
  ];
  const MAN=new Uint8Array(256);[6,14,15,16,17,18,19,20,21,22,23,36,37,39,41,42,43,44,45,60,61].forEach(i=>MAN[i]=1);
  for(let i=24;i<=33;i++)MAN[i]=1;for(let i=51;i<=67;i++)MAN[i]=1;
  const inW=(x,z)=>x>=1&&z>=1&&x<W-1&&z<D-1;
  const set=(x,y,z,id)=>{if(inW(x,z)&&y>=0&&y<H)B[idx(x,y,z)]=id;};
  // altura do chão: ignora árvores (madeira, folhas), cacto e abóbora
  const gy=(x,z)=>{for(let y=H-1;y>0;y--){const t=B[idx(x,y,z)];if(t&&t!==4&&t!==5&&t!==13&&t!==40)return y;}return 0;};
  // ---------- 1) procura o terreno plano ----------
  function findSite(){
    const man=new Uint8Array(W*D);   // colunas com construção do jogador: a aldeia não nasce em cima delas
    for(let i=0;i<B.length;i++)if(MAN[B[i]])man[(i%W)*D+(Math.floor(i/W)%D)]=1;
    const sp=spawnSpot();let best=null,bs=1e9;
    for(let cx=R+3;cx<W-R-3;cx+=4)for(let cz=R+3;cz<D-R-3;cz+=4){
      let mn=99,mx=0,bad=false;const hs=[];
      for(let dx=-R;dx<=R&&!bad;dx+=3)for(let dz=-R;dz<=R;dz+=3){
        if(dx*dx+dz*dz>R*R)continue;
        const x=cx+dx,z=cz+dz,y=gy(x,z);
        if(man[x*D+z]||y<=WL+1||y>=24||B[idx(x,y,z)]===8){bad=true;break;}   // sem água, montanha ou obra do jogador
        mn=Math.min(mn,y);mx=Math.max(mx,y);hs.push(y);}
      if(bad||mx-mn>7)continue;
      const d=Math.hypot(cx+.5-sp[0],cz+.5-sp[1]);if(d<20)continue;
      const sc=(mx-mn)*10+Math.abs(d-45)*.2;   // o mais plano e a uns 45 blocos do início
      if(sc<bs){bs=sc;hs.sort((a,b)=>a-b);best={cx,cz,y0:hs[hs.length>>1]};}}
    return best;}
  // ---------- 2) nivela o terreno ----------
  function flatten(s){
    const t=B[idx(s.cx,gy(s.cx,s.cz),s.cz)],top=(t===7||t===9)?t:1;
    for(let dx=-R;dx<=R;dx++)for(let dz=-R;dz<=R;dz++){
      if(dx*dx+dz*dz>R*R)continue;const x=s.cx+dx,z=s.cz+dz;if(!inW(x,z))continue;
      const g=gy(x,z);if(B[idx(x,g,z)]===8)continue;
      for(let y=g+1;y<=s.y0;y++)B[idx(x,y,z)]=2;                           // enche buracos
      for(let y=s.y0+1;y<=Math.min(H-1,s.y0+12);y++)B[idx(x,y,z)]=0;       // corta morros e árvores
      B[idx(x,s.y0,z)]=top;if(!B[idx(x,s.y0-1,z)])B[idx(x,s.y0-1,z)]=2;
      hm[x*D+z]=s.y0;}}
  // ---------- casas ----------
  function houses(s){return OFFS.map((o,n)=>{const dx=-o[0],dz=-o[1],f=Math.abs(dx)>Math.abs(dz)?[Math.sign(dx),0]:[0,Math.sign(dz)];
    return{x:s.cx+o[0],z:s.cz+o[1],fx:f[0],fz:f[1],kind:KINDS[n]};});}
  // coordenadas locais da casa: i = lado, j = profundidade (j=+3 é a parede da porta, virada para a praça)
  const loc=(h,i,j)=>[h.x+h.fx*j-h.fz*i,h.z+h.fz*j+h.fx*i];
  function buildHouse(h,y0,cx,cz){
    const k=h.kind;
    for(let i=-4;i<=4;i++)for(let j=-4;j<=4;j++){
      const a=Math.max(Math.abs(i),Math.abs(j)),p=loc(h,i,j);
      if(a<=3)set(p[0],y0,p[1],k.floor);                                       // piso
      if(a===3){for(let y=1;y<=4;y++){let id=k.wall;
          if(Math.abs(i)===3&&Math.abs(j)===3)id=k.corner;else if(k.stripe&&y===2)id=k.stripe;
          if(j===3&&Math.abs(i)<=1&&y<=3)id=0;                                  // porta: 3 de largura por 3 de altura
          else if(k.glass&&y>=2&&y<=3&&((Math.abs(i)===3&&j===0)||(i===0&&j===-3)))id=17;   // janelas
          set(p[0],y0+y,p[1],id);}}}
    for(let l=0;l<4;l++)for(let i=-(4-l);i<=4-l;i++)for(let j=-(4-l);j<=4-l;j++){   // telhado em degraus, com beiral
      const p=loc(h,i,j);set(p[0],y0+5+l,p[1],(k.band&&l%2===1)?k.band:k.roof);}
    let p=loc(h,-2,-2);set(p[0],y0+1,p[1],16);                                  // cama no canto do fundo
    p=loc(h,2,-2);set(p[0],y0+1,p[1],15);                                       // lampião
    for(const s of[-2,2]){p=loc(h,s,4);set(p[0],y0+1,p[1],15);}                 // lampiões ao lado da porta
    // caminho de cascalho da porta até a praça
    let x=h.x+h.fx*4,z=h.z+h.fz*4;
    for(let n=0;n<40&&Math.hypot(x-cx,z-cz)>4;n++){set(x,y0,z,34);set(x-h.fz,y0,z+h.fx,34);
      if(Math.abs(cx-x)>Math.abs(cz-z))x+=Math.sign(cx-x);else z+=Math.sign(cz-z);}}
  function build(s){
    flatten(s);
    for(let dx=-4;dx<=4;dx++)for(let dz=-4;dz<=4;dz++)if(dx*dx+dz*dz<=17)set(s.cx+dx,s.y0,s.cz+dz,34);   // praça de cascalho
    set(s.cx,s.y0+1,s.cz,14);                                                  // fogueira no meio
    for(const[dx,dz]of[[2,2],[-2,2],[2,-2],[-2,-2]])set(s.cx+dx,s.y0+1,s.cz+dz,41);   // fardos de feno para sentar
    houses(s).forEach(h=>buildHouse(h,s.y0,s.cx,s.cz));}
  // a aldeia ainda existe? (fogueira + camas)
  function exists(s){let n=B[idx(s.cx,s.y0+1,s.cz)]===14?1:0;
    houses(s).forEach(h=>{const p=loc(h,-2,-2);if(get(p[0],s.y0+1,p[1])===16)n++;});return n;}
  // ---------- decide o que fazer ----------
  let site=null,need=true,saved=null;
  if(!noSave){try{saved=JSON.parse(localStorage.getItem(VKEY));}catch(e){saved=null;}}
  if(saved&&Number.isInteger(saved.cx)&&Number.isInteger(saved.cz)&&Number.isInteger(saved.y0)&&saved.cx>R&&saved.cz>R&&saved.cx<W-R&&saved.cz<D-R&&saved.y0>1&&saved.y0<H-14){
    site={cx:saved.cx,cz:saved.cz,y0:saved.y0};
    // mundo salvo: só refaz se a aldeia sumiu há pouco tempo (save que não chegou a gravar); depois disso respeita o que o jogador fez
    need=exists(site)<3&&(Date.now()-(saved.t||0))<600000;
  }else site=findSite();
  if(!site)return null;
  if(need){build(site);if(!noSave){try{localStorage.setItem(VKEY,JSON.stringify({cx:site.cx,cz:site.cz,y0:site.y0,t:Date.now()}));}catch(e){}}}
  return{cx:site.cx+.5,cz:site.cz+.5,y0:site.y0,doors:houses(site).map(h=>({x:h.x+h.fx*5+.5,z:h.z+h.fz*5+.5}))};
})();
