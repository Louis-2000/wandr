import { useState } from 'react'
import { useTrip } from './TripContext'

const CATEGORIES = [
  { id: 'restaurants', label: 'Food & drink', icon: '🍜' },
  { id: 'tourist attractions', label: 'Attractions', icon: '🏛️' },
  { id: 'nature parks', label: 'Nature', icon: '🌿' },
  { id: 'nightlife', label: 'Nightlife', icon: '🌙' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️' },
  { id: 'museums', label: 'Museums', icon: '🎨' },
]

const PRICE_LABELS = { 1: 'Free / cheap', 2: 'Mid-range', 3: 'Pricey', 4: 'Expensive' }

const BACKEND_URL = 'http://humorous-luck-production.up.railway.app'

export default function Discover() {
  const { trip } = useTrip()
  const [city, setCity]         = useState('')
  const [category, setCategory] = useState('tourist attractions')
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch() {
    if (!city) return
    setLoading(true)
    setError(null)
    setResults([])
    setSearched(true)

    try {
      const query = `${category} in ${city}`
      const res = await fetch(`${BACKEND_URL}/api/places?query=${encodeURIComponent(query)}`)
      const data = await res.json()

      if (data.places) {
        setResults(data.places)
      } else {
        setError('No results found — try a different city or category')
      }
    } catch (err) {
      setError('Could not connect to server — make sure your backend is running')
    } finally {
      setLoading(false)
    }
  }

  function handleStopFill(stop) {
    setCity(stop.name.split(',')[0])
    setSearched(false)
    setResults([])
  }

  return (
    <div>
      <h1 className="text-3xl font-serif mb-1">Discover</h1>
      <p className="text-sm text-[#9a9890] mb-8">Find things to do at any destination</p>

      {/* QUICK FILL FROM STOPS */}
      {trip.stops.length > 0 && (
        <div className="bg-[#161714] border border-white/8 rounded-xl p-4 mb-6">
          <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-3">Your stops</div>
          <div className="flex flex-wrap gap-2">
            {trip.stops.map(stop => (
              <button
                key={stop.id}
                onClick={() => handleStopFill(stop)}
                className="px-3 py-1.5 bg-[#1e1f1c] border border-white/10 rounded-lg text-xs text-[#9a9890] hover:border-[#c8f060]/30 hover:text-[#c8f060] transition-all"
              >
                {stop.name.split(',')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div className="bg-[#161714] border border-white/8 rounded-xl p-5 mb-6">
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-2">City</div>
          <input
            type="text"
            placeholder="e.g. Bangkok"
            value={city}
            onChange={e => { setCity(e.target.value); setSearched(false) }}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full px-3 py-2 bg-[#1e1f1c] border border-white/10 rounded-lg text-sm text-[#f0ede6] placeholder-[#5c5b57] outline-none focus:border-[#c8f060]/50"
          />
        </div>

        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-2">Category</div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                  category === cat.id
                    ? 'bg-[#c8f060]/10 border-[#c8f060]/30 text-[#c8f060]'
                    : 'bg-[#1e1f1c] border-white/10 text-[#9a9890] hover:text-[#f0ede6]'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={!city || loading}
          className="w-full py-2.5 bg-[#c8f060] text-[#0e0f0e] rounded-lg text-sm font-medium hover:bg-[#a8d040] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Find places'}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-[#161714] border border-[#ff6b5b]/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-[#ff6b5b]">{error}</p>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="bg-[#161714] border border-white/8 rounded-xl p-8 text-center mb-6">
          <p className="text-sm text-[#5c5b57]">Finding places in {city}...</p>
        </div>
      )}

      {/* RESULTS */}
      {!loading && searched && results.length > 0 && (
        <>
          <div className="text-xs uppercase tracking-widest text-[#5c5b57] mb-3">
            {results.length} places found in {city}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {results.map((place, i) => (
              <a
                key={i}
                href={place.googleMapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#161714] border border-white/8 rounded-xl p-4 hover:border-white/16 transition-all group block"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-sm font-medium text-[#f0ede6] group-hover:text-[#c8f060] transition-colors leading-snug">
                    {place.displayName?.text}
                  </div>
                  {place.rating && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-[#f4a535] text-xs">★</span>
                      <span className="text-xs text-[#9a9890]">{place.rating}</span>
                    </div>
                  )}
                </div>
                {place.formattedAddress && (
                  <div className="text-xs text-[#5c5b57] mb-2 line-clamp-1">{place.formattedAddress}</div>
                )}
                <div className="flex items-center justify-between">
                  {place.priceLevel && (
                    <span className="text-xs text-[#9a9890]">{PRICE_LABELS[place.priceLevel] || ''}</span>
                  )}
                  <span className="text-xs text-[#5c5b57] group-hover:text-[#c8f060] transition-colors ml-auto">
                    View on Maps →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}

      {/* EMPTY STATE */}
      {!loading && !searched && (
        <div className="bg-[#161714] border border-white/8 rounded-xl p-8 text-center">
          <p className="text-[#5c5b57] text-sm">Enter a city and pick a category to discover places</p>
        </div>
      )}
    </div>
  )
}