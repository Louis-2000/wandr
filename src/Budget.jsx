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

export default function Budget() {
  const { budget, addExpense, deleteExpense, updateTotalBudget, totalSpent, remaining } = useBudget()
  const { trip } = useTrip()
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Food & drink',
    stop: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [filterStop, setFilterStop] = useState('All')
  const [filterCat, setFilterCat] = useState('All')

  function handleAdd() {
    if (!form.description || !form.amount) return
    addExpense(form)
    setForm({
      description: '',
      amount: '',
      category: 'Food & drink',
      stop: form.stop,
      date: new Date().toISOString().split('T')[0],
    })
  }

  const filtered = budget.expenses.filter(e => {
    const stopMatch = filterStop === 'All' || e.stop === filterStop
    const catMatch  = filterCat  === 'All' || e.category === filterCat
    return stopMatch && catMatch
  })

  const byCategory = CATEGORIES.map(cat => {
    const total = budget.expenses
      .filter(e => e.category === cat)
      .reduce((acc, e) => acc + parseFloat(e.amount || 0), 0)
    return { cat, total }
  }).filter(c => c.total > 0)

  const pct = budget.totalBudget > 0 ? Math.min(100, (totalSpent / budget.totalBudget) * 100) : 0

  return (
    <div>
      <h1 className="text-3xl font-serif mb-1" style={{color:'#ffffff'}}>Budget tracker</h1>
      <p className="text-sm mb-8" style={{color:'#9a9890'}}>Log expenses and track your spend</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl p-4" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="text-[10px] uppercase tracking-widest mb-1" style={{color:'#5c5b57'}}>Total budget</div>
          <div className="text-2xl font-medium" style={{color:'#c5e161'}}>£{budget.totalBudget.toLocaleString()}</div>
          <input
            type="range" min="1000" max="20000" step="500"
            value={budget.totalBudget}
            onChange={e => updateTotalBudget(parseInt(e.target.value))}
            className="w-full mt-2"
            style={{accentColor:'#c5e161'}}
          />
        </div>
        <div className="rounded-xl p-4" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="text-[10px] uppercase tracking-widest mb-1" style={{color:'#5c5b57'}}>Spent so far</div>
          <div className="text-2xl font-medium" style={{color:'#ffffff'}}>£{totalSpent.toFixed(2)}</div>
          <div className="text-xs mt-1" style={{color:'#5c5b57'}}>{Math.round(pct)}% of budget</div>
        </div>
        <div className="rounded-xl p-4" style={{background:'#0d0d0d',border:`1px solid ${remaining < 0 ? 'rgba(255,107,91,0.3)' : 'rgba(255,255,255,0.08)'}`}}>
          <div className="text-[10px] uppercase tracking-widest mb-1" style={{color:'#5c5b57'}}>Remaining</div>
          <div className="text-2xl font-medium" style={{color: remaining < 0 ? '#ff6b5b' : '#ffffff'}}>£{remaining.toFixed(2)}</div>
          <div className="text-xs mt-1" style={{color:'#5c5b57'}}>{remaining < 0 ? 'over budget' : 'left to spend'}</div>
        </div>
      </div>

      <div className="rounded-xl p-4 mb-6" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
        <div className="flex justify-between text-xs mb-2" style={{color:'#5c5b57'}}>
          <span>Budget used</span><span>{Math.round(pct)}%</span>
        </div>
        <div className="w-full rounded-full h-2" style={{background:'#1e1e1c'}}>
          <div className="h-2 rounded-full transition-all" style={{
            width:`${pct}%`,
            background: pct > 90 ? '#ff6b5b' : pct > 70 ? '#f4a535' : '#c5e161'
          }}/>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="rounded-xl p-5" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="text-xs uppercase tracking-widest mb-4" style={{color:'#5c5b57'}}>Log expense</div>

          <div className="mb-3">
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{color:'#5c5b57'}}>Description</div>
            <input type="text" placeholder="e.g. Hostel, street food..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#ffffff'}}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest mb-1" style={{color:'#5c5b57'}}>Amount (£)</div>
              <input type="number" placeholder="0.00"
                value={form.amount}
                onChange={e => setForm({...form, amount: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#ffffff'}}
              />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest mb-1" style={{color:'#5c5b57'}}>Date</div>
              <input type="date"
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#ffffff'}}
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="text-[10px] uppercase tracking-widest mb-1" style={{color:'#5c5b57'}}>Category</div>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#ffffff'}}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {trip.stops.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-widest mb-1" style={{color:'#5c5b57'}}>Stop</div>
              <select value={form.stop} onChange={e => setForm({...form, stop: e.target.value})}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#ffffff'}}
              >
                <option value="">No stop selected</option>
                {trip.stops.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          )}

          <button onClick={handleAdd}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{background:'#c5e161',color:'#000000'}}
          >
            Log expense
          </button>
        </div>

        <div className="rounded-xl p-5" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="text-xs uppercase tracking-widest mb-4" style={{color:'#5c5b57'}}>Spend by category</div>
          {byCategory.length === 0 ? (
            <p className="text-sm" style={{color:'#5c5b57'}}>No expenses logged yet</p>
          ) : (
            byCategory.map(({cat, total}) => (
              <div key={cat} className="flex items-center gap-3 mb-3">
                <div className="min-w-[110px] text-sm" style={{color:'#9a9890'}}>{cat}</div>
                <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{background:'#1e1e1c'}}>
                  <div className="h-1.5 rounded-full" style={{
                    width:`${Math.min(100,(total/totalSpent)*100)}%`,
                    background: CATEGORY_COLOURS[cat]
                  }}/>
                </div>
                <div className="text-sm font-medium min-w-[60px] text-right" style={{color:'#ffffff'}}>£{total.toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-xl p-5 mb-6" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs uppercase tracking-widest" style={{color:'#5c5b57'}}>Expenses</div>
          <div className="flex gap-2">
            <select value={filterStop} onChange={e => setFilterStop(e.target.value)}
              className="px-2 py-1 rounded-lg text-xs outline-none"
              style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#9a9890'}}
            >
              <option value="All">All stops</option>
              {trip.stops.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
              className="px-2 py-1 rounded-lg text-xs outline-none"
              style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#9a9890'}}
            >
              <option value="All">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm" style={{color:'#5c5b57'}}>No expenses found</p>
        ) : (
          filtered.slice().reverse().map(e => (
            <div key={e.id} className="flex items-center gap-4 py-3" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background: CATEGORY_COLOURS[e.category] || '#5c5b57'}}/>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{color:'#ffffff'}}>{e.description}</div>
                <div className="text-xs mt-0.5" style={{color:'#5c5b57'}}>{e.category}{e.stop ? ` - ${e.stop}` : ''} - {e.date}</div>
              </div>
              <div className="text-sm font-medium" style={{color:'#ffffff'}}>£{parseFloat(e.amount).toFixed(2)}</div>
              <button onClick={() => deleteExpense(e.id)}
                className="text-xs px-2 transition-colors"
                style={{color:'#5c5b57'}}
                onMouseEnter={e => e.target.style.color='#ff6b5b'}
                onMouseLeave={e => e.target.style.color='#5c5b57'}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      <CurrencyConverter />
    </div>
  )
}
