'use client'

const STEPS = [
  { n: 1, label: 'Resort' },
  { n: 2, label: 'Dates' },
  { n: 3, label: 'Departure' },
  { n: 4, label: 'Budget' },
  { n: 5, label: 'Flights' },
  { n: 6, label: 'Transport' },
]

export function WizardProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* connecting line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-blue-600 z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
        />

        {STEPS.map((step) => {
          const done = step.n < currentStep
          const active = step.n === currentStep
          return (
            <div key={step.n} className="flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${done ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-white border-2 border-slate-300 text-slate-400'}`}
              >
                {done ? '✓' : step.n}
              </div>
              <span className={`mt-1 text-xs font-medium hidden sm:block ${active ? 'text-blue-600' : done ? 'text-slate-600' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
