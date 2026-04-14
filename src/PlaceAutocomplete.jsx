import { useState, useEffect, useRef } from 'react'

const BACKEND_URL = 'https://humorous-luck-production.up.railway.app'

export default function PlaceAutocomplete({ value, onChange, placeholder, style }) {
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleInput(e) {
    const val = e.target.value
    onChange(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (val.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`${BACKEND_URL}/api/autocomplete?input=${encodeURIComponent(val)}`)
        const data = await res.json()
        if (data.predictions) {
          setSuggestions(data.predictions)
          setShowDropdown(true)
        }
      } catch (err) {
        console.error('Autocomplete error:', err)
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  function handleSelect(prediction) {
    onChange(prediction.description)
    setSuggestions([])
    setShowDropdown(false)
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder={placeholder || 'Search for a place...'}
          value={value}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          style={{
            ...style,
            width: '100%',
            paddingRight: loading ? '36px' : style?.paddingRight || '12px',
          }}
        />
        {loading && (
          <div style={{
            position: 'absolute', right: '10px', top: '50%',
            transform: 'translateY(-50%)',
            width: '14px', height: '14px',
            border: '2px solid rgba(255,255,255,0.1)',
            borderTop: '2px solid #c5e161',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#161614', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '10px', zIndex: 999, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
          {suggestions.map((pred, i) => (
            <button
              key={pred.place_id}
              onMouseDown={() => handleSelect(pred)}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 14px',
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                fontFamily: 'DM Sans, sans-serif',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,225,97,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ fontSize: '14px', flexShrink: 0 }}>📍</span>
              <div>
                <div style={{ fontSize: '13px', color: '#ffffff' }}>
                  {pred.structured_formatting?.main_text || pred.description}
                </div>
                <div style={{ fontSize: '11px', color: '#9a9890', marginTop: '1px' }}>
                  {pred.structured_formatting?.secondary_text || ''}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
    </div>
  )
}
