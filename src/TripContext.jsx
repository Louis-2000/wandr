import { createContext, useContext, useState, useEffect } from 'react'

const TripContext = createContext()

export function TripProvider({ children }) {
  const [trips, setTrips] = useState(() => {
    const saved = localStorage.getItem('wandr-trips')
    return saved ? JSON.parse(saved) : []
  })
  const [activeTripId, setActiveTripId] = useState(null)

  useEffect(() => {
    localStorage.setItem('wandr-trips', JSON.stringify(trips))
  }, [trips])

  const activeTrip = trips.find(t => t.id === activeTripId) || null

  function createTrip({ name, startDate, endDate }) {
    const newTrip = {
      id: Date.now(),
      name,
      startDate,
      endDate,
      stops: [],
      createdAt: new Date().toISOString(),
    }
    setTrips(prev => [...prev, newTrip])
    return newTrip
  }

  function deleteTrip(id) {
    setTrips(prev => prev.filter(t => t.id !== id))
    if (activeTripId === id) setActiveTripId(null)
  }

  function updateTrip(id, updates) {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  function addStop(stop) {
    setTrips(prev => prev.map(t =>
      t.id === activeTripId
        ? { ...t, stops: [...t.stops, { ...stop, id: Date.now(), savedPlaces: [] }] }
        : t
    ))
  }

  function deleteStop(stopId) {
    setTrips(prev => prev.map(t =>
      t.id === activeTripId
        ? { ...t, stops: t.stops.filter(s => s.id !== stopId) }
        : t
    ))
  }

  function updateStop(stopId, updated) {
    setTrips(prev => prev.map(t =>
      t.id === activeTripId
        ? { ...t, stops: t.stops.map(s => s.id === stopId ? { ...s, ...updated } : s) }
        : t
    ))
  }

  function savePlace(cityName, place) {
    setTrips(prev => prev.map(t => {
      if (t.id !== activeTripId) return t
      return {
        ...t,
        stops: t.stops.map(s => {
          if (s.name.split(',')[0].toLowerCase() !== cityName.toLowerCase()) return s
          const already = (s.savedPlaces || []).some(p => p.place_id === place.place_id)
          if (already) return s
          return { ...s, savedPlaces: [...(s.savedPlaces || []), place] }
        })
      }
    }))
  }

  function removeSavedPlace(stopId, placeId) {
    setTrips(prev => prev.map(t =>
      t.id === activeTripId
        ? { ...t, stops: t.stops.map(s => s.id === stopId ? { ...s, savedPlaces: (s.savedPlaces || []).filter(p => p.place_id !== placeId) } : s) }
        : t
    ))
  }

  return (
    <TripContext.Provider value={{
      trips, activeTrip, activeTripId, setActiveTripId,
      createTrip, deleteTrip, updateTrip,
      addStop, deleteStop, updateStop,
      savePlace, removeSavedPlace
    }}>
      {children}
    </TripContext.Provider>
  )
}

export function useTrip() {
  return useContext(TripContext)
}
