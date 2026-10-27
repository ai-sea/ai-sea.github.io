import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parsePost} from '../scripts/content.mjs';
import {articleToc} from '../scripts/rendering.mjs';

const meta={title:'测试文章',category:'技术解析',date:'2026-10-28',description:'阅读页检查',minutes:2,featured:false,draft:false};
const post=body=>parsePost('---\n'+JSON.stringify(meta)+'\n---\n'+body,'reading');

test('代码高亮保留关键字与字符串，未知语言和执行日志保持纯文本',()=>{
 const p=post('```pseudocode\nif output.kind == "final":\n    return Completed(output.text)\n```');
 assert.match(p.html,/hljs-keyword/);
 assert.match(p.html,/hljs-string/);
 assert.match(p.html,/伪代码/);
 assert.match(p.html,/tabindex="0"/);
 assert.match(post('```javascript\nconst value = 3;\n```').html,/hljs-keyword/);
 for(const language of ['unknown','text']){
  const html=post('```'+language+'\nif final return\n```').html;
  assert.match(html,/纯文本/);
  assert.doesNotMatch(html,/hljs-keyword/);
 }
});

test('代码内容只显示文字，目录与表格保持语义和锚点关联',()=>{
 const p=post('## 相同标题\n\n### 相同标题\n\n| 阶段 | 说明 |\n| --- | --- |\n| 输入 | 处理 |\n\n```html\n<img src=x onerror=alert(1)>\n<script>alert(1)</script>\n```');
 assert.equal(new Set(p.toc.map(x=>x.id)).size,2);
 for(const item of p.toc)assert.ok(p.html.includes('id="'+item.id+'"'));
 assert.match(articleToc(p.toc),/本页目录/);
 assert.match(p.html,/class="table-scroll" role="region"/);
 assert.match(p.html,/<table>/);
 assert.match(p.html,/<thead>/);
 assert.doesNotMatch(p.html,/<script>|<img/);
 assert.equal(articleToc([]),'');
 assert.doesNotMatch(articleToc([{id:'section-1',depth:2,title:'<script>'},{id:'section-2',depth:3,title:'下一节'}]),/<script>/);
});
