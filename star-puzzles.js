'use strict';

window.createObservatoryStarPuzzles = ({getState,isNight,open,save,reward,tap,element}) => {
  const journalLines = ['あめあがりの','ひとしずく','がかがやいた'];
  const journalLetters = [...journalLines.join('')];
  const clueSlots = [6,12,4];
  const answerKeys = ['あ','か','し','と','ひ','や','い','り'];
  const journalRows = renderRow => {
    let offset = 0;
    return journalLines.map(line => {
      const row = `<div class="observation-row" style="--letters:${line.length}">${[...line].map(renderRow.bind(null,offset)).join('')}</div>`;
      offset += line.length;
      return row;
    }).join('');
  };

  function windowClue() {
    const rows = journalRows((offset,_,column) => {
      const order = clueSlots.indexOf(offset+column);
      return `<span class="sky-clue-cell ${order<0?'sky-clue-anchor':'sky-clue-marker'}">${window.observatoryStars.markup(order+1)}</span>`;
    });
    const descriptions = ['上から二段目の左端に小さな光が一つ添う星','上から三段目の左から二番目に小さな光が二つ添う星','上から一段目の左から五番目に小さな光が三つ添う星'];
    return `<div class="sky-clue-grid" role="img" aria-label="${descriptions.join('。')}。${journalLines.map(line=>line.length).join('、')}個の三段。">${rows}</div>`;
  }

  function drawWindowSky(canvas, night, showClues=true) {
    const ctx = canvas.getContext('2d');
    if(night){
      const atmosphere=ctx.createLinearGradient(0,0,0,96);
      atmosphere.addColorStop(0,'#111632');
      atmosphere.addColorStop(.62,'#20294e');
      atmosphere.addColorStop(1,'#45446a');
      ctx.fillStyle=atmosphere;
      ctx.fillRect(0,0,160,96);
    }else{
      const bands=['#333762','#584674','#8d5984','#c67e98','#eda69d','#ffc99d'];
      bands.forEach((color,i) => {
        ctx.fillStyle=color;
        ctx.fillRect(0,i*14,160,96-i*14);
      });
    }
    if (!night) {
      ctx.fillStyle = '#ffe2ad';
      for(let y=-11;y<=11;y++){
        const w=Math.floor(Math.sqrt(121-y*y));
        ctx.fillRect(81-w,68+y,w*2+1,1);
      }
    }
    const clouds = night?[[0,72,23],[31,75,21],[107,73,28],[136,72,24]]:[[4,51,26],[33,65,20],[109,47,28],[133,59,22]];
    for(const [x,y,w] of clouds){
      ctx.fillStyle=night?'#383e66':'#cf8da5';
      ctx.fillRect(x+7,y-2,w-16,2);
      ctx.fillRect(x+3,y,w-7,2);
      ctx.fillRect(x,y+2,w,2);
      ctx.fillStyle=night?'#30365b':'#b67895';
      ctx.fillRect(x+5,y+4,w-6,2);
    }
    const horizons = [
      [night?'#252847':'#7d5b7d', [83,81,76,78,80,83,86,86,81,78,72,74,77,82,84,85]],
      [night?'#161933':'#4a415d', [90,87,84,82,85,89,89,91,92,91,88,86,83,86,88,91]]
    ];
    for(const [color,heights] of horizons){
      ctx.fillStyle=color;
      heights.forEach((height,x)=>ctx.fillRect(x*10,height,10,96-height));
    }
    if (!night) return;
    ctx.fillStyle=showClues?'#4d587a':'#7782a9';
    [[5,12],[12,32],[22,8],[30,43],[43,17],[51,30],[66,11],[73,43],[86,21],[97,9],[105,36],[121,15],[133,30],[145,12],[153,43]].forEach(([x,y])=>ctx.fillRect(x,y,1,1));
    for(const [x,y,w] of [[19,87,7],[33,86,10],[47,89,7],[111,86,9],[123,85,8],[141,89,7]]){
      ctx.fillStyle='#202039';
      ctx.fillRect(x,y,w,96-y);
      ctx.fillRect(x+1,y-1,w-2,1);
      ctx.fillStyle='#d3a691';
      ctx.fillRect(x+2,y+2,1,1);
      if(w>7)ctx.fillRect(x+5,y+3,1,1);
    }
    if(!showClues)return;
    window.observatoryStars.paint(element('modalBody'));
  }

  const owned = id => getState().got.includes(id);

  function eclipseNote() {
    return '<div class="paper eclipse-note"><b>日食の観測記録</b><div class="eclipse-diagram" role="img" aria-label="左から大きな太陽、小さな月、青い地球が一列に描かれている"><i></i><i></i><i></i></div><p>月が真ん中に来ると、影が地球に落ちる。</p></div>';
  }

  function journal() {
    const state = getState();
    const page = `<article class="observatory-notebook"><b>雨上がりの観測メモ</b>
      <div class="journal-letter-grid">${journalRows((_,letter)=>`<span>${letter}</span>`)}</div>
      <p class="journal-margin-note">今夜の星と、同じ並び。</p></article>`;
    if (owned('journal')) {
      open('星の観測日誌',page+eclipseNote());
      return;
    }
    if (isNight() && state.puzzleSolved.includes('journal')) return reward('journal','',eclipseNote());
    if(!isNight()||!state.nightWindowSeen||!owned('clock')){
      open('星の観測日誌',page+'<p>今はまだよく分からない……。</p>');
      return;
    }
    let answer = '';
    open('星の観測日誌',page+`
      <output id="journalAnswer" aria-live="polite">□ □ □</output>
      <div class="journal-answer-keys" aria-label="答えの文字を選ぶ">${answerKeys.map(letter=>`<button class="btn" type="button" data-journal-letter="${letter}">${letter}</button>`).join('')}</div>
      <div class="buttons"><button class="btn" id="journalErase" type="button">一文字消す</button><button class="btn primary" id="journalCheck" type="button">確かめる</button></div>
      <p class="puzzle-feedback" id="journalStatus" aria-live="polite"></p>`);
    const keys = element('modalBody').querySelectorAll('[data-journal-letter]');
    function displayAnswer() {
      element('journalAnswer').textContent = [...answer.padEnd(clueSlots.length,'□')].join(' ');
      element('journalCheck').disabled = answer.length !== clueSlots.length;
      element('journalErase').disabled = !answer;
    }
    keys.forEach(button => {
      button.onclick = () => {
        if (answer.length === clueSlots.length) return;
        answer += button.dataset.journalLetter;
        element('journalStatus').textContent = '';
        tap();displayAnswer();
      };
    });
    element('journalErase').onclick = () => {
      answer = answer.slice(0,-1);
      element('journalStatus').textContent = '';
      displayAnswer();
    };
    element('journalCheck').onclick = () => {
      if (answer === clueSlots.map(index=>journalLetters[index]).join('')) reward('journal','',eclipseNote());
      else {
        element('journalStatus').textContent = '文字が青く光ったが、日誌は開かない。';
        answer = '';
        displayAnswer();
      }
    };
    displayAnswer();
  }

  function orrery() {
    const state = getState();
    if (owned('orrery')) {
      open('天体模型','<p>月の影が地球に重なったまま、模型は止まっている。</p>');
      return;
    }
    if (!owned('journal') || !owned('tv') || !owned('clock') || !owned('books')) {
      open('天体模型','<p>つまみは固く、動かない。</p>');
      return;
    }
    if (state.puzzleSolved.includes('orrery')) return reward('orrery');
    open('天体模型',window.observatoryOrrery.markup());
    window.observatoryOrrery.start(element('modalBody'),state,{
      save,tap,
      win(){
        const room=element('scene');
        if(!matchMedia('(prefers-reduced-motion: reduce)').matches)room.animate([{filter:'brightness(1)'},{filter:'brightness(.22)',offset:.52},{filter:'brightness(1)'}],700);
        if (!state.puzzleSolved.includes('orrery')) {state.puzzleSolved.push('orrery');save()}
      },
      reward:()=>reward('orrery','暗くなった観測室に、小さな星が浮かび上がった。')
    });
  }
  return {journal,orrery,windowClue,drawWindowSky};
};
