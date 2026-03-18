'use client'

import { useState } from 'react'
import { Trash2, Mountain, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

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

interface Props {
  trip: SavedTrip
  onDelete: (id: string) => void
}

export function SavedTripCard({ trip, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false)

  const nights = Math.round(
    (new Date(trip.checkOut).getTime() - new Date(trip.checkIn).getTime()) / (1000 * 60 * 60 * 24)
  )

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/saved-trips/${trip.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Trip removed')
        onDelete(trip.id)
      } else {
        toast.error('Failed to remove trip')
        setDeleting(false)
      }
    } catch {
      toast.error('Failed to remove trip')
      setDeleting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <Mountain className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{trip.resortName}</h3>
            <Badge variant="secondary" className="text-xs mt-0.5">{trip.resortRegion}</Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleting}
          className="text-slate-400 hover:text-red-500 shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>
            {new Date(trip.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' – '}
            {new Date(trip.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span className="text-slate-400">({nights} nights)</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span>{trip.travelers} {trip.travelers === 1 ? 'person' : 'people'}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-blue-600">${trip.totalPriceUsd.toLocaleString()}</div>
          <div className="text-xs text-slate-400">
            ${Math.round(trip.totalPriceUsd / trip.travelers).toLocaleString()} per person
          </div>
        </div>
        <div className="text-xs text-slate-400">
          Saved {new Date(trip.savedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}
