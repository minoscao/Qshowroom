import fs from 'node:fs';
import {createRequire} from 'node:module';
import {createScreenContent} from '../screen-content.js';
const require=createRequire(import.meta.url),{createCanvas,ImageData}=require(process.argv[2]),sharp=require(process.argv[2]+'/../../sharp');
const images=new Map();for(const id of ['au','ae','us','jp'])for(const type of ['indoor','menu']){const name=type+'-'+id+'.png';const {data,info}=await sharp(fs.readFileSync(new URL(name,import.meta.url))).ensureAlpha().raw().toBuffer({resolveWithObject:true});const image=createCanvas(info.width,info.height);image.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(data),info.width,info.height),0,0);image.complete=true;image.naturalWidth=info.width;image.naturalHeight=info.height;images.set('/assets/'+name,image);}
const sheet=createCanvas(1920,1440),ctx=sheet.getContext('2d');
const content=createScreenContent((w,h)=>({image:createCanvas(w,h)}),{loadImage:path=>images.get(path)});
const kinds=['menu','ticket','advert'],textures=kinds.map(k=>content.texture(k));
await new Promise(resolve=>setTimeout(resolve,100));
for(const [i,id] of ['au','ae','us','jp'].entries()){content.setCountry(id);await new Promise(resolve=>setTimeout(resolve,100));content.setCountry(id);textures.forEach((t,j)=>ctx.drawImage(t.image,j*640,i*360,640,360));}
fs.writeFileSync(new URL('screen-preview.png',import.meta.url),sheet.toBuffer('image/png'));
