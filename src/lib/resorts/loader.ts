import resortsData from '../../../data/ski-resorts.json'
import type { SkiResort, SkiRegion } from '@/types/resort'

const resorts: SkiResort[] = resortsData as SkiResort[]

export function getAllResorts(): SkiResort[] {
  return resorts
}

export function getResortById(id: string): SkiResort | undefined {
  return resorts.find((r) => r.id === id)
}

export function searchResorts(query: string, region?: SkiRegion): SkiResort[] {
  const q = query.toLowerCase().trim()
  return resorts.filter((r) => {
    const matchesQuery =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.country.toLowerCase().includes(q) ||
      r.state?.toLowerCase().includes(q)
    const matchesRegion = !region || r.region === region
    return matchesQuery && matchesRegion
  })
}
