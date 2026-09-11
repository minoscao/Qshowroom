import assert from 'node:assert/strict';
import * as THREE from 'three';
import {installExhibitDisplays,DISPLAY_CONFIG} from './exhibit-displays.js';
import {COUNTRY_PRESETS,getCountry} from './country-presets.js';
assert.deepEqual(COUNTRY_PRESETS.map(p=>p.label),['澳洲','迪拜','美国','日本']);
const architecture=new THREE.Group(),solids=[];
const materials=Object.fromEntries(['dark','metal','white','black','countertop'].map(k=>[k,new THREE.MeshStandardMaterial()]));
const ctx=new Proxy({},{get:()=>()=>{}});
const canvasTexture=(w,h,draw)=>{draw(ctx,w,h);const t=new THREE.Texture();t.image={getContext:()=>ctx};return t;};
const box=(w,h,d,x,y,z,m,p=architecture)=>{const a=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);a.position.set(x,y,z);p.add(a);return a;};
const cylinder=(a,b,h,x,y,z,m,p=architecture)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(a,b,h),m);o.position.set(x,y,z);p.add(o);return o;};
const planeTexture=(t,w,h,pos,rot=0,p=architecture)=>{const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}));o.position.copy(pos);o.rotation.y=rot;p.add(o);return o;};
const original=THREE.TextureLoader.prototype.load;THREE.TextureLoader.prototype.load=()=>new THREE.Texture();
try{const result=installExhibitDisplays({architecture,solids,box,cylinder,planeTexture,canvasTexture,materials});for(const t of [0,15,29,43,57])result.update(t);
 architecture.updateMatrixWorld(true);for(const cfg of DISPLAY_CONFIG){const obj=architecture.getObjectByName(cfg.id);assert.ok(obj);const bounds=new THREE.Box3().setFromObject(obj);assert.ok(Number.isFinite(bounds.min.x));assert.ok(bounds.min.y>1.7);}
 for(const p of COUNTRY_PRESETS){const texture=result.setCountry(p.id);assert.equal(result.windowScreen.material.map,texture);assert.deepEqual(texture.offset.toArray(),p.offset);assert.deepEqual(texture.repeat.toArray(),p.repeat);result.update(9999);assert.equal(result.windowScreen.material.map,texture);}
 assert.equal(getCountry('invalid').id,'au');assert.ok(architecture.getObjectByName('country-window-led'));assert.equal(solids.length,1);console.log('PASS: 5 display assemblies and four manually selected country textures, no automatic rotation.');
}finally{THREE.TextureLoader.prototype.load=original;}
