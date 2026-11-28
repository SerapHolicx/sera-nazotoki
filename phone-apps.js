'use strict';

window.createSeraPhone = ({open,home,time,element,thought}) => {
  const data = window.seraPhoneContent;
  const apps = [
    ['diary','日記','▤'],['photos','写真','✿'],['x','X','𝕏'],
    ['browser','ブラウザ','◈'],['voice','ボイスメモ','▥'],['messages','メッセージ','●'],
    ['calendar','カレンダー','25'],['music','音楽','♫'],['settings','設定','⚙']
  ];
  const escape = value => String(value).replace(/[&<>"']/g, char =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
  const duration = seconds => Math.floor(seconds/60)+':'+String(Math.floor(seconds%60)).padStart(2,'0');
  const settings = {airplane:false,wifi:false,bluetooth:true,wall:'mist'};
  const button = (label,attrs='') => `<button type="button" ${attrs}>${label}</button>`;
  const root = () => element('handsetContent');
  let reading=null;
  function finishReading(done){
    const id=reading;
    reading=null;
    return id?thought(id,done):false;
  }
  function on(selector,call) {
    root().querySelectorAll(selector).forEach(node=>{node.onclick=()=>call(node)});
  }

  function showHome() {
    open('phone-home wall-'+settings.wall,`<div class="phone-desktop">
      <strong class="lock-time">${time()}</strong>
      <div class="phone-app-grid">${apps.map(([id,label,icon])=>
        button(`<span class="app-icon app-${id}" aria-hidden="true">${icon}</span><span>${label}</span>`,`class="home-app" data-app="${id}"`)).join('')}</div></div>`);
    on('[data-app]',node=>views[node.dataset.app]());
    finishReading();
  }

  function screen(app,content,back=home,backLabel='ホーム') {
    const [,title,icon]=apps.find(entry=>entry[0]===app);
    open('phone-app appview-'+app,`<header class="phone-app-bar">
      ${button(`‹ ${backLabel}`,'id="phoneAppBack"')}
      <h3><span aria-hidden="true">${icon}</span> ${title}</h3>
      </header><section class="phone-app-body">${content}</section>`);
    on('#phoneAppBack',back);
    finishReading();
  }

  function tabs(labels,current) {
    return `<div role="group" aria-label="表示を切り替える" class="app-tabs">${labels.map(([id,label])=>
      button(label,`data-tab="${id}" aria-pressed="${id===current}"`)).join('')}</div>`;
  }

  function diary() {
    const entries=data.diary.map((entry,index)=>({...entry,index}));
    const rows=pinned=>entries.filter(entry=>Boolean(entry.pinned)===pinned)
      .sort((a,b)=>pinned?a.pinned-b.pinned:b.date.localeCompare(a.date))
      .map(({date,title,index})=>button(`<time>${date}</time><strong>${escape(title)}</strong><span aria-hidden="true">›</span>`,
        `data-entry="${index}"`)).join('');
    screen('diary',`<div class="diary-index"><h4>ピン留め</h4>${rows(true)}<h4>日記</h4>${rows(false)}</div>`);
    on('[data-entry]',node=>{
      const entry=data.diary[Number(node.dataset.entry)];
      screen('diary',`<article class="diary-entry"><time>${entry.date}</time><h4>${escape(entry.title)}</h4>
       <p>${escape(entry.text)}</p></article>`,diary,'一覧');
      reading=entry.thought;
    });
  }
  function social(account='public') {
    const isPublic=account==='public',profile=data.profile;
    screen('x',`${tabs([['public',profile.name],['private','夜ふかし']],account)}
      <div class="phone-account">
      ${isPublic?'<img src="sera-dusk-face.webp" alt="">':'<span class="private-avatar" aria-hidden="true">☾</span>'}
      <div><strong>${isPublic?profile.name:'夜ふかし'}</strong></div>
      </div>
      <div class="phone-feed">${data.posts[account].map(({date,text,link})=>
      `<article><time>${date}</time><p>${escape(text)}</p>${link?button('宵空セラの部屋','class="phone-page-link" data-site'):''}</article>`).join('')}</div>`);
    on('[data-tab]',node=>social(node.dataset.tab));
    on('[data-site]',()=>browserPage(data.pages[0],()=>social(account)));
  }

  const photoAlbums=[
    ['observation','星座の観測'],['daily','日常・思い出']
  ].map(([id,label])=>({id,label,indices:data.photos.flatMap((photo,index)=>photo.album===id?[index]:[])}));
  const observationPhotos=data.photos.flatMap((photo,index)=>photo.observation?[index]:[]).reverse();

  function photos(album='all',scrollTop=0) {
    const groups=album==='all'?photoAlbums:photoAlbums.filter(group=>group.id===album);
    const indices=groups.flatMap(group=>group.indices);
    const sections=groups.map(({label,indices})=>`<section class="photo-album">
      ${album==='all'?`<h4>${label}</h4>`:''}
      <div class="phone-photo-grid">${indices.map(index=>{
        const {src,date,label}=data.photos[index];
        return button(`<img src="${escape(src)}" alt=""><span>${escape(label)}</span>`,
          `data-photo="${index}" aria-label="${escape(label+' '+date)}"`);
      }).join('')}</div></section>`).join('');
    screen('photos',`${tabs([['all','すべて'],...photoAlbums.map(({id,label})=>[id,label])],album)}${sections}`);
    const body=root().querySelector('.phone-app-body');
    body.scrollTop=scrollTop;
    on('[data-tab]',node=>photos(node.dataset.tab));
    on('[data-photo]',node=>{
      const position=body.scrollTop;
      viewPhoto(Number(node.dataset.photo),indices,()=>photos(album,position),'一覧');
    });
  }

  function showLastPhoto(){
    const index=data.photos.findIndex(photo=>photo.resume);
    if(index<0){home();return}
    viewPhoto(index,observationPhotos,home,'ホーム');
  }

  function viewPhoto(index,indices,back,backLabel) {
    const photo=data.photos[index];
    const position=indices.indexOf(index);
    screen('photos',`<div class="photo-view">
      <figure id="phonePhotoTouch" class="photo-viewport" aria-label="スワイプで写真切り替え。ピンチで拡大・縮小">
        <img src="${escape(photo.src)}" alt="${escape(photo.alt)}" draggable="false">
      </figure><time>${photo.date}</time>
      <div class="photo-nav">
      ${button('‹','id="prevPhonePhoto" aria-label="前の写真" '+(position===0?'disabled':''))}
      ${button('＋','id="zoomPhonePhoto" aria-label="写真を拡大・縮小" aria-pressed="false"')}
      ${button('›','id="nextPhonePhoto" aria-label="次の写真" '+(position===indices.length-1?'disabled':''))}
      </div></div>`,back,backLabel);
    if(photo.anomaly)reading='photo';
    const viewport=element('phonePhotoTouch');
    const image=viewport.firstElementChild;
    const zoomButton=element('zoomPhonePhoto');
    const pointers=new Map();
    let scale=1, x=0, y=0, origin=null, pinch=null;
    const go=step=>{
      const next=indices[position+step];
      if(next!==undefined)viewPhoto(next,indices,back,backLabel);
    };
    function paint() {
      const limitX=viewport.clientWidth*(scale-1)/2;
      const limitY=viewport.clientHeight*(scale-1)/2;
      x=Math.max(-limitX,Math.min(limitX,x));
      y=Math.max(-limitY,Math.min(limitY,y));
      image.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
      zoomButton.setAttribute('aria-pressed',String(scale>1));
      zoomButton.textContent=scale>1?'−':'＋';
      if(photo.anomaly&&scale>=1.6)finishReading();
    }
    on('#prevPhonePhoto',()=>go(-1));
    on('#nextPhonePhoto',()=>go(1));
    on('#zoomPhonePhoto',()=>{scale=scale>1?1:2.5;paint()});
    viewport.tabIndex=0;
    viewport.onkeydown=event=>{
      if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
      event.preventDefault();go(event.key==='ArrowLeft'?-1:1);
    };
    const point=event=>({x:event.clientX,y:event.clientY});
    const metrics=()=>{
      const [a,b]=pointers.values();
      return {distance:Math.hypot(a.x-b.x,a.y-b.y),x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    };
    viewport.onpointerdown=event=>{
      if(event.button!==0||pointers.size>=2)return;
      viewport.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId,point(event));
      if(pointers.size===1)origin={...point(event),xOffset:x,yOffset:y};
      else{pinch={...metrics(),scale,xOffset:x,yOffset:y};origin=null}
    };
    viewport.onpointermove=event=>{
      if(!pointers.has(event.pointerId))return;
      pointers.set(event.pointerId,point(event));
      if(pinch&&pointers.size===2){
        const current=metrics();
        scale=Math.max(1,Math.min(4,pinch.scale*current.distance/Math.max(1,pinch.distance)));
        x=pinch.xOffset+current.x-pinch.x;y=pinch.yOffset+current.y-pinch.y;paint();
      }else if(origin&&scale>1){
        x=origin.xOffset+event.clientX-origin.x;y=origin.yOffset+event.clientY-origin.y;paint();
      }
    };
    function release(event,swipe) {
      if(!pointers.delete(event.pointerId))return;
      if(swipe&&origin&&scale===1){
        const dx=event.clientX-origin.x,dy=event.clientY-origin.y;
        if(Math.abs(dx)>32&&Math.abs(dx)>Math.abs(dy)*1.3)go(dx<0?1:-1);
      }
      origin=null;pinch=null;
    }
    viewport.onpointerup=event=>release(event,true);
    viewport.onpointercancel=event=>release(event,false);
    viewport.onlostpointercapture=event=>release(event,false);
  }

  function browser(tab='search') {
    const pages=tab==='bookmarks'?data.pages.filter(page=>page.saved):data.pages;
    const rows=tab==='search'
      ?data.searches.map((query,i)=>button(`<span aria-hidden="true">⌕</span> ${escape(query)}`,`data-query="${i}"`)).join('')
      :pages.map(({title,host},i)=>button(`<strong>${escape(title)}</strong><small>${escape(host)}</small>`,`data-page="${i}"`)).join('');
    screen('browser',`<div class="browser-address">⌕　検索またはアドレス</div>
      ${tabs([['search','検索履歴'],['history','閲覧履歴'],['bookmarks','ブックマーク']],tab)}
      <div class="browser-list">${rows}</div>`);
    on('[data-tab]',node=>browser(node.dataset.tab));
    on('[data-query]',node=>screen('browser',`<div class="browser-address">${escape(data.searches[Number(node.dataset.query)])}</div>
      <p class="phone-offline">圏外のため検索できません。</p>`,()=>browser(tab),'履歴'));
    on('[data-page]',node=>browserPage(pages[Number(node.dataset.page)],()=>browser(tab)));
  }

  function browserPage(page,back) {
    const content=page.external
      ?`<p class="phone-offline">圏外のためページを読み込めません。</p>
         <a class="phone-page-link" href="${escape(data.profile.site)}" target="_blank" rel="noopener">外部ブラウザで開く</a>
         <a class="phone-page-link" href="${escape(data.profile.x)}" target="_blank" rel="noopener">X　${escape(data.profile.name)}</a>`
      :page.article?articleBody(page.article):`<p>${escape(page.text)}</p>`;
    screen('browser',`<div class="browser-address">${escape(page.host)}</div><article class="cached-page${page.article?' saved-article':''}">
      ${page.article?`<small class="saved-article-brand">${escape(page.article.section)}</small>`:''}
      <h4>${escape(page.title)}</h4>${content}</article>`,back,'戻る');
    if(page.title==='別の世界の誰かに見つけてもらう方法')reading='otherWorldArticle';
  }

  function articleBody({intro,parts,image}) {
    return `<p>${escape(intro)}</p>${parts.map(({title,text})=>
      `<section><h5>${escape(title)}</h5><p>${escape(text)}</p></section>`).join('')}
      <figure><img src="${escape(image.src)}" alt="${escape(image.alt)}">
        <figcaption>${escape(image.caption)}</figcaption></figure>`;
  }

  function voice() {
    screen('voice',`<div class="voice-list">${data.recordings.map(({title,date,duration:seconds,src},i)=>
      button(`<strong>${escape(title)}</strong><small>${date}　${src?duration(seconds):'—'}</small>`,`data-recording="${i}"`)).join('')}</div>`);
    on('[data-recording]',node=>{
      const {title,date,duration:seconds,src,waveform}=data.recordings[Number(node.dataset.recording)];
      screen('voice',`<article class="recording-player"><h4>${escape(title)}</h4><time>${date}</time>
        ${src?`${waveform?.length?`<div class="phone-wave" aria-hidden="true">${waveform.map(bar=>`<i style="--bar:${bar}%"></i>`).join('')}</div>`:''}
          <audio preload="none" controls src="${escape(src)}" aria-label="${escape(title)}"></audio><small>${duration(seconds)}</small>`:
          '<p>音声ファイルがありません。</p>'}</article>`,voice,'一覧');
    });
  }

  function messages() {
    screen('messages',`<div class="message-recipient"><span aria-hidden="true">●</span><strong>連絡先なし</strong></div>
      <div class="message-history">${data.messages.map(({time,text},i)=>`<article>
      <time>${time}</time><p>${escape(text)}</p><div><small>未配信</small>
      ${button('↻','data-resend aria-label="'+(i+1)+'件目を再送"')}</div></article>`).join('')}</div>
      <p class="message-status" role="status"></p>`);
    on('[data-resend]',()=>{root().querySelector('.message-status').textContent='圏外のため送信できません。'});
  }

  function calendar(day=null) {
    const chosen=data.events.find(event=>event.day===day);
    const month=Array.from({length:30},(_,i)=> {
      const date=i+1;
      return button(`${date}${data.events.some(event=>event.day===date)?'<i aria-hidden="true"></i>':''}`,
        `data-day="${date}" aria-label="11月${date}日" aria-pressed="${date===day}"`);
    }).join('');
    screen('calendar',`<section class="phone-calendar"><h4>11月</h4>
      <div class="calendar-days">${[...'日月火水木金土'].map(name=>`<span>${name}</span>`).join('')}${month}</div></section>
      <div class="calendar-events">${day===null?data.events.map(event=>button(
        `<small>11/${event.day}　${event.time}</small><strong>${escape(event.title)}</strong>`,`data-day="${event.day}"`)).join('')
        :chosen?`<article><small>11/${day}　${chosen.time}</small><strong>${escape(chosen.title)}</strong>
          ${chosen.created?`<small>登録日　${chosen.created}</small>`:''}</article>`:'<p>予定なし</p>'}</div>
        ${day===null?'':button('すべての予定','class="phone-page-link" id="allPhoneEvents"')}`);
    on('[data-day]',node=>calendar(Number(node.dataset.day)));
    on('#allPhoneEvents',()=>calendar());
  }

  function music(shelf='favorites') {
    screen('music',`${tabs([['favorites','お気に入り'],['recent','最近再生'],['practice','練習曲']],shelf)}
      <div class="phone-tracks">${data.tracks.map(({title,note,shelf:groups},i)=>groups.includes(shelf)?
        button(`<span aria-hidden="true">♫</span><div><strong>${escape(title)}</strong><small>${escape(note)}</small></div>`,`data-track="${i}"`):'').join('')}</div>`);
    on('[data-track]',node=>{
      const {title,note,src}=data.tracks[Number(node.dataset.track)];
      screen('music',`<article class="phone-now-playing"><div aria-hidden="true">♫</div>
        <h4>${escape(title)}</h4><small>${escape(note)}</small>${src?
          `<audio preload="none" controls src="${escape(src)}" aria-label="${escape(title)}"></audio>`:
          '<p>オフラインで再生できる音源はありません。</p>'}</article>`,()=>music(shelf),'一覧');
    });
  }

  function settingsView(notice='') {
    const rows=[['airplane','機内モード'],['wifi','Wi-Fi'],['bluetooth','Bluetooth']];
    screen('settings',`<div class="phone-settings">${rows.map(([id,label])=>button(
      `<span>${label}</span><small>${settings[id]?'オン':'オフ'}</small>`,
      `role="switch" aria-checked="${settings[id]}" data-setting="${id}"`)).join('')}
      ${button('<span>壁紙</span><small>›</small>','id="phoneWallpaper"')}
      ${button('<span>端末情報</span><small>›</small>','id="phoneAbout"')}
      ${button('<span>ストレージ</span><small>›</small>','id="phoneStorage"')}</div>
      <p class="settings-notice" role="status">${escape(notice)}</p>`);
    on('[data-setting]',node=>{
      const id=node.dataset.setting;
      settings[id]=!settings[id];
      if(id==='airplane'&&settings.airplane)settings.wifi=false;
      settingsView(id==='wifi'&&settings.wifi?'利用できるネットワークはありません。':'');
      root().querySelector(`[data-setting="${id}"]`).focus({preventScroll:true});
    });
    on('#phoneWallpaper',()=>{
      screen('settings',`<div class="phone-wallpapers">${[['mist','星明かり'],['violet','薄紫の空']].map(([id,label])=>
        button(label,`class="wall-${id}" data-wall="${id}" aria-pressed="${settings.wall===id}"`)).join('')}</div>`,settingsView,'設定');
      on('[data-wall]',node=>{settings.wall=node.dataset.wall;settingsView('壁紙を変更しました。')});
    });
    on('#phoneAbout',()=>screen('settings','<dl class="phone-about"><dt>端末名</dt><dd>セラのスマートフォン</dd><dt>通信状態</dt><dd>圏外</dd></dl>',settingsView,'設定'));
    on('#phoneStorage',()=>screen('settings',`<dl class="phone-about"><dt>写真</dt><dd>${data.photos.length}枚</dd><dt>録音</dt><dd>${data.recordings.filter(entry=>entry.src).length}件</dd></dl>`,settingsView,'設定'));
  }

  const views={diary,photos,x:social,browser,voice,messages,calendar,music,settings:settingsView};
  return {showHome,showLastPhoto,finishReading};
};
