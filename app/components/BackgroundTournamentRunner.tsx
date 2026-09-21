'use client'

import { useEffect } from 'react'

export default function BackgroundTournamentRunner() {
  useEffect(() => {
    const run = () => {
      void fetch('/api/cron/fill-brackets', { cache: 'no-store' }).catch(() => undefined)
      void fetch('/api/cron/auto-play', { cache: 'no-store' }).catch(() => undefined)
    }
    run()
    const timer = window.setInterval(run, 30000)
    return () => window.clearInterval(timer)
  }, [])
  return null
}
