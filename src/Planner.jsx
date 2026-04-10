import { useState } from 'react'
import { useTrip } from './TripContext'

export default function Planner() {
  const { trip, addStop, deleteStop } = useTrip()
  const [form, setForm] = useState({
    name: '',
    arrival: '',
    departure: '',
    dailyBudget: 60,
  })
  const [showForm, setShowForm] = useState(false)

  function handleAdd() {
    if (!form.name || !form.arrival || !form.departure) return
    addStop(form)
    setForm({ name: '', arrival: '', departure: '', dailyBudget: 60 })
    setShowForm(false)
  }

  return (
    <div>
      <h1 className="text-3xl font-serif mb-1">Trip planner</h1>
      <p className="text-sm text-[#9a9890] mb-8">Build your route and set a daily budget per stop</p>

      {/* STOP LIST */}
      {trip.stops.length === 0 ? (
        <div className="bg-[#161714] border border-white/8 rounded-xl p-8 text-center mb-6">
          <p className="text-[#5c5b57] text-sm">No stops yet — add your first destination below</p>
        </div>
      ) : (
        <div className="bg-[#161714] border border-white/8 rounded-xl overflow-hidden mb-6">
          {trip.stops.map((stop, index) => (
            <div key={stop.id} className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0">
              <div className="w-6 h-6 rounded-full bg-[#c8f060]/10 text-[#c8f060] flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-[#f0ede6]">{stop.name}</div>
                <div className="text-xs text-[#5c5b57] mt-0.5">{stop.arrival} → {stop.departure}</div>
              </div>
              <div className="text-sm text-[#9a9890]">£{stop.dailyBudget}/day</div>
              <button
                onClick={() => deleteStop(stop.id)}
                className="text-xs text-[#5c5b57] hover:text-[#ff6b5b] transition-colors px-2 py-1"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ADD STOP FORM */}
      {showForm ? (
        <div className="bg-[#161714] border border-white/8 rounded-xl p-5">
          <div className="text-xs uppercase tracking-widest text-[#5c5b57] mb-4">New stop</div>

          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-2">Destination</div>
            <input
              type="text"
              placeholder="e.g. Bangkok, Thailand"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-[#1e1f1c] border border-white/10 rounded-lg text-sm text-[#f0ede6] placeholder-[#5c5b57] outline-none focus:border-[#c8f060]/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-2">Arrival date</div>
              <input
                type="date"
                value={form.arrival}
                onChange={e => setForm({ ...form, arrival: e.target.value })}
                className="w-full px-3 py-2 bg-[#1e1f1c] border border-white/10 rounded-lg text-sm text-[#f0ede6] outline-none focus:border-[#c8f060]/50"
              />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-2">Departure date</div>
              <input
                type="date"
                value={form.departure}
                onChange={e => setForm({ ...form, departure: e.target.value })}
                className="w-full px-3 py-2 bg-[#1e1f1c] border border-white/10 rounded-lg text-sm text-[#f0ede6] outline-none focus:border-[#c8f060]/50"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-2">
              Daily budget — £{form.dailyBudget}/day
            </div>
            <input
              type="range"
              min="20"
              max="200"
              step="5"
              value={form.dailyBudget}
              onChange={e => setForm({ ...form, dailyBudget: parseInt(e.target.value) })}
              className="w-full accent-[#c8f060]"
            />
            <div className="flex justify-between text-xs text-[#5c5b57] mt-1">
              <span>£20</span>
              <span>£200</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAdd}
              className="flex-1 py-2.5 bg-[#c8f060] text-[#0e0f0e] rounded-lg text-sm font-medium hover:bg-[#a8d040] transition-colors"
            >
              Add stop
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 bg-[#1e1f1c] text-[#9a9890] rounded-lg text-sm hover:bg-[#272824] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 bg-[#161714] border border-dashed border-white/10 rounded-xl text-sm text-[#5c5b57] hover:border-[#c8f060]/30 hover:text-[#9a9890] transition-all"
        >
          + Add a destination
        </button>
      )}
    </div>
  )
}
