# MiniBlocos

Jogo de blocos 3D (three.js r128) que antes era um único HTML. Agora está dividido em CSS e JavaScript,
organizados por elemento. O código foi separado sem mudar a lógica e, depois, receberam
as correções listadas em "Correções aplicadas". Os demais bugs da análise ainda não foram mexidos.

## Como rodar
Abra `index.html` no navegador. O three.js é carregado de `lib/three.min.js` e, se esse arquivo não existir, do CDN (precisa de internet).
Para jogar **offline**, baixe o three.js **r128** e salve como `lib/three.min.js` (instruções em `lib/LEIA-ME.txt`).
O mundo é salvo no `localStorage` do navegador (chave `miniblocos_v1`).

## Estrutura
```
MiniBlocos/
├── index.html            só a estrutura (HTML) + <link> dos CSS + <script> dos JS
├── css/
│   ├── base/             página e canvas
│   ├── hud/              mira, corações, fome, ar, relógio, barra de mineração
│   ├── overlays/         tela inicial, fade, dano, toast
│   ├── ui/               hotbar, picker, botões do topo, inventário
│   ├── panels/           baú, bancada/forno, mapa
│   └── mobile/           controles de toque
├── lib/                  coloque aqui o three.min.js (r128) para jogar offline
└── js/
    ├── world/            constantes, tipos de bloco, geração do terreno
    ├── storage/          ler e salvar o mundo
    ├── render/           cena, texturas, chunks, fogueiras, seleção, céu
    ├── player/           estado/colisão, ferramentas, interação (quebrar/colocar)
    ├── inventory/        itens e quantidades
    ├── input/            teclado/mouse e toque
    ├── ui/               ícones, hotbar, inventário, HUD, mapa
    ├── systems/          sobrevivência (vida, fome, ar, respawn)
    ├── combat/           ataque corpo a corpo e arco
    ├── blocks/           baú, cama, portas, bancada, forno, rampas, fogueira, balde
    ├── entities/         animais
    ├── core/             loop principal
    └── main.js           inicialização (roda por último)
```

## Ordem dos scripts (importante)
Os arquivos JS são scripts comuns (sem módulos), então compartilham as mesmas variáveis globais, como no
arquivo único. Por isso a **ordem das tags `<script>` no `index.html` não pode ser trocada**: alguns
arquivos usam, ao carregar, coisas definidas pelos anteriores (por exemplo `terrain.js` usa `B` de
`constants.js`). Se criar um arquivo novo, coloque-o depois das dependências dele e antes de `core/loop.js`.

`js/main.js` reúne o que precisa rodar só depois de tudo carregado: montar as malhas do mundo,
selecionar a hotbar/ferramenta inicial, restaurar o save e iniciar o loop.

## Observação
O CSS também preserva a ordem original das regras que se sobrescrevem (por exemplo `.slot` e `#bar` em
`css/ui/hotbar.css`, `.it` em `css/ui/inventory.css`). Não reordene as linhas dentro desses arquivos.

## Correções aplicadas (botões que paravam de funcionar)
- **Arco e Balde** (`input/keyboard-mouse.js`, `input/touch.js`): com eles equipados, o clique direito (PC) e o
  toque curto (celular) voltam a abrir baú/bancada/forno/porta/cama e, com o Arco, a colocar blocos.
  No celular, com o Arco, toque curto = usar/colocar; **segurar** = puxar e atirar.
- **Pointer lock** (`input/keyboard-mouse.js`): todas as chamadas passam por `lockPointer()`. Se o navegador
  recusar (erro, promessa rejeitada ou sem resposta em 700 ms), a tela "Clique para jogar" volta em vez de o
  jogo ficar parado sem nada clicável.
- **Toque** (`input/touch.js`): `touchcancel` agora para o movimento, a mineração e o arco; os botões de direção
  são independentes (soltar ▲ com ▼ pressionado não zera mais o movimento).
- **Loop** (`core/loop.js`): `frame()` faz um quadro e `loop()` agenda o próximo antes de executá-lo, dentro de
  `try/catch`. Um erro em um quadro não congela mais o jogo (aparece um aviso e o erro vai ao console).
