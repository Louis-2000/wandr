import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'
import {
  fetchTrips, createTripDB, deleteTripDB, updateTripDB,
  createStopDB, deleteStopDB, updateStopDB
} from './db'

const TripContext = createContext()

export function TripProvider({ children }) {
  const [trips, setTrips] = useState([])
  const [activeTripId, setActiveTripId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        loadTrips(session.user.id)
      }
    })
  }, [])

  async function loadTrips(uid) {
    setLoading(true)
    try {
      const data = await fetchTrips(uid)
      const normalised = data.map(t => ({
        id: t.id,
        name: t.name,
        startDate: t.start_date,
        endDate: t.end_date,
        createdAt: t.created_at,
        stops: (t.stops || []).map(s => ({
          id: s.id,
          name: s.name,
          arrival: s.arrival,
          departure: s.departure,
          dailyBudget: s.daily_budget,
          savedPlaces: s.saved_places || [],
          position: s.position
        })).sort((a, b) => a.position - b.position)
      }))
      setTrips(normalised)
    } catch (err) {
      console.error('Error loading trips:', err)
    } finally {
      setLoading(false)
    }
  }

  const activeTrip = trips.find(t => t.id === activeTripId) || null

  async function createTrip({ name, startDate, endDate }) {
    try {
      const data = await createTripDB({ userId, name, startDate, endDate })
      const newTrip = {
        id: data.id, name: data.name,
        startDate: data.start_date, endDate: data.end_date,
        createdAt: data.created_at, stops: []
      }
      setTrips(prev => [newTrip, ...prev])
      return newTrip
    } catch (err) {
      console.error('Error creating trip:', err)
    }
  }

  async function deleteTrip(id) {
    try {
      await deleteTripDB(id)
      setTrips(prev => prev.filter(t => t.id !== id))
      if (activeTripId === id) setActiveTripId(null)
    } catch (err) {
      console.error('Error deleting trip:', err)
    }
  }

  async function updateTrip(id, updates) {
    try {
      const dbUpdates = {}
      if (updates.name) dbUpdates.name = updates.name
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate
      await updateTripDB(id, dbUpdates)
      setTrips(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
    } catch (err) {
      console.error('Error updating trip:', err)
    }
  }

  async function addStop(stop) {
    try {
      const position = activeTrip?.stops?.length || 0
      const data = await createStopDB({
        tripId: activeTripId,
        name: stop.name,
        arrival: stop.arrival,
        departure: stop.departure,
        dailyBudget: stop.dailyBudget,
        position
      })
      const newStop = {
        id: data.id, name: data.name,
        arrival: data.arrival, departure: data.departure,
        dailyBudget: data.daily_budget, savedPlaces: [],
        position: data.position
      }
      setTrips(prev => prev.map(t =>
        t.id === activeTripId
          ? { ...t, stops: [...t.stops, newStop] }
          : t
      ))
    } catch (err) {
      console.error('Error adding stop:', err)
    }
  }

  async function deleteStop(stopId) {
    try {
      await deleteStopDB(stopId)
      setTrips(prev => prev.map(t =>
        t.id === activeTripId
          ? { ...t, stops: t.stops.filter(s => s.id !== stopId) }
          : t
      ))
    } catch (err) {
      console.error('Error deleting stop:', err)
    }
  }

  async function updateStop(stopId, updated) {
    try {
      await updateStopDB(stopId, updated)
      setTrips(prev => prev.map(t =>
        t.id === activeTripId
          ? { ...t, stops: t.stops.map(s => s.id === stopId ? { ...s, ...updated } : s) }
          : t
      ))
    } catch (err) {
      console.error('Error updating stop:', err)
    }
  }

  async function savePlace(cityName, place) {
    const stop = activeTrip?.stops?.find(s =>
      s.name.split(',')[0].toLowerCase() === cityName.toLowerCase()
    )
    if (!stop) return
    const already = (stop.savedPlaces || []).some(p => p.place_id === place.place_id)
    if (already) return
    const newSavedPlaces = [...(stop.savedPlaces || []), place]
    await updateStop(stop.id, { savedPlaces: newSavedPlaces })
  }

  async function removeSavedPlace(stopId, placeId) {
    const stop = activeTrip?.stops?.find(s => s.id === stopId)
    if (!stop) return
    const newSavedPlaces = (stop.savedPlaces || []).filter(p => p.place_id !== placeId)
    await updateStop(stopId, { savedPlaces: newSavedPlaces })
  }

  return (
    <TripContext.Provider value={{
      trips, activeTrip, activeTripId, setActiveTripId, loading,
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
