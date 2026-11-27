# Publicar o MiniBlocos e jogar online com um amigo

São 3 passos, todos grátis: **(1) Supabase** (liga os dois jogadores), **(2) publicar o jogo** num link e **(3) criar a sala**.

## 1) Supabase (só uma vez)
1. Crie uma conta em supabase.com e um projeto novo (nome e senha quaisquer, região mais próxima de você).
2. Com o projeto aberto: **Project Settings → API** (ou "API Keys"). Copie:
   - **Project URL** (algo como `https://abcdxyz.supabase.co`)
   - a chave **anon public** (começa com `eyJ...`)
3. Abra `js/net/config.js` e cole os dois valores no lugar de `COLE_AQUI_...`:
   ```js
   const NETCFG={url:'https://abcdxyz.supabase.co',key:'eyJ...'};
   ```
4. Se existir em **Project Settings → Realtime** a opção **Allow public access**, deixe **ligada**.
   Não precisa criar tabela nenhuma; o jogo usa só o canal de mensagens (Realtime "broadcast").

> A chave `anon` é pública por natureza, pode ficar no repositório. **Nunca** coloque a chave `service_role`.

## 2) Publicar o jogo (GitHub Pages)
1. Em github.com crie um repositório **público** (ex.: `miniblocos`).
2. Envie **todo o conteúdo da pasta** `MiniBlocos` (o `index.html` precisa ficar na raiz do repositório): **Add file → Upload files**.
   O GitHub aceita até 99 arquivos por vez e por pasta; o projeto tem ~80, então cabe de uma vez.
3. **Settings → Pages**: em *Branch* escolha `main` e `/ (root)` → **Save**.
4. Em 1 a 2 minutos o jogo fica em `https://SEU-USUARIO.github.io/miniblocos/`.
   (Alternativa: Cloudflare Pages, conectando o mesmo repositório; não precisa de comando de build.)

Quando mudar um arquivo depois, é só enviar de novo para o GitHub; o link continua o mesmo. Se o jogo parecer "antigo", atualize a página com o cache limpo.

## 3) Jogar junto
**Quem cria a sala (anfitrião)**
1. Abra o link do jogo → botão **🌐 Jogar online** na tela inicial (ou **🌐 Online** dentro do inventário).
2. **Criar sala** → aparece o código (ex.: `K7QX2`) e o botão **Copiar link para o amigo**.
3. Mande o link pelo WhatsApp e **deixe o jogo aberto**: é do celular do anfitrião que o amigo recebe o mundo.

**Quem entra**
- Abre o link que recebeu (entra sozinho na sala), **ou** abre o jogo, toca em **🌐 Jogar online**, digita o código e toca em **Entrar**. A página recarrega uma vez com o mundo da sala; leva alguns segundos baixando.

## Como funciona
- O mundo é o do anfitrião, e o **save dele** continua sendo gravado no celular dele (com as construções dos dois).
- Cada um tem o **próprio inventário**. O mundo local de quem entra **não é lido nem gravado** enquanto estiver na sala; ao tocar em **Sair da sala** ele volta ao mundo salvo.
- Sincronizados: blocos colocados/quebrados (inclusive alçapões e portas), fogueiras/lâmpadas, posição, olhar (cabeça para cima/baixo), bloco ou ferramenta na mão, nome e cor da camisa de cada jogador (aparecem como bonecos; você escolhe os seus no painel 🌐 Online, antes ou durante a sala), hora do dia.
- **Não** sincronizados nesta versão: animais e peixes (cada um vê os seus), conteúdo de baús, fornos e água corrente.
- Se o anfitrião fechar o jogo, quem já está dentro continua vendo as alterações uns dos outros, mas ninguém novo consegue entrar até ele voltar.

## Problemas comuns
- **Mensagem "⚠️ A URL/chave do Supabase em config.js está errada"**: o jogo confere o `config.js` e diz o que está errado. A URL é só `https://SEU-PROJETO.supabase.co` (sem barra no fim e sem `/rest/v1`); a chave é a **anon public** inteira, numa linha só, sem espaço. Depois de corrigir, envie o arquivo ao GitHub e atualize a página.
- **"Falta configurar o Supabase"**: faltou colar a URL e a chave em `js/net/config.js` (e enviar o arquivo atualizado ao GitHub).
- **"Falha na conexão"**: URL ou chave erradas, ou sem internet.
- **"Não achei a sala"**: código errado, ou o anfitrião não está com o jogo aberto na sala.
- Limites do plano grátis do Supabase são bem maiores do que dois amigos jogando precisam.
