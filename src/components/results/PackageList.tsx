'use client'

import { usePackages } from '@/hooks/usePackages'
import { PackageCard } from './PackageCard'
import { Search, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Props {
  sessionId: string
  isLoggedIn: boolean
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="h-5 w-24 bg-slate-200 rounded-full" />
        <div className="h-8 w-24 bg-slate-200 rounded-lg" />
      </div>
      <div className="px-6 space-y-4 py-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <div className="w-8 h-8 bg-slate-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
            <div className="h-5 w-16 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
      <div className="px-6 pb-6">
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-6 bg-slate-200 rounded w-1/2 mt-2" />
        </div>
      </div>
    </div>
  )
}

export function PackageList({ sessionId, isLoggedIn }: Props) {
  const { status, packages, error } = usePackages(sessionId)
  const router = useRouter()

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-slate-600 font-medium">{error}</p>
        <Button onClick={() => router.push('/search')} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (status === 'PENDING' || status === 'PROCESSING') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">
            {status === 'PENDING' ? 'Starting search...' : 'Searching flights, hotels and transfers across all airports...'}
          </p>
        </div>
        {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (!packages || packages.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Search className="w-12 h-12 text-slate-300" />
        <p className="text-slate-600 font-medium">No packages found within your budget</p>
        <p className="text-slate-400 text-sm max-w-sm">
          Try increasing your budget, adjusting your hotel stars, or choosing different dates.
        </p>
        <Button onClick={() => router.push('/search')} className="bg-blue-600 text-white">
          Adjust Preferences
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        Found <span className="font-semibold text-slate-900">{packages.length} packages</span> — sorted by best value
      </p>
      {packages.map((pkg, i) => (
        <PackageCard key={pkg.id} pkg={pkg} sessionId={sessionId} isLoggedIn={isLoggedIn} rank={i} />
      ))}
    </div>
  )
}
