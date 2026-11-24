/* MiniBlocos · Nuvens que derivam no céu e visão debaixo d'água */
const cloudBoxes=[];
const CLW=W*3;   // largura da faixa onde as nuvens derivam e reaparecem
for(let i=0,nC=Math.round(48*CLW*(D+100)/56448);i<nC;i++){const cx=Math.random()*CLW,cz=-50+Math.random()*(D+100),cy=H+7+Math.random()*3,w=7+Math.random()*9,d=5+Math.random()*6;
  cloudBoxes.push({x:cx,y:cy,z:cz,w:w,d:d,h:1.6});
  if(Math.random()<.6)cloudBoxes.push({x:cx+w*.25,y:cy+1.4,z:cz+d*.1,w:w*.5,d:d*.6,h:1.4});}
const cloudMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.88,depthWrite:false});
const cloudMesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),cloudMat,cloudBoxes.length);
cloudMesh.frustumCulled=false;scene.add(cloudMesh);
const cloudM=new THREE.Matrix4(),cloudS=new THREE.Vector3(),cloudQ=new THREE.Quaternion(),cloudP=new THREE.Vector3();
let cloudT=0;
function updateClouds(dt){cloudT+=dt*1.6;
  for(let i=0;i<cloudBoxes.length;i++){const b=cloudBoxes[i];
    cloudP.set(((b.x+cloudT)%CLW)-96,b.y,b.z);cloudS.set(b.w,b.h,b.d);
    cloudM.compose(cloudP,cloudQ,cloudS);cloudMesh.setMatrixAt(i,cloudM);}
  cloudMesh.instanceMatrix.needsUpdate=true;
  const u=Math.min(1,uDark.value);cloudMat.color.setRGB(u,u,Math.min(1,u*1.04));}
// debaixo d'água: névoa azul curta (chamar logo depois de updateSky)
function updateWaterView(){uTime.value=performance.now()/1000;
  const uw=get(Math.floor(camera.position.x),Math.floor(camera.position.y),Math.floor(camera.position.z))===8;
  scene.fog.near=uw?1:35;scene.fog.far=uw?22:100;
  if(uw){scene.fog.color.setRGB(.1,.28,.5).multiplyScalar(.25+.75*uDark.value);scene.background.copy(scene.fog.color);}}

// ondas na água: a superfície sobe e desce e o brilho oscila
const uTime={value:0};
const _waterPatch=matW.onBeforeCompile;
matW.onBeforeCompile=s=>{_waterPatch(s);s.uniforms.uTime=uTime;
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nuniform float uTime;').replace('#include <begin_vertex>',`#include <begin_vertex>
float wt=step(0.5,fract(position.y));
float wv=sin(position.x*1.9+uTime*1.7)*.5+sin(position.z*2.3-uTime*1.4)*.5+sin((position.x+position.z)*1.1+uTime*.9)*.35;
transformed.y+=wt*wv*.045;
#ifdef USE_COLOR
vColor.rgb*=1.0+wt*wv*.10;
#endif`);};
