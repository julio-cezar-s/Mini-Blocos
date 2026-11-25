/* MiniBlocos · Ícones 3D dos blocos (cube) desenhados a partir do atlas */
const sh=(hex,f)=>{const c=new THREE.Color(hex);c.multiplyScalar(f);return '#'+c.getHexString();};
const cCache={};
const cubeSrc=t=>{if(!cCache[t]){const cv=document.createElement('canvas');cv.width=cv.height=48;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;const k=2;if(t===68){drawSaddleIcon(g);cCache[t]=cv.toDataURL();return cCache[t];}if(t===61){drawGateIcon(g);cCache[t]=cv.toDataURL();return cCache[t];}if(t===60){drawFenceIcon(g);cCache[t]=cv.toDataURL();return cCache[t];}if(t===51){drawHatchIcon(g);cCache[t]=cv.toDataURL();return cCache[t];}if(t===24||t===25){drawSlopeIcon(g,t);cCache[t]=cv.toDataURL();return cCache[t];}
  const face=(tile,m,poly,sh2)=>{g.save();g.beginPath();poly.forEach((p,i)=>i?g.lineTo(p[0]*k,p[1]*k):g.moveTo(p[0]*k,p[1]*k));g.closePath();g.clip();
    g.setTransform(m[0]*k/16,m[1]*k/16,m[2]*k/16,m[3]*k/16,m[4]*k,m[5]*k);g.drawImage(atlas.image,(tile%6)*16,Math.floor(tile/6)*16,16,16,0,0,16,16);g.restore();
    if(sh2){g.save();g.beginPath();poly.forEach((p,i)=>i?g.lineTo(p[0]*k,p[1]*k):g.moveTo(p[0]*k,p[1]*k));g.closePath();g.fillStyle='rgba(0,0,0,'+sh2+')';g.fill();g.restore();}};
  face(TILE(t,1),[10,5.5,0,10,2,7.5],[[2,7.5],[12,13],[12,23],[2,17.5]],.28);
  face(TILE(t,1),[10,-5.5,0,10,12,13],[[22,7.5],[12,13],[12,23],[22,17.5]],.5);
  face(TILE(t,0),[10,5.5,-10,5.5,12,2],[[12,2],[22,7.5],[12,13],[2,7.5]],0);
  cCache[t]=cv.toDataURL();}
  return cCache[t];};
const cube=t=>'<img src="'+cubeSrc(t)+'">';