- **Foco da janela** (`input/keyboard-mouse.js`): ao trocar de aba/janela, teclas e ações em andamento são soltas.
- **Inventário no celular** (`ui/inventory.js`, `css/ui/inventory.css`): o painel rola com o dedo (antes cada item bloqueava a rolagem).
  Para arrastar um item no celular, **segure ~0,25 s** (o item brilha) e arraste; deslizar logo de cara rola a lista.
  O mouse continua arrastando direto. A altura do painel usa `dvh` para não ficar escondida atrás da barra do navegador.
- **Hotbar e botões no celular** (`css/ui/hotbar.css`, `css/mobile/touch.css`, `index.html`): a hotbar tinha 394px de largura e
  estourava telas de até ~390px. Agora o tamanho do slot é `--slot` (58px em telas largas, encolhe até caber), e os slots usam
  `box-sizing:border-box`. O botão ▼ cobria os slots 2–3: o D-pad subiu para ficar acima da hotbar, e as posições dos botões
  (antes inline no HTML) foram para `css/mobile/touch.css`, já considerando a safe-area (notch/barra inferior).
- **Save** (`storage/*.js`, `blocks/furnace.js`, `blocks/campfire.js`, `main.js`):
  - o que está no **forno** (receita, quantidade, tempo restante), a carne na **fogueira**, o **combustível** e a **seed** do mundo agora são salvos e
    restaurados (antes o material consumido sumia ao recarregar e as manchas dos minérios mudavam a cada sessão);
  - quebrar o forno no meio de uma fundição **devolve o material** e não deixa mais um forno "ocupado" fantasma;
  - **carregamento protegido**: o save só é aceito se tiver ids de bloco válidos; cada campo do estado é validado (o que estiver
    inválido volta ao padrão) e um erro na restauração não impede o jogo de abrir;
  - se o save não puder ser lido, uma **cópia é guardada** em `localStorage` na chave `miniblocos_v1_backup` e o jogo avisa, em vez de
    apagá-lo em silêncio quando o mundo novo for salvo.
- **Fundo do mundo e respawn** (`core/loop.js`, `player/interaction.js`, `main.js`, `systems/survival.js`):
  - a camada y=0 é **indestrutível** (não dá mais para cavar até o vazio). Ao carregar, buracos de saves antigos nessa camada são tampados.
    Segurar para quebrar o fundo mostra um aviso (no máximo a cada 2,5 s). Se mesmo assim cair para fora do mundo, o jogador volta a um ponto seguro;
  - o **respawn** agora escolhe um ponto seguro: chão sólido com 3 blocos livres acima e sem água na altura do corpo, ignorando copas de árvore.
    Se o ponto inicial virou lago, está sob tronco ou fechado, procura o lugar seguro mais próximo (até 12 blocos);
  - com **cama**: volta em cima dela (ou ao lado, se houver teto baixo). Se a cama foi destruída, volta ao início e esquece o ponto de retorno.
- **Rampas e escadas** (`blocks/slopes.js`, `core/loop.js`, `systems/survival.js`): entrar pela ponta alta ou pela lateral de uma rampa jogava o
  jogador até 1 bloco para cima de uma vez (até no ar). Agora a rampa só "sobe sozinha" até um degrau de 0,62 bloco no chão (0,3 no ar); acima disso a
  ponta alta e as laterais funcionam como parede (no chão vale a mesma auto-subida de 1 bloco dos blocos comuns). Como os degraus (escada de 0,5, auto-subida
  de 1,02) continuam instantâneos na física, a **câmera é suavizada** neles (`stepOff`), sem atraso em rampas contínuas.
