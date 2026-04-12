import { useState } from 'react'
import { useTrip } from './TripContext'
import { useBudget } from './BudgetContext'

export default function Planner() {
  const { trip, addStop, deleteStop, updateStop, removeSavedPlace } = useTrip()
  const { budget } = useBudget()
  const [form, setForm] = useState({ name: '', arrival: '', departure: '', dailyBudget: 60 })
  const [showForm, setShowForm] = useState(false)
  const [selectedStop, setSelectedStop] = useState(null)

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

  if (selectedStop) {
    const stop = trip.stops.find(s => s.id === selectedStop)
    if (!stop) { setSelectedStop(null); return null }
    const days = getDays(stop)
    const projected = days * stop.dailyBudget
    const spent = getStopSpend(stop.name)
    const expenses = getStopExpenses(stop.name)
    const savedPlaces = stop.savedPlaces || []

    return (
      <div>
        <button onClick={() => setSelectedStop(null)}
          className="flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{color:'#9a9890'}}
        >
          ← Back to all stops
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif mb-1" style={{color:'#ffffff'}}>{stop.name}</h1>
            <p className="text-sm" style={{color:'#9a9890'}}>{stop.arrival} to {stop.departure} · {days} nights</p>
          </div>
          <button onClick={() => { deleteStop(stop.id); setSelectedStop(null) }}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{background:'rgba(255,107,91,0.1)',border:'1px solid rgba(255,107,91,0.2)',color:'#ff6b5b'}}
          >
            Remove stop
          </button>
        </div>

        {/* METRICS */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl p-4" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{color:'#5c5b57'}}>Daily budget</div>
            <div className="text-2xl font-medium" style={{color:'#c5e161'}}>£{stop.dailyBudget}</div>
            <div className="text-xs mt-1" style={{color:'#5c5b57'}}>per day</div>
          </div>
          <div className="rounded-xl p-4" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{color:'#5c5b57'}}>Projected total</div>
            <div className="text-2xl font-medium" style={{color:'#ffffff'}}>£{projected}</div>
            <div className="text-xs mt-1" style={{color:'#5c5b57'}}>{days} nights x £{stop.dailyBudget}</div>
          </div>
          <div className="rounded-xl p-4" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{color:'#5c5b57'}}>Spent so far</div>
            <div className="text-2xl font-medium" style={{color: spent > projected ? '#ff6b5b' : '#ffffff'}}>£{spent.toFixed(2)}</div>
            <div className="text-xs mt-1" style={{color:'#5c5b57'}}>{spent > projected ? 'over budget' : 'logged expenses'}</div>
          </div>
        </div>

        {/* EDIT DAILY BUDGET */}
        <div className="rounded-xl p-5 mb-6" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="text-xs uppercase tracking-widest mb-4" style={{color:'#5c5b57'}}>Edit daily budget</div>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm" style={{color:'#9a9890'}}>Daily limit</span>
            <input type="range" min="20" max="300" step="5"
              value={stop.dailyBudget}
              onChange={e => updateStop(stop.id, { dailyBudget: parseInt(e.target.value) })}
              className="flex-1"
              style={{accentColor:'#c5e161'}}
            />
            <span className="text-sm font-medium" style={{color:'#c5e161'}}>£{stop.dailyBudget}/day</span>
          </div>
          <div className="flex justify-between text-xs" style={{color:'#5c5b57'}}>
            <span>£20</span><span>£300</span>
          </div>
        </div>

        {/* EDIT DATES */}
        <div className="rounded-xl p-5 mb-6" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="text-xs uppercase tracking-widest mb-4" style={{color:'#5c5b57'}}>Edit dates</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{color:'#5c5b57'}}>Arrival</div>
              <input type="date" value={stop.arrival}
                onChange={e => updateStop(stop.id, { arrival: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#ffffff'}}
              />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{color:'#5c5b57'}}>Departure</div>
              <input type="date" value={stop.departure}
                onChange={e => updateStop(stop.id, { departure: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#ffffff'}}
              />
            </div>
          </div>
        </div>

        {/* SAVED PLACES */}
        <div className="rounded-xl p-5 mb-6" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="text-xs uppercase tracking-widest mb-4" style={{color:'#5c5b57'}}>
            Saved places {savedPlaces.length > 0 && `(${savedPlaces.length})`}
          </div>
          {savedPlaces.length === 0 ? (
            <p className="text-sm" style={{color:'#5c5b57'}}>No saved places yet — go to Discover and save places for {stop.name.split(',')[0]}</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {savedPlaces.map((place, i) => (
                <div key={i} className="rounded-lg p-3" style={{background:'#161614',border:'1px solid rgba(255,255,255,0.08)'}}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-sm font-medium" style={{color:'#ffffff'}}>{place.name}</div>
                    {place.rating && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span style={{color:'#f4a535',fontSize:'11px'}}>★</span>
                        <span className="text-xs" style={{color:'#9a9890'}}>{place.rating}</span>
                      </div>
                    )}
                  </div>
                  {place.formatted_address && (
                    <div className="text-xs mb-2 line-clamp-1" style={{color:'#5c5b57'}}>{place.formatted_address}</div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <a href={`https://www.google.com/maps/place/?q=place_id:${place.place_id}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs" style={{color:'#4bdbe3',textDecoration:'none'}}
                    >View on Maps →</a>
                    <button onClick={() => removeSavedPlace(stop.id, place.place_id)}
                      className="text-xs" style={{color:'#5c5b57'}}
                      onMouseEnter={e => e.target.style.color='#ff6b5b'}
                      onMouseLeave={e => e.target.style.color='#5c5b57'}
                    >Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EXPENSES AT THIS STOP */}
        <div className="rounded-xl p-5" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="text-xs uppercase tracking-widest mb-4" style={{color:'#5c5b57'}}>
            Expenses at this stop {expenses.length > 0 && `(${expenses.length})`}
          </div>
          {expenses.length === 0 ? (
            <p className="text-sm" style={{color:'#5c5b57'}}>No expenses logged for {stop.name.split(',')[0]} yet</p>
          ) : (
            expenses.slice().reverse().map(e => (
              <div key={e.id} className="flex items-center gap-4 py-3" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{color:'#ffffff'}}>{e.description}</div>
                  <div className="text-xs mt-0.5" style={{color:'#5c5b57'}}>{e.category} · {e.date}</div>
                </div>
                <div className="text-sm font-medium" style={{color:'#ffffff'}}>£{parseFloat(e.amount).toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-serif mb-1" style={{color:'#ffffff'}}>Trip planner</h1>
      <p className="text-sm mb-8" style={{color:'#9a9890'}}>Build your route and set a daily budget per stop</p>

      {trip.stops.length === 0 ? (
        <div className="rounded-xl p-8 text-center mb-6" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
          <p className="text-sm" style={{color:'#5c5b57'}}>No stops yet — add your first destination below</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden mb-6" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
          {trip.stops.map((stop, index) => {
            const days = getDays(stop)
            const spent = getStopSpend(stop.name)
            const projected = days * stop.dailyBudget
            const savedCount = (stop.savedPlaces || []).length
            return (
              <button key={stop.id}
                onClick={() => setSelectedStop(stop.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all hover:opacity-80"
                style={{borderBottom:'1px solid rgba(255,255,255,0.05)',background:'none'}}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  style={{background:'rgba(197,225,97,0.1)',color:'#c5e161'}}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{color:'#ffffff'}}>{stop.name}</div>
                  <div className="text-xs mt-0.5" style={{color:'#5c5b57'}}>{stop.arrival} to {stop.departure} · {days} nights</div>
                </div>
                {savedCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{background:'rgba(75,219,227,0.1)',color:'#4bdbe3'}}>
                    {savedCount} saved
                  </span>
                )}
                {spent > 0 && (
                  <div className="text-right">
                    <div className="text-xs font-medium" style={{color: spent > projected ? '#ff6b5b' : '#ffffff'}}>£{spent.toFixed(0)} spent</div>
                    <div className="text-xs" style={{color:'#5c5b57'}}>of £{projected} projected</div>
                  </div>
                )}
                <div className="text-sm" style={{color:'#9a9890'}}>£{stop.dailyBudget}/day</div>
                <div className="text-xs" style={{color:'#c5e161'}}>→</div>
              </button>
            )
          })}
        </div>
      )}

      {showForm ? (
        <div className="rounded-xl p-5" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="text-xs uppercase tracking-widest mb-4" style={{color:'#5c5b57'}}>New stop</div>

          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-widest mb-2" style={{color:'#5c5b57'}}>Destination</div>
            <input type="text" placeholder="e.g. Bangkok, Thailand"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#ffffff'}}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{color:'#5c5b57'}}>Arrival date</div>
              <input type="date" value={form.arrival}
                onChange={e => setForm({...form, arrival: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#ffffff'}}
              />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest mb-2" style={{color:'#5c5b57'}}>Departure date</div>
              <input type="date" value={form.departure}
                onChange={e => setForm({...form, departure: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#ffffff'}}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="text-[10px] uppercase tracking-widest mb-2" style={{color:'#5c5b57'}}>
              Daily budget — £{form.dailyBudget}/day
            </div>
            <input type="range" min="20" max="200" step="5"
              value={form.dailyBudget}
              onChange={e => setForm({...form, dailyBudget: parseInt(e.target.value)})}
              className="w-full"
              style={{accentColor:'#c5e161'}}
            />
            <div className="flex justify-between text-xs mt-1" style={{color:'#5c5b57'}}>
              <span>£20</span><span>£200</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleAdd}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium"
              style={{background:'#c5e161',color:'#000000'}}
            >Add stop</button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2.5 rounded-lg text-sm"
              style={{background:'#161614',color:'#9a9890'}}
            >Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl text-sm transition-all"
          style={{background:'#0d0d0d',border:'1px dashed rgba(255,255,255,0.1)',color:'#5c5b57'}}
        >
          + Add a destination
        </button>
      )}
    </div>
  )
}
