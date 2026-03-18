'use client'

import { useState, useEffect, useRef } from 'react'
import type { TripPackage } from '@/types/package'

type Status = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

interface PackagesResult {
  status: Status
  packages: TripPackage[] | null
  error: string | null
}

export function usePackages(sessionId: string | null): PackagesResult {
  const [status, setStatus] = useState<Status>('PENDING')
  const [packages, setPackages] = useState<TripPackage[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const poll = async () => {
      try {
        const res = await fetch(`/api/packages/${sessionId}`)
        if (!res.ok) throw new Error('Failed to fetch packages')
        const data = await res.json()

        setStatus(data.status)

        if (data.status === 'COMPLETED') {
          setPackages(data.packages)
          if (intervalRef.current) clearInterval(intervalRef.current)
        } else if (data.status === 'FAILED') {
          setError('Search failed. Please try again.')
          if (intervalRef.current) clearInterval(intervalRef.current)
        }
      } catch {
        setError('Connection error. Please try again.')
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }

    poll()
    intervalRef.current = setInterval(poll, 2500)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [sessionId])

  return { status, packages, error }
}
