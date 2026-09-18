export type Side = 'black' | 'white'
export type Piece = { row: number; col: number; side: Side; king?: boolean }
export type Move = { from: number; to: number; captures: number[] }

export const playable = (row: number, col: number) => row >= 0 && row < 10 && col >= 0 && col < 10 && (row + col) % 2 === 1
export function initialBoard(): Piece[] {
  const pieces: Piece[] = []
  for (let row = 0; row < 10; row++) for (let col = 0; col < 10; col++) {
    if (!playable(row, col)) continue
    if (row < 4) pieces.push({ row, col, side: 'white' })
    if (row > 5) pieces.push({ row, col, side: 'black' })
  }
  return pieces
}
export function indexAt(board: Piece[], row: number, col: number) { return board.findIndex(p => p.row === row && p.col === col) }
const dirs = [[-1,-1],[-1,1],[1,-1],[1,1]] as const
function capturesFor(board: Piece[], player: Side, from: number): Move[] {
  const p = board[from]; if (!p || p.side !== player) return []
  const out: Move[] = []
  if (!p.king) {
    for (const [dr, dc] of dirs) {
      const mid = indexAt(board, p.row + dr, p.col + dc), land = indexAt(board, p.row + dr * 2, p.col + dc * 2)
      if (playable(p.row + dr * 2, p.col + dc * 2) && mid >= 0 && board[mid].side !== player && land < 0) out.push({ from, to: ((p.row + dr * 2) * 10 + p.col + dc * 2), captures: [mid] })
    }
  } else {
    for (const [dr, dc] of dirs) { let r = p.row + dr, c = p.col + dc, enemy = -1; while (playable(r,c)) { const i=indexAt(board,r,c); if(i>=0){ if(board[i].side===player || enemy>=0) break; enemy=i } else if(enemy>=0) out.push({from,to:r*10+c,captures:[enemy]}); r+=dr;c+=dc } }
  }
  return out
}
export function getLegalMoves(board: Piece[], player: Side, from?: number): Move[] {
  const captures = board.flatMap((p,i) => p.side === player ? capturesFor(board, player, i) : [])
  if (captures.length) return from === undefined ? captures : captures.filter(m => m.from === from)
  if (from !== undefined) {
    const p=board[from]; if(!p||p.side!==player)return []
    if(p.king){ const out:Move[]=[]; for(const [dr,dc] of dirs){let r=p.row+dr,c=p.col+dc;while(playable(r,c)&&indexAt(board,r,c)<0){out.push({from,to:r*10+c,captures:[]});r+=dr;c+=dc}} return out }
    const dr=player==='black'?-1:1; return [-1,1].map(dc=>({from,to:(p.row+dr)*10+p.col+dc,captures:[]})).filter(m=>playable(Math.floor(m.to/10),m.to%10)&&indexAt(board,Math.floor(m.to/10),m.to%10)<0)
  }
  return board.flatMap((p,i)=>p.side===player?getLegalMoves(board,player,i):[])
}
export function applyMove(board: Piece[], move: Move): Piece[] { const next=board.filter((_,i)=>!move.captures.includes(i)&&i!==move.from); const p=board[move.from]; const row=Math.floor(move.to/10),col=move.to%10; next.push({...p,row,col,king:p.king|| (p.side==='black'&&row===0)||(p.side==='white'&&row===9)}); return next }
export function botMove(board: Piece[], level: string): Move | null { const moves=getLegalMoves(board,'white'); if(!moves.length)return null; if(level==='Easy')return moves[Math.floor(Math.random()*moves.length)]; if(level==='Medium')return [...moves].sort((a,b)=>b.captures.length-a.captures.length)[0]; return [...moves].sort((a,b)=>score(applyMove(board,b))-score(applyMove(board,a)))[0] }
function score(board: Piece[]){return board.reduce((n,p)=>n+(p.side==='white'?1+(p.king?.5:0):-1-(p.king?.5:0)),0)}