- **Desempenho** (`render/chunks.js`, `render/fire.js`, `ui/hotbar.js`, `ui/block-icons.js`):
  - a montagem das malhas pula células totalmente cercadas por blocos opacos, não recria arrays a cada face e só testa as fogueiras
    que estão perto do chunk. A geometria gerada é **idêntica** à de antes (conferido por checksum), e montar o mundo / editar blocos ficou ~2x mais rápido nos testes;
  - as fogueiras não criam mais uma luz real cada: existem só 2 luzes na cena, que seguem as 2 fogueiras mais próximas do jogador
    (o brilho nos blocos continua vindo do atributo `fb` das malhas). Número fixo de luzes = colocar/quebrar fogueira não recompila shaders;
    o `removeFire` também libera geometria/material;
  - a hotbar monta o DOM dos slots uma vez e só atualiza o ícone ou a quantidade que mudou (antes refazia tudo a cada bloco colocado/quebrado).
- **Hotbar sem duplicatas** (`input/keyboard-mouse.js`, `ui/hotbar.js`): a tecla R pula blocos que já estão em outro slot e o seletor de bloco troca os dois slots (como o inventário).
- **Animais** (`entities/animals.js`): quando sobram menos de 20, nasce um novo a cada 12 s, da espécie mais rara e a pelo menos 24 blocos do jogador.
- **Colisão das rampas e escadas com o corpo todo** (`blocks/slopes.js`, `core/loop.js`, `systems/survival.js`): antes só o ponto central do jogador era testado, então
  dava para entrar de lado na rampa (o corpo atravessava a lateral) e andar ou pular por baixo dela. Agora os 4 cantos do corpo (mesmo tamanho usado nos blocos comuns) são amostrados:
  o jogador apoia no ponto mais alto sob ele (como uma caixa numa ladeira), a lateral, a ponta alta e a parte de baixo da rampa são parede/teto (a cabeça bate ao pular por baixo),
  e a auto-subida de 1 bloco continua valendo como nos blocos comuns. Não é possível colocar uma rampa dentro do jogador, e se ele já estiver dentro (nasceu ali) é empurrado para cima da superfície.
  O respawn também evita nascer sob uma rampa.
- **Painéis no celular** (`css/panels/*.css`, `css/ui/inventory.css`): em painéis rolável (baú, bancada, forno, inventário) o botão ✕ ficava dentro da área que rola e
  **sumia ao rolar**, deixando o painel sem como fechar. Agora o título e o ✕ formam um cabeçalho fixo e opaco (as linhas rolam por baixo dele). Os painéis também passavam
  ~34px da altura/largura da tela (`box-sizing` não herdado: padding e borda somavam ao `max-height`): agora usam `border-box`, `92dvh` (altura visível no celular),
  `touch-action:pan-y` e `overscroll-behavior:contain`. O mapa também usa `dvh`.

## Limite de arquivos por pasta (GitHub)
Regra do projeto: **menos de 99 arquivos por subpasta**. Para conferir:
`find css -type f | wc -l` e `find js -type f | wc -l` (e o mesmo para cada subpasta).


## Melhorias visuais (rodada atual)
- Sombra de cantos (oclusão ambiente) em js/render/chunks.js
- Rachaduras ao quebrar bloco em js/render/selection.js
- Nuvens, névoa azul debaixo d'água e ondas na água em js/render/atmosphere.js (carregado em index.html após sky.js; chamadas em js/core/loop.js)

## Mundo maior
- Tamanho do mundo: 160x160 blocos (antes 96x96), definido em js/world/constants.js (`W`, `D`; use múltiplos de 16 e mantenha W=D por causa do mapa)
- Minérios escalam com a área (`AF`), animais com um fator limitado (`AA`) e as nuvens cobrem o mundo todo (atmosphere.js)
- Saves antigos (96x96) não carregam no mundo novo: o jogo guarda uma cópia em `miniblocos_v1_backup` e cria um mundo novo
- A geração inicial demora mais (alguns segundos no celular)

