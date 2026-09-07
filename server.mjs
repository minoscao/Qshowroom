import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const assets=path.resolve(root,'assets');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
http.createServer((req,res)=>{try{
const url=new URL(req.url,'http://localhost'); let name=decodeURIComponent(url.pathname); const base=name.startsWith('/assets/')?assets:name.startsWith('/vendor/')?path.join(root,'node_modules/three'):root;
if(name.startsWith('/assets/'))name=name.slice(8);else if(name.startsWith('/vendor/'))name=name.slice(8);else name=name==='/'?'index.html':name.slice(1);
const file=path.resolve(base,name);if(!file.startsWith(base+path.sep)){res.writeHead(403).end();return;}
if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end('Not found');return;}
res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(file).pipe(res);
}catch{res.writeHead(400).end('Bad request');}}).listen(43917,'127.0.0.1',()=>console.log('Showroom: http://127.0.0.1:43917'));
