import { useState } from 'react'
import { useTrip } from './TripContext'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getDaysUntil(dateStr) {
  if (!dateStr) return null
  const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24)
  return Math.round(diff)
}

export default function Trips() {
  const { trips, createTrip, deleteTrip, setActiveTripId, loading } = useTrip()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' })
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    if (!form.name) return
    setCreating(true)
    const trip = await createTrip(form)
    if (trip) {
      setActiveTripId(trip.id)
      setForm({ name: '', startDate: '', endDate: '' })
      setShowForm(false)
    }
    setCreating(false)
  }

  function getDuration(trip) {
    if (!trip.startDate || !trip.endDate) return null
    const diff = (new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)
    return Math.max(0, Math.round(diff))
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', color: '#ffffff', marginBottom: '12px' }}>
            wand<span style={{ color: '#c5e161' }}>r</span>
          </div>
          <div style={{ fontSize: '13px', color: '#5c5b57' }}>Loading your trips...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000000', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 32px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '36px', fontWeight: 400, color: '#ffffff', marginBottom: '6px', letterSpacing: '-0.5px' }}>
              Your trips
            </h1>
            <p style={{ fontSize: '14px', color: '#9a9890' }}>Plan, track and explore all your adventures</p>
          </div>
          {trips.length > 0 && !showForm && (
            <button onClick={() => setShowForm(true)} style={{
              padding: '10px 20px', background: '#c5e161', color: '#000000',
              border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
            }}>+ New trip</button>
          )}
        </div>

        {trips.length === 0 && !showForm && (
          <div style={{
            background: '#0d0d0d', border: '1px dashed rgba(197,225,97,0.2)',
            borderRadius: '16px', padding: '64px 32px', textAlign: 'center', marginBottom: '24px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✈️</div>
            <h2 style={{ fontSize: '20px', fontWeight: 500, color: '#ffffff', marginBottom: '8px' }}>No trips yet</h2>
            <p style={{ fontSize: '14px', color: '#9a9890', marginBottom: '28px', maxWidth: '340px', margin: '0 auto 28px' }}>
              Create your first trip to start planning your route, tracking your budget and discovering places
            </p>
            <button onClick={() => setShowForm(true)} style={{
              padding: '12px 28px', background: '#c5e161', color: '#000000',
              border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
            }}>+ Create your first trip</button>
          </div>
        )}

        {trips.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            {trips.map(trip => {
              const duration = getDuration(trip)
              const stopCount = trip.stops.length
              const daysUntil = getDaysUntil(trip.startDate)
              const hasStarted = daysUntil !== null && daysUntil <= 0
              const departsIn = daysUntil !== null && daysUntil > 0

              return (
                <div key={trip.id} style={{
                  background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px', padding: '20px 24px', marginBottom: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      background: 'rgba(197,225,97,0.08)', border: '1px solid rgba(197,225,97,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '22px', flexShrink: 0
                    }}>✈️</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 500, color: '#ffffff' }}>{trip.name}</div>
                        {hasStarted && (
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(197,225,97,0.1)', color: '#c5e161', border: '1px solid rgba(197,225,97,0.2)' }}>
                            In progress
                          </span>
                        )}
                        {departsIn && (
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: 'rgba(75,219,227,0.1)', color: '#4bdbe3', border: '1px solid rgba(75,219,227,0.2)' }}>
                            In {daysUntil} days
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9a9890' }}>
                        {trip.startDate && trip.endDate ? `${formatDate(trip.startDate)} → ${formatDate(trip.endDate)}` : 'No dates set'}
                        {duration && ` · ${duration} days`}
                        {stopCount > 0 && ` · ${stopCount} stop${stopCount !== 1 ? 's' : ''}`}
                      </div>

                      {stopCount > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {trip.stops.slice(0, 5).map((stop, i) => (
                              <span key={stop.id} style={{
                                fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                                background: 'rgba(255,255,255,0.05)', color: '#9a9890',
                                border: '1px solid rgba(255,255,255,0.08)'
                              }}>{stop.name.split(',')[0]}</span>
                            ))}
                            {trip.stops.length > 5 && (
                              <span style={{ fontSize: '11px', color: '#5c5b57' }}>+{trip.stops.length - 5} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
                      <button onClick={() => setActiveTripId(trip.id)} style={{
                        padding: '8px 20px', background: '#c5e161', color: '#000000',
                        border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                        cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
                      }}>Open →</button>
                      <button onClick={() => deleteTrip(trip.id)} style={{
                        padding: '8px 12px', background: 'rgba(255,107,91,0.08)',
                        border: '1px solid rgba(255,107,91,0.15)', borderRadius: '8px',
                        fontSize: '12px', color: '#ff6b5b', cursor: 'pointer',
                        fontFamily: 'DM Sans, sans-serif'
                      }}>Delete</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {showForm && (
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
                autoFocus
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
              <button onClick={handleCreate} disabled={creating || !form.name} style={{
                flex: 1, padding: '11px', background: creating ? 'rgba(197,225,97,0.5)' : '#c5e161',
                color: '#000000', border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: 500, cursor: creating ? 'not-allowed' : 'pointer',
                fontFamily: 'DM Sans, sans-serif'
              }}>{creating ? 'Creating...' : 'Create trip'}</button>
              <button onClick={() => setShowForm(false)} style={{
                padding: '11px 20px', background: '#161614', color: '#9a9890',
                border: 'none', borderRadius: '8px', fontSize: '13px',
                cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
              }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
