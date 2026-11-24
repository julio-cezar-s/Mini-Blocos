/* MiniBlocos · Cores dos tipos de bloco (T, col) e lista inicial da hotbar */
// tipos: cores [topo, lado, base]
const T={1:['#5fae3c','#7a6a3a','#6b4a2a'],2:['#7b5130','#7b5130','#7b5130'],3:['#8a8a8a','#808080','#777'],
4:['#a07a3c','#6e4f26','#a07a3c'],5:['#2f8a2f','#2f8a2f','#2f8a2f'],6:['#c9a05a','#c9a05a','#c9a05a'],7:['#e4d58f','#e4d58f','#e4d58f']};
const names=[1,2,3,4,6,7];
T[8]=['#3a78c8','#3a78c8','#3a78c8'];
T[9]=['#f4f8fb','#e6edf2','#d6dee4'];T[10]=['#454545','#4a4a4a','#3a3a3a'];T[11]=['#c8a98a','#c0a182','#b09372'];T[12]=['#e8c93a','#dcbd30','#c8aa28'];T[13]=['#2f7a2f','#3b8f3b','#2f7a2f'];T[14]=['#ff7a1a','#4a3a2a','#3a2a1c'];T[15]=['#ffe27a','#d9b24a','#d9b24a'];T[16]=['#b02a2e','#a06a3a','#a06a3a'];T[17]=['#cfe8f5','#cfe8f5','#cfe8f5'];T[18]=['#966630','#966630','#966630'];T[19]=['#c4572f','#b04a28','#a24424'];T[20]=['#9e703a','#8a5a2c','#8a5a2c'];T[21]=['#9e703a','#8a5a2c','#8a5a2c'];T[22]=['#ac7e46','#96866a','#96866a'];T[23]=['#8a8a8a','#808080','#707070'];
// blocos novos (34 a 50): cascalho, argila, tijolo, pedra lapidada, pedra musgosa, piso xadrez, abóbora, feno, lã, terracotas, minério de diamante e blocos de metal
T[34]=['#8a8886','#8a8886','#8a8886'];T[35]=['#9aa2b4','#9aa2b4','#9aa2b4'];T[36]=['#963e30','#963e30','#963e30'];T[37]=['#808080','#808080','#808080'];T[38]=['#6a8a5a','#6a8a5a','#6a8a5a'];T[39]=['#b8b8ba','#b8b8ba','#b8b8ba'];
T[40]=['#e07a1a','#e07a1a','#e07a1a'];T[41]=['#dcbc50','#dcbc50','#dcbc50'];T[42]=['#ececee','#ececee','#ececee'];T[43]=['#dcac3e','#dcac3e','#dcac3e'];T[44]=['#7a726e','#7a726e','#7a726e'];T[45]=['#cc7034','#cc7034','#cc7034'];
T[46]=['#60e0e8','#60e0e8','#60e0e8'];T[47]=['#d6d6dc','#d6d6dc','#d6d6dc'];T[48]=['#fad43a','#fad43a','#fad43a'];T[49]=['#242428','#242428','#242428'];T[50]=['#64e2e8','#64e2e8','#64e2e8'];
// alçapão: 51 = item; 52-55 fechado, 56-59 aberto (ver js/blocks/hatch.js)
for(let k=51;k<=67;k++)T[k]=['#9a6a34','#7a5226','#7a5226'];
const col={};for(const k in T)col[k]=T[k].map(c=>new THREE.Color(c));
