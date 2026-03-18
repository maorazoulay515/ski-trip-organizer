'use client'

import { Slider } from '@/components/ui/slider'
import { Hotel, Home, Utensils, Coffee, Ban } from 'lucide-react'

const STARS = [1, 2, 3, 4, 5]

const ACCOMMODATION_TYPES = [
  { value: 'hotel', label: 'Hotel', icon: Hotel },
  { value: 'apartment', label: 'Apartment / Chalet', icon: Home },
] as const

const MEAL_PLANS = [
  { value: 'BREAKFAST', label: 'Breakfast', icon: Coffee },
  { value: 'HALF_BOARD', label: 'Half-board', icon: Utensils },
  { value: 'ROOM_ONLY', label: 'No meals', icon: Ban },
] as const

interface Props {
  budgetMin: number
  budgetMax: number
  hotelStars: number[]
  accommodationType: 'hotel' | 'apartment'
  mealPlan: 'ROOM_ONLY' | 'BREAKFAST' | 'HALF_BOARD'
  travelers: number
  onBudget: (min: number, max: number) => void
  onToggleStar: (star: number) => void
  onAccommodationType: (v: 'hotel' | 'apartment') => void
  onMealPlan: (v: 'ROOM_ONLY' | 'BREAKFAST' | 'HALF_BOARD') => void
}

export function Step4Budget({
  budgetMin, budgetMax, hotelStars, accommodationType, mealPlan,
  travelers, onBudget, onToggleStar, onAccommodationType, onMealPlan,
}: Props) {
  const totalMin = budgetMin * travelers
  const totalMax = budgetMax * travelers

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Budget & accommodation</h2>
        <p className="text-slate-500 mt-1">Set your budget and preferences</p>
      </div>

      {/* Budget slider */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-slate-700">Budget per person (total trip)</label>
        <Slider
          min={300}
          max={10000}
          step={100}
          value={[budgetMin, budgetMax]}
          onValueChange={(val) => {
            const arr = Array.isArray(val) ? val : [val]
            onBudget(arr[0] ?? budgetMin, arr[1] ?? budgetMax)
          }}
          className="mt-2"
        />
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-blue-600">${budgetMin.toLocaleString()}</span>
          <span className="font-semibold text-blue-600">${budgetMax.toLocaleString()}</span>
        </div>
        <div className="bg-slate-50 rounded-lg px-4 py-2 text-sm text-slate-600">
          Total for {travelers} {travelers === 1 ? 'person' : 'people'}:{' '}
          <span className="font-semibold">${totalMin.toLocaleString()} – ${totalMax.toLocaleString()}</span>
        </div>
      </div>

      {/* Hotel stars */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Hotel star rating (select all you'd accept)</label>
        <div className="flex gap-2">
          {STARS.map((star) => (
            <button
              key={star}
              onClick={() => onToggleStar(star)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all
                ${hotelStars.includes(star)
                  ? 'bg-amber-400 border-amber-400 text-white'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-amber-300'}`}
            >
              {'⭐'.repeat(star)}
            </button>
          ))}
        </div>
        {hotelStars.length === 0 && (
          <p className="text-xs text-slate-400">None selected = show all star ratings</p>
        )}
      </div>

      {/* Accommodation type */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Accommodation type</label>
        <div className="grid grid-cols-2 gap-3">
          {ACCOMMODATION_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onAccommodationType(value)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                ${accommodationType === value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="font-medium text-sm">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Meal plan */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">Meal plan</label>
        <div className="grid grid-cols-3 gap-3">
          {MEAL_PLANS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onMealPlan(value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all
                ${mealPlan === value
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
