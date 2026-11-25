'use strict';

window.observatoryOrrery=(()=>{
 const center=[160,72];
 const radii={earth:91,moon:46};
 const names={earth:'地球',moon:'月'};
 const initial={earth:21,moon:-52};
 const flatten={earth:.43,moon:.56};
 const sunRadius=18,moonRadius=22;
 const totalOffset=moonRadius-sunRadius;
 function position(planet,angle,origin=center){
  const rad=angle*Math.PI/180;
  return [origin[0]+Math.cos(rad)*radii[planet],origin[1]+Math.sin(rad)*radii[planet]*flatten[planet]];
 }
 function markup(){
  return `<div class="orrery-panel">
   <div class="orrery-model">
    <canvas class="orrery-diagram" width="320" height="144" aria-hidden="true"></canvas>
    <span class="orrery-sun" aria-hidden="true"></span>
    ${Object.entries(names).map(([planet,name])=>`<button type="button" class="orrery-body" data-orbit-body="${planet}" aria-label="${name}を軌道上で動かす" role="slider" aria-valuemin="0" aria-valuemax="359"><i aria-hidden="true"></i><span>${name}</span></button>`).join('')}
   </div>
   <p class="orrery-guide">地球と月を軌道に沿って動かし、地球からの見え方を確かめる。</p>
   <div class="orrery-observer">
    <div class="eclipse-view" aria-hidden="true"><i class="eclipse-sun"></i><i class="eclipse-moon"></i></div>
    <div><b>地球からの観測窓</b><p id="orbitStatus" aria-live="polite"></p></div>
    <button class="btn primary" id="orbitCheck" type="button">観測する</button>
   </div>
  </div>`;
 }
 function start(root,state,{save,tap,win,reward}){
  const panel=root.querySelector('.orrery-panel');
  const board=panel.querySelector('.orrery-model');
  const ctx=panel.querySelector('canvas').getContext('2d');
  const status=panel.querySelector('#orbitStatus');
  const bodies=[...board.querySelectorAll('[data-orbit-body]')];
  const angles=Object.fromEntries(Object.keys(radii).map(planet=>[
   planet,Number.isFinite(state.orreryAngles?.[planet])?state.orreryAngles[planet]:initial[planet]
  ]));
  let total=false,finished=false;
  let lastPhase='';
  function display(){
   const earth=position('earth',angles.earth),moon=position('moon',angles.moon,earth);
   const star=[center[0]-earth[0],center[1]-earth[1]];
   const satellite=[moon[0]-earth[0],moon[1]-earth[1]];
   // The Moon can cover the Sun only when their directions from Earth nearly coincide.
   const separation=Math.atan2(star[0]*satellite[1]-star[1]*satellite[0],star[0]*satellite[0]+star[1]*satellite[1]);
   const offset=separation*112;
   const moonInFront=star[0]*satellite[0]+star[1]*satellite[1]>0&&Math.hypot(...satellite)<Math.hypot(...star);
   total=moonInFront&&Math.abs(offset)<=totalOffset;
   const partial=moonInFront&&Math.abs(offset)<sunRadius+moonRadius;
   const phase=total?'total':partial?'partial':'clear';
   panel.dataset.eclipse=phase;
   panel.style.setProperty('--eclipse-offset',(moonInFront?Math.max(-68,Math.min(68,total?0:offset)):68)+'px');
   if(phase!==lastPhase){
    status.textContent=total?'コロナが見えた。':partial?'太陽に月が重なり始めた。':'太陽が見えている。';
    lastPhase=phase;
   }
   ctx.clearRect(0,0,320,144);
   ctx.strokeStyle='#9694bd78';
   ctx.setLineDash([2,3]);
   for(const [planet,radius] of Object.entries(radii)){
    ctx.beginPath();ctx.ellipse(...(planet==='earth'?center:earth),radius,radius*flatten[planet],0,0,Math.PI*2);ctx.stroke();
   }
   ctx.setLineDash([]);
   const dx=moon[0]-center[0],dy=moon[1]-center[1],length=Math.hypot(dx,dy);
   const ux=dx/length,uy=dy/length;
   ctx.fillStyle=total?'#151729d9':'#16162f82';
   ctx.beginPath();
   ctx.moveTo(moon[0]-uy*6,moon[1]+ux*6);
   ctx.lineTo(moon[0]+ux*114-uy*2,moon[1]+uy*114+ux*2);
   ctx.lineTo(moon[0]+ux*114+uy*2,moon[1]+uy*114-ux*2);
   ctx.lineTo(moon[0]+uy*6,moon[1]-ux*6);
   ctx.closePath();ctx.fill();
   for(const body of bodies){
    const planet=body.dataset.orbitBody;
    const [x,y]=planet==='earth'?earth:moon;
    body.style.left=x/3.2+'%';
    body.style.top=y/1.44+'%';
    body.setAttribute('aria-valuenow',String(Math.round((angles[planet]+360)%360)%360));
   }
  }
  function store(){
   state.orreryAngles={...angles};
   save();
  }
  for(const body of bodies){
   const planet=body.dataset.orbitBody;
   let pointer=null;
   body.onpointerdown=event=>{
    if(finished||!event.isPrimary||event.button!==0)return;
    pointer=event.pointerId;
    body.setPointerCapture(pointer);
   };
   body.onpointermove=event=>{
    if(pointer!==event.pointerId||finished)return;
    const bounds=board.getBoundingClientRect();
    const origin=planet==='earth'?center:position('earth',angles.earth);
    const x=(event.clientX-bounds.left)*320/bounds.width-origin[0];
    const y=((event.clientY-bounds.top)*144/bounds.height-origin[1])/flatten[planet];
    if(Math.hypot(x,y)>12){
     angles[planet]=Math.atan2(y,x)*180/Math.PI;
     display();
    }
   };
   body.onlostpointercapture=()=>{if(pointer!==null){pointer=null;store()}};
   body.onkeydown=event=>{
    if(finished||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();
    angles[planet]=(angles[planet]+(['ArrowLeft','ArrowUp'].includes(event.key)?-4:4)+360)%360;
    display();store();tap();
   };
  }
  panel.querySelector('#orbitCheck').onclick=()=>{
   if(finished)return;
   if(!total){status.textContent='太陽が月に隠れる場所を探そう。';return}
   finished=true;win();tap();
   panel.classList.add('eclipse-complete');
   panel.querySelector('#orbitCheck').disabled=true;
   setTimeout(()=>{if(panel.isConnected)reward()},matchMedia('(prefers-reduced-motion: reduce)').matches?220:730);
  };
  display();
 }
 return {markup,start};
})();
