'use strict';

(() => {
 const eveningHour = 18;
 const nightHour = 22;
 const meteorHour = 1;
 const kana = ['か','き','く','け','こ'];
 const items = {
  cross:{name:'十字架',image:'clock-parts/cross.png',hour:10,kana:'か',time:nightHour},
  apple:{name:'りんご',image:'clock-parts/apple.png'},
  banana:{name:'バナナ',image:'clock-parts/banana.png'},
  fig:{name:'いちじく',image:'clock-fig.png',hour:1,kana:'く',time:meteorHour}
 };
 const panelIds = Object.keys(items);
 const products = ['apple','banana','fig'];
 const arrival = 'ご注文の商品をお届けしました！';
 const formatTime = hour => String(hour).padStart(2,'0')+':00';

 function sanitize(state){
  if(![1,2,3].includes(state.clockVersion)){
   const oldMeteor = state.meteor && !state.meteorStar && state.eyeTaken && !state.restored && state.news;
   state.clockHour = oldMeteor ? meteorHour
    : state.night || state.eyeTaken || state.got.includes('clock') || state.puzzleSolved.includes('clock') ? nightHour : eveningHour;
   state.clockPanel = oldMeteor ? 'fig' : 'cross';
   state.panels = oldMeteor ? ['cross'] : [];
   state.delivery = null;
  }
  const formerPanels=Array.isArray(state.panels)?state.panels:[];
  const formerMounted=state.clockPanel;
  const formerFruits=Array.isArray(state.fruits)?state.fruits:[];
  delete state.fruits;
  state.itemOrder=Array.isArray(state.itemOrder)?[...new Set(state.itemOrder)]:[];
  if(state.clockVersion<2){
   if(state.keyFound)rememberItem(state,'key');
   if(state.remote)rememberItem(state,'remote');
   if(state.meteorStar)rememberItem(state,'meteor');
   for(const id of [...formerPanels,formerMounted])if(Object.hasOwn(items,id)&&id!=='cross')rememberItem(state,id);
  }
  for(const id of formerFruits)if(products.includes(id))rememberItem(state,id);
  state.clockVersion = 3;
  delete state.night;
  delete state.meteor;
  if(![eveningHour,nightHour,meteorHour].includes(state.clockHour))state.clockHour=eveningHour;
  if(!kana.includes(state.clockKana))state.clockKana=kana[0];
  if(state.clockPanel!==null&&!panelIds.includes(state.clockPanel))state.clockPanel='cross';
  state.panels=[...new Set([...formerPanels,...formerFruits].filter(id=>panelIds.includes(id)&&id!==state.clockPanel))];
  if(state.clockPanel!=='cross'&&!state.panels.includes('cross'))state.panels.push('cross');
  if(!products.includes(state.delivery)||hasItem(state,state.delivery))state.delivery=null;
 }

 function hasItem(state,id){
  return state.clockPanel===id||state.panels.includes(id);
 }
 function rememberItem(state,id){
  if(!state.itemOrder.includes(id))state.itemOrder.push(id);
 }
 function itemLabel(id){
  return items[id].name+'パネル';
 }
 function panelImage(id,decorative=false){
  const panel=items[id];
  return `<img class="clock-part-picture" src="${panel.image}" width="32" height="32" alt="${decorative?'':panel.name}">`;
 }

 function create({getState,open,save,draw,tap,chime,element,applyTime,onDelivered}){
  function clock(selectedHour=null,notice=''){
   const state=getState();
   const mounted=items[state.clockPanel];
   const loosePanels=[...new Set([...state.itemOrder,...state.panels])].filter(id=>state.panels.includes(id));
   const dial=Array.from({length:12},(_,hour)=>{
    const angle=hour*Math.PI/6;
    const x=50+27*Math.sin(angle),y=50-27*Math.cos(angle);
    return `<button type="button" data-hour="${hour}" aria-label="${hour||12}時" aria-pressed="${selectedHour===hour}" style="--hx:${x}%;--hy:${y}%">${hour||12}</button>`;
   }).join('');
   open('時計',`<div class="clock-examples" aria-label="時計の例題">
    <div class="clock-example-row"><span>2時 ＋ く ＝</span><img src="clock-parts/axes.png" width="28" height="28" alt="二軸（にじく）"></div>
    <div class="clock-example-row"><span>9時 ＋ ら ＝</span><img src="clock-whale.png" width="28" height="28" alt="鯨（くじら）"></div>
   </div>
   <div class="clock-dial" aria-label="合わせたい時刻を指定">
    <span class="clock-hand clock-minute" aria-hidden="true"></span><span class="clock-hand" aria-hidden="true" style="transform:rotate(${(state.clockHour%12)*30}deg)"></span>${dial}
   </div>
   <div class="clock-equation">
    <span id="clockHourChoice">${selectedHour===null?'？':selectedHour||12}時</span><span>＋</span><div class="clock-kana-wheel" aria-label="ひらがなを切り替える">
     <button id="clockKanaUp" type="button" aria-label="前のひらがな">△</button>
     <output id="clockKanaChoice" aria-live="polite">${state.clockKana}</output>
     <button id="clockKanaDown" type="button" aria-label="次のひらがな">▽</button>
    </div><span>＝</span>
    <span class="clock-panel-socket">${mounted?panelImage(state.clockPanel):'<span aria-label="パネルなし">―</span>'}</span>
   </div>
   <div class="buttons clock-actions"><button class="btn primary" id="setHour" type="button"${selectedHour===null||!mounted?' disabled':''}>確かめる</button>
    ${mounted?'<button class="btn" id="removeClockPanel" type="button">パネルを外す</button>':''}
   </div>
   ${loosePanels.length?`<div class="clock-panel-tray" aria-label="持ち物の絵のパネル">${loosePanels.map(id=>`<button class="btn" type="button" data-mount-panel="${id}" aria-label="${items[id].name}のパネルをセット">${panelImage(id,true)}<span>${items[id].name}</span></button>`).join('')}</div>`:''}
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
   function cycleKana(direction){
    const index=kana.indexOf(state.clockKana);
    state.clockKana=kana[(index+direction+kana.length)%kana.length];
    save();
    element('clockKanaChoice').textContent=state.clockKana;
    element('clockStatus').textContent='';
    tap();
   }
   element('clockKanaUp').onclick=()=>cycleKana(-1);
   element('clockKanaDown').onclick=()=>cycleKana(1);
   const remove=element('removeClockPanel');
   if(remove)remove.onclick=()=>{
    rememberItem(state,state.clockPanel);
    state.panels.push(state.clockPanel);
    state.clockPanel=null;
    save();draw();tap();clock(selectedHour);
   };
   body.querySelectorAll('[data-mount-panel]').forEach(button=>button.onclick=()=>{
    const id=button.dataset.mountPanel;
    if(!state.panels.includes(id))return;
    state.panels=state.panels.filter(panel=>panel!==id);
    if(state.clockPanel){rememberItem(state,state.clockPanel);state.panels.push(state.clockPanel)}
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
   return `<section id="tvFruitShop" class="tv-fruit-shop" aria-label="くだもの通販" hidden>
    <header><strong>ご注文しますか？</strong><button id="closeFruitPrompt" type="button" class="btn" aria-label="注文画面を閉じる">×</button></header>
    <div class="tv-fruit-products">
     ${products.map(id=>`<button type="button" class="btn" data-fruit="${id}" aria-pressed="false">${panelImage(id,true)}<b>${itemLabel(id)}</b></button>`).join('')}
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
   const show=element('openFruitPrompt');
   show.onclick=()=>{
    shop.hidden=false;
    show.hidden=true;
    refresh();
    shop.querySelector('[data-fruit]:not(:disabled)')?.focus({preventScroll:true});
   };
   element('closeFruitPrompt').onclick=()=>{
    shop.hidden=true;
    show.hidden=false;
    show.focus({preventScroll:true});
   };
   function refresh(){
    for(const button of shop.querySelectorAll('[data-fruit]')){
     const id=button.dataset.fruit;
     button.disabled=hasItem(state,id);
     button.setAttribute('aria-pressed',String(id===selected));
    }
    order.disabled=!selected||Boolean(state.delivery)||hasItem(state,selected);
   }
   shop.querySelectorAll('[data-fruit]').forEach(button=>button.onclick=()=>{
    selected=button.dataset.fruit;
    if(!state.delivery)notice.textContent='';
    refresh();
   });
   order.onclick=()=>{
    if(!selected||state.delivery||hasItem(state,selected))return;
    state.delivery=selected;
    save();chime();draw();refresh();
    notice.textContent=arrival;
    shop.classList.add('delivery-announced');
    speakArrival();
   };
   if(state.delivery)notice.textContent=items[state.delivery].name+'をお届け済みです。';
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
    if(!hasItem(state,id)){
     state.panels.push(id);
     rememberItem(state,id);
    }
    save();chime();draw();
    open('お届けもの',`<div class="item-found parcel-arrived"><img src="clock-parts/parcel-open.png" width="54" height="44" alt="開いた段ボール">${panelImage(id)}
     <b>${itemLabel(id)}を手に入れた</b></div>`);
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
 window.observatoryClock={eveningHour,nightHour,meteorHour,formatTime,sanitize,create,panelImage,rememberItem,itemLabel};
})();
