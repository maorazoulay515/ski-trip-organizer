import type { TripPackage } from '@/types/package'

export function PriceSummary({ pricing }: { pricing: TripPackage['pricing'] }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 mt-2">
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>✈ Flights ({pricing.travelers} × ${Math.round(pricing.flightTotalUsd / pricing.travelers).toLocaleString()})</span>
          <span>${pricing.flightTotalUsd.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>🚐 Transfer</span>
          <span>${pricing.transportTotalUsd.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>🏨 Hotel</span>
          <span>${pricing.hotelTotalUsd.toLocaleString()}</span>
        </div>
        <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between items-center">
          <span className="font-bold text-slate-900 text-base">Total</span>
          <div className="text-right">
            <div className="font-bold text-blue-600 text-lg">${pricing.grandTotalUsd.toLocaleString()}</div>
            <div className="text-xs text-slate-400">${pricing.perPersonUsd.toLocaleString()} per person</div>
          </div>
        </div>
      </div>
    </div>
  )
}
