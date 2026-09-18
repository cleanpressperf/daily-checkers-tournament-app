export type Side = 'black' | 'white'
export type Piece = { row: number; col: number; side: Side; king: boolean }
export type Move = { from: number; to: number; captures: number[] }

const playable = (row: number, col: number) => row >= 0 && row < 10 && col >= 0 && col < 10 && (row + col) % 2 === 1
export const indexAt = (board: Piece[], r: number, c: number) => board.findIndex(p => p.row === r && p.col === c)
const directions = [[1,1],[1,-1],[-1,1],[-1,-1]] as const

export function initialBoard(): Piece[] {
  const pieces: Piece[] = []
  for (let row = 0; row < 10; row++) for (let col = 0; col < 10; col++) {
    if (!playable(row, col)) continue
    if (row < 4) pieces.push({ row, col, side: 'white', king: false })
    if (row > 5) pieces.push({ row, col, side: 'black', king: false })
  }
  return pieces
}

function capturesFor(board: Piece[], from: number): Move[] {
  const piece = board[from]
  if (!piece) return []
  const moves: Move[] = []
  for (const [dr, dc] of directions) {
    let row = piece.row + dr
    let col = piece.col + dc
    let enemy = -1
    while (playable(row, col)) {
      const occupied = indexAt(board, row, col)
      if (occupied >= 0) {
        if (board[occupied].side === piece.side || enemy >= 0) break
        enemy = occupied
      } else if (enemy >= 0) {
        moves.push({ from: from, to: row * 10 + col, captures: [enemy] })
        if (!piece.king) break
      }
      if (!piece.king && enemy < 0) break
      row += dr; col += dc
    }
  }
  return moves
}

function simpleMovesFor(board: Piece[], from: number): Move[] {
  const piece = board[from]
  if (!piece) return []
  if (piece.king) {
    const moves: Move[] = []
    for (const [dr, dc] of directions) {
      let row = piece.row + dr, col = piece.col + dc
      while (playable(row, col) && indexAt(board, row, col) < 0) {
        moves.push({ from, to: row * 10 + col, captures: [] }); row += dr; col += dc
      }
    }
    return moves
  }
  const dr = piece.side === 'white'? 1 : -1
  return [-1, 1].map(dc => ({ from, to: (piece.row + dr) * 10 + piece.col + dc, captures: [] as number[] })).filter(move => {
    const row = Math.floor(move.to / 10), col = move.to % 10
    return playable(row, col) && indexAt(board, row, col) < 0
  })
}

export function getAllCaptures(board: Piece[], player: Side) {
  return board.flatMap((piece, index) => piece.side === player? capturesFor(board, index) : [])
}

function captureDepth(board: Piece[], move: Move): number {
  const next = applyMove(board, move)
  const row = Math.floor(move.to / 10), col = move.to % 10
  const from = indexAt(next, row, col)
  const continuations = from >= 0? capturesFor(next, from) : []
  if (continuations.length) return move.captures.length
  return Math.max(...continuations.map(nextMove => move.captures.length + captureDepth(next, nextMove)), move.captures.length)
}

export function getLegalMoves(board: Piece[], player: Side, from?: number): Move[] {
  const captures = getAllCaptures(board, player)
  if (captures.length) {
    const max = Math.max(...captures.map(m => captureDepth(board, m)))
    return captures.filter(move => captureDepth(board, move) === max && (from === undefined || move.from === from))
  }
  if (from!== undefined) return board[from]?.side === player? simpleMovesFor(board, from) : []
  return board.flatMap((piece, index) => piece.side === player? simpleMovesFor(board, index) : [])
}

export function applyMove(board: Piece[], move: Move): Piece[] {
  const piece = board[move.from]
  if (!piece) return board
  const next = board.filter((_, index) => index!== move.from &&!move.captures.includes(index))
  const row = Math.floor(move.to / 10), col = move.to % 10
  next.push({...piece, row, col, king: piece.king || (piece.side === 'white'? row === 9 : row === 0) })
  return next
}

export function botMove(board: Piece[], level: string): Move | null {
  const moves = getLegalMoves(board, 'black')
  if (!moves.length) return null
  if (level === 'Easy') return moves[Math.floor(Math.random() * moves.length)]
  if (level === 'Medium') return moves.sort((a, b) => b.captures.length - a.captures.length)[0]
  return moves.sort((a, b) => evaluate(applyMove(board, b)) - evaluate(applyMove(board, a)))[0]
}

function evaluate(board: Piece[]) {
  return board.reduce((score, piece) => score + (piece.side === 'black'? 100 + (piece.king? 50 : 0) : -100 - (piece.king? 50 : 0)), 0)
}

export function moveLabel(level: Move): string {
  return level.captures.length? `Continue capture - you must take ${level.captures.length} more` : 'White moves first'
}
