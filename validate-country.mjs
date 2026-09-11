import assert from 'node:assert/strict';
import {COUNTRY_PRESETS} from './country-presets.js';
import {getScreenContent,createScreenContent} from './screen-content.js';
import {DISPLAY_CONFIG} from './exhibit-displays.js';
assert.equal(DISPLAY_CONFIG.find(d=>d.id==='cafe-menu').kind,'menu');
assert.equal(DISPLAY_CONFIG.find(d=>d.id==='cafe-pickup').kind,'pickup');
assert.equal(DISPLAY_CONFIG.find(d=>d.id==='ticket-prices').kind,'ticket');
assert.equal(DISPLAY_CONFIG.find(d=>d.id==='ticket-advert').kind,'advert');
for(const p of COUNTRY_PRESETS){assert.deepEqual(getScreenContent(p.id,'menu').rows,getScreenContent(p.id,'food').rows);assert.deepEqual(getScreenContent(p.id,'ticket').rows,getScreenContent(p.id,'ticketOrder').rows);}
const oldDpr=globalThis.devicePixelRatio,oldWidth=globalThis.innerWidth;
globalThis.devicePixelRatio=1;globalThis.innerWidth=1280;
const {worldDisplay}=await import('./visuals.js');
const calls=[];
const ctx=new Proxy({fillText:(text)=>calls.push(text),createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get:(target,key)=>target[key]??(()=>{})});
const oldDocument=globalThis.document,oldFetch=globalThis.fetch;
let resolveMap;
globalThis.document={createElement:()=>({getContext:()=>ctx})};
globalThis.fetch=()=>new Promise(resolve=>{resolveMap=resolve;});
try{
 const content=createScreenContent((w,h)=>({image:{width:w,height:h,getContext:()=>ctx}}));
 for(const kind of ['menu','pickup','ticket','advert','kitchen','food','ticketOrder','topup'])content.texture(kind);
 for(const p of COUNTRY_PRESETS){calls.length=0;content.setCountry(p.id);for(const kind of ['menu','pickup','ticket','advert','kitchen','food','ticketOrder','topup'])assert.ok(calls.includes(getScreenContent(p.id,kind).title));}
 console.log('PASS: all device/display roles localize; menu and ticket prices match across devices.');
 const texture=worldDisplay();
 texture.userData.setCountry(COUNTRY_PRESETS[0]);
 texture.userData.setCountry(COUNTRY_PRESETS[3]);
 resolveMap({ok:true,json:async()=>({features:[]})});
 await new Promise(resolve=>setImmediate(resolve));
 assert.ok(calls.includes(COUNTRY_PRESETS[3].headline),'Latest country survives delayed map load');
 for(const p of COUNTRY_PRESETS){calls.length=0;texture.userData.setCountry(p);assert.ok(calls.includes(p.headline));assert.ok(calls.includes(p.detail));assert.ok(calls.includes(p.name));assert.ok(p.entry&&p.exit);assert.match(p.image,/indoor-/);}
 console.log('PASS: four localized facade LED states, including switching before map finishes loading.');
}finally{globalThis.document=oldDocument;globalThis.fetch=oldFetch;globalThis.devicePixelRatio=oldDpr;globalThis.innerWidth=oldWidth;}
