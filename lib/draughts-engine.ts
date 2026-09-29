import type { Piece } from './draughts'

export const isKingRow = (row: number, side: Piece['side']) =>
  (side === 'black' && row === 9) || (side === 'white' && row === 0)

export function promoteIfNeeded(
  piece: Piece,
  toRow: number,
  isCapture: boolean,
  isFinalLanding: boolean,
) {
  const reachesKingRow = isKingRow(toRow, piece.side)

  if (!reachesKingRow) {
    return { piece, promoted: false, endTurn: false }
  }

  if (!isCapture || isFinalLanding) {
    return {
      piece: { ...piece, king: true },
      promoted: !piece.king,
      endTurn: isCapture && isFinalLanding,
    }
  }

  return { piece, promoted: false, endTurn: false }
}

