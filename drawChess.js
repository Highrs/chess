'use strict';

const getSvg = require('./get-svg.js');
const tt = (x, y, obj) => Object.assign({transform:
  'translate(' + x + ', ' + y + ')'}, obj);

//properties-------------
const margin = 5;
const squareSize = 60;
const fontHeight = 35;

const pageW = ((margin*11) + (squareSize*13));
const pageH = ((margin*11) + (squareSize*10));
//-----------------------

exports.drawBoard = (boardList, listMoves, turnSide, tableOfMoves) => {
  const board = ['g', tt(margin + (squareSize + margin),
    margin + (squareSize + margin), {})];
  boardList.map((e, i) => {
    board.push(square(e, i, listMoves));
  });

  return getSvg({w:pageW, h:pageH}).concat(
    [board],
    [drawSideCoord()],
    [drawSidePanel(turnSide, tableOfMoves)]
  );
};

const square = (e, i, listMoves) => {
  const c = i & 7;
  const r = (i >> 3) & 7;
  const squareType = (c & 1)^(r & 1);
  const drawSquare = (c, r, squareColor, piece) => {
    return ['g',
      tt((squareSize + margin) * (c), (squareSize + margin) * (r), {
        class: 'selRec', id: (i)
      }),
      ['rect', { width: squareSize, height: squareSize,
        class: (squareColor + 'Square')}]
    ]
      .concat([
        (piece === null) ? [] : ['text',
        { x: (squareSize/2), y: (squareSize/2) + (fontHeight/2),
          class: ((piece.color ? 'white' : 'black') + 'Piece')},
          piece.kind.toUpperCase()]
      ])
      .concat(
        (listMoves.indexOf(i) !== -1)
          ? [drawCircle(i)]
          : (listMoves.indexOf(i + 64) !== -1)
            ? [drawCircle(i + 64)]
            : []
      );
  };
  return drawSquare(c, r, squareType ? 'black' : 'white', e);
}

const drawCircle = (i) => {
  return ['g',
    tt((squareSize / 2), (squareSize /2 ), {}),
    ['circle', { r: squareSize / 7,
      class: 'circle ' + ((i > 63) ? 'redStroke' : '')}]
  ]
}

const drawBit = (c, r, val) => {
  return ['text', {x: (squareSize + margin) * (c) + (squareSize/2),
    y: (squareSize + margin) * (r) + (squareSize/2) + (fontHeight/2),
    class: 'text', 'text-anchor': 'middle'}, val];
}

const drawSideCoord = () => {
  let sides = ['g', {}];

  for (let i = 1; i < 9; i++) {
    sides = sides.concat([
      drawBit(0, i, (9-i)),
      drawBit(9, i, (9-i)),
      drawBit(i, 0, String.fromCharCode(64 + i)),
      drawBit(i, 9, String.fromCharCode(64 + i))
    ]);
  }
  return sides;
}

const drawTable = (tableOfMoves) => {
  const drawnTableOfMoves = [];
  // for (i = 0; i < tableOfMoves.length; i++) {
  //
  // }
  return drawnTableOfMoves;
}

const drawSidePanel = (turnSide, tableOfMoves) => {

  const drawnTableOfMoves = drawTable(tableOfMoves);
  return ['g',
    tt(((margin*11) + (squareSize*10)), margin ),
    ['rect', {width: (180 - margin), height: (60 - margin), class: 'greyBox'}],
    ['text', {x: 90, y: 45,
      class: (turnSide === 0 ? 'blackPiece' : 'whitePiece')},
      (turnSide === 0 ? 'Black' : 'White')],
    ['g', tt(0, squareSize + margin),
      ['rect', {width: squareSize * 3 - margin,
        height: pageH - squareSize - margin * 3,
        class: 'greyBox'}],
      [drawnTableOfMoves]
    ]
  ];
}
