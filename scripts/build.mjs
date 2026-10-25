import fs from 'node:fs/promises';
import {parsePost,published,collectSeries,escapeHtml as esc} from './content.mjs';
import {articleSeries,seriesContents} from './series.mjs';
const config=JSON.parse(await fs.readFile('site.json','utf8'));
const origin=new URL(config.url).origin;
const files=(await fs.readdir('content/posts')).filter(f=>f.endsWith('.md'));
const posts=published(await Promise.all(files.map(async f=>parsePost(await fs.readFile('content/posts/'+f,'utf8'),f.slice(0,-3)))));
const series=collectSeries(posts);
await fs.rm('dist',{recursive:true,force:true});await fs.mkdir('dist',{recursive:true});
try{await fs.cp('public','dist',{recursive:true})}catch(e){if(e.code!=='ENOENT')throw e}
await fs.copyFile('src/style.css','dist/style.css');
const feature=posts.find(p=>p.featured)||posts[0];if(feature)feature.featured=true;
let home=await fs.readFile('src/index.html','utf8');
// Metadata enters HTML only after escaping. JSON uses Unicode escapes to prevent closing script tags.
const index=posts.map(p=>({...p,title:esc(p.title),desc:esc(p.desc),description:esc(p.description),date:p.date.replaceAll('-','.'),body:[p.html]}));
home=home.replace('__POSTS__',()=>JSON.stringify(index).replaceAll('<','\\u003c').replaceAll('>','\\u003e').replaceAll('&','\\u0026'));
home=home.replace('__COUNT__',String(Math.max(0,posts.length-1)).padStart(2,'0'));
if(feature)home=home.replace('__FEATURE_URL__',feature.url).replace('__FEATURE_TITLE__',esc(feature.title)).replace('__FEATURE_DESC__',esc(feature.description)).replace('__FEATURE_META__',`${feature.date.replaceAll('-','.')} &nbsp; · &nbsp; ${feature.minutes} 分钟阅读`);
else home=home.replace(/<a href="__FEATURE_URL__"[\s\S]*?<\/a>/,'');
home=home.replace('</head>',`<link rel="canonical" href="${origin}/"><link rel="alternate" type="application/rss+xml" title="AI 手记 RSS" href="/feed.xml"></head>`);
await fs.writeFile('dist/index.html',home);
for(const p of posts){
 const dir='dist/posts/'+p.slug;await fs.mkdir(dir,{recursive:true});
 const section=articleSeries(p,series);
 const article=`<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(p.title)} · ${esc(config.title)}</title><meta name="description" content="${esc(p.description)}"><link rel="canonical" href="${origin}${p.url}"><link rel="stylesheet" href="/style.css"></head><body><div class="shell"><header><a class="logo" href="/">${esc(config.title)}<small>${esc(config.subtitle)}</small></a><nav><a href="/#articles">全部文章</a><a href="/series/">系列</a><a href="/#archive">归档</a><a href="/feed.xml">RSS</a></nav></header><main class="article"><a class="meta" href="/#articles">← 返回文章列表</a><p class="tag" style="margin-top:32px">${esc(p.category)}</p><h1>${esc(p.title)}</h1><div class="meta">${p.date} · ${p.minutes} 分钟阅读</div>${section.intro}<div class="article-body">${p.html}</div>${section.navigation}<hr style="border:0;border-top:1px solid var(--line);margin:40px 0"><a href="/#articles">继续阅读其他文章 ↗</a></main><footer>© 2026 ${esc(config.title)} · ${esc(config.subtitle)}<a href="/feed.xml">订阅 RSS</a></footer></div></body></html>`;
 await fs.writeFile(dir+'/index.html',article);
}

/** 系列页面使用静态链接，直接访问与无脚本阅读均可用。 */
function seriesPage(title,description,body,path){
 return `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} · ${esc(config.title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${origin}${path}"><link rel="stylesheet" href="/style.css"></head><body><div class="shell"><header><a class="logo" href="/">${esc(config.title)}<small>${esc(config.subtitle)}</small></a><nav aria-label="主导航"><a href="/#articles">文章</a><a href="/series/" aria-current="page">系列</a><a href="/feed.xml">RSS</a></nav></header><main class="article"><a class="meta" href="/series/">← 全部系列</a><h1>${esc(title)}</h1><p class="muted">${esc(description)}</p>${body}</main><footer><a href="/">返回首页</a><a href="/feed.xml">订阅 RSS</a></footer></div></body></html>`;
}
await fs.mkdir('dist/series',{recursive:true});
await fs.writeFile('dist/series/index.html',seriesPage('文章系列','围绕一个主题，按顺序记录思考与实践。',series.length?'<div class="series-grid">'+series.map(g=>'<a class="series-card" href="'+g.url+'"><span class="tag">系列 · 已发布 '+g.posts.length+' 篇</span><h2>'+esc(g.title)+'</h2><p>查看系列目录 →</p></a>').join('')+'</div>':'<p>新的系列正在准备中。</p>','/series/'));
for(const group of series){
 await fs.mkdir('dist/series/'+group.slug,{recursive:true});
 await fs.writeFile('dist/series/'+group.slug+'/index.html',seriesPage(group.title,'已发布 '+group.posts.length+' 篇 · 按篇目顺序阅读，后续持续更新。',seriesContents(group),group.url));
}
await fs.writeFile('dist/feed.xml',`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(config.title)}</title><link>${origin}/</link><description>${esc(config.description)}</description><language>zh-CN</language>${posts.map(p=>`<item><title>${esc(p.title)}</title><link>${origin}${p.url}</link><guid>${origin}${p.url}</guid><pubDate>${new Date(p.date+'T00:00:00+08:00').toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`).join('')}</channel></rss>`);
await fs.writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url>${[{url:"/series/",date:posts[0]?.date},...series.map(g=>({url:g.url,date:g.posts.map(p=>p.date).sort().at(-1)})),...posts].map(p=>`<url><loc>${origin}${p.url}</loc><lastmod>${p.date}</lastmod></url>`).join('')}</urlset>`);
await fs.writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
await fs.writeFile('dist/404.html',`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>页面未找到 · AI 手记</title><link rel="stylesheet" href="/style.css"><main class="shell article"><h1>这篇技术笔记还没有写下。</h1><p>文章可能已移动或删除。</p><a href="/">返回AI 手记首页 →</a></main></html>`);
await fs.writeFile('dist/.nojekyll','');
console.log(`Built ${posts.length} articles at ${origin}`);

