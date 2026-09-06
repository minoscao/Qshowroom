import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export const QUALITY={dpr:Math.min(devicePixelRatio,innerWidth<760?1.35:1.75),reflectionSize:innerWidth<760?512:1024,shadowSize:2048};
const cache=new Map();
export function bevelBox(w,h,d){
 const radius=Math.min(.025,w*.08,h*.08,d*.08),key=[w,h,d,radius].join(':');
 if(!cache.has(key))cache.set(key,Math.min(w,h,d)>.035?new RoundedBoxGeometry(w,h,d,1,radius):new THREE.BoxGeometry(w,h,d));
 return cache.get(key);
}
export function makeTexture(w,h,draw,color=true){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;draw(canvas.getContext('2d'),w,h);const t=new THREE.CanvasTexture(canvas);t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;t.anisotropy=8;return t;}
export function materialKit(){
 const loader=new THREE.TextureLoader();
 const floorMaps={};for(const key of ['Diffuse','nor_gl','Rough']){const t=loader.load('/assets/floor-'+key+'.jpg');t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(.25,.25);t.anisotropy=8;if(key==='Diffuse')t.colorSpace=THREE.SRGBColorSpace;floorMaps[key]=t;}
 const brush=makeTexture(512,256,(c,w,h)=>{c.fillStyle='#a4a4a4';c.fillRect(0,0,w,h);let n=1847;for(let i=0;i<4000;i++){n=(n*16807)%2147483647;const y=n%h;n=(n*16807)%2147483647;c.fillStyle=`rgba(255,255,255,${.02+(n%8)/100})`;c.fillRect(n%w,y,80+n%200,1);}},false);brush.wrapS=brush.wrapT=THREE.RepeatWrapping;
 return {
  dark:new THREE.MeshStandardMaterial({color:0x233042,metalness:.62,roughness:.33,envMapIntensity:1.1}),
  metal:new THREE.MeshStandardMaterial({color:0xb8c3cc,metalness:.95,roughness:.24,roughnessMap:brush,envMapIntensity:1.3}),
  white:new THREE.MeshPhysicalMaterial({color:0xe2e7e9,metalness:.08,roughness:.28,clearcoat:.65,clearcoatRoughness:.17}),
  black:new THREE.MeshStandardMaterial({color:0x080b11,metalness:.15,roughness:.39}),
  floor:new THREE.MeshPhysicalMaterial({color:0x626872,map:floorMaps.Diffuse,normalMap:floorMaps.nor_gl,normalScale:new THREE.Vector2(.18,.18),roughnessMap:floorMaps.Rough,roughness:.48,metalness:.12,clearcoat:.5,clearcoatRoughness:.24,transparent:true,opacity:.84,depthWrite:false}),
  countertop:new THREE.MeshPhysicalMaterial({color:0xe8e9e9,metalness:.04,roughness:.24,clearcoat:.75,clearcoatRoughness:.15}),
  glass:new THREE.MeshPhysicalMaterial({color:0xc6e5ee,metalness:0,roughness:.07,transparent:true,opacity:.12,clearcoat:1,envMapIntensity:1.2,side:THREE.DoubleSide,depthWrite:false}),
 };
}

export function reflectiveFloor(shape,scene,surface){
 const mirror=new Reflector(new THREE.ShapeGeometry(shape,64),{color:0x314356,textureWidth:QUALITY.reflectionSize,textureHeight:QUALITY.reflectionSize,clipBias:.002,multisample:0});
 mirror.rotation.x=-Math.PI/2;mirror.position.y=.002;mirror.name='polished-stone-reflection';
 mirror.material.fragmentShader=mirror.material.fragmentShader.replace('vec4 base = texture2DProj( tDiffuse, vUv );',`vec2 u=vUv.xy/vUv.w;
 vec2 d=vec2(0.0015);
 vec4 base=texture2D(tDiffuse,u)*0.28;
 base+=(texture2D(tDiffuse,u+vec2(d.x,0.0))+texture2D(tDiffuse,u-vec2(d.x,0.0))+texture2D(tDiffuse,u+vec2(0.0,d.y))+texture2D(tDiffuse,u-vec2(0.0,d.y)))*0.12;
 base+=(texture2D(tDiffuse,u+d)+texture2D(tDiffuse,u-d)+texture2D(tDiffuse,u+vec2(d.x,-d.y))+texture2D(tDiffuse,u+vec2(-d.x,d.y)))*0.06;`)
 .replace('vec4( blendOverlay( base.rgb, color ), 1.0 )','vec4(base.rgb * 0.78 + color * 0.18, 1.0)');
 scene.add(mirror);
 const finish=new THREE.Mesh(new THREE.ShapeGeometry(shape,64),surface);finish.rotation.x=-Math.PI/2;finish.position.y=.006;finish.receiveShadow=true;finish.renderOrder=1;finish.name='stone-finish';scene.add(finish);
 return mirror;
}

