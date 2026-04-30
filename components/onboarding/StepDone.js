'use client'

import { useEffect, useState } from 'react'

const SCAN_LABELS = [
  'Scanning LinkedIn Jobs...',
  'Checking Greenhouse portals...',
  'Browsing company career pages...',
  'Ranking matches for you...',
  'Feed ready — matches found! 🎉',
]

export default function StepDone({ profile }) {
  const [scanLabel, setScanLabel] = useState(SCAN_LABELS[0])
  const [scanDone, setScanDone] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Run the scanning animation
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      if (i < SCAN_LABELS.length - 1) {
        setScanLabel(SCAN_LABELS[i])
      } else {
        setScanLabel(SCAN_LABELS[SCAN_LABELS.length - 1])
        setScanDone(true)
        clearInterval(interval)
      }
    }, 900)
    return () => clearInterval(interval)
  }, [])

  // Save profile to Supabase as soon as step loads
  useEffect(() => {
    async function saveProfile() {
      setSaving(true)
      try {
        // Get or create a session ID in localStorage
        let sessionId = localStorage.getItem('applyai_session')
        if (!sessionId) {
          sessionId = crypto.randomUUID()
          localStorage.setItem('applyai_session', sessionId)
        }

        const res = await fetch('/api/save-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...profile, sessionId }),
        })

        const data = await res.json()

        if (data.success) {
          setSaved(true)
          console.log('Profile saved successfully:', data)
        } else {
          setSaveError(data.error || 'Unknown error')
          console.error('Save failed:', data.error)
        }
      } catch (err) {
        setSaveError(err.message)
        console.error('Save error:', err)
      } finally {
        setSaving(false)
      }
    }

    saveProfile()
  }, [])

  return (
    <div className="card" style={{ textAlign: 'center', padding: '40px 28px' }}>

      {/* Success icon */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--green-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px', fontSize: 24,
      }}>
        ✓
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>
        You're all set{profile.name ? `, ${profile.name.split(' ')[0]}` : ''}!
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 24, lineHeight: 1.6, maxWidth: 380, margin: '0 auto 24px' }}>
        Your profile has been saved. Our AI is scanning job boards and building your personalised feed.
      </p>

      {/* Save status */}
      {saving && (
        <div style={{ fontSize: 12, color: 'var(--text-hint)', marginBottom: 12 }}>
          Saving your profile...
        </div>
      )}
      {saved && (
        <div style={{ fontSize: 12, color: 'var(--teal)', marginBottom: 12 }}>
          ✓ Profile saved to database
        </div>
      )}
      {saveError && (
        <div style={{ fontSize: 12, color: '#791F1F', marginBottom: 12 }}>
          Save error: {saveError}
        </div>
      )}

      {/* Profile summary */}
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: 10,
        padding: '14px 18px', textAlign: 'left', marginBottom: 24,
      }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-pri)', marginBottom: 10 }}>
          Your profile summary
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 12 }}>
          {[
            ['Role', profile.targetRole || '—'],
            ['Seniority', profile.seniority || '—'],
            ['Location', profile.location || '—'],
            ['Arrangement', profile.workArrangement || '—'],
            ['Min salary', profile.salaryMin ? `$${Number(profile.salaryMin).toLocaleString()} ${profile.currency}` : '—'],
            ['Digest', profile.digestFrequency || '—'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'contents' }}>
              <span style={{ color: 'var(--text-sec)' }}>{label}</span>
              <span style={{ color: 'var(--text-pri)', fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scanning animation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: scanDone ? 'var(--teal)' : 'var(--purple)',
          animation: scanDone ? 'none' : 'pulse 1.2s infinite',
        }} />
        <span style={{ fontSize: 12, color: 'var(--text-sec)' }}>{scanLabel}</span>
      </div>

      {/* CTA */}
      <button
        className="btn-primary"
        disabled={!scanDone}
        //onClick={() => alert('Job feed coming next!')}
        onClick={() => window.location.href = '/feed'}
      >
        Take me to my feed →
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  )
}