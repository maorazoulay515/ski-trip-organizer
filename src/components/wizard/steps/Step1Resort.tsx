'use client'

import { useState } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, Mountain, MapPin } from 'lucide-react'
import { useResortSearch } from '@/hooks/useResortSearch'
import type { SkiResort, SkiRegion } from '@/types/resort'

const REGIONS: { value: SkiRegion | null; label: string; emoji: string }[] = [
  { value: null, label: 'All', emoji: '🌍' },
  { value: 'alps', label: 'Alps', emoji: '🏔' },
  { value: 'north_america', label: 'N. America', emoji: '🌲' },
  { value: 'scandinavia', label: 'Scandinavia', emoji: '❄️' },
  { value: 'japan', label: 'Japan', emoji: '🗻' },
  { value: 'andes', label: 'Andes', emoji: '⛰' },
  { value: 'other', label: 'Other', emoji: '🌐' },
]

interface Props {
  selected: SkiResort | null
  onSelect: (resort: SkiResort) => void
}

export function Step1Resort({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const { query, setQuery, region, setRegion, results, loading } = useResortSearch()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Where do you want to ski?</h2>
        <p className="text-slate-500 mt-1">Choose a resort and we'll find you the best package</p>
      </div>

      {/* Region filter tabs */}
      <div className="flex flex-wrap gap-2">
        {REGIONS.map((r) => (
          <button
            key={r.label}
            onClick={() => setRegion(r.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
              ${region === r.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {r.emoji} {r.label}
          </button>
        ))}
      </div>

      {/* Resort combobox */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          role="combobox"
          className="w-full flex items-center justify-between h-12 px-3 rounded-md border border-slate-200 bg-white text-left text-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <Mountain className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{selected.name}</span>
              <span className="text-slate-400">{selected.country}</span>
            </span>
          ) : (
            <span className="text-slate-400">Search resorts...</span>
          )}
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search by name or country..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {loading && <div className="py-4 text-center text-sm text-slate-400">Searching...</div>}
              <CommandEmpty>No resorts found.</CommandEmpty>
              <CommandGroup>
                {results.map((resort) => (
                  <CommandItem
                    key={resort.id}
                    onSelect={() => {
                      onSelect(resort)
                      setOpen(false)
                    }}
                    className="flex items-start gap-3 py-3 cursor-pointer"
                  >
                    <Mountain className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{resort.name}</span>
                        <span className="text-xs text-slate-400">{resort.country}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {resort.airports.map((a) => a.iata).join(' · ')}
                        {resort.altitudeM && ` · ${resort.altitudeM.toLocaleString()}m`}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected resort card */}
      {selected && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Mountain className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">{selected.name}</span>
            <Badge variant="secondary">{selected.country}</Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-500">
            <MapPin className="w-3.5 h-3.5" />
            <span>Nearby airports:</span>
            {selected.airports.map((a) => (
              <Badge key={a.iata} variant="outline" className="text-xs">{a.iata}</Badge>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            We'll check all {selected.airports.length} airports and find your cheapest total arrival cost
          </p>
        </div>
      )}
    </div>
  )
}
