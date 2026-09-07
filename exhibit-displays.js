import * as THREE from 'three';
import {world} from './layout.js';

// Physical panel diagonals are user-specified; housings are generic display assemblies.
export const DISPLAY_CONFIG=[
 {id:'kitchen-kds',inches:20,at:[63,414],height:1.92,rotation:Math.PI/2,kind:'kitchen',mount:'wall'},
 {id:'cafe-menu',inches:43,at:[141,499],height:2.17,rotation:.45,kind:'menu',mount:'ceiling'},
 {id:'cafe-pickup',inches:43,at:[213,444],height:2.17,rotation:.75,kind:'pickup',mount:'ceiling'},
 {id:'ticket-prices',inches:43,at:[269,667],height:2.17,rotation:-Math.PI/2,kind:'ticket',mount:'ceiling'},
 {id:'ticket-advert',inches:43,at:[343,574],height:2.17,rotation:-Math.PI/2,kind:'advert',mount:'ceiling'}
];
export function panelSize(inches){const diagonal=inches*.0254;return {width:diagonal*16/Math.sqrt(337),height:diagonal*9/Math.sqrt(337)};}
export const WINDOW_COUNTRIES=[{name:'美国 / USA',offset:[0,.5]},{name:'日本 / JAPAN',offset:[.5,.5]},{name:'阿联酋 / UAE',offset:[0,0]},{name:'法国 / FRANCE',offset:[.5,0]}];