## Animais mais reais (js/entities/animals.js)
- Giro suave, arrancada/parada gradual e passos que acompanham a velocidade (fuga = passada mais rápida)
- Comportamento: anda, pasta/bica o chão ou fica olhando em volta; olham para o jogador quando ele está perto
- Cabeça com pivô no pescoço, rabo que balança (vaca, porco, ovelha, galinha), asas da galinha batem na fuga e ela plana ao cair
- Balanço do corpo ao andar, respiração, sombra suave no chão, variação de tamanho e de cor (vacas com manchas ou marrons, galinhas brancas ou marrons)
- Animais não se sobrepõem uns aos outros
- Animação de morte (animals.js: `killAnimal`/`updDying`): o animal tomba de lado, estrebucha, encolhe e some numa nuvenzinha. `melee.js` e `bow.js` chamam `killAnimal(a)`
- Susto (animals.js, início de `updA`): galinhas e ovelhas param, levantam a cabeça e fogem quando o jogador se aproxima correndo (ou chega a ~2 blocos); o bando por perto se assusta junto. Porcos e vacas continuam calmos

## Alfinete no mapa (js/ui/map.js)
- Toque/clique no mapa para marcar um 📍 alfinete; o botão "Remover alfinete" (ou marcar outro lugar) troca/remove
- Uma seta no canto superior direito da tela aponta para o alfinete, girando conforme para onde você olha, com a distância em metros
- No mapa aparece o alfinete e uma linha tracejada até ele; ao chegar a ~2,5 blocos o alfinete some com um aviso
- O alfinete é salvo junto com o mundo (campo `pin` no save). Chamadas: `updatePin()` em loop.js, `restorePin()` em save-world.js

## Ferramentas novas (js/player/tools.js + js/player/tools-extra.js)
Adicionadas no fim da lista `TOOLS` (índices 10 a 15), então saves antigos continuam válidos:
- **Pá de ferro**, **Machado ferro** e **Espada ferro**: versões mais rápidas/fortes (a espada de ferro dá mais dano e mais carne)
- **Bússola** (13): seta para o norte, direção (N, NE, L...), coordenadas e distância até o alfinete
- **Luneta** (14): zoom suave com moldura circular; a sensibilidade do olhar diminui junto com o zoom
- **Vara** (15): mire na água perto de peixes e toque para lançar; um peixe nada até a boia e fisga, então toque de novo em até 1,4 s para pegá-lo (+1 ou +2 carne conforme o tamanho). Em portas, baús etc. o toque continua funcionando normalmente
- Selecione pelo botão de ferramenta, pela tecla Q ou pelo inventário. Ganchos: `updateExtraTools()` em loop.js, `fishUse()` em keyboard-mouse.js e touch.js

## Peixes (js/entities/fish.js)
- Cardumes de 3 a 5 peixes (laranja, azul, prateado, vermelho, verde) nadam nos rios e lagos, em tamanhos variados, com cauda que balança e inclinação ao subir/descer
- Ficam sempre dentro da água (viram ao chegar na margem/fundo) e somem se a água for removida; novos cardumes aparecem aos poucos até o limite (~24 peixes, proporcional ao volume de água)
- A vara só lança se houver peixe a até 10 blocos da boia; o peixe mais próximo é atraído, e se você puxar cedo ou tarde ele se assusta e foge. Peixe pescado sai do mundo e é reposto depois
- Os peixes são criados no primeiro frame (depois do mundo/save carregar) e não são salvos

## Água que preenche e seca (js/world/water.js)
- Tipos de água (array `WTY`): natural (fonte, permanente), escorrida (1 a 7 = distância da fonte) e despejada do balde (fonte que não escorre para os lados)
- Ao quebrar um bloco ao lado da água (ou embaixo dela) o espaço é preenchido; a água só chega até o nível do lago, nunca acima. Para os lados escorre no máximo 6 blocos; de cima, desce até o fundo
- A água que escorreu só existe enquanto estiver alimentada (água acima dela ou uma vizinha lateral mais perto da fonte). Se você fecha a entrada com um bloco, tira a fonte ou despeja de novo, ela seca aos poucos
- Balde: ao pegar água, o buraco volta ao mesmo tipo de água em ~1 s se ainda houver água válida ao lado ou acima (lagos não se desfazem por coletas repetidas; água isolada despejada não volta)
- A água que não é natural é salva no save (campo `wd`) e continua secando normalmente depois de recarregar
- Ganchos: `waterTouch()` em interaction.js (quebrar/colocar bloco), `waterPoured()`/`waterRefill()` em bucket.js, `updateWater(dt)` em loop.js, `waterToSave()`/`waterFromSave()` em save-world.js

