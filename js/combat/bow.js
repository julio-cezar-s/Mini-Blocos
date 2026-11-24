/* MiniBlocos · Arco e flechas */
// arco e flecha
let arrows=20,drawing=false,drawT=0;const arrowsL=[];
const arrowMat=new THREE.MeshLambertMaterial({color:0x8b5a2b}),tipMat=new THREE.MeshLambertMaterial({color:0xaab2ba}),fthMat=new THREE.MeshLambertMaterial({color:0xf2f2f2});
function hurtAnimal(a,dm,dx,dz){a.hp=(a.hp===undefined?AHP[a.k]:a.hp)-dm;a.vy=7;a.flee=2.5;a.mv=true;a.th=Math.atan2(dx,dz);a.tt=2.5;a.hit=.25;tint(a,0x771111);
  if(a.hp<=0){killAnimal(a);const dr=DROP[a.k];meat+=dr;toast('🍖 +'+dr+' carne');}}
function fireBow(){if(!drawing)return;drawing=false;const pw=Math.max(.3,drawT);drawT=0;pb.firstChild.style.background='';
  if(arrows<=0||tool!==9){return;}
  arrows--;setTool(tool);wearTool(1);
  const d=new THREE.Vector3();camera.getWorldDirection(d);
  const m=new THREE.Group();
  const sh2=new THREE.Mesh(new THREE.BoxGeometry(.07,.07,1.1),arrowMat),tip=new THREE.Mesh(new THREE.BoxGeometry(.16,.16,.22),tipMat),ft=new THREE.Mesh(new THREE.BoxGeometry(.2,.2,.18),fthMat);
  tip.position.z=.6;ft.position.z=-.5;m.add(sh2);m.add(tip);m.add(ft);
  const o=camera.position,x=o.x+d.x*1.2,y=o.y+d.y*1.2-.25,z=o.z+d.z*1.2,v=55*pw;
  m.position.set(x,y,z);scene.add(m);
  arrowsL.push({m,x,y,z,vx:d.x*v,vy:d.y*v,vz:d.z*v,stuck:false,ttl:30,dead:false});}
function arrowTick(dt){
  if(drawing&&tool===9){drawT=Math.min(1,drawT+dt/.9);pb.style.display='block';pb.firstChild.style.width=drawT*100+'%';pb.firstChild.style.background='#fc4';}
  else if(drawing){drawing=false;drawT=0;pb.firstChild.style.background='';}
  for(let i=arrowsL.length-1;i>=0;i--){const a=arrowsL[i];
    if(a.stuck){a.ttl-=dt;
      if(a.ttl<28&&Math.hypot(a.x-P.x,a.y-(P.y+1),a.z-P.z)<3){arrows++;setTool(tool);scene.remove(a.m);arrowsL.splice(i,1);continue;}
      if(a.ttl<=0){scene.remove(a.m);arrowsL.splice(i,1);}continue;}
    for(let k=0;k<3&&!a.stuck&&!a.dead;k++){const h=dt/3;a.vy-=22*h;a.x+=a.vx*h;a.y+=a.vy*h;a.z+=a.vz*h;
      if(a.x<0||a.z<0||a.x>=W||a.z>=D||a.y<-5){a.dead=true;break;}
      const bt=get(Math.floor(a.x),Math.floor(a.y),Math.floor(a.z));
      if(bt&&bt!==8){a.stuck=true;a.ttl=30;break;}
      for(const an of animals){const s=SPEC[an.k],r=s.r/S+.2;
        if(Math.abs(a.x-an.x)<r&&Math.abs(a.z-an.z)<r&&a.y>an.y&&a.y<an.y+s.hh/S){hurtAnimal(an,4,a.vx,a.vz);a.dead=true;break;}}}
    if(a.dead){scene.remove(a.m);arrowsL.splice(i,1);continue;}
    a.m.position.set(a.x,a.y,a.z);if(!a.stuck)a.m.lookAt(a.x+a.vx,a.y+a.vy,a.z+a.vz);}}
