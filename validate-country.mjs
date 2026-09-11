import assert from 'node:assert/strict';
import {COUNTRY_PRESETS} from './country-presets.js';
const oldDpr=globalThis.devicePixelRatio,oldWidth=globalThis.innerWidth;
globalThis.devicePixelRatio=1;globalThis.innerWidth=1280;
const {worldDisplay}=await import('./visuals.js');
const calls=[];
const ctx=new Proxy({fillText:(text)=>calls.push(text),createRadialGradient:()=>({addColorStop(){}})},{get:(target,key)=>target[key]??(()=>{})});
const oldDocument=globalThis.document,oldFetch=globalThis.fetch;
let resolveMap;
globalThis.document={createElement:()=>({getContext:()=>ctx})};
globalThis.fetch=()=>new Promise(resolve=>{resolveMap=resolve;});
try{
 const texture=worldDisplay();
 texture.userData.setCountry(COUNTRY_PRESETS[0]);
 texture.userData.setCountry(COUNTRY_PRESETS[3]);
 resolveMap({ok:true,json:async()=>({features:[]})});
 await new Promise(resolve=>setImmediate(resolve));
 assert.ok(calls.includes(COUNTRY_PRESETS[3].headline),'Latest country survives delayed map load');
 for(const p of COUNTRY_PRESETS){calls.length=0;texture.userData.setCountry(p);assert.ok(calls.includes(p.headline));assert.ok(calls.includes(p.detail));assert.ok(calls.includes(p.name));assert.ok(p.entry&&p.exit);assert.match(p.image,/indoor-/);}
 console.log('PASS: four localized facade LED states, including switching before map finishes loading.');
}finally{globalThis.document=oldDocument;globalThis.fetch=oldFetch;globalThis.devicePixelRatio=oldDpr;globalThis.innerWidth=oldWidth;}
