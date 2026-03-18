'use client'

import { Car, Bus, Train, Users2 } from 'lucide-react'
import type { TransportType } from '@/types/wizard'

const TRANSPORT_OPTIONS: {
  value: TransportType
  label: string
  icon: React.ElementType
  capacity: number
  desc: string
  badge: string
}[] = [
  { value: 'CAR', label: 'Private Car', icon: Car, capacity: 4, desc: 'Most private & flexible', badge: '≤4 people' },
  { value: 'SHUTTLE', label: 'Shared Shuttle', icon: Users2, capacity: 8, desc: 'Most popular at ski resorts', badge: '≤8 people' },
  { value: 'BUS', label: 'Bus', icon: Bus, capacity: 50, desc: 'Cheapest option', badge: 'Any group' },
  { value: 'TRAIN', label: 'Train', icon: Train, capacity: 200, desc: 'Most scenic route', badge: 'Any group' },
]

interface Props {
  transportTypes: TransportType[]
  travelers: number
  onToggle: (type: TransportType) => void
  onAny: () => void
}

export function Step6Transport({ transportTypes, travelers, onToggle, onAny }: Props) {
  const isAny = transportTypes.length === 0

  function vehiclesNeeded(capacity: number) {
    return Math.ceil(travelers / capacity)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">How do you want to get to the resort?</h2>
        <p className="text-slate-500 mt-1">From the airport to your ski destination</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TRANSPORT_OPTIONS.map(({ value, label, icon: Icon, capacity, desc, badge }) => {
          const selected = transportTypes.includes(value)
          const vehicles = vehiclesNeeded(capacity)
          const needsMultiple = vehicles > 1

          return (
            <button
              key={value}
              onClick={() => onToggle(value)}
              className={`flex flex-col gap-2 p-4 rounded-xl border-2 transition-all text-left
                ${selected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <div className="flex items-start justify-between">
                <Icon className={`w-6 h-6 ${selected ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${selected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                  {badge}
                </span>
              </div>
              <div>
                <p className={`font-semibold text-sm ${selected ? 'text-blue-900' : 'text-slate-700'}`}>
                  {label}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
              {selected && needsMultiple && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1 mt-1">
                  {vehicles} vehicles needed for {travelers} people
                </p>
              )}
            </button>
          )
        })}
      </div>

      {/* Any option */}
      <button
        onClick={onAny}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all
          ${isAny ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
      >
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0
          ${isAny ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
          {isAny && <span className="text-white text-xs font-bold">✓</span>}
        </div>
        <div className="text-left">
          <p className={`font-medium text-sm ${isAny ? 'text-blue-900' : 'text-slate-700'}`}>
            Any option — show me all
          </p>
          <p className="text-xs text-slate-400">We'll find the best available transport at each airport</p>
        </div>
      </button>

      {travelers > 1 && (
        <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
          💡 For your group of {travelers}, shared shuttle or bus is usually the best value
        </p>
      )}
    </div>
  )
}
