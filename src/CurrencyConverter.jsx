import { useState, useEffect } from 'react'

const CURRENCIES = [
  { code: 'THB', name: 'Thai Baht',           flag: '🇹🇭' },
  { code: 'VND', name: 'Vietnamese Dong',     flag: '🇻🇳' },
  { code: 'IDR', name: 'Indonesian Rupiah',   flag: '🇮🇩' },
  { code: 'CNY', name: 'Chinese Yuan',        flag: '🇨🇳' },
  { code: 'ILS', name: 'Israeli Shekel',      flag: '🇮🇱' },
  { code: 'SGD', name: 'Singapore Dollar',    flag: '🇸🇬' },
  { code: 'MYR', name: 'Malaysian Ringgit',   flag: '🇲🇾' },
  { code: 'KHR', name: 'Cambodian Riel',      flag: '🇰🇭' },
  { code: 'USD', name: 'US Dollar',           flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro',                flag: '🇪🇺' },
  { code: 'AUD', name: 'Australian Dollar',   flag: '🇦🇺' },
  { code: 'JPY', name: 'Japanese Yen',        flag: '🇯🇵' },
  { code: 'INR', name: 'Indian Rupee',        flag: '🇮🇳' },
  { code: 'LAK', name: 'Lao Kip',            flag: '🇱🇦' },
  { code: 'MMK', name: 'Myanmar Kyat',        flag: '🇲🇲' },
  { code: 'PHP', name: 'Philippine Peso',     flag: '🇵🇭' },
]

export default function CurrencyConverter() {
  const [amount, setAmount]     = useState(50)
  const [rates, setRates]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [updated, setUpdated]   = useState(null)
  const [selected, setSelected] = useState(['THB', 'VND', 'ILS', 'IDR'])
  const [adding, setAdding]     = useState(false)
  const [toAdd, setToAdd]       = useState('')

  useEffect(() => {
    const cached = localStorage.getItem('wandr-fx')
    if (cached) {
      const parsed = JSON.parse(cached)
      const age = Date.now() - parsed.timestamp
      if (age < 1000 * 60 * 60) {
        setRates(parsed.rates)
        setUpdated(new Date(parsed.timestamp).toLocaleTimeString())
        setLoading(false)
        return
      }
    }
    fetch('https://api.exchangerate-api.com/v4/latest/GBP')
      .then(r => r.json())
      .then(data => {
        setRates(data.rates)
        setUpdated(new Date().toLocaleTimeString())
        localStorage.setItem('wandr-fx', JSON.stringify({ rates: data.rates, timestamp: Date.now() }))
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load rates')
        setLoading(false)
      })
  }, [])

  function removeCurrency(code) { setSelected(prev => prev.filter(c => c !== code)) }
  function addCurrency() {
    if (!toAdd || selected.includes(toAdd)) return
    setSelected(prev => [...prev, toAdd])
    setToAdd('')
    setAdding(false)
  }
  function format(code, value) {
    if (value >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 })
    return value.toFixed(2)
  }

  const available = CURRENCIES.filter(c => !selected.includes(c.code))

  return (
    <div className="rounded-xl p-5" style={{background:'#0d0d0d',border:'1px solid rgba(255,255,255,0.08)'}}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs uppercase tracking-widest" style={{color:'#5c5b57'}}>Currency converter</div>
        {updated && <div className="text-xs" style={{color:'#5c5b57'}}>Live rates - {updated}</div>}
      </div>

      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-widest mb-2" style={{color:'#5c5b57'}}>Amount in GBP - £{amount}</div>
        <input type="range" min="1" max="500" step="1"
          value={amount}
          onChange={e => setAmount(parseInt(e.target.value))}
          className="w-full"
          style={{accentColor:'#c5e161'}}
        />
        <div className="flex justify-between text-xs mt-1" style={{color:'#5c5b57'}}>
          <span>£1</span><span>£500</span>
        </div>
      </div>

      {loading && <p className="text-sm" style={{color:'#5c5b57'}}>Loading live rates...</p>}
      {error && <p className="text-sm" style={{color:'#ff6b5b'}}>{error}</p>}

      {rates && (
        <>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {selected.map(code => {
              const currency = CURRENCIES.find(c => c.code === code)
              if (!currency) return null
              return (
                <div key={code} className="rounded-lg p-3 flex items-center gap-3 group" style={{background:'#161614'}}>
                  <span style={{fontSize:'20px'}}>{currency.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs" style={{color:'#5c5b57'}}>{currency.name}</div>
                    <div className="text-sm font-medium truncate" style={{color:'#ffffff'}}>
                      {format(code, amount * rates[code])} {code}
                    </div>
                  </div>
                  <button onClick={() => removeCurrency(code)}
                    className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{color:'#ff6b5b'}}
                  >x</button>
                </div>
              )
            })}
          </div>

          {adding ? (
            <div className="flex gap-2">
              <select value={toAdd} onChange={e => setToAdd(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                style={{background:'#161614',border:'1px solid rgba(255,255,255,0.1)',color:'#ffffff'}}
              >
                <option value="">Select a currency...</option>
                {available.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>)}
              </select>
              <button onClick={addCurrency}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{background:'#c5e161',color:'#000000'}}
              >Add</button>
              <button onClick={() => setAdding(false)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{background:'#161614',color:'#9a9890'}}
              >Cancel</button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              className="w-full py-2 rounded-lg text-xs transition-all"
              style={{background:'#161614',border:'1px dashed rgba(255,255,255,0.1)',color:'#5c5b57'}}
            >
              + Add currency
            </button>
          )}
        </>
      )}
    </div>
  )
}
