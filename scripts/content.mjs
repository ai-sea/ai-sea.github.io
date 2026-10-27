import { marked } from 'marked';
import sanitize from 'sanitize-html';
import {articleRenderer} from './rendering.mjs';
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
  if(p.cover!==undefined){
    if(typeof p.cover!=='string'||!/^\/images\/[a-zA-Z0-9/_-]+\.(?:png|jpe?g|webp)$/.test(p.cover)||p.cover.includes('..')||typeof p.coverAlt!=='string'||!p.coverAlt.trim())throw Error('Invalid cover: '+slug);
  }
  if(p.series!==undefined){
    const s=p.series;
    if(!s||typeof s!=='object'||Array.isArray(s)||typeof s.slug!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.slug)||typeof s.title!=='string'||!s.title.trim()||!Number.isSafeInteger(s.order)||s.order<0)throw Error('Invalid series: '+slug);
  }
  if(p.series?.label!==undefined&&(typeof p.series.label!=='string'||!p.series.label.trim()||p.series.label.length>40))throw Error('Invalid series label: '+slug);
  if(p.series?.order===0&&p.series.label!=='导言')throw Error('Order zero is reserved for the introduction: '+slug);
  const toc=[];
  let html=sanitize(marked.parse(match[2],{renderer:articleRenderer(toc)}),{allowedTags:sanitize.defaults.allowedTags.concat(['img']),allowedAttributes:{...sanitize.defaults.allowedAttributes,div:['class'],span:['class'],pre:['class','tabindex','aria-label'],code:['class'],h1:['id'],h2:['id'],h3:['id'],h4:['id'],h5:['id'],h6:['id'],img:['src','alt','title','width','height','loading']}});
  // 滚动容器保留原生表格语义，并支持键盘聚焦与横向阅读。
  html=html.replace(/<table>/g,'<div class="table-scroll" role="region" aria-label="表格，可横向滚动" tabindex="0"><table>').replace(/<\/table>/g,'</table></div>');
  return {...p,slug,html,toc,url:'/posts/'+slug+'/',cat:p.category,time:p.minutes,desc:p.description,body:[html]};
}
export function published(posts){
  const result=posts.filter(p=>!p.draft).sort((a,b)=>b.date.localeCompare(a.date));
  if(result.filter(p=>p.featured).length>1)throw Error('Only one featured post is allowed');
  return result;
}

/** 仅用已发布文章生成系列，按显式序号排序并拒绝冲突。 */
export function collectSeries(posts){
  const groups=new Map();
  for(const p of posts.filter(p=>!p.draft&&p.series)){
    const s=p.series;
    if(!groups.has(s.slug))groups.set(s.slug,{slug:s.slug,title:s.title,url:'/series/'+s.slug+'/',posts:[]});
    const group=groups.get(s.slug);
    if(group.title!==s.title)throw Error('Inconsistent series title: '+s.slug);
    if(group.posts.some(x=>x.series.order===s.order))throw Error('Duplicate series order: '+s.slug);
    group.posts.push(p);
  }
  return [...groups.values()].map(g=>({...g,posts:g.posts.sort((a,b)=>a.series.order-b.series.order)})).sort((a,b)=>a.title.localeCompare(b.title,'zh-CN'));
}

