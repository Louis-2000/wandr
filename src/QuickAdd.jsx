import { useState } from 'react'
import { useBudget } from './BudgetContext'
import { useTrip } from './TripContext'

const CATEGORIES = [
  { label: 'Food', icon: '🍜', value: 'Food & drink' },
  { label: 'Stay', icon: '🏨', value: 'Accommodation' },
  { label: 'Travel', icon: '🚌', value: 'Transport' },
  { label: 'Fun', icon: '🎭', value: 'Activities' },
  { label: 'Shop', icon: '🛍️', value: 'Shopping' },
  { label: 'Other', icon: '📦', value: 'Misc' },
]

export default function QuickAdd() {
  const { addExpense } = useBudget()
  const { activeTrip } = useTrip()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food & drink')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function getCurrentStop() {
    if (!activeTrip?.stops) return ''
    const today = new Date()
    const current = activeTrip.stops.find(s => {
      if (!s.arrival || !s.departure) return false
      return new Date(s.arrival) <= today && new Date(s.departure) >= today
    })
    return current?.name || ''
  }

  async function handleSave() {
    if (!amount || parseFloat(amount) <= 0) return
    setSaving(true)
    await addExpense({
      description: category,
      amount,
      category,
      stop: getCurrentStop(),
      date: new Date().toISOString().split('T')[0],
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setAmount('')
      setCategory('Food & drink')
      setOpen(false)
    }, 800)
  }

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: '28px', right: '28px',
          width: '52px', height: '52px', borderRadius: '50%',
          background: '#c5e161', color: '#000000', border: 'none',
          fontSize: '22px', cursor: 'pointer', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(197,225,97,0.3)',
          transition: 'transform 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Quick add expense"
      >
        +
      </button>

      {/* OVERLAY */}
      {open && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            padding: '0 0 40px',
          }}
        >
          <div style={{
            background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '420px',
            animation: 'slideUp 0.25s cubic-bezier(0.16,1,0.3,1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: '#ffffff' }}>Quick add expense</div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#9a9890', fontSize: '18px', cursor: 'pointer' }}>×</button>
            </div>

            {/* AMOUNT INPUT */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span style={{ fontSize: '28px', fontWeight: 500, color: '#9a9890' }}>£</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  autoFocus
                  style={{
                    background: 'none', border: 'none', outline: 'none',
                    fontSize: '42px', fontWeight: 600, color: '#ffffff',
                    width: '180px', textAlign: 'center',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                />
              </div>
              <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', marginTop: '8px' }} />
            </div>

            {/* CATEGORY GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '20px' }}>
              {CATEGORIES.map(cat => (
                <button key={cat.value} onClick={() => setCategory(cat.value)} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  padding: '10px 4px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                  background: category === cat.value ? 'rgba(197,225,97,0.15)' : 'rgba(255,255,255,0.04)',
                  outline: category === cat.value ? '1px solid rgba(197,225,97,0.4)' : 'none',
                  fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s'
                }}>
                  <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                  <span style={{ fontSize: '10px', color: category === cat.value ? '#c5e161' : '#9a9890' }}>{cat.label}</span>
                </button>
              ))}
            </div>

            {getCurrentStop() && (
              <div style={{ fontSize: '12px', color: '#9a9890', marginBottom: '16px', textAlign: 'center' }}>
                📍 Will be logged to <strong style={{ color: '#ffffff' }}>{getCurrentStop().split(',')[0]}</strong>
              </div>
            )}

            <button onClick={handleSave} disabled={!amount || saving || saved} style={{
              width: '100%', padding: '14px',
              background: saved ? 'rgba(75,219,227,0.2)' : '#c5e161',
              color: saved ? '#4bdbe3' : '#000000',
              border: saved ? '1px solid rgba(75,219,227,0.3)' : 'none',
              borderRadius: '12px', fontSize: '15px', fontWeight: 600,
              cursor: !amount || saving ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
              opacity: !amount ? 0.5 : 1
            }}>
              {saved ? '✓ Saved!' : saving ? 'Saving...' : `Log £${amount || '0'}`}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
