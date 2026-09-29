export type PromotionPiece = { row: number; col: number; side: 'black' | 'white' | 'red'; king: boolean }

export const isKingRow = (row: number, side: PromotionPiece['side']) =>
  (side === 'black' && row === 9) || (side === 'white' && row === 0) || (side === 'red' && row === 0)

export function promoteIfNeeded<T extends PromotionPiece>(
  piece: T,
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

