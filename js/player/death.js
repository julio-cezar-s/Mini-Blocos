/* MiniBlocos · Personagem e animação de morte */

let deathActor = null;
let deathAnimation = null;

// Cria o boneco temporário que será exibido na morte
function createDeathActor(){
  const actor = new THREE.Group();

  const materials = {
    skin: new THREE.MeshLambertMaterial({color:0xd6a078}),
    shirt: new THREE.MeshLambertMaterial({color:0x3979b8}),
    pants: new THREE.MeshLambertMaterial({color:0x34445f}),
    shoes: new THREE.MeshLambertMaterial({color:0x292929}),
    hair: new THREE.MeshLambertMaterial({color:0x493326})
  };

  function part(parent,w,h,d,material,x,y,z){
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w,h,d),
      material
    );
    mesh.position.set(x,y,z);
    parent.add(mesh);
    return mesh;
  }

  // Tronco
  part(actor,.72,.9,.38,materials.shirt,0,1.65,0);

  // Cabeça e cabelo
  part(actor,.58,.58,.58,materials.skin,0,2.42,0);
  part(actor,.6,.2,.6,materials.hair,0,2.78,0);

  // Braços com pivôs para permitir animação
  const leftArm = new THREE.Group();
  leftArm.position.set(-.48,2.02,0);
  actor.add(leftArm);
  part(leftArm,.25,.85,.3,materials.skin,0,-.4,0);

  const rightArm = new THREE.Group();
  rightArm.position.set(.48,2.02,0);
  actor.add(rightArm);
  part(rightArm,.25,.85,.3,materials.skin,0,-.4,0);

  // Pernas
  part(actor,.3,.85,.34,materials.pants,-.19,.78,0);
  part(actor,.3,.85,.34,materials.pants,.19,.78,0);

  // Pés
  part(actor,.32,.2,.48,materials.shoes,-.19,.25,.06);
  part(actor,.32,.2,.48,materials.shoes,.19,.25,.06);

  actor.userData.leftArm = leftArm;
  actor.userData.rightArm = rightArm;

  return actor;
}

// Inicia a animação de morte
function startDeathAnimation(){
  if(deathAnimation)return;

  deathActor=createDeathActor();
  deathActor.position.set(P.x,P.y,P.z);
  deathActor.rotation.y=P.yaw;

  scene.add(deathActor);

  deathAnimation={
    time:0,
    startY:P.y,
    duration:2.2
  };
}

// Atualiza a queda do personagem
function updateDeathAnimation(dt){
  if(!deathAnimation||!deathActor)return false;

  deathAnimation.time+=dt;

  const t=Math.min(
    deathAnimation.time/deathAnimation.duration,
    1
  );

  // Inclina o corpo até cair no chão
  const fall=Math.min(t*1.5,1);
  deathActor.rotation.z=-fall*(Math.PI/2);

  // Movimento dos braços durante a queda
  const arms=deathActor.userData;
  arms.leftArm.rotation.x=-fall*0.9;
  arms.rightArm.rotation.x=fall*0.9;

  // Pequeno movimento para dar sensação de queda
  deathActor.position.y=
    deathAnimation.startY-Math.sin(t*Math.PI/2)*0.35;

  return deathAnimation.time>=deathAnimation.duration;
}

// Remove o boneco temporário da cena
function clearDeathAnimation(){
  if(deathActor){
    scene.remove(deathActor);
    deathActor.traverse(obj=>{
      if(obj.isMesh){
        obj.geometry.dispose();
        if(Array.isArray(obj.material)){
          obj.material.forEach(m=>m.dispose());
        }else{
          obj.material.dispose();
        }
      }
    });
  }

  deathActor=null;
  deathAnimation=null;
}
