/* MiniBlocos · Itens: keys, hotbar atual, ALL, nomes e quantidades (inv) */
// entrada
const keys={};let cur=0;
const ALL=[1,2,3,4,5,6,7,9,10,11,12,13,14,15,16,17,18,19,20,22,23,24,25,51,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,60,61,68];
const nm={1:'Grama',2:'Terra',3:'Pedra',4:'Madeira',5:'Folhas',6:'Tábua',7:'Areia',9:'Neve',10:'Carvão',11:'Ferro',12:'Ouro',13:'Cacto',14:'Fogueira',15:'Lampião',16:'Cama',17:'Vidro',18:'Baú',19:'Telha',20:'Porta',22:'Bancada',23:'Forno',24:'Rampa',25:'Escada',51:'Alçapão',34:'Cascalho',35:'Argila',36:'Tijolo',37:'Pedra lapidada',38:'Pedra musgosa',39:'Piso xadrez',40:'Abóbora',41:'Feno',42:'Lã',43:'Terracota amarela',44:'Terracota cinza',45:'Terracota laranja',46:'Min. diamante',47:'Bloco de ferro',48:'Bloco de ouro',49:'Bloco de carvão',50:'Bloco de diamante',60:'Cerca',61:'Portão',68:'Sela'};
const inv={};ALL.forEach(t=>inv[t]=({14:2,15:6,16:1,17:16,18:2,20:2,22:1,23:1,24:8,25:8,51:2,60:16,61:2,68:1})[t]??((t===5||(t>=10&&t<=12)||t>=34)?0:16));