## Diagnóstico de carregamento (index.html)
- Uma caixa vermelha no topo da tela lista os primeiros erros de carregamento (arquivo:linha). O primeiro erro costuma ser a causa; toque na caixa para fechar
- Depois de 0,8 s o jogo confere se o three.js (precisa ser r128) e as peças principais existem e avisa o que está faltando
- Lembrete: o zip não inclui `lib/three.min.js` (veja lib/LEIA-ME.txt). Sem ele o jogo baixa o three.js do CDN (precisa de internet); para jogar offline, copie o arquivo para a pasta lib. A caixa só avisa se o three.js não carregar de nenhum dos dois

## Mais animais e peixes
- **Animais novos** (js/entities/animals.js): 🐇 coelho (anda aos pulinhos, muito arisco: foge a ~11 blocos), 🐴 cavalo (grande; pelagem castanha, preta, branca ou palomino; crina e rabo que balançam), 🐐 cabra (chifres, barbicha, branca/marrom/preta; se assusta como a ovelha) e 🦆 pato (ave de duas patas que nasce e boia na água, nada, bate as asas na fuga; branco, mallard ou escuro)
- Cada espécie tem vida e carne em `AHP`/`DROP` (js/systems/survival.js): coelho 1/1, cavalo 5/4, cabra 3/2, pato 2/1. Total inicial: ~54 animais (antes ~42); o renascimento sempre repõe a espécie mais rara (e ignora o pato se não houver água)
- Flags em `SPEC`: `bip` (ave), `sk` (distância de susto), `hop` (pulinhos), `swim` (nada), `vr` (variações de cor)
- **Peixes novos** (js/entities/fish.js): tilápia (corpo alto), truta (pintas), dourado (raro), baiacu (redondo com espinhos), moreia (corpo longo que ondula) e arraia (achatada, bate as "asas"), além dos 5 peixes coloridos. Cada espécie tem raridade (`w`), tamanho e carne base (`y`): tilápia/truta/moreia 2, dourado/arraia 3, baiacu e coloridos 1 (+1 se o peixe for dos maiores). Raros avisam com ✨ ao pescar

## Blocos novos (IDs 34 a 50)
- **Naturais:** 34 cascalho e 35 argila (manchas no fundo de rios e lagos, quebram rápido com a pá), 40 abóbora (espalhada na grama, mais comum em manchas) e 46 minério de diamante (raro, nas profundezas)
- **Fabricados na bancada:** 37 pedra lapidada (4 pedra), 38 pedra musgosa (2 pedra + 2 folhas), 39 piso xadrez (3 pedra lapidada + 1 carvão), 41 feno (6 folhas), 42 lã (4 folhas), 43/44/45 terracota amarela/cinza/laranja (4 telha + 1 ouro/carvão/ferro) e 47/48/49/50 blocos de ferro/ouro/carvão/diamante (4 do minério cada)
- **Forno:** argila → 36 tijolo (precisa de combustível, como os outros)
- Ferramentas: a pá acelera cascalho e argila, o machado a abóbora e o feno, a tesoura a lã, e a picareta (e a de ferro) os blocos de pedra, terracota e metal
- O atlas de texturas cresceu de 6x6 para 6x10 tiles (`ATR` em textures.js); os cálculos de UV em chunks.js e slopes.js usam esse valor. Para criar mais blocos: `T` em blocks.js, `TMAP` e uma textura em textures.js, `HARD`/`TOOLS` em tools.js, `ALL`/`nm` em items.js, e opcionalmente receita, forno, geração do terreno e cor do mapa

