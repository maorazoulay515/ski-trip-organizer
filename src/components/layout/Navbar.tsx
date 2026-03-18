'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Mountain, LayoutDashboard, LogOut, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Mountain className="w-4 h-4 text-white" />
          </div>
          <span>AlpinAI</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/search">
            <Button variant="ghost" size="sm">Plan Trip</Button>
          </Link>

          {session ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">My Trips</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="gap-2 text-slate-500"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <LogIn className="w-4 h-4" />
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
