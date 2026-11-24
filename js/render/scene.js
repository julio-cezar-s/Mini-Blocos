/* MiniBlocos · Renderer, cena, câmera e resize */
// three
const cv=document.getElementById('c');
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:false});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene();scene.background=new THREE.Color('#87ceeb');scene.fog=new THREE.Fog('#87ceeb',35,100);
const camera=new THREE.PerspectiveCamera(75,1,.05,160);camera.rotation.order='YXZ';
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
