'use latest';
'use strict';

Array.prototype.count = function(item) {
  let count = 0
  for (let c = 0; c < this.length; c++) {
    if (this[c] == item)
      count++
  }
  return count
}

class AI {
  constructor({ rows = 3, cols = 3, numToWin = 3, ply = 4, board = [0, 0, 0, 0, 0, 0, 0, 0, 0], player = AI.O } = {}) {
    this.rows = rows
    this.cols = cols
    this.numToWin = numToWin
    this.ply = ply
    this.board = board
    this.player = player
    if (this.player === 'O' || this.player === '1') { this.player = AI.O }
    if (this.player === 'X' || this.player === '-1') { this.player = AI.X }
  }
  static get O() {
    return 1
  }
  static get X() {
    return -1
  }
  occupy(location, piece = this.player) {
    if (this.gameOver()) { return }
    piece = parseInt(piece, 10)
    if (piece !== AI.X && piece !== AI.O) {
      throw new Error('Invalid piece placed onto board location: [' + this.board.join(',') + '] ' + location + ' ' + piece)
    }
    if (this.board[location] !== 0) {
      throw new Error('Invalid move by AI onto occupied board location: [' + this.board.join(',') + '] ' + location + ' ' + piece)
    }
    this.board[location] = piece
    this.player = -1 * piece
    return this.board
  }
  clear() {
    this.board = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
  getFreePositions(board = this.board) {
    let moves = []
    for (let m = 0; m < board.length; m++) {
      if (board[m] === 0) {
        moves.push(m)
      }
    }
    return moves
  }
  gameOver(board = this.board) {

    return this.getFreePositions(board).length === 0 ||
      this.isWinner({ board: board, player: AI.O }) ||
      this.isWinner({ board: board, player: AI.X })
  }
  isLoser({ board = this.board, player = this.player }) {
    return this.isWinner({ board, player: player * -1 })
  }
  isWinner({ board = this.board, player = this.player }) {
    let col, row,
      diag1 = [board[0], board[4], board[8]],
      diag2 = [board[2], board[4], board[6]]

    const cwin = 3

    for (let r = 0; r < 3; r++) {
      row = board.slice(r * 3, (r * 3) + 3)

      if (row.count(player) === cwin) {
        return true
      }
      col = [board[r], board[r + 3], board[r + 6]]
      if (col.count(player) === cwin) {
        return true
      }

    }
    if (diag1.count(player) === cwin || diag2.count(player) === cwin) {
      return true
    }
    return false
  }
  score({ board = this.board, player = this.player }) {
    // 0 1 2
    // 3 4 5
    // 6 7 8

    let _score = 0,
      markScore = [0, 1, 10, 1000],
      // player = this.player,
      diag1 = [board[0], board[4], board[8]],
      diag2 = [board[2], board[4], board[6]],
      row,
      col

    for (let r = 0; r < 3; r++) {

      row = board.slice(r * 3, (r * 3) + 3)
      if (row.count(player) > 0 && row.count(-player) === 0)  {
        _score += markScore[row.count(player)]
      }
      else if (row.count(-player) > 0 && row.count(player) === 0)  {
        _score -= markScore[row.count(-player)]
      }
      col = [board[r], board[r + 3], board[r + 6]]
      if (col.count(player) > 0 && col.count(-player) === 0) {
        _score += markScore[ col.count(player) ]
      }
      else if (col.count(-player) > 0 && col.count(player) === 0) {
        _score -= markScore[col.count(-player)]
      }
    }
    if (diag1.count(player) > 0 && diag1.count(-player) === 0) {
      _score += markScore[ diag1.count(player) ]
    }
    else if (diag1.count(-player) > 0 && diag1.count(player) === 0) {
      _score -= markScore[ diag1.count(-player) ]
    }
    if (diag2.count(player) > 0 && diag2.count(-player) === 0) {
      _score += markScore[ diag2.count(player) ]
    }
    else if (diag2.count(-player) > 0 && diag2.count(player) === 0) {
      _score -= markScore[ diag2.count(-player) ]
    }
    return _score
  }

  search({ board = this.board, player = this.player }) {
    return [player, 1000, 0]
  }
}

class AIAlphaBeta extends AI {
  search({ board, player } = { board: this.board, player: this.player }) {
    if (player === 'O') { player = AI.O }
    if (player === 'X') { player = AI.X }

    let biggestValue = -Infinity,
      possMoves = this.getFreePositions(board),
      newBoard = board.slice(0),
      result,
      tryMove,
      abs
    for (let i = 0; i < possMoves.length; i++) {

      tryMove = possMoves[i]
      newBoard[tryMove] = player
      console.log("\ntrying: ", tryMove)

      if (this.isWinner({ board: newBoard, player: player })) {
        return [player, 1000, tryMove]
      }
      if (this.isLoser({ board: newBoard, player: player })) {
        return [player, -1000, tryMove]
      }
      abs = -this.negaMax(newBoard, this.ply, -Infinity, Infinity, -player)

      console.log('eval: ', [player, abs, tryMove])
      if (abs > biggestValue) {
        biggestValue = abs
        result = tryMove
      }
      newBoard[tryMove] = 0
    }
    return [player, biggestValue, result]
  }

  negaMax(state, depth, alpha, beta, player) {

    if (this.gameOver(state) || depth === 0 ||
        this.isWinner({ board: state, player: player }) ||
        this.isLoser({ board: state, player: player })) {
      return this.score({ board: state, player: player })
    }
    let possMoves = this.getFreePositions(state),
      newBoard = state.slice(0),
      tryMove,
      val

    for (let i = 0; i < possMoves.length; i++) {
      tryMove = possMoves[i]

      newBoard[tryMove] = player
      val = -this.negaMax(newBoard, depth - 1, -beta, -alpha, -player)

      if (val >= beta) {
        return val
      }

      alpha = Math.max(val, alpha)

      // undo move
      newBoard[tryMove] = 0
    }
    return alpha
  }
}

module.exports = function(ctx, cb) {
  let board = ctx.data.board.map(m => parseInt(m, 10))
  let player = ctx.data.player
  if (player === 'O') { player = AI.O }
  if (player === 'X') { player = AI.X }

  let ai = new AIAlphaBeta({ board: board, player: player })
  let [, , move] = ai.search({ board: board, player: player })
  cb(null, { board: board, player: player, move: move })
}