export function installExhibitDisplays({architecture,box,cylinder,planeTexture,canvasTexture,materials,solids}){
 const {dark,metal,white,black,countertop}=materials;
 const v=(p,y=0)=>new THREE.Vector3(...world(p,y));
 const content={
  menu:{title:'咖啡与轻餐',sub:'MENU · 演示菜单',accent:'#efc891',rows:[['美式咖啡','¥ 18'],['拿铁咖啡','¥ 25'],['鸡肉三明治','¥ 32'],['亲子分享套餐','¥ 58']]},
  pickup:{title:'请取餐',sub:'PICK UP · 演示订单',accent:'#57e6b6',rows:[['A018','请到吧台取餐'],['A021','请到吧台取餐'],['制作中','A022 · A023']]},
  kitchen:{title:'厨房出餐',sub:'KITCHEN · 演示订单',accent:'#ffba66',rows:[['A022  堂食','拿铁 ×2'],['A023  堂食','三明治 ×1'],['待出餐','2 单']]},
  ticket:{title:'入园票务',sub:'TICKETS · 演示票价',accent:'#80d7ff',rows:[['儿童畅玩票','¥ 128'],['亲子套票','¥ 168'],['家庭套票','¥ 228'],['游戏卡储值','请在自助机操作']]},
  advert:{title:'快乐，连接世界',sub:'CHEER AMUSEMENT',accent:'#9cb8ff',rows:[['全球乐园 · 本地体验',''],['生日派对 / FAMILY PARTY',''],['会员礼遇 · 精彩活动','']]}
 };
 const texture=kind=>canvasTexture(1600,900,(c,w,h)=>{const d=content[kind];c.fillStyle='#071321';c.fillRect(0,0,w,h);c.fillStyle='#102d48';c.fillRect(0,0,w,226);c.fillStyle=d.accent;c.fillRect(0,0,14,h);c.font='bold 80px "Microsoft YaHei", sans-serif';c.fillText(d.title,70,117);c.font='30px "Segoe UI", sans-serif';c.fillText(d.sub,74,185);d.rows.forEach(([a,b],i)=>{const y=320+i*127;c.fillStyle='#eaf5ff';c.font='52px "Microsoft YaHei", sans-serif';c.fillText(a,76,y);c.textAlign='right';c.fillStyle=d.accent;c.font='46px "Microsoft YaHei", sans-serif';c.fillText(b,1520,y);c.textAlign='left';c.fillStyle='#213b52';c.fillRect(76,y+38,1448,2);});c.fillStyle='#86a2b8';c.font='25px sans-serif';c.fillText('PISELL  /  奇乐儿展厅 · 模拟演示',76,851);});
 for(const cfg of DISPLAY_CONFIG){const size=panelSize(cfg.inches),g=new THREE.Group();g.name=cfg.id;g.position.copy(v(cfg.at,cfg.height));g.rotation.y=cfg.rotation;g.userData={...cfg,...size};architecture.add(g);box(size.width+.025,size.height+.025,.045,0,0,0,black,g);planeTexture(texture(cfg.kind),size.width,size.height,new THREE.Vector3(0,0,.026),0,g);box(.18,.12,.025,0,0,-.04,metal,g);
  if(cfg.mount==='ceiling'){const length=3.66-(cfg.height+size.height/2);for(const x of [-size.width*.30,size.width*.30]){cylinder(.009,.009,length,x,size.height/2+length/2,-.015,metal,g);box(.08,.016,.08,x,3.66-cfg.height,-.015,metal,g);}}else box(.11,.11,.14,0,0,-.09,metal,g);
 }
 // Existing left perimeter: restore only the kitchen wall segment, not a new partition.
 const wall=v([54,430]);box(.14,2.96,3.36,wall.x,1.65,wall.z,dark);
 const rear=v([78,417]);box(.56,.84,2.58,rear.x,.45,rear.z,white);box(.61,.045,2.64,rear.x,.895,rear.z,countertop);box(.035,.57,2.62,rear.x-.27,1.20,rear.z,metal);
 // Cabinet doors, recessed handles and pass shelf; all behind the existing cafe counter.
 for(let i=0;i<4;i++){const z=rear.z-1.0+i*.66;box(.018,.67,.62,rear.x+.291,.47,z,metal);box(.035,.024,.20,rear.x+.312,.73,z,black);}
 box(.66,.045,1.05,rear.x+.025,1.12,rear.z-.60,metal);
 for(const dz of [-.84,-.44]){box(.30,.025,.31,rear.x+.07,1.156,rear.z+dz,white);cylinder(.095,.095,.03,rear.x+.07,1.183,rear.z+dz,white);}
 const ovenZ=rear.z+.87;box(.45,.34,.48,rear.x,.109+1.0,ovenZ,metal);box(.018,.24,.35,rear.x+.236,1.11,ovenZ,black);box(.04,.024,.28,rear.x+.255,1.24,ovenZ,metal);
 solids.push({type:'rect',x:rear.x,z:rear.z,w:.63,d:2.66});
 // LED simulated window occupies the second annotated left perimeter segment, not the entrance.
 const windowGroup=new THREE.Group();windowGroup.name='country-window-led';windowGroup.position.copy(v([58,640],1.63));windowGroup.rotation.y=Math.PI/2;architecture.add(windowGroup);
 box(3.10,2.54,.09,0,0,0,black,windowGroup);
 const scenery=new THREE.TextureLoader().load('/assets/country-window-atlas.png');scenery.colorSpace=THREE.SRGBColorSpace;scenery.repeat.set(.5,.5);scenery.offset.set(...WINDOW_COUNTRIES[0].offset);scenery.anisotropy=4;
 planeTexture(scenery,3.04,2.27,new THREE.Vector3(0,.09,.053),0,windowGroup);
 const countryLabel=canvasTexture(1200,84,(c)=>{c.fillStyle='#081728';c.fillRect(0,0,1200,84);});
 planeTexture(countryLabel,3.04,.19,new THREE.Vector3(0,-1.12,.054),0,windowGroup);
 let last=-1;return {update(t){const index=Math.floor(t/14)%WINDOW_COUNTRIES.length;if(index===last)return;last=index;scenery.offset.set(...WINDOW_COUNTRIES[index].offset);const c=countryLabel.image.getContext('2d');c.fillStyle='#081728';c.fillRect(0,0,1200,84);c.fillStyle='#ceefff';c.font='32px "Microsoft YaHei", sans-serif';c.fillText(WINDOW_COUNTRIES[index].name+'  ·  游乐场窗景模拟',32,54);countryLabel.needsUpdate=true;}};
}
