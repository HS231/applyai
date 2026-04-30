'use client'

import { useState } from 'react'

const COMPANY_SIZES = [
  { label: 'Startup', sub: '1–50 people' },
  { label: 'Scale-up', sub: '51–500 people' },
  { label: 'Mid-market', sub: '500–5,000 people' },
  { label: 'Enterprise', sub: '5,000+ people' },
]

const URGENCY_OPTIONS = [
  'Actively looking — open to starting immediately',
  'Casually exploring — open to the right opportunity',
  'Just browsing — not ready to apply yet',
]

const DIGEST_OPTIONS = ['Daily', 'Every 2–3 days', 'Weekly']

export default function Step4WorkStyle({ profile, updateProfile, onNext, onBack }) {
  const [companySize, setCompanySize] = useState(
  profile.companySize
    ? Array.isArray(profile.companySize)
      ? profile.companySize
      : [profile.companySize]
    : []
)
  const [urgency, setUrgency] = useState(profile.urgency || '')
  const [digest, setDigest] = useState(profile.digestFrequency || 'Daily')

  function handleNext() {
    updateProfile({
  companySize: Array.isArray(companySize) ? companySize.join(', ') : companySize,
  urgency,
  digestFrequency: digest,
})
    onNext()
  }

  const canContinue = (Array.isArray(companySize) ? companySize.length > 0 : !!companySize) && urgency.length > 0

  return (
    <div className="card">
      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>
        Your work style
      </h2>
      <p style={{ color: 'var(--text-sec)', fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
        Help us match you with the right culture and team fit.
      </p>

      {/* Company size */}
      <div style={{ marginBottom: 20 }}>
        <label className="field-label">Company size preference</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {COMPANY_SIZES.map(({ label, sub }) => (
            <button
              key={label}
              className={`choice-btn ${companySize.includes(label) ? 'selected' : ''}`}
onClick={() => setCompanySize(prev =>
  prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
)}
            >
              <div style={{ fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: 11, color: companySize === label ? 'var(--purple)' : 'var(--text-hint)', marginTop: 2 }}>
                {sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Urgency */}
      <div style={{ marginBottom: 20 }}>
        <label className="field-label">Job search urgency</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {URGENCY_OPTIONS.map(opt => (
            <button
              key={opt}
              className={`choice-btn ${urgency === opt ? 'selected' : ''}`}
              onClick={() => setUrgency(opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Digest frequency */}
      <div style={{ marginBottom: 28 }}>
        <label className="field-label">How often do you want job updates?</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {DIGEST_OPTIONS.map(opt => (
            <button
              key={opt}
              className={`choice-btn ${digest === opt ? 'selected' : ''}`}
              onClick={() => setDigest(opt)}
              style={{ textAlign: 'center' }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-ghost" onClick={onBack} style={{ width: 'auto', padding: '0 20px' }}>
          ← Back
        </button>
        <button className="btn-primary" onClick={handleNext} disabled={!canContinue}>
          Build my job feed →
        </button>
      </div>
    </div>
  )
}