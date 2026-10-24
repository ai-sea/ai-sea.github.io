import { marked } from 'marked';
import sanitize from 'sanitize-html';
export const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function parsePost(source,slug){
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw Error('Invalid filename: '+slug);
  const match=source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if(!match)throw Error('Missing front matter: '+slug);
  const p=JSON.parse(match[1]);
  for(const field of ['title','category','date','description'])if(typeof p[field]!=='string'||!p[field].trim())throw Error('Invalid '+field+': '+slug);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||Number.isNaN(Date.parse(p.date)))throw Error('Invalid date: '+slug);
  if(!['实践记录','技术解析','思考随笔'].includes(p.category))throw Error('Unknown category: '+slug);
  if(typeof p.draft!=='boolean'||typeof p.featured!=='boolean')throw Error('draft and featured must be booleans: '+slug);
  if(!Number.isInteger(p.minutes)||p.minutes<1)throw Error('Invalid minutes: '+slug);
  const html=sanitize(marked.parse(match[2]),{allowedTags:sanitize.defaults.allowedTags.concat(['img']),allowedAttributes:{...sanitize.defaults.allowedAttributes,img:['src','alt','title','width','height','loading']}});
  return {...p,slug,html,url:'/posts/'+slug+'/',cat:p.category,time:p.minutes,desc:p.description,body:[html]};
}
export function published(posts){
  const result=posts.filter(p=>!p.draft).sort((a,b)=>b.date.localeCompare(a.date));
  if(result.filter(p=>p.featured).length>1)throw Error('Only one featured post is allowed');
  return result;
}
