/* MiniBlocos · Inicialização: roda por último, depois que todos os módulos foram carregados */
// fundo do mundo: garante que y=0 seja sólido (cura buracos de saves antigos em que dava para cavar até o vazio)
for(let x=0;x<W;x++)for(let z=0;z<D;z++)if(!solid(x,0,z))B[idx(x,0,z)]=3;
// monta fogueiras/lampiões existentes e gera as malhas do mundo
for(let i=0;i<B.length;i++)if(B[i]===14)addFire(i%W,Math.floor(i/(W*D)),Math.floor(i/W)%D);else if(B[i]===15)addLamp(i%W,Math.floor(i/(W*D)),Math.floor(i/W)%D);
build();
// hotbar e ferramenta iniciais
pick(0);
setTool(0);
// restaura o estado salvo (precisa de todos os módulos já carregados)
if(SV&&SV.s){try{restoreState(SV.s);toast('\ud83d\udcbe Mundo carregado');}
  catch(e){console.error('[MiniBlocos] falha ao restaurar o estado salvo:',e);toast('\u26a0\ufe0f Parte do progresso salvo n\u00e3o p\u00f4de ser restaurada');}}
if(loadWarn)toast(loadWarn);
// inicia o jogo
requestAnimationFrame(loop);
