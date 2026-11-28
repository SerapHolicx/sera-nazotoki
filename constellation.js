'use strict';

(() => {
  const columns = 5;
  const rows = 3;
  const starCount = 6;
  const boardVersion = 8;
  const spineRows = [[2], [1], [0, 1], [0], [2]];
  const numberOrder = [1, 2, 3, 4, 5];
  const wordOrder = [5, 4, 3, 2, 1];
  const slotsInBookOrder = order => order.flatMap((book, column) =>
    spineRows[book - 1].map(row => row * columns + column)
  );
  const patterns = { number: slotsInBookOrder(numberOrder), word: slotsInBookOrder(wordOrder) };
  const lastWordPatterns = {6:[0,6,12,13,4,9],7:[10,6,2,3,14,9]};
  const oldPatterns = {number:[12,7,2,9,4,17],word:[6,7,2,15,16,5]};
  const previousPatterns = {number:[12,7,2,3,10,17],word:[0,7,8,15,16,5]};

  const fiveColumnPatterns = {number:[10,6,2,12,3,9],word:[0,6,7,13,4,14]};

  const priorFiveColumnPatterns = {number:[10,1,6,2,8,14],word:[5,1,6,12,13,4]};

  function matchPattern(slots, shapes) {
    return Object.keys(shapes).find(kind =>
      slots.length === starCount && shapes[kind].every(slot => slots.includes(slot))
    ) ?? null;
  }

  function migratePlacement(slots, version) {
    if (Object.hasOwn(lastWordPatterns,version)) {
      return matchPattern(slots,{word:lastWordPatterns[version]}) ? patterns.word.slice() : slots;
    }
    if (version === 4 || version === 5) {
      const previous = matchPattern(slots,version === 4 ? fiveColumnPatterns : priorFiveColumnPatterns);
      return previous ? patterns[previous].slice() : slots;
    }
    const original = version === 2 || version === 3 ? slots
      : slots.map(slot => oldPatterns.number[[0,1,2,4,5,3][slot]]);
    const previous = matchPattern(original, version === 3 ? previousPatterns : oldPatterns);
    if (previous) return patterns[previous].slice();
    const destinationColumns = [0,1,2,2,3,4];
    return original.filter(slot => Number.isInteger(slot) && slot >= 0 && slot < 18)
      .map(slot => Math.floor(slot / 6) * columns + destinationColumns[slot % 6]);
  }

  const holes = Array.from({ length: columns * rows }, (_, i) => [
    (i % columns + .5) * 100 / columns,
    (Math.floor(i / columns) + .5) * 100 / rows
  ]);
  // Slot IDs still follow the clue grid. These coordinates only position its controls and stars.
  const displayHoles = [
    [13,24], [30,23], [47,19], [66,29], [85,23],
    [13,48], [29,45], [49,57], [68,54], [86,49],
    [12,73], [30,77], [48,81], [68,78], [88,76]
  ];
  window.seraConstellation = {
    boardVersion, columns, rows, starCount, holes, displayHoles, patterns, numberOrder, wordOrder, slotsInBookOrder, migratePlacement,
    matchGate: slots => matchPattern(slots,patterns)
  };
})();
