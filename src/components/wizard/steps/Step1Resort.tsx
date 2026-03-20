'use client'

import { useState } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, Mountain, MapPin } from 'lucide-react'
import { useResortSearch } from '@/hooks/useResortSearch'
import type { SkiResort } from '@/types/resort'

interface Props {
  selected: SkiResort | null
  onSelect: (resort: SkiResort) => void
}

export function Step1Resort({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const { query, setQuery, results, loading } = useResortSearch()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Where do you want to ski?</h2>
        <p className="text-slate-500 mt-1">Choose a resort and we'll find you the best package</p>
      </div>

      {/* Europe badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-600 text-white">
          🌍 Europe — {results.length} resorts
        </span>
      </div>

      {/* Resort search */}
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
        <PopoverContent className="w-[min(600px,90vw)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Type to filter by name or country..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList className="max-h-[420px]">
              {loading && (
                <div className="py-6 text-center text-sm text-slate-400">Loading resorts...</div>
              )}
              {!loading && results.length === 0 && (
                <CommandEmpty>No resorts found.</CommandEmpty>
              )}
              {!loading && results.length > 0 && (
                <CommandGroup heading={`${results.length} resort${results.length !== 1 ? 's' : ''}`}>
                  {results.map((resort) => (
                    <CommandItem
                      key={resort.id}
                      value={resort.id}
                      onSelect={() => {
                        onSelect(resort)
                        setQuery('')
                        setOpen(false)
                      }}
                      className="flex items-start gap-3 py-3 cursor-pointer"
                    >
                      <Mountain className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{resort.name}</span>
                          <span className="text-xs text-slate-500">{resort.country}</span>
                          {resort.altitudeM && (
                            <span className="text-xs text-slate-400">{resort.altitudeM.toLocaleString()}m</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {resort.airports.map((a) => a.iata).join(' · ')}
                          {resort.skiableAreaKm2 && ` · ${resort.skiableAreaKm2} km²`}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
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
          <div className="flex items-center gap-1 text-sm text-slate-500 flex-wrap">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
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