## Ferramentas por material, durabilidade e fabricação (js/player/durability.js + js/blocks/workbench.js)
- **Materiais:** pá, machado, picareta e espada de madeira, pedra, ferro, ouro e diamante. Velocidade ao minerar (×4 madeira, ×5 pedra, ×8 ferro, ×12 ouro, ×10 diamante) e dano crescem com o material; o ouro é rápido mas frágil
- **Durabilidade:** madeira 60, pedra 130, ferro 250, ouro 32, diamante 800. Gasta 1 por bloco quebrado (a espada 2), 1 por golpe em animal, 1 por tiro de arco (200), 1 por lançamento de vara (60), 1 por folha/lã cortada com a tesoura (120) e 1 a cada 6 s com a lanterna acesa (300). Balde, bússola e luneta não quebram. Ao zerar a ferramenta quebra e some; o botão de ferramenta e o inventário mostram uma barra de desgaste e avisam quando falta pouco
- **Começo do jogo:** só mão e ferramentas de madeira. O resto se fabrica na bancada com minérios + tábuas/lã/vidro (ex.: picareta de ferro = 3 ferro + 2 tábuas; balde 3 ferro; tesoura 2 ferro; arco 3 tábuas + 3 lã; vara 3 tábuas + 2 lã; lanterna vidro + ouro + carvão; bússola 2 ferro + ouro; luneta 2 vidro + 2 ferro + ouro). Saves antigos mantêm todas as ferramentas que já tinham
- **Bancada:** abas "Posso fazer" (só o que o seu inventário permite agora), "Ferramentas", "Consertar" (restaura a durabilidade por metade do material), "Blocos" e "Tudo"; um resumo diz quantos itens dá para fabricar e as receitas possíveis aparecem primeiro
- Tecla Q/botão de ferramenta passam só pelas ferramentas que você tem; no inventário as que faltam ficam apagadas
- A posse e a durabilidade são salvas no campo `tw` do save

## Correção: ícones de Rampa e Escada
- `cubeSrc()` em js/ui/block-icons.js devolvia um `<img>` inteiro no lugar da URL da imagem para os blocos 24 e 25, o que gerava 2 imagens quebradas (e os 2 avisos vazios na caixa de diagnóstico). Agora devolve só a URL

## Carregador com novas tentativas (index.html)
- O `index.html` não usa mais `<link>`/`<script src>`: um carregador no fim do arquivo baixa CSS e scripts **um por vez, na ordem das listas `CSS` e `JS`**, sem cache, e tenta de novo (até 6 vezes) se algum falhar. Isso resolve os arquivos que "às vezes não carregam" no servidor do Acode (cada vez falhava um arquivo diferente)
- Para adicionar um arquivo novo ao jogo, inclua o caminho dele na lista certa (a ordem importa, como antes). Um contador "Carregando n/total" aparece no canto durante o carregamento
- O three.js é pedido primeiro em `lib/three.min.js`; se não existir, o carregador usa o CDN
- Se um arquivo falhar mesmo após as 6 tentativas, a caixa vermelha mostra qual e o carregamento para (em vez de o jogo quebrar pela metade)

## Cavalo mais detalhado (js/entities/animals.js, `horseDetail`)
- Pescoço inclinado com crina, cabeça alongada (crânio, focinho, mandíbula, narinas, boca, franja, olhos com brilho e orelhas), peito, garupa e cernelha, barriga mais escura, coxas maiores nas patas de trás, joelhos e patas com meias brancas
- Pelagens: baio, preta, branca, palomino, alazã e tordilha, com estrela/listra branca no rosto (45%) e, às vezes, manchas de cavalo pintado
- Rabo longo em duas partes que balança de lado; ao pastar o pescoço e a cabeça descem juntos e ao se assustar a cabeça sobe
- Correção: a animação de pastar de todos os animais nunca tocava (a condição falhava quando o animal ainda não tinha sido atingido)

## Alçapão (js/blocks/hatch.js)
- Porta de chão que abre para cima. Item 51 (receita: 4 tábuas; o jogo começa com 2). No mundo: ids 52-55 fechado e 56-59 aberto; `(id-52)&3` = lado da dobradiça (0 +x, 1 -x, 2 +z, 3 -z), o lado para onde o jogador olhava ao colocar
- Mirar no topo de um bloco: o alçapão substitui o bloco (que volta ao inventário) e fica rente ao chão. Mirar na parede de um buraco/caverna: entra na célula vazia
- Fechado é sólido (dá para andar em cima); aberto não tem colisão, a tampa fica em pé na dobradiça e a célula vira um buraco de 1 bloco. Toque para abrir/fechar; quebrar devolve o item
- Ganchos: `ray()` e `act()` em interaction.js (`hatchLidAt`, `placeHatch`, `breakHatch`, `tryHatch`), `hatchCell()` em chunks.js, `solid()` em constants.js, tiles 52 e 53 em textures.js

