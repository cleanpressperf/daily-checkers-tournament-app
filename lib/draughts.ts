export type Side='black'|'white'
export type Piece={row:number,col:number,side:Side,king:boolean}
export type Move={from:number,to:number,captures:number[]}
const ok=(r:number,c:number)=>r>=0&&r<10&&c>=0&&c<10&&(r+c)%2==1
export const indexAt=(b:Piece[],r:number,c:number)=>b.findIndex(p=>p.row==r&&p.col==c)
const D:[[number,number],[number,number],[number,number],[number,number]]=[[1,1],[1,-1],[-1,1],[-1,-1]]
export const initialBoard=():Piece[]=>{
  const a:Piece[]=[]
  for(let r=0;r<10;r++)for(let c=0;c<10;c++)if(ok(r,c)){
    if(r<4)a.push({row:r,col:c,side:'white',king:false})
    if(r>5)a.push({row:r,col:c,side:'black',king:false})
  }
  return a
}
const kingRow=(p:Piece,r:number)=>p.side=='white'?r==9:r==0

function rec(b:Piece[],fi:number,t:{r:number,c:number}[]){
  const p=b[fi]; if(!p) return [] as any[]
  const out:any[]=[]; const seen=new Set(t.map(x=>x.r+','+x.c))
  for(const [dr,dc] of D){
    if(!p.king){
      const er=p.row+dr,ec=p.col+dc,lr=p.row+2*dr,lc=p.col+2*dc
      if(!ok(er,ec)||!ok(lr,lc)||seen.has(er+','+ec)) continue
      const ei=indexAt(b,er,ec)
      if(ei<0||b[ei].side==p.side||indexAt(b,lr,lc)>=0) continue
      if(kingRow(p,lr)){ out.push({to:lr*10+lc,t:[...t,{r:er,c:ec}]}); continue }
      const nb=b.filter((_,i)=>i!=fi&&i!=ei)
      nb.push({...p,row:lr,col:lc})
      const nf=indexAt(nb,lr,lc)
      const f=rec(nb,nf,[...t,{r:er,c:ec}])
      if(f.length) f.forEach((x:any)=>out.push(x))
      else out.push({to:lr*10+lc,t:[...t,{r:er,c:ec}]})
    } else {
      let r=p.row+dr,c=p.col+dc; let e:{r:number,c:number}|null=null
      while(ok(r,c)){
        const oc=indexAt(b,r,c)
        if(oc>=0){
          if(b[oc].side==p.side||seen.has(r+','+c)) break
          if(e) break
          e={r,c}
        } else if(e){
          const nb=b.filter((_,i)=>i!=fi&&!(b[i].row==e!.r&&b[i].col==e!.c))
          nb.push({...p,row:r,col:c})
          const nf=indexAt(nb,r,c)
          const f=rec(nb,nf,[...t,e])
          if(f.length) f.forEach((x:any)=>out.push(x))
          else out.push({to:r*10+c,t:[...t,e]})
        }
        r+=dr; c+=dc
      }
    }
  }
  return out
}

const caps=(b:Piece[],f:number):Move[]=>rec(b,f,[]).map((x:any)=>({
  from:f,to:x.to,captures:x.t.map((q:any)=>b.findIndex(p=>p.row==q.r&&p.col==q.c)).filter((i:number)=>i>=0)
}))
const simp=(b:Piece[],f:number):Move[]=>{
  const p=b[f]; if(!p) return []
  if(p.king){
    const m:Move[]=[]
    for(const [dr,dc] of D){let r=p.row+dr,c=p.col+dc;while(ok(r,c)&&indexAt(b,r,c)<0){m.push({from:f,to:r*10+c,captures:[]});r+=dr;c+=dc}}
    return m
  }
  const dr=p.side=='white'?1:-1
  return [-1,1].map(dc=>({from:f,to:(p.row+dr)*10+p.col+dc,captures:[] as number[]})).filter(x=>{const r=Math.floor(x.to/10),c=x.to%10;return ok(r,c)&&indexAt(b,r,c)<0})
}

export const getAllCaptures=(b:Piece[],pl:Side)=>{let a:Move[]=[];b.forEach((_,i)=>{if(b[i].side==pl)a=a.concat(caps(b,i))});return a}
export const getLegalMoves=(b:Piece[],pl:Side,from?:number)=>{
  const c=getAllCaptures(b,pl)
  if(c.length){const mx=Math.max(...c.map(x=>x.captures.length));const best=c.filter(x=>x.captures.length==mx);return from==undefined?best:best.filter(x=>x.from==from)}
  if(from!=undefined) return b[from]?.side==pl?simp(b,from):[]
  return b.flatMap((_,i)=>b[i].side==pl?simp(b,i):[])
}
export const applyMove=(b:Piece[],m:Move)=>{
  const p=b[m.from]; if(!p) return b
  const nb=b.filter((_,i)=>i!=m.from&&!m.captures.includes(i))
  const r=Math.floor(m.to/10),c=m.to%10
  nb.push({...p,row:r,col:c,king:p.king||kingRow(p,r)})
  return nb
}
const ev=(b:Piece[])=>{
  let s=0; for(const p of b){const v=(p.king?160:100)+(p.side=='black'?9-p.row:p.row)*2; s+=p.side=='black'?v:-v}
  s+=getLegalMoves(b,'black').length*2; s-=getLegalMoves(b,'white').length*2; return s
}
function mini(b:Piece[],d:number,a:number,be:number,max:boolean,st:number,lim:number):{s:number,m?:Move}{
  if(Date.now()-st>lim) return {s:ev(b)}
  const pl:Side=max?'black':'white'; const ms=getLegalMoves(b,pl)
  if(!d||!ms.length) return {s:ev(b)}
  ms.sort((x,y)=>y.captures.length-x.captures.length)
  let bm:Move|undefined
  if(max){let best=-Infinity;for(const mm of ms){const sc=mini(applyMove(b,mm),d-1,a,be,false,st,lim).s;if(sc>best){best=sc;bm=mm}a=Math.max(a,sc);if(be<=a)break;if(Date.now()-st>lim)break}return{s:best,m:bm}}
  else{let best=Infinity;for(const mm of ms){const sc=mini(applyMove(b,mm),d-1,a,be,true,st,lim).s;if(sc<best){best=sc;bm=mm}be=Math.min(be,sc);if(be<=a)break;if(Date.now()-st>lim)break}return{s:best,m:bm}}
}
export function botMove(b:Piece[],lvl:string):Move|null{
  const mx=getLegalMoves(b,'black'); if(!mx.length) return null
  if(lvl=='Easy'){
    const all=getAllCaptures(b,'black')
    const pool=all.length?all:b.flatMap((_,i)=>b[i].side=='black'?simp(b,i):[])
    if(Math.random()<0.7) return pool[Math.floor(Math.random()*pool.length)]
    let w=pool[0],ws=Infinity;for(const m of pool){const sc=ev(applyMove(b,m));if(sc<ws){ws=sc;w=m}}return w
  }
  if(lvl=='Medium'){
    if(Math.random()<0.5) return mx[Math.floor(Math.random()*mx.length)]
    const st=Date.now(); return mini(b,2,-Infinity,Infinity,true,st,2500).m||mx[0]
  }
  const st=Date.now(); let best=mx[0]
  for(let d=3;d<=5;d++){const lim=d==3?3000:d==4?12000:20000;const r=mini(b,d,-Infinity,Infinity,true,st,lim);if(r.m)best=r.m;if(Date.now()-st>17000)break}
  return best
}
export const moveLabel=(m:Move)=>m.captures.length?`Captured ${m.captures.length}`:'Your turn'
