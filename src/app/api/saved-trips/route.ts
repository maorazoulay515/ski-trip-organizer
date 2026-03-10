import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { TripPackage } from '@/types/package'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const trips = await prisma.savedTrip.findMany({
    where: { userId: session.user.id },
    orderBy: { savedAt: 'desc' },
  })

  return NextResponse.json({ trips })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchSessionId, selectedPackage }: { searchSessionId: string; selectedPackage: TripPackage } =
    await req.json()

  const searchSession = await prisma.searchSession.findUnique({
    where: { id: searchSessionId },
  })
  if (!searchSession) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  const trip = await prisma.savedTrip.create({
    data: {
      userId: session.user.id,
      searchSessionId,
      resortName: searchSession.resortName,
      resortRegion: searchSession.resortId,
      checkIn: searchSession.checkIn,
      checkOut: searchSession.checkOut,
      travelers: searchSession.travelers,
      packageSnapshot: selectedPackage as object,
      totalPriceUsd: selectedPackage.pricing.grandTotalUsd,
    },
  })

  return NextResponse.json({ id: trip.id })
}