## Porta estilo Minecraft (js/blocks/doors.js)
- A porta 2x3 agora é uma **porta dupla de folhas finas**: fechada, são duas folhas no meio da célula (parede/jambas visíveis ao redor); aberta (como no Minecraft Java, sem animação), cada folha gira 90° na dobradiça externa e fica ao lado do vão. O vão fica livre, dá para ver e passar por ele
- Ao abrir, as folhas vão para o lado oposto ao jogador; se esse lado estiver bloqueado, tenta o outro; se os dois estiverem, avisa "Sem espaço para abrir a porta". O lado fica salvo (`s` em `doors`)
- Blocos 20 (fechada, sólida) e 21 (aberta, sem colisão) continuam os mesmos, então saves antigos funcionam. A malha vem de `doorCell()` (chamada em chunks.js); `ray()` atravessa a porta aberta e só "toca" nas folhas (`doorLeafHit`)
- Tiles 54 (trecho de baixo/de cima) e 55 (meio, com puxador) em textures.js. Depois de restaurar o save, `restoreState` refaz as malhas das portas

## Multijogador (js/net/multiplayer.js, js/net/config.js, css/panels/net.css)
- Salas por código via Supabase Realtime (só "broadcast", sem tabelas). Guia: `PUBLICAR-E-JOGAR-ONLINE.md`
- Anfitrião cria a sala; quem entra recarrega com `?sala=CÓDIGO&seed=N` (terrain.js lê a seed da URL; load-world.js ignora o save local nesse modo), recebe o mundo compactado (RLE em pedaços) e depois todos trocam: blocos (fila em lote, `buildAt`/`rebuildCells` são "ganchados"), portas (`doors` com `cells` e `s`), posição (bonecos) e hora do dia. `netTick(dt,now)` roda todo quadro em loop.js
- Mensagens (evento único `m`, campo `t`): `hello`, `welcome`, `snap`, `blk`, `ps`, `bye`, `tm`. Água não é enviada. Animais, peixes, baús e fornos não são sincronizados
- Perfil do jogador: nome (até 14 letras) e cor da camisa (10 opções) no painel 🌐 Online; salvo em `localStorage` (`miniblocos_perfil`) e enviado em cada mensagem `ps` (`n`, `c`). Quem recebe recria o boneco se o outro mudar nome ou cor (`netPeer`)
- Boneco: a mensagem `ps` agora leva também `p` (pitch do olhar) e `h` (id do bloco selecionado na barra). O boneco inclina a cabeça (pivô no pescoço) e, se o outro está com um bloco selecionado, levanta o braço direito e mostra um cubinho dessa cor na mão (`netSetItem`). Se o outro está com uma ferramenta (`k` = índice em `TOOLS`, 1 a 15), aparece um modelo simples dela na mão (`netToolModel`, criado só quando usado) no lugar do cubinho

## Cerca (js/blocks/fence.js)
- Item e bloco **60** (receita na bancada: 2 tábuas = 3 cercas; o jogo começa com 16). Poste de 1,5 bloco de altura e duas travessas que se ligam sozinhas às cercas e aos blocos maciços vizinhos (a malha é refeita pelo `buildAt` no chunk e nos vizinhos da borda)
- Colisão: `solid()` em constants.js trata a célula da cerca **e a de cima** como sólidas, então não dá para subir andando nela (o pulo ainda passa por cima). Animais também ficam presos
- Visual em `fenceCell()` (chamada em chunks.js), ícone em `drawFenceIcon()`, textura = a da tábua (`TMAP[6]`). Sincroniza no multijogador como qualquer bloco

