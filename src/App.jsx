import { useState } from 'react'
import { useTrip } from './TripContext'
import { useBudget } from './BudgetContext'
import Planner from './Planner'
import Budget from './Budget'
import Discover from './Discover'
import Transport from './Transport'

export default function App() {
  const [activePage, setActivePage] = useState('overview')

  return (
    <div className="flex h-screen font-sans overflow-hidden" style={{background:'#000000',color:'#ffffff'}}>

      {/* SIDEBAR */}
      <aside className="w-52 flex-shrink-0 flex flex-col py-6" style={{background:'#0d0d0d',borderRight:'1px solid rgba(255,255,255,0.08)'}}>
        <div className="px-5 pb-7 text-2xl font-serif tracking-tight">
          wand<span style={{color:'#c5e161'}}>r</span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <p className="text-[10px] uppercase tracking-widest px-2 pb-1" style={{color:'#5c5b57'}}>Trip</p>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'planner', label: 'Trip planner' },
            { id: 'budget', label: 'Budget' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                background: activePage === item.id ? 'rgba(197,225,97,0.1)' : 'none',
                color: activePage === item.id ? '#c5e161' : '#9a9890',
              }}
            >
              {item.label}
            </button>
          ))}

          <p className="text-[10px] uppercase tracking-widest px-2 pb-1 pt-4" style={{color:'#5c5b57'}}>Explore</p>
          {[
            { id: 'discover', label: 'Discover' },
            { id: 'transport', label: 'Transport' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                background: activePage === item.id ? 'rgba(197,225,97,0.1)' : 'none',
                color: activePage === item.id ? '#c5e161' : '#9a9890',
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* USER */}
        <div className="px-3 pt-4" style={{borderTop:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold" style={{background:'rgba(197,225,97,0.1)',color:'#c5e161'}}>
              JD
            </div>
            <div>
              <div className="text-sm" style={{color:'#ffffff'}}>Jamie</div>
              <div className="text-xs" style={{color:'#5c5b57'}}>SE Asia</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-8">
        {activePage === 'overview'  && <Overview setActivePage={setActivePage} />}
        {activePage === 'planner'   && <Planner />}
        {activePage === 'budget'    && <Budget />}
        {activePage === 'discover'  && <Discover />}
        {activePage === 'transport' && <Transport />}
      </main>

    </div>
  )
}

function Overview({ setActivePage }) {
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
      <h1 className="text-3xl font-serif mb-1" style={{color:'#ffffff'}}>Your trip</h1>
      <p className="text-sm mb-8" style={{color:'#9a9890'}}>{trip.stops.length} stops planned</p>

      {/* METRIC CARDS - clickable */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total budget', value: `£${budget.totalBudget.toLocaleString()}`, sub: 'set by you', page: 'budget', accent: true },
          { label: 'Spent so far', value: `£${totalSpent.toFixed(2)}`, sub: `${Math.round(pct)}% used`, page: 'budget' },
          { label: 'Remaining', value: `£${remaining.toFixed(2)}`, sub: remaining < 0 ? 'over budget' : 'left to spend', page: 'budget' },
          { label: 'Projected spend', value: `£${Math.round(totalProjected).toLocaleString()}`, sub: 'based on daily budgets', page: 'planner' },
        ].map(m => (
          <button
            key={m.label}
            onClick={() => setActivePage(m.page)}
            className="text-left rounded-xl p-4 transition-all hover:opacity-80"
            style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}
          >
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{color:'#5c5b57'}}>{m.label}</div>
            <div className="text-2xl font-medium" style={{color: m.accent ? '#c5e161' : remaining < 0 && m.label === 'Remaining' ? '#ff6b5b' : '#ffffff'}}>{m.value}</div>
            <div className="text-xs mt-1" style={{color:'#5c5b57'}}>{m.sub}</div>
            <div className="text-xs mt-2" style={{color:'#c5e161'}}>View details →</div>
          </button>
        ))}
      </div>

      {/* BUDGET PROGRESS BAR */}
      <div className="rounded-xl p-4 mb-6" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
        <div className="flex justify-between text-xs mb-2" style={{color:'#5c5b57'}}>
          <span>Budget used</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="w-full rounded-full h-2" style={{background:'#1e1e1c'}}>
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: pct > 90 ? '#ff6b5b' : pct > 70 ? '#f4a535' : '#c5e161'
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* TRIP PROGRESS - clickable */}
        <button
          onClick={() => setActivePage('planner')}
          className="text-left rounded-xl p-5 transition-all hover:opacity-80"
          style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}
        >
          <div className="flex justify-between items-center mb-4">
            <div className="text-xs uppercase tracking-widest" style={{color:'#5c5b57'}}>Trip progress</div>
            <div className="text-xs" style={{color:'#c5e161'}}>Edit trip →</div>
          </div>
          {trip.stops.length === 0 ? (
            <p className="text-sm" style={{color:'#5c5b57'}}>No stops added yet</p>
          ) : (
            trip.stops.map((stop, index) => (
              <div key={stop.id} className="flex items-center gap-4 py-3" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{
                  background: index === 0 ? '#c5e161' : '#1e1e1c',
                  border: index === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)'
                }} />
                <div className="flex-1 text-sm font-medium" style={{color:'#ffffff'}}>{stop.name}</div>
                <div className="text-xs" style={{color:'#5c5b57'}}>{stop.arrival}</div>
              </div>
            ))
          )}
        </button>

        <div className="flex flex-col gap-4">
          {/* DISCOVER - clickable */}
          <button
            onClick={() => setActivePage('discover')}
            className="text-left rounded-xl p-5 flex-1 transition-all hover:opacity-80"
            style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs uppercase tracking-widest" style={{color:'#5c5b57'}}>Discover</div>
              <div className="text-xs" style={{color:'#c5e161'}}>Explore →</div>
            </div>
            <div className="text-sm" style={{color:'#ffffff'}}>Find things to do at your next stop</div>
            <div className="text-xs mt-1" style={{color:'#5c5b57'}}>Restaurants, attractions, nightlife and more</div>
          </button>

          {/* TRANSPORT - clickable */}
          <button
            onClick={() => setActivePage('transport')}
            className="text-left rounded-xl p-5 flex-1 transition-all hover:opacity-80"
            style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs uppercase tracking-widest" style={{color:'#5c5b57'}}>Transport</div>
              <div className="text-xs" style={{color:'#c5e161'}}>Search →</div>
            </div>
            <div className="text-sm" style={{color:'#ffffff'}}>Find buses, trains and flights</div>
            <div className="text-xs mt-1" style={{color:'#5c5b57'}}>Compare routes across all booking sites</div>
          </button>

          {/* BUDGET QUICK LOG - clickable */}
          <button
            onClick={() => setActivePage('budget')}
            className="text-left rounded-xl p-5 flex-1 transition-all hover:opacity-80"
            style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs uppercase tracking-widest" style={{color:'#5c5b57'}}>Budget</div>
              <div className="text-xs" style={{color:'#c5e161'}}>Log expense →</div>
            </div>
            <div className="text-sm" style={{color:'#ffffff'}}>£{totalSpent.toFixed(2)} spent so far</div>
            <div className="text-xs mt-1" style={{color:'#5c5b57'}}>Tap to log a new expense</div>
          </button>
        </div>
      </div>
    </div>
  )
}
