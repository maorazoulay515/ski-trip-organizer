import { Plane } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { TripPackage } from '@/types/package'

export function FlightSegment({ flight }: { flight: TripPackage['flight'] }) {
  const out = flight.outbound
  const dep = out.segments[0].departure
  const arr = out.segments[out.segments.length - 1].arrival
  const depTime = dep.time ? new Date(dep.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '--'
  const arrTime = arr.time ? new Date(arr.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '--'

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
        <Plane className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-900">{dep.iata}</span>
          <span className="text-slate-300">→</span>
          <span className="font-semibold text-slate-900">{arr.iata}</span>
          <span className="text-sm text-slate-500">{depTime} – {arrTime}</span>
          <Badge variant={flight.isDirect ? 'default' : 'secondary'} className="text-xs">
            {flight.isDirect ? 'Direct' : `${out.stops} stop${out.stops > 1 ? 's' : ''}`}
          </Badge>
          <Badge variant="outline" className="text-xs">{flight.cabinClass}</Badge>
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          {flight.airline} · {out.totalDuration?.replace('PT', '').replace('H', 'h ').replace('M', 'm')} · return included
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-bold text-slate-900">${flight.pricePerPersonUsd.toLocaleString()}</div>
        <div className="text-xs text-slate-400">per person</div>
      </div>
    </div>
  )
}
