import { useState } from 'react'
import { useBudget } from './BudgetContext'
import { useTrip } from './TripContext'
import CurrencyConverter from './CurrencyConverter'

const CATEGORIES = ['Accommodation', 'Food & drink', 'Transport', 'Activities', 'Shopping', 'Misc']
const CATEGORY_COLOURS = {
  'Accommodation': '#4bdbe3',
  'Food & drink':  '#c5e161',
  'Transport':     '#a78bfa',
  'Activities':    '#f4a535',
  'Shopping':      '#ff6b5b',
  'Misc':          '#5c5b57',
}

function getDays(stop) {
  if (!stop.arrival || !stop.departure) return 0
  const diff = (new Date(stop.departure) - new Date(stop.arrival)) / (1000 * 60 * 60 * 24)
  return Math.max(0, Math.round(diff))
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function Budget() {
  const { budget, addExpense, deleteExpense, updateTotalBudget, totalSpent, remaining } = useBudget()
  const { activeTrip: trip } = useTrip()
  const [form, setForm] = useState({
    description: '', amount: '', category: 'Food & drink', stop: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [filterStop, setFilterStop] = useState('All')
  const [filterCat, setFilterCat] = useState('All')
  const [budgetInput, setBudgetInput] = useState(budget.totalBudget.toString())
  const [editingBudget, setEditingBudget] = useState(false)

  if (!trip) return null

  function handleAdd() {
    if (!form.description || !form.amount) return
    addExpense(form)
    setForm({ description: '', amount: '', category: 'Food & drink', stop: form.stop, date: new Date().toISOString().split('T')[0] })
  }

  function handleBudgetSave() {
    const val = parseInt(budgetInput.replace(/[^0-9]/g, ''))
    if (val > 0) updateTotalBudget(val)
    setEditingBudget(false)
  }

  const today = new Date().toISOString().split('T')[0]
  const todayExpenses = budget.expenses.filter(e => e.date === today)
  const todayTotal = todayExpenses.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0)

  // Current stop daily budget
  const currentStop = trip.stops.find(s => {
    if (!s.arrival || !s.departure) return false
    const now = new Date()
    return new Date(s.arrival) <= now && new Date(s.departure) >= now
  })
  const dailyTarget = currentStop?.dailyBudget || 60
  const dailyPct = Math.min(100, (todayTotal / dailyTarget) * 100)

  const filtered = budget.expenses.filter(e => {
    const stopMatch = filterStop === 'All' || e.stop === filterStop
    const catMatch = filterCat === 'All' || e.category === filterCat
    return stopMatch && catMatch
  })

  const byCategory = CATEGORIES.map(cat => {
    const total = budget.expenses.filter(e => e.category === cat).reduce((acc, e) => acc + parseFloat(e.amount || 0), 0)
    return { cat, total }
  }).filter(c => c.total > 0)

  const pct = budget.totalBudget > 0 ? Math.min(100, (totalSpent / budget.totalBudget) * 100) : 0

  const stopBreakdown = trip.stops.map(stop => {
    const days = getDays(stop)
    const projected = days * stop.dailyBudget
    const spent = budget.expenses.filter(e => e.stop === stop.name).reduce((acc, e) => acc + parseFloat(e.amount || 0), 0)
    return { stop, days, projected, spent }
  })
  const totalProjected = stopBreakdown.reduce((acc, s) => acc + s.projected, 0)
  const unallocated = budget.totalBudget - totalProjected

  return (
    <div>
      <h1 className="text-3xl font-serif mb-1" style={{ color: '#ffffff' }}>Budget tracker</h1>
      <p className="text-sm mb-6" style={{ color: '#9a9890' }}>Track every penny across your trip</p>

      {/* TODAY'S SPENDING */}
      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '4px' }}>Today's spending</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '28px', fontWeight: 600, color: dailyPct > 90 ? '#ff6b5b' : dailyPct > 70 ? '#f4a535' : '#ffffff' }}>
                £{todayTotal.toFixed(2)}
              </span>
              <span style={{ fontSize: '13px', color: '#9a9890' }}>of £{dailyTarget} daily target</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#9a9890' }}>
              {currentStop ? `📍 ${currentStop.name.split(',')[0]}` : 'No active stop'}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 500, color: dailyPct > 100 ? '#ff6b5b' : '#9a9890', marginTop: '2px' }}>
              {Math.round(dailyPct)}%
            </div>
          </div>
        </div>
        <div style={{ background: '#1e1e1c', borderRadius: '4px', height: '8px', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ height: '100%', borderRadius: '4px', width: dailyPct + '%', background: dailyPct > 90 ? '#ff6b5b' : dailyPct > 70 ? '#f4a535' : '#c5e161', transition: 'width 0.3s' }} />
        </div>
        {todayExpenses.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#5c5b57' }}>Nothing logged today yet</p>
        ) : (
          <div>
            {todayExpenses.slice().reverse().map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '7px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CATEGORY_COLOURS[e.category] || '#5c5b57', flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: '13px', color: '#ffffff' }}>{e.description}</div>
                <div style={{ fontSize: '12px', color: '#9a9890' }}>{e.category}</div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>£{parseFloat(e.amount).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOTAL BUDGET SETUP */}
      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57' }}>Total trip budget</div>
          {!editingBudget && (
            <button onClick={() => { setEditingBudget(true); setBudgetInput(budget.totalBudget.toString()) }}
              style={{ fontSize: '12px', color: '#c5e161', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Edit
            </button>
          )}
        </div>

        {editingBudget ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, background: '#161614', border: '1px solid rgba(197,225,97,0.3)', borderRadius: '8px', padding: '10px 14px' }}>
              <span style={{ fontSize: '18px', color: '#9a9890', marginRight: '6px' }}>£</span>
              <input
                type="number"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleBudgetSave()}
                autoFocus
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '20px', fontWeight: 600, color: '#ffffff', width: '100%', fontFamily: 'DM Sans, sans-serif' }}
              />
            </div>
            <button onClick={handleBudgetSave} style={{ padding: '10px 20px', background: '#c5e161', color: '#000000', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Save</button>
            <button onClick={() => setEditingBudget(false)} style={{ padding: '10px 14px', background: '#161614', color: '#9a9890', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '14px' }}>
            <span style={{ fontSize: '32px', fontWeight: 600, color: '#c5e161' }}>£{budget.totalBudget.toLocaleString()}</span>
            <span style={{ fontSize: '13px', color: '#9a9890' }}>total budget</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <div style={{ background: '#161614', borderRadius: '10px', padding: '12px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#5c5b57', marginBottom: '4px' }}>Spent</div>
            <div style={{ fontSize: '18px', fontWeight: 500, color: '#ffffff' }}>£{totalSpent.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div style={{ fontSize: '11px', color: '#9a9890', marginTop: '2px' }}>{Math.round(pct)}% used</div>
          </div>
          <div style={{ background: '#161614', borderRadius: '10px', padding: '12px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#5c5b57', marginBottom: '4px' }}>Remaining</div>
            <div style={{ fontSize: '18px', fontWeight: 500, color: remaining < 0 ? '#ff6b5b' : '#ffffff' }}>£{Math.abs(remaining).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div style={{ fontSize: '11px', color: remaining < 0 ? '#ff6b5b' : '#9a9890', marginTop: '2px' }}>{remaining < 0 ? 'over budget' : 'left to spend'}</div>
          </div>
          <div style={{ background: '#161614', borderRadius: '10px', padding: '12px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#5c5b57', marginBottom: '4px' }}>Projected</div>
            <div style={{ fontSize: '18px', fontWeight: 500, color: totalProjected > budget.totalBudget ? '#ff6b5b' : '#ffffff' }}>£{totalProjected.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: unallocated >= 0 ? '#9a9890' : '#ff6b5b', marginTop: '2px' }}>
              {unallocated >= 0 ? `£${unallocated.toLocaleString()} buffer` : `£${Math.abs(unallocated).toLocaleString()} over plan`}
            </div>
          </div>
        </div>

        <div style={{ background: '#1e1e1c', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: '4px', width: pct + '%', background: pct > 90 ? '#ff6b5b' : pct > 70 ? '#f4a535' : '#c5e161', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* PER STOP BREAKDOWN */}
      {stopBreakdown.length > 0 && (
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '14px' }}>Budget by stop</div>
          {stopBreakdown.map(({ stop, days, projected, spent }) => {
            const spentPct = projected > 0 ? Math.min(100, (spent / projected) * 100) : 0
            return (
              <div key={stop.id} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>{stop.name.split(',')[0]}</span>
                    <span style={{ fontSize: '11px', color: '#9a9890', marginLeft: '8px' }}>{days} nights · £{stop.dailyBudget}/day</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: spent > projected ? '#ff6b5b' : '#ffffff' }}>£{spent.toFixed(0)}</span>
                    <span style={{ fontSize: '11px', color: '#9a9890' }}> / £{projected}</span>
                  </div>
                </div>
                <div style={{ background: '#1e1e1c', borderRadius: '3px', height: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '3px', width: spentPct + '%', background: spentPct > 90 ? '#ff6b5b' : spentPct > 70 ? '#f4a535' : '#4bdbe3', transition: 'width 0.3s' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* LOG EXPENSE */}
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '16px' }}>Log expense</div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '6px' }}>Description</div>
            <input type="text" placeholder="e.g. Hostel, street food..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', background: '#161614', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '6px' }}>Amount (£)</div>
              <input type="number" placeholder="0.00"
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', background: '#161614', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '6px' }}>Date</div>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', background: '#161614', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '6px' }}>Category</div>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', background: '#161614', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {trip.stops.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '6px' }}>Stop</div>
              <select value={form.stop} onChange={e => setForm({ ...form, stop: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', background: '#161614', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ffffff', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif' }}
              >
                <option value="">No stop selected</option>
                {trip.stops.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          )}

          <button onClick={handleAdd} style={{ width: '100%', padding: '10px', background: '#c5e161', color: '#000000', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
            Log expense
          </button>
        </div>

        {/* CATEGORY BREAKDOWN */}
        <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', marginBottom: '16px' }}>Spend by category</div>
          {byCategory.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#9a9890' }}>No expenses logged yet</p>
          ) : (
            byCategory.map(({ cat, total }) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ minWidth: '110px', fontSize: '13px', color: '#9a9890' }}>{cat}</div>
                <div style={{ flex: 1, background: '#1e1e1c', borderRadius: '3px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '3px', width: Math.min(100, (total / totalSpent) * 100) + '%', background: CATEGORY_COLOURS[cat] }} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff', minWidth: '60px', textAlign: 'right' }}>£{total.toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* EXPENSE LIST */}
      <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57' }}>All expenses</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={filterStop} onChange={e => setFilterStop(e.target.value)}
              style={{ padding: '5px 10px', background: '#161614', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#9a9890', fontSize: '12px', outline: 'none' }}
            >
              <option value="All">All stops</option>
              {trip.stops.map(s => <option key={s.id} value={s.name}>{s.name.split(',')[0]}</option>)}
            </select>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              style={{ padding: '5px 10px', background: '#161614', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#9a9890', fontSize: '12px', outline: 'none' }}
            >
              <option value="All">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#9a9890' }}>No expenses found</p>
        ) : (
          filtered.map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CATEGORY_COLOURS[e.category] || '#5c5b57', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff' }}>{e.description}</div>
                <div style={{ fontSize: '11px', color: '#9a9890', marginTop: '2px' }}>
                  {e.category}{e.stop ? ` · ${e.stop.split(',')[0]}` : ''} · {e.date}
                </div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff' }}>£{parseFloat(e.amount).toFixed(2)}</div>
              <button onClick={() => deleteExpense(e.id)}
                style={{ fontSize: '12px', color: '#5c5b57', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                onMouseEnter={e => e.target.style.color = '#ff6b5b'}
                onMouseLeave={e => e.target.style.color = '#5c5b57'}
              >Remove</button>
            </div>
          ))
        )}
      </div>

      <CurrencyConverter />
    </div>
  )
}
