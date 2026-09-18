export type Side = 'black' | 'white'
export type Piece = { row: number; col: number; side: Side; king: boolean }
export type Move = { from: number; to: number; captures: number[] }

const playable = (r:number,c:number)=> r>=0 && r<10 && c>=0 && c<10 && (r+c)%2===1
export const indexAt = (b:Piece[],r:number,c:number)=> b.findIndex(p=>p.row===r && p.col===c)
const dirs = [[1,1],[1,-1],[-1,1],[-1,-1]] as const

export function initialBoard(): Piece[]{
  const ps:Piece[]=[]
  for(let r=0;r<10;r++) for(let c=0;c<10;c++){
    if(!playable(r,c)) continue
    if(r<4) ps.push({row:r,col:c,side:'white',king:false})
    if(r>5) ps.push({row:r,col:c,side:'black',king:false})
  }
  return ps
}

function getCaptureSequences(board:Piece[], fromIdx:number, captured:number[]): Move[]{
  const piece=board[fromIdx]; if(!piece) return []
  const res:Move[]=[]
  for(const [dr,dc] of dirs){
    if(!piece.king){
      const er=piece.row+dr, ec=piece.col+dc
      const lr=piece.row+2*dr, lc=piece.col+2*dc
      if(!playable(er,ec)||!playable(lr,lc)) continue
      const eIdx=indexAt(board,er,ec)
      if(eIdx<0||board[eIdx].side===piece.side||captured.includes(eIdx)) continue
      if(indexAt(board,lr,lc)>=0) continue
      // simulate
      const nextBoard=board.filter((_,i)=>i!==fromIdx && i!==eIdx)
      nextBoard.push({...piece,row:lr,col:lc})
      const newFrom=indexAt(nextBoard,lr,lc)
      const further=getCaptureSequences(nextBoard,newFrom,[...captured,eIdx])
      if(further.length){
        for(const f of further) res.push({from:fromIdx,to:f.to,captures:[eIdx,...f.captures]})
      }else{
        res.push({from:fromIdx,to:lr*10+lc,captures:[eIdx]})
      }
    }else{
      let r=piece.row+dr, c=piece.col+dc
      let enemyIdx=-1
      while(playable(r,c)){
        const occ=indexAt(board,r,c)
        if(occ>=0){
          if(board[occ].side===piece.side||captured.includes(occ)) break
          if(enemyIdx>=0) break // second enemy in same jump = illegal
          enemyIdx=occ
        }else if(enemyIdx>=0){
          const nextBoard=board.filter((_,i)=>i!==fromIdx && i!==enemyIdx)
          nextBoard.push({...piece,row:r,col:c})
          const newFrom=indexAt(nextBoard,r,c)
          const further=getCaptureSequences(nextBoard,newFrom,[...captured,enemyIdx])
          if(further.length){
            for(const f of further) res.push({from:fromIdx,to:f.to,captures:[enemyIdx,...f.captures]})
          }else{
            res.push({from:fromIdx,to:r*10+c,captures:[enemyIdx]})
          }
          // keep scanning for farther landing squares behind same enemy
        }
        r+=dr; c+=dc
      }
    }
  }
  return res
}

function simpleMoves(board:Piece[],from:number):Move[]{
  const p=board[from]; if(!p) return []
  if(p.king){
    const m:Move[]=[]
    for(const [dr,dc] of dirs){
      let r=p.row+dr,c=p.col+dc
      while(playable(r,c)&&indexAt(board,r,c)<0){ m.push({from,to:r*10+c,captures:[]}); r+=dr; c+=dc }
    }
    return m
  }
  const dr=p.side==='white'?1:-1
  return [-1,1].map(dc=>({from,to:(p.row+dr)*10+p.col+dc,captures:[] as number[]})).filter(x=>{
    const rr=Math.floor(x.to/10), cc=x.to%10
    return playable(rr,cc)&&indexAt(board,rr,cc)<0
  })
}

export function getAllCaptures(b:Piece[],pl:Side){
  let all:Move[]=[]
  b.forEach((_,i)=>{ if(b[i].side===pl) all=all.concat(getCaptureSequences(b,i,[])) })
  return all
}

export function getLegalMoves(b:Piece[],pl:Side,from?:number):Move[]{
  const caps=getAllCaptures(b,pl)
  if(caps.length){
    const max=Math.max(...caps.map(x=>x.captures.length))
    const best=caps.filter(x=>x.captures.length===max)
    return from===undefined? best : best.filter(x=>x.from===from)
  }
  if(from!==undefined) return b[from]?.side===pl? simpleMoves(b,from):[]
  return b.flatMap((_,i)=> b[i].side===pl? simpleMoves(b,i):[])
}

export function applyMove(b:Piece[],m:Move):Piece[]{
  const p=b[m.from]; if(!p) return b
  const nb=b.filter((_,i)=> i!==m.from &&!m.captures.includes(i))
  const r=Math.floor(m.to/10), c=m.to%10
  nb.push({...p,row:r,col:c,king:p.king||(p.side==='white'?r===9:r===0)})
  return nb
}

export function botMove(b:Piece[],lvl:string):Move|null{
  const ms=getLegalMoves(b,'black'); if(!ms.length) return null
  if(lvl==='Easy') return ms[Math.floor(Math.random()*ms.length)]
  if(lvl==='Medium') return ms.sort((a,b)=>b.captures.length-a.captures.length)[0]
  const ev=(x:Piece[])=>x.reduce((s,p)=>s+(p.side==='black'?100+(p.king?50:0):-100-(p.king?50:0)),0)
  return ms.sort((a,b)=>ev(applyMove(b,b))-ev(applyMove(b,a)))[0]
}

export function moveLabel(m:Move){ return m.captures.length?`Capture ${m.captures.length}`:'Your turn' }
