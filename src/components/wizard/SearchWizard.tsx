'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useWizardState } from '@/hooks/useWizardState'
import { WizardProgress } from './WizardProgress'
import { Step1Resort } from './steps/Step1Resort'
import { Step2Dates } from './steps/Step2Dates'
import { Step3Departure } from './steps/Step3Departure'
import { Step4Budget } from './steps/Step4Budget'
import { Step5Flights } from './steps/Step5Flights'
import { Step6Transport } from './steps/Step6Transport'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Search } from 'lucide-react'
import type { SearchParams } from '@/types/wizard'

export function SearchWizard() {
  const router = useRouter()
  const { state, dispatch, canProceed } = useWizardState()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!state.resort || !state.checkIn || !state.checkOut) return
    setSubmitting(true)

    const payload: SearchParams = {
      resortId: state.resort.id,
      departureCityIata: state.departureCityIata,
      checkIn: state.checkIn.toISOString().split('T')[0],
      checkOut: state.checkOut.toISOString().split('T')[0],
      travelers: state.travelers,
      budgetMin: state.budgetMin,
      budgetMax: state.budgetMax,
      hotelStars: state.hotelStars,
      cabinClass: state.cabinClass,
      directOnly: state.directOnly,
      flightTimePrefs: state.flightTimePrefs,
      transportTypes: state.transportTypes,
      // extended fields
      flexibleDates: state.flexibleDates,
      groupType: state.groupType,
      accommodationType: state.accommodationType,
      mealPlan: state.mealPlan,
      stopsPreference: state.stopsPreference,
    } as SearchParams & Record<string, unknown>

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      router.push(`/results?session=${data.sessionId}`)
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  const isLastStep = state.currentStep === 6

  return (
    <div className="w-full max-w-2xl mx-auto">
      <WizardProgress currentStep={state.currentStep} />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 min-h-[480px] flex flex-col">
        <div className="flex-1">
          {state.currentStep === 1 && (
            <Step1Resort
              selected={state.resort}
              onSelect={(resort) => dispatch({ type: 'SET_RESORT', resort })}
            />
          )}
          {state.currentStep === 2 && (
            <Step2Dates
              checkIn={state.checkIn}
              checkOut={state.checkOut}
              flexibleDates={state.flexibleDates}
              travelers={state.travelers}
              groupType={state.groupType}
              onDates={(checkIn, checkOut) => dispatch({ type: 'SET_DATES', checkIn, checkOut })}
              onFlexible={(value) => dispatch({ type: 'SET_FLEXIBLE_DATES', value })}
              onTravelers={(count) => dispatch({ type: 'SET_TRAVELERS', count })}
              onGroupType={(groupType) => dispatch({ type: 'SET_GROUP_TYPE', groupType })}
            />
          )}
          {state.currentStep === 3 && (
            <Step3Departure
              iata={state.departureCityIata}
              label={state.departureCityLabel}
              onSelect={(iata, label) => dispatch({ type: 'SET_DEPARTURE', iata, label })}
            />
          )}
          {state.currentStep === 4 && (
            <Step4Budget
              budgetMin={state.budgetMin}
              budgetMax={state.budgetMax}
              hotelStars={state.hotelStars}
              accommodationType={state.accommodationType}
              mealPlan={state.mealPlan}
              travelers={state.travelers}
              onBudget={(min, max) => dispatch({ type: 'SET_BUDGET', min, max })}
              onToggleStar={(star) => dispatch({ type: 'TOGGLE_HOTEL_STAR', star })}
              onAccommodationType={(value) => dispatch({ type: 'SET_ACCOMMODATION_TYPE', value })}
              onMealPlan={(value) => dispatch({ type: 'SET_MEAL_PLAN', value })}
            />
          )}
          {state.currentStep === 5 && (
            <Step5Flights
              stopsPreference={state.stopsPreference}
              flightTimePrefs={state.flightTimePrefs}
              cabinClass={state.cabinClass}
              onStops={(value) => dispatch({ type: 'SET_STOPS', value })}
              onToggleTime={(pref) => dispatch({ type: 'TOGGLE_FLIGHT_TIME', pref })}
              onCabinClass={(value) => dispatch({ type: 'SET_CABIN_CLASS', value })}
            />
          )}
          {state.currentStep === 6 && (
            <Step6Transport
              transportTypes={state.transportTypes}
              travelers={state.travelers}
              onToggle={(transportType) => dispatch({ type: 'TOGGLE_TRANSPORT', transport: transportType })}
              onAny={() => dispatch({ type: 'SET_ANY_TRANSPORT' })}
            />
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          <Button
            variant="ghost"
            onClick={() => dispatch({ type: 'PREV_STEP' })}
            disabled={state.currentStep === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Find My Trip
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => dispatch({ type: 'NEXT_STEP' })}
              disabled={!canProceed()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              Next →
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
