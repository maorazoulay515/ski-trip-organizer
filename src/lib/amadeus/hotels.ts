import { amadeusGet } from './client'

export interface HotelOffer {
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

function roomsNeeded(travelers: number): number {
  if (travelers <= 2) return 1
  if (travelers <= 4) return 2
  if (travelers <= 6) return 3
  if (travelers <= 8) return 4
  return 5
}

export async function searchHotels({
  latitude,
  longitude,
  radiusKm,
  checkIn,
  checkOut,
  travelers,
  hotelStars,
}: {
  latitude: number
  longitude: number
  radiusKm: number
  checkIn: string
  checkOut: string
  travelers: number
  hotelStars: number[]
}): Promise<HotelOffer[]> {
  const nights =
    Math.round(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60 * 24)
    )

  const rooms = roomsNeeded(travelers)

  // Step 1: get hotel IDs near the resort
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const locationData = await amadeusGet('/v1/reference-data/locations/hotels/by-geocode', {
    latitude: String(latitude),
    longitude: String(longitude),
    radius: String(radiusKm),
    radiusUnit: 'KM',
    ratings: hotelStars.join(','),
  }) as any

  if (!locationData?.data?.length) return []

  const hotelIds = locationData.data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .slice(0, 20)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((h: any) => h.hotelId)
    .join(',')

  // Step 2: get offers for those hotels
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const offersData = await amadeusGet('/v3/shopping/hotel-offers', {
    hotelIds,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    adults: String(Math.ceil(travelers / rooms)),
    roomQuantity: String(rooms),
    currency: 'USD',
    bestRateOnly: 'true',
  }) as any

  if (!offersData?.data?.length) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return offersData.data.map((item: any) => {
    const offer = item.offers?.[0]
    const hotel = item.hotel
    const totalPrice = parseFloat(offer?.price?.total ?? '0') * rooms
    const pricePerRoomPerNight = totalPrice / rooms / nights

    return {
      hotelId: hotel.hotelId,
      name: hotel.name,
      starRating: parseInt(hotel.rating ?? '3', 10),
      address: hotel.address?.lines?.join(', ') ?? '',
      checkIn,
      checkOut,
      nights,
      roomsNeeded: rooms,
      roomType: offer?.room?.typeEstimated?.category ?? 'STANDARD',
      boardType: offer?.boardType ?? 'ROOM_ONLY',
      pricePerRoomPerNightUsd: Math.round(pricePerRoomPerNight),
      totalPriceUsd: Math.round(totalPrice),
      cancellationPolicy: offer?.policies?.cancellation?.description?.text ?? 'See hotel policy',
    }
  })
}
