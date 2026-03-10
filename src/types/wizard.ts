import type { SkiResort } from './resort'

export type CabinClass = 'ECONOMY' | 'BUSINESS' | 'FIRST'
export type FlightTimePref = 'MORNING' | 'AFTERNOON' | 'EVENING'
export type TransportType = 'CAR' | 'SHUTTLE' | 'BUS' | 'TRAIN'

export interface WizardState {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6
  resort: SkiResort | null
  checkIn: Date | null
  checkOut: Date | null
  travelers: number
  departureCityIata: string
  departureCityLabel: string
  budgetMin: number
  budgetMax: number
  hotelStars: number[]
  cabinClass: CabinClass
  directOnly: boolean
  flightTimePrefs: FlightTimePref[]
  transportTypes: TransportType[]
}

export interface SearchParams {
  resortId: string
  departureCityIata: string
  checkIn: string
  checkOut: string
  travelers: number
  budgetMin: number
  budgetMax: number
  hotelStars: number[]
  cabinClass: CabinClass
  directOnly: boolean
  flightTimePrefs: FlightTimePref[]
  transportTypes: TransportType[]
}
