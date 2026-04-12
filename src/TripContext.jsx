import { createContext, useContext, useState, useEffect } from 'react'

const TripContext = createContext()

export function TripProvider({ children }) {
  const [trip, setTrip] = useState(() => {
    const saved = localStorage.getItem('wandr-trip')
    return saved ? JSON.parse(saved) : {
      name: 'My Trip',
      totalBudget: 9500,
      stops: [],
    }
  })

  useEffect(() => {
    localStorage.setItem('wandr-trip', JSON.stringify(trip))
  }, [trip])

  function addStop(stop) {
    setTrip(prev => ({
      ...prev,
      stops: [...prev.stops, { ...stop, id: Date.now(), savedPlaces: [] }]
    }))
  }

  function deleteStop(id) {
    setTrip(prev => ({
      ...prev,
      stops: prev.stops.filter(s => s.id !== id)
    }))
  }

  function updateStop(id, updated) {
    setTrip(prev => ({
      ...prev,
      stops: prev.stops.map(s => s.id === id ? { ...s, ...updated } : s)
    }))
  }

  function updateBudget(amount) {
    setTrip(prev => ({ ...prev, totalBudget: amount }))
  }

  function savePlace(stopName, place) {
    setTrip(prev => ({
      ...prev,
      stops: prev.stops.map(s => {
        if (s.name.split(',')[0].toLowerCase() !== stopName.toLowerCase()) return s
        const already = (s.savedPlaces || []).some(p => p.place_id === place.place_id)
        if (already) return s
        return { ...s, savedPlaces: [...(s.savedPlaces || []), place] }
      })
    }))
  }

  function removeSavedPlace(stopId, placeId) {
    setTrip(prev => ({
      ...prev,
      stops: prev.stops.map(s =>
        s.id === stopId
          ? { ...s, savedPlaces: (s.savedPlaces || []).filter(p => p.place_id !== placeId) }
          : s
      )
    }))
  }

  return (
    <TripContext.Provider value={{ trip, addStop, deleteStop, updateStop, updateBudget, savePlace, removeSavedPlace }}>
      {children}
    </TripContext.Provider>
  )
}

export function useTrip() {
  return useContext(TripContext)
}
