import fs from 'node:fs';
import path from 'node:path';

// 构建后核对站内静态链接，避免系列目录或导航指向缺失页面。
const pages=fs.readdirSync('dist',{recursive:true}).filter(p=>p.endsWith('.html'));
let checked=0;
for(const page of pages){
 const html=fs.readFileSync(path.join('dist',page),'utf8');
 for(const match of html.matchAll(/href="(\/[a-zA-Z0-9_\-\/.]*)(?:#[^"]*)?"/g)){
  let target=path.join('dist',match[1]);
  if(match[1].endsWith('/'))target=path.join(target,'index.html');
  if(!fs.existsSync(target))throw Error(page+' missing '+match[1]);
  checked++;
 }
}
console.log(JSON.stringify({pages:pages.length,internalLinks:checked,status:'passed'}));
