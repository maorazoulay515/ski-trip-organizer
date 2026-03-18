import { amadeusGet } from './client'

export interface AirportOption {
  iata: string
  name: string
  city: string
  country: string
  countryCode: string
}

export async function searchAirports(keyword: string): Promise<AirportOption[]> {
  if (!keyword || keyword.length < 2) return []

  try {
    const data = await amadeusGet('/v1/reference-data/locations', {
      keyword,
      subType: 'AIRPORT,CITY',
      'page[limit]': '10',
    }) as { data?: unknown[] }

    if (!data?.data) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.data.map((loc: any) => ({
      iata: loc.iataCode,
      name: loc.name,
      city: loc.address?.cityName ?? loc.name,
      country: loc.address?.countryName ?? '',
      countryCode: loc.address?.countryCode ?? '',
    }))
  } catch {
    return []
  }
}
