import type { TransportType } from '@/types/wizard'

export interface TransportOption {
  type: TransportType
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

const VEHICLE_CAPACITY: Record<string, number> = {
  CAR: 4,
  SHUTTLE: 8,
  BUS: 50,
  TRAIN: 200,
}

const ROME2RIO_KIND_MAP: Record<string, TransportType> = {
  car: 'CAR',
  taxi: 'CAR',
  shuttle: 'SHUTTLE',
  bus: 'BUS',
  train: 'TRAIN',
  rail: 'TRAIN',
}

export async function searchGroundTransport({
  fromCity,
  toPlace,
  fromAirportIata,
  travelers,
  transportTypes,
}: {
  fromCity: string
  toPlace: string
  fromAirportIata: string
  travelers: number
  transportTypes: TransportType[]
}): Promise<TransportOption[]> {
  const url = new URL(`${process.env.ROME2RIO_BASE_URL}/Search`)
  url.searchParams.set('key', process.env.ROME2RIO_API_KEY!)
  url.searchParams.set('oName', fromCity)
  url.searchParams.set('dName', toPlace)
  url.searchParams.set('currencyCode', 'USD')

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) return getFallbackTransport(fromAirportIata, fromCity, toPlace, travelers, transportTypes)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json()
  const routes = data.routes ?? []

  const options: TransportOption[] = []

  for (const route of routes) {
    const kind = ROME2RIO_KIND_MAP[route.name?.toLowerCase()] ?? null
    if (!kind) continue
    if (transportTypes.length > 0 && !transportTypes.includes(kind)) continue

    const capacity = VEHICLE_CAPACITY[kind]
    const vehiclesNeeded = Math.ceil(travelers / capacity)
    const pricePerVehicle = route.indicativePrice?.price ?? 0
    const totalPrice = pricePerVehicle * vehiclesNeeded

    options.push({
      type: kind,
      providerName: route.name ?? kind,
      fromAirportIata,
      fromAirportCity: fromCity,
      toResortName: toPlace,
      durationMinutes: Math.round((route.totalDuration ?? 60) / 60),
      vehiclesNeeded,
      pricePerVehicleUsd: Math.round(pricePerVehicle),
      totalPriceUsd: Math.round(totalPrice),
    })
  }

  return options.length > 0
    ? options
    : getFallbackTransport(fromAirportIata, fromCity, toPlace, travelers, transportTypes)
}

// Fallback with realistic estimates when API returns nothing
function getFallbackTransport(
  fromAirportIata: string,
  fromCity: string,
  toPlace: string,
  travelers: number,
  transportTypes: TransportType[]
): TransportOption[] {
  const types: TransportType[] = transportTypes.length > 0 ? transportTypes : ['CAR', 'SHUTTLE']
  return types.map((type) => {
    const capacity = VEHICLE_CAPACITY[type]
    const vehiclesNeeded = Math.ceil(travelers / capacity)
    const basePrice = type === 'CAR' ? 80 : type === 'SHUTTLE' ? 30 : type === 'BUS' ? 15 : 25
    return {
      type,
      providerName: type === 'CAR' ? 'Private Transfer' : type === 'SHUTTLE' ? 'Shared Shuttle' : type,
      fromAirportIata,
      fromAirportCity: fromCity,
      toResortName: toPlace,
      durationMinutes: 90,
      vehiclesNeeded,
      pricePerVehicleUsd: basePrice,
      totalPriceUsd: basePrice * vehiclesNeeded,
    }
  })
}
