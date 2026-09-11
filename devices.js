import * as THREE from 'three';
import {world} from './layout.js';
import {createScreenContent} from './screen-content.js';

// User-confirmed product references; dimensions are visual reconstructions, not manufacturer CAD.
export const DEVICE_CATALOG={
 s2:{name:'S2 POS',reference:'pisell 硬件/Genstar S2.png',dimensions:[.39,.40,.28],validation:'needs-review'},
 g2:{name:'G2 桌面 kiosk',reference:'pisell 硬件/设备正面应用UI (1).png',dimensions:[.31,.60,.29],validation:'needs-review'},
 floor:{name:'落地 kiosk',reference:'pisell 硬件/图层 1.png',dimensions:[.53,1.77,.52],validation:'needs-review'}
};
export const DEVICE_PLACEMENTS=[
 {id:'ticket-s2',type:'s2',at:[273,668],base:1,rotation:Math.PI/2,menu:'ticket'},
 {id:'ticket-g2',type:'g2',at:[347,580],base:1,rotation:-Math.PI/2,menu:'ticket'},
 {id:'cafe-s2',type:'s2',at:[195,465],base:1,rotation:-Math.PI/2,menu:'food'},
 {id:'cafe-g2',type:'g2',at:[143,506],base:1,rotation:0,menu:'food'},
 {id:'game-floor',type:'floor',at:[422,298],base:0,rotation:-.18,menu:'ticket'},
 {id:'gate-floor-1',type:'floor',at:[628,482],base:0,rotation:-Math.PI/2,menu:'ticket'},
 {id:'gate-floor-2',type:'floor',at:[628,595],base:0,rotation:-Math.PI/2,menu:'ticket'}
];
export const DEVICE_ZONE_COPY={
 ticket:'在原有售票吧台上，用一台 S2 POS 演示员工售票，用一台 G2 桌面自助机体验自助购票。员工与顾客分处吧台两侧。',
 cafe:'咖啡吧台配一台 S2 POS 和一台 G2 桌面自助机，展示人工点单、自助买餐与现场取餐的衔接。',
 gaming:'娃娃机旁设置一台落地自助机，让参观者体验游戏卡储值，再进入游戏场景。',
 gates:'闸机旁保留两台落地自助机，展示自助操作与入园核验的现场配合。'
};

