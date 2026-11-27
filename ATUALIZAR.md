# Como atualizar o jogo (GitHub + montagem automática)

## Configurar uma vez só
1. No GitHub, abra o repositório do jogo → **Settings → Pages**.
2. Em **Build and deployment → Source**, escolha **GitHub Actions**.
3. Envie para o repositório os arquivos novos deste zip, mantendo as pastas:
   `build.mjs`, `package.json`, `.gitignore` e `.github/workflows/pages.yml`.
   (Se o navegador não deixar enviar a pasta `.github`, use **Add file → Create new file**, digite
   `.github/workflows/pages.yml` como nome e cole o conteúdo do arquivo.)

## Toda atualização
1. Descompacte o zip que eu mandar e envie os arquivos para o repositório (**Add file → Upload files**), como já faz.
2. Clique em **Commit changes**.
3. Abra a aba **Actions**: aparece "Publicar MiniBlocos" rodando (cerca de 1 minuto).
   - ✅ verde = jogo publicado, é só abrir o link do Pages e testar (se não atualizar, recarregue sem cache).
   - ❌ vermelho = abra a execução e leia o erro. O jogo antigo continua no ar, nada quebra.

## Editar direto no GitHub (celular ou notebook)
Abra o arquivo no repositório → ícone de lápis → edite → **Commit changes**. A montagem roda sozinha.

## Regras importantes
- Arquivo novo de JS ou CSS: coloque o caminho dele nas listas `CSS=[...]` / `JS=[...]` do `index.html` (a ordem importa).
  Se esquecer, a montagem avisa em vermelho com o nome do arquivo.
- Não apague as listas nem o bloco "Carregador" do `index.html`: a montagem lê as listas dali.
- Para testar no notebook antes de enviar (opcional, precisa do Node.js): `node build.mjs` e depois `npx serve dist`.
