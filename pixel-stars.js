'use strict';

window.observatoryStars = (() => {
 const core=['...+...','...#...','..###..','+##@##+','..###..','...#...','...+...'];
 const colors={'+':'#9cb3e6','#':'#ead7ac','@':'#fff8dd'};
 const companionPositions=[[12,3],[2,2],[12,10]];
 function markup(count=0){
  return `<canvas class="pixel-star" width="15" height="13" data-pixel-star="${count}" aria-hidden="true"></canvas>`;
 }
 function draw(canvas,count){
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,15,13);
  core.forEach((row,y)=>[...row].forEach((pixel,x)=>{
   if(pixel==='.')return;
   ctx.fillStyle=colors[pixel];ctx.fillRect(4+x,3+y,1,1);
  }));
  companionPositions.slice(0,count).forEach(([x,y])=>{
   ctx.fillStyle='#7993ca';
   ctx.fillRect(x-1,y,3,1);ctx.fillRect(x,y-1,1,3);
   ctx.fillStyle='#f5e3bd';ctx.fillRect(x,y,1,1);
  });
 }
 function paint(root){
  root.querySelectorAll('[data-pixel-star]').forEach(canvas=>draw(canvas,Number(canvas.dataset.pixelStar)));
 }
 return {markup,paint,draw};
})();
