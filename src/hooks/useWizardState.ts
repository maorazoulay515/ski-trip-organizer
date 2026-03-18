'use client'

import { useReducer } from 'react'
import type { SkiResort } from '@/types/resort'
import type { CabinClass, FlightTimePref, TransportType } from '@/types/wizard'

export interface WizardState {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6
  // Step 1
  resort: SkiResort | null
  // Step 2
  checkIn: Date | null
  checkOut: Date | null
  flexibleDates: boolean
  travelers: number
  groupType: 'solo' | 'couple' | 'family' | 'friends'
  // Step 3
  departureCityIata: string
  departureCityLabel: string
  // Step 4
  budgetMin: number
  budgetMax: number
  hotelStars: number[]
  accommodationType: 'hotel' | 'apartment'
  mealPlan: 'ROOM_ONLY' | 'BREAKFAST' | 'HALF_BOARD'
  // Step 5
  directOnly: boolean
  stopsPreference: 'direct' | 'one_stop' | 'any'
  flightTimePrefs: FlightTimePref[]
  cabinClass: CabinClass
  // Step 6
  transportTypes: TransportType[]
}

type WizardAction =
  | { type: 'SET_STEP'; step: WizardState['currentStep'] }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_RESORT'; resort: SkiResort }
  | { type: 'SET_DATES'; checkIn: Date; checkOut: Date }
  | { type: 'SET_FLEXIBLE_DATES'; value: boolean }
  | { type: 'SET_TRAVELERS'; count: number }
  | { type: 'SET_GROUP_TYPE'; groupType: WizardState['groupType'] }
  | { type: 'SET_DEPARTURE'; iata: string; label: string }
  | { type: 'SET_BUDGET'; min: number; max: number }
  | { type: 'TOGGLE_HOTEL_STAR'; star: number }
  | { type: 'SET_ACCOMMODATION_TYPE'; value: WizardState['accommodationType'] }
  | { type: 'SET_MEAL_PLAN'; value: WizardState['mealPlan'] }
  | { type: 'SET_STOPS'; value: WizardState['stopsPreference'] }
  | { type: 'TOGGLE_FLIGHT_TIME'; pref: FlightTimePref }
  | { type: 'SET_CABIN_CLASS'; value: CabinClass }
  | { type: 'TOGGLE_TRANSPORT'; transport: TransportType }
  | { type: 'SET_ANY_TRANSPORT' }

const initialState: WizardState = {
  currentStep: 1,
  resort: null,
  checkIn: null,
  checkOut: null,
  flexibleDates: false,
  travelers: 2,
  groupType: 'couple',
  departureCityIata: '',
  departureCityLabel: '',
  budgetMin: 500,
  budgetMax: 3000,
  hotelStars: [3, 4],
  accommodationType: 'hotel',
  mealPlan: 'BREAKFAST',
  directOnly: false,
  stopsPreference: 'any',
  flightTimePrefs: [],
  cabinClass: 'ECONOMY',
  transportTypes: [],
}

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step }
    case 'NEXT_STEP':
      return { ...state, currentStep: Math.min(6, state.currentStep + 1) as WizardState['currentStep'] }
    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(1, state.currentStep - 1) as WizardState['currentStep'] }
    case 'SET_RESORT':
      return { ...state, resort: action.resort }
    case 'SET_DATES':
      return { ...state, checkIn: action.checkIn, checkOut: action.checkOut }
    case 'SET_FLEXIBLE_DATES':
      return { ...state, flexibleDates: action.value }
    case 'SET_TRAVELERS':
      return { ...state, travelers: action.count }
    case 'SET_GROUP_TYPE':
      return { ...state, groupType: action.groupType }
    case 'SET_DEPARTURE':
      return { ...state, departureCityIata: action.iata, departureCityLabel: action.label }
    case 'SET_BUDGET':
      return { ...state, budgetMin: action.min, budgetMax: action.max }
    case 'TOGGLE_HOTEL_STAR': {
      const stars = state.hotelStars.includes(action.star)
        ? state.hotelStars.filter((s) => s !== action.star)
        : [...state.hotelStars, action.star]
      return { ...state, hotelStars: stars }
    }
    case 'SET_ACCOMMODATION_TYPE':
      return { ...state, accommodationType: action.value }
    case 'SET_MEAL_PLAN':
      return { ...state, mealPlan: action.value }
    case 'SET_STOPS':
      return { ...state, stopsPreference: action.value, directOnly: action.value === 'direct' }
    case 'TOGGLE_FLIGHT_TIME': {
      const prefs = state.flightTimePrefs.includes(action.pref)
        ? state.flightTimePrefs.filter((p) => p !== action.pref)
        : [...state.flightTimePrefs, action.pref]
      return { ...state, flightTimePrefs: prefs }
    }
    case 'SET_CABIN_CLASS':
      return { ...state, cabinClass: action.value }
    case 'TOGGLE_TRANSPORT': {
      const types = state.transportTypes.includes(action.transport)
        ? state.transportTypes.filter((t) => t !== action.transport)
        : [...state.transportTypes, action.transport]
      return { ...state, transportTypes: types }
    }
    case 'SET_ANY_TRANSPORT':
      return { ...state, transportTypes: [] }
    default:
      return state
  }
}

export function useWizardState() {
  const [state, dispatch] = useReducer(wizardReducer, initialState)

  const canProceed = (): boolean => {
    switch (state.currentStep) {
      case 1: return state.resort !== null
      case 2: return state.checkIn !== null && state.checkOut !== null
      case 3: return state.departureCityIata !== ''
      case 4: return state.budgetMax > state.budgetMin
      case 5: return true
      case 6: return true
      default: return false
    }
  }

  return { state, dispatch, canProceed }
}
