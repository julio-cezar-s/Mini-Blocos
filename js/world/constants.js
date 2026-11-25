/* MiniBlocos · Dimensões do mundo, array de blocos B e helpers get/solid */
const W=160,D=160,H=36;   // tamanho do mundo (múltiplos de 16). Era 96x96
const AF=W*D/9216,AA=Math.min(AF,1.5);   // AF: fator de área vs. o mundo antigo (minérios); AA: versão limitada para animais
const B=new Uint8Array(W*D*H);
const idx=(x,y,z)=>x+z*W+y*W*D;
const get=(x,y,z)=>(x<0||z<0||y<0||x>=W||z>=D||y>=H)?0:B[idx(x,y,z)];
const solid=(x,y,z)=>(x<0||z<0||x>=W||z>=D||y<0)?true:(y>=H?false:(B[idx(x,y,z)]>0&&B[idx(x,y,z)]!==8&&B[idx(x,y,z)]!==21&&(B[idx(x,y,z)]<26||B[idx(x,y,z)]>33)&&(B[idx(x,y,z)]<56||B[idx(x,y,z)]>59)&&(B[idx(x,y,z)]<64||B[idx(x,y,z)]>67)||(y>0&&(B[idx(x,y-1,z)]===60||B[idx(x,y-1,z)]===62||B[idx(x,y-1,z)]===63))));
