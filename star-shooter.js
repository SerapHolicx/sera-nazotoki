'use strict';

window.observatoryShooter=(()=>{
 const width=192,height=120,shipY=105;
 const bossTime=11.5,runLimit=25;
 const stars=Array.from({length:44},(_,i)=>[i*53%width,i*29%height,8+i%5*3]);
 const route=[24,145,76,164,42,106,64,128,22,161,91,42];
 let losses=0;
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
 function screenMarkup(mode){
  if(mode==='demo')return `<video id="tvShooterDemo" muted loop playsinline preload="metadata" poster="tv/star-dust.png" aria-label="星屑シューティングの映像"><source src="tv/star-dust.mp4" type="video/mp4"></video>`;
  return `<div class="tv-shooter" id="tvShooter" tabindex="0" aria-label="星屑シューティング。指で左右に移動。キーボードは左右矢印。">
   <canvas width="${width}" height="${height}" aria-hidden="true"></canvas>
   <span class="tv-shooter-label" aria-hidden="true">STAR DUST</span>
   <span class="tv-shooter-caption" role="status"></span>
  </div>`;
 }
 function controlsMarkup(){
  return '<p id="tvScore" aria-live="polite"></p><p id="tvShootingHelp">左右にスライド。金色の星を続けて撃つと、4連続でショットが広がる。紫の岩は避けよう。</p><div class="buttons" id="tvRetry" hidden><button class="btn primary" id="retryShooting">もう一度遊ぶ</button><button class="btn" id="leaveStarShooter">テレビに戻る</button></div>';
 }
 function start(root,{hit,miss,retry,leave,won,reward}){
  const field=root.querySelector('#tvShooter');
  const ctx=field.querySelector('canvas').getContext('2d');
  const caption=field.querySelector('.tv-shooter-caption');
  const score=root.querySelector('#tvScore');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const assisted=losses>=2;
  const maxHealth=assisted?6:4;
  const hostiles=[],bullets=[],sparks=[];
  const keys=new Set();
  let x=width/2,health=maxHealth,points=0,elapsed=0;
  let chain=0,chainUntil=0,spreadUntil=0;
  let phase='ready',last=performance.now(),readyUntil=last+600;
  let nextShot=0,nextSpawn=.15,spawn=0,protectedUntil=0,pointer=null,frame,rewardTimer;

  function fill(color,l,t,w,h){ctx.fillStyle=color;ctx.fillRect(Math.round(l),Math.round(t),w,h)}
  function glint(px,py,r,bright='#ffe9b0'){
   fill('#bb8f68',px-r,py-1,r*2+1,3);fill('#bb8f68',px-1,py-r,3,r*2+1);
   fill(bright,px-r+2,py,r*2-3,1);fill(bright,px,py-r+2,1,r*2-3);fill(bright,px-2,py-2,5,5);
   fill('#fffde0',px-1,py-1,3,3);
  }
  function scatter(px,py,color,count){
   for(let i=0;i<count;i++){
    const a=i*2.4, speed=12+i%4*14;
    sparks.push({x:px,y:py,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:.38+i%3*.09,color});
   }
  }
  function updateScore(status=''){
   score.textContent=`SCORE ${String(points).padStart(4,'0')}　機体 ${health} / ${maxHealth}${assisted?'　やさしいモード':''}${chain>1?'　'+chain+'連続':''}${elapsed<spreadUntil?'　3方向ショット':''}${status?'　'+status:''}`;
  }
  function finish(success){
   phase=success?'clear':'over';
   field.dataset.phase=phase;
   caption.textContent=success?'CLEAR':'RETRY';
   if(success){
    return;
   }
   losses++;
   updateScore(losses===2?'次はやさしいモード':'');
   root.querySelector('#tvRetry').hidden=false;
   root.querySelector('#retryShooting').focus({preventScroll:true});
  }
  function addEnemy(){
   if(elapsed>=bossTime)return;
   const rock=spawn%3===1;
   const position=route[spawn%route.length];
   hostiles.push({type:rock?'rock':'star',base:position,x:position,y:-8,drift:spawn%2?12:0,phase:spawn,r:rock?6:7,hp:1});
   if(!rock&&spawn%4===0){
    const wing=position+(position<width/2?27:-27);
    hostiles.push({type:'star',base:wing,x:wing,y:-22,drift:8,phase:spawn+1,r:6,hp:1});
   }
   spawn++;
  }
  function step(dt){
   const wasSpread=elapsed<spreadUntil;
   elapsed+=dt;
   if(chain&&elapsed>=chainUntil){chain=0;updateScore()}
   else if(wasSpread&&elapsed>=spreadUntil)updateScore();
   if(keys.size)x=clamp(x+((keys.has('ArrowRight')?1:0)-(keys.has('ArrowLeft')?1:0))*84*dt,8,width-8);
   if(elapsed>=nextShot){
    bullets.push({x,y:shipY-8,vx:0});
    if(elapsed<spreadUntil){
     bullets.push({x:x-3,y:shipY-8,vx:-24},{x:x+3,y:shipY-8,vx:24});
    }
    nextShot=elapsed+.23;
   }
   if(elapsed>=nextSpawn){
    addEnemy();
    nextSpawn=elapsed+Math.max(.48,.91-elapsed*.026)+(assisted?.13:0);
   }
   if(elapsed>=bossTime&&elapsed-dt<bossTime){
    // Clear the approach so the player can concentrate on the large star.
    hostiles.length=0;
    hostiles.push({type:'boss',x:width/2,y:-15,r:17,hp:assisted?4:6});
    updateScore('大きな星が近づいてきた');
   }
   for(const o of hostiles){
    if(o.type==='boss'){
     o.y=Math.min(35,o.y+32*dt);
     o.x=width/2+Math.sin((elapsed-bossTime)*1.32)*(assisted?22:35);
    }else{
     o.y+=(31+elapsed*1.15+(o.type==='rock'?2:0))*(assisted?.86:1)*dt;
     o.x=o.base+Math.sin(elapsed*2+o.phase)*o.drift;
    }
   }
   for(const b of bullets){
    b.y-=111*dt;
    b.x+=b.vx*dt;
    for(const o of hostiles){
     if(o.dead||o.type==='rock'||Math.abs(o.x-b.x)>o.r||Math.abs(o.y-b.y)>o.r)continue;
     b.y=-20;hit();
     scatter(b.x,o.y,'#fbe7b2',4);
     if(--o.hp===0){
      o.dead=true;
      if(o.type==='boss')points+=500;
      else{
       chain++;chainUntil=elapsed+2.3;
       points+=100+Math.min(chain-1,4)*25;
       if(chain%4===0)spreadUntil=elapsed+3.1;
      }
      scatter(o.x,o.y,'#fbe7b2',o.type==='boss'?22:10);
      updateScore();
      if(o.type==='boss'){
       won();finish(true);
       rewardTimer=setTimeout(()=>{if(field.isConnected)reward()},reduced?280:780);
       return;
      }
     }
     break;
    }
   }
   for(const o of hostiles){
    if(o.type!=='rock'||o.dead||Math.abs(o.x-x)>10||Math.abs(shipY-o.y)>9||elapsed<protectedUntil)continue;
    o.dead=true;protectedUntil=elapsed+1.05;health--;chain=0;miss();updateScore('被弾');
    scatter(x,shipY,'#efa6b8',9);
    if(health===0){finish(false);return}
   }
   for(let i=bullets.length-1;i>=0;i--)if(bullets[i].y<0)bullets.splice(i,1);
   for(let i=hostiles.length-1;i>=0;i--)if(hostiles[i].dead||hostiles[i].y>height+12)hostiles.splice(i,1);
   if(elapsed>=runLimit)finish(false);
  }
  function render(dt){
   fill('#17172f',0,0,width,height);
   for(const [sx,sy,speed] of stars){
    const y=(sy+elapsed*speed)%height;
    fill(speed>14?'#967cae':'#4a456e',sx,y,1,speed>15?2:1);
   }
   for(const b of bullets)fill(b.vx?'#ffcf88':'#bee9ff',b.x,b.y,1,5);
   for(const o of hostiles){
    if(o.dead)continue;
    if(o.type==='rock'){
     fill('#6c5682',o.x-5,o.y-4,10,8);fill('#675478',o.x-3,o.y-6,6,11);
     fill('#ae8dac',o.x-3,o.y-4,5,2);fill('#534665',o.x+1,o.y+2,3,2);
    }else glint(o.x,o.y,o.r,o.type==='boss'?'#ffd0ef':'#ffe9b0');
   }
   if(reduced||elapsed>=protectedUntil||Math.floor(elapsed*14)%2===0){
    fill('#e6d7ff',x-1,shipY-8,3,10);fill('#b2a8eb',x-6,shipY-1,13,5);
    fill('#77b2cf',x-1,shipY-3,3,4);fill('#ffb990',x-1,shipY+5,3,3);
   }
   for(let i=sparks.length-1;i>=0;i--){
    const p=sparks[i];p.life-=dt;
    if(p.life<=0){sparks.splice(i,1);continue}
    p.x+=p.vx*dt;p.y+=p.vy*dt;fill(p.color,p.x,p.y,2,2);
   }
  }
  function tick(now){
   if(!field.isConnected)return;
   const dt=Math.min(.048,(now-last)/1000);
   last=now;
   if(phase==='ready'&&now>=readyUntil){
    phase='play';field.dataset.phase=phase;caption.textContent='';
   }
   if(phase==='play')step(dt);
   render(dt);
   if(phase==='ready'||phase==='play'||(phase==='clear'&&sparks.length))frame=requestAnimationFrame(tick);
  }
  function move(event){
   const bounds=field.getBoundingClientRect();
   x=clamp((event.clientX-bounds.left)*width/bounds.width,8,width-8);
  }
  field.onpointerdown=event=>{
   if(!event.isPrimary||event.button!==0||!['ready','play'].includes(phase))return;
   pointer=event.pointerId;field.setPointerCapture(pointer);move(event);
  };
  field.onpointermove=event=>{if(pointer===event.pointerId)move(event)};
  field.onlostpointercapture=()=>{pointer=null};
  field.onkeydown=event=>{
   if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
   event.preventDefault();keys.add(event.key);
  };
  field.onkeyup=event=>keys.delete(event.key);
  field.onblur=()=>keys.clear();
  root.querySelector('#retryShooting').onclick=retry;
  root.querySelector('#leaveStarShooter').onclick=leave;
  field.dataset.phase='ready';caption.textContent='READY';
  updateScore();
  field.focus({preventScroll:true});
  frame=requestAnimationFrame(tick);
  return ()=>{cancelAnimationFrame(frame);clearTimeout(rewardTimer)};
 }
 return {screenMarkup,controlsMarkup,start};
})();
