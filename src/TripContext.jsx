import { createContext, useContext, useState } from 'react'

const TripContext = createContext()

export function TripProvider({ children }) {
  const [trip, setTrip] = useState({
    name: 'My Trip',
    totalBudget: 9500,
    stops: [],
  })

  function addStop(stop) {
    setTrip(prev => ({
      ...prev,
      stops: [...prev.stops, { ...stop, id: Date.now() }]
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

  return (
    <TripContext.Provider value={{ trip, addStop, deleteStop, updateStop, updateBudget }}>
      {children}
    </TripContext.Provider>
  )
}

export function useTrip() {
  return useContext(TripContext)
}
