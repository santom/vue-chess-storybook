

import { Howl } from 'howler'

export function toDests(chess) {
  const dests = {};
  chess.SQUARES.forEach(s => {
    const ms = chess.moves({square: s, verbose: true});
    if (ms.length) dests[s] = ms.map(m => m.to);
  });
  return dests;
}

export function soundBoard(type) {
  var sound = new Howl({
    src: ['sound/'+type+'.mp3']
  });
  sound.play();
}

export function toColor(chess,mode) {
  const color = (chess.turn() === 'w') ? 'white' : 'black';
  if (mode) {
    if (mode[color]) {
      return color
    }
    var otherC = color === 'white' ? 'black' : 'white';
    if (mode[otherC]) {
      return otherC
    }
    if (!mode[color] && !mode[otherC]) {
      return 'undefined'
    }
  }
  return color  
}


export function otherColor(color) {
  return color === 'w' ? 'b' : 'w';
}

export function getGameState(chess) {
  const in_check = chess.in_check()
  const gameOver = chess.game_over()
  const turn = chess.turn()
  if (in_check && !gameOver){
    return {
      color: otherColor(turn),
      motiv: 'in_check'
    }
  }
  return isGameOver(chess,gameOver,turn)
}

export function isGameOver(chess,gameOver,turn) {
  if (gameOver){
    if (chess.in_checkmate()) {
      return {
        color: otherColor(turn),
        motiv: 'checkmate'
      }
    }
    if (chess.in_draw()) {
      return {
        color: 'draw',
        motiv: 'draw'
      }
    }
    if (chess.in_stalemate()) {
      return {
        color: otherColor(turn),
        motiv: 'stalemate'
      }
    }
    if (chess.in_checkmate()) {
      return {
        color: otherColor(turn),
        motiv: 'checkmate'
      }
    }
    if (chess.in_threefold_repetition()) {
      return {
        color: 'draw',
        motiv: 'in_threefold_repetition'
      }
    }
    if (chess.insufficient_material()) {
      return {
        color: 'draw',
        motiv: 'insufficient_material'
      }
    }
  }else{
    return {
      color: turn,
      motiv: false
    }
  }
}

export function changeBoardState(cg,chess,board,mode,currenPgn) {
  var move = {}
  var pgn = ''
  if (board.move) {
    move = board.move
    chess.move({
      from: move.from,
      to: move.to,
      promotion: 'q'
    })
    cg.move(move.from, move.to)
  }else{
    if (board.pgn){
      pgn = board.pgn
      if (currenPgn !== 'pgn') {
        chess.load_pgn(board.pgn)
      }      
    }else{
      if(board.fen){
        if(!chess.load(board.fen)){
          var valid = chess.validate_fen(board.fen);
          cg.set({
            fen: board.fen
          })
          chess.load(cg.getFen()+' w KQkq - 1 2')
        }
      }
    }
  }
  const fen = chess.fen()
  const history = chess.history({ verbose: true })
  const lastMove = history.length-1>=0 && history[history.length-1] && [history[history.length-1].from,history[history.length-1].to] || []
  const  shapeSet1 = lastMove[0] && lastMove[1] && [{ orig: lastMove[0] || '', dest: lastMove[1] || '', brush: 'green' }] || []  
  cg.set({
    premovable:{
      current: lastMove
    },
    lastMove:lastMove,
    predroppable:{
      enabled: true
    },
    fen: fen,
    drawable: { shapes: shapeSet1 },
    turnColor: toColor(chess),
    movable: {
      color: toColor(chess,mode),
      dests: toDests(chess)
    }
  })
  { drawable: { shapes: shapeSet1 } }
  cg.setShapes(shapeSet1);
  //cg.playPremove()
  cg.playPredrop()
  return {
    pgn: pgn !==''?pgn:chess.pgn(),
    fen: fen,
    history: history,
    state: getGameState(chess)
  }
}



export function aiGarbochessWorkerPlay(fen,GarbochessWork) {
  GarbochessWork.postMessage("position " + fen);
  var g_timeout= 1000
  GarbochessWork.postMessage("search " + g_timeout);
  return new Promise((resolve, reject) => {
    GarbochessWork.onmessage = (e) => {
      resolve(e.data)
    }
 })
}

export function aiPlay(chess, mode, worker) {
  if(mode === 'random'){
    return new Promise((resolve, reject) => {
      const moves = chess.moves({verbose:true});
      const move = moves[Math.floor(Math.random() * moves.length)];
      resolve(move)
    })
  }else{
    return aiGarbochessWorkerPlay(chess.fen(),worker)
  }
}
