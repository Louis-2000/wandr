import { useTrip } from './TripContext'
import { useBudget } from './BudgetContext'

const STOP_COLOURS = ['#c5e161', '#4bdbe3', '#f4a535', '#a78bfa', '#ff6b5b', '#4ecdc4']

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getDays(stop) {
  if (!stop.arrival || !stop.departure) return 0
  const diff = (new Date(stop.departure) - new Date(stop.arrival)) / (1000 * 60 * 60 * 24)
  return Math.max(0, Math.round(diff))
}

function getCurrentStop(stops) {
  const today = new Date()
  return stops.find(s => {
    if (!s.arrival || !s.departure) return false
    return new Date(s.arrival) <= today && new Date(s.departure) >= today
  })
}

function getNextStop(stops) {
  const today = new Date()
  return stops.find(s => {
    if (!s.arrival) return false
    return new Date(s.arrival) > today
  })
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24)
  return Math.max(0, Math.round(diff))
}

export default function Overview({ setActivePage }) {
  const { activeTrip } = useTrip()
  const { totalSpent, remaining, budget } = useBudget()

  if (!activeTrip) return null

  const stops = activeTrip.stops || []
  const totalDays = stops.reduce((acc, s) => acc + getDays(s), 0)
  const totalProjected = stops.reduce((acc, s) => acc + getDays(s) * s.dailyBudget, 0)
  const pct = budget.totalBudget > 0 ? Math.min(100, (totalSpent / budget.totalBudget) * 100) : 0
  const currentStop = getCurrentStop(stops)
  const nextStop = getNextStop(stops)
  const upcomingStop = currentStop || nextStop

  const noStops = stops.length === 0
  const noExpenses = budget.expenses.length === 0

  return (
    <div>
      {/* TRIP HEADER */}
      <div style={{
        background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px', padding: '22px 26px', marginBottom: '20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px', fontWeight: 400, color: '#ffffff', marginBottom: '5px', letterSpacing: '-0.3px' }}>
            {activeTrip.name}
          </h1>
          <div style={{ fontSize: '13px', color: '#9a9890' }}>
            {activeTrip.startDate && activeTrip.endDate
              ? `${formatDate(activeTrip.startDate)} → ${formatDate(activeTrip.endDate)}`
              : 'No dates set'}
            {stops.length > 0 && ` · ${stops.length} stop${stops.length !== 1 ? 's' : ''}`}
            {totalDays > 0 && ` · ${totalDays} nights total`}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '4px' }}>Total spent</div>
          <div style={{ fontSize: '22px', fontWeight: 600, color: '#c5e161' }}>£{totalSpent.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div style={{ width: '140px', background: '#1e1e1c', borderRadius: '3px', height: '4px', marginTop: '8px', overflow: 'hidden', marginLeft: 'auto' }}>
            <div style={{ height: '100%', borderRadius: '3px', width: pct + '%', background: pct > 90 ? '#ff6b5b' : '#c5e161', transition: 'width 0.3s' }} />
          </div>
          <div style={{ fontSize: '11px', color: '#5c5b57', marginTop: '4px' }}>{Math.round(pct)}% of £{budget.totalBudget.toLocaleString()} budget</div>
        </div>
      </div>

      {/* UPCOMING STOP BANNER */}
      {upcomingStop && (
        <div style={{
          background: 'rgba(197,225,97,0.06)', border: '1px solid rgba(197,225,97,0.2)',
          borderRadius: '12px', padding: '14px 20px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '20px' }}>📍</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>
                {currentStop ? `Currently in ${currentStop.name.split(',')[0]}` : `Next stop: ${nextStop.name.split(',')[0]}`}
              </div>
              <div style={{ fontSize: '12px', color: '#9a9890', marginTop: '2px' }}>
                {currentStop
                  ? `Until ${formatDate(currentStop.departure)} · £${currentStop.dailyBudget}/day`
                  : `In ${daysUntil(nextStop.arrival)} days · ${formatDate(nextStop.arrival)}`}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#c5e161', cursor: 'pointer' }} onClick={() => setActivePage('planner')}>
            View trip →
          </div>
        </div>
      )}

      {/* METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total budget', value: '£' + budget.totalBudget.toLocaleString(), sub: 'set by you', page: 'budget', accent: true },
          { label: 'Spent so far', value: '£' + totalSpent.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), sub: Math.round(pct) + '% of budget', page: 'budget' },
          { label: 'Remaining', value: '£' + Math.abs(remaining).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), sub: remaining < 0 ? 'over budget' : 'left to spend', page: 'budget', danger: remaining < 0 },
          { label: 'Projected spend', value: '£' + totalProjected.toLocaleString(), sub: 'based on daily budgets', page: 'planner' },
        ].map(m => (
          <button key={m.label} onClick={() => setActivePage(m.page)} style={{
            textAlign: 'left', background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', padding: '16px',
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '6px' }}>{m.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 500, color: m.accent ? '#c5e161' : m.danger ? '#ff6b5b' : '#ffffff', marginBottom: '3px' }}>{m.value}</div>
            <div style={{ fontSize: '11px', color: '#9a9890', marginBottom: '8px' }}>{m.sub}</div>
            <div style={{ fontSize: '11px', color: '#c5e161' }}>View →</div>
          </button>
        ))}
      </div>

      {/* BUDGET PROGRESS */}
      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9a9890', marginBottom: '8px' }}>
          <span>Budget used</span>
          <span>£{totalSpent.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} of £{budget.totalBudget.toLocaleString()}</span>
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
          cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          alignSelf: 'flex-start'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57' }}>Trip progress</div>
            <div style={{ fontSize: '11px', color: '#c5e161' }}>Edit trip →</div>
          </div>

          {noStops ? (
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>🗺️</div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff', marginBottom: '4px' }}>No stops yet</div>
              <div style={{ fontSize: '12px', color: '#9a9890' }}>Tap to add your first destination</div>
            </div>
          ) : (
            stops.map((stop, index) => {
              const colour = STOP_COLOURS[index % STOP_COLOURS.length]
              const days = getDays(stop)
              const isLast = index === stops.length - 1
              const isCurrent = currentStop?.id === stop.id
              return (
                <div key={stop.id} style={{ display: 'flex', gap: '12px', paddingBottom: isLast ? 0 : '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px', flexShrink: 0 }}>
                    <div style={{
                      width: isCurrent ? '12px' : '10px',
                      height: isCurrent ? '12px' : '10px',
                      borderRadius: '50%',
                      background: colour,
                      flexShrink: 0,
                      boxShadow: isCurrent ? `0 0 0 3px ${colour}30` : 'none'
                    }} />
                    {!isLast && <div style={{ width: '1px', flex: 1, background: colour + '30', minHeight: '20px', marginTop: '4px' }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: isLast ? 0 : '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: isCurrent ? colour : '#ffffff' }}>{stop.name}</div>
                        <div style={{ fontSize: '11px', color: '#9a9890', marginTop: '2px' }}>
                          {formatDate(stop.arrival)} · {days} night{days !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#9a9890', flexShrink: 0, marginLeft: '8px' }}>£{stop.dailyBudget}/day</div>
                    </div>
                    {isCurrent && (
                      <div style={{ marginTop: '6px', background: colour + '10', border: '1px solid ' + colour + '20', borderRadius: '6px', padding: '4px 8px', display: 'inline-block' }}>
                        <span style={{ fontSize: '10px', color: colour }}>Current stop</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </button>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* DISCOVER - smart pre-fill */}
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
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff', marginBottom: '3px' }}>
              {upcomingStop ? `Explore ${upcomingStop.name.split(',')[0]}` : 'Find things to do'}
            </div>
            <div style={{ fontSize: '12px', color: '#9a9890' }}>
              {upcomingStop ? `Restaurants, attractions & nightlife in ${upcomingStop.name.split(',')[0]}` : 'Search any destination for places to visit'}
            </div>
          </button>

          {/* TRANSPORT - smart pre-fill */}
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
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff', marginBottom: '3px' }}>
              {currentStop && nextStop
                ? `${currentStop.name.split(',')[0]} → ${nextStop.name.split(',')[0]}`
                : 'Find buses, trains & flights'}
            </div>
            <div style={{ fontSize: '12px', color: '#9a9890' }}>
              {currentStop && nextStop
                ? `Departing ${formatDate(nextStop.arrival)} · compare all options`
                : 'Compare routes across all booking sites'}
            </div>
          </button>

          {/* BUDGET */}
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
            {noExpenses ? (
              <>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff', marginBottom: '3px' }}>No expenses yet</div>
                <div style={{ fontSize: '12px', color: '#9a9890' }}>Start logging to track your spend</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff', marginBottom: '3px' }}>
                  £{totalSpent.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} spent
                </div>
                <div style={{ fontSize: '12px', color: remaining < 0 ? '#ff6b5b' : '#9a9890' }}>
                  {remaining < 0 ? `£${Math.abs(remaining).toFixed(2)} over budget` : `£${remaining.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining`}
                </div>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
