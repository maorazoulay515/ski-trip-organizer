import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { ResultsContent } from './ResultsContent'

export default async function ResultsPage() {
  const session = await auth()
  const isLoggedIn = !!session?.user?.id

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Your Ski Packages</h1>
        <p className="text-slate-500 mt-2">Complete packages with flights, transfers and hotels</p>
      </div>
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading...</div>}>
        <ResultsContent isLoggedIn={isLoggedIn} />
      </Suspense>
    </div>
  )
}
