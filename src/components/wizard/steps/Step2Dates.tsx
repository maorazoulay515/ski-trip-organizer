'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Users, Minus, Plus } from 'lucide-react'
import type { DateRange } from 'react-day-picker'

const GROUP_TYPES = [
  { value: 'solo', label: 'Solo', emoji: '🧍' },
  { value: 'couple', label: 'Couple', emoji: '👫' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { value: 'friends', label: 'Friends', emoji: '👯' },
] as const

interface Props {
  checkIn: Date | null
  checkOut: Date | null
  flexibleDates: boolean
  travelers: number
  groupType: 'solo' | 'couple' | 'family' | 'friends'
  onDates: (checkIn: Date, checkOut: Date) => void
  onFlexible: (val: boolean) => void
  onTravelers: (n: number) => void
  onGroupType: (g: 'solo' | 'couple' | 'family' | 'friends') => void
}

export function Step2Dates({
  checkIn, checkOut, flexibleDates, travelers, groupType,
  onDates, onFlexible, onTravelers, onGroupType,
}: Props) {
  const [range, setRange] = useState<DateRange | undefined>(
    checkIn && checkOut ? { from: checkIn, to: checkOut } : undefined
  )

  const nights = range?.from && range?.to
    ? Math.round((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))
    : null

  function handleSelect(r: DateRange | undefined) {
    setRange(r)
    if (r?.from && r?.to) onDates(r.from, r.to)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">When are you going & who's coming?</h2>
        <p className="text-slate-500 mt-1">Pick your dates and group size</p>
      </div>

      {/* Calendar */}
      <div className="border rounded-xl p-3 bg-white">
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleSelect}
          numberOfMonths={2}
          disabled={{ before: new Date() }}
          className="rounded-md"
        />
      </div>

      {/* Nights display + flexible toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarDays className="w-4 h-4" />
          {nights ? (
            <span className="font-medium">{nights} nights selected</span>
          ) : (
            <span className="text-slate-400">Select check-in and check-out dates</span>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={flexibleDates}
            onChange={(e) => onFlexible(e.target.checked)}
            className="rounded accent-blue-600"
          />
          <span className="text-slate-600">Flexible <span className="text-blue-600 font-medium">±3 days</span></span>
        </label>
      </div>

      {flexibleDates && (
        <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
          We'll check dates ±3 days around your selection to find the cheapest combination
        </p>
      )}

      {/* Traveler count */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Users className="w-4 h-4" />
          How many people?
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onTravelers(Math.max(1, travelers - 1))}
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-2xl font-bold text-slate-900 w-12 text-center">{travelers}</span>
          <button
            onClick={() => onTravelers(Math.min(10, travelers + 1))}
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <span className="text-slate-500 text-sm">{travelers === 1 ? 'person' : 'people'}</span>
        </div>
        {travelers > 4 && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
            We'll search for group-friendly rooms and transport for {travelers} people
          </p>
        )}
      </div>

      {/* Group type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Group type</label>
        <div className="flex gap-2 flex-wrap">
          {GROUP_TYPES.map((g) => (
            <button
              key={g.value}
              onClick={() => onGroupType(g.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border
                ${groupType === g.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}
            >
              {g.emoji} {g.label}
            </button>
          ))}
        </div>
      </div>

      {range?.from && range?.to && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
          <span>✓</span>
          <span>
            {range.from.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} →{' '}
            {range.to.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' '}· {nights} nights · {travelers} {travelers === 1 ? 'person' : 'people'}
          </span>
        </div>
      )}
    </div>
  )
}
