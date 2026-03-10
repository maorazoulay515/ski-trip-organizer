import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { buildPackages } from '@/lib/aggregator/packageBuilder'
import type { SearchParams } from '@/types/wizard'

export async function POST(req: NextRequest) {
  const session = await auth()
  const body: SearchParams = await req.json()

  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours

  const searchSession = await prisma.searchSession.create({
    data: {
      userId: session?.user?.id ?? null,
      resortId: body.resortId,
      resortName: body.resortId, // will be overwritten by builder
      departureCityIata: body.departureCityIata,
      checkIn: new Date(body.checkIn),
      checkOut: new Date(body.checkOut),
      travelers: body.travelers,
      budgetMinUsd: body.budgetMin,
      budgetMaxUsd: body.budgetMax,
      hotelStars: body.hotelStars,
      cabinClass: body.cabinClass,
      directOnly: body.directOnly,
      flightTimePrefs: body.flightTimePrefs,
      transportTypes: body.transportTypes,
      expiresAt,
    },
  })

  // Fire and forget — client will poll for results
  buildPackages(searchSession.id).catch(console.error)

  return NextResponse.json({ sessionId: searchSession.id, status: 'PENDING' })
}
