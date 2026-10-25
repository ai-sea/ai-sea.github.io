import {escapeHtml as esc} from './content.mjs';

/** 渲染系列目录，当前文章以语义属性标识。 */
export function seriesContents(group,currentSlug){
  return '<ol class="series-list">'+group.posts.map(p=>'<li><a href="'+p.url+'"'+(p.slug===currentSlug?' aria-current="page"':'')+'><span class="meta">第 '+p.series.order+' 篇</span><strong>'+esc(p.title)+'</strong></a></li>').join('')+'</ol>';
}

/** 在文章中提供系列入口、可展开目录与前后篇导航。 */
export function articleSeries(post,groups){
  if(!post.series)return {intro:'',navigation:''};
  const group=groups.find(g=>g.slug===post.series.slug);
  const i=group.posts.findIndex(p=>p.slug===post.slug),previous=group.posts[i-1],next=group.posts[i+1];
  return {
    intro:'<aside class="series-panel" aria-label="所属系列"><a class="series-heading" href="'+group.url+'">'+esc(group.title)+' ↗</a><p class="meta">第 '+post.series.order+' 篇 · 已发布 '+group.posts.length+' 篇</p><details><summary>查看系列目录</summary>'+seriesContents(group,post.slug)+'</details></aside>',
    navigation:'<nav class="series-navigation" aria-label="系列前后篇">'+(previous?'<a href="'+previous.url+'"><span class="meta">← 上一篇</span><strong>'+esc(previous.title)+'</strong></a>':'<span class="muted">这是本系列的开篇</span>')+(next?'<a href="'+next.url+'"><span class="meta">下一篇 →</span><strong>'+esc(next.title)+'</strong></a>':'<span class="muted">后续篇目陆续更新</span>')+'</nav>'
  };
}

