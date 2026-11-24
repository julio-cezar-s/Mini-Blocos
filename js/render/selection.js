/* MiniBlocos · Contorno do bloco mirado + rachaduras ao minerar */
const sel=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.003,1.003,1.003)),new THREE.LineBasicMaterial({color:0x000000}));
sel.visible=false;scene.add(sel);
// 6 estágios de rachadura (quanto maior o estágio, mais pixels escuros)
const crackTex=[];
for(let s=0;s<6;s++){const t=mkTex(16,16,(x,y)=>rnd(x,y,200)<(s+1)*.13?[18,18,18,200]:[0,0,0,0]);
  t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;crackTex.push(t);}
const crack=new THREE.Mesh(new THREE.BoxGeometry(1.006,1.006,1.006),new THREE.MeshBasicMaterial({map:crackTex[0],transparent:true,depthWrite:false,fog:false}));
crack.visible=false;scene.add(crack);
