'use strict';

(() => {
  const columns = 6;
  const rows = 3;
  const spineRows = [2, 1, 0, 0, 1, 2];
  const path = [0, 1, 2, 3, 4, 5, 0];
  const numberOrder = [1, 2, 3, 4, 5, 6];
  const wordOrder = [4, 2, 5, 6, 1, 3];
  const slotsInBookOrder = order => order.map((book, column) => spineRows[book - 1] * columns + column);
  const patterns = { number: slotsInBookOrder(numberOrder), word: slotsInBookOrder(wordOrder) };
  const matchPattern = (slots, shapes) => Object.keys(shapes).find(kind =>
    slots.length === columns && shapes[kind].every(slot => slots.includes(slot))
  ) ?? null;
  const matchGate = slots => matchPattern(slots,patterns);
  const oldPatterns = {number:[12,7,2,9,4,17],word:[6,7,2,15,16,5]};
  function migratePlacement(slots, version) {
    const original = version === 2 ? slots : slots.map(slot => oldPatterns.number[[0,1,2,4,5,3][slot]]);
    const previous = matchPattern(original,oldPatterns);
    return previous ? patterns[previous].slice() : original;
  }
  const holes = Array.from({ length: columns * rows }, (_, i) => [
    (i % columns + .5) * 100 / columns,
    (Math.floor(i / columns) + .5) * 100 / rows
  ]);
  window.seraConstellation = {
    columns, rows, path, holes, patterns, matchGate, numberOrder, wordOrder, slotsInBookOrder,
    points: patterns.number.map(i => holes[i]),
    migratePlacement
  };
})();
