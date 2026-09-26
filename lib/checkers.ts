'use client'

export type Side = 'red' | 'black'
export type Cell = { side: Side; king: boolean } | null
export type Board = Cell[][]
export type Coord = [number, number]
export type Move = { path: Coord[]; captures: Coord[]; promotes: boolean }

export const SIZE = 10
const DIRECTIONS: readonly Coord[] = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
const inside = (row: number, col: number) => row >= 0 && row < SIZE && col >= 0 && col < SIZE
const cloneBoard = (board: Board): Board => board.map((row) => row.map((cell) => cell && { ...cell }))
const sameCoord = (a: Coord, b: Coord) => a[0] === b[0] && a[1] === b[1]

export const otherSide = (side: Side): Side => side === 'red' ? 'black' : 'red'

export function createBoard(): Board {
  return Array.from({ length: SIZE }, (_, row) => Array.from({ length: SIZE }, (_, col) => {
    if ((row + col) % 2 === 0) return null
    if (row < 4) return { side: 'black', king: false }
    if (row >= 6) return { side: 'red', king: false }
    return null
  }))
}

function captureSequences(board: Board, position: Coord, side: Side, king: boolean, path: Coord[], captures: Coord[], output: Move[]) {
  const [row, col] = position
  let found = false

  for (const [dr, dc] of DIRECTIONS) {
    if (king) {
      let distance = 1
      while (inside(row + dr * distance, col + dc * distance) && !board[row + dr * distance][col + dc * distance]) distance++
      if (!inside(row + dr * distance, col + dc * distance)) continue
      const jumped = board[row + dr * distance][col + dc * distance]
      if (!jumped || jumped.side === side) continue
      let landingDistance = distance + 1
      while (inside(row + dr * landingDistance, col + dc * landingDistance) && !board[row + dr * landingDistance][col + dc * landingDistance]) {
        found = true
        const landing: Coord = [row + dr * landingDistance, col + dc * landingDistance]
        const next = cloneBoard(board)
        next[row][col] = null
        next[jumped ? row + dr * distance : row][jumped ? col + dc * distance : col] = null
        next[landing[0]][landing[1]] = { side, king: true }
        captureSequences(next, landing, side, true, [...path, landing], [...captures, [row + dr * distance, col + dc * distance]], output)
        landingDistance++
      }
      continue
    }

    const jumpedRow = row + dr
    const jumpedCol = col + dc
    const landingRow = row + dr * 2
    const landingCol = col + dc * 2
    const jumped = inside(jumpedRow, jumpedCol) ? board[jumpedRow][jumpedCol] : null
    if (!inside(landingRow, landingCol) || !jumped || jumped.side === side || board[landingRow][landingCol]) continue

    found = true
    const landing: Coord = [landingRow, landingCol]
    const promotes = landingRow === (side === 'red' ? 0 : SIZE - 1)
    const next = cloneBoard(board)
    next[row][col] = null
    next[jumpedRow][jumpedCol] = null
    next[landingRow][landingCol] = { side, king: king || promotes }
    captureSequences(next, landing, side, king || promotes, [...path, landing], [...captures, [jumpedRow, jumpedCol]], output)
  }

  if (!found && captures.length) {
    output.push({ path, captures, promotes: !king && path.some(([row]) => row === (side === 'red' ? 0 : SIZE - 1)) })
  }
}

export function getMoves(board: Board, side: Side): Move[] {
  const captures: Move[] = []
  board.forEach((row, r) => row.forEach((cell, c) => {
    if (cell?.side === side) captureSequences(board, [r, c], side, cell.king, [[r, c]], [], captures)
  }))
  if (captures.length) {
    const longest = Math.max(...captures.map((move) => move.captures.length))
    return captures.filter((move) => move.captures.length === longest)
  }

  const moves: Move[] = []
  board.forEach((row, r) => row.forEach((cell, c) => {
    if (!cell || cell.side !== side) return
    for (const [dr, dc] of DIRECTIONS) {
      if (!cell.king && dr !== (side === 'red' ? -1 : 1)) continue
      let distance = 1
      while (inside(r + dr * distance, c + dc * distance) && !board[r + dr * distance][c + dc * distance]) {
        moves.push({ path: [[r, c], [r + dr * distance, c + dc * distance]], captures: [], promotes: !cell.king && r + dr * distance === (side === 'red' ? 0 : SIZE - 1) })
        if (!cell.king) break
        distance++
      }
    }
  }))
  return moves
}

export function applyMove(board: Board, move: Move): Board {
  const next = cloneBoard(board)
  const from = move.path[0]
  const to = move.path[move.path.length - 1]
  const piece = next[from[0]][from[1]]
  if (!piece) return next
  next[from[0]][from[1]] = null
  move.captures.forEach(([row, col]) => { next[row][col] = null })
  next[to[0]][to[1]] = { ...piece, king: piece.king || move.promotes }
  return next
}

export const countPieces = (board: Board, side?: Side) => board.flat().filter((cell) => cell && (!side || cell.side === side)).length

export function winner(board: Board, turn: Side): Side | null {
  const opponent = otherSide(turn)
  const opponentMoves = getMoves(board, opponent)
  const currentMoves = getMoves(board, turn)
  const result = countPieces(board, opponent) === 0 || opponentMoves.length === 0 ? turn : countPieces(board, turn) === 0 || currentMoves.length === 0 ? opponent : null
  if (result) console.log('[v0] game over', { winner: result, redPieces: countPieces(board, 'red'), blackPieces: countPieces(board, 'black'), opponentValidMoves: opponentMoves.length, turn })
  return result
}

export function score(board: Board, side: Side) {
  return board.flat().reduce((total, cell) => total + (cell ? (cell.side === side ? 1 : -1) * (cell.king ? 3 : 1) : 0), 0)
}

export function chooseMove(board: Board, side: Side, depth: number, mistake = 0): Move | null {
  const moves = getMoves(board, side)
  if (!moves.length) return null
  if (Math.random() < mistake) return moves[Math.floor(Math.random() * moves.length)]
  let best = moves[0]
  let bestValue = -Infinity
  const minimax = (state: Board, turn: Side, remaining: number, alpha: number, beta: number): number => {
    const options = getMoves(state, turn)
    if (!remaining || !options.length) return score(state, side)
    const maximizing = turn === side
    let value = maximizing ? -Infinity : Infinity
    for (const option of options) {
      const candidate = minimax(applyMove(state, option), otherSide(turn), remaining - 1, alpha, beta)
      value = maximizing ? Math.max(value, candidate) : Math.min(value, candidate)
      if (maximizing) alpha = Math.max(alpha, value)
      else beta = Math.min(beta, value)
      if (beta <= alpha) break
    }
    return value
  }
  for (const move of moves) {
    const value = minimax(applyMove(board, move), otherSide(side), depth - 1, -Infinity, Infinity)
    if (value > bestValue) { bestValue = value; best = move }
  }
  return best
}

export const logCounts = (board: Board, turn: Side) => console.log('[v0] counts', { red: countPieces(board, 'red'), black: countPieces(board, 'black'), validMoves: getMoves(board, turn).length, turn })
export const isSameCoord = sameCoord
