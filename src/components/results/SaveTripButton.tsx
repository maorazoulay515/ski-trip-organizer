'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { TripPackage } from '@/types/package'

interface Props {
  sessionId: string
  pkg: TripPackage
  isLoggedIn: boolean
}

export function SaveTripButton({ sessionId, pkg, isLoggedIn }: Props) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (!isLoggedIn) {
      toast.error('Sign in to save trips', {
        description: 'Create a free account to save and compare packages',
        action: { label: 'Sign in', onClick: () => window.location.href = '/login' },
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/saved-trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchSessionId: sessionId, selectedPackage: pkg }),
      })
      if (res.ok) {
        setSaved(true)
        toast.success('Trip saved!', { description: 'Find it in your dashboard' })
      } else {
        toast.error('Failed to save trip')
      }
    } catch {
      toast.error('Failed to save trip')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSave}
      disabled={saved || loading}
      className={`gap-2 transition-all ${saved ? 'border-pink-300 text-pink-600 bg-pink-50' : 'hover:border-pink-300 hover:text-pink-600'}`}
    >
      <Heart className={`w-4 h-4 ${saved ? 'fill-pink-500 text-pink-500' : ''}`} />
      {saved ? 'Saved' : 'Save trip'}
    </Button>
  )
}
