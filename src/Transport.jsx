import { useState } from 'react'
import { useTrip } from './TripContext'

const SEARCH_ENGINES = [
  { name: 'Rome2Rio', desc: 'Trains, buses, ferries + flights', color: '#4bdbe3', icon: '🌍',
    getUrl: (from, to) => `https://www.rome2rio.com/s/${encodeURIComponent(from)}/${encodeURIComponent(to)}` },
  { name: 'Skyscanner', desc: 'Best flight prices', color: '#a78bfa', icon: '✈️',
    getUrl: (from, to, date) => { const d = date ? date.replace(/-/g,'') : ''; return `https://www.skyscanner.net/transport/flights/${from.slice(0,3).toLowerCase()}/${to.slice(0,3).toLowerCase()}/${d.slice(2)}/` } },
  { name: 'Trainline', desc: 'European & UK trains', color: '#c5e161', icon: '🚂',
    getUrl: (from, to) => `https://www.trainline.com/search/${encodeURIComponent(from)}/${encodeURIComponent(to)}` },
  { name: 'FlixBus', desc: 'Budget buses across Europe & Asia', color: '#f4a535', icon: '🚌',
    getUrl: (from, to) => `https://www.flixbus.com/bus/${encodeURIComponent(from.toLowerCase())}-${encodeURIComponent(to.toLowerCase())}` },
  { name: 'Busbud', desc: 'Buses worldwide', color: '#ff6b5b', icon: '🚍',
    getUrl: (from, to) => `https://www.busbud.com/en/bus-${encodeURIComponent(from.toLowerCase())}-${encodeURIComponent(to.toLowerCase())}` },
  { name: '12go Asia', desc: 'Trains & buses in SE Asia', color: '#f4a535', icon: '🛺',
    getUrl: (from, to) => `https://12go.asia/en/travel/${encodeURIComponent(from.toLowerCase())}/${encodeURIComponent(to.toLowerCase())}` },
]

export default function Transport() {
  const { activeTrip: trip } = useTrip()
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')
  const [date, setDate] = useState('')
  const [searched, setSearched] = useState(false)
  if (!trip) return null

  function handleSearch() { if (!from || !to) return; setSearched(true) }
  function handleStopFill(stop) {
    if (!from) { setFrom(stop.name); return }
    if (!to)   { setTo(stop.name);   return }
    setFrom(stop.name); setTo('')
  }

  return (
    <div>
      <h1 className="text-3xl font-serif mb-1" style={{color:'#ffffff'}}>Transport search</h1>
      <p className="text-sm mb-8" style={{color:'#9a9890'}}>Find buses, trains and flights between any two places</p>

      {trip.stops.length > 0 && (
        <div className="rounded-xl p-4 mb-6" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="text-[10px] uppercase tracking-widest mb-3" style={{color:'#5c5b57'}}>Quick fill from your trip</div>
          <div className="flex flex-wrap gap-2">
            {trip.stops.map(stop => (
              <button key={stop.id} onClick={() => handleStopFill(stop)}
                className="px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#9a9890'}}
              >{stop.name}</button>
            ))}
          </div>
          <p className="text-xs mt-2" style={{color:'#5c5b57'}}>Click a stop to fill in the from/to fields</p>
        </div>
      )}

      <div className="rounded-xl p-5 mb-6" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest mb-2" style={{color:'#5c5b57'}}>From</div>
            <input type="text" placeholder="e.g. Bangkok" value={from}
              onChange={e => { setFrom(e.target.value); setSearched(false) }}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#ffffff'}}
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest mb-2" style={{color:'#5c5b57'}}>To</div>
            <input type="text" placeholder="e.g. Chiang Mai" value={to}
              onChange={e => { setTo(e.target.value); setSearched(false) }}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#ffffff'}}
            />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest mb-2" style={{color:'#5c5b57'}}>Date (optional)</div>
            <input type="date" value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#ffffff'}}
            />
          </div>
        </div>
        <button onClick={handleSearch} disabled={!from || !to}
          className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30"
          style={{background:'#c5e161',color:'#000000'}}
        >Search transport options</button>
      </div>

      {searched && (
        <>
          <div className="rounded-xl p-4 mb-4" style={{background:'#0d0d0d',border:'1px solid rgba(75,219,227,0.2)'}}>
            <div className="text-xs" style={{color:'#9a9890'}}>
              <span style={{color:'#4bdbe3',fontWeight:500}}>Tip:</span> For SE Asia, 12go.asia is best for trains and buses. Rome2Rio is great for an overview of all options.
            </div>
          </div>

          <div className="text-xs uppercase tracking-widest mb-3" style={{color:'#5c5b57'}}>
            Results for {from} to {to}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {SEARCH_ENGINES.map(engine => (
              <a key={engine.name} href={engine.getUrl(from, to, date)} target="_blank" rel="noopener noreferrer"
                className="rounded-xl p-4 flex items-center gap-4 transition-all group"
                style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)',textDecoration:'none'}}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{background: engine.color + '18'}}>
                  {engine.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{color:'#ffffff'}}>{engine.name}</div>
                  <div className="text-xs mt-0.5" style={{color:'#5c5b57'}}>{engine.desc}</div>
                </div>
                <div className="text-sm" style={{color:'#5c5b57'}}>→</div>
              </a>
            ))}
          </div>
        </>
      )}

      {!searched && (
        <div className="rounded-xl p-8 text-center" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
          <p className="text-sm" style={{color:'#5c5b57'}}>Enter a from and to destination above to see transport options</p>
        </div>
      )}
    </div>
  )
}
