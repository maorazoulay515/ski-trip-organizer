'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { SavedTripCard } from '@/components/dashboard/SavedTripCard'
import { Mountain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface SavedTrip {
  id: string
  resortName: string
  resortRegion: string
  checkIn: string
  checkOut: string
  travelers: number
  totalPriceUsd: number
  savedAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [trips, setTrips] = useState<SavedTrip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/saved-trips')
      .then((r) => r.json())
      .then((d) => setTrips(d.trips ?? []))
      .finally(() => setLoading(false))
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-8" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0,1,2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-3">
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Trips</h1>
          <p className="text-slate-500 mt-1">
            {trips.length > 0
              ? `${trips.length} saved package${trips.length > 1 ? 's' : ''}`
              : 'No saved trips yet'}
          </p>
        </div>
        <Link href="/search">
          <Button className="bg-blue-600 text-white">Plan New Trip</Button>
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-4 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
            <Mountain className="w-8 h-8 text-blue-600" />
          </div>
          <p className="font-medium text-slate-700">No saved trips yet</p>
          <p className="text-slate-400 text-sm max-w-xs">
            Search for a ski trip and save packages you like — they'll appear here.
          </p>
          <Link href="/search">
            <Button variant="outline">Start planning</Button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <SavedTripCard
              key={trip.id}
              trip={trip}
              onDelete={(id) => setTrips((prev) => prev.filter((t) => t.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  )
}
