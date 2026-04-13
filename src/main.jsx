import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { TripProvider } from './TripContext'
import { BudgetProvider } from './BudgetContext'
import { supabase } from './supabase'
import './index.css'
import App from './App.jsx'
import Login from './Login.jsx'

function Root() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#000000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'DM Serif Display, serif', fontSize: '26px', color: '#ffffff'
      }}>
        wand<span style={{ color: '#c5e161' }}>r</span>
      </div>
    )
  }

  if (!session) return <Login />

  return (
    <TripProvider>
      <BudgetProvider>
        <App session={session} />
      </BudgetProvider>
    </TripProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode><Root /></StrictMode>
)
