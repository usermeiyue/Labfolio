import {readFile,writeFile,readdir,mkdir,copyFile,rm} from 'node:fs/promises';
const types={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',json:'application/json; charset=utf-8'};
const assets={};const files=(await readdir('web')).filter(f=>!f.startsWith('qa-'));
await rm('docs',{recursive:true,force:true});await mkdir('docs',{recursive:true});
for(const file of files){assets['/'+file]={body:await readFile('web/'+file,'utf8'),type:types[file.split('.').pop()]||'text/plain'};await copyFile('web/'+file,'docs/'+file);}
await writeFile('docs/.nojekyll','');
const backend=(await readFile('worker/method-template.js','utf8'))+'\n'+await readFile('worker/backend.js','utf8');
await writeFile('worker/index.js','const assets = '+JSON.stringify(assets)+';\n'+backend);
await mkdir('dist',{recursive:true});await copyFile('worker/index.js','dist/worker.js');
console.log('Built docs/ (static app) and dist/worker.js (optional protected backend). No environment values embedded.');
