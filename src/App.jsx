import { useState } from 'react'
import { useTrip } from './TripContext'
import { useBudget } from './BudgetContext'
import { supabase } from './supabase'
import Planner from './Planner'
import Budget from './Budget'
import Discover from './Discover'
import Transport from './Transport'
import Trips from './Trips'

export default function App({ session }) {
  const { activeTrip, activeTripId, setActiveTripId, updateTrip } = useTrip()
  const [activePage, setActivePage] = useState('overview')

  if (!activeTripId || !activeTrip) {
    return <Trips />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000000', color: '#ffffff', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>

      {/* SIDEBAR */}
      <aside style={{ width: '220px', flexShrink: 0, background: '#0d0d0d', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', padding: '24px 0' }}>
        <div style={{ padding: '0 20px 6px', fontSize: '24px', fontFamily: 'DM Serif Display, serif', letterSpacing: '-0.3px' }}>
          wand<span style={{ color: '#c5e161' }}>r</span>
        </div>

        <button onClick={() => setActiveTripId(null)} style={{
          margin: '0 12px 20px', padding: '6px 10px', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
          color: '#9a9890', fontSize: '11px', cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif', textAlign: 'left'
        }}>
          ← All trips
        </button>

        <div style={{ padding: '0 12px 6px 20px', fontSize: '11px', fontWeight: 500, color: '#ffffff', letterSpacing: '-0.2px', marginBottom: '4px' }}>
          {activeTrip.name}
        </div>
        <div style={{ padding: '0 12px 16px 20px', fontSize: '11px', color: '#5c5b57' }}>
          {activeTrip.startDate && activeTrip.endDate ? `${activeTrip.startDate} → ${activeTrip.endDate}` : 'No dates set'}
        </div>

        <nav style={{ flex: 1, padding: '0 12px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', padding: '0 8px 6px' }}>Trip</div>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'planner', label: 'Trip planner' },
            { id: 'budget', label: 'Budget' },
          ].map(item => (
            <button key={item.id} onClick={() => setActivePage(item.id)} style={{
              width: '100%', textAlign: 'left', padding: '8px 12px',
              borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13.5px', fontFamily: 'DM Sans, sans-serif',
              marginBottom: '2px',
              background: activePage === item.id ? 'rgba(197,225,97,0.1)' : 'none',
              color: activePage === item.id ? '#c5e161' : '#9a9890',
            }}>{item.label}</button>
          ))}

          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', padding: '16px 8px 6px' }}>Explore</div>
          {[
            { id: 'discover', label: 'Discover' },
            { id: 'transport', label: 'Transport' },
          ].map(item => (
            <button key={item.id} onClick={() => setActivePage(item.id)} style={{
              width: '100%', textAlign: 'left', padding: '8px 12px',
              borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13.5px', fontFamily: 'DM Sans, sans-serif',
              marginBottom: '2px',
              background: activePage === item.id ? 'rgba(197,225,97,0.1)' : 'none',
              color: activePage === item.id ? '#c5e161' : '#9a9890',
            }}>{item.label}</button>
          ))}
        </nav>

        <div style={{ padding: '16px 12px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(197,225,97,0.1)', color: '#c5e161',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 600, flexShrink: 0
            }}>
              {session?.user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {session?.user?.email}
              </div>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut()} style={{
            width: '100%', textAlign: 'left', padding: '6px 10px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '12px', color: '#5c5b57', fontFamily: 'DM Sans, sans-serif'
          }}>Sign out</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
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
  const { activeTrip, updateTrip } = useTrip()
  const { totalSpent, remaining, budget } = useBudget()

  if (!activeTrip) return null

  const totalDays = activeTrip.stops.reduce((acc, stop) => {
    if (!stop.arrival || !stop.departure) return acc
    const diff = (new Date(stop.departure) - new Date(stop.arrival)) / (1000 * 60 * 60 * 24)
    return acc + Math.max(0, diff)
  }, 0)

  const totalProjected = activeTrip.stops.reduce((acc, stop) => {
    if (!stop.arrival || !stop.departure) return acc
    const diff = (new Date(stop.departure) - new Date(stop.arrival)) / (1000 * 60 * 60 * 24)
    return acc + (Math.max(0, diff) * stop.dailyBudget)
  }, 0)

  const pct = budget.totalBudget > 0 ? Math.min(100, (totalSpent / budget.totalBudget) * 100) : 0

  const STOP_COLOURS = ['#c5e161', '#4bdbe3', '#f4a535', '#a78bfa', '#ff6b5b', '#4ecdc4']

  return (
    <div>
      {/* TRIP HEADER CARD */}
      <div style={{
        background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px', padding: '22px 26px', marginBottom: '20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', fontWeight: 400, color: '#ffffff', marginBottom: '4px', letterSpacing: '-0.3px' }}>
            {activeTrip.name}
          </h1>
          <div style={{ fontSize: '13px', color: '#9a9890' }}>
            {activeTrip.startDate} → {activeTrip.endDate}
            {' · '}{activeTrip.stops.length} stop{activeTrip.stops.length !== 1 ? 's' : ''}
            {' · '}{Math.round(totalDays)} days total
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '4px' }}>Today's spend</div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#c5e161' }}>£{totalSpent.toFixed(2)}</div>
          <div style={{ width: '140px', background: '#1e1e1c', borderRadius: '3px', height: '4px', marginTop: '6px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '3px', width: pct + '%', background: pct > 90 ? '#ff6b5b' : '#c5e161' }} />
          </div>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total budget', value: '£' + budget.totalBudget.toLocaleString(), sub: 'set by you', page: 'budget', accent: true },
          { label: 'Spent so far', value: '£' + totalSpent.toFixed(2), sub: Math.round(pct) + '% of budget', page: 'budget' },
          { label: 'Remaining', value: '£' + remaining.toFixed(2), sub: remaining < 0 ? 'over budget' : 'left to spend', page: 'budget', danger: remaining < 0 },
          { label: 'Projected spend', value: '£' + Math.round(totalProjected).toLocaleString(), sub: 'based on daily budgets', page: 'planner' },
        ].map(m => (
          <button key={m.label} onClick={() => setActivePage(m.page)} style={{
            textAlign: 'left', background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', padding: '16px',
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
            transition: 'opacity 0.15s'
          }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '6px' }}>{m.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 500, color: m.accent ? '#c5e161' : m.danger ? '#ff6b5b' : '#ffffff', marginBottom: '3px' }}>{m.value}</div>
            <div style={{ fontSize: '11px', color: '#9a9890' }}>{m.sub}</div>
            <div style={{ fontSize: '11px', color: '#c5e161', marginTop: '6px' }}>View →</div>
          </button>
        ))}
      </div>

      {/* BUDGET PROGRESS */}
      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9a9890', marginBottom: '8px' }}>
          <span>Budget used</span><span>{Math.round(pct)}%</span>
        </div>
        <div style={{ background: '#1e1e1c', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: '4px', width: pct + '%', background: pct > 90 ? '#ff6b5b' : pct > 70 ? '#f4a535' : '#c5e161', transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* TRIP PROGRESS */}
        <button onClick={() => setActivePage('planner')} style={{
          textAlign: 'left', background: '#0d0d0d',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px', padding: '20px',
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57' }}>Trip progress</div>
            <div style={{ fontSize: '11px', color: '#c5e161' }}>Edit trip →</div>
          </div>
          {activeTrip.stops.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#9a9890' }}>No stops added yet — go to Trip planner</p>
          ) : (
            activeTrip.stops.map((stop, index) => {
              const colour = STOP_COLOURS[index % STOP_COLOURS.length]
              return (
                <div key={stop.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colour, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>{stop.name}</div>
                    <div style={{ fontSize: '11px', color: '#9a9890', marginTop: '1px' }}>{stop.arrival} · {stop.departure}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#9a9890' }}>£{stop.dailyBudget}/day</div>
                </div>
              )
            })
          )}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* DISCOVER */}
          <button onClick={() => setActivePage('discover')} style={{
            textAlign: 'left', background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', padding: '18px 20px', flex: 1,
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57' }}>Discover</div>
              <div style={{ fontSize: '11px', color: '#c5e161' }}>Explore →</div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff', marginBottom: '3px' }}>Find things to do</div>
            <div style={{ fontSize: '12px', color: '#9a9890' }}>Restaurants, attractions and more</div>
          </button>

          {/* TRANSPORT */}
          <button onClick={() => setActivePage('transport')} style={{
            textAlign: 'left', background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', padding: '18px 20px', flex: 1,
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57' }}>Transport</div>
              <div style={{ fontSize: '11px', color: '#c5e161' }}>Search →</div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff', marginBottom: '3px' }}>Find buses, trains & flights</div>
            <div style={{ fontSize: '12px', color: '#9a9890' }}>Compare routes across all sites</div>
          </button>

          {/* BUDGET QUICK */}
          <button onClick={() => setActivePage('budget')} style={{
            textAlign: 'left', background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px', padding: '18px 20px', flex: 1,
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57' }}>Budget</div>
              <div style={{ fontSize: '11px', color: '#c5e161' }}>Log expense →</div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff', marginBottom: '3px' }}>£{totalSpent.toFixed(2)} spent so far</div>
            <div style={{ fontSize: '12px', color: '#9a9890' }}>£{remaining.toFixed(2)} remaining</div>
          </button>
        </div>
      </div>
    </div>
  )
}
