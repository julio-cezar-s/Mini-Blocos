/* MiniBlocos · Personagem e animação de morte */

let deathActor = null;
let deathAnimation = null;

// Cria o personagem com pivô central para a queda
function createDeathActor(){
  const actor = new THREE.Group();
  const body = new THREE.Group();

  actor.add(body);

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

  // Corpo
  part(body,.72,.9,.38,materials.shirt,0,0,0);

  // Cabeça
  part(body,.58,.58,.58,materials.skin,0,.72,0);
  part(body,.6,.2,.6,materials.hair,0,1.02,0);

  // Braço esquerdo
  const leftArm = new THREE.Group();
  leftArm.position.set(-.48,.35,0);
  body.add(leftArm);

  part(leftArm,.25,.85,.3,materials.skin,0,-.4,0);

  // Braço direito
  const rightArm = new THREE.Group();
  rightArm.position.set(.48,.35,0);
  body.add(rightArm);

  part(rightArm,.25,.85,.3,materials.skin,0,-.4,0);

  // Pernas
  part(body,.3,.85,.34,materials.pants,-.19,-.88,0);
  part(body,.3,.85,.34,materials.pants,.19,-.88,0);

  // Pés
  part(body,.32,.2,.48,materials.shoes,-.19,-1.32,.06);
  part(body,.32,.2,.48,materials.shoes,.19,-1.32,.06);

  actor.userData.body = body;
  actor.userData.leftArm = leftArm;
  actor.userData.rightArm = rightArm;

  return actor;
}

// Inicia a animação de morte
function startDeathAnimation(){
  if(deathAnimation)return;

  deathActor=createDeathActor();

  deathActor.position.set(P.x,P.y+1.35,P.z);
  deathActor.rotation.y=P.yaw;

  scene.add(deathActor);

  const direction = new THREE.Vector3(
  Math.sin(P.yaw),
  0,
  Math.cos(P.yaw)
);

const cameraStart = camera.position.clone();

const cameraEnd = new THREE.Vector3(
  P.x + direction.x * 4,
  P.y + 2.2,
  P.z + direction.z * 4
);

deathAnimation={
  time:0,
  duration:2.2,
  startY:deathActor.position.y,
  cameraStart,
  cameraEnd
};

// Atualiza a queda
function updateDeathAnimation(dt){
  if(!deathAnimation||!deathActor)return false;

  deathAnimation.time+=dt;

  const t=Math.min(
    deathAnimation.time/deathAnimation.duration,
    1
  );

  const body=deathActor.userData.body;
  const arms=deathActor.userData;

  // Corpo tombando
  body.rotation.z=-Math.sin(t*Math.PI/2)*(Math.PI/2);

  // Braços se movimentam durante a queda
  arms.leftArm.rotation.z=-t*1.2;
  arms.rightArm.rotation.z=t*1.2;

  // Personagem desce suavemente
  deathActor.position.y=
    deathAnimation.startY-t*.65;

  return t>=1;
}

// Remove o personagem temporário
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
