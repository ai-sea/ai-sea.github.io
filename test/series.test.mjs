import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parsePost,collectSeries} from '../scripts/content.mjs';
import {articleSeries,seriesContents} from '../scripts/series.mjs';

const meta={title:'标题',category:'实践记录',date:'2026-10-25',description:'介绍',minutes:2,featured:false,draft:false};
const post=(slug,order,extra={})=>parsePost('---\n'+JSON.stringify({...meta,...(order===undefined?{}:{series:{slug:'bots',title:'Bots',order}}),...extra})+'\n---\n正文',slug);

test('系列按序号排列，草稿不进入目录或导航，独立文章仍可读取',()=>{
 const first=post('first',1),last=post('last',3,{date:'2026-01-01'});
 const groups=collectSeries([last,post('draft',2,{draft:true}),first,post('standalone')]);
 assert.deepEqual(groups[0].posts.map(p=>p.slug),['first','last']);
 assert.doesNotMatch(seriesContents(groups[0]),/draft/);
 assert.match(articleSeries(first,groups).navigation,/下一篇/);
 assert.match(articleSeries(first,groups).navigation,/\/posts\/last\//);
 assert.match(articleSeries(last,groups).navigation,/\/posts\/first\//);
 assert.deepEqual(articleSeries(post('standalone'),groups),{intro:'',navigation:''});
});

test('单篇系列不创建不存在的链接，当前篇与折叠目录可辨识',()=>{
 const first=post('first',1),groups=collectSeries([first]);
 const section=articleSeries(first,groups);
 assert.match(section.intro,/<details>/);
 assert.match(section.intro,/aria-current="page"/);
 assert.match(section.navigation,/开篇/);
 assert.match(section.navigation,/陆续更新/);
 assert.doesNotMatch(section.navigation,/<a /);
});

test('拒绝无效系列、重复顺序与不一致名称',()=>{
 for(const series of [null,{},[],{slug:'../bad',title:'Bots',order:1},{slug:'bots',title:'',order:1},{slug:'bots',title:'Bots',order:0},{slug:'bots',title:'Bots',order:1.5}])assert.throws(()=>post('invalid',1,{series}));
 assert.throws(()=>collectSeries([post('one',1),post('two',1)]),/Duplicate/);
 assert.throws(()=>collectSeries([post('one',1),post('two',2,{series:{slug:'bots',title:'其他名称',order:2}})]),/Inconsistent/);
 assert.deepEqual(collectSeries([post('draft',1,{draft:true})]),[]);
});

test('系列文字转义以免插入 HTML',()=>{
 const p=post('first',1,{title:'<img src=x>',series:{slug:'bots',title:'<script>bad</script>',order:1}});
 const section=articleSeries(p,collectSeries([p]));
 assert.doesNotMatch(section.intro,/<script>|<img/);
 assert.match(section.intro,/&lt;script&gt;/);
});
