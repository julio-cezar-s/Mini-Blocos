/* MiniBlocos · Nômades: moradores pacíficos da aldeia (js/world/village.js)
   Andam perto das casas, cumprimentam quem chega perto e às vezes dão uma maçã. Não morrem: se você bater, eles fogem.
   Reaproveita o sistema de animais (animals.js). Carregue DEPOIS de js/entities/predators.js. */
(function(){
if(typeof VILLAGE==='undefined'||!VILLAGE)return;   // sem aldeia neste mundo: nada a fazer
SPEC.nomad={b:[.5,.7,.26,'#d8c090'],l:[.16,.8,'#5a4630'],h:[.3,'#c68a5a'],x:[],v:1,r:.25,hh:1.75};
AHP.nomad=999;DROP.nomad=0;                  // vida enorme: não dá para matar
const
   NAMES=['Amir','Zahra','Tariq','Leila','Omar','Samira','Karim','Nadia','Yusuf','Farida'];
   const TALK={
      chegada:[
         'Ei, viajante! Você tem cara de quem veio de muito longe.',
         'Finalmente um rosto novo por aqui!',
         'Que os bons ventos acompanhem sua jornada.',
         'Nossa aldeia é pequena, mas sempre há espaço para mais um.',
         'Se procura abrigo, nossa fogueira ainda está acesa.',
         'As estradas são perigosas. Fique por perto quando escurecer.',
         'Você parece alguém que sabe sobreviver neste mundo.',
         'De onde vem, viajante? Nunca vi roupas como as suas!',
         'Cuidado com o caminho. Nem tudo que parece tranquilo é seguro.',
         'Que bom encontrar alguém por aqui. A solidão cansa!'
      ],

      olhar:[
         'Está procurando alguma coisa no meu rosto?',
         'Haha! Nunca viu um viajante antes?',
         'Precisa de alguma coisa? Posso tentar ajudar.',
         'Bela ferramenta! Foi você quem fabricou?',
         'Não sou muito bom em conversas, mas gosto de conhecer pessoas.',
         'Está tudo bem? Você parece estar procurando alguma coisa.',
         'Se descobrir algum lugar interessante, conte para nós!',
         'Pode olhar à vontade, mas minha mochila não está à venda!',
         'Você tem jeito de explorador. Acertei?',
         'Não se esqueça de aproveitar a paisagem!'
      ],

      avisos:[
         'O sol está desaparecendo. Procure abrigo antes que escureça!',
         'Não ouviu os lobos ontem? Eles estão chegando cada vez mais perto.',
         'Nunca entre em cavernas profundas sem estar preparado.',
         'Se encontrar uma onça, não tente enfrentá-la desprotegido!',
         'Guarde comida. Você nunca sabe quando precisará dela.',
         'Não subestime os ursos. Eles são muito mais fortes do que parecem.',
         'Sempre tenha uma rota de fuga quando explorar lugares perigosos.',
         'Cuidado com as cobras escondidas na vegetação!',
         'Uma cama pode salvar sua jornada. Não se esqueça de preparar uma.',
         'Se ouvir passos na floresta durante a noite, fique atento!'
      ],

      historias:[
         'Dizem que existe um minério azul escondido nas profundezas...',
         'Meu avô jurava que havia diamantes muito abaixo destas terras.',
         'Uma vez encontramos um lago cheio de peixes coloridos.',
         'Há lugares neste mundo que ainda não aparecem em nenhum mapa.',
         'Antigamente, nossa caravana atravessava desertos por semanas.',
         'Encontrei uma caverna tão profunda que não conseguia enxergar o fundo.',
         'Dizem que os animais sabem quando uma tempestade está chegando.',
         'Já encontrei ouro em lugares onde ninguém imaginaria procurar.',
         'Cada montanha esconde uma história. Basta ter coragem para explorá-la.',
         'Um dia quero conhecer todos os cantos deste mundo.'
      ],

      humor:[
         'Se encontrar uma maçã pelo caminho, lembre-se de mim!',
         'Meu irmão diz que constrói uma casa em cinco minutos. Nunca acredite nele.',
         'Eu deveria estar trabalhando... mas esta sombra está boa demais.',
         'Você constrói casas. Nós construímos histórias!',
         'Minha mochila está pesada. Acho que trouxe coisas demais novamente.',
         'Se eu pudesse, passaria o dia inteiro perto da fogueira.',
         'Hoje prometi trabalhar bastante. Amanhã começo!',
         'Você já tentou contar quantas estrelas existem? Eu desisti!',
         'Não conte ao chefe, mas tirei uma soneca depois do almoço.',
         'A melhor ferramenta de sobrevivência? Saber quando correr!'
      ]
   };

const ROBES=[['#d8c090','#b08a50','#f0e8d0'],['#3a5a8a','#2a4468','#d8d0c0'],['#a8402a','#80301e','#e8dcc0'],['#e8e0d0','#c8c0b0','#a8402a'],['#6a7a3a','#4e5a2a','#e0d4a8']];
const SKINS=['#c68a5a','#a8693e','#8a5232','#d8a070'];
const MAXN=Math.max(5,VILLAGE.doors.length);   // quantos nômades vivem na aldeia

// ---------- modelo: homem/mulher de túnica comprida, turbante e mochila ----------
function mkNomad(){
  const rv=Math.random,s=SPEC.nomad,g=new THREE.Group(),bg=new THREE.Group(),hg=new THREE.Group(),tg=new THREE.Group();
  const pal=ROBES[Math.floor(rv()*ROBES.length)],skin=SKINS[Math.floor(rv()*SKINS.length)],L=s.l[1],bh=s.b[1];
  g.userData.legs=[];g.add(bg);
  bg.add(bx(.5,bh,.26,pal[0],0,L+bh/2,0));                  // tronco
  bg.add(bx(.54,.46,.3,pal[0],0,L-.12,0));                  // túnica comprida cobrindo o alto das pernas
  bg.add(bx(.56,.08,.32,pal[1],0,L+.34,0));                 // faixa na cintura
  bg.add(bx(.58,.14,.32,pal[1],0,L+bh-.07,0));              // xale nos ombros
  bg.add(bx(.34,.42,.16,'#7a5a32',0,L+.4,-.21));            // mochila
  bg.add(bx(.4,.14,.14,'#a8402a',0,L+.72,-.21));            // rolo de dormir
  for(const sx of[-1,1]){
    const lg=new THREE.Group();lg.position.set(sx*.12,L,0);
    lg.add(bx(.16,L,.16,'#5a4630',0,-L/2,0));lg.add(bx(.17,.07,.22,'#3a2a1c',0,-L+.035,.03));
    lg.userData.ph=sx>0?0:Math.PI;g.add(lg);g.userData.legs.push(lg);
    const ar=new THREE.Group();ar.position.set(sx*.32,L+bh-.08,0);   // braços balançam ao contrário das pernas
    ar.add(bx(.14,.52,.14,pal[0],0,-.26,0));ar.add(bx(.11,.1,.11,skin,0,-.57,0));
    ar.userData.ph=sx>0?Math.PI:0;g.add(ar);g.userData.legs.push(ar);}
  hg.position.set(0,L+bh,0);
  hg.add(bx(.3,.3,.3,skin,0,.17,0));hg.add(bx(.05,.07,.05,skin,0,.14,.17));
  hg.add(bx(.36,.16,.36,pal[2],0,.33,0));hg.add(bx(.3,.1,.3,pal[2],0,.43,0));            // turbante
  if(rv()<.5)hg.add(bx(.32,.13,.32,pal[2],0,.08,0));else hg.add(bx(.2,.12,.04,'#3a2a20',0,.07,.152));   // véu no rosto ou barba
  for(const sx of[-1,1])hg.add(bx(.06,.04,.02,'#1a1a1a',sx*.075,.2,.152));
  bg.add(hg);bg.add(tg);
  const sh=new THREE.Mesh(new THREE.CircleGeometry(1,14),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.28,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  sh.rotation.x=-Math.PI/2;sh.scale.set(.4,.3,1);sh.position.y=.02;g.add(sh);
  Object.assign(g.userData,{bg,hg,sh,tg,wings:[],hy:L+bh,bz:0});
  g.scale.setScalar((1/S)*(.96+rv()*.08));return g;}

const _mk=mk;mk=function(k){return k==='nomad'?mkNomad():_mk(k);};

// ---------- criar nômades ----------
function spawnNomad(x,z){
  const g=mk('nomad');scene.add(g);
  animals.push({k:'nomad',g,x,y:VILLAGE.y0+1.01,z,vy:0,th:Math.random()*6.28,tt:Math.random()*3,mv:false,gr:false,bl:0,
    nm:NAMES[Math.floor(Math.random()*NAMES.length)],talkT:0,giftT:0});}
const count=()=>animals.filter(a=>a.k==='nomad').length;
VILLAGE.doors.forEach((d,i)=>{if(i<MAXN)spawnNomad(d.x+(Math.random()-.5)*2,d.z+(Math.random()-.5)*2);});
spawnNomad(VILLAGE.cx+2.5,VILLAGE.cz);   // um sentado perto da fogueira


// ---------- comportamento e conversas avançadas ----------
let lastTalk=-1e9;

const _updA=updA;
const _nomadDir=new THREE.Vector3();
const _nomadLook=new THREE.Vector3();

function randomTalk(list){
  return list[Math.floor(Math.random()*list.length)];
}

function getNomadDialogue(a,looking){
  const hr=typeof dayT==='number'?(dayT*24)%24:12;

  // Avisos contextuais sobre o horário
  if(hr>=18&&hr<21&&Math.random()<.65)
    return '🌇 '+randomTalk([
      'O sol está se pondo. Volte para a aldeia!',
      'A noite está chegando. Prepare sua fogueira.',
      'Não recomendo explorar a floresta agora.',
      'É melhor encontrar uma cama antes que fique escuro.'
    ]);

  if(hr>=21||hr<5)
    return '🌙 '+randomTalk([
      'Você está andando por aí a esta hora? Tenha cuidado!',
      'A noite pertence aos predadores. Fique alerta!',
      'Eu não sairia da aldeia agora se fosse você.',
      'Ouvi barulhos estranhos perto da floresta...'
    ]);

  // Alterna os assuntos das conversas
  const roll=Math.random();

  if(looking&&roll<.45)
    return randomTalk(TALK.olhar);

  if(roll<.68)
    return randomTalk(TALK.avisos);

  if(roll<.85)
    return randomTalk(TALK.historias);

  return randomTalk(TALK.humor);
}

updA=function(a,dt){
  if(a.k!=='nomad'){
    _updA(a,dt);
    return;
  }

  const dx=P.x-a.x;
  const dz=P.z-a.z;
  const dist=Math.hypot(dx,dz);
  const now=performance.now();

  a.talkT=Math.max(0,a.talkT-dt);
  a.giftT=Math.max(0,a.giftT-dt);

  const live=typeof playing!=='undefined'&&playing&&hp>0;

  // Verifica se o jogador está olhando para o nômade
  let looking=false;

  if(live&&dist<9&&typeof camera!=='undefined'){
    camera.getWorldDirection(_nomadDir);

    _nomadLook.set(
      a.g.position.x-camera.position.x,
      a.g.position.y+1.1-camera.position.y,
      a.g.position.z-camera.position.z
    ).normalize();

    looking=_nomadDir.dot(_nomadLook)>.94;
  }

  if(!(a.flee>0)){
    if(Math.hypot(a.x-VILLAGE.cx,a.z-VILLAGE.cz)>20){
      a.th=Math.atan2(VILLAGE.cx-a.x,VILLAGE.cz-a.z);
      a.mv=true;
      a.gz=false;
      a.tt=2;
    }
    else if(live&&
      (dist<4||(looking&&dist<9))&&
      Math.abs(P.y-a.y)<3){

      a.mv=false;
      a.gz=false;
      a.tt=2.5;
      a.th=Math.atan2(dx,dz);

      // Evita conversas repetidas e excesso de mensagens
      if(a.talkT<=0&&now-lastTalk>2200){

        const first=!a.metPlayer;
        a.metPlayer=true;

        let message;

        if(first){
          message=randomTalk(TALK.chegada);
        }else{
          message=getNomadDialogue(a,looking);
        }

        a.talkT=first?18:24;
        lastTalk=now;

        toast('🧕 '+a.nm+': “'+message+'”');

        // Presentes ocasionais
        if(a.giftT<=0&&Math.random()<.20){
          a.giftT=150;

          setTimeout(()=>{
            if(typeof apples!=='undefined'){
              apples++;
              toast('🍎 '+a.nm+' te presenteou com uma maçã!');
            }
          },2200);
        }
      }
    }
  }

  _updA(a,dt);
};


  // ---------- reposição de moradores ----------
  let chkT=0;
  const _resp=respawnAnimals;

  respawnAnimals=function(dt){
    _resp(dt);
    chkT+=dt;

    if(chkT<30)return;
    chkT=0;

    if(count()<MAXN){
      const d=VILLAGE.doors[
        Math.floor(Math.random()*VILLAGE.doors.length)
      ];

      if(d)spawnNomad(d.x,d.z);
    }
  };
})();
