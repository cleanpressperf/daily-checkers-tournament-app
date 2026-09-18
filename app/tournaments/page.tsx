'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, CircleDollarSign, Eye, Trophy, Users } from 'lucide-react'

const tournaments = [
  { name: 'Bronze', entry: 300, prize: 3000, joined: 24, tone: 'bg-[#f3f3f3]' },
  { name: 'Silver', entry: 700, prize: 5000, joined: 18, tone: 'bg-[#ececec]' },
  { name: 'Gold', entry: 1000, prize: 15000, joined: 29, tone: 'bg-[#e9e5d5]' },
]

function Coins({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1 font-semibold"><CircleDollarSign className="size-4 text-[#d4a900]" />{children}</span>
}

function TournamentCard({ t }: { name: string; entry: number; prize: number; joined: number; tone: string }) {
  function handleJoin(){
    let name = localStorage.getItem('boardroom_name')
    if(!name){
      let raw = prompt('Enter your first name to join:') || ''
      if(!raw) return
      raw = raw.trim().split(' ')[0]
      const id = Math.floor(1000 + Math.random()*9000)
      name = `${raw}#${id}`
      localStorage.setItem('boardroom_name', name)
      if(!localStorage.getItem('boardroom_coins')){
        localStorage.setItem('boardroom_coins', '100')
      }
    }
    let myCoins = Number(localStorage.getItem('boardroom_coins') || '100')
    if(myCoins < t.entry){
      alert(`You need ${t.entry} coins to join ${t.name}. You have ${myCoins}. Buy more.`)
      window.location.href='/buy'
      return
    }
    localStorage.setItem('boardroom_coins', String(myCoins - t.entry))
    window.location.href='/play/demo-match'
  }

  function handleWatch(e: any){
    e.preventDefault()
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Africa/Lagos', hour12: false, hour: '2-digit' }).formatToParts(new Date())
    const h = Number(parts.find(p => p.type==='hour')?.value || 0)
    if(h >= 19 && h < 20) window.location.href='/play/demo-match'
    else {
      const el = document.getElementById('watch-popup') as any
      if(el) el.style.display='flex'
    }
  }

  return (
    <article className={`${t.tone} rounded-[24px] p-5 text-black`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">{t.name} tournament</p>
          <h3 className="mt-2 text-2xl font-semibold">Win <Coins>{t.prize.toLocaleString()}</Coins></h3>
        </div>
        <span className="rounded-full bg-black/10 px-3 py-1 text-xs font-semibold">Daily 7PM WAT</span>
      </div>
      <div
