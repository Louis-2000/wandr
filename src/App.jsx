import { useState } from 'react'
import { useTrip } from './TripContext'
import { useBudget } from './BudgetContext'
import Planner from './Planner'
import Budget from './Budget'
import Transport from './Transport'
import Discover from './Discover'

export default function App() {
  const [activePage, setActivePage] = useState('overview')

  return (
    <div className="flex h-screen bg-[#0e0f0e] text-[#f0ede6] font-sans overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-52 flex-shrink-0 bg-[#161714] border-r border-white/8 flex flex-col py-6">
        <div className="px-5 pb-7 text-2xl font-serif tracking-tight">
          wand<span className="text-[#c8f060]">r</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-[#5c5b57] px-2 pb-1">Trip</p>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'planner', label: 'Trip planner' },
            { id: 'budget', label: 'Budget' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                activePage === item.id
                  ? 'bg-[#c8f060]/10 text-[#c8f060]'
                  : 'text-[#9a9890] hover:bg-[#1e1f1c] hover:text-[#f0ede6]'
              }`}
            >
              {item.label}
            </button>
          ))}

          <p className="text-[10px] uppercase tracking-widest text-[#5c5b57] px-2 pb-1 pt-4">Explore</p>
          {[
            { id: 'discover', label: 'Discover' },
            { id: 'transport', label: 'Transport' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                activePage === item.id
                  ? 'bg-[#c8f060]/10 text-[#c8f060]'
                  : 'text-[#9a9890] hover:bg-[#1e1f1c] hover:text-[#f0ede6]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* USER */}
        <div className="px-3 pt-4 border-t border-white/8">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-[#c8f060]/10 text-[#c8f060] flex items-center justify-center text-xs font-semibold">
              JD
            </div>
            <div>
              <div className="text-sm text-[#f0ede6]">Jamie</div>
              <div className="text-xs text-[#5c5b57]">SE Asia</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-8">
        {activePage === 'overview'  && <Overview />}
        {activePage === 'planner'   && <Planner />}
        {activePage === 'budget'    && <Budget />}
        {activePage === 'discover'  && <Discover />}
        {activePage === 'transport' && <Transport />}
      </main>

    </div>
  )
}

function Overview() {
  const { trip } = useTrip()
  const { totalSpent, remaining, budget } = useBudget()

  const totalDays = trip.stops.reduce((acc, stop) => {
    if (!stop.arrival || !stop.departure) return acc
    const diff = (new Date(stop.departure) - new Date(stop.arrival)) / (1000 * 60 * 60 * 24)
    return acc + Math.max(0, diff)
  }, 0)

  const totalProjected = trip.stops.reduce((acc, stop) => {
    if (!stop.arrival || !stop.departure) return acc
    const diff = (new Date(stop.departure) - new Date(stop.arrival)) / (1000 * 60 * 60 * 24)
    return acc + (Math.max(0, diff) * stop.dailyBudget)
  }, 0)

  const pct = budget.totalBudget > 0 ? Math.min(100, (totalSpent / budget.totalBudget) * 100) : 0

  return (
    <div>
      <h1 className="text-3xl font-serif mb-1">Your trip</h1>
      <p className="text-sm text-[#9a9890] mb-8">{trip.stops.length} stops · {Math.round(totalDays)} days total</p>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-[#161714] border border-white/8 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-1">Total budget</div>
          <div className="text-2xl font-medium text-[#c8f060]">£{budget.totalBudget.toLocaleString()}</div>
          <div className="text-xs text-[#5c5b57] mt-1">set by you</div>
        </div>
        <div className="bg-[#161714] border border-white/8 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-1">Spent so far</div>
          <div className="text-2xl font-medium text-[#f0ede6]">£{totalSpent.toFixed(2)}</div>
          <div className="text-xs text-[#5c5b57] mt-1">{Math.round(pct)}% of budget</div>
        </div>
        <div className="bg-[#161714] border border-white/8 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-1">Remaining</div>
          <div className={`text-2xl font-medium ${remaining < 0 ? 'text-[#ff6b5b]' : 'text-[#f0ede6]'}`}>
            £{remaining.toFixed(2)}
          </div>
          <div className="text-xs text-[#5c5b57] mt-1">{remaining < 0 ? 'over budget' : 'left to spend'}</div>
        </div>
        <div className="bg-[#161714] border border-white/8 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-1">Projected spend</div>
          <div className="text-2xl font-medium text-[#f0ede6]">£{Math.round(totalProjected).toLocaleString()}</div>
          <div className="text-xs text-[#5c5b57] mt-1">based on daily budgets</div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="bg-[#161714] border border-white/8 rounded-xl p-4 mb-6">
        <div className="flex justify-between text-xs text-[#5c5b57] mb-2">
          <span>Budget used</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="w-full bg-[#272824] rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: pct > 90 ? '#ff6b5b' : pct > 70 ? '#f4a535' : '#c8f060'
            }}
          />
        </div>
      </div>

      {trip.stops.length === 0 ? (
        <div className="bg-[#161714] border border-white/8 rounded-xl p-8 text-center">
          <p className="text-[#5c5b57] text-sm mb-3">No stops added yet</p>
          <p className="text-xs text-[#5c5b57]">Go to Trip planner to add your first destination</p>
        </div>
      ) : (
        <div className="bg-[#161714] border border-white/8 rounded-xl p-5">
          <div className="text-xs uppercase tracking-widest text-[#5c5b57] mb-4">Trip progress</div>
          {trip.stops.map((stop) => (
            <div key={stop.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-[#272824] border border-white/10" />
              <div className="flex-1 text-sm font-medium">{stop.name}</div>
              <div className="text-xs text-[#5c5b57]">{stop.arrival} to {stop.departure}</div>
              <div className="text-xs text-[#9a9890]">£{stop.dailyBudget}/day</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}





