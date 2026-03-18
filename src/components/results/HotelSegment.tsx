import { Hotel } from 'lucide-react'
import type { TripPackage } from '@/types/package'

const BOARD_LABELS: Record<string, string> = {
  ROOM_ONLY: 'Room only',
  BREAKFAST: 'Breakfast included',
  HALF_BOARD: 'Half-board',
}

export function HotelSegment({ hotel }: { hotel: TripPackage['hotel'] }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
        <Hotel className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-900 truncate">{hotel.name}</span>
          <span className="text-amber-400 text-sm">{'⭐'.repeat(hotel.starRating)}</span>
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          {hotel.nights} nights · {hotel.roomsNeeded} room{hotel.roomsNeeded > 1 ? 's' : ''} · {BOARD_LABELS[hotel.boardType] ?? hotel.boardType}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-bold text-slate-900">${hotel.totalPriceUsd.toLocaleString()}</div>
        <div className="text-xs text-slate-400">${hotel.pricePerRoomPerNightUsd}/room/night</div>
      </div>
    </div>
  )
}
