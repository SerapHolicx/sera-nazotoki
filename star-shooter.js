'use strict';

(() => {
 const directions=[0,2,1,0,1,2,0,2];
 const goal=5, limit=3;
 function screenMarkup(){
  return `<div class="tv-shooter" id="tvShooter" aria-label="星くずシューティング画面">
   <div class="tv-shooter-sight" aria-hidden="true"></div>
   <span class="tv-shooter-label" aria-hidden="true">STAR DUST</span>
   ${['左','中央','右'].map((label,lane)=>`<button type="button" class="tv-shot-lane" data-shot-lane="${lane}" aria-label="${label}に撃つ"><i class="tv-shot-trail" aria-hidden="true"></i></button>`).join('')}
   <i id="tvTarget" class="tv-shooter-star" aria-hidden="true" hidden></i>
   <span class="tv-shooter-caption" role="status"></span>
  </div>`;
 }
 function controlsMarkup(){
  return '<p id="tvScore" aria-live="polite"></p><p id="tvShootingHelp">金色の帯まで星を引きつけて、同じ列をタップ。</p><div class="buttons" id="tvRetry" hidden><button class="btn primary" id="retryShooting">もう一度遊ぶ</button></div>';
 }
 function start(root,{hit,miss,retry,won,reward}){
  const field=root.querySelector('#tvShooter');
  const target=field.querySelector('#tvTarget');
  const caption=field.querySelector('.tv-shooter-caption');
  const lanes=[...field.querySelectorAll('[data-shot-lane]')];
  const score=root.querySelector('#tvScore');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fallTime=reduced?2100:1650;
  let wave=0,hits=0,misses=0,frame,rewardTimer;
  let begins=performance.now()+650;
  let active=true;
  const depth=now=>(now-begins)/fallTime;
  const inRange=progress=>progress>=.68&&progress<=1;
  const laneForWave=()=>directions[wave%directions.length];

  function updateScore(message=''){
   score.textContent=`星くず ${hits} / ${goal}　ミス ${misses} / ${limit}${message?'　'+message:''}`;
  }
  function freeze(){
   active=false;cancelAnimationFrame(frame);
   field.classList.remove('meteor-in-range');
   target.hidden=true;lanes.forEach(button=>button.disabled=true);
  }
  function next(judgedHit,lane){
   if(!active)return;
   if(judgedHit){hits++;hit()}
   else{misses++;miss()}
   const shot=lanes[lane];
   if(shot){
    shot.classList.remove('fired');
    void shot.offsetWidth;
    shot.classList.add('fired');
   }
   updateScore(judgedHit?'命中！':'逃した！');
   if(hits===goal){
    freeze();won();
    field.dataset.phase='clear';caption.textContent='CLEAR';
    rewardTimer=setTimeout(()=>{if(field.isConnected)reward()},reduced?220:510);
    return;
   }
   if(misses===limit){
    freeze();
    field.dataset.phase='over';caption.textContent='FINISH';
    root.querySelector('#tvRetry').hidden=false;
    root.querySelector('#retryShooting').focus({preventScroll:true});
    return;
   }
   wave++;
   begins=performance.now()+370;
   target.hidden=true;
   field.classList.remove('meteor-in-range');
  }
  function tick(now){
   if(!active||!field.isConnected)return;
   const progress=depth(now);
   if(progress>=0&&field.dataset.phase==='ready'){
    field.dataset.phase='play';caption.textContent='';
   }
   if(progress>1){
    next(false);
    if(!active)return;
   }else{
    target.hidden=progress<0;
    target.dataset.lane=laneForWave();
    const position=Math.max(0,progress);
    target.style.top=(19+(reduced?Math.floor(position*12)/12:position)*70)+'%';
    field.classList.toggle('meteor-in-range',inRange(progress));
   }
   frame=requestAnimationFrame(tick);
  }
  lanes.forEach((button,lane)=>button.onclick=()=>{
   const progress=depth(performance.now());
   if(active&&progress>=0)next(inRange(progress)&&lane===laneForWave(),lane);
  });
  root.querySelector('#retryShooting').onclick=retry;
  field.dataset.phase='ready';
  caption.textContent='READY';
  updateScore();
  frame=requestAnimationFrame(tick);
  return ()=>{
   active=false;
   cancelAnimationFrame(frame);
   clearTimeout(rewardTimer);
  };
 }
 window.observatoryShooter={screenMarkup,controlsMarkup,start};
})();
