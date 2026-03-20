'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SkiResort } from '@/types/resort'

export function useResortSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SkiResort[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
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
      search(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, search])

  // Load all resorts on mount
  useEffect(() => {
    search('')
  }, [search])

  return { query, setQuery, results, loading }
}
