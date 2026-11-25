'use strict';

window.createObservatoryStarPuzzles = ({getState,open,save,reward,tap,element}) => {
  const moonPositions = [17,34,51,68,85];
  const orbit = [[86,25],[95,56],[70,82],[44,53],[58,25]];
  const journalLines = [
    'ひそやかな足音が、空の奥で止まった。',
    'かすかな月明かりが、机を青く染めた。',
    'りんと鳴る鈴に、星がひとつ応えた。'
  ];
  const keys = ['か','つ','り','よ','ひ','き'];
  const owned = id => getState().got.includes(id);

  function mirror() {
    const state = getState();
    if (owned('mirror')) {
      open('月を映す鏡','<p>鏡から伸びた青い光が、観測室の机の方へ続いている。</p>');
      return;
    }
    if (!owned('clock')) {
      open('月を映す鏡','<p>壁に三日月の絵がある。鏡には、まだ何も映っていない。</p>');
      return;
    }
    if (state.puzzleSolved.includes('mirror')) return reward('mirror');
    open('月を映す鏡',`<p>窓に月は見えないのに、鏡の中にだけ月がある。壁の三日月は、鏡のすぐ上に描かれている。</p>
      <div class="mirror-puzzle" id="mirrorPuzzle" role="img">
        <div class="moon-trace" aria-hidden="true"></div>
        <div class="mirror-glass" aria-hidden="true"><i></i><b class="mirror-moon"></b></div>
      </div>
      <div class="buttons"><button class="btn" id="mirrorLeft" type="button">◀ 左へ傾ける</button><button class="btn" id="mirrorRight" type="button">右へ傾ける ▶</button></div>
      <p class="puzzle-feedback" id="mirrorStatus" aria-live="polite">鏡を傾けて、二つの三日月を見比べよう。</p>`);
    const board = element('mirrorPuzzle');
    function display() {
      board.style.setProperty('--moon-x',moonPositions[state.mirrorAngle]+'%');
      board.setAttribute('aria-label',`壁の三日月は右から2番目。鏡の月は左から${state.mirrorAngle+1}番目。`);
      element('mirrorLeft').disabled = state.mirrorAngle === 0;
      element('mirrorRight').disabled = state.mirrorAngle === moonPositions.length-1;
    }
    function tilt(direction) {
      state.mirrorAngle += direction;
      tap();
      display();
      if (state.mirrorAngle === 3) {
        reward('mirror','重なった月から青い光が伸び、観測室の机を照らした。');
      } else save();
    }
    element('mirrorLeft').onclick = () => tilt(-1);
    element('mirrorRight').onclick = () => tilt(1);
    display();
  }

  function eclipseNote() {
    return '<div class="paper eclipse-note"><b>日食の観測記録</b><p>太陽と地球のあいだを月が通ると、月の影が地球に届く。窓のそばの模型で、そのときの並びを再現できる。</p></div>';
  }

  function journal() {
    const state = getState();
    if (owned('journal')) {
      open('星の観測日誌',eclipseNote());
      return;
    }
    if (!owned('mirror')) {
      open('星の観測日誌','<div class="paper blank-journal" aria-hidden="true"></div><p>日誌は白紙だ。紙の端に、小さく「青い光のもとで」とある。</p>');
      return;
    }
    if (state.puzzleSolved.includes('journal')) return reward('journal','',eclipseNote());
    let answer = '';
    open('星の観測日誌',`<div class="paper blue-journal"><b>青い光で現れたページ</b>
      <p class="journal-clue">「読むのは、行の始まりだけ。」</p>
      ${journalLines.map(line=>`<p>${line}</p>`).join('')}
      </div>
      <output id="journalAnswer" aria-live="polite">□ □ □</output>
      <div class="journal-keys">${keys.map(letter=>`<button class="btn" type="button" data-journal-letter="${letter}">${letter}</button>`).join('')}</div>
      <div class="buttons"><button class="btn" id="journalErase" type="button">一文字消す</button><button class="btn primary" id="journalCheck" type="button">確かめる</button></div>
      <p class="puzzle-feedback" id="journalStatus" aria-live="polite"></p>`);
    function displayAnswer() {
      element('journalAnswer').textContent = [...answer.padEnd(3,'□')].join(' ');
      element('journalCheck').disabled = answer.length !== 3;
      element('journalErase').disabled = !answer.length;
    }
    element('modalBody').querySelectorAll('[data-journal-letter]').forEach(button => {
      button.onclick = () => {
        if (answer.length === 3) return;
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
      if (answer === 'ひかり') reward('journal','',eclipseNote());
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
    if (!owned('journal') || !owned('mirror') || !owned('clock') || !owned('books')) {
      open('天体模型','<p>太陽、地球、月を模した小さな模型。つまみのそばに「観測記録を参照」と刻まれている。</p>');
      return;
    }
    if (state.puzzleSolved.includes('orrery')) return reward('orrery');
    open('天体模型',`<p>つまみを回すと、月が地球のまわりを動く。</p>
      <div class="orrery-puzzle" id="orreryPuzzle" role="img">
        <span class="orbit-ring" aria-hidden="true"></span><span class="planet sun" aria-hidden="true"></span>
        <span class="planet earth" aria-hidden="true"></span><span class="planet moon" aria-hidden="true"></span>
        <span class="planet-label sun-label" aria-hidden="true">太陽</span><span class="planet-label earth-label" aria-hidden="true">地球</span>
      </div>
      <div class="buttons"><button class="btn" id="orbitBack" type="button">↶ 逆に回す</button><button class="btn" id="orbitNext" type="button">回す ↷</button></div>
      <div class="buttons"><button class="btn primary" id="orbitCheck" type="button">観測する</button></div>
      <p class="puzzle-feedback" id="orbitStatus" aria-live="polite"></p>`);
    const board = element('orreryPuzzle');
    function display() {
      const [x,y] = orbit[state.moonAngle];
      board.style.setProperty('--moon-x',x+'%');
      board.style.setProperty('--moon-y',y+'%');
      const directions = ['右上','右','下','左','左上'];
      board.setAttribute('aria-label',`左に太陽、右に地球。月は地球の${directions[state.moonAngle]}。`);
    }
    function rotate(direction) {
      state.moonAngle = (state.moonAngle+direction+orbit.length)%orbit.length;
      element('orbitStatus').textContent = '';
      tap();save();display();
    }
    element('orbitBack').onclick = () => rotate(-1);
    element('orbitNext').onclick = () => rotate(1);
    element('orbitCheck').onclick = () => {
      if (state.moonAngle !== 3) {
        element('orbitStatus').textContent = '光は地球まで届いている。まだ月の影は重ならない。';
        return;
      }
      reward('orrery','月の影が地球に重なった。一瞬、観測室の灯りが落ちた。');
    };
    display();
  }
  return {mirror,journal,orrery};
};
