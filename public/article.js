/** 目录保留原生锚点与折叠行为；脚本补充当前位置与屏幕适配。 */
const toc=document.querySelector('[data-article-toc]');
if(toc){
 const links=[...toc.querySelectorAll('a[href^="#"]')];
 const entries=links.map(link=>({link,heading:document.getElementById(link.hash.slice(1))})).filter(e=>e.heading);
 const wide=matchMedia('(min-width:1500px)');
 const adapt=()=>{toc.open=wide.matches;};
 adapt();
 wide.addEventListener('change',adapt);
 let queued=false;
 const update=()=>{
  queued=false;
  let current=null;
  for(const entry of entries){if(entry.heading.getBoundingClientRect().top<=140)current=entry;}
  for(const entry of entries){
   if(entry===current)entry.link.setAttribute('aria-current','location');
   else entry.link.removeAttribute('aria-current');
  }
 };
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});
 addEventListener('resize',update,{passive:true});
 toc.addEventListener('click',event=>{
  if(!event.target.closest('a[href^="#"]'))return;
  if(!wide.matches){toc.open=false;toc.querySelector('summary').focus({preventScroll:true});}
  requestAnimationFrame(update);
 });
 toc.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&toc.open){toc.open=false;toc.querySelector('summary').focus();}
 });
 update();
}

