'use strict';

const draw = require('./drawChess.js');
const onml = require('onml');

const boardList = [
// 0   1   2   3   4   5   6   7
  'r','n','b','k','q','b','n','r', // 0
  'p','p','p','p','p','p','p','p', // 1
  ' ',' ',' ',' ',' ',' ',' ',' ', // 2
  ' ',' ',' ',' ',' ',' ',' ',' ', // 3
  ' ',' ',' ',' ',' ',' ',' ',' ', // 4
  ' ',' ',' ',' ',' ',' ',' ',' ', // 5
  'p','p','p','p','p','p','p','p', // 6
  'r','n','b','k','q','b','n','r'  // 7
];

const boardList2 = boardList.map((e, i) => {
  if (e === ' ') { return null; }
  return {kind: e, color: ((i >> 5) & 1), m: 0}
});

const deltas = {
  b: {d: [-9, -7, 7, 9], r: 8},
  r: {d: [-8, -1, 1, 8], r: 8},
  q: {d: [-9, -8, -7, -1, 1, 7, 8, 9], r: 8},
  k: {d: [-9, -8, -7, -1, 1, 7, 8, 9], r: 1},
  n: {d: [-17, -15, -10, -6, 6, 10, 15, 17], r: 1},
  p: {d: [8, 7, 9], r: 1}
};

// 0: No-go
// 1: Go
// 2: Kill

const checker = (i, delta, list, self) => {
  const i1 = i + delta;
  if ((i1 < 0) || (i1 > 63)) {
    return 0;
  }
  const c = i & 7;
  const c1 = i1 & 7;
  const cd = Math.abs(c - c1);
  if (cd > 2) { return 0; }
  const r = (i >> 3) & 7;
  const r1 = (i1 >> 3) & 7;
  const rd = Math.abs(r - r1);
  if (rd > 2) { return 0; }
  const victim = list[i1];
  if (self.kind === 'p') {
    if ( (Math.abs(delta) === 7) || (Math.abs(delta) === 9) ) {
      if (victim === null) { return 0; }
    }
    if (victim === null) { return 1; }
    if ( (Math.abs(delta) === 8) ) {
      if (victim.color !== self.color) { return 0; }
    }
  }
  if (victim === null) { return 1; }
  if (victim.color === self.color) { return 0; }
  return 2;
};

const options = (i) => {
  const self = boardList2[i];
  if (self === null) { return []; }

  return deltas[self.kind].d.flatMap((delta) => {
    const res = [];
    let curr = i;

    const checkRun = (del) => {
      let ret = 0;
      const checkRes = checker(curr, del, boardList2, self);
      curr += del;
      if (checkRes === 0) { return ret = 1; }
      if (checkRes === 2) {
        res.push(curr | 64);
        return ret = 1;
      }
      res.push(curr);
      return ret;
    }

    for (let j = 0; j < deltas[self.kind].r; j++) {
      if (self.kind === 'p') {
        (self.color === 1) ? (delta = -delta) : delta;
        if (self.m === 0 ) {
          if (checkRun(delta) === 1) { break; }
        }
      }
      if (checkRun(delta) === 1) { break; }
    }
    return res;
  });
};

const toChessFormat = (i)  => {
  return (String.fromCharCode(65 + (i & 7))) + (8 - ((i >> 3)) & 7);
}

const renderer = root => ml => {
  try {
    const html = onml.stringify(ml);
    root.innerHTML = html;
  } catch (err) {
    console.error(ml);
  }
}; // SVG Rendering Part

const mainChess = () => {

  const render = renderer(document.getElementById('content'));
  let listMoves = [];
  let moveFrom = -1;

  let turnCounter = 0;
  let turnSide = 1; // 0 is black, 1 is white

  let tableOfMoves = [];

  const rec = () => {
    render(draw.drawBoard(boardList2, listMoves, turnSide, tableOfMoves));
    for (let square of document.querySelectorAll('.selRec')) { // rec is selected
      square.addEventListener('click', () => {
        const idx = Number(square.id);

        const moveKill = (words) => {
          console.log(words + ' ' + toChessFormat(idx));
          boardList2[idx] = boardList2[moveFrom];
          boardList2[moveFrom] = null;
          boardList2[idx].m++;
          listMoves = [];
          turnCounter++;
          turnSide = (turnSide == 0 ? 1 : 0)
          console.log('Turn ' + ((turnCounter >> 1)) + '\n' + 'Side ' + turnSide);
        }

        const setSource = () => { // does turns and sets moves
          if (boardList2[idx] === null || boardList2[idx].color !== turnSide) {
            listMoves = [];
            moveFrom = 64;
          } else {
            listMoves = options(idx); // fill with piece options (or none)
            moveFrom = idx; // set source of move
          }
        }

        if (listMoves.length) { // if element present
          if (listMoves.indexOf(idx) === -1) { //if it's not a move
            if (listMoves.indexOf(idx + 64) === -1) { // if it's not a kill (>63)
              setSource();
            } else { // if it's over 63 and under 128
              moveKill('It will keal');
            }
          } else { // if it's a valid move (on the board)
            moveKill('Moving to');
          }
        } else { // list moves is empty
          setSource();
        }
        rec();
      });
    }
  };
  rec();
};

window.onload = mainChess;
