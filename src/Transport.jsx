import { useState } from 'react'
import { useTrip } from './TripContext'

const SEARCH_ENGINES = [
  {
    name: 'Rome2Rio',
    desc: 'Trains, buses, ferries + flights',
    color: '#4ecdc4',
    icon: '🌍',
    getUrl: (from, to) =>
      `https://www.rome2rio.com/s/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,
  },
  {
    name: 'Skyscanner',
    desc: 'Best flight prices',
    color: '#a78bfa',
    icon: '✈️',
    getUrl: (from, to, date) => {
      const d = date ? date.replace(/-/g, '') : ''
      return `https://www.skyscanner.net/transport/flights/${from.slice(0,3).toLowerCase()}/${to.slice(0,3).toLowerCase()}/${d.slice(2)}/`
    },
  },
  {
    name: 'Trainline',
    desc: 'European & UK trains',
    color: '#c8f060',
    icon: '🚂',
    getUrl: (from, to) =>
      `https://www.trainline.com/search/${encodeURIComponent(from)}/${encodeURIComponent(to)}`,
  },
  {
    name: 'FlixBus',
    desc: 'Budget buses across Europe & Asia',
    color: '#f4a535',
    icon: '🚌',
    getUrl: (from, to) =>
      `https://www.flixbus.com/bus/${encodeURIComponent(from.toLowerCase())}-${encodeURIComponent(to.toLowerCase())}`,
  },
  {
    name: 'Busbud',
    desc: 'Buses worldwide',
    color: '#ff6b5b',
    icon: '🚍',
    getUrl: (from, to, date) =>
      `https://www.busbud.com/en/bus-${encodeURIComponent(from.toLowerCase())}-${encodeURIComponent(to.toLowerCase())}`,
  },
  {
    name: '12go Asia',
    desc: 'Trains & buses in SE Asia',
    color: '#f4a535',
    icon: '🛺',
    getUrl: (from, to) =>
      `https://12go.asia/en/travel/${encodeURIComponent(from.toLowerCase())}/${encodeURIComponent(to.toLowerCase())}`,
  },
]

const TIPS = {
  default: 'Search across multiple sites to find the best option for your route.',
  asia: 'For SE Asia, 12go.asia is the best for trains and buses. Rome2Rio is great for an overview.',
  europe: 'Trainline covers most European rail routes. FlixBus is great for budget long-distance.',
  flight: 'For flights, Skyscanner usually finds the cheapest fares. Book direct with the airline.',
}

export default function Transport() {
  const { trip } = useTrip()
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')
  const [date, setDate] = useState('')
  const [searched, setSearched] = useState(false)

  function handleSearch() {
    if (!from || !to) return
    setSearched(true)
  }

  function handleStopFill(stop) {
    if (!from) { setFrom(stop.name); return }
    if (!to)   { setTo(stop.name);   return }
    setFrom(stop.name)
    setTo('')
  }

  function getTip() {
    const combined = (from + to).toLowerCase()
    if (['bangkok','chiang mai','bali','hanoi','ho chi minh','cambodia','vietnam','thailand','indonesia'].some(w => combined.includes(w))) return TIPS.asia
    if (['london','paris','berlin','amsterdam','madrid','rome','barcelona'].some(w => combined.includes(w))) return TIPS.europe
    return TIPS.default
  }

  return (
    <div>
      <h1 className="text-3xl font-serif mb-1">Transport search</h1>
      <p className="text-sm text-[#9a9890] mb-8">Find buses, trains and flights between any two places</p>

      {/* QUICK FILL FROM STOPS */}
      {trip.stops.length > 0 && (
        <div className="bg-[#161714] border border-white/8 rounded-xl p-4 mb-6">
          <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-3">Quick fill from your trip</div>
          <div className="flex flex-wrap gap-2">
            {trip.stops.map(stop => (
              <button
                key={stop.id}
                onClick={() => handleStopFill(stop)}
                className="px-3 py-1.5 bg-[#1e1f1c] border border-white/10 rounded-lg text-xs text-[#9a9890] hover:border-[#c8f060]/30 hover:text-[#c8f060] transition-all"
              >
                {stop.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#5c5b57] mt-2">Click a stop to fill in the from/to fields</p>
        </div>
      )}

      {/* SEARCH FORM */}
      <div className="bg-[#161714] border border-white/8 rounded-xl p-5 mb-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-2">From</div>
            <input
              type="text"
              placeholder="e.g. Bangkok"
              value={from}
              onChange={e => { setFrom(e.target.value); setSearched(false) }}
              className="w-full px-3 py-2 bg-[#1e1f1c] border border-white/10 rounded-lg text-sm text-[#f0ede6] placeholder-[#5c5b57] outline-none focus:border-[#c8f060]/50"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-2">To</div>
            <input
              type="text"
              placeholder="e.g. Chiang Mai"
              value={to}
              onChange={e => { setTo(e.target.value); setSearched(false) }}
              className="w-full px-3 py-2 bg-[#1e1f1c] border border-white/10 rounded-lg text-sm text-[#f0ede6] placeholder-[#5c5b57] outline-none focus:border-[#c8f060]/50"
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-2">Date (optional)</div>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-[#1e1f1c] border border-white/10 rounded-lg text-sm text-[#f0ede6] outline-none focus:border-[#c8f060]/50"
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={!from || !to}
          className="w-full py-2.5 bg-[#c8f060] text-[#0e0f0e] rounded-lg text-sm font-medium hover:bg-[#a8d040] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Search transport options
        </button>
      </div>

      {/* RESULTS */}
      {searched && (
        <>
          <div className="bg-[#161714] border border-white/8 rounded-xl p-4 mb-4">
            <div className="text-xs text-[#9a9890]">
              <span className="text-[#c8f060] font-medium">Tip:</span> {getTip()}
            </div>
          </div>

          <div className="text-xs uppercase tracking-widest text-[#5c5b57] mb-3">
            Search results for {from} to {to}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SEARCH_ENGINES.map(engine => (
              <a
                key={engine.name}
                href={engine.getUrl(from, to, date)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#161714] border border-white/8 rounded-xl p-4 flex items-center gap-4 hover:border-white/16 transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: engine.color + '18' }}
                >
                  {engine.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#f0ede6] group-hover:text-[#c8f060] transition-colors">
                    {engine.name}
                  </div>
                  <div className="text-xs text-[#5c5b57] mt-0.5">{engine.desc}</div>
                </div>
                <div className="text-[#5c5b57] group-hover:text-[#c8f060] transition-colors text-sm">→</div>
              </a>
            ))}
          </div>

          <p className="text-xs text-[#5c5b57] mt-4 text-center">
            Each link opens a pre-filled search on the booking site. Compare prices across all of them.
          </p>
        </>
      )}

      {!searched && (
        <div className="bg-[#161714] border border-white/8 rounded-xl p-8 text-center">
          <p className="text-[#5c5b57] text-sm">Enter a from and to destination above to see transport options</p>
        </div>
      )}
    </div>
  )
}
