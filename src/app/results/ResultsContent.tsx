'use client'

import { useSearchParams } from 'next/navigation'
import { PackageList } from '@/components/results/PackageList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function ResultsContent({ isLoggedIn }: { isLoggedIn: boolean }) {
  const params = useSearchParams()
  const sessionId = params.get('session')

  if (!sessionId) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 mb-4">No search session found.</p>
        <Link href="/search">
          <Button className="bg-blue-600 text-white">Start a new search</Button>
        </Link>
      </div>
    )
  }

  return <PackageList sessionId={sessionId} isLoggedIn={isLoggedIn} />
}
