import { useState } from 'react'
import { useBudget } from './BudgetContext'
import { useTrip } from './TripContext'

const CATEGORIES = ['Accommodation', 'Food & drink', 'Transport', 'Activities', 'Shopping', 'Misc']
const CATEGORY_COLOURS = {
  'Accommodation': '#4ecdc4',
  'Food & drink':  '#c8f060',
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
      <h1 className="text-3xl font-serif mb-1">Budget tracker</h1>
      <p className="text-sm text-[#9a9890] mb-8">Log expenses and track your spend</p>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#161714] border border-white/8 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-1">Total budget</div>
          <div className="text-2xl font-medium text-[#c8f060]">£{budget.totalBudget.toLocaleString()}</div>
          <input
            type="range" min="1000" max="20000" step="500"
            value={budget.totalBudget}
            onChange={e => updateTotalBudget(parseInt(e.target.value))}
            className="w-full accent-[#c8f060] mt-2"
          />
        </div>
        <div className="bg-[#161714] border border-white/8 rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-1">Spent so far</div>
          <div className="text-2xl font-medium text-[#f0ede6]">£{totalSpent.toFixed(2)}</div>
          <div className="text-xs text-[#5c5b57] mt-1">{Math.round(pct)}% of budget</div>
        </div>
        <div className={`bg-[#161714] border rounded-xl p-4 ${remaining < 0 ? 'border-[#ff6b5b]/30' : 'border-white/8'}`}>
          <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-1">Remaining</div>
          <div className={`text-2xl font-medium ${remaining < 0 ? 'text-[#ff6b5b]' : 'text-[#f0ede6]'}`}>
            £{remaining.toFixed(2)}
          </div>
          <div className="text-xs text-[#5c5b57] mt-1">{remaining < 0 ? 'over budget' : 'left to spend'}</div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="bg-[#161714] border border-white/8 rounded-xl p-4 mb-6">
        <div className="flex justify-between text-xs text-[#5c5b57] mb-2">
          <span>Budget used</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="w-full bg-[#272824] rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: pct > 90 ? '#ff6b5b' : pct > 70 ? '#f4a535' : '#c8f060'
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">

        {/* ADD EXPENSE */}
        <div className="bg-[#161714] border border-white/8 rounded-xl p-5">
          <div className="text-xs uppercase tracking-widest text-[#5c5b57] mb-4">Log expense</div>

          <div className="mb-3">
            <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-1">Description</div>
            <input
              type="text"
              placeholder="e.g. Hostel, street food..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 bg-[#1e1f1c] border border-white/10 rounded-lg text-sm text-[#f0ede6] placeholder-[#5c5b57] outline-none focus:border-[#c8f060]/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-1">Amount (£)</div>
              <input
                type="number"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 bg-[#1e1f1c] border border-white/10 rounded-lg text-sm text-[#f0ede6] placeholder-[#5c5b57] outline-none focus:border-[#c8f060]/50"
              />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-1">Date</div>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 bg-[#1e1f1c] border border-white/10 rounded-lg text-sm text-[#f0ede6] outline-none focus:border-[#c8f060]/50"
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-1">Category</div>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 bg-[#1e1f1c] border border-white/10 rounded-lg text-sm text-[#f0ede6] outline-none focus:border-[#c8f060]/50"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {trip.stops.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-widest text-[#5c5b57] mb-1">Stop</div>
              <select
                value={form.stop}
                onChange={e => setForm({ ...form, stop: e.target.value })}
                className="w-full px-3 py-2 bg-[#1e1f1c] border border-white/10 rounded-lg text-sm text-[#f0ede6] outline-none focus:border-[#c8f060]/50"
              >
                <option value="">No stop selected</option>
                {trip.stops.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          )}

          <button
            onClick={handleAdd}
            className="w-full py-2.5 bg-[#c8f060] text-[#0e0f0e] rounded-lg text-sm font-medium hover:bg-[#a8d040] transition-colors"
          >
            Log expense
          </button>
        </div>

        {/* CATEGORY BREAKDOWN */}
        <div className="bg-[#161714] border border-white/8 rounded-xl p-5">
          <div className="text-xs uppercase tracking-widest text-[#5c5b57] mb-4">Spend by category</div>
          {byCategory.length === 0 ? (
            <p className="text-sm text-[#5c5b57]">No expenses logged yet</p>
          ) : (
            byCategory.map(({ cat, total }) => (
              <div key={cat} className="flex items-center gap-3 mb-3">
                <div className="min-w-[110px] text-sm text-[#9a9890]">{cat}</div>
                <div className="flex-1 bg-[#272824] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${Math.min(100, (total / totalSpent) * 100)}%`,
                      background: CATEGORY_COLOURS[cat]
                    }}
                  />
                </div>
                <div className="text-sm font-medium text-[#f0ede6] min-w-[60px] text-right">£{total.toFixed(2)}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* EXPENSE LIST */}
      <div className="bg-[#161714] border border-white/8 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs uppercase tracking-widest text-[#5c5b57]">Expenses</div>
          <div className="flex gap-2">
            <select
              value={filterStop}
              onChange={e => setFilterStop(e.target.value)}
              className="px-2 py-1 bg-[#1e1f1c] border border-white/10 rounded-lg text-xs text-[#9a9890] outline-none"
            >
              <option value="All">All stops</option>
              {trip.stops.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="px-2 py-1 bg-[#1e1f1c] border border-white/10 rounded-lg text-xs text-[#9a9890] outline-none"
            >
              <option value="All">All categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-[#5c5b57]">No expenses found</p>
        ) : (
          filtered.slice().reverse().map(e => (
            <div key={e.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: CATEGORY_COLOURS[e.category] || '#5c5b57' }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-[#f0ede6]">{e.description}</div>
                <div className="text-xs text-[#5c5b57] mt-0.5">{e.category}{e.stop ? ` · ${e.stop}` : ''} · {e.date}</div>
              </div>
              <div className="text-sm font-medium text-[#f0ede6]">£{parseFloat(e.amount).toFixed(2)}</div>
              <button
                onClick={() => deleteExpense(e.id)}
                className="text-xs text-[#5c5b57] hover:text-[#ff6b5b] transition-colors px-2"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}