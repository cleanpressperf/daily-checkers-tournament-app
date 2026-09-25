import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import AppHeader from './components/AppHeader'
import BackgroundTournamentRunner from './components/BackgroundTournamentRunner'
import Header from './components/Header'

export const metadata: Metadata = {
  title: 'Daily Checkers | 1vs1 Arena',
  description: 'Challenge seven bots in the Daily Checkers 1vs1 arena.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: 'black' }],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black">
        <AppHeader />
        <Header />
        <BackgroundTournamentRunner />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
