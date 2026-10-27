import {Renderer} from 'marked';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import xml from 'highlight.js/lib/languages/xml';
import sql from 'highlight.js/lib/languages/sql';

for(const [name,grammar] of Object.entries({javascript,typescript,python,json,bash,css,xml,sql}))hljs.registerLanguage(name,grammar);
/** 伪代码只标记控制词、调用、字面量与注释，不表示可执行语言。 */
hljs.registerLanguage('pseudocode',h=>({
 name:'Pseudocode',aliases:['pseudo'],
 keywords:{keyword:'function try catch for in if else while continue return break',literal:'true false null',built_in:'Completed Failed BudgetExceeded'},
 contains:[h.QUOTE_STRING_MODE,h.APOS_STRING_MODE,h.C_LINE_COMMENT_MODE,h.HASH_COMMENT_MODE,h.NUMBER_MODE,{scope:'title.function',match:/[A-Za-z_]\w*(?=\s*\()/}]
}));
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={pseudocode:'伪代码',pseudo:'伪代码',plaintext:'纯文本',text:'纯文本',txt:'纯文本',javascript:'JavaScript',js:'JavaScript',typescript:'TypeScript',ts:'TypeScript',python:'Python',py:'Python',json:'JSON',bash:'Shell',sh:'Shell',shell:'Shell',css:'CSS',xml:'HTML / XML',html:'HTML / XML',sql:'SQL'};

/** 每篇创建独立渲染器，目录锚点稳定且不污染其他文章。 */
export function articleRenderer(toc){
 const renderer=new Renderer();
 let headingIndex=0;
 renderer.heading=function({tokens,depth,text}){
  const id='section-'+(++headingIndex);
  if(depth===2||depth===3)toc.push({id,depth,title:text.replace(/[`*_]/g,'')});
  return '<h'+depth+' id="'+id+'">'+this.parser.parseInline(tokens)+'</h'+depth+'>\n';
 };
 renderer.code=function({text,lang}){
  const requested=(lang||'text').trim().split(/\s+/)[0].toLowerCase();
  const language=/^[a-z0-9_-]+$/.test(requested)&&hljs.getLanguage(requested)?requested:'plaintext';
  const label=labels[language]||labels[requested]||'纯文本';
  const html=language==='plaintext'?escape(text):hljs.highlight(text,{language,ignoreIllegals:true}).value;
  return '<div class="code-block"><div class="code-toolbar"><span class="code-language">'+label+'</span></div><pre tabindex="0" aria-label="'+label+'代码块"><code class="hljs language-'+language+'">'+html+'\n</code></pre></div>\n';
 };
 return renderer;
}

/** 目录在构建时生成，无脚本也能展开并访问章节锚点。 */
export function articleToc(toc){
 if(toc.length<2)return '';
 return '<details class="article-toc" data-article-toc><summary>本页目录</summary><nav aria-label="本页目录"><ol>'+toc.map(item=>'<li class="toc-depth-'+item.depth+'"><a href="#'+item.id+'">'+escape(item.title)+'</a></li>').join('')+'</ol></nav></details>';
}

