import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mountain, Plane, Hotel, Car, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-blue-50 to-slate-50">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Mountain className="w-4 h-4" />
          AI-Powered Ski Trip Planner
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 leading-tight max-w-2xl">
          Your perfect ski trip,{' '}
          <span className="text-blue-600">assembled in seconds</span>
        </h1>

        <p className="mt-6 text-xl text-slate-500 max-w-xl">
          Tell us where you want to ski. We search flights from every nearby airport,
          find the best hotel, and calculate the cheapest total package for your group.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
          <Link href="/search">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-8 h-14 text-base">
              Plan My Trip
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="h-14 text-base px-8">
              Sign in to save trips
            </Button>
          </Link>
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap gap-3 justify-center">
          {[
            { icon: Plane, label: 'Checks all nearby airports' },
            { icon: Hotel, label: 'Hotels filtered by your stars' },
            { icon: Car, label: 'Airport transfers included' },
            { icon: Mountain, label: '18+ ski resorts' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-600 shadow-sm">
              <Icon className="w-4 h-4 text-blue-600" />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Set your preferences',
                desc: 'Choose your resort, dates, budget, hotel stars and flight preferences in our 6-step wizard.',
              },
              {
                step: '2',
                title: 'We search everything',
                desc: 'We check flights to all nearby airports, find hotels, and calculate transfers — then pick the cheapest combination.',
              },
              {
                step: '3',
                title: 'Pick your package',
                desc: 'Compare 3–5 complete packages with full price breakdowns and save the one you like.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {step}
                </div>
                <h3 className="font-semibold text-slate-900 text-lg">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