export function installDevices({architecture,solids,box,cylinder,planeTexture,canvasTexture,materials}){
 const localizedScreens=createScreenContent(canvasTexture);
 const {white,black,metal,dark}=materials;
 const graphite=new THREE.MeshStandardMaterial({color:0x24252c,metalness:.52,roughness:.32});
 const orange=new THREE.MeshBasicMaterial({color:0xf24e20,toneMapped:false});
 const logo=canvasTexture(512,256,(c,w,h)=>{c.fillStyle='#fafbfc';c.fillRect(0,0,w,h);c.fillStyle='#ef4d20';c.beginPath();c.arc(93,128,67,0,7);c.fill();c.fillStyle='#fff';c.font='italic bold 102px Segoe UI';c.fillText('P',53,164);c.fillStyle='#ef4d20';c.font='bold 72px Segoe UI';c.fillText('PISELL',180,157);});
 const scanner=canvasTexture(128,128,(c)=>{c.fillStyle='#0c1015';c.fillRect(0,0,128,128);c.strokeStyle='#d6e4ec';c.lineWidth=4;for(let i=0;i<3;i++){c.beginPath();c.arc(64,64,12+i*13,-.75,.75);c.stroke();c.beginPath();c.arc(64,64,12+i*13,Math.PI-.75,Math.PI+.75);c.stroke();}c.fillStyle='#d6e4ec';c.fillRect(61,57,6,14);});
 const cameraTexture=canvasTexture(64,64,c=>{c.fillStyle='#e9ebeb';c.fillRect(0,0,64,64);c.fillStyle='#111820';c.beginPath();c.arc(32,32,13,0,7);c.fill();c.fillStyle='#3f667b';c.beginPath();c.arc(29,28,5,0,7);c.fill();});
 function screen(parent,w,h,x,y,z,tilt,ui,body=graphite,back=false){const group=new THREE.Group();group.position.set(x,y,z);group.rotation.x=tilt;parent.add(group);box(w,h,.032,0,0,0,body,group);box(w-.012,h-.012,.007,0,0,.018,black,group);planeTexture(localizedScreens.texture(ui,1200,Math.round(1200*(h-.038)/(w-.037))),w-.037,h-.038,new THREE.Vector3(0,0,.023),0,group);if(back)planeTexture(logo,w*.40,h*.20,new THREE.Vector3(0,h*.2,-.018),Math.PI,group);return group;}
 // Extruded side profile preserves the characteristic sloping housing rather than a pole stand.
 function profile(parent,width,points,m){const s=new THREE.Shape();points.forEach(([z,y],i)=>i?s.lineTo(z,y):s.moveTo(z,y));s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth:width,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.004,bevelThickness:.004});geo.rotateY(-Math.PI/2);geo.translate(width/2,0,0);const mesh=new THREE.Mesh(geo,m);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
 function badge(parent,w,h,x,y,z){planeTexture(logo,w,h,new THREE.Vector3(x,y,z),0,parent);}
 function modules(parent,scale,y,z){const w=.12*scale;box(w,.15*scale,.02*scale,-.079*scale,y,z,black,parent);box(w*.82,.008*scale,.005,-.079*scale,y+.042*scale,z+.012*scale,metal,parent);box(w*.93,.004*scale,.004,-.079*scale,y-.065*scale,z+.012*scale,graphite,parent);box(w,.15*scale,.02*scale,.075*scale,y,z,black,parent);planeTexture(scanner,w*.78,w*.70,new THREE.Vector3(.075*scale,y+.027*scale,z+.013*scale),0,parent);box(w*.62,.040*scale,.006,.075*scale,y-.04*scale,z+.014*scale,white,parent);box(w*.42,.018*scale,.004,.075*scale,y-.036*scale,z+.018*scale,black,parent);}
 function s2(g,ui){
  box(.39,.016,.28,0,.011,0,graphite,g);box(.385,.004,.275,0,.019,0,metal,g);
  profile(g,.21,[[-.10,.024],[.09,.024],[.005,.30],[-.033,.30]],graphite);
  screen(g,.38,.245,0,.276,-.018,-.15,ui,graphite,true);
  const customer=new THREE.Group();customer.position.set(0,.025,-.055);customer.rotation.y=Math.PI;g.add(customer);
  profile(customer,.23,[[-.014,0],[.09,0],[-.013,.205],[-.049,.205]],graphite);
  screen(customer,.235,.173,0,.145,.032,-.28,'advert',graphite);
  planeTexture(cameraTexture,.028,.028,new THREE.Vector3(.083,.20,.065),0,customer);
  box(.075,.015,.012,0,.026,.118,black,g);
  for(let i=0;i<9;i++)box(.013,.004,.005,-.066+i*.016,.149,.064,black,g);
  const power=cylinder(.006,.006,.004,.085,.10,.094,metal,g,16);power.rotation.x=Math.PI/2;
 }
 function g2(g,ui){
  box(.31,.013,.29,0,.01,0,white,g);
  profile(g,.267,[[-.126,.019],[.116,.019],[.089,.192],[-.037,.572],[-.094,.57]],white);
  modules(g,.86,.123,.12);
  screen(g,.271,.38,0,.392,.007,-.18,ui,white);
  // The small reverse-facing service screen visible in the product photograph.
  const rear=new THREE.Group();rear.position.set(0,.34,-.12);rear.rotation.y=Math.PI;g.add(rear);screen(rear,.218,.136,0,0,.019,-.25,ui,white);
  for(let row=0;row<5;row++)for(let col=0;col<3;col++)box(.004,.007,.007,.137,.22+row*.018,-.025+col*.022,graphite,g);
  const power=cylinder(.008,.008,.003,.139,.034,.069,orange,g,16);power.rotation.z=Math.PI/2;
  badge(g,.073,.027,0,.216,.068);
 }
 function floor(g,ui){
  box(.53,.025,.52,0,.023,0,white,g);
  profile(g,.37,[[-.19,.037],[.17,.037],[.066,.78],[.12,.92],[-.016,1.73],[-.11,1.755]],white);
  profile(g,.345,[[-.195,.06],[-.145,.78],[-.055,.91],[-.139,1.69],[-.20,1.0]],dark);
  screen(g,.352,.747,0,1.342,.058,-.165,ui,white);
  // Carry handle, printer/scanner panel and lower service flap match the approved floor unit.
  box(.135,.032,.024,0,1.741,-.034,black,g);
  modules(g,1.1,.835,.111);
  box(.274,.127,.009,0,.60,.099,white,g);
  box(.194,.016,.012,0,.60,.107,black,g);
  badge(g,.112,.034,0,.714,.097);
  for(let i=0;i<7;i++)box(.24,.004,.012,0,.29+i*.016,-.191,black,g);
 }
 const builders={s2,g2,floor},instances=[];
 for(const placement of DEVICE_PLACEMENTS){const g=new THREE.Group();g.name=placement.id;g.userData.product=placement.type;g.position.set(...world(placement.at,placement.base));g.rotation.y=placement.rotation;architecture.add(g);builders[placement.type](g,placement.id==='game-floor'?'topup':placement.menu==='food'?'food':'ticketOrder');instances.push(g);if(placement.type==='floor')solids.push({type:'circle',p:placement.at,r:.4});}
 instances.setCountry=localizedScreens.setCountry;
 return instances;
}
