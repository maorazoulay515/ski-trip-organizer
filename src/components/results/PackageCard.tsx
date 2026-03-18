import { FlightSegment } from './FlightSegment'
import { TransportSegment } from './TransportSegment'
import { HotelSegment } from './HotelSegment'
import { PriceSummary } from './PriceSummary'
import { SaveTripButton } from './SaveTripButton'
import type { TripPackage } from '@/types/package'

interface Props {
  pkg: TripPackage
  sessionId: string
  isLoggedIn: boolean
  rank: number
}

const RANK_LABELS = ['Best Match', 'Great Value', 'Alternative', '', '']
const RANK_COLORS = ['bg-blue-600', 'bg-green-600', 'bg-slate-500', '', '']

export function PackageCard({ pkg, sessionId, isLoggedIn, rank }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {rank < 3 && (
            <span className={`text-xs font-semibold text-white px-2.5 py-1 rounded-full ${RANK_COLORS[rank]}`}>
              {RANK_LABELS[rank]}
            </span>
          )}
          <span className="text-sm text-slate-500">Option {rank + 1}</span>
        </div>
        <SaveTripButton sessionId={sessionId} pkg={pkg} isLoggedIn={isLoggedIn} />
      </div>

      {/* Segments */}
      <div className="px-6 divide-y divide-slate-100">
        <FlightSegment flight={pkg.flight} />
        <TransportSegment transport={pkg.groundTransport} />
        <HotelSegment hotel={pkg.hotel} />
      </div>

      {/* Price summary */}
      <div className="px-6 pb-6">
        <PriceSummary pricing={pkg.pricing} />
      </div>
    </div>
  )
}
