/* MiniBlocos · Luzes, ciclo dia/noite, sol, lua, estrelas e relógio */
const amb=new THREE.AmbientLight(0xffffff,.8);scene.add(amb);
const dl=new THREE.DirectionalLight(0xffffff,.6);dl.position.set(1,2,1.5);scene.add(dl);
// dia e noite: escurece os blocos por shader, céu, sol, lua e estrelas
const DAYLEN=300,uDark={value:1},uLP={value:new THREE.Vector3()},uLO={value:0},clockEl=document.getElementById('clock');let dayT=.3;
function patchMat(m){m.onBeforeCompile=s=>{s.uniforms.uDark=uDark;s.uniforms.uLP=uLP;s.uniforms.uLO=uLO;
  s.vertexShader=s.vertexShader.replace('#include <common>',`#include <common>
attribute float fb;
uniform float uDark;
uniform vec3 uLP;
uniform float uLO;`).replace('#include <color_vertex>',`#include <color_vertex>
#ifdef USE_COLOR
vColor.rgb=vColor.rgb*uDark*(1.0+fb*vec3(1.2,.7,.2))+fb*vec3(.28,.12,.0)*(1.3-uDark);
float dd=distance(position,uLP);float lb=uLO*max(0.0,1.0-dd/11.0);lb*=lb;vColor.rgb=vColor.rgb*(1.0+lb*1.5)+lb*vec3(.34,.17,.04)*(1.4-uDark);
#endif`);};}
patchMat(matS);patchMat(matT);patchMat(matW);
const lLight=new THREE.PointLight(0xffcf80,0,12);scene.add(lLight);
const cDay=new THREE.Color('#87ceeb'),cNight=new THREE.Color('#050914'),cDusk=new THREE.Color('#ff9055'),cTmp=new THREE.Color();
const sunM=new THREE.Mesh(new THREE.PlaneGeometry(16,16),new THREE.MeshBasicMaterial({color:0xfff2b0,fog:false,depthWrite:false,transparent:true}));
const moonM=new THREE.Mesh(new THREE.PlaneGeometry(11,11),new THREE.MeshBasicMaterial({color:0xdfe8ff,fog:false,depthWrite:false,transparent:true}));
scene.add(sunM);scene.add(moonM);
const sArr=new Float32Array(1500);for(let i=0;i<500;i++){const th=Math.random()*6.283,y=Math.random()*.95+.05,r=Math.sqrt(1-y*y);sArr[i*3]=r*Math.cos(th)*110;sArr[i*3+1]=y*110;sArr[i*3+2]=r*Math.sin(th)*110;}
const sGeo=new THREE.BufferGeometry();sGeo.setAttribute('position',new THREE.BufferAttribute(sArr,3));
const stars=new THREE.Points(sGeo,new THREE.PointsMaterial({size:2,sizeAttenuation:false,color:0xffffff,transparent:true,fog:false,depthWrite:false}));scene.add(stars);
const smooth=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
function updateSky(dt){dayT=(dayT+dt/DAYLEN)%1;const ang=Math.PI*2*(dayT-.25),h=Math.sin(ang),d=smooth(-.15,.25,h);
  uDark.value=.16+.84*d;
  const warm=Math.max(0,1-Math.abs(h)/.3);cTmp.copy(cNight).lerp(cDay,d).lerp(cDusk,warm*.55);
  scene.background.copy(cTmp);scene.fog.color.copy(cTmp);
  amb.intensity=.3+.5*d;amb.color.setRGB(.55+.45*d,.6+.4*d,.85+.15*d);dl.intensity=.1+.55*d;
  const dir=new THREE.Vector3(Math.cos(ang),h,.35).normalize();
  sunM.position.copy(camera.position).addScaledVector(dir,90);moonM.position.copy(camera.position).addScaledVector(dir,-90);
  sunM.lookAt(camera.position);moonM.lookAt(camera.position);sunM.material.color.setRGB(1,.95-.4*warm,.7-.5*warm);
  sunM.visible=h>-.25;moonM.visible=h<.25;
  stars.position.copy(camera.position);stars.material.opacity=Math.max(0,1-d*1.6);stars.visible=stars.material.opacity>.02;
  const hr=(dayT*24)%24,hh=Math.floor(hr),mm=Math.floor((hr-hh)*6)*10,s=(h>0?'☀️ ':'🌙 ')+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0');
  if(clockEl._s!==s){clockEl._s=s;clockEl.textContent=s;}}
