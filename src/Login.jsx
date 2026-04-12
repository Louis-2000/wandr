import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [tab, setTab] = useState('google')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
  }, [])

  async function handleGoogle() {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  async function handleMagicLink(e) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    setLoading(false)
    if (!error) setSent(true)
  }

  const features = [
    { icon: '◎', label: 'Trip planner', desc: 'Build your route stop by stop' },
    { icon: '◑', label: 'Budget tracker', desc: 'Log expenses in any currency' },
    { icon: '✦', label: 'Discover', desc: 'Find places at every destination' },
    { icon: '◌', label: 'Transport', desc: 'Compare buses, trains and flights' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      display: 'flex',
      fontFamily: 'DM Sans, sans-serif',
      overflow: 'hidden',
    }}>

      {/* LEFT PANEL */}
      <div style={{
        width: '55%',
        padding: '48px 56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-24px)',
        transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>

        {/* LOGO */}
        <div style={{fontSize:'26px', fontFamily:'DM Serif Display, serif', letterSpacing:'-0.3px', color:'#ffffff'}}>
          wand<span style={{color:'#c5e161'}}>r</span>
        </div>

        {/* HERO */}
        <div>
          <div style={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#4bdbe3',
            background: 'rgba(75,219,227,0.1)',
            border: '1px solid rgba(75,219,227,0.2)',
            borderRadius: '20px',
            padding: '4px 14px',
            marginBottom: '24px',
          }}>Your all-in-one travel companion</div>

          <h1 style={{
            fontSize: '52px',
            fontFamily: 'DM Serif Display, serif',
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: '-1px',
            color: '#ffffff',
            marginBottom: '20px',
          }}>
            Travel smarter.<br />
            <span style={{color:'#c5e161'}}>Spend better.</span>
          </h1>

          <p style={{
            fontSize: '16px',
            color: '#9a9890',
            lineHeight: 1.7,
            maxWidth: '420px',
            marginBottom: '48px',
          }}>
            Plan your route, track every penny, discover hidden gems and find the best transport — all in one place.
          </p>

          {/* FEATURE LIST */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', maxWidth:'480px'}}>
            {features.map((f, i) => (
              <div key={f.label} style={{
                background: '#0d0d0d',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '16px',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(16px)',
                transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.08}s`,
              }}>
                <div style={{fontSize:'18px', marginBottom:'8px', color:'#c5e161'}}>{f.icon}</div>
                <div style={{fontSize:'13px', fontWeight:500, color:'#ffffff', marginBottom:'3px'}}>{f.label}</div>
                <div style={{fontSize:'12px', color:'#5c5b57'}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{fontSize:'12px', color:'#5c5b57'}}>
          Built for travellers, by a traveller.
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{
        width: '45%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        background: '#080808',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '380px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateX(0)' : 'translateX(24px)',
          transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
        }}>
          <h2 style={{
            fontSize: '24px',
            fontFamily: 'DM Serif Display, serif',
            fontWeight: 400,
            color: '#ffffff',
            marginBottom: '6px',
          }}>Get started</h2>
          <p style={{fontSize:'14px', color:'#9a9890', marginBottom:'32px'}}>
            Free forever. No credit card needed.
          </p>

          {/* TAB SWITCHER */}
          <div style={{
            display: 'flex',
            background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '24px',
          }}>
            {['google', 'email'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1,
                padding: '8px',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                fontFamily: 'DM Sans, sans-serif',
                background: tab === t ? '#161614' : 'none',
                color: tab === t ? '#ffffff' : '#5c5b57',
                transition: 'all 0.2s',
              }}>
                {t === 'google' ? 'Sign in with Google' : 'Magic link'}
              </button>
            ))}
          </div>

          {tab === 'google' && (
            <div style={{
              opacity: 1,
              animation: 'fadeIn 0.3s ease',
            }}>
              <button onClick={handleGoogle} disabled={loading} style={{
                width: '100%',
                padding: '14px',
                background: '#ffffff',
                color: '#000000',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: 'DM Sans, sans-serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1,
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 6.294C4.672 4.169 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                {loading ? 'Signing in...' : 'Continue with Google'}
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '20px 0',
              }}>
                <div style={{flex:1, height:'1px', background:'rgba(255,255,255,0.08)'}}/>
                <span style={{fontSize:'12px', color:'#5c5b57'}}>or</span>
                <div style={{flex:1, height:'1px', background:'rgba(255,255,255,0.08)'}}/>
              </div>

              <button onClick={() => setTab('email')} style={{
                width: '100%',
                padding: '13px',
                background: 'none',
                color: '#9a9890',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                fontSize: '13px',
                fontFamily: 'DM Sans, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}>
                Sign in with email instead
              </button>
            </div>
          )}

          {tab === 'email' && !sent && (
            <form onSubmit={handleMagicLink}>
              <div style={{marginBottom:'16px'}}>
                <div style={{fontSize:'11px', color:'#5c5b57', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'8px'}}>
                  Email address
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '13px 14px',
                    background: '#0d0d0d',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontFamily: 'DM Sans, sans-serif',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <button type="submit" disabled={loading || !email} style={{
                width: '100%',
                padding: '14px',
                background: '#c5e161',
                color: '#000000',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 500,
                fontFamily: 'DM Sans, sans-serif',
                cursor: 'pointer',
                opacity: loading || !email ? 0.5 : 1,
                transition: 'all 0.2s',
              }}>
                {loading ? 'Sending...' : 'Send magic link'}
              </button>
            </form>
          )}

          {sent && (
            <div style={{
              background: 'rgba(75,219,227,0.08)',
              border: '1px solid rgba(75,219,227,0.2)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <div style={{fontSize:'24px', marginBottom:'12px'}}>✉️</div>
              <div style={{fontSize:'14px', fontWeight:500, color:'#ffffff', marginBottom:'6px'}}>Check your email</div>
              <div style={{fontSize:'13px', color:'#9a9890'}}>We sent a magic link to {email}. Click it to sign in.</div>
            </div>
          )}

          <p style={{
            fontSize: '12px',
            color: '#5c5b57',
            textAlign: 'center',
            marginTop: '24px',
            lineHeight: 1.6,
          }}>
            By continuing you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=DM+Serif+Display&display=swap');
      `}</style>
    </div>
  )
}
