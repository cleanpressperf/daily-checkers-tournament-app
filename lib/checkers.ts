'use client'

export type Side = 'red' | 'black'
export type Cell = { side: Side; king: boolean } | null
export type Board = Cell[][]
export type Coord = [number, number]
export type Move = { path: Coord[]; captures: Coord[]; promotes: boolean }

export const SIZE = 10
export const otherSide = (side: Side): Side => (side === 'red' ? 'black' : 'red')
export function createBoard(): Board {
  return Array.from({ length: SIZE }, (_, r) => Array.from({ length: SIZE }, (_, c) => {
    if ((r + c) % 2 === 0) return null
    if (r < 4) return { side: 'black', king: false }
    if (r >= 6) return { side: 'red', king: false }
    return null
  }))
}
const dirs = [[-1,-1],[-1,1],[1,-1],[1,1]] as const
const inside = (r: number, c: number) => r >= 0 && r < SIZE && c >= 0 && c < SIZE
const same = (a: Coord, b: Coord) => a[0] === b[0] && a[1] === b[1]

function capturesFrom(board: Board, start: Coord, side: Side, king: boolean, path: Coord[] = [start], captures: Coord[] = [], out: Move[] = []): Move[] {
  const [r, c] = path[path.length - 1]
  let found = false
  for (const [dr, dc] of dirs) {
    if (king) {
      let i = 1
      while (inside(r + dr * i, c + dc * i) && !board[r + dr * i][c + dc * i]) i++
      if (!inside(r + dr * i, c + dc * i)) continue
      const jumped = board[r + dr * i][c + dc * i]
      if (!jumped || jumped.side === side) continue
      let j = i + 1
      while (inside(r + dr * j, c + dc * j) && !board[r + dr * j][c + dc * j]) {
        found = true
        const landing: Coord = [r + dr * j, c + dc * j]
        const next = board.map(row => row.map(cell => cell && { ...cell }))
        next[r][c] = null; next[jumped ? r + dr * i : r][jumped ? c + dc * i : c] = null; next[landing[0]][landing[1]] = { side, king: true }
        capturesFrom(next, landing, side, true, [...path, landing], [...captures, [r + dr * i, c + dc * i]], out)
        j++
      }
    } else {
      const mr = r + dr, mc = c + dc, lr = r + dr * 2, lc = c + dc * 2
      if (!inside(lr, lc) || !board[mr]?.[mc] || board[mr][mc]?.side === side || board[lr][lc]) continue
      found = true
      const jumped: Coord = [mr, mc], landing: Coord = [lr, lc]
      const next = board.map(row => row.map(cell => cell && { ...cell }))
      next[r][c] = null; next[mr][mc] = null; next[lr][lc] = { side, king: false }
      capturesFrom(next, landing, side, false, [...path, landing], [...captures, jumped], out)
    }
  }
  if (!found && captures.length) out.push({ path, captures, promotes: !king && path[path.length - 1][0] === (side === 'red' ? 0 : SIZE - 1) })
  return out
}

export function getMoves(board: Board, side: Side): Move[] {
  const captures = board.flatMap((row, r) => row.flatMap((cell, c) => cell?.side === side ? capturesFrom(board, [r,c], side, cell.king) : []))
  if (captures.length) return captures.filter(move => move.captures.length === Math.max(...captures.map(item => item.captures.length)))
  const moves: Move[] = []
  board.forEach((row, r) => row.forEach((cell, c) => {
    if (!cell || cell.side !== side) return
    for (const [dr, dc] of dirs) {
      if (!cell.king && dr !== (side === 'red' ? -1 : 1)) continue
      let i = 1
      while (inside(r + dr * i, c + dc * i) && !board[r + dr * i][c + dc * i]) {
        moves.push({ path: [[r,c], [r + dr * i, c + dc * i]], captures: [], promotes: !cell.king && r + dr * i === (side === 'red' ? 0 : SIZE - 1) })
        if (!cell.king) break
        i++
      }
    }
  }))
  return moves
}

export function applyMove(board: Board, move: Move): Board {
  const next = board.map(row => row.map(cell => cell && { ...cell }))
  const from = move.path[0], to = move.path[move.path.length - 1]
  const piece = next[from[0]][from[1]]
  if (!piece) return next
  next[from[0]][from[1]] = null
  move.captures.forEach(([r,c]) => { next[r][c] = null })
  next[to[0]][to[1]] = { ...piece, king: piece.king || move.promotes }
  return next
}
export const countPieces = (board: Board, side?: Side) => board.flat().filter(cell => cell && (!side || cell.side === side)).length
export const winner = (board: Board, turn: Side): Side | null => countPieces(board, otherSide(turn)) === 0 || getMoves(board, otherSide(turn)).length === 0 ? turn : countPieces(board, turn) === 0 || getMoves(board, turn).length === 0 ? otherSide(turn) : null
export function score(board: Board, side: Side) { return board.flat().reduce((sum, cell) => sum + (cell ? (cell.side === side ? 1 : -1) * (cell.king ? 3 : 1) : 0), 0) }
export function chooseMove(board: Board, side: Side, depth: number, mistake = 0): Move | null {
  const moves = getMoves(board, side); if (!moves.length) return null
  if (Math.random() < mistake) return moves[Math.floor(Math.random() * moves.length)]
  let best = moves[0], bestScore = -Infinity
  const minimax = (state: Board, turn: Side, d: number, alpha: number, beta: number): number => {
    const options = getMoves(state, turn); if (!d || !options.length) return score(state, side)
    const maximizing = turn === side; let value = maximizing ? -Infinity : Infinity
    for (const option of options) { const candidate = minimax(applyMove(state, option), otherSide(turn), d - 1, alpha, beta); value = maximizing ? Math.max(value, candidate) : Math.min(value, candidate); if (maximizing) alpha = Math.max(alpha, value); else beta = Math.min(beta, value); if (beta <= alpha) break }
    return value
  }
  for (const move of moves) { const value = minimax(applyMove(board, move), otherSide(side), depth - 1, -Infinity, Infinity); if (value > bestScore) { bestScore = value; best = move } }
  return best
}
export const logCounts = (board: Board, turn: Side) => console.log('[v0] counts', { red: countPieces(board, 'red'), black: countPieces(board, 'black'), validMoves: getMoves(board, turn).length, turn })

export function isSameCoord(a: Coord, b: Coord) { return same(a, b) }
