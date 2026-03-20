'use client'

import { useState, useEffect, useMemo } from 'react'
import type { SkiResort } from '@/types/resort'

export function useResortSearch() {
  const [query, setQuery] = useState('')
  const [allResorts, setAllResorts] = useState<SkiResort[]>([])
  const [loading, setLoading] = useState(true)

  // Load all resorts once on mount
  useEffect(() => {
    fetch('/api/resorts')
      .then((r) => r.json())
      .then((d) => setAllResorts(d.resorts ?? []))
      .catch(() => setAllResorts([]))
      .finally(() => setLoading(false))
  }, [])

  // Filter client-side instantly — no debounce needed
  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return allResorts
    return allResorts.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        (r.state?.toLowerCase().includes(q) ?? false)
    )
  }, [query, allResorts])

  return { query, setQuery, results, loading }
}
