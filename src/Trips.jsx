import { useState } from 'react'
import { useTrip } from './TripContext'

export default function Trips() {
  const { trips, createTrip, deleteTrip, setActiveTripId } = useTrip()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' })

  function handleCreate() {
    if (!form.name) return
    const trip = createTrip(form)
    setActiveTripId(trip.id)
    setForm({ name: '', startDate: '', endDate: '' })
    setShowForm(false)
  }

  function getDuration(trip) {
    if (!trip.startDate || !trip.endDate) return null
    const diff = (new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)
    return Math.max(0, Math.round(diff))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000000', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 32px' }}>

        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '36px', fontWeight: 400, color: '#ffffff', marginBottom: '6px', letterSpacing: '-0.5px' }}>
            Your trips
          </h1>
          <p style={{ fontSize: '14px', color: '#9a9890' }}>Plan, track and explore all your adventures in one place</p>
        </div>

        {trips.length === 0 && !showForm && (
          <div style={{
            background: '#0d0d0d', border: '1px dashed rgba(197,225,97,0.2)',
            borderRadius: '16px', padding: '64px 32px', textAlign: 'center', marginBottom: '24px'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>✈️</div>
            <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#ffffff', marginBottom: '8px' }}>No trips yet</h2>
            <p style={{ fontSize: '14px', color: '#9a9890', marginBottom: '24px' }}>Create your first trip to start planning your adventure</p>
            <button onClick={() => setShowForm(true)} style={{
              padding: '12px 28px', background: '#c5e161', color: '#000000',
              border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
            }}>
              + Create your first trip
            </button>
          </div>
        )}

        {trips.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            {trips.map(trip => {
              const duration = getDuration(trip)
              const stopCount = trip.stops.length
              return (
                <div key={trip.id} style={{
                  background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px', padding: '20px 24px', marginBottom: '12px',
                  display: 'flex', alignItems: 'center', gap: '16px'
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'rgba(197,225,97,0.1)', border: '1px solid rgba(197,225,97,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px', flexShrink: 0
                  }}>✈️</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '16px', fontWeight: 500, color: '#ffffff', marginBottom: '4px' }}>{trip.name}</div>
                    <div style={{ fontSize: '12px', color: '#9a9890' }}>
                      {trip.startDate && trip.endDate ? `${trip.startDate} → ${trip.endDate}` : 'No dates set'}
                      {duration && ` · ${duration} days`}
                      {stopCount > 0 && ` · ${stopCount} stop${stopCount !== 1 ? 's' : ''}`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={() => setActiveTripId(trip.id)} style={{
                      padding: '8px 20px', background: '#c5e161', color: '#000000',
                      border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
                    }}>Open →</button>
                    <button onClick={() => deleteTrip(trip.id)} style={{
                      padding: '8px 12px', background: 'rgba(255,107,91,0.1)',
                      border: '1px solid rgba(255,107,91,0.2)', borderRadius: '8px',
                      fontSize: '12px', color: '#ff6b5b', cursor: 'pointer',
                      fontFamily: 'DM Sans, sans-serif'
                    }}>Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {showForm ? (
          <div style={{
            background: '#0d0d0d', border: '1px solid rgba(197,225,97,0.2)',
            borderRadius: '14px', padding: '24px'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#c5e161', marginBottom: '20px' }}>
              New trip
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '8px' }}>Trip name</div>
              <input type="text" placeholder="e.g. SE Asia 2025, Euro Trip, Gap Year..."
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                style={{
                  width: '100%', padding: '10px 14px', background: '#161614',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                  color: '#ffffff', fontSize: '14px', outline: 'none',
                  fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '8px' }}>Start date</div>
                <input type="date" value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#161614', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '8px' }}>End date</div>
                <input type="date" value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: '#161614', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleCreate} style={{
                flex: 1, padding: '11px', background: '#c5e161', color: '#000000',
                border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
              }}>Create trip</button>
              <button onClick={() => setShowForm(false)} style={{
                padding: '11px 20px', background: '#161614', color: '#9a9890',
                border: 'none', borderRadius: '8px', fontSize: '13px',
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
              }}>Cancel</button>
            </div>
          </div>
        ) : (
          trips.length > 0 && (
            <button onClick={() => setShowForm(true)} style={{
              width: '100%', padding: '14px', background: '#0d0d0d',
              border: '1px dashed rgba(197,225,97,0.3)', borderRadius: '12px',
              color: '#c5e161', fontSize: '14px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
            }}>
              + Create new trip
            </button>
          )
        )}
      </div>
    </div>
  )
}
