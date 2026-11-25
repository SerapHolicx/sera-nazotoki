'use strict';

(() => {
 const eveningHour = 18;
 const nightHour = 22;
 const meteorHour = 1;
 const kana = ['か','き','く','け','こ'];
 const panels = {
  cross:{name:'十字架',image:'clock-parts/cross.png',hour:10,kana:'か',time:nightHour},
  apple:{name:'りんご',image:'clock-parts/apple.png'},
  banana:{name:'バナナ',image:'clock-parts/banana.png'},
  fig:{name:'いちじく',image:'clock-fig.png',hour:1,kana:'く',time:meteorHour}
 };
 const fruits = ['apple','banana','fig'];
 const arrival = 'ご注文の商品をお届けしました！';
 const formatTime = hour => String(hour).padStart(2,'0')+':00';

 function sanitize(state){
  if(state.clockVersion!==1){
   const oldMeteor = state.meteor && !state.meteorStar && state.eyeTaken && !state.restored && state.news;
   state.clockHour = oldMeteor ? meteorHour
    : state.night || state.eyeTaken || state.got.includes('clock') || state.puzzleSolved.includes('clock') ? nightHour : eveningHour;
   state.clockPanel = oldMeteor ? 'fig' : 'cross';
   state.panels = oldMeteor ? ['cross'] : [];
   state.delivery = null;
  }
  state.clockVersion = 1;
  delete state.night;
  delete state.meteor;
  if(![eveningHour,nightHour,meteorHour].includes(state.clockHour))state.clockHour=eveningHour;
  if(!kana.includes(state.clockKana))state.clockKana=kana[0];
  if(state.clockPanel!==null&&!Object.hasOwn(panels,state.clockPanel))state.clockPanel='cross';
  state.panels=Array.isArray(state.panels)
   ? [...new Set(state.panels.filter(id=>Object.hasOwn(panels,id)&&id!==state.clockPanel))] : [];
  if(state.clockPanel!=='cross'&&!state.panels.includes('cross'))state.panels.push('cross');
  if(!fruits.includes(state.delivery)||hasPanel(state,state.delivery))state.delivery=null;
 }

 function hasPanel(state,id){
  return state.clockPanel===id||state.panels.includes(id);
 }
 function panelImage(id,decorative=false){
  const panel=panels[id];
  return `<img src="${panel.image}" width="32" height="32" alt="${decorative?'':panel.name}">`;
 }

 function create({getState,open,save,draw,tap,chime,element,applyTime,onDelivered}){
  function clock(selectedHour=null,notice=''){
   const state=getState();
   const mounted=panels[state.clockPanel];
   const dial=Array.from({length:12},(_,hour)=>{
    const angle=hour*Math.PI/6;
    const x=50+27*Math.sin(angle),y=50-27*Math.cos(angle);
    return `<button type="button" data-hour="${hour}" aria-label="${hour||12}時" aria-pressed="${selectedHour===hour}" style="--hx:${x}%;--hy:${y}%">${hour||12}</button>`;
   }).join('');
   open('時計',`<div class="clock-examples" aria-label="時計の例題">
    <div class="clock-example-row"><span>2時 ＋ く ＝</span><img src="clock-parts/axes.png" width="28" height="28" alt="二軸（にじく）"></div>
    <div class="clock-example-row"><span>4時 ＋ る ＝</span><img src="clock-parts/rope.png" width="28" height="28" alt="ひもをよじる"></div>
   </div>
   <div class="clock-dial" aria-label="合わせたい時刻を指定">
    <span class="clock-hand" aria-hidden="true" style="transform:rotate(${(state.clockHour%12)*30}deg)"></span>${dial}
   </div>
   <div class="clock-equation">
    <span id="clockHourChoice">${selectedHour===null?'？':selectedHour||12}時</span><span>＋</span><b id="clockKanaChoice">${state.clockKana}</b><span>＝</span>
    <span class="clock-panel-socket">${mounted?panelImage(state.clockPanel):'<span aria-label="パネルなし">―</span>'}</span>
   </div>
   <div class="clock-kana" aria-label="ひらがな">${kana.map(letter=>`<button type="button" class="btn" data-clock-kana="${letter}" aria-pressed="${letter===state.clockKana}">${letter}</button>`).join('')}</div>
   <div class="buttons clock-actions"><button class="btn primary" id="setHour" type="button"${selectedHour===null||!mounted?' disabled':''}>確かめる</button>
    ${mounted?'<button class="btn" id="removeClockPanel" type="button">パネルを外す</button>':''}
   </div>
   ${state.panels.length?`<div class="clock-panel-tray" aria-label="持ち物の絵のパネル">${state.panels.map(id=>`<button class="btn" type="button" data-mount-panel="${id}" aria-label="${panels[id].name}のパネルをセット">${panelImage(id,true)}<span>${panels[id].name}</span></button>`).join('')}</div>`:''}
   <p id="clockStatus" role="status">${notice}</p>`);
   const body=element('modalBody');
   const hourButtons=[...body.querySelectorAll('[data-hour]')];
   hourButtons.forEach(button=>button.onclick=()=>{
    selectedHour=Number(button.dataset.hour);
    element('clockHourChoice').textContent=(selectedHour||12)+'時';
    hourButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    element('setHour').disabled=!mounted;
    element('clockStatus').textContent='';
   });
   const kanaButtons=[...body.querySelectorAll('[data-clock-kana]')];
   kanaButtons.forEach(button=>button.onclick=()=>{
    state.clockKana=button.dataset.clockKana;
    save();
    element('clockKanaChoice').textContent=state.clockKana;
    kanaButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    element('clockStatus').textContent='';
   });
   const remove=element('removeClockPanel');
   if(remove)remove.onclick=()=>{
    state.panels.push(state.clockPanel);
    state.clockPanel=null;
    save();draw();tap();clock(selectedHour);
   };
   body.querySelectorAll('[data-mount-panel]').forEach(button=>button.onclick=()=>{
    const id=button.dataset.mountPanel;
    if(!state.panels.includes(id))return;
    state.panels=state.panels.filter(panel=>panel!==id);
    if(state.clockPanel)state.panels.push(state.clockPanel);
    state.clockPanel=id;
    save();draw();tap();clock(selectedHour);
   });
   element('setHour').onclick=()=>{
    if(!mounted||selectedHour===null||mounted.hour!==selectedHour||mounted.kana!==state.clockKana){
     element('clockStatus').textContent='……針は動かなかった。';
     return;
    }
    const before=state.clockHour;
    state.clockHour=mounted.time;
    save();tap();draw();
    if(!applyTime(before))clock(selectedHour,formatTime(state.clockHour)+'　針が動いた。');
   };
  }

  function shopMarkup(){
   return `<section id="tvFruitShop" class="tv-fruit-shop" aria-label="くだもの通販">
    <header><strong>くだもの便</strong><span>ご注文受付中</span></header>
    <div class="tv-fruit-products">
     ${fruits.map(id=>`<button type="button" class="btn" data-fruit="${id}" aria-pressed="false">${panelImage(id,true)}<b>${panels[id].name}</b></button>`).join('')}
    </div>
    <button class="btn primary" id="orderFruit" type="button" disabled>注文する</button>
    <p id="fruitOrderStatus" role="status"></p>
   </section>`;
  }

  function bindShop(){
   const state=getState();
   const shop=element('tvFruitShop');
   const order=element('orderFruit');
   const notice=element('fruitOrderStatus');
   let selected=null;
   function refresh(){
    for(const button of shop.querySelectorAll('[data-fruit]')){
     const id=button.dataset.fruit;
     button.disabled=hasPanel(state,id);
     button.setAttribute('aria-pressed',String(id===selected));
    }
    order.disabled=!selected||Boolean(state.delivery)||hasPanel(state,selected);
   }
   shop.querySelectorAll('[data-fruit]').forEach(button=>button.onclick=()=>{
    selected=button.dataset.fruit;
    if(!state.delivery)notice.textContent='';
    refresh();
   });
   order.onclick=()=>{
    if(!selected||state.delivery||hasPanel(state,selected))return;
    state.delivery=selected;
    save();chime();draw();refresh();
    notice.textContent=arrival;
    shop.classList.add('delivery-announced');
    speakArrival();
   };
   if(state.delivery)notice.textContent=panels[state.delivery].name+'をお届け済みです。';
   refresh();
  }

  function showParcel(){
   const state=getState();
   const id=state.delivery;
   if(!id)return;
   open('段ボール',`<button type="button" class="btn parcel-open-button" id="openParcel"><img src="clock-parts/parcel.png" width="108" height="88" alt="">箱を開ける</button>`);
   element('openParcel').onclick=()=>{
    if(state.delivery!==id)return;
    state.delivery=null;
    if(!hasPanel(state,id))state.panels.push(id);
    save();chime();draw();
    open('お届けもの',`<div class="item-found parcel-arrived"><img src="clock-parts/parcel-open.png" width="54" height="44" alt="開いた段ボール">${panelImage(id)}
     <b>${panels[id].name}の絵のパネルを手に入れた</b></div>`);
    onDelivered();
   };
  }
  return {clock,shopMarkup,bindShop,showParcel};
 }

 function speakArrival(){
  try{
   const synth=window.speechSynthesis;
   const voice=synth?.getVoices().find(entry=>entry.lang.toLowerCase().startsWith('ja'));
   if(!voice)return;
   const message=new SpeechSynthesisUtterance(arrival);
   message.voice=voice;message.lang='ja-JP';message.pitch=1.25;message.rate=1.03;
   synth.speak(message);
  }catch{}
 }
 window.observatoryClock={eveningHour,nightHour,meteorHour,formatTime,sanitize,create,panelImage};
})();