// Architectural entourage: deliberately flat translucent outlines, no mannequin anatomy.
export function silhouetteFactory(){
 const mats={guest:new THREE.MeshBasicMaterial({color:0xeaf5ff,transparent:true,opacity:.32,depthWrite:false,side:THREE.DoubleSide}),staff:new THREE.MeshBasicMaterial({color:0x6bbdff,transparent:true,opacity:.44,depthWrite:false,side:THREE.DoubleSide})};
 const outlines={guest:new THREE.LineBasicMaterial({color:0xc5e2f1,transparent:true,opacity:.56,depthWrite:false}),staff:new THREE.LineBasicMaterial({color:0x76caff,transparent:true,opacity:.75,depthWrite:false})};
 const standing=new THREE.Shape();standing.moveTo(-.10,1.44);standing.bezierCurveTo(-.16,1.40,-.24,1.40,-.27,1.32);standing.bezierCurveTo(-.30,1.22,-.32,1.03,-.34,.90);standing.quadraticCurveTo(-.32,.85,-.28,.90);standing.lineTo(-.20,1.19);standing.lineTo(-.18,.82);standing.lineTo(-.17,.52);standing.lineTo(-.20,.07);standing.lineTo(-.25,.03);standing.quadraticCurveTo(-.25,0,-.11,.015);standing.lineTo(-.04,.58);standing.lineTo(.015,.78);standing.lineTo(.065,.54);standing.lineTo(.10,.02);standing.quadraticCurveTo(.21,0,.24,.025);standing.lineTo(.18,.07);standing.lineTo(.17,.53);standing.lineTo(.18,.84);standing.lineTo(.18,1.20);standing.lineTo(.27,.92);standing.quadraticCurveTo(.33,.88,.32,.96);standing.lineTo(.27,1.30);standing.quadraticCurveTo(.25,1.38,.11,1.44);standing.closePath();
 const sitting=new THREE.Shape();sitting.moveTo(-.1,1.15);sitting.quadraticCurveTo(-.27,1.12,-.27,.95);sitting.lineTo(-.3,.77);sitting.lineTo(-.20,.66);sitting.lineTo(-.23,.47);sitting.lineTo(-.19,.06);sitting.lineTo(-.08,.02);sitting.lineTo(-.06,.45);sitting.lineTo(.07,.45);sitting.lineTo(.10,.03);sitting.lineTo(.23,.03);sitting.lineTo(.24,.52);sitting.quadraticCurveTo(.22,.64,.17,.66);sitting.lineTo(.18,.91);sitting.lineTo(.28,.78);sitting.lineTo(.34,.85);sitting.lineTo(.26,1.05);sitting.quadraticCurveTo(.23,1.12,.1,1.15);sitting.closePath();
 const head=(y)=>{const s=new THREE.Shape();s.absellipse(0,y,.105,.14,0,Math.PI*2,false);return s;};
 const shapes={standing:[standing,head(1.60)],sitting:[sitting,head(1.31)]};
 const geos={},edges={};for(const [key,list]of Object.entries(shapes)){geos[key]=new THREE.ShapeGeometry(list,24);const pts=[];for(const s of list){const points=s.getPoints(64);for(let i=1;i<points.length;i++)pts.push(new THREE.Vector3(points[i-1].x,points[i-1].y,.001),new THREE.Vector3(points[i].x,points[i].y,.001));}edges[key]=new THREE.BufferGeometry().setFromPoints(pts);}
 const shadowTex=makeTexture(128,128,(c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(0,0,0,.5)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h);});
 const shadowMat=new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false});
 return (position,{staff=false,child=false,seated=false,rot=0}={})=>{const g=new THREE.Group();g.position.copy(position);const key=seated?'sitting':'standing',role=staff?'staff':'guest';g.scale.setScalar(child?.67:1);const card=new THREE.Group();card.add(new THREE.Mesh(geos[key],mats[role]),new THREE.LineSegments(edges[key],outlines[role]));card.rotation.y=rot;g.add(card);g.userData.card=card;g.userData.entourage=true;
 const contact=new THREE.Mesh(new THREE.PlaneGeometry(.65,.42),shadowMat);contact.rotation.x=-Math.PI/2;contact.position.y=.012;g.add(contact);return g;};
}

