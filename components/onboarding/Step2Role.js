'use client'

import { useState } from 'react'

const SENIORITY_OPTIONS = [
  'Entry level', 'Mid level', 'Senior', 'Lead / Staff', 'Director+', 'Open to all'
]

const INDUSTRY_OPTIONS = [
  'Fintech', 'SaaS / B2B', 'E-commerce', 'Healthcare',
  'AI / ML', 'Consumer apps', 'Gaming', 'Climate tech',
  'Consulting', 'Banking & Finance', 'Legal', 'Real Estate',
  'Education / EdTech', 'Media & Entertainment', 'Retail',
  'Manufacturing', 'Logistics & Supply Chain', 'Non-profit',
  'Government & Public Sector', 'Cybersecurity', 'Open to all', 'Other'
]

export default function Step2Role({ profile, updateProfile, onNext, onBack }) {
  const [role, setRole] = useState(profile.targetRole || '')
  const [seniority, setSeniority] = useState(
    profile.seniority
      ? Array.isArray(profile.seniority)
        ? profile.seniority
        : profile.seniority.split(', ').filter(Boolean)
      : []
  )
  const [industries, setIndustries] = useState(profile.industries || [])
  const [otherIndustry, setOtherIndustry] = useState('')
  const [checking, setChecking] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [gibberish, setGibberish] = useState(false)
  const [confirmed, setConfirmed] = useState(!!profile.targetRole)

  function toggleSeniority(opt) {
    setSeniority(prev =>
      prev.includes(opt) ? prev.filter(s => s !== opt) : [...prev, opt]
    )
  }

  function toggleIndustry(ind) {
    if (ind === 'Other') {
      setIndustries(prev =>
        prev.includes('Other') ? prev.filter(i => i !== 'Other') : [...prev, 'Other']
      )
      return
    }
    setIndustries(prev =>
      prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]
    )
  }

  function commitOtherIndustry() {
    const val = otherIndustry.trim()
    if (val) {
      setIndustries(prev => [...prev.filter(i => i !== 'Other'), val])
      setOtherIndustry('')
    }
  }

  async function checkTitle() {
    if (!role.trim()) return
    setChecking(true)
    setSuggestions([])
    setGibberish(false)
    setConfirmed(false)

    try {
      const res = await fetch('/api/suggest-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: role.trim() }),
      })
      const data = await res.json()

      if (data.gibberish) {
        setGibberish(true)
      } else if (data.exact) {
        setConfirmed(true)
        setSuggestions([])
      } else {
        setSuggestions(data.suggestions || [])
      }
    } catch (err) {
      console.error('Title check error:', err)
      setConfirmed(true)
    } finally {
      setChecking(false)
    }
  }

  function selectSuggestion(title) {
    setRole(title)
    setSuggestions([])
    setConfirmed(true)
  }

  function keepOriginal() {
    setSuggestions([])
    setConfirmed(true)
  }

  function handleNext() {
    updateProfile({
      targetRole: role,
      seniority: seniority.join(', '),
      industries,
    })
    onNext()
  }

  const canContinue = confirmed && seniority.length > 0

  return (
    <div className="card">
      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>
        What kind of role are you after?
      </h2>
      <p style={{ color: 'var(--text-sec)', fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
        This shapes your entire job feed. You can change this any time.
      </p>

      {/* Target role input */}
      <div style={{ marginBottom: 16 }}>
        <label className="field-label">Target job title</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            placeholder="e.g. Product Manager, Finance Analyst, Software Engineer"
            value={role}
            onChange={e => {
              setRole(e.target.value)
              setConfirmed(false)
              setSuggestions([])
              setGibberish(false)
            }}
            onKeyDown={e => e.key === 'Enter' && checkTitle()}
            style={{ flex: 1 }}
          />
          <button
            onClick={checkTitle}
            disabled={!role.trim() || checking}
            style={{
              background: 'var(--purple)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              padding: '0 18px',
              fontSize: 13,
              fontWeight: 500,
              cursor: role.trim() && !checking ? 'pointer' : 'not-allowed',
              opacity: !role.trim() || checking ? 0.5 : 1,
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            {checking ? 'Checking...' : 'Check →'}
          </button>
        </div>
      </div>

      {/* Gibberish warning */}
      {gibberish && (
        <div style={{
          background: '#FCEBEB',
          border: '1px solid #F5C6C6',
          borderRadius: 10,
          padding: '12px 14px',
          marginBottom: 16,
          fontSize: 13,
          color: '#791F1F',
        }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>Huh? 🤔</div>
          <div>That doesn't look like a job title. Try something like "Finance Analyst", "Software Engineer" or "Marketing Manager".</div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div style={{
          background: '#EEEDFE',
          border: '1px solid #C5C0F0',
          borderRadius: 10,
          padding: '12px 14px',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--purple-dark)' }}>
          Here are some titles that tend to get more matches:
          </div>
          <button
          onClick={() => {
          const allTitles = suggestions.map(s => s.title).join(', ')
          setRole(allTitles)
          setSuggestions([])
          setConfirmed(true)
          }}
          style={{
          fontSize: 11, fontWeight: 500,
          color: 'var(--purple-dark)',
          background: 'white',
          border: '1px solid #C5C0F0',
          borderRadius: 20,
          padding: '4px 12px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          }}
          >
        + Add all
        </button>
        </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => selectSuggestion(s.title)}
                style={{
                  background: 'white',
                  border: '1px solid #C5C0F0',
                  borderRadius: 8,
                  padding: '10px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8F7FF'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--purple-dark)' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 2 }}>
                  {s.reason}
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={keepOriginal}
            style={{
              marginTop: 8,
              fontSize: 12,
              color: 'var(--text-hint)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              textDecoration: 'underline',
            }}
          >
            Keep "{role}" anyway
          </button>
        </div>
      )}

      {/* Confirmed */}
      {confirmed && !suggestions.length && !gibberish && (
        <div style={{ fontSize: 12, color: 'var(--teal)', marginBottom: 16 }}>
          ✓ "{role}" confirmed
        </div>
      )}

      {/* Seniority — multi select */}
      <div style={{ marginBottom: 20 }}>
        <label className="field-label">
          Seniority level <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10, color: 'var(--text-hint)' }}>— select all that apply</span>
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {SENIORITY_OPTIONS.map(opt => (
            <button
              key={opt}
              className={`choice-btn ${seniority.includes(opt) ? 'selected' : ''}`}
              onClick={() => toggleSeniority(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Industries */}
      <div style={{ marginBottom: 28 }}>
        <label className="field-label">
          Industries you're interested in <span style={{ fontWeight: 400, textTransform: 'none', fontSize: 10, color: 'var(--text-hint)' }}>— select all that apply</span>
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {INDUSTRY_OPTIONS.map(ind => (
            <button
              key={ind}
              onClick={() => toggleIndustry(ind)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: `1px solid ${industries.includes(ind) ? 'var(--purple)' : 'var(--border)'}`,
                background: industries.includes(ind) ? 'var(--purple-light)' : 'var(--bg-card)',
                color: industries.includes(ind) ? 'var(--purple-dark)' : 'var(--text-sec)',
                fontWeight: industries.includes(ind) ? 500 : 400,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Other text input */}
        {industries.includes('Other') && (
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <input
              className="input"
              placeholder="Type your industry..."
              value={otherIndustry}
              onChange={e => setOtherIndustry(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && commitOtherIndustry()}
              style={{ flex: 1 }}
            />
            <button
              onClick={commitOtherIndustry}
              style={{
                background: 'var(--purple)', color: 'white',
                border: 'none', borderRadius: 10,
                padding: '0 16px', fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Add
            </button>
          </div>
        )}

        {/* Show custom industries added */}
        {industries.filter(i => !INDUSTRY_OPTIONS.includes(i)).length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {industries.filter(i => !INDUSTRY_OPTIONS.includes(i)).map(i => (
              <span
                key={i}
                style={{
                  padding: '4px 10px', borderRadius: 20,
                  background: 'var(--purple-light)', color: 'var(--purple-dark)',
                  fontSize: 12, fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {i}
                <button
                  onClick={() => setIndustries(prev => prev.filter(x => x !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--purple-dark)', fontSize: 13, padding: 0 }}
                >×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-ghost" onClick={onBack} style={{ width: 'auto', padding: '0 20px' }}>
          ← Back
        </button>
        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={!canContinue}
        >
          {!confirmed ? 'Check your title first →' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}