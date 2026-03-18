'use client'

import type { CabinClass, FlightTimePref } from '@/types/wizard'

const STOP_OPTIONS = [
  { value: 'direct', label: 'Direct flights only', desc: 'No connections' },
  { value: 'one_stop', label: 'One stop is OK', desc: 'Max 1 connection' },
  { value: 'any', label: 'Any (cheapest)', desc: 'No filter applied' },
] as const

const TIME_OPTIONS: { value: FlightTimePref; label: string; hours: string; emoji: string }[] = [
  { value: 'MORNING', label: 'Morning', hours: '06:00 – 12:00', emoji: '🌅' },
  { value: 'AFTERNOON', label: 'Afternoon', hours: '12:00 – 18:00', emoji: '☀️' },
  { value: 'EVENING', label: 'Evening', hours: '18:00 – 00:00', emoji: '🌙' },
]

const CABIN_OPTIONS: { value: CabinClass; label: string; desc: string }[] = [
  { value: 'ECONOMY', label: 'Economy', desc: 'Standard seating' },
  { value: 'BUSINESS', label: 'Business', desc: 'Premium comfort' },
  { value: 'FIRST', label: 'First Class', desc: 'Ultimate luxury' },
]

interface Props {
  stopsPreference: 'direct' | 'one_stop' | 'any'
  flightTimePrefs: FlightTimePref[]
  cabinClass: CabinClass
  onStops: (v: 'direct' | 'one_stop' | 'any') => void
  onToggleTime: (v: FlightTimePref) => void
  onCabinClass: (v: CabinClass) => void
}

export function Step5Flights({ stopsPreference, flightTimePrefs, cabinClass, onStops, onToggleTime, onCabinClass }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Flight preferences</h2>
        <p className="text-slate-500 mt-1">Tell us what kind of flight you prefer</p>
      </div>

      {/* Stops */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Stops</label>
        <div className="space-y-2">
          {STOP_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onStops(opt.value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left
                ${stopsPreference === opt.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'}`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                ${stopsPreference === opt.value ? 'border-blue-600' : 'border-slate-300'}`}>
                {stopsPreference === opt.value && <div className="w-2 h-2 rounded-full bg-blue-600" />}
              </div>
              <div>
                <p className={`font-medium text-sm ${stopsPreference === opt.value ? 'text-blue-900' : 'text-slate-700'}`}>
                  {opt.label}
                </p>
                <p className="text-xs text-slate-400">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Departure time */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">
          Preferred departure time <span className="text-slate-400 font-normal">(select all that apply)</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onToggleTime(opt.value)}
              className={`flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 transition-all
                ${flightTimePrefs.includes(opt.value)
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="font-medium text-sm">{opt.label}</span>
              <span className="text-xs opacity-70">{opt.hours}</span>
            </button>
          ))}
        </div>
        {flightTimePrefs.length === 0 && (
          <p className="text-xs text-slate-400">None selected = any departure time</p>
        )}
      </div>

      {/* Cabin class */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Cabin class</label>
        <div className="grid grid-cols-3 gap-3">
          {CABIN_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onCabinClass(opt.value)}
              className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 transition-all
                ${cabinClass === opt.value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
            >
              <span className="font-semibold text-sm">{opt.label}</span>
              <span className="text-xs opacity-70">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
