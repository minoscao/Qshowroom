import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {PLAN,world,ROUTES} from './layout.js';
import {materialKit,bevelBox,reflectiveFloor,silhouetteFactory,batchStatic,worldDisplay} from './visuals.js';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {installDevices} from './devices.js';
import {installExhibitDisplays} from './exhibit-displays.js';
import {getCountry} from './country-presets.js';

const V=(p,y=0)=>new THREE.Vector3(...world(p,y));
export function createShowroom(renderer){
 const scene=new THREE.Scene();scene.background=new THREE.Color('#101722');scene.fog=new THREE.FogExp2('#101722',.012);
 const pmrem=new THREE.PMREMGenerator(renderer),studio=new RoomEnvironment();scene.environment=pmrem.fromScene(studio,.04).texture;scene.environmentIntensity=.30;studio.dispose();pmrem.dispose();
 const architecture=new THREE.Group(),shell=new THREE.Group(),people=new THREE.Group(),lightGroup=new THREE.Group(),routes=new THREE.Group();scene.add(architecture,shell,people,lightGroup,routes);
 const solids=[],gateWings=[],doors=[],routeDots=[],pendants=[];const materials=materialKit();
 const mat=(name,color,roughness=.5,metalness=.1)=>materials[name]??=new THREE.MeshStandardMaterial({color,roughness,metalness});
 const {dark,metal,white,black,floor:floorMat,glass}=materials;
 const glow=new THREE.MeshStandardMaterial({color:0x030a1a,emissive:0x0044ff,emissiveIntensity:2.7,roughness:.3});
 const lights=[];
 function box(w,h,d,x,y,z,m=dark,parent=architecture){const a=new THREE.Mesh(m.transparent?new THREE.BoxGeometry(w,h,d):bevelBox(w,h,d),m);a.position.set(x,y,z);a.castShadow=!m.transparent&&w*h*d>.0003;a.receiveShadow=true;parent.add(a);return a;}
 function cylinder(r1,r2,h,x,y,z,m=metal,parent=architecture,segments=24){const a=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;parent.add(a);return a;}
 function sphere(r,x,y,z,m,parent=architecture){const a=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),m);a.position.set(x,y,z);a.castShadow=true;parent.add(a);return a;}
 function tube(points,r,m=glow,parent=lightGroup,closed=false){const curve=new THREE.CatmullRomCurve3(points,closed,'centripetal');const a=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.min(256,Math.max(16,points.length*3)),r,r>.03?16:6,closed),m);parent.add(a);return a;}
 function segment(a,b,y,h,depth,m=dark,parent=architecture){const p=V(a,y),q=V(b,y),c=p.clone().add(q).multiplyScalar(.5);const obj=box(p.distanceTo(q),h,depth,c.x,y,c.z,m,parent);obj.rotation.y=-Math.atan2(q.z-p.z,q.x-p.x);return obj;}
 function planarShape(coords){const s=new THREE.Shape();coords.forEach((p,i)=>{const [x,,z]=world(p);i?s.lineTo(x,-z):s.moveTo(x,-z);});s.closePath();return s;}
 function extrude(shape,height,base,m,parent=architecture){const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:48});geo.rotateX(-Math.PI/2);const mesh=new THREE.Mesh(geo,m);mesh.position.y=base;mesh.receiveShadow=true;mesh.castShadow=true;parent.add(mesh);return mesh;}
 function shapePath(commands){const s=new THREE.Shape();for(const [type,...v] of commands){const p=[];for(let i=0;i<v.length;i+=2){const [x,,z]=world([v[i],v[i+1]]);p.push(x,-z);}s[type](...p);}s.closePath();return s;}
 function glowShape(shape,y,r=.018){return tube(shape.getPoints(80).map(p=>new THREE.Vector3(p.x,y,-p.y)),r,glow,lightGroup,true);}
 function canvasTexture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;}
 function screenTexture(title,variant='menu'){
 return canvasTexture(512,800,(c,w,h)=>{c.fillStyle='#07182f';c.fillRect(0,0,w,h);const g=c.createLinearGradient(0,0,w,350);g.addColorStop(0,'#124d98');g.addColorStop(1,'#0693c3');c.fillStyle=g;c.fillRect(18,18,476,235);c.fillStyle='#fff';c.font='bold 42px "Segoe UI", "Microsoft YaHei"';c.fillText('PISELL',43,80);c.font='bold 33px "Microsoft YaHei"';c.fillText(title,43,157);c.font='20px sans-serif';c.fillText('CHEER AMUSEMENT',43,215);
 const items=variant==='menu'?['购买门票','游戏卡储值','查询 / 兑换','会员服务']:variant==='food'?['咖啡饮品','轻食套餐','确认订单','取餐信息']:['选择商品','扫码支付','领取商品','订单查询'];for(let i=0;i<4;i++){const yy=285+i*100;c.fillStyle=i===0?'#258cf1':'#173451';c.beginPath();c.roundRect(28,yy,456,80,12);c.fill();c.fillStyle='#cce6ff';c.font='28px "Microsoft YaHei"';c.fillText(items[i],59,yy+50);c.font='30px sans-serif';c.fillText('›',437,yy+50);}c.fillStyle='#6998b9';c.font='18px sans-serif';c.fillText('中文     EN     日本語     العربية',35,759);});}
 function planeTexture(t,w,h,p,rot=0,parent=architecture,intensity=.65){const m=new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide,toneMapped:false});const a=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);a.position.copy(p);a.rotation.y=rot;parent.add(a);return a;}
 function sign(text,w,h,p,{color='#d8f2ff',bg='#092347',sub='',rot=0,parent=architecture}={}){const t=canvasTexture(2048,Math.max(128,Math.round(2048*h/w)),(c,cw,ch)=>{c.fillStyle=bg;c.fillRect(0,0,cw,ch);c.strokeStyle='#247bdf';c.lineWidth=4;for(let i=0;i<25;i++){c.beginPath();c.moveTo(i*110-400,ch);c.lineTo(i*110,0);c.stroke();}c.textAlign='center';c.fillStyle=color;c.font=`600 ${Math.min(ch*(sub?.42:.54),cw/text.length*.88)}px "Microsoft YaHei",sans-serif`;c.fillText(text,cw/2,ch*(sub?.49:.68));if(sub){c.font=`${Math.min(ch*.22,cw/sub.length*1.6)}px "Segoe UI",sans-serif`;c.fillText(sub,cw/2,ch*.84);}});return planeTexture(t,w,h,p,rot,parent,1);}
 // Floor outline and fixed shell are traced directly from the plan.
 const floor=extrude(planarShape(PLAN.boundary),.16,-.16,mat('slab',0x252c34,.72,.1));floor.name='plan-floor';
 const reflection=reflectiveFloor(planarShape(PLAN.boundary),scene,floorMat);
 const outside=box(22,.12,19,3,-.25,0,mat('outside',0x111923,.65,.25));outside.receiveShadow=true;
 const floorLines=new THREE.Group();architecture.add(floorLines);
 // Stone's PBR texture owns the joints; no doubled coarse grid or floating seams.
 // Contained grid strips; no oversized texture plane extending beyond the traced boundary.
 const backWalls=[[[143,91],[385,92]],[[385,92],[386,134]],[[386,134],[657,138]]];for(const [a,b]of backWalls){segment(a,b,1.6,3.2,.18);segment(a,b,3.18,.018,.026,glow,lightGroup);}
 const exterior=[[[143,91],[137,323]],[[137,323],[54,324]],[[54,324],[54,746]]];for(const [a,b]of exterior){segment(a,b,.17,.34,.18);segment(a,b,1.7,2.8,.18,dark,shell);segment(a,b,.35,.012,.024,glow,lightGroup);}
 for(const p of [[251,329],[251,745],[650,746],[663,341],[654,138]]){const q=V(p);box(.48,3.2,.45,q.x,1.6,q.z,dark);box(.49,.025,.47,q.x,3.19,q.z,metal);box(.49,.009,.015,q.x,3.205,q.z+.225,glow,lightGroup);}
 // Party room with the original diagonal side, separate transparent enclosure.
 extrude(planarShape(PLAN.party),.025,.012,mat('party-floor',0x5c4c40,.75,.05));
 for(const [a,b] of [[[151,112],[379,116]],[[151,112],[151,321]]])segment(a,b,1.4,2.8,.06,mat('party-panel',0x27334c,.7,.1));
 const partitionSegments=[[[379,116],[264,312]],[[151,321],[207,321]]];for(const [a,b]of partitionSegments){segment(a,b,1.36,2.7,.024,glass);segment(a,b,.08,.07,.05,metal);segment(a,b,2.73,.08,.06,metal);const aa=V(a),bb=V(b);for(let t=0;t<=1;t+=.25){const q=aa.clone().lerp(bb,t);box(.032,2.7,.032,q.x,1.36,q.z,metal);}}
 const partyDoor=segment([208,321],[261,312],1.36,2.64,.026,glass);segment([208,321],[261,312],2.73,.075,.06,metal);solids.push({type:'polygon',points:PLAN.party,door:[235,315]});
 sign('PARTY ROOM',1.7,.25,V([215,317],2.56));
 // Long crescent counters: one source definition for counter, pendant and collision.
 const cafeShape=shapePath([['moveTo',93,487],['bezierCurveTo',176,476,233,426,238,343],['quadraticCurveTo',235,328,252,328],['quadraticCurveTo',268,328,270,346],['bezierCurveTo',265,454,201,531,93,530],['bezierCurveTo',63,530,64,492,93,487]]);
 const ticketShape=shapePath([['moveTo',229,729],['bezierCurveTo',227,630,286,551,391,539],['quadraticCurveTo',433,535,437,560],['quadraticCurveTo',440,584,416,591],['bezierCurveTo',330,593,276,653,270,728],['quadraticCurveTo',251,741,229,729]]);
 function counter(shape,name,anchors){extrude(shape,.88,.055,white);extrude(shape,.055,.945,materials.countertop);extrude(shape,.04,.012,black);glowShape(shape,.09,.013);glowShape(shape,.923,.009);const lip=shape.getPoints(128).map(p=>new THREE.Vector3(p.x,.976,-p.y));tube(lip,.011,metal,architecture,true);const outline=shape.getPoints(128).map(p=>new THREE.Vector3(p.x,2.545,-p.y));tube(outline,.043,metal,architecture,true);pendants.push(tube(outline.map(p=>p.clone().setY(2.517)),.017,glow,lightGroup,true));for(const p of anchors){const q=V(p);cylinder(.004,.004,1.05,q.x,3.1,q.z,metal);box(.16,.022,.16,q.x,3.64,q.z,metal);}solids.push({type:'shape',name,shape});}
 counter(cafeShape,'cafe',[[96,506],[220,437],[252,345]]);counter(ticketShape,'ticket',[[250,711],[287,606],[411,560]]);
 // True continuous floor-standing PISell-style enclosure, shared across all kiosks.
 const uiTicket=screenTexture('欢迎来到奇乐儿'),uiFood=screenTexture('咖啡与轻餐','food');
 const devices=installDevices({architecture,solids,box,cylinder,planeTexture,canvasTexture,materials,uiTicket,uiFood});
 const exhibitDisplays=installExhibitDisplays({architecture,solids,box,cylinder,planeTexture,canvasTexture,materials});
 // Cafe working appliances and drinks, confined to cafe only.
 {const q=V([231,395],1);box(.59,.40,.38,q.x,q.y+.20,q.z,metal);box(.49,.16,.035,q.x,q.y+.19,q.z+.207,black);box(.65,.035,.49,q.x,q.y+.04,q.z+.04,black);for(let i=0;i<3;i++){cylinder(.028,.028,.07,q.x-.18+i*.18,1.20,q.z+.235,metal);cylinder(.039,.032,.082,q.x-.18+i*.18,1.085,q.z+.23,white);}for(let i=0;i<6;i++){const pp=V([97+i*6,514],1);cylinder(.045,.035,.13,pp.x,1.065,pp.z,mat('cup',0xdbbd96,.7,0));}for(const p of [[201,426],[220,416]]){const v=V(p);cylinder(.075,.075,.22,v.x,1.11,v.z,black);cylinder(.065,.065,.18,v.x,1.28,v.z,glass);}}
 sign('COFFEE / PICK UP',1.65,.17,V([154,509],.62));
 // Lockers along the right rear wall, with handles and individual doors.
 for(let row=0;row<3;row++)for(let col=0;col<4;col++){const q=V([637,169+col*13]);const door=box(.35,.54,.20,q.x,.36+row*.57,q.z,mat('locker',0xbd9023,.44,.25));box(.035,.065,.12,q.x-.20,.38+row*.57,q.z+.035,black);}
 {const q=V([637,189]);box(.49,.09,1.04,q.x,2.15,q.z,black);}
 function vending(p,rot=0,type='drink'){const q=V(p),g=new THREE.Group();g.position.copy(q);g.rotation.y=rot;architecture.add(g);box(.83,1.92,.58,0,.98,0,white,g);box(.65,1.25,.035,-.04,1.20,.308,black,g);for(let row=0;row<5;row++){box(.60,.018,.20,-.04,.69+row*.22,.23,metal,g);for(let col=0;col<4;col++){const m=mat('bottle'+col,[0x94dded,0xe4a549,0xad81b4,0xd7d7e4][col],.35,.15);if(type==='socks')box(.105,.13,.09,-.26+col*.145,.78+row*.22,.27,m,g);else cylinder(.043,.037,.15,-.26+col*.145,.78+row*.22,.27,m,g,12);}}box(.65,1.24,.012,-.04,1.20,.331,glass,g);box(.50,.23,.015,-.04,.31,.309,black,g);box(.09,.2,.018,.334,1.17,.31,black,g);box(.09,.055,.015,.334,.94,.311,glow,g);sign(type==='socks'?'SOCKS':'DRINKS',.65,.13,new THREE.Vector3(0,1.84,.302),{parent:g});solids.push({type:'circle',p,r:.58});return g;}
 vending([630,255],-Math.PI/2,'socks');vending([630,535],-Math.PI/2);
 // Bench matching the rear horizontal bench footprint.
 {const q=V([561,172]);box(1.94,.20,.56,q.x,.4,q.z,mat('upholstery',0x527790,.94,0));box(1.9,.22,.06,q.x,.58,q.z-.245,materials.upholstery);for(const x of [-.75,.75])box(.05,.31,.42,q.x+x,.155,q.z,metal);for(let i=0;i<4;i++)box(.006,.205,.565,q.x-.72+i*.48,.40,q.z,mat('seam',0x20354b,.8,0));}
 // Two claw machines, defined as the same reusable cabinet.
 function claw(p,accent){const q=V(p),g=new THREE.Group();g.position.copy(q);architecture.add(g);const ac=mat('claw'+accent,accent,.4,.25);box(.67,.18,.79,0,.14,0,black,g);box(.72,.48,.82,0,.45,0,white,g);box(.73,.14,.83,0,1.92,0,white,g);box(.73,.06,.84,0,1.86,0,ac,g);for(const x of [-.335,.335])for(const z of [-.385,.385]){box(.04,1.24,.04,x,1.24,z,metal,g);box(.012,1.21,.014,x,1.24,z+.021,glow,g);}box(.64,1.13,.012,0,1.23,.398,glass,g);box(.012,1.13,.73,-.348,1.23,0,glass,g);box(.012,1.13,.73,.348,1.23,0,glass,g);box(.5,.22,.035,0,.45,.434,black,g);box(.14,.10,.04,.18,.64,.446,ac,g);cylinder(.025,.025,.07,-.1,.72,.4,black,g);sphere(.037,-.1,.77,.4,ac,g);sign('LUCKY GIFT',.62,.13,new THREE.Vector3(0,1.93,.43),{parent:g,bg:'#08224e'});box(.62,.05,.68,0,1.77,0,metal,g);cylinder(.012,.012,.34,0,1.58,0,metal,g);for(let i=0;i<3;i++){const aa=i*Math.PI*2/3;tube([new THREE.Vector3(0,1.42,0),new THREE.Vector3(Math.cos(aa)*.10,1.33,Math.sin(aa)*.10),new THREE.Vector3(Math.cos(aa)*.06,1.24,Math.sin(aa)*.06)],.012,metal,g);}for(let i=0;i<22;i++){const x=Math.sin(i*13.91)*.24,z=Math.cos(i*5.38)*.28;const m=mat('toy'+i%4,[0xf4d993,0xf0b7cd,0xb3dfec,0xe8e6d9][i%4],.85,0);sphere(.075,x,.76+Math.floor(i/11)*.1,z,m,g);sphere(.032,x-.043,.82+Math.floor(i/11)*.1,z,m,g);sphere(.032,x+.043,.82+Math.floor(i/11)*.1,z,m,g);}solids.push({type:'circle',p,r:.55});}
 claw([465,273],0xe091c3);claw([511,273],0xd9c668);
 // Two separate gate banks at the right boundary, matching plan three housings per bank.
 for(const [bank,ys]of [[0,[385,420,456]],[1,[647,683,718]]])for(const [i,py]of ys.entries()){const q=V([651,py]);box(1.22,.92,.19,q.x,.46,q.z,metal);box(1.24,.055,.205,q.x,.94,q.z,black);box(1.08,.04,.024,q.x,.85,q.z+.106,glow,lightGroup);box(.18,.055,.14,q.x-.42,.99,q.z,black);box(.1,.011,.09,q.x-.42,1.023,q.z,glow,lightGroup);if(i<2){const wing=box(.028,.65,.38,q.x,.55,q.z+.29,glass);wing.userData.closedZ=q.z+.29;gateWings.push(wing);}solids.push({type:'rect',x:q.x,z:q.z,w:1.24,d:.20});}
 // Front facade: entry left, map display middle, exit right. Door widths are explicit.
 const frontY=750;
 function frontFrame(a,b){segment([a,frontY],[b,frontY],3.0,.46,.18,black);segment([a,frontY+5],[b,frontY+5],3.235,.012,.022,glow,lightGroup);for(const px of [a,b]){const q=V([px,frontY]);box(.055,2.8,.075,q.x,1.4,q.z,metal);}}
 frontFrame(54,650);
 const mapTex=worldDisplay();const mapCenter=V([378,751],1.38);box(3.25,2.7,.16,mapCenter.x,1.35,mapCenter.z,black);planeTexture(mapTex,3.20,2.64,mapCenter.clone().add(new THREE.Vector3(0,0,.089)),0,architecture,.85);
 function doubleDoor(a,b,open){const ax=world([a,frontY])[0],bx=world([b,frontY])[0],z=world([a,frontY])[2],width=(bx-ax)/2;
 for(const [x,side]of [[ax,1],[bx,-1]]){const pivot=new THREE.Group();pivot.position.set(x,0,z);architecture.add(pivot);const leaf=box(width,2.7,.024,side*width/2,1.35,0,glass,pivot);for(const h of [.05,2.67])box(width,.035,.035,side*width/2,h,0,metal,pivot);box(.04,2.7,.04,side*width,1.35,0,metal,pivot);box(.025,.65,.08,side*(width-.12),1.20,.07,metal,pivot);pivot.rotation.y=open?-side*1.25:0;doors.push({pivot,side,open});} }
 doubleDoor(57,247,true);doubleDoor(493,650,false);
 const entrySign=sign('入口 / ENTRY',2.3,.28,V([149,757],3.0));const exitSign=sign('出口 / EXIT',1.8,.28,V([578,757],3.0));
 const titleSign=sign('奇乐儿游乐场管理系统展厅',4.95,.39,V([367,757],3.0),{sub:'Cheer Amusement Management System Showroom'});
 function updateFacadeSign(mesh,text,preset,sub=''){
  const t=mesh.material.map,c=t.image.getContext('2d'),w=t.image.width,h=t.image.height;
  c.fillStyle='#071321';c.fillRect(0,0,w,h);c.strokeStyle=preset.color;c.lineWidth=3;
  for(let x=-h;x<w;x+=85){c.beginPath();c.moveTo(x,h);c.lineTo(x+h,0);c.stroke();}
  c.fillStyle='#071321dd';c.fillRect(0,h*.12,w,h*.76);c.textAlign='center';c.fillStyle='#ffffff';
  c.font=`600 ${h*(sub?.42:.54)}px "Microsoft YaHei","Segoe UI",sans-serif`;c.fillText(text,w/2,h*(sub?.49:.68),w*.94);
  if(sub){c.fillStyle=preset.color;c.font=`${h*.22}px "Microsoft YaHei","Segoe UI",sans-serif`;c.fillText(sub,w/2,h*.84,w*.94);}
  t.needsUpdate=true;
 }
 // Back scene uses an existing showroom image as an exhibition screen asset, never as geometry.
 const backMid=V([494,141],1.67);box(3.30,2.78,.14,backMid.x,1.6,backMid.z,black);const countryBackScreen=planeTexture(exhibitDisplays.setCountry('au'),3.25,2.71,backMid.clone().setY(1.61).add(new THREE.Vector3(0,0,.082)),0,architecture,1.0);segment([391,144],[593,144],.25,.025,.15,glow,lightGroup);
 // Party furniture, birthday scene and scaled human figures.
 const makeSilhouette=silhouetteFactory();
 function person(p,options={}){const g=makeSilhouette(V(p),options);people.add(g);return g;}
 function chair(p,rot){const q=V(p),g=new THREE.Group();g.position.copy(q);g.rotation.y=rot;architecture.add(g);box(.4,.08,.4,0,.45,0,mat('chair',0x8a6842,.5,.3),g);box(.4,.37,.055,0,.69,-.18,materials.chair,g);for(const x of [-.16,.16])for(const z of [-.16,.16])cylinder(.017,.014,.41,x,.22,z,metal,g,10);}
 {const p=V([217,218]);cylinder(.64,.64,.075,p.x,.77,p.z,mat('table',0xaf8054,.57,.1));cylinder(.08,.15,.70,p.x,.35,p.z,black);cylinder(.16,.17,.15,p.x,.88,p.z,mat('cake',0xf2e0d1,.92,0));for(let i=0;i<5;i++){cylinder(.005,.005,.07,p.x+(i-2)*.04,1.0,p.z,white);sphere(.013,p.x+(i-2)*.04,1.04,p.z,mat('flame',0xffbb55,.5,0));}for(let i=0;i<6;i++){const angle=i*Math.PI/3,pp=[217+Math.cos(angle)*55,218+Math.sin(angle)*55];chair(pp,-angle-Math.PI/2);person(pp,{seated:true,rot:-angle-Math.PI/2,child:i%3===0});}for(let i=0;i<10;i++){const b=V([168+(i%5)*34,130+Math.floor(i/5)*17]);const balloon=sphere(.14,b.x,1.7+Math.sin(i)*.13,b.z,mat('balloon'+i%3,[0x136cbf,0xdab566,0xa1b2c8][i%3],.2,.4));balloon.scale.y=1.2;tube([new THREE.Vector3(b.x,1.6,b.z),new THREE.Vector3(b.x+.03,.9,b.z)],.002,metal,architecture);}}
 person([310,674],{staff:true,rot:-Math.PI/2});person([378,616],{staff:true,rot:-Math.PI/2});person([215,645],{rot:Math.PI/2});person([219,615],{child:true,rot:Math.PI/2});person([286,557],{rot:Math.PI/2});person([168,440],{staff:true,rot:Math.PI/2});person([213,522],{rot:-Math.PI/2});person([240,514],{child:true,rot:-Math.PI/2});person([466,324],{rot:Math.PI});person([507,335],{child:true,rot:Math.PI});person([597,266],{rot:Math.PI/2});person([587,491],{rot:Math.PI/2});
 // Existing amusement park context at the right: low ropes frame and carousel silhouette.
 const parkBase=V([810,340]);for(const px of [730,865,1000])for(const py of [155,340]){const q=V([px,py]);cylinder(.045,.055,3.45,q.x,1.73,q.z,metal);}
 for(const py of [155,340])segment([730,py],[1000,py],3.43,.085,.085,metal);for(const px of [730,865,1000])segment([px,155],[px,340],3.43,.085,.085,metal);
 for(let i=0;i<12;i++){const q=V([740+i*22,255]);box(.21,.05,.33,q.x,1.05+Math.sin(i*.7)*.07,q.z,mat('rope-step',0x24567b,.65,.1));for(const z of [-.15,.15])cylinder(.004,.004,2.34,q.x,2.25,q.z+z,metal,architecture,7);}
 {const q=V([820,610]);cylinder(1.22,1.27,.16,q.x,.1,q.z,mat('carousel-base',0x293c58,.48,.45));cylinder(.065,.065,2.3,q.x,1.3,q.z,metal);const canopy=cylinder(0,1.28,.48,q.x,2.62,q.z,mat('canopy',0x274b7b,.45,.3),architecture,32);for(let i=0;i<8;i++){const a=i*Math.PI/4,x=q.x+Math.cos(a)*.9,z=q.z+Math.sin(a)*.9;cylinder(.014,.014,1.95,x,1.2,z,metal);box(.20,.3,.38,x,.57,z,mat('ride-seat',0x93622d,.4,.3));}const ring=[];for(let i=0;i<64;i++){const a=i/64*Math.PI*2;ring.push(new THREE.Vector3(q.x+Math.cos(a)*1.23,.2,q.z+Math.sin(a)*1.23));}tube(ring,.02,glow,lightGroup,true);}
 sign('AMUSEMENT PARK',3.4,.37,V([841,151],3.1));
 // Secondary construction details, all within existing footprints.
 const satin=mat('satin-detail',0x576c82,.38,.85),rubber=mat('rubber',0x10151a,.94,0);
 for(const anchors of [[[96,506],[220,437],[252,345]],[[250,711],[287,606],[411,560]]]){for(let i=1;i<anchors.length;i++)segment(anchors[i-1],anchors[i],3.66,.045,.065,dark);}
 for(let i=0;i<13;i++){const q=V([156+i*16,118]);box(.009,2.30,.025,q.x,1.35,q.z,mat('panel-reveal',0x141d2c,.86,.15));}
 {const q=V([217,218]);for(let i=0;i<6;i++){const a=i*Math.PI/3,x=q.x+Math.cos(a)*.45,z=q.z+Math.sin(a)*.45;cylinder(.095,.10,.012,x,.813,z,white);cylinder(.076,.076,.008,x,.822,z,materials.countertop);cylinder(.031,.028,.09,x+.065,.856,z-.04,glass);box(.012,.006,.12,x-.12,.82,z,metal);}}
 for(const p of [[465,273],[511,273]]){const q=V(p);for(const x of [-.28,.28])for(const z of [-.32,.32]){cylinder(.035,.035,.055,q.x+x,.045,q.z+z,rubber);}for(let i=0;i<6;i++)box(.17,.006,.013,q.x+.16,.29+i*.021,q.z+.419,satin);box(.28,.065,.015,q.x-.12,.55,q.z+.437,satin);}
 // Upholstery piping and serviceable locker hinge details.
 for(let row=0;row<3;row++)for(let col=0;col<4;col++){const q=V([637,169+col*13]);box(.026,.022,.04,q.x-.182,.55+row*.57,q.z-.055,satin);box(.026,.022,.04,q.x-.182,.20+row*.57,q.z-.055,satin);}
 {const q=V([820,610]);const brass=mat('brass',0xb8965d,.3,.75);for(const y of [.26,2.38]){const ring=[];for(let i=0;i<64;i++){const a=i/64*Math.PI*2;ring.push(new THREE.Vector3(q.x+Math.cos(a)*1.24,y,q.z+Math.sin(a)*1.24));}tube(ring,.015,brass,architecture,true);}const bulb=mat('warm-bulb',0xffddaa,.3,0);bulb.emissive.setHex(0xffb968);bulb.emissiveIntensity=1.5;for(let i=0;i<40;i++){const a=i/40*Math.PI*2;sphere(.018,q.x+Math.cos(a)*1.22,2.39,q.z+Math.sin(a)*1.22,bulb);}}
 // Recessed perimeter accent and neutral illumination.
 const ambient=new THREE.HemisphereLight(0xc7e0ff,0x17253b,.38);scene.add(ambient);const key=new THREE.DirectionalLight(0xe6efff,1.15);key.position.set(-3,10,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-9;key.shadow.camera.right=12;key.shadow.camera.top=8;key.shadow.camera.bottom=-9;key.shadow.camera.near=.5;key.shadow.camera.far=35;key.shadow.bias=-.00015;key.shadow.normalBias=.014;key.shadow.radius=3;scene.add(key);
 for(const p of [[-3,2.7,1],[0,2.9,-3],[3.2,2.6,1],[0,2.8,3.7]]){const l=new THREE.PointLight(0x1475ff,7,7,2);l.position.set(...p);scene.add(l);lights.push(l);}
 RectAreaLightUniformsLib.init();for(const p of [[-2.9,3.5,.5],[.1,3.5,2.5],[1.8,3.5,-2.5]]){const a=new THREE.RectAreaLight(0xe2eeff,.85,2.3,1.0);a.position.set(...p);a.lookAt(p[0],0,p[2]);scene.add(a);}const warm=new THREE.PointLight(0xffd6a1,12,4,2);warm.position.copy(V([221,220],2.55));scene.add(warm);
 // Guided paths share the same plan coordinates as the navigation stops.
 for(const [id,route] of Object.entries(ROUTES)){const g=new THREE.Group();g.visible=false;routes.add(g);const pts=route.path.map(p=>V(p,.028));const curve=new THREE.CatmullRomCurve3(pts);const m=new THREE.MeshBasicMaterial({color:route.color,transparent:true,opacity:.8});tube(pts,.022,m,g);for(let i=0;i<4;i++){const dot=sphere(.057,0,.04,0,new THREE.MeshBasicMaterial({color:route.color}),g);routeDots.push({id,curve,dot,offset:i/4});}g.name=id;}
 // Subtle static wayfinding marks at the public entrance aisle.
 for(const py of [697,662,625,588,551]){const pp=V([172,py],.018);const tri=new THREE.Shape();tri.moveTo(-.1,.05);tri.lineTo(0,-.07);tri.lineTo(.1,.05);tri.lineTo(0,.0);tri.closePath();const geo=new THREE.ShapeGeometry(tri);geo.rotateX(Math.PI/2);const mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0x287fc9,transparent:true,opacity:.65,side:THREE.DoubleSide}));mesh.position.copy(pp);architecture.add(mesh);}
 batchStatic(architecture,gateWings);batchStatic(lightGroup);batchStatic(shell);
 function setRoute(id){routes.children.forEach(g=>g.visible=g.name===id);}
 function setCountry(id){const preset=getCountry(id);countryBackScreen.material.map=exhibitDisplays.setCountry(preset.id);countryBackScreen.material.needsUpdate=true;glow.emissive.set(preset.color);for(const light of lights)light.color.set(preset.color);updateFacadeSign(entrySign,preset.entry,preset);updateFacadeSign(exitSign,preset.exit,preset);updateFacadeSign(titleSign,'奇乐儿游乐场管理系统展厅',preset,'Cheer Amusement Management System Showroom · '+preset.name.split(' / ')[1]);mapTex.userData.setCountry(preset);return preset;}
 setCountry('au');
 function update(t,camera){exhibitDisplays.update(t);for(const r of routeDots){r.dot.position.copy(r.curve.getPoint((t*.048+r.offset)%1));}for(const [i,wing]of gateWings.entries())wing.rotation.y=routes.children.some(g=>g.visible&&g.name==='entry')?Math.sin(t*.7+i)*.55:0;if(camera){for(const g of people.children){if(g.userData.card)g.userData.card.rotation.y=Math.atan2(camera.position.x-g.position.x,camera.position.z-g.position.z);}reflection.visible=!camera.isOrthographicCamera;}}
 return {scene,shell,people,lightGroup,lights,solids,PLAN,cafeShape,ticketShape,doors,gateWings,setRoute,setCountry,update,world,V,architecture,pendants,reflection};
}
