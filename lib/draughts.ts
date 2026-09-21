export type Side='black'|'white'
export type Piece={row:number,col:number,side:Side,king:boolean}
export type Move={from:number,to:number,captures:number[]}
const ok=(r:number,c:number)=>r>=0&&r<10&&c>=0&&c<10&&(r+c)%2===1
export const indexAt=(b:Piece[],r:number,c:number)=>b.findIndex(p=>p.row===r&&p.col===c)
const D:[[number,number],[number,number],[number,number],[number,number]]=[[1,1],[1,-1],[-1,1],[-1,-1]]
export const initialBoard=():Piece[]=>{
  const board:Piece[]=[]
  for(let row=0;row<10;row++) for(let col=0;col<10;col++) if(ok(row,col)) {
    if(row<4) board.push({row,col,side:'black',king:false})
    if(row>5) board.push({row,col,side:'white',king:false})
  }
  return board
}
const kingRow=(p:Piece,row:number)=>p.side==='white'?row===0:row===9
function captureMoves(board:Piece[],from:number):Move[]{
  const piece=board[from]; if(!piece)return[]; const moves:Move[]=[]
  if(piece.king){
    for(const [dr,dc] of D){let row=piece.row+dr,col=piece.col+dc;let enemy=-1
      while(ok(row,col)){const index=indexAt(board,row,col);if(index>=0){if(board[index].side===piece.side||enemy>=0)break;enemy=index}else if(enemy>=0){const next=board.filter((_,i)=>i!==from&&i!==enemy);next.push({...piece,row,col});const nextFrom=indexAt(next,row,col);const continuations=captureMoves(next,nextFrom);for(const continuation of continuations.length?continuations:[{from:nextFrom,to:row*10+col,captures:[]}])moves.push({from,to:continuation.to,captures:[enemy,...continuation.captures]})}row+=dr;col+=dc}
    }
    return moves
  }
  for(const [dr,dc] of D){const enemyRow=piece.row+dr,enemyCol=piece.col+dc,toRow=piece.row+2*dr,toCol=piece.col+2*dc
    const enemy=indexAt(board,enemyRow,enemyCol);if(!ok(enemyRow,enemyCol)||!ok(toRow,toCol)||enemy<0||board[enemy].side===piece.side||indexAt(board,toRow,toCol)>=0)continue
    const next=board.filter((_,i)=>i!==from&&i!==enemy);next.push({...piece,row:toRow,col:toCol,king:piece.king||kingRow(piece,toRow)});const nextFrom=indexAt(next,toRow,toCol);const continuations=captureMoves(next,nextFrom)
    for(const continuation of continuations.length?continuations:[{from:nextFrom,to:toRow*10+toCol,captures:[]}])moves.push({from,to:continuation.to,captures:[enemy,...continuation.captures]})
  }
  return moves
}
const simpleMoves=(board:Piece[],from:number):Move[]=>{const piece=board[from];if(!piece)return[];if(piece.king){const moves:Move[]=[];for(const [dr,dc] of D){let row=piece.row+dr,col=piece.col+dc;while(ok(row,col)&&indexAt(board,row,col)<0){moves.push({from,to:row*10+col,captures:[]});row+=dr;col+=dc}}return moves}const dr=piece.side==='white'?-1:1;return[-1,1].map(dc=>({from,to:(piece.row+dr)*10+piece.col+dc,captures:[]})).filter(move=>ok(Math.floor(move.to/10),move.to%10)&&indexAt(board,Math.floor(move.to/10),move.to%10)<0)}
export const getAllCaptures=(board:Piece[],side:Side)=>board.flatMap((piece,index)=>piece.side===side?captureMoves(board,index):[])
export const getLegalMoves=(board:Piece[],side:Side,from?:number)=>{const captures=getAllCaptures(board,side);if(captures.length){const maximum=Math.max(...captures.map(move=>move.captures.length));const legal=captures.filter(move=>move.captures.length===maximum);return from===undefined?legal:legal.filter(move=>move.from===from)}return from===undefined?board.flatMap((piece,index)=>piece.side===side?simpleMoves(board,index):[]):(board[from]?.side===side?simpleMoves(board,from):[])}
export const applyMove=(board:Piece[],move:Move)=>{const piece=board[move.from];if(!piece)return board;const next=board.filter((_,index)=>index!==move.from&&!move.captures.includes(index));const row=Math.floor(move.to/10),col=move.to%10;next.push({...piece,row,col,king:piece.king||kingRow(piece,row)});return next}
export const botMove=(board:Piece[])=>getLegalMoves(board,'black')[0]||null
export const moveLabel=(move:Move)=>move.captures.length?`Captured ${move.captures.length}`:'Your turn'
export const BOT_BOARD_RULES='FMJD International Draughts 10x10'
