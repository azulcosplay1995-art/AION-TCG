// === Ensamblador AION TCG (sin build, solo Node) ===
// Une los módulos de js/ (en orden alfabético) dentro de shell.html y produce
// el HTML de un solo archivo "../AION TCG.html". Uso: node assemble.js
const fs=require('fs');const path=require('path');
const HERE=__dirname;
const OUT=path.join(HERE,'..','AION TCG.html');
const shell=fs.readFileSync(path.join(HERE,'shell.html'),'utf8');
const jsdir=path.join(HERE,'js');
const files=fs.readdirSync(jsdir).filter(f=>f.endsWith('.js')).sort();
const joined=files.map(f=>fs.readFileSync(path.join(jsdir,f),'utf8')).join('');
try{new Function(joined);}catch(e){console.error('JS ERROR en los modulos:',e.message);process.exit(1);}
const out=shell.replace('/*__AION_APP_JS__*/',function(){return joined;}); // funcion: evita interpretar $ del JS
let ok=false;for(let i=0;i<12&&!ok;i++){try{fs.writeFileSync(OUT,out,'utf8');if(fs.readFileSync(OUT,'utf8').length===out.length)ok=true;}catch(e){}}
console.log(ok?('OK -> '+OUT+'  ('+out.length+' bytes, '+files.length+' modulos)'):'FALLO de escritura');
