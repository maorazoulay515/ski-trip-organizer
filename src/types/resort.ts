export interface NearbyAirport {
  iata: string
  name: string
  city: string
  distanceKm: number
  driveTimeMinutes: number
  primaryFor: boolean
}

export type SkiRegion =
  | 'alps'
  | 'scandinavia'
  | 'pyrenees'
  | 'eastern_europe'
  | 'scotland'

export interface SkiResort {
  id: string
  name: string
  region: SkiRegion
  country: string
  countryCode: string
  state?: string
  latitude: number
  longitude: number
  altitudeM: number
  skiableAreaKm2?: number
  thumbnailUrl?: string
  officialUrl?: string
  airports: NearbyAirport[]
  hotelSearchCenter: {
    latitude: number
    longitude: number
    radiusKm: number
  }
  rome2rioOriginName: string
}
