import { amadeusGet } from './client'
import type { FlightItinerary } from '@/types/package'
import type { FlightTimePref } from '@/types/wizard'

export interface FlightOffer {
  airline: string
  cabinClass: string
  isDirect: boolean
  pricePerPersonUsd: number
  totalPriceUsd: number
  outbound: FlightItinerary
  inbound: FlightItinerary
  bookingToken: string
  destinationIata: string
}

function timeOfDay(timeStr: string): FlightTimePref {
  const hour = parseInt(timeStr.split('T')[1]?.split(':')[0] ?? '12', 10)
  if (hour < 12) return 'MORNING'
  if (hour < 18) return 'AFTERNOON'
  return 'EVENING'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseItinerary(itinerary: any): FlightItinerary {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const segments = itinerary.segments.map((s: any) => ({
    departure: { iata: s.departure.iataCode, city: s.departure.iataCode, time: s.departure.at },
    arrival: { iata: s.arrival.iataCode, city: s.arrival.iataCode, time: s.arrival.at },
    duration: s.duration,
    flightNumber: s.number,
    carrierCode: s.carrierCode,
  }))
  return {
    segments,
    totalDuration: itinerary.duration,
    stops: segments.length - 1,
  }
}

export async function searchFlights({
  originIata,
  destinationIata,
  departureDate,
  returnDate,
  travelers,
  cabinClass,
  directOnly,
  flightTimePrefs,
}: {
  originIata: string
  destinationIata: string
  departureDate: string
  returnDate: string
  travelers: number
  cabinClass: string
  directOnly: boolean
  flightTimePrefs: FlightTimePref[]
}): Promise<FlightOffer[]> {
  const params: Record<string, string> = {
    originLocationCode: originIata,
    destinationLocationCode: destinationIata,
    departureDate,
    returnDate,
    adults: String(Math.min(travelers, 9)),
    travelClass: cabinClass,
    max: '15',
    currencyCode: 'USD',
  }
  if (directOnly) params.nonStop = 'true'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await amadeusGet('/v2/shopping/flight-offers', params) as any

  if (!data?.data) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let offers: FlightOffer[] = data.data.map((offer: any) => {
    const itineraries = offer.itineraries
    const outbound = parseItinerary(itineraries[0])
    const inbound = parseItinerary(itineraries[1] ?? itineraries[0])
    const pricePerPerson = Math.round(parseFloat(offer.price.grandTotal) / travelers)

    return {
      airline: offer.validatingAirlineCodes?.[0] ?? outbound.segments[0].carrierCode,
      cabinClass,
      isDirect: outbound.stops === 0 && inbound.stops === 0,
      pricePerPersonUsd: pricePerPerson,
      totalPriceUsd: Math.round(parseFloat(offer.price.grandTotal)),
      outbound,
      inbound,
      bookingToken: offer.id,
      destinationIata,
    }
  })

  // Filter by time-of-day preference if specified
  if (flightTimePrefs.length > 0) {
    const filtered = offers.filter((o) =>
      flightTimePrefs.includes(timeOfDay(o.outbound.segments[0].departure.time))
    )
    if (filtered.length > 0) offers = filtered
  }

  return offers
}
