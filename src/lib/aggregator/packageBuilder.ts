import { prisma } from '@/lib/prisma'
import { getResortById } from '@/lib/resorts/loader'
import { searchFlights } from '@/lib/amadeus/flights'
import { searchHotels } from '@/lib/amadeus/hotels'
import { searchGroundTransport } from '@/lib/rome2rio/client'
import type { TripPackage } from '@/types/package'
import type { TransportType } from '@/types/wizard'

export async function buildPackages(sessionId: string): Promise<void> {
  await prisma.searchSession.update({
    where: { id: sessionId },
    data: { status: 'PROCESSING' },
  })

  try {
    const session = await prisma.searchSession.findUnique({ where: { id: sessionId } })
    if (!session) throw new Error('Session not found')

    const resort = getResortById(session.resortId)
    if (!resort) throw new Error('Resort not found')

    const checkIn = session.checkIn.toISOString().split('T')[0]
    const checkOut = session.checkOut.toISOString().split('T')[0]
    const travelers = session.travelers
    const transportTypes = session.transportTypes as TransportType[]

    // Run all airport flights + transport in parallel, plus hotels
    const [flightResults, transportResults, hotelResults] = await Promise.allSettled([
      // Flights: search all resort airports in parallel
      Promise.all(
        resort.airports.map((airport) =>
          searchFlights({
            originIata: session.departureCityIata,
            destinationIata: airport.iata,
            departureDate: checkIn,
            returnDate: checkOut,
            travelers,
            cabinClass: session.cabinClass,
            directOnly: session.directOnly,
            flightTimePrefs: session.flightTimePrefs as ('MORNING' | 'AFTERNOON' | 'EVENING')[],
          }).then((offers) => offers.map((o) => ({ ...o, airportMeta: airport })))
        )
      ).then((nested) => nested.flat()),

      // Ground transport: search all airports in parallel
      Promise.all(
        resort.airports.map((airport) =>
          searchGroundTransport({
            fromCity: airport.city,
            toPlace: resort.rome2rioOriginName,
            fromAirportIata: airport.iata,
            travelers,
            transportTypes,
          })
        )
      ).then((nested) => nested.flat()),

      // Hotels
      searchHotels({
        latitude: resort.hotelSearchCenter.latitude,
        longitude: resort.hotelSearchCenter.longitude,
        radiusKm: resort.hotelSearchCenter.radiusKm,
        checkIn,
        checkOut,
        travelers,
        hotelStars: session.hotelStars,
      }),
    ])

    const flights = flightResults.status === 'fulfilled' ? flightResults.value : []
    const transports = transportResults.status === 'fulfilled' ? transportResults.value : []
    const hotels = hotelResults.status === 'fulfilled' ? hotelResults.value : []

    if (!flights.length || !hotels.length) {
      await prisma.searchSession.update({
        where: { id: sessionId },
        data: { status: 'FAILED', packages: [] },
      })
      return
    }

    // Build all combinations and filter by budget
    const budgetTotal = session.budgetMaxUsd * travelers
    const budgetMin = session.budgetMinUsd * travelers
    const packages: TripPackage[] = []

    for (const flight of flights) {
      // Find matching transport options for this flight's arrival airport
      const matchingTransports = transports.filter(
        (t) => t.fromAirportIata === flight.destinationIata
      )
      const transportList = matchingTransports.length > 0 ? matchingTransports : transports

      for (const transport of transportList) {
        for (const hotel of hotels) {
          const grandTotal =
            flight.totalPriceUsd + transport.totalPriceUsd + hotel.totalPriceUsd

          if (grandTotal < budgetMin || grandTotal > budgetTotal) continue

          const score = computeScore({
            grandTotal,
            budgetTotal,
            isDirect: flight.isDirect,
            hotelStars: hotel.starRating,
            preferredStars: session.hotelStars,
          })

          packages.push({
            id: `${flight.bookingToken}-${transport.fromAirportIata}-${hotel.hotelId}`,
            score,
            flight: {
              outbound: flight.outbound,
              inbound: flight.inbound,
              airline: flight.airline,
              cabinClass: flight.cabinClass,
              isDirect: flight.isDirect,
              pricePerPersonUsd: flight.pricePerPersonUsd,
              totalPriceUsd: flight.totalPriceUsd,
              bookingToken: flight.bookingToken,
            },
            groundTransport: transport,
            hotel,
            pricing: {
              flightTotalUsd: flight.totalPriceUsd,
              transportTotalUsd: transport.totalPriceUsd,
              hotelTotalUsd: hotel.totalPriceUsd,
              grandTotalUsd: grandTotal,
              perPersonUsd: Math.round(grandTotal / travelers),
              travelers,
            },
          })
        }
      }
    }

    // Sort by score, take top 5
    let top = packages.sort((a, b) => b.score - a.score).slice(0, 5)

    // If fewer than 3, relax budget by 10% and retry
    if (top.length < 3) {
      const relaxedBudget = budgetTotal * 1.1
      for (const flight of flights) {
        const matchingTransports = transports.filter(
          (t) => t.fromAirportIata === flight.destinationIata
        )
        const transportList = matchingTransports.length > 0 ? matchingTransports : transports

        for (const transport of transportList) {
          for (const hotel of hotels) {
            const grandTotal =
              flight.totalPriceUsd + transport.totalPriceUsd + hotel.totalPriceUsd
            if (grandTotal > relaxedBudget) continue

            const alreadyIncluded = top.some(
              (p) =>
                p.flight.bookingToken === flight.bookingToken &&
                p.hotel.hotelId === hotel.hotelId
            )
            if (alreadyIncluded) continue

            const score = computeScore({
              grandTotal,
              budgetTotal: relaxedBudget,
              isDirect: flight.isDirect,
              hotelStars: hotel.starRating,
              preferredStars: session.hotelStars,
            })

            top.push({
              id: `${flight.bookingToken}-${transport.fromAirportIata}-${hotel.hotelId}-relaxed`,
              score,
              flight: {
                outbound: flight.outbound,
                inbound: flight.inbound,
                airline: flight.airline,
                cabinClass: flight.cabinClass,
                isDirect: flight.isDirect,
                pricePerPersonUsd: flight.pricePerPersonUsd,
                totalPriceUsd: flight.totalPriceUsd,
                bookingToken: flight.bookingToken,
              },
              groundTransport: transport,
              hotel,
              pricing: {
                flightTotalUsd: flight.totalPriceUsd,
                transportTotalUsd: transport.totalPriceUsd,
                hotelTotalUsd: hotel.totalPriceUsd,
                grandTotalUsd: grandTotal,
                perPersonUsd: Math.round(grandTotal / travelers),
                travelers,
              },
            })
          }
        }
      }
      top = top.sort((a, b) => b.score - a.score).slice(0, 5)
    }

    await prisma.searchSession.update({
      where: { id: sessionId },
      data: { status: 'COMPLETED', packages: top as object[] },
    })
  } catch (err) {
    console.error('packageBuilder error:', err)
    await prisma.searchSession.update({
      where: { id: sessionId },
      data: { status: 'FAILED', packages: [] },
    })
  }
}

function computeScore({
  grandTotal,
  budgetTotal,
  isDirect,
  hotelStars,
  preferredStars,
}: {
  grandTotal: number
  budgetTotal: number
  isDirect: boolean
  hotelStars: number
  preferredStars: number[]
}): number {
  const priceScore = (1 - grandTotal / budgetTotal) * 0.4
  const directScore = isDirect ? 0.2 : 0
  const starsScore =
    preferredStars.length > 0
      ? (preferredStars.includes(hotelStars) ? 1 : 0.5) * 0.3
      : (hotelStars / 5) * 0.3
  return priceScore + directScore + starsScore
}
