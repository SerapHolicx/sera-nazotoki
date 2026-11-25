'use strict';

window.createObservatoryStarPuzzles = ({getState,isNight,open,save,reward,tap,element}) => {
  const orbit = [[86,25],[95,56],[70,82],[44,53],[58,25]];
  const journalLines = ['あめあがり','ひとつぶの','しずくかな'];
  const journalLetters = [...journalLines.join('')];
  const clueSlots = [5,13,4];

  function windowClue() {
    const cells = journalLetters.map((_,index) => {
      const count = clueSlots.indexOf(index)+1;
      if (!count) return '<span class="sky-clue-cell"></span>';
      return `<span class="sky-clue-cell"><span class="sky-clue-count count-${count}" aria-hidden="true">${'<i></i>'.repeat(count)}</span></span>`;
    });
    const description = clueSlots.map((index,order) => `上から${Math.floor(index/5)+1}段目、左から${index%5+1}番目に星${order+1}つ`).join('。');
    return `<div class="sky-clue-grid" role="img" aria-label="${description}">${cells.join('')}</div>`;
  }

  const owned = id => getState().got.includes(id);

  function eclipseNote() {
    return '<div class="paper eclipse-note"><b>日食の観測記録</b><div class="eclipse-diagram" role="img" aria-label="左から大きな太陽、小さな月、青い地球が一列に描かれている"><i></i><i></i><i></i></div></div>';
  }

  function journal() {
    const state = getState();
    if (owned('journal')) {
      open('星の観測日誌',eclipseNote());
      return;
    }
    if (!isNight()) {
      open('星の観測日誌','<div class="paper blank-journal" aria-hidden="true"></div><p>ページに淡い跡がある。夕日の下では、文字が見えない。</p>');
      return;
    }
    if (state.puzzleSolved.includes('journal')) return reward('journal','',eclipseNote());
    let answer = [];
    open('星の観測日誌',`<div class="paper blue-journal"><b>雨上がりの観測メモ</b>
      <div class="journal-letter-grid" aria-label="上から三行、各行五文字">${journalLetters.map((letter,index)=>`<button type="button" data-journal-cell="${index}" aria-label="上から${Math.floor(index/5)+1}段、左から${index%5+1}番目、${letter}" aria-pressed="false">${letter}</button>`).join('')}</div>
      </div>
      <output id="journalAnswer" aria-live="polite">□ □ □</output>
      <div class="buttons"><button class="btn" id="journalErase" type="button">一文字消す</button><button class="btn primary" id="journalCheck" type="button">確かめる</button></div>
      <p class="puzzle-feedback" id="journalStatus" aria-live="polite"></p>`);
    const cells = [...element('modalBody').querySelectorAll('[data-journal-cell]')];
    function displayAnswer() {
      element('journalAnswer').textContent = [...answer.map(index=>journalLetters[index]),...Array(3-answer.length).fill('□')].join(' ');
      element('journalCheck').disabled = answer.length !== 3;
      element('journalErase').disabled = !answer.length;
      cells.forEach((cell,index) => cell.setAttribute('aria-pressed', String(answer.includes(index))));
    }
    cells.forEach((button,index) => {
      button.onclick = () => {
        if (answer.length === 3 || answer.includes(index)) return;
        answer.push(index);
        element('journalStatus').textContent = '';
        tap();displayAnswer();
      };
    });
    element('journalErase').onclick = () => {
      answer.pop();
      element('journalStatus').textContent = '';
      displayAnswer();
    };
    element('journalCheck').onclick = () => {
      if (answer.length === clueSlots.length && answer.every((index,order)=>index===clueSlots[order])) reward('journal','',eclipseNote());
      else {
        element('journalStatus').textContent = '文字が青く光ったが、日誌は開かない。';
        answer = [];
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
    open('天体模型',`
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
  return {journal,orrery,windowClue};
};
