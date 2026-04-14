import PlaceAutocomplete from './PlaceAutocomplete'
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
const BACKEND_URL = 'https://humorous-luck-production.up.railway.app'

export default function Discover() {
  const { activeTrip: trip, savePlace } = useTrip()
  const [city, setCity]         = useState('')
  const [category, setCategory] = useState('tourist attractions')
  const [results, setResults]   = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [searched, setSearched] = useState(false)
  const [saved, setSaved]       = useState([])
  if (!trip) return null

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
      if (data.results && data.results.length > 0) {
        setResults(data.results)
      } else {
        setError('No results found - try a different city or category')
      }
    } catch (err) {
      setError('Could not connect to server - make sure your backend is running')
    } finally {
      setLoading(false)
    }
  }

  function handleStopFill(stop) {
    setCity(stop.name.split(',')[0])
    setSearched(false)
    setResults([])
    setSaved([])
  }

  function handleSave(place) {
    if (!city) return
    savePlace(city, place)
    setSaved(prev => [...prev, place.place_id])
  }

  function isPlaceSaved(place) {
    if (saved.includes(place.place_id)) return true
    return trip.stops.some(s =>
      s.name.split(',')[0].toLowerCase() === city.toLowerCase() &&
      (s.savedPlaces || []).some(p => p.place_id === place.place_id)
    )
  }

  function getMapsUrl(place) {
    return `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
  }

  return (
    <div>
      <h1 className="text-3xl font-serif mb-1" style={{color:'#ffffff'}}>Discover</h1>
      <p className="text-sm mb-8" style={{color:'#9a9890'}}>Find things to do at any destination</p>

      {trip.stops.length > 0 && (
        <div className="rounded-xl p-4 mb-6" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="text-[10px] uppercase tracking-widest mb-3" style={{color:'#5c5b57'}}>Your stops</div>
          <div className="flex flex-wrap gap-2">
            {trip.stops.map(stop => (
              <button key={stop.id} onClick={() => handleStopFill(stop)}
                className="px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: city === stop.name.split(',')[0] ? 'rgba(197,225,97,0.1)' : '#161614',
                  border: city === stop.name.split(',')[0] ? '1px solid rgba(197,225,97,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  color: city === stop.name.split(',')[0] ? '#c5e161' : '#9a9890'
                }}
              >
                {stop.name.split(',')[0]}
                {(stop.savedPlaces || []).length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]" style={{background:'rgba(75,219,227,0.15)',color:'#4bdbe3'}}>
                    {stop.savedPlaces.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl p-5 mb-6" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-widest mb-2" style={{color:'#5c5b57'}}>City</div>
          <PlaceAutocomplete
  value={city}
  onChange={val => { setCity(val); setSearched(false) }}
  placeholder="e.g. Bangkok"
  style={{ padding: '9px 12px', background: '#161614', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
/>
        </div>

        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-widest mb-2" style={{color:'#5c5b57'}}>Category</div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className="px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: category === cat.id ? 'rgba(197,225,97,0.1)' : '#161614',
                  border: category === cat.id ? '1px solid rgba(197,225,97,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  color: category === cat.id ? '#c5e161' : '#9a9890'
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSearch} disabled={!city || loading}
          className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30"
          style={{background:'#c5e161',color:'#000000'}}
        >
          {loading ? 'Searching...' : 'Find places'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl p-4 mb-6" style={{background:'#0d0d0d',border:'1px solid rgba(255,107,91,0.2)'}}>
          <p className="text-sm" style={{color:'#ff6b5b'}}>{error}</p>
        </div>
      )}

      {loading && (
        <div className="rounded-xl p-8 text-center mb-6" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
          <p className="text-sm" style={{color:'#5c5b57'}}>Finding places in {city}...</p>
        </div>
      )}

      {!loading && searched && results.length > 0 && (
        <>
          <div className="text-xs uppercase tracking-widest mb-3" style={{color:'#5c5b57'}}>
            {results.length} places found in {city}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {results.map((place, i) => (
              <div key={i} className="rounded-xl p-4 transition-all"
                style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-sm font-medium leading-snug" style={{color:'#ffffff'}}>{place.name}</div>
                  {place.rating && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span style={{color:'#f4a535',fontSize:'12px'}}>★</span>
                      <span className="text-xs" style={{color:'#9a9890'}}>{place.rating}</span>
                    </div>
                  )}
                </div>
                {place.formatted_address && (
                  <div className="text-xs mb-2 line-clamp-1" style={{color:'#5c5b57'}}>{place.formatted_address}</div>
                )}
                <div className="flex items-center justify-between mt-3 gap-2">
                  {place.opening_hours && (
                    <span className="text-xs" style={{color: place.opening_hours.open_now ? '#4bdbe3' : '#ff6b5b'}}>
                      {place.opening_hours.open_now ? 'Open now' : 'Closed'}
                    </span>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => handleSave(place)}
                      disabled={isPlaceSaved(place)}
                      className="text-xs px-2.5 py-1 rounded-lg transition-all"
                      style={{
                        background: isPlaceSaved(place) ? 'rgba(75,219,227,0.1)' : 'rgba(197,225,97,0.1)',
                        border: isPlaceSaved(place) ? '1px solid rgba(75,219,227,0.3)' : '1px solid rgba(197,225,97,0.3)',
                        color: isPlaceSaved(place) ? '#4bdbe3' : '#c5e161',
                        cursor: isPlaceSaved(place) ? 'default' : 'pointer'
                      }}
                    >
                      {isPlaceSaved(place) ? 'Saved' : '+ Save'}
                    </button>
                    <a href={getMapsUrl(place)} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1 rounded-lg transition-all"
                      style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#9a9890',textDecoration:'none'}}
                    >
                      Maps →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !searched && (
        <div className="rounded-xl p-8 text-center" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
          <p className="text-sm" style={{color:'#5c5b57'}}>Enter a city and pick a category to discover places</p>
        </div>
      )}
    </div>
  )
}
