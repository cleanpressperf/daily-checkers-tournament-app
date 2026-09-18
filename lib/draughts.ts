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

function recCaptures(cur:Piece[], fromIdx:number, taken:{r:number,c:number}[]): {to:number, taken:{r:number,c:number}[]}[]{
  const p=cur[fromIdx]; if(!p) return []
  const out:{to:number,taken:{r:number,c:number}[]}[]=[]
  const takenSet=new Set(taken.map(t=>`${t.r},${t.c}`))
  for(const [dr,dc] of dirs){
    if(!p.king){
      const er=p.row+dr, ec=p.col+dc, lr=p.row+2*dr, lc=p.col+2*dc
      if(!playable(er,ec)||!playable(lr,lc)) continue
      if(takenSet.has(`${er},${ec}`)) continue
      const ei=indexAt(cur,er,ec)
      if(ei<0||cur[ei].side===p.side) continue
      if(indexAt(cur,lr,lc)>=0) continue
      const nxt=cur.filter((_,i)=>i!==fromIdx&&i!==ei)
      nxt.push({...p,row:lr,col:lc})
      const nf=indexAt(nxt,lr,lc)
      const nt=[...taken,{r:er,c:ec}]
      const further=recCaptures(nxt,nf,nt)
      if(further.length) further.forEach(f=> out.push(f))
      else out.push({to:lr*10+lc,taken:nt})
    }else{
      let r=p.row+dr,c=p.col+dc
      let e:{r:number,c:number}|null=null
      while(playable(r,c)){
        const occ=indexAt(cur,r,c)
        if(occ>=0){
          if(cur[occ].side===p.side||takenSet.has(`${r},${c}`)) break
          if(e) break
          e={r,c}
        }else if(e){
          const nxt=cur.filter((_,i)=>i!==fromIdx &&!(cur[i].row===e!.r && cur[i].col===e!.c))
          nxt.push({...p,row:r,col:c})
          const nf=indexAt(nxt,r,c)
          const nt=[...taken,e]
          const further=recCaptures(nxt,nf,nt)
          if(further.length) further.forEach(f=> out.push(f))
          else out.push({to:r*10+c,taken:nt})
        }
        r+=dr;c+=dc
      }
    }
  }
  return out
}

function capsForBoard(board:Piece[], from:number):Move[]{
  const seq=recCaptures(board,from,[])
  return seq.map(s=>{
    const capIdx=s.taken.map(t=> board.findIndex(p=>p.row===t.r&&p.col===t.c)).filter(i=>i>=0)
    return {from,to:s.to,captures:capIdx}
  })
}

function simple(board:Piece[],from:number):Move[]{
  const p=board[from]; if(!p) return []
  if(p.king){
    const m:Move[]=[]
    for(const [dr,dc] of dirs){ let r=p.row+dr,c=p.col+dc; while(playable(r,c)&&indexAt(board,r,c)<0){ m.push({from,to:r*10+c,captures:[]}); r+=dr; c+=dc } }
    return m
  }
  const dr=p.side==='white'?1:-1
  return [-1,1].map(dc=>({from,to:(p.row+dr)*10+p.col+dc,captures:[]})).filter(x=>{ const r=Math.floor(x.to/10),c=x.to%10; return playable(r,c)&&indexAt(board,r,c)<0 })
}

export function getAllCaptures(b:Piece[],pl:Side){ let a:Move[]=[]; b.forEach((_,i)=>{ if(b[i].side===pl) a=a.concat(capsForBoard(b,i)) }); return a }
export function getLegalMoves(b:Piece[],pl:Side,from?:number){
  const caps=getAllCaptures(b,pl)
  if(caps.length){ const max=Math.max(...caps.map(x=>x.captures.length)); const best=caps.filter(x=>x.captures.length===max); return from===undefined?best:best.filter(x=>x.from===from) }
  if(from!==undefined) return b[from]?.side===pl? simple(b,from):[]
  return b.flatMap((_,i)=> b[i].side===pl? simple(b,i):[])
}
export function applyMove(b:Piece[],m:Move){ const p=b[m.from]; if(!p) return b; const nb=b.filter((_,i)=> i!==m.from &&!m.captures.includes(i)); const r=Math.floor(m.to/10),c=m.to%10; nb.push({...p,row:r,col:c,king:p.king||(p.side==='white'?r===9:r===0)}); return nb }
export function botMove(b:Piece[],lvl:string){ const ms=getLegalMoves(b,'black'); if(!ms.length) return null; if(lvl==='Easy') return ms[Math.floor(Math.random()*ms.length)]; if(lvl==='Medium') return ms.sort((a,b)=>b.captures.length-a.captures.length)[0]; const ev=(x:Piece[])=>x.reduce((s,p)=>s+(p.side==='black'?100+(p.king?50:0):-100-(p.king?50:0)),0); return ms.sort((a,b)=>ev(applyMove(b,b))-ev(applyMove(b,a)))[0] }
export function moveLabel(m:Move){ return m.captures.length?`Capture ${m.captures.length}`:'Your turn' }
