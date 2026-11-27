// MiniBlocos · Montagem do jogo para publicar (sem dependências: só precisa do Node.js 18+)
// Lê as listas CSS=[...] e JS=[...] do index.html (a ordem importa), junta tudo em 1 arquivo de CSS e 1 de JS
// e escreve a pasta dist/ (é ela que vai para o GitHub Pages). O seu código-fonte não muda.
// Uso:  node build.mjs      (o GitHub Actions faz isso sozinho a cada envio)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';

const fail=m=>{console.error('\n❌ '+m+'\n');process.exit(1);};
const read=f=>{try{return fs.readFileSync(f,'utf8');}catch(e){fail('Arquivo não encontrado: '+f+'\n   (ele está na lista do index.html, mas não existe na pasta)');}};
const hash=s=>crypto.createHash('sha1').update(s).digest('hex').slice(0,8);

// 1) lê as listas do index.html
const html=read('index.html');
const m=html.match(/var CSS=\[([\s\S]*?)\],JS=\[([\s\S]*?)\];/);
if(!m)fail('Não achei as listas "var CSS=[...],JS=[...]" no index.html. Elas não podem ser apagadas.');
const list=s=>(s.match(/'([^']+)'/g)||[]).map(x=>x.slice(1,-1));
const CSS=list(m[1]),JS=list(m[2]);

// 2) confere se algum arquivo .js/.css da pasta ficou fora da lista (esquecer de registrar é o erro mais comum)
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name).split(path.sep).join('/')]);
const onDisk=[...walk('js'),...walk('css')].filter(f=>/\.(js|css)$/.test(f));
const listed=new Set([...CSS,...JS]);
const dup=[...listed].length!==CSS.length+JS.length;if(dup)fail('Há um arquivo repetido nas listas do index.html.');
const missing=onDisk.filter(f=>!listed.has(f));
if(missing.length)fail('Estes arquivos existem mas NÃO estão nas listas do index.html (o jogo não os carregaria):\n   - '+missing.join('\n   - ')+'\n   Adicione o caminho de cada um na lista certa (a ordem importa).');

// 3) junta CSS e JS
const css=CSS.map(f=>'/* ===== '+f+' ===== */\n'+read(f)).join('\n');
const js=JS.map(f=>'/* ===== '+f+' ===== */\n'+read(f)+'\n;\n').join('\n');

// 4) confere se o JS junto é válido (erro de sintaxe ou nome repetido aparece aqui, antes de publicar)
try{new vm.Script(js,{filename:'game.js'});}
catch(e){
  const line=(e.stack.match(/game\.js:(\d+)/)||[])[1];let where='';
  if(line){const ls=js.split('\n');let f='?',base=0;for(let i=0;i<Math.min(+line,ls.length);i++){const mm=ls[i].match(/^\/\* ===== (.+) ===== \*\/$/);if(mm){f=mm[1];base=i;}}where='\n   Arquivo provável: '+f+' (linha '+(+line-base-1)+' dele)';}
  fail('Erro no JavaScript: '+e.message+where);
}

// 5) escreve dist/
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist');
const cssName='game.'+hash(css)+'.css',jsName='game.'+hash(js)+'.js';
fs.writeFileSync('dist/'+cssName,css);fs.writeFileSync('dist/'+jsName,js);
const localThree=fs.existsSync('lib/three.min.js');
if(fs.existsSync('lib'))fs.cpSync('lib','dist/lib',{recursive:true});
const THREE_CDN='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const threeSrc=localThree?'lib/three.min.js':THREE_CDN;
const threeSize=localThree?fs.statSync('lib/three.min.js').size:610000;   // tamanho aproximado do CDN (só para a barra)
const jsSize=Buffer.byteLength(js);

// 6) troca o carregador (último <script> do index.html) por um carregador com barra de progresso:
//    baixa three.js e o jogo (mostrando o progresso real), executa e só libera o jogo depois da verificação (__ldr.finish)
const start=html.lastIndexOf('<script>'),end=html.indexOf('</script>',start)+9;
if(start<0||!html.slice(start,end).includes('Carregador'))fail('Não achei o bloco "Carregador" no fim do index.html.');
const loader=`(function(){
var L=window.__ldr,FILES=[{u:${JSON.stringify(threeSrc)},n:${threeSize},a:0,b:.35,t:'a biblioteca 3D'},{u:${JSON.stringify(jsName)},n:${jsSize},a:.35,b:.85,t:'o jogo'}];
function wait(ms){return new Promise(function(r){setTimeout(r,ms);});}
function dl(f,k){k=k||0;
  return fetch(f.u).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);
    if(!r.body||!r.body.getReader)return r.text();
    var rd=r.body.getReader(),dec=new TextDecoder(),txt='',got=0;
    return(function pump(){return rd.read().then(function(x){
      if(x.done)return txt+dec.decode();
      got+=x.value.length;txt+=dec.decode(x.value,{stream:true});
      var p=Math.min(.98,got/f.n);L.set(f.a+(f.b-f.a)*p,'Baixando '+f.t+'… '+Math.floor(p*100)+'%');return pump();});})();})
   .catch(function(e){if(k>=3)throw e;L.set(f.a,'Conexão instável, tentando de novo ('+(k+1)+'/3)…');return wait(600*(k+1)).then(function(){return dl(f,k+1);});});}
function run(code,name){var s=document.createElement('script');s.text=code+'\\n//# sourceURL='+name;document.head.appendChild(s);}
dl(FILES[0]).then(function(c){run(c,'three.min.js');L.set(FILES[0].b,'Baixando o jogo…');return dl(FILES[1]);}).then(function(c){
  L.set(.88,'Montando o mundo… (pode levar alguns segundos)');L.busy();
  return wait(80).then(function(){try{run(c,'game.js');}catch(e){L.fail('O jogo teve um erro ao iniciar ('+(e&&e.message||e)+'). Recarregue a página.',false);return;}L.finish();});
}).catch(function(e){L.fail('Não consegui baixar o jogo ('+(e&&e.message||e)+'). Verifique a internet e recarregue.',false);});
})();`;
const tags='<script>'+loader+'</script>\n';
let out=html.slice(0,start)+tags+html.slice(end);
out=out.replace('</head>','<link rel="stylesheet" href="'+cssName+'">\n</head>');
fs.writeFileSync('dist/index.html',out);

const kb=f=>(fs.statSync('dist/'+f).size/1024).toFixed(0)+' KB';
console.log('✅ Jogo montado em dist/');
console.log('   '+JS.length+' arquivos JS → '+jsName+' ('+kb(jsName)+')');
console.log('   '+CSS.length+' arquivos CSS → '+cssName+' ('+kb(cssName)+')');
console.log('   three.js: '+(localThree?'local (lib/three.min.js)':'CDN'));
