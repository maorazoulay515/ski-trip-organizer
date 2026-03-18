import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { SessionProvider } from '@/components/layout/SessionProvider'
import { Toaster } from '@/components/ui/sonner'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'AlpinAI — AI-Powered Ski Trip Planner',
  description: 'Find the best ski vacation package — flights, hotels and transfers combined in one search.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased bg-slate-50 min-h-screen`}>
        <SessionProvider>
          <Navbar />
          <main>{children}</main>
          <Toaster richColors position="top-right" />
        </SessionProvider>
      </body>
    </html>
  )
}
