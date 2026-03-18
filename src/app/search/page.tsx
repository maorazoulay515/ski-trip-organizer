import { SearchWizard } from '@/components/wizard/SearchWizard'

export default function SearchPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Plan Your Ski Trip</h1>
        <p className="text-slate-500 mt-2">Answer 6 quick questions and we'll find your perfect package</p>
      </div>
      <SearchWizard />
    </div>
  )
}
