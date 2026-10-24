import {test} from 'node:test';import assert from 'node:assert/strict';import {parsePost,published} from '../scripts/content.mjs';
const meta={title:'标题',category:'生活切片',date:'2026-10-24',description:'介绍',minutes:2,featured:false,draft:false};
const post=(m=meta,body='## 小标题\n\n**正文**')=>parsePost('---\n'+JSON.stringify(m)+'\n---\n'+body,'example');
test('Markdown headings and emphasis render',()=>{const p=post();assert.match(p.html,/<h2>小标题<\/h2>/);assert.match(p.html,/<strong>正文<\/strong>/);assert.equal(p.url,'/posts/example/')});
test('Script and event handlers are removed',()=>{const p=post(meta,'<script>alert(1)</script><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">bad</a>');assert.doesNotMatch(p.html,/script|onerror|javascript:/i)});
test('Drafts excluded and newest first',()=>{const list=published([post({...meta,date:'2026-01-01'}),post({...meta,draft:true}),post(meta)]);assert.equal(list.length,2);assert.equal(list[0].date,'2026-10-24')});
test('Malformed metadata and multiple featured articles fail builds',()=>{assert.throws(()=>post({...meta,draft:'false'}));assert.throws(()=>post({...meta,date:'bad'}));assert.throws(()=>published([post({...meta,featured:true}),post({...meta,featured:true})]))});
