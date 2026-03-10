export interface FlightSegment {
  departure: { iata: string; city: string; time: string }
  arrival: { iata: string; city: string; time: string }
  duration: string
  flightNumber: string
  carrierCode: string
}

export interface FlightItinerary {
  segments: FlightSegment[]
  totalDuration: string
  stops: number
}

export interface TripPackage {
  id: string
  score: number

  flight: {
    outbound: FlightItinerary
    inbound: FlightItinerary
    airline: string
    cabinClass: string
    isDirect: boolean
    pricePerPersonUsd: number
    totalPriceUsd: number
    bookingToken?: string
  }

  groundTransport: {
    type: 'CAR' | 'SHUTTLE' | 'BUS' | 'TRAIN'
    providerName: string
    fromAirportIata: string
    fromAirportCity: string
    toResortName: string
    durationMinutes: number
    vehiclesNeeded: number
    pricePerVehicleUsd: number
    totalPriceUsd: number
    bookingUrl?: string
  }

  hotel: {
    hotelId: string
    name: string
    starRating: number
    thumbnailUrl?: string
    address: string
    checkIn: string
    checkOut: string
    nights: number
    roomsNeeded: number
    roomType: string
    boardType: string
    pricePerRoomPerNightUsd: number
    totalPriceUsd: number
    cancellationPolicy: string
    bookingUrl?: string
  }

  pricing: {
    flightTotalUsd: number
    transportTotalUsd: number
    hotelTotalUsd: number
    grandTotalUsd: number
    perPersonUsd: number
    travelers: number
  }
}
