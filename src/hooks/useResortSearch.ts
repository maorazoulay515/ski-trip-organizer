'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SkiResort, SkiRegion } from '@/types/resort'

export function useResortSearch() {
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState<SkiRegion | null>(null)
  const [results, setResults] = useState<SkiResort[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q: string, r: SkiRegion | null) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (r) params.set('region', r)
      const res = await fetch(`/api/resorts?${params.toString()}`)
      const data = await res.json()
      setResults(data.resorts ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query, region)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, region, search])

  // Load all resorts on mount
  useEffect(() => {
    search('', null)
  }, [search])

  return { query, setQuery, region, setRegion, results, loading }
}
