"use client"
import { useEffect, useState } from 'react'

const BOTS = ["Thomas Shelby","Marlo Stanfield","Stringer Bell","Avon Barksdale","Omar Little","Walter White","Jesse Pinkman","Tony Soprano","Michael Corleone","Vito Corleone","Saul Goodman","Gustavo Fring","Tony Montana","Al Capone","Pablo Escobar","El Chapo","John Gotti","Whitey Bulger","Frank Lucas","Bumpy Johnson","Don Draper","Mike Ross","Harvey Specter","Joe Goldberg","Marty Byrde","Ruth Langmore"]

export default function WatchPage(){
  const [p1,setP1]=useState(BOTS[0])
  const [p2,setP2]=useState(BOTS[1])
  const [board,setBoard]=useState<any[][]>([])

  useEffect(()=>{
    const a = BOTS[Math.floor(Math.random()*BOTS.length)]
    let b = BOTS[Math.floor(Math.random()*BOTS.length)]
    while(b===a) b = BOTS[Math.floor(Math.random()*BOTS.length)]
    setP1(a); setP2(b)
    const b10 = Array(10).fill(null).map((_,r)=>Array(10).fill(null).map((_,c)=>{
      if((r+c)%2===1){
        if(r<4) return {c:'b'}
        if(r>5) return {c:'w'}
      }
      return null
    }))
    setBoard(b10)
  },[])

  return (
    <div className="min-h-screen bg-black text-white p-4 text-center">
      <h1 className="text-2xl font-bold">{p1} <span className="text-yellow-500">VS</span> {p2}</h1>
      <p className="text-green-400 text-sm">● LIVE - Free to Watch</p>
      <div className="grid grid-cols-10 w-[350px] mx-auto mt-6 border-4 border-yellow-600">
        {board.map((row,r)=>row.map((cell,c)=>(
          <div key={`${r}-${c}`} className={`w-[35px] h-[35px] flex items-center justify-center ${(r+c)%2===0?'bg-[#f0d9b5]':'bg-[#b58863]'}`}>
            {cell && <div className={`w-6 h-6 rounded-full ${cell.c==='b'?'bg-black':'bg-white border border-black'}`}></div>}
          </div>
        )))}
      </div>
    </div>
  )
}
