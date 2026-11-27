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

// 6) troca o carregador (último <script> do index.html) por 1 CSS + three.js + 1 JS
const start=html.lastIndexOf('<script>'),end=html.indexOf('</script>',start)+9;
if(start<0||!html.slice(start,end).includes('Carregador'))fail('Não achei o bloco "Carregador" no fim do index.html.');
const tags='<script src="'+threeSrc+'"></script>\n'+
  '<script>if(!window.THREE){document.body.insertAdjacentHTML("beforeend","<div style=\\"position:fixed;inset:0;z-index:99;background:#12202b;color:#fff;font:16px/1.5 sans-serif;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px\\"><div><h2>Não foi possível carregar o three.js</h2><p>Conecte-se à internet e recarregue a página.</p></div></div>");}</script>\n'+
  '<script src="'+jsName+'"></script>\n';
let out=html.slice(0,start)+tags+html.slice(end);
out=out.replace('</head>','<link rel="stylesheet" href="'+cssName+'">\n</head>');
fs.writeFileSync('dist/index.html',out);

const kb=f=>(fs.statSync('dist/'+f).size/1024).toFixed(0)+' KB';
console.log('✅ Jogo montado em dist/');
console.log('   '+JS.length+' arquivos JS → '+jsName+' ('+kb(jsName)+')');
console.log('   '+CSS.length+' arquivos CSS → '+cssName+' ('+kb(cssName)+')');
console.log('   three.js: '+(localThree?'local (lib/three.min.js)':'CDN'));
