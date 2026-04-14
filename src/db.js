import { supabase } from './supabase'

// TRIPS
export async function fetchTrips(userId) {
  const { data, error } = await supabase
    .from('trips')
    .select('*, stops(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createTripDB({ userId, name, startDate, endDate }) {
  const { data, error } = await supabase
    .from('trips')
    .insert({ user_id: userId, name, start_date: startDate || null, end_date: endDate || null })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTripDB(tripId) {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', tripId)
  if (error) throw error
}

export async function updateTripDB(tripId, updates) {
  const { error } = await supabase
    .from('trips')
    .update(updates)
    .eq('id', tripId)
  if (error) throw error
}

// STOPS
export async function createStopDB({ tripId, name, arrival, departure, dailyBudget, position }) {
  const { data, error } = await supabase
    .from('stops')
    .insert({
      trip_id: tripId,
      name,
      arrival: arrival || null,
      departure: departure || null,
      daily_budget: dailyBudget || 60,
      position: position || 0,
      saved_places: []
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteStopDB(stopId) {
  const { error } = await supabase
    .from('stops')
    .delete()
    .eq('id', stopId)
  if (error) throw error
}

export async function updateStopDB(stopId, updates) {
  const dbUpdates = {}
  if (updates.name !== undefined) dbUpdates.name = updates.name
  if (updates.arrival !== undefined) dbUpdates.arrival = updates.arrival
  if (updates.departure !== undefined) dbUpdates.departure = updates.departure
  if (updates.dailyBudget !== undefined) dbUpdates.daily_budget = updates.dailyBudget
  if (updates.savedPlaces !== undefined) dbUpdates.saved_places = updates.savedPlaces

  const { error } = await supabase
    .from('stops')
    .update(dbUpdates)
    .eq('id', stopId)
  if (error) throw error
}

// EXPENSES
export async function fetchExpenses(tripId) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createExpenseDB({ tripId, description, amount, category, stopName, date }) {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      trip_id: tripId,
      description,
      amount: parseFloat(amount),
      category,
      stop_name: stopName || null,
      date: date || null
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteExpenseDB(expenseId) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
  if (error) throw error
}
