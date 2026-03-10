import { NextRequest, NextResponse } from 'next/server'
import { searchResorts } from '@/lib/resorts/loader'
import type { SkiRegion } from '@/types/resort'

export const dynamic = 'force-static'
export const revalidate = 3600

export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  const region = req.nextUrl.searchParams.get('region') as SkiRegion | null

  const resorts = searchResorts(q, region ?? undefined)

  return NextResponse.json({ resorts: resorts.slice(0, 20) })
}