// Static opaque pieces become material batches; glass and moving parts retain independent objects.
export function batchStatic(root,excluded=[]){root.updateMatrixWorld(true);const skip=new Set(excluded),buckets=new Map(),remove=[];root.traverse(o=>{if(!o.isMesh||o.isReflector||skip.has(o)||Array.isArray(o.material)||o.material.transparent||o.userData.dynamic)return;const key=o.material.uuid+':'+o.castShadow;let bucket=buckets.get(key);if(!bucket)buckets.set(key,bucket={m:o.material,shadow:o.castShadow,geos:[]});let geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(o.matrixWorld);for(const name of Object.keys(geo.attributes))if(!['position','normal','uv'].includes(name))geo.deleteAttribute(name);geo.clearGroups();bucket.geos.push(geo);remove.push(o);});
 for(const b of buckets.values()){const geo=mergeGeometries(b.geos,false);b.geos.forEach(g=>g.dispose());if(!geo)continue;const mesh=new THREE.Mesh(geo,b.m);mesh.castShadow=b.shadow;mesh.receiveShadow=true;mesh.name='material-batch';root.add(mesh);}remove.forEach(o=>o.removeFromParent());
}

export function worldDisplay(){
 const texture=makeTexture(2048,1280,(c,w,h)=>{c.fillStyle='#051635';c.fillRect(0,0,w,h);});
 fetch('/assets/world-land.geojson').then(r=>{if(!r.ok)throw Error('Map unavailable');return r.json();}).then(data=>{
 const c=texture.image.getContext('2d'),w=2048,h=1280;c.fillStyle='#031533';c.fillRect(0,0,w,h);const glow=c.createRadialGradient(w*.53,h*.45,20,w*.53,h*.45,w*.65);glow.addColorStop(0,'#10396a');glow.addColorStop(1,'#031124');c.fillStyle=glow;c.fillRect(0,0,w,h);
 c.lineWidth=1;c.strokeStyle='#164575';for(let x=0;x<w;x+=80){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}for(let y=0;y<h;y+=80){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
 const proj=([lon,lat])=>[(lon+180)/360*(w-160)+80,(84-lat)/150*830+230];
 c.beginPath();for(const f of data.features){const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;for(const poly of polys){for(const ring of poly){ring.forEach((p,i)=>{const [x,y]=proj(p);i?c.lineTo(x,y):c.moveTo(x,y);});c.closePath();}}}c.fillStyle='#2c7db5';c.fill();c.strokeStyle='#7bd2f0';c.lineWidth=1.5;c.stroke();c.save();c.clip();c.fillStyle='#a3e0f2';for(let x=50;x<w;x+=9)for(let y=180;y<h;y+=9){c.fillRect(x,y,2,2);}c.restore();
 const nodes=[[-100,38],[-50,-18],[3,49],[53,24],[117,32],[136,36],[134,-25]];const origin=proj([117,32]);for(const n of nodes){const p=proj(n);c.strokeStyle='#78d4fd';c.lineWidth=2;c.beginPath();c.moveTo(...origin);c.quadraticCurveTo((origin[0]+p[0])/2,Math.min(p[1],origin[1])-140,...p);c.stroke();c.shadowBlur=16;c.shadowColor='#46baff';c.fillStyle='#fff';c.beginPath();c.arc(...p,6,0,7);c.fill();c.shadowBlur=0;}
 c.fillStyle='#edf9ff';c.font='600 62px Segoe UI';c.fillText('ONE SYSTEM. CONNECTED WORLD.',90,113);c.font='24px Segoe UI';c.fillStyle='#7cbdde';c.fillText('PISELL  /  GLOBAL DEPLOYMENT',93,164);c.fillText('MULTILINGUAL    ·    MULTICURRENCY    ·    MULTI-LOCATION',90,1177);texture.needsUpdate=true;
 }).catch(e=>console.warn('World display:',e.message));return texture;
}
