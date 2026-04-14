import { useState } from 'react'
import { useTrip } from './TripContext'
import { useBudget } from './BudgetContext'
import { supabase } from './supabase'
import Planner from './Planner'
import Budget from './Budget'
import Discover from './Discover'
import Overview from "./Overview"
import Transport from './Transport'
import Trips from './Trips'
import QuickAdd from './QuickAdd'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function App({ session }) {
  const { activeTrip, activeTripId, setActiveTripId, updateTrip } = useTrip()
  const [activePage, setActivePage] = useState('overview')

  if (!activeTripId || !activeTrip) {
    return <Trips />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000000', color: '#ffffff', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>

      {/* SIDEBAR */}
      <aside style={{ width: '220px', flexShrink: 0, background: '#0d0d0d', borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', padding: '24px 0' }}>
        <div style={{ padding: '0 20px 6px', fontSize: '24px', fontFamily: 'DM Serif Display, serif', letterSpacing: '-0.3px' }}>
          wand<span style={{ color: '#c5e161' }}>r</span>
        </div>

        <button onClick={() => setActiveTripId(null)} style={{
          margin: '0 12px 20px', padding: '6px 10px', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
          color: '#9a9890', fontSize: '11px', cursor: 'pointer',
          fontFamily: 'DM Sans, sans-serif', textAlign: 'left'
        }}>
          ← All trips
        </button>

        <div style={{ padding: '0 12px 6px 20px', fontSize: '11px', fontWeight: 500, color: '#ffffff', letterSpacing: '-0.2px', marginBottom: '4px' }}>
          {activeTrip.name}
        </div>
        <div style={{ padding: '0 12px 16px 20px', fontSize: '11px', color: '#5c5b57' }}>
          {activeTrip.startDate ? new Date(activeTrip.startDate).toLocaleDateString('en-GB', {day:'numeric',month:'short'}) + ' → ' + (activeTrip.endDate ? new Date(activeTrip.endDate).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}) : '?') : 'No dates set'}
        </div>

        <nav style={{ flex: 1, padding: '0 12px' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', padding: '0 8px 6px' }}>Trip</div>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'planner', label: 'Trip planner' },
            { id: 'budget', label: 'Budget' },
          ].map(item => (
            <button key={item.id} onClick={() => setActivePage(item.id)} style={{
              width: '100%', textAlign: 'left', padding: '8px 12px',
              borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13.5px', fontFamily: 'DM Sans, sans-serif',
              marginBottom: '2px',
              background: activePage === item.id ? 'rgba(197,225,97,0.1)' : 'none',
              color: activePage === item.id ? '#c5e161' : '#9a9890',
            }}>{item.label}</button>
          ))}

          <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5c5b57', padding: '16px 8px 6px' }}>Explore</div>
          {[
            { id: 'discover', label: 'Discover' },
            { id: 'transport', label: 'Transport' },
          ].map(item => (
            <button key={item.id} onClick={() => setActivePage(item.id)} style={{
              width: '100%', textAlign: 'left', padding: '8px 12px',
              borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontSize: '13.5px', fontFamily: 'DM Sans, sans-serif',
              marginBottom: '2px',
              background: activePage === item.id ? 'rgba(197,225,97,0.1)' : 'none',
              color: activePage === item.id ? '#c5e161' : '#9a9890',
            }}>{item.label}</button>
          ))}
        </nav>

        <div style={{ padding: '16px 12px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'rgba(197,225,97,0.1)', color: '#c5e161',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 600, flexShrink: 0
            }}>
              {session?.user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {session?.user?.email}
              </div>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut()} style={{
            width: '100%', textAlign: 'left', padding: '6px 10px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '12px', color: '#5c5b57', fontFamily: 'DM Sans, sans-serif'
          }}>Sign out</button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
        {activePage === 'overview'  && <Overview setActivePage={setActivePage} />}
        {activePage === 'planner'   && <Planner />}
        {activePage === 'budget'    && <Budget />}
        {activePage === 'discover'  && <Discover />}
        {activePage === 'transport' && <Transport />}
      </main>
      <QuickAdd />
    </div>
  )
}

