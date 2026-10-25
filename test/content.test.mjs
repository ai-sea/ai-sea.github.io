import {test} from 'node:test';import assert from 'node:assert/strict';import {parsePost,published} from '../scripts/content.mjs';
const meta={title:'标题',category:'实践记录',date:'2026-10-24',description:'介绍',minutes:2,featured:false,draft:false};
const post=(m=meta,body='## 小标题\n\n**正文**')=>parsePost('---\n'+JSON.stringify(m)+'\n---\n'+body,'example');

test('封面只接受站内图片路径并要求替代文字',()=>{
 assert.equal(post({...meta,cover:'/images/bots/cover.png',coverAlt:'封面'}).cover,'/images/bots/cover.png');
 for(const cover of ['https://example.com/a.png','/images/../secret.png','javascript:alert(1)','/images/cover.svg'])assert.throws(()=>post({...meta,cover,coverAlt:'封面'}));
 assert.throws(()=>post({...meta,cover:'/images/cover.png'}));
 assert.equal(post().cover,undefined);
});
test('Markdown headings and emphasis render',()=>{const p=post();assert.match(p.html,/<h2>小标题<\/h2>/);assert.match(p.html,/<strong>正文<\/strong>/);assert.equal(p.url,'/posts/example/')});
test('Script and event handlers are removed',()=>{const p=post(meta,'<script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">bad</a>');assert.doesNotMatch(p.html,/script|onerror|javascript:/i)});
test('Drafts excluded and newest first',()=>{const list=published([post({...meta,date:'2026-01-01'}),post({...meta,draft:true}),post(meta)]);assert.equal(list.length,2);assert.equal(list[0].date,'2026-10-24')});
test('Malformed metadata and multiple featured articles fail builds',()=>{assert.throws(()=>post({...meta,draft:'false'}));assert.throws(()=>post({...meta,date:'bad'}));assert.throws(()=>published([post({...meta,featured:true}),post({...meta,featured:true})]))});

