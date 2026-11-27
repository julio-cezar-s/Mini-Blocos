/* MiniBlocos · Loop principal: frame() faz um quadro; loop() agenda o próximo e protege contra erros */
// loop
let last=performance.now(),bedrockT=-1e9,stepOff=0;   // stepOff: suaviza a câmera em degraus (a física continua instantânea)
function frame(now){
  const dt=Math.min((now-last)/1000,.05);last=now;
  if(playerDead){
  const finished=updateDeathAnimation(dt);

  if(finished){
    clearDeathAnimation();
    respawn();
  }

  renderer.render(scene,camera);
  return;
}
  if(playing&&!(mounted&&rideTick(dt))){   // montado: o cavalo anda no lugar do jogador (ride.js)
    const f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)+tk.f;
    const s=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+tk.s;
    const fx=Math.floor(P.x),fy=Math.floor(P.y+.05),fz=Math.floor(P.z),inW=get(fx,fy,fz)===8;const sp=4.5/S*(inW?.55:1),sn=Math.sin(P.yaw),cs=Math.cos(P.yaw);
    P.vx=(-sn*f+cs*s)*sp;P.vz=(-cs*f-sn*s)*sp;
    if(inW){P.vy-=6/S*dt;P.vy*=Math.max(0,1-3*dt);if(keys.Space)P.vy=Math.max(P.vy,get(fx,fy+1,fz)===8?5/S:8.5/S);}else P.vy-=24/S*dt;if(keys.Space&&P.ground&&!inW){P.vy=8/S;P.ground=false;}
    let nx=P.x+P.vx*dt;if(!hit(nx,P.y,P.z)&&(!rampWall(nx,P.y,P.z)||rampWall(P.x,P.y,P.z)))P.x=nx;else if(P.ground&&!hit(nx,P.y+1.02,P.z)&&!rampWall(nx,P.y+1.02,P.z)){P.x=nx;P.y+=1.02;stepOff-=1.02;}
    let nz=P.z+P.vz*dt;if(!hit(P.x,P.y,nz)&&(!rampWall(P.x,P.y,nz)||rampWall(P.x,P.y,P.z)))P.z=nz;else if(P.ground&&!hit(P.x,P.y+1.02,nz)&&!rampWall(P.x,P.y+1.02,nz)){P.z=nz;P.y+=1.02;stepOff-=1.02;}
    const gnd0=P.ground,prevY=P.y;let ny=P.y+P.vy*dt;
    if(!hit(P.x,ny,P.z)&&!(P.vy>0&&rampWall(P.x,ny,P.z,RAMP_AIR)&&!rampWall(P.x,P.y,P.z,RAMP_AIR))){P.y=ny;P.ground=false;fallMax=inW?P.y:Math.max(fallMax,P.y);}else{if(P.vy<0){if(!P.ground&&!inW){const dist=(fallMax-P.y)*S;if(dist>3)damage(2*Math.floor(dist-3));}P.ground=true;}fallMax=P.y;P.vy=0;}
    {const rs=rampSurface(P.x,P.y,P.z);   // pouso/subida em rampa; o degrau máximo evita o "teletransporte" para cima
     // se o jogador já está "dentro" de uma rampa (nasceu/foi colocado ali), ela o empurra para cima até a superfície
     const capNow=gnd0?(rampWall(P.x,P.y,P.z,RAMP_STEP)?1.02:RAMP_STEP):RAMP_AIR;
     if(rs!==null&&P.vy<=0&&P.y<=rs+(P.ground?.7:.08)&&(rs-P.y<=capNow||prevY>=rs-.05)){
       if(gnd0&&Math.abs(rs-prevY)>.45)stepOff-=rs-prevY;P.y=rs;P.vy=0;P.ground=true;fallMax=P.y;}}
    if(P.y<-10){const sp=safeSpawn(P.x,P.z)||{x:SP0[0],y:H,z:SP0[1]};P.x=sp.x;P.y=sp.y;P.z=sp.z;P.vy=0;fallMax=P.y;stepOff=0;}   // caiu para fora do mundo: volta a um ponto seguro
  }
  if(typeof netTick==='function')netTick(dt,now);
  vitals(dt);
  animals.forEach(a=>updA(a,dt));respawnAnimals(dt);if(mounted)rideSync();
  waterTex.offset.set((now*4e-5)%1,(now*1.5e-5)%1);if(mapOpen)drawMap();updatePin();fires.forEach(f=>flick(f,now));updateFireLights(now);
  camera.position.set(P.x,P.y+EY+stepOff,P.z);stepOff*=Math.exp(-dt*16);if(Math.abs(stepOff)<.002)stepOff=0;camera.rotation.y=P.yaw;camera.rotation.x=P.pitch;updateSky(dt);updateClouds(dt);updateWaterView();updateExtraTools(dt,now);updateWater(dt);
  {const lo=tool===8?1:0;uLO.value=lo;lLight.intensity=lo*(1.5+.1*Math.sin(now/130));uLP.value.copy(camera.position);lLight.position.copy(camera.position);}
  const r=playing?ray():null;sel.visible=!!r;if(r)sel.position.set(r.x+.5,r.y+.5,r.z+.5);
  if(r&&r.y===0&&mining&&playing&&tool!==4&&now-bedrockT>2500){bedrockT=now;toast('🪨 Fundo do mundo: camada indestrutível');}
  if(r&&r.y>0&&mining&&playing&&tool!==4){const k=r.x+','+r.y+','+r.z;if(k!==mt){mt=k;mp=0;}const t=get(r.x,r.y,r.z);
    mp+=dt*(TOOLS[tool].m.includes(t)?(TOOLS[tool].sp||4):1)/HARD[t];if(mp>=1){act(true);mp=0;mt=null;}}else{mt=null;mp=0;}
  pb.style.display=mp>0?'block':'none';pb.firstChild.style.width=Math.min(mp,1)*100+'%';arrowTick(dt);
  crack.visible=!!r&&mp>0;if(crack.visible){crack.position.copy(sel.position);crack.material.map=crackTex[Math.min(5,Math.floor(mp*6))];}
  renderer.render(scene,camera);
}
// O próximo frame é agendado ANTES de rodar o quadro: um erro num frame não congela o jogo.
let loopErrs=0;
function loop(now){requestAnimationFrame(loop);try{frame(now);}catch(e){loopErrs++;if(loopErrs<=3)console.error('[MiniBlocos] erro no loop:',e);
  if(loopErrs===1)try{toast('⚠️ Erro interno (veja o console). O jogo continua.');}catch(_){}}}
