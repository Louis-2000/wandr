import { useState } from 'react'
import { useTrip } from './TripContext'
import { useBudget } from './BudgetContext'
import { supabase } from './supabase'

const STOP_COLOURS = ['#c5e161', '#4bdbe3', '#f4a535', '#a78bfa', '#ff6b5b', '#4ecdc4']

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

function getCurrentStop(stops) {
  const today = new Date()
  return stops.find(s => s.arrival && s.departure && new Date(s.arrival) <= today && new Date(s.departure) >= today)
}

function getNextStop(stops) {
  const today = new Date()
  return stops.find(s => s.arrival && new Date(s.arrival) > today)
}

const s = {
  app: { minHeight:'100vh', background:'#080808', color:'#fff', fontFamily:'DM Sans, sans-serif', paddingBottom:'80px' },
  statusBar: { display:'flex', justifyContent:'space-between', padding:'12px 20px 0', fontSize:'12px', color:'rgba(255,255,255,0.3)' },
  hero: { padding:'20px 20px 12px' },
  heroGreeting: { fontSize:'11px', color:'rgba(255,255,255,0.35)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'4px' },
  heroTitle: { fontSize:'32px', fontWeight:700, color:'#fff', letterSpacing:'-1px', lineHeight:1.1 },
  heroSub: { fontSize:'13px', color:'rgba(255,255,255,0.4)', marginTop:'5px' },
  card: { background:'#141414', borderRadius:'20px', margin:'0 16px 10px', padding:'16px' },
  cardLabel: { fontSize:'10px', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'8px' },
  cardValue: { fontSize:'30px', fontWeight:700, color:'#fff', letterSpacing:'-1px' },
  cardAccent: { fontSize:'30px', fontWeight:700, color:'#c5e161', letterSpacing:'-1px' },
  cardSub: { fontSize:'12px', color:'rgba(255,255,255,0.3)', marginTop:'3px' },
  cardRow: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  pill: (color, bg) => ({ display:'inline-flex', alignItems:'center', padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:500, color, background:bg }),
  progressBar: { height:'4px', background:'rgba(255,255,255,0.07)', borderRadius:'2px', marginTop:'12px', overflow:'hidden' },
  progressFill: (w, color) => ({ height:'100%', borderRadius:'2px', width:w+'%', background:color, transition:'width 0.3s' }),
  sectionHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 20px 8px' },
  sectionTitle: { fontSize:'14px', fontWeight:600, color:'#fff' },
  sectionLink: { fontSize:'12px', color:'#c5e161' },
  stopRow: { display:'flex', alignItems:'center', gap:'12px', padding:'11px 20px', borderBottom:'0.5px solid rgba(255,255,255,0.05)' },
  stopDot: (color) => ({ width:'9px', height:'9px', borderRadius:'50%', background:color, flexShrink:0 }),
  stopName: { fontSize:'13px', fontWeight:500, color:'#fff' },
  stopMeta: { fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'2px' },
  stopRight: { fontSize:'12px', color:'rgba(255,255,255,0.35)', marginLeft:'auto' },
  expRow: { display:'flex', alignItems:'center', gap:'12px', padding:'11px 20px', borderBottom:'0.5px solid rgba(255,255,255,0.05)' },
  expIcon: (bg) => ({ width:'34px', height:'34px', borderRadius:'10px', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }),
  expName: { fontSize:'13px', fontWeight:500, color:'#fff' },
  expMeta: { fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'2px' },
  expAmt: { fontSize:'14px', fontWeight:700, color:'#fff', marginLeft:'auto', flexShrink:0 },
  transportCard: { background:'#141414', borderRadius:'16px', margin:'0 16px 8px', padding:'14px', display:'flex', alignItems:'center', gap:'12px' },
  transportMode: (bg) => ({ width:'38px', height:'38px', borderRadius:'11px', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }),
  transportInfo: { flex:1 },
  transportRoute: { fontSize:'13px', fontWeight:500, color:'#fff' },
  transportMeta: { fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'2px' },
  transportPrice: { fontSize:'16px', fontWeight:700, color:'#c5e161' },
  addBtn: { margin:'12px 16px 0', background:'#c5e161', borderRadius:'14px', padding:'15px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', fontWeight:700, color:'#000', border:'none', cursor:'pointer', width:'calc(100% - 32px)', fontFamily:'DM Sans, sans-serif' },
  input: { width:'100%', padding:'12px 14px', background:'#1a1a1a', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'#fff', fontSize:'14px', outline:'none', fontFamily:'DM Sans, sans-serif', boxSizing:'border-box' },
  inputLabel: { fontSize:'11px', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'6px' },
  searchBar: { margin:'4px 16px 12px', background:'#141414', borderRadius:'14px', padding:'13px 16px', display:'flex', alignItems:'center', gap:'10px' },
  placeCard: { margin:'0 16px 10px', background:'#141414', borderRadius:'18px', overflow:'hidden' },
  placeImg: { height:'90px', background:'#1a1a1a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px' },
  placeBody: { padding:'12px 14px' },
  placeName: { fontSize:'14px', fontWeight:600, color:'#fff', marginBottom:'3px' },
  placeMeta: { fontSize:'11px', color:'rgba(255,255,255,0.35)' },
  bottomNav: { position:'fixed', bottom:0, left:0, right:0, background:'#0d0d0d', borderTop:'0.5px solid rgba(255,255,255,0.08)', display:'flex', padding:'8px 0 20px', zIndex:50 },
  navTab: (active) => ({ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', padding:'6px 4px', borderRadius:'10px', cursor:'pointer', background: active ? 'rgba(197,225,97,0.08)' : 'none', border:'none', fontFamily:'DM Sans, sans-serif' }),
  navIcon: { fontSize:'20px' },
  navLabel: (active) => ({ fontSize:'9px', fontWeight:500, color: active ? '#c5e161' : 'rgba(255,255,255,0.25)', letterSpacing:'0.04em' }),
  ringWrap: { position:'relative', width:'130px', height:'130px', margin:'0 auto 12px' },
  ringCenter: { position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' },
  ringAmount: { fontSize:'22px', fontWeight:700, color:'#fff' },
  ringLabel: { fontSize:'10px', color:'rgba(255,255,255,0.35)', marginTop:'2px' },
  divider: { height:'0.5px', background:'rgba(255,255,255,0.06)', margin:'4px 0' },
  catPill: (active) => ({ padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:500, border:'none', cursor:'pointer', fontFamily:'DM Sans, sans-serif', background: active ? 'rgba(197,225,97,0.15)' : 'rgba(255,255,255,0.06)', color: active ? '#c5e161' : 'rgba(255,255,255,0.4)' }),
  tabSwitcher: { display:'flex', background:'#141414', borderRadius:'12px', padding:'3px', margin:'10px 16px 14px' },
  tabOption: (active) => ({ flex:1, padding:'8px', textAlign:'center', borderRadius:'9px', fontSize:'12px', fontWeight:500, border:'none', cursor:'pointer', fontFamily:'DM Sans, sans-serif', background: active ? '#1e1e1e' : 'none', color: active ? '#fff' : 'rgba(255,255,255,0.3)' }),
}

const CATEGORY_ICONS = { 'Accommodation':'🏨', 'Food & drink':'🍜', 'Transport':'🚌', 'Activities':'🎭', 'Shopping':'🛍️', 'Misc':'📦' }
const CATEGORY_COLOURS_BG = { 'Accommodation':'rgba(75,219,227,0.12)', 'Food & drink':'rgba(197,225,97,0.12)', 'Transport':'rgba(167,139,250,0.12)', 'Activities':'rgba(244,165,53,0.12)', 'Shopping':'rgba(255,107,91,0.12)', 'Misc':'rgba(255,255,255,0.06)' }

const TABS = [
  { id:'home', icon:'⌂', label:'Home' },
  { id:'trip', icon:'◎', label:'Trip' },
  { id:'budget', icon:'◑', label:'Budget' },
  { id:'discover', icon:'✦', label:'Discover' },
  { id:'transport', icon:'◌', label:'Transport' },
]

export default function MobileApp({ session }) {
  const [tab, setTab] = useState('home')
  const { activeTrip } = useTrip()
  const { totalSpent, remaining, budget } = useBudget()

  const stops = activeTrip?.stops || []
  const currentStop = getCurrentStop(stops)
  const nextStop = getNextStop(stops)
  const pct = budget.totalBudget > 0 ? Math.min(100, (totalSpent / budget.totalBudget) * 100) : 0
  const dailyTarget = currentStop?.dailyBudget || 60
  const today = new Date().toISOString().split('T')[0]
  const todayExpenses = budget.expenses.filter(e => e.date === today)
  const todayTotal = todayExpenses.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0)
  const dailyPct = Math.min(100, (todayTotal / dailyTarget) * 100)

  return (
    <div style={s.app}>
      <div style={s.statusBar}><span>9:41</span><span style={{letterSpacing:'2px'}}>●●●</span></div>

      {tab === 'home' && <HomeTab stops={stops} currentStop={currentStop} nextStop={nextStop} totalSpent={totalSpent} remaining={remaining} budget={budget} pct={pct} todayTotal={todayTotal} dailyTarget={dailyTarget} dailyPct={dailyPct} activeTrip={activeTrip} setTab={setTab} />}
      {tab === 'trip' && <TripTab stops={stops} activeTrip={activeTrip} />}
      {tab === 'budget' && <BudgetTab todayExpenses={todayExpenses} todayTotal={todayTotal} dailyTarget={dailyTarget} dailyPct={dailyPct} totalSpent={totalSpent} budget={budget} remaining={remaining} pct={pct} />}
      {tab === 'discover' && <DiscoverTab currentStop={currentStop} nextStop={nextStop} />}
      {tab === 'transport' && <TransportTab currentStop={currentStop} nextStop={nextStop} />}

      <div style={s.bottomNav}>
        {TABS.map(t => (
          <button key={t.id} style={s.navTab(tab === t.id)} onClick={() => setTab(t.id)}>
            <span style={s.navIcon}>{t.icon}</span>
            <span style={s.navLabel(tab === t.id)}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function HomeTab({ stops, currentStop, nextStop, totalSpent, remaining, budget, pct, todayTotal, dailyTarget, dailyPct, activeTrip, setTab }) {
  const upcomingStop = currentStop || nextStop
  const daysUntilNext = nextStop?.arrival ? Math.max(0, Math.round((new Date(nextStop.arrival) - new Date()) / (1000 * 60 * 60 * 24))) : null

  return (
    <div>
      <div style={s.hero}>
        <div style={s.heroGreeting}>GOOD MORNING</div>
        <div style={s.heroTitle}>{activeTrip?.name || 'Your trip'}</div>
        <div style={s.heroSub}>
          {currentStop ? `Day in ${currentStop.name.split(',')[0]}` : nextStop ? `${daysUntilNext} days until ${nextStop.name.split(',')[0]}` : 'Plan your adventure'}
        </div>
      </div>

      <div style={s.card} onClick={() => setTab('budget')}>
        <div style={s.cardLabel}>Today's spend</div>
        <div style={s.cardRow}>
          <div>
            <div style={{...s.cardAccent, fontSize:'28px', color: dailyPct > 90 ? '#ff5050' : '#c5e161'}}>£{todayTotal.toFixed(0)}</div>
            <div style={s.cardSub}>of £{dailyTarget} daily limit</div>
          </div>
          <span style={s.pill(dailyPct > 90 ? '#ff5050' : '#c5e161', dailyPct > 90 ? 'rgba(255,80,80,0.12)' : 'rgba(197,225,97,0.12)')}>
            {dailyPct > 90 ? 'Over limit' : dailyPct > 70 ? 'Getting close' : 'On track'}
          </span>
        </div>
        <div style={s.progressBar}><div style={s.progressFill(dailyPct, dailyPct > 90 ? '#ff5050' : '#c5e161')}></div></div>
      </div>

      <div style={s.card} onClick={() => setTab('budget')}>
        <div style={{
            ...s.cardRow,
            marginBottom: '10px',
            display: 'flex',
            justifyingContent: 'space-between'
        }}>
          <div><div style={s.cardLabel}>Trip budget</div><div style={{fontSize:'22px', fontWeight:700, color:'#fff', letterSpacing:'-0.5px'}}>£{totalSpent.toLocaleString()}</div><div style={s.cardSub}>of £{budget.totalBudget.toLocaleString()} spent</div></div>
          <div style={{textAlign:'right'}}><div style={s.cardLabel}>Remaining</div><div style={{fontSize:'22px', fontWeight:700, color: remaining < 0 ? '#ff5050' : '#fff', letterSpacing:'-0.5px'}}>£{Math.abs(remaining).toLocaleString()}</div><div style={s.cardSub}>{remaining < 0 ? 'over budget' : 'left'}</div></div>
        </div>
        <div style={s.progressBar}><div style={s.progressFill(pct, pct > 90 ? '#ff5050' : pct > 70 ? '#f4a535' : '#c5e161')}></div></div>
      </div>

      {stops.length > 0 && (
        <>
          <div style={s.sectionHeader}>
            <div style={s.sectionTitle}>Your route</div>
            <div style={s.sectionLink} onClick={() => setTab('trip')}>View all</div>
          </div>
          {stops.slice(0, 3).map((stop, i) => {
            const colour = STOP_COLOURS[i % STOP_COLOURS.length]
            const isCurrent = currentStop?.id === stop.id
            return (
              <div key={stop.id} style={s.stopRow}>
                <div style={s.stopDot(isCurrent ? colour : 'rgba(255,255,255,0.15)')}></div>
                <div style={{flex:1}}>
                  <div style={{...s.stopName, color: isCurrent ? colour : '#fff'}}>{stop.name.split(',')[0]}</div>
                  <div style={s.stopMeta}>{formatDate(stop.arrival)} · £{stop.dailyBudget}/day</div>
                </div>
                {isCurrent && <span style={s.pill('#c5e161', 'rgba(197,225,97,0.1)')}>Here</span>}
              </div>
            )
          })}
        </>
      )}

      {stops.length === 0 && (
        <div style={{...s.card, textAlign:'center', padding:'32px 16px'}} onClick={() => setTab('trip')}>
          <div style={{fontSize:'32px', marginBottom:'10px'}}>✈️</div>
          <div style={{fontSize:'15px', fontWeight:600, color:'#fff', marginBottom:'4px'}}>Start planning</div>
          <div style={{fontSize:'13px', color:'rgba(255,255,255,0.35)'}}>Add your first stop to get started</div>
        </div>
      )}
    </div>
  )
}

function TripTab({ stops, activeTrip }) {
  const { addStop, deleteStop } = useTrip()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', arrival:'', departure:'', dailyBudget:60 })

  const totalDays = stops.reduce((acc, s) => acc + getDays(s), 0)
  const totalProjected = stops.reduce((acc, s) => acc + getDays(s) * s.dailyBudget, 0)

  function handleAdd() {
    if (!form.name || !form.arrival || !form.departure) return
    addStop(form)
    setForm({ name:'', arrival:'', departure:'', dailyBudget:60 })
    setShowForm(false)
  }

  return (
    <div>
      <div style={s.hero}>
        <div style={s.heroGreeting}>YOUR ROUTE</div>
        <div style={s.heroTitle}>{stops.length} stop{stops.length !== 1 ? 's' : ''}</div>
        <div style={s.heroSub}>{totalDays} nights · £{totalProjected.toLocaleString()} projected</div>
      </div>

      {stops.length > 0 && currentStop && (
        <div style={{...s.card, background:'#c5e161', marginBottom:'12px'}}>
          <div style={{fontSize:'10px', fontWeight:600, color:'rgba(0,0,0,0.45)', letterSpacing:'0.07em', marginBottom:'4px'}}>NOW IN</div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{fontSize:'20px', fontWeight:700, color:'#000'}}>{getCurrentStop(stops)?.name?.split(',')[0] || stops[0]?.name?.split(',')[0]}</div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:'11px', color:'rgba(0,0,0,0.45)'}}>Until {formatDate(getCurrentStop(stops)?.departure)}</div>
              <div style={{fontSize:'14px', fontWeight:600, color:'#000'}}>£{getCurrentStop(stops)?.dailyBudget || stops[0]?.dailyBudget}/day</div>
            </div>
          </div>
        </div>
      )}

      {stops.map((stop, index) => {
        const colour = STOP_COLOURS[index % STOP_COLOURS.length]
        const days = getDays(stop)
        const isLast = index === stops.length - 1
        const isCurrent = getCurrentStop(stops)?.id === stop.id

        return (
          <div key={stop.id} style={{display:'flex', paddingLeft:'20px', paddingRight:'20px', marginBottom: isLast ? 0 : '0'}}>
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', width:'20px', flexShrink:0, marginRight:'12px'}}>
              <div style={{width: isCurrent ? '11px' : '9px', height: isCurrent ? '11px' : '9px', borderRadius:'50%', background: colour, flexShrink:0, boxShadow: isCurrent ? `0 0 0 3px ${colour}25` : 'none'}}></div>
              {!isLast && <div style={{width:'1px', flex:1, minHeight:'30px', background:colour+'20', margin:'4px 0'}}></div>}
            </div>
            <div style={{flex:1, paddingBottom: isLast ? '16px' : '16px', borderBottom: isLast ? 'none' : '0.5px solid rgba(255,255,255,0.05)'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <div>
                  <div style={{fontSize:'14px', fontWeight:600, color: isCurrent ? colour : '#fff'}}>{stop.name}</div>
                  <div style={{fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'2px'}}>{formatDate(stop.arrival)} → {formatDate(stop.departure)} · {days} nights</div>
                </div>
                <div style={{textAlign:'right', flexShrink:0, marginLeft:'12px'}}>
                  <div style={{fontSize:'14px', fontWeight:700, color:colour}}>£{(days * stop.dailyBudget).toLocaleString()}</div>
                  <div style={{fontSize:'11px', color:'rgba(255,255,255,0.35)'}}>£{stop.dailyBudget}/day</div>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {stops.length === 0 && (
        <div style={{...s.card, textAlign:'center', padding:'32px 16px'}}>
          <div style={{fontSize:'32px', marginBottom:'10px'}}>🗺️</div>
          <div style={{fontSize:'15px', fontWeight:600, color:'#fff', marginBottom:'4px'}}>No stops yet</div>
          <div style={{fontSize:'13px', color:'rgba(255,255,255,0.35)'}}>Add your first destination below</div>
        </div>
      )}

      {showForm ? (
        <div style={{...s.card, border:'0.5px solid rgba(197,225,97,0.2)'}}>
          <div style={{fontSize:'11px', color:'#c5e161', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'16px'}}>New stop</div>
          <div style={{marginBottom:'12px'}}>
            <div style={s.inputLabel}>Destination</div>
            <input type="text" placeholder="e.g. Bangkok" value={form.name} onChange={e => setForm({...form, name:e.target.value})} style={s.input} />
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px'}}>
            <div><div style={s.inputLabel}>Arrival</div><input type="date" value={form.arrival} onChange={e => setForm({...form, arrival:e.target.value})} style={s.input} /></div>
            <div><div style={s.inputLabel}>Departure</div><input type="date" value={form.departure} onChange={e => setForm({...form, departure:e.target.value})} style={s.input} /></div>
          </div>
          <div style={{marginBottom:'16px'}}>
            <div style={{...s.inputLabel, display:'flex', justifyContent:'space-between'}}>Daily budget <span style={{color:'#c5e161'}}>£{form.dailyBudget}/day</span></div>
            <input type="range" min="20" max="200" step="5" value={form.dailyBudget} onChange={e => setForm({...form, dailyBudget:parseInt(e.target.value)})} style={{width:'100%', accentColor:'#c5e161'}} />
            {form.arrival && form.departure && getDays(form) > 0 && (
              <div style={{fontSize:'12px', color:'rgba(255,255,255,0.4)', marginTop:'6px'}}>
                £{form.dailyBudget} x {getDays(form)} nights = <span style={{color:'#c5e161'}}>£{form.dailyBudget * getDays(form)}</span>
              </div>
            )}
          </div>
          <div style={{display:'flex', gap:'10px'}}>
            <button onClick={handleAdd} style={{flex:1, padding:'13px', background:'#c5e161', color:'#000', border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif'}}>Add stop</button>
            <button onClick={() => setShowForm(false)} style={{padding:'13px 18px', background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)', border:'none', borderRadius:'12px', fontSize:'14px', cursor:'pointer', fontFamily:'DM Sans, sans-serif'}}>Cancel</button>
          </div>
        </div>
      ) : (
        <button style={s.addBtn} onClick={() => setShowForm(true)}>+ Add stop</button>
      )}
    </div>
  )
}

function BudgetTab({ todayExpenses, todayTotal, dailyTarget, dailyPct, totalSpent, budget, remaining, pct }) {
  const { activeTrip } = useTrip()
  const { addExpense, updateTotalBudget } = useBudget()
  const [budgetTab, setBudgetTab] = useState('today')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ description:'', amount:'', category:'Food & drink', date: new Date().toISOString().split('T')[0] })

  const CATEGORIES = ['Accommodation', 'Food & drink', 'Transport', 'Activities', 'Shopping', 'Misc']
  const stops = activeTrip?.stops || []

  function handleAdd() {
    if (!form.amount) return
    addExpense({ ...form, description: form.description || form.category, stop:'' })
    setForm({ description:'', amount:'', category:'Food & drink', date: new Date().toISOString().split('T')[0] })
    setShowAdd(false)
  }

  const circumference = 2 * Math.PI * 45
  const offset = circumference - (dailyPct / 100) * circumference

  return (
    <div>
      <div style={s.hero}>
        <div style={s.heroGreeting}>BUDGET</div>
        <div style={s.heroTitle}>£{budget.totalBudget.toLocaleString()}</div>
        <div style={s.heroSub}>Total trip budget</div>
      </div>

      <div style={{display:'flex', gap:'8px', padding:'0 16px 14px'}}>
        {['today','trip','stops'].map(t => (
          <button key={t} style={s.tabOption(budgetTab===t)} onClick={() => setBudgetTab(t)}>
            {t === 'today' ? 'Today' : t === 'trip' ? 'Full trip' : 'By stop'}
          </button>
        ))}
      </div>

      {budgetTab === 'today' && (
        <>
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 20px 16px'}}>
            <div style={s.ringWrap}>
              <svg viewBox="0 0 100 100" width="130" height="130">
                <circle fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" cx="50" cy="50" r="45"/>
                <circle fill="none" stroke={dailyPct > 90 ? '#ff5050' : '#c5e161'} strokeWidth="10" strokeLinecap="round"
                  cx="50" cy="50" r="45"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{transform:'rotate(-90deg)', transformOrigin:'50% 50%', transition:'stroke-dashoffset 0.5s'}}
                />
              </svg>
              <div style={s.ringCenter}>
                <div style={s.ringAmount}>£{todayTotal.toFixed(0)}</div>
                <div style={s.ringLabel}>of £{dailyTarget}</div>
              </div>
            </div>
            <span style={s.pill(dailyPct > 90 ? '#ff5050' : '#c5e161', dailyPct > 90 ? 'rgba(255,80,80,0.1)' : 'rgba(197,225,97,0.1)')}>
              {dailyPct > 100 ? `£${(todayTotal - dailyTarget).toFixed(0)} over` : `£${(dailyTarget - todayTotal).toFixed(0)} remaining today`}
            </span>
          </div>

          <div style={s.sectionHeader}>
            <div style={s.sectionTitle}>Today's expenses</div>
            <div style={s.sectionLink} onClick={() => setShowAdd(true)}>+ Add</div>
          </div>

          {todayExpenses.length === 0 ? (
            <div style={{padding:'20px 20px', fontSize:'13px', color:'rgba(255,255,255,0.3)'}}>Nothing logged today yet</div>
          ) : (
            todayExpenses.slice().reverse().map(e => (
              <div key={e.id} style={s.expRow}>
                <div style={s.expIcon(CATEGORY_COLOURS_BG[e.category] || 'rgba(255,255,255,0.06)')}>{CATEGORY_ICONS[e.category] || '📦'}</div>
                <div>
                  <div style={s.expName}>{e.description}</div>
                  <div style={s.expMeta}>{e.category}</div>
                </div>
                <div style={s.expAmt}>£{parseFloat(e.amount).toFixed(2)}</div>
              </div>
            ))
          )}
        </>
      )}

      {budgetTab === 'trip' && (
        <>
          <div style={s.card}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px'}}>
              <div><div style={s.cardLabel}>Spent</div><div style={{fontSize:'20px', fontWeight:700, color:'#fff'}}>£{totalSpent.toFixed(0)}</div><div style={s.cardSub}>{Math.round(pct)}% used</div></div>
              <div><div style={s.cardLabel}>Remaining</div><div style={{fontSize:'20px', fontWeight:700, color: remaining < 0 ? '#ff5050' : '#fff'}}>£{Math.abs(remaining).toFixed(0)}</div><div style={s.cardSub}>{remaining < 0 ? 'over budget' : 'left'}</div></div>
            </div>
            <div style={s.progressBar}><div style={s.progressFill(pct, pct > 90 ? '#ff5050' : pct > 70 ? '#f4a535' : '#c5e161')}></div></div>
          </div>

          {budget.expenses.slice().reverse().slice(0, 10).map(e => (
            <div key={e.id} style={s.expRow}>
              <div style={s.expIcon(CATEGORY_COLOURS_BG[e.category] || 'rgba(255,255,255,0.06)')}>{CATEGORY_ICONS[e.category] || '📦'}</div>
              <div>
                <div style={s.expName}>{e.description}</div>
                <div style={s.expMeta}>{e.category} · {e.date}</div>
              </div>
              <div style={s.expAmt}>£{parseFloat(e.amount).toFixed(2)}</div>
            </div>
          ))}
        </>
      )}

      {budgetTab === 'stops' && (
        <>
          {stops.map((stop, i) => {
            const colour = STOP_COLOURS[i % STOP_COLOURS.length]
            const days = getDays(stop)
            const projected = days * stop.dailyBudget
            const spent = budget.expenses.filter(e => e.stop === stop.name).reduce((acc, e) => acc + parseFloat(e.amount || 0), 0)
            const spentPct = projected > 0 ? Math.min(100, (spent / projected) * 100) : 0
            return (
              <div key={stop.id} style={{...s.card, marginBottom:'8px'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                  <div><div style={{fontSize:'14px', fontWeight:600, color:'#fff'}}>{stop.name.split(',')[0]}</div><div style={{fontSize:'11px', color:'rgba(255,255,255,0.35)', marginTop:'2px'}}>{days} nights · £{stop.dailyBudget}/day</div></div>
                  <div style={{textAlign:'right'}}><div style={{fontSize:'15px', fontWeight:700, color: spent > projected ? '#ff5050' : '#fff'}}>£{spent.toFixed(0)}</div><div style={{fontSize:'11px', color:'rgba(255,255,255,0.35)'}}>/ £{projected}</div></div>
                </div>
                <div style={s.progressBar}><div style={s.progressFill(spentPct, colour)}></div></div>
              </div>
            )
          })}
          {stops.length === 0 && <div style={{padding:'20px', fontSize:'13px', color:'rgba(255,255,255,0.3)'}}>Add stops to see budget by stop</div>}
        </>
      )}

      {showAdd && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center', padding:'0 0 20px'}}>
          <div style={{background:'#141414', borderRadius:'24px', padding:'24px', width:'100%', maxWidth:'440px', border:'0.5px solid rgba(255,255,255,0.1)'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
              <div style={{fontSize:'16px', fontWeight:600, color:'#fff'}}>Log expense</div>
              <button onClick={() => setShowAdd(false)} style={{background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'20px', cursor:'pointer'}}>×</button>
            </div>
            <div style={{marginBottom:'14px'}}>
              <div style={s.inputLabel}>Amount (£)</div>
              <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} autoFocus style={{...s.input, fontSize:'24px', fontWeight:700}} />
            </div>
            <div style={{marginBottom:'14px'}}>
              <div style={s.inputLabel}>Description (optional)</div>
              <input type="text" placeholder="e.g. Street food, hostel..." value={form.description} onChange={e => setForm({...form, description:e.target.value})} style={s.input} />
            </div>
            <div style={{marginBottom:'16px'}}>
              <div style={s.inputLabel}>Category</div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'8px'}}>
                {['Food & drink','Accommodation','Transport','Activities','Shopping','Misc'].map(cat => (
                  <button key={cat} onClick={() => setForm({...form, category:cat})} style={{padding:'10px 6px', borderRadius:'12px', border:'none', cursor:'pointer', fontFamily:'DM Sans, sans-serif', background: form.category === cat ? 'rgba(197,225,97,0.15)' : 'rgba(255,255,255,0.05)', outline: form.category === cat ? '0.5px solid rgba(197,225,97,0.4)' : 'none'}}>
                    <div style={{fontSize:'18px', marginBottom:'3px'}}>{CATEGORY_ICONS[cat]}</div>
                    <div style={{fontSize:'10px', color: form.category === cat ? '#c5e161' : 'rgba(255,255,255,0.4)', fontWeight:500}}>{cat.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleAdd} style={{width:'100%', padding:'15px', background:'#c5e161', color:'#000', border:'none', borderRadius:'14px', fontSize:'15px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif'}}>
              Log £{form.amount || '0'}
            </button>
          </div>
        </div>
      )}

      {!showAdd && <button style={s.addBtn} onClick={() => setShowAdd(true)}>+ Quick add expense</button>}
    </div>
  )
}

function DiscoverTab({ currentStop, nextStop }) {
  const [city, setCity] = useState(currentStop?.name?.split(',')[0] || nextStop?.name?.split(',')[0] || '')
  const [category, setCategory] = useState('tourist attractions')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const BACKEND_URL = 'https://humorous-luck-production.up.railway.app'

  const CATS = [
    { id:'tourist attractions', label:'Sights', icon:'🏛️' },
    { id:'restaurants', label:'Food', icon:'🍜' },
    { id:'nature parks', label:'Nature', icon:'🌿' },
    { id:'nightlife', label:'Nightlife', icon:'🌙' },
    { id:'shopping', label:'Shopping', icon:'🛍️' },
  ]

  async function handleSearch() {
    if (!city) return
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND_URL}/api/places?query=${encodeURIComponent(category + ' in ' + city)}`)
      const data = await res.json()
      if (data.results) { setResults(data.results); setSearched(true) }
    } catch(e) {}
    setLoading(false)
  }

  return (
    <div>
      <div style={s.hero}>
        <div style={s.heroGreeting}>EXPLORE</div>
        <div style={s.heroTitle}>{city || 'Discover'}</div>
        <div style={s.heroSub}>Find things to do</div>
      </div>

      <div style={s.searchBar}>
        <span style={{fontSize:'16px', color:'rgba(255,255,255,0.3)'}}>⌕</span>
        <input type="text" placeholder="Search a city..." value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} style={{background:'none', border:'none', outline:'none', fontSize:'14px', color:'#fff', flex:1, fontFamily:'DM Sans, sans-serif'}} />
      </div>

      <div style={{display:'flex', gap:'8px', padding:'0 16px 14px', overflowX:'auto'}}>
        {CATS.map(cat => (
          <button key={cat.id} onClick={() => setCategory(cat.id)} style={{...s.catPill(category === cat.id), display:'flex', alignItems:'center', gap:'5px', whiteSpace:'nowrap', flexShrink:0}}>
            <span style={{fontSize:'14px'}}>{cat.icon}</span>{cat.label}
          </button>
        ))}
      </div>

      <button onClick={handleSearch} disabled={!city || loading} style={{margin:'0 16px 16px', width:'calc(100% - 32px)', padding:'13px', background:'#c5e161', color:'#000', border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif', opacity: !city ? 0.5 : 1}}>
        {loading ? 'Searching...' : 'Find places'}
      </button>

      {results.map((place, i) => (
        <div key={i} style={s.placeCard} onClick={() => window.open(`https://www.google.com/maps/place/?q=place_id:${place.place_id}`)}>
          <div style={s.placeImg}>🏙️</div>
          <div style={s.placeBody}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
              <div style={s.placeName}>{place.name}</div>
              {place.rating && <span style={s.pill('#f4a535', 'rgba(244,165,53,0.1)')}>★ {place.rating}</span>}
            </div>
            <div style={s.placeMeta}>{place.formatted_address}</div>
            {place.opening_hours && <div style={{fontSize:'11px', color: place.opening_hours.open_now ? '#4bdbe3' : '#ff5050', marginTop:'4px'}}>{place.opening_hours.open_now ? 'Open now' : 'Closed'}</div>}
          </div>
        </div>
      ))}

      {searched && results.length === 0 && <div style={{padding:'20px', fontSize:'13px', color:'rgba(255,255,255,0.3)'}}>No results found — try a different search</div>}
      {!searched && results.length === 0 && currentStop && (
        <div style={{padding:'0 16px'}}>
          <div style={{fontSize:'12px', color:'rgba(255,255,255,0.3)', marginBottom:'10px'}}>Suggested for {currentStop.name.split(',')[0]}</div>
        </div>
      )}
    </div>
  )
}

function TransportTab({ currentStop, nextStop }) {
  const [from, setFrom] = useState(currentStop?.name?.split(',')[0] || '')
  const [to, setTo] = useState(nextStop?.name?.split(',')[0] || '')
  const [searched, setSearched] = useState(false)

  const ENGINES = [
    { name:'Rome2Rio', desc:'All transport modes', icon:'🌍', color:'rgba(75,219,227,0.1)', getUrl:(f,t) => `https://www.rome2rio.com/s/${encodeURIComponent(f)}/${encodeURIComponent(t)}` },
    { name:'Skyscanner', desc:'Best flights', icon:'✈️', color:'rgba(167,139,250,0.1)', getUrl:(f,t) => `https://www.skyscanner.net/transport/flights/${f.slice(0,3).toLowerCase()}/${t.slice(0,3).toLowerCase()}/` },
    { name:'Trainline', desc:'European trains', icon:'🚂', color:'rgba(197,225,97,0.1)', getUrl:(f,t) => `https://www.trainline.com/search/${encodeURIComponent(f)}/${encodeURIComponent(t)}` },
    { name:'12go Asia', desc:'SE Asia transport', icon:'🛺', color:'rgba(244,165,53,0.1)', getUrl:(f,t) => `https://12go.asia/en/travel/${encodeURIComponent(f.toLowerCase())}/${encodeURIComponent(t.toLowerCase())}` },
    { name:'FlixBus', desc:'Budget buses', icon:'🚌', color:'rgba(255,107,91,0.1)', getUrl:(f,t) => `https://www.flixbus.com/bus/${encodeURIComponent(f.toLowerCase())}-${encodeURIComponent(t.toLowerCase())}` },
    { name:'Busbud', desc:'Buses worldwide', icon:'🚍', color:'rgba(255,255,255,0.06)', getUrl:(f,t) => `https://www.busbud.com/en/bus-${encodeURIComponent(f.toLowerCase())}-${encodeURIComponent(t.toLowerCase())}` },
  ]

  return (
    <div>
      <div style={s.hero}>
        <div style={s.heroGreeting}>TRANSPORT</div>
        <div style={s.heroTitle}>{from && to ? `${from} → ${to}` : 'Search routes'}</div>
        <div style={s.heroSub}>Compare all options</div>
      </div>

      <div style={{padding:'0 16px 14px', display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:'8px', alignItems:'center'}}>
        <div>
          <div style={s.inputLabel}>From</div>
          <input type="text" placeholder="City" value={from} onChange={e => { setFrom(e.target.value); setSearched(false) }} style={s.input} />
        </div>
        <div style={{fontSize:'16px', color:'rgba(255,255,255,0.3)', marginTop:'18px'}}>→</div>
        <div>
          <div style={s.inputLabel}>To</div>
          <input type="text" placeholder="City" value={to} onChange={e => { setTo(e.target.value); setSearched(false) }} style={s.input} />
        </div>
      </div>

      <button onClick={() => setSearched(true)} disabled={!from || !to} style={{margin:'0 16px 16px', width:'calc(100% - 32px)', padding:'13px', background:'#c5e161', color:'#000', border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans, sans-serif', opacity: !from || !to ? 0.4 : 1}}>
        Search options
      </button>

      {searched && ENGINES.map(engine => (
        <div key={engine.name} style={s.transportCard} onClick={() => window.open(engine.getUrl(from, to))}>
          <div style={s.transportMode(engine.color)}>{engine.icon}</div>
          <div style={s.transportInfo}>
            <div style={s.transportRoute}>{engine.name}</div>
            <div style={s.transportMeta}>{engine.desc}</div>
          </div>
          <div style={{fontSize:'16px', color:'rgba(255,255,255,0.3)'}}>→</div>
        </div>
      ))}

      {!searched && (
        <div style={{padding:'0 16px'}}>
          <div style={{fontSize:'12px', color:'rgba(255,255,255,0.3)', marginBottom:'12px'}}>Popular booking sites</div>
          {ENGINES.map(engine => (
            <div key={engine.name} style={{...s.transportCard, opacity:0.5}}>
              <div style={s.transportMode(engine.color)}>{engine.icon}</div>
              <div style={s.transportInfo}><div style={s.transportRoute}>{engine.name}</div><div style={s.transportMeta}>{engine.desc}</div></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
