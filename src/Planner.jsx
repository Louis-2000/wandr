import PlaceAutocomplete from './PlaceAutocomplete'
import { useState } from 'react'
import { useTrip } from './TripContext'
import { useBudget } from './BudgetContext'

const STOP_COLOURS = ['#c5e161', '#4bdbe3', '#f4a535', '#a78bfa', '#ff6b5b', '#4ecdc4']

export default function Planner() {
  const { activeTrip: trip, addStop, deleteStop, updateStop, removeSavedPlace } = useTrip()
  const { budget } = useBudget()
  const [form, setForm] = useState({ name: '', arrival: '', departure: '', dailyBudget: 60 })
  const [showForm, setShowForm] = useState(false)
  const [selectedStop, setSelectedStop] = useState(null)
  if (!trip) return null

  function handleAdd() {
    if (!form.name || !form.arrival || !form.departure) return
    addStop(form)
    setForm({ name: '', arrival: '', departure: '', dailyBudget: 60 })
    setShowForm(false)
  }

  function getDays(stop) {
    if (!stop.arrival || !stop.departure) return 0
    const diff = (new Date(stop.departure) - new Date(stop.arrival)) / (1000 * 60 * 60 * 24)
    return Math.max(0, Math.round(diff))
  }

  function getStopExpenses(stopName) {
    return budget.expenses.filter(e => e.stop === stopName)
  }

  function getStopSpend(stopName) {
    return getStopExpenses(stopName).reduce((acc, e) => acc + parseFloat(e.amount || 0), 0)
  }

  const totalDays = trip.stops.reduce((acc, s) => acc + getDays(s), 0)
  const totalProjected = trip.stops.reduce((acc, s) => acc + getDays(s) * s.dailyBudget, 0)
  const budgetPct = budget.totalBudget > 0 ? Math.min(100, (totalProjected / budget.totalBudget) * 100) : 0

  if (selectedStop) {
    const stop = trip.stops.find(s => s.id === selectedStop)
    if (!stop) { setSelectedStop(null); return null }
    const days = getDays(stop)
    const projected = days * stop.dailyBudget
    const spent = getStopSpend(stop.name)
    const expenses = getStopExpenses(stop.name)
    const savedPlaces = stop.savedPlaces || []
    const stopIndex = trip.stops.findIndex(s => s.id === selectedStop)
    const colour = STOP_COLOURS[stopIndex % STOP_COLOURS.length]
    const spentPct = projected > 0 ? Math.min(100, (spent / projected) * 100) : 0

    return (
      <div>
        <button
          onClick={() => setSelectedStop(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9a9890', fontSize: '14px', marginBottom: '24px', display: 'block', padding: 0 }}
        >
          ← Back to trip
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: colour + '18', border: '1px solid ' + colour + '40',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: 600, color: colour, flexShrink: 0
            }}>
              {stopIndex + 1}
            </div>
            <div>
              <h1 className="text-3xl font-serif mb-1" style={{ color: '#ffffff' }}>{stop.name}</h1>
              <p className="text-sm" style={{ color: '#9a9890' }}>{stop.arrival} to {stop.departure} · {days} nights</p>
            </div>
          </div>
          <button
            onClick={() => { deleteStop(stop.id); setSelectedStop(null) }}
            style={{ background: 'rgba(255,107,91,0.1)', border: '1px solid rgba(255,107,91,0.2)', color: '#ff6b5b', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
          >
            Remove stop
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: '#0d0d0d', border: '1px solid ' + colour + '30', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '4px' }}>Daily budget</div>
            <div style={{ fontSize: '22px', fontWeight: 500, color: colour }}>£{stop.dailyBudget}</div>
            <div style={{ fontSize: '11px', color: '#9a9890', marginTop: '3px' }}>per day</div>
          </div>
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '4px' }}>Projected total</div>
            <div style={{ fontSize: '22px', fontWeight: 500, color: '#ffffff' }}>£{projected}</div>
            <div style={{ fontSize: '11px', color: '#9a9890', marginTop: '3px' }}>{days} nights x £{stop.dailyBudget}</div>
          </div>
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '4px' }}>Spent so far</div>
            <div style={{ fontSize: '22px', fontWeight: 500, color: spent > projected ? '#ff6b5b' : '#ffffff' }}>£{spent.toFixed(2)}</div>
            <div style={{ fontSize: '11px', color: '#9a9890', marginTop: '3px' }}>{spent > projected ? 'over budget' : 'logged expenses'}</div>
          </div>
        </div>

        {spent > 0 && (
          <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9a9890', marginBottom: '8px' }}>
              <span>Spend progress</span>
              <span>£{spent.toFixed(0)} of £{projected}</span>
            </div>
            <div style={{ background: '#1e1e1c', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: '4px', width: spentPct + '%', background: spentPct > 90 ? '#ff6b5b' : spentPct > 70 ? '#f4a535' : colour }} />
            </div>
          </div>
        )}

        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '16px' }}>Edit daily budget</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '6px' }}>
            <input
              type="range" min="20" max="300" step="5"
              value={stop.dailyBudget}
              onChange={e => updateStop(stop.id, { dailyBudget: parseInt(e.target.value) })}
              style={{ flex: 1, accentColor: colour }}
            />
            <span style={{ fontSize: '14px', fontWeight: 500, color: colour, minWidth: '80px', textAlign: 'right' }}>£{stop.dailyBudget}/day</span>
          </div>
          <div style={{ background: colour + '10', border: '1px solid ' + colour + '20', borderRadius: '8px', padding: '10px 14px', marginTop: '12px' }}>
            <span style={{ fontSize: '12px', color: '#9a9890' }}>
              At £{stop.dailyBudget}/day for {days} nights = <strong style={{ color: colour }}>£{days * stop.dailyBudget} total</strong> for this stop
            </span>
          </div>
        </div>

        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '16px' }}>Edit dates</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '8px' }}>Arrival</div>
              <input type="date" value={stop.arrival}
                onChange={e => updateStop(stop.id, { arrival: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: '#161614', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '8px' }}>Departure</div>
              <input type="date" value={stop.departure}
                onChange={e => updateStop(stop.id, { departure: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', background: '#161614', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '16px' }}>
            Saved places {savedPlaces.length > 0 && '(' + savedPlaces.length + ')'}
          </div>
          {savedPlaces.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#9a9890' }}>No saved places yet — go to Discover and save places for {stop.name.split(',')[0]}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {savedPlaces.map((place, i) => (
                <div key={i} style={{ background: '#161614', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>{place.name}</div>
                    {place.rating && <span style={{ fontSize: '12px', color: '#f4a535' }}>★ {place.rating}</span>}
                  </div>
                  {place.formatted_address && <div style={{ fontSize: '11px', color: '#9a9890', marginBottom: '8px' }}>{place.formatted_address}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <a href={'https://www.google.com/maps/place/?q=place_id:' + place.place_id} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#4bdbe3', textDecoration: 'none' }}>Maps →</a>
                    <button onClick={() => removeSavedPlace(stop.id, place.place_id)} style={{ fontSize: '11px', color: '#9a9890', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '16px' }}>
            Expenses {expenses.length > 0 && '(' + expenses.length + ')'}
          </div>
          {expenses.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#9a9890' }}>No expenses logged for {stop.name.split(',')[0]} yet</p>
          ) : (
            expenses.slice().reverse().map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>{e.description}</div>
                  <div style={{ fontSize: '11px', color: '#9a9890', marginTop: '2px' }}>{e.category} · {e.date}</div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>£{parseFloat(e.amount).toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-serif mb-1" style={{ color: '#ffffff' }}>Trip planner</h1>
      <p className="text-sm mb-6" style={{ color: '#9a9890' }}>Build your route and set a daily budget per stop</p>

      {trip.stops.length > 0 && (
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '4px' }}>Stops</div>
              <div style={{ fontSize: '20px', fontWeight: 500, color: '#c5e161' }}>{trip.stops.length}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '4px' }}>Total nights</div>
              <div style={{ fontSize: '20px', fontWeight: 500, color: '#ffffff' }}>{totalDays}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '4px' }}>Projected spend</div>
              <div style={{ fontSize: '20px', fontWeight: 500, color: '#ffffff' }}>£{totalProjected.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '4px' }}>Of total budget</div>
              <div style={{ fontSize: '20px', fontWeight: 500, color: budgetPct > 90 ? '#ff6b5b' : budgetPct > 70 ? '#f4a535' : '#ffffff' }}>{Math.round(budgetPct)}%</div>
            </div>
          </div>
          <div style={{ background: '#1e1e1c', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '4px', width: budgetPct + '%', background: budgetPct > 90 ? '#ff6b5b' : budgetPct > 70 ? '#f4a535' : '#c5e161', transition: 'width 0.3s' }} />
          </div>
        </div>
      )}

      {trip.stops.length === 0 ? (
        <div style={{ background: '#0d0d0d', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', padding: '48px', textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>✈️</div>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff', marginBottom: '6px' }}>No stops yet</p>
          <p style={{ fontSize: '12px', color: '#9a9890' }}>Add your first destination to start planning your route</p>
        </div>
      ) : (
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          {trip.stops.map((stop, index) => {
            const colour = STOP_COLOURS[index % STOP_COLOURS.length]
            const days = getDays(stop)
            const projected = days * stop.dailyBudget
            const spent = getStopSpend(stop.name)
            const spentPct = projected > 0 ? Math.min(100, (spent / projected) * 100) : 0
            const savedCount = (stop.savedPlaces || []).length
            const isLast = index === trip.stops.length - 1

            return (
              <div key={stop.id} style={{ display: 'flex', marginBottom: isLast ? 0 : '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '48px', flexShrink: 0 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: colour + '18', border: '2px solid ' + colour,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 600, color: colour, zIndex: 1, flexShrink: 0
                  }}>{index + 1}</div>
                  {!isLast && (
                    <div style={{ width: '2px', flex: 1, minHeight: '40px', background: colour + '40', margin: '4px 0' }} />
                  )}
                </div>

                <button
                  onClick={() => setSelectedStop(stop.id)}
                  style={{
                    flex: 1, textAlign: 'left', background: '#0d0d0d',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderLeft: '3px solid ' + colour,
                    borderRadius: '12px', padding: '16px 18px',
                    marginLeft: '12px', cursor: 'pointer',
                    fontFamily: 'DM Sans, sans-serif', width: '100%'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 500, color: '#ffffff', marginBottom: '3px' }}>{stop.name}</div>
                      <div style={{ fontSize: '12px', color: '#9a9890' }}>{stop.arrival} to {stop.departure} · {days} nights</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: colour }}>£{projected.toLocaleString()}</div>
                      <div style={{ fontSize: '11px', color: '#9a9890' }}>projected</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ flex: 1, background: '#1e1e1c', borderRadius: '4px', height: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '4px', width: spentPct + '%', background: spentPct > 90 ? '#ff6b5b' : colour }} />
                    </div>
                    <span style={{ fontSize: '11px', color: '#9a9890', whiteSpace: 'nowrap' }}>
                      {spent > 0 ? '£' + spent.toFixed(0) + ' spent' : '£' + stop.dailyBudget + '/day'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: colour + '15', color: colour, border: '1px solid ' + colour + '30' }}>
                      £{stop.dailyBudget}/day
                    </span>
                    {savedCount > 0 && (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(75,219,227,0.1)', color: '#4bdbe3', border: '1px solid rgba(75,219,227,0.2)' }}>
                        {savedCount} saved
                      </span>
                    )}
                    {spent > projected && (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(255,107,91,0.1)', color: '#ff6b5b', border: '1px solid rgba(255,107,91,0.2)' }}>
                        over budget
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: '#9a9890', marginLeft: 'auto' }}>Tap to edit →</span>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {showForm ? (
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(197,225,97,0.2)', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c5e161', marginBottom: '16px' }}>New stop</div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '8px' }}>Destination</div>
            <PlaceAutocomplete
  value={form.name}
  onChange={val => setForm({...form, name: val})}
  placeholder="e.g. Bangkok, Thailand"
  style={{ padding: '9px 12px', background: '#161614', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
/>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '8px' }}>Arrival date</div>
              <input type="date" value={form.arrival}
                onChange={e => setForm({ ...form, arrival: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', background: '#161614', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '8px' }}>Departure date</div>
              <input type="date" value={form.departure}
                onChange={e => setForm({ ...form, departure: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', background: '#161614', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '8px' }}>
              Daily budget — £{form.dailyBudget}/day
            </div>
            <input type="range" min="20" max="200" step="5"
              value={form.dailyBudget}
              onChange={e => setForm({ ...form, dailyBudget: parseInt(e.target.value) })}
              style={{ width: '100%', accentColor: '#c5e161' }}
            />
          </div>

          {form.arrival && form.departure && getDays(form) > 0 && (
            <div style={{ background: 'rgba(197,225,97,0.08)', border: '1px solid rgba(197,225,97,0.15)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', color: '#9a9890' }}>
                £{form.dailyBudget}/day x {getDays(form)} nights = <strong style={{ color: '#c5e161' }}>£{form.dailyBudget * getDays(form)} projected</strong>
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleAdd}
              style={{ flex: 1, padding: '10px', background: '#c5e161', color: '#000000', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >Add stop</button>
            <button onClick={() => setShowForm(false)}
              style={{ padding: '10px 16px', background: '#161614', color: '#9a9890', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
            >Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          style={{ width: '100%', padding: '16px', background: '#0d0d0d', border: '1px dashed rgba(197,225,97,0.3)', borderRadius: '12px', color: '#c5e161', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
        >
          + Add a destination
        </button>
      )}
    </div>
  )
}
