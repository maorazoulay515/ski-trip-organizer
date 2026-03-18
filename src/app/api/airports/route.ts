import { NextRequest, NextResponse } from 'next/server'
import { searchAirports } from '@/lib/amadeus/airports'

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get('q') ?? ''
  if (keyword.length < 2) return NextResponse.json({ airports: [] })

  const airports = await searchAirports(keyword)
  return NextResponse.json({ airports })
}
