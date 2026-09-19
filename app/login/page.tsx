'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [msg,setMsg]=useState('')
  const [isSignUp,setIsSignUp]=useState(false)

  async function handleAuth(){
    setMsg('Loading...')
    try{
      if(isSignUp){
        const {error}=await supabase.auth.signUp({email,password})
        if(error) throw error
        setMsg('Account created! Check email to confirm, then Sign In.')
        setIsSignUp(false)
      }else{
        const {error}=await supabase.auth.signInWithPassword({email,password})
        if(error) throw error
        setMsg('Signed in! Redirecting...')
        window.location.href='/'
      }
    }catch(e:any){setMsg(e.message)}
  }

  return(
    <main className="min-h-screen bg-black text-white grid place-items-center p-5">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <h1 className="text-2xl font-semibold">{isSignUp?'Create account':'Sign in'}</h1>
        <p className="mt-2 text-sm text-zinc-400">Use your email to buy coins and join tournaments</p>
        <input className="mt-6 w-full rounded-xl bg-black border border-white/10 p-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
        <input className="mt-3 w-full rounded-xl bg-black border border-white/10 p-3" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
        <button onClick={handleAuth} className="mt-4 w-full rounded-xl bg-white py-3 font-semibold text-black">{isSignUp?'Sign Up':'Sign In'}</button>
        <button onClick={()=>setIsSignUp(!isSignUp)} className="mt-3 w-full text-sm text-zinc-400">{isSignUp?'Already have account? Sign In':'No account? Sign Up'}</button>
        {msg&&<p className="mt-4 rounded-lg bg-white/10 p-3 text-sm">{msg}</p>}
        <Link href="/" className="mt-6 block text-center text-sm text-zinc-500">← Back home</Link>
      </div>
    </main>
  )
}
