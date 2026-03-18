'use client'

import { useState, useEffect, useRef } from 'react'
import { Plane, Search, Check } from 'lucide-react'

interface AirportOption {
  iata: string
  name: string
  city: string
  country: string
  countryCode: string
}

interface Props {
  iata: string
  label: string
  onSelect: (iata: string, label: string) => void
}

export function Step3Departure({ iata, label, onSelect }: Props) {
  const [query, setQuery] = useState(label)
  const [results, setResults] = useState<AirportOption[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/airports?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.airports ?? [])
        setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 350)
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(airport: AirportOption) {
    const displayLabel = `${airport.city} (${airport.iata})`
    setQuery(displayLabel)
    onSelect(airport.iata, displayLabel)
    setOpen(false)
  }

  const flagEmoji = (code: string) => {
    if (!code || code.length !== 2) return '🌐'
    return code.toUpperCase().replace(/./g, (c) =>
      String.fromCodePoint(127397 + c.charCodeAt(0))
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Where are you flying from?</h2>
        <p className="text-slate-500 mt-1">Type your city or airport name</p>
      </div>

      <div className="relative" ref={containerRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (iata) onSelect('', '')
            }}
            placeholder="e.g. Tel Aviv, London, New York..."
            className="w-full h-12 pl-10 pr-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {open && results.length > 0 && (
          <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
            {results.map((airport) => (
              <button
                key={airport.iata}
                onMouseDown={() => handleSelect(airport)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <span className="text-xl">{flagEmoji(airport.countryCode)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 truncate">{airport.city}</span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {airport.iata}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 truncate block">{airport.name} · {airport.country}</span>
                </div>
                {iata === airport.iata && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {iata && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
          <Plane className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">{label}</p>
            <p className="text-xs text-green-600">Departure airport confirmed</p>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400">
        If your city has multiple airports (e.g. London), select the one you prefer to fly from.
      </p>
    </div>
  )
}
