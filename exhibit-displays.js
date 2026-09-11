import * as THREE from 'three';
import {world} from './layout.js';
import {COUNTRY_PRESETS,getCountry} from './country-presets.js';
import {createScreenContent} from './screen-content.js';

// Physical panel diagonals are user-specified; housings are generic display assemblies.
export const DISPLAY_CONFIG=[
 {id:'kitchen-kds',inches:20,at:[63,414],height:1.92,rotation:Math.PI/2,kind:'kitchen',mount:'wall'},
 {id:'cafe-menu',inches:43,at:[141,499],height:2.17,rotation:.45,kind:'menu',mount:'ceiling'},
 {id:'cafe-pickup',inches:43,at:[213,444],height:2.17,rotation:.75,kind:'pickup',mount:'ceiling'},
 {id:'ticket-prices',inches:43,at:[269,667],height:2.17,rotation:-Math.PI/2,kind:'ticket',mount:'ceiling'},
 {id:'ticket-advert',inches:43,at:[343,574],height:2.17,rotation:-Math.PI/2,kind:'advert',mount:'ceiling'}
];
export function panelSize(inches){const diagonal=inches*.0254;return {width:diagonal*16/Math.sqrt(337),height:diagonal*9/Math.sqrt(337)};}
export const WINDOW_COUNTRIES=COUNTRY_PRESETS;

export function installExhibitDisplays({architecture,box,cylinder,planeTexture,canvasTexture,materials,solids}){
 const localizedScreens=createScreenContent(canvasTexture);
 const {dark,metal,white,black,countertop}=materials;
 const v=(p,y=0)=>new THREE.Vector3(...world(p,y));
 const texture=localizedScreens.texture;
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
 const textureLoader=new THREE.TextureLoader();
 const sceneryTextures=new Map(COUNTRY_PRESETS.map(p=>{const t=textureLoader.load(p.image);t.colorSpace=THREE.SRGBColorSpace;t.repeat.set(...p.repeat);t.offset.set(...p.offset);t.anisotropy=4;return [p.id,t];}));
 const windowScreen=planeTexture(sceneryTextures.get('au'),3.04,2.27,new THREE.Vector3(0,.09,.053),0,windowGroup);
 const countryLabel=canvasTexture(1200,84,(c)=>{c.fillStyle='#081728';c.fillRect(0,0,1200,84);});
 planeTexture(countryLabel,3.04,.19,new THREE.Vector3(0,-1.12,.054),0,windowGroup);
 function setCountry(id){localizedScreens.setCountry(id);const p=getCountry(id);windowScreen.material.map=sceneryTextures.get(p.id);windowScreen.material.needsUpdate=true;const c=countryLabel.image.getContext('2d');c.fillStyle='#081728';c.fillRect(0,0,1200,84);c.fillStyle=p.color;c.font='32px "Microsoft YaHei", sans-serif';c.fillText(p.name+'  ·  室内游乐场模拟',32,54);countryLabel.needsUpdate=true;return sceneryTextures.get(p.id);}
 setCountry('au');return {setCountry,windowScreen,update(){}};
}
