import { Car, Bus, Train, Users2 } from 'lucide-react'
import type { TripPackage } from '@/types/package'

const ICONS = { CAR: Car, SHUTTLE: Users2, BUS: Bus, TRAIN: Train }

export function TransportSegment({ transport }: { transport: TripPackage['groundTransport'] }) {
  const Icon = ICONS[transport.type] ?? Car
  const pricePerPerson = Math.round(transport.totalPriceUsd / (transport.vehiclesNeeded || 1))

  return (
    <div className="flex items-center gap-4 py-3">
      <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-900">{transport.fromAirportIata}</span>
          <span className="text-slate-300">→</span>
          <span className="font-semibold text-slate-900">{transport.toResortName}</span>
          <span className="text-sm text-slate-500">{transport.durationMinutes} min</span>
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          {transport.type === 'CAR' ? 'Private transfer' : transport.providerName}
          {transport.vehiclesNeeded > 1 && ` · ${transport.vehiclesNeeded} vehicles`}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-bold text-slate-900">${transport.totalPriceUsd.toLocaleString()}</div>
        <div className="text-xs text-slate-400">total transfer</div>
      </div>
    </div>
  )
}
