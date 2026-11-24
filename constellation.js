'use strict';

const columns = 6;
const rows = 3;
const spineRows = [2, 1, 0, 1, 0, 2];
const path = [0, 1, 2, 3, 4, 5, 0];
const slotsInBookOrder = order => order.map((book, column) => spineRows[book - 1] * columns + column);
const openSlots = slotsInBookOrder([1, 2, 3, 4, 5, 6]);
const closedSlots = slotsInBookOrder([6, 5, 4, 3, 2, 1]);
const holes = Array.from({ length: columns * rows }, (_, i) => [
  (i % columns + .5) * 100 / columns,
  (Math.floor(i / columns) + .5) * 100 / rows
]);

window.seraConstellation = {
  columns, rows, path, holes, openSlots, closedSlots, slotsInBookOrder,
  points: openSlots.map(i => holes[i]),
  legacySlots: [0, 1, 2, 4, 5, 3].map(column => openSlots[column])
};