## Portão (js/blocks/fence.js)
- Item **61** (receita: 3 tábuas; começa com 2). No mundo: 62/63 fechado (largura em x/z), 64-67 aberto (largura x ou z, folha para um dos lados). O estado vive no id do bloco, então salva e sincroniza no multijogador sem registro extra
- Fechado: sólido como a cerca (2 blocos de colisão, serve para prender animais). Aberto: sem colisão; a folha gira 90° no poste e o raio atravessa o vão (`gateHitAt` só "toca" nos postes e na folha). Abre para o lado oposto ao jogador; se estiver ocupado tenta o outro; se os dois estiverem, "Sem espaço para abrir o portão"
- As cercas vizinhas ligam as travessas ao portão quando ele está alinhado com elas. Ganchos: `placeGate`/`tryGate`/`breakGate` (interaction.js), `gateCell` (chunks.js), `solid()` (constants.js)

## Cavalo e vaca redesenhados (js/entities/animals.js)
- **Cavalo** ~25% menor (cernelha de 1,08 m em vez de 1,43 m; colisão `r`/`hh` ajustadas) e com outra forma: peito e garupa arredondados, pescoço inclinado com crina, cabeça alongada (crânio, mandíbula, focinho, narinas, orelhas, franja, listra opcional), pernas com coxa/joelho, casco escuro, meias e manchas opcionais e cauda em três tufos. As cores das variações continuam as mesmas chaves (`#8a5a36` corpo, `#6a4326` pernas, `#2e1f14` crina). O ângulo-base do pescoço vem de `userData.nth` (usado na animação de pastar em `updA`)
- **Vaca**: cabeça nova (focinho rosado, faixa branca, narinas, olhos, orelhas e chifres), pescoço grosso fixo, cernelha, barriga mais escura, úbere com tetas, pernas com coxa e joelho; a vaca marrom também fica com pernas marrons (`cowDetail`)
- Pernas do cavalo (largura 0,085 m) e da vaca (0,11 m) afinadas, com só um leve engrossamento no alto (sem blocos largos de coxa/antebraço)

## Animais: colisão e destravamento (js/entities/animals.js)
- **Preso dentro de bloco:** `unstick()` roda quando o animal está dentro de um bloco (alguém colocou bloco, fechou porta/portão ou o terreno mudou). Tenta subir até 2,5 blocos, depois sair para o lado (anéis de 0,5 a 4 blocos) e por último subir mais; se não houver saída por 2 s, o animal some e renasce em outro lugar
- **Atravessar bloco:** queda/subida e andar agora são feitos em passos de no máximo 0,4 e 0,3 bloco (antes só se testava a posição final, então quadro lento deixava atravessar piso fino). Rampas e escadas (ids 26-33) valem como bloco cheio para os animais (`aSlope`); antes eram vazias para eles e eles passavam por dentro

## Sela e montaria (js/entities/ride.js)
- Item **68 (Sela)**: receita na bancada = 3 lã + 2 tábuas (o jogo começa com 1). **Selecione a sela e toque/clique num cavalo** para selá-lo (a sela não se gasta). Cavalo selado: toque nele de **mão vazia** (ferramenta Mão) ou com a sela na mão para **montar**. Com arma na mão o toque ataca como antes
- Montado: `rideTick()` (chamado no lugar da física do jogador em loop.js) lê o mesmo direcional/WASD e entrega ao cavalo (`a.rideIn`); `updA` faz o cavalo andar a `RIDE_V` = 11 blocos/s (a pé são ~7,5), virar mais rápido e pular com Espaço/botão de pulo (~1,4 bloco); `rideSync()` leva o jogador junto, na altura da sela, sem dano de queda. Colisão do cavalo montado usa altura `RIDE_HH` = 3,9 blocos (não monta nem passa onde não cabe)
- Descer: botão **⬇ Descer** (celular) ou **Shift** (teclado). O jogador desce pelo lado, depois atrás, depois pela frente. Se o cavalo sumir ou morrer, o jogador desce sozinho
- Multijogador: a mensagem `ps` leva `rd` (montado) e `hr` (direção do cavalo); os outros veem o cavaleiro sentado num cavalo "fantasma" selado (só visual: os animais não são sincronizados). O cavalo só guarda a sela enquanto o jogo está aberto (animais não são salvos)
