'use client'

import { useEffect, useState } from 'react'

const D    = 'oklch(0.16 0.02 270)'
const CARD = 'oklch(0.20 0.025 270)'
const CARD2= 'oklch(0.24 0.025 270)'
const BDR  = 'oklch(1 0 0 / 8%)'
const TEXT = 'oklch(0.96 0.01 90)'
const TEXT2= 'oklch(0.70 0.02 90)'
const TEXT3= 'oklch(0.55 0.02 90)'
const TEAL = 'oklch(0.72 0.15 180)'
const CORAL= 'oklch(0.74 0.14 185)'

function scoreColor(score) {
  if (score >= 8) return { bg: 'oklch(0.28 0.08 145)', color: 'oklch(0.82 0.14 145)' }
  if (score >= 6) return { bg: 'oklch(0.28 0.07 80)',  color: 'oklch(0.82 0.12 80)'  }
  return               { bg: 'oklch(0.28 0.07 25)',  color: 'oklch(0.82 0.10 25)'  }
}

export default function FeedPage() {
  const [minScore, setMinScore] = useState(() => {
    if (typeof window !== 'undefined') return Number(localStorage.getItem('applyai_minscore') || 6)
    return 6
  })
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadingLabel, setLoadingLabel] = useState('Finding jobs for you...')

  useEffect(() => { localStorage.setItem('applyai_minscore', minScore) }, [minScore])

  const LOADING_LABELS = [
    'Finding jobs for you...',
    'Scanning LinkedIn, Indeed, Glassdoor...',
    'Rating matches...',
    'Ranking your top picks...',
  ]

  useEffect(() => {
    async function loadJobs() {
      try {
        const sessionId = localStorage.getItem('applyai_session')
        if (!sessionId) { setError('No profile found. Please complete onboarding first.'); setLoading(false); return }

        let i = 0
        const interval = setInterval(() => { i = (i + 1) % LOADING_LABELS.length; setLoadingLabel(LOADING_LABELS[i]) }, 1800)

        const res = await fetch('/api/fetch-jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) })
        clearInterval(interval)
        const data = await res.json()

        if (data.error) setError(data.error)
        else setJobs(data.jobs || [])
      } catch (err) {
        setError('Failed to load jobs: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    loadJobs()
  }, [])

  const topPicks = jobs.filter(j => j.topPick)

  return (
    <div style={{ minHeight: '100vh', background: D }}>

      {/* Top bar */}
      <div style={{ background: CARD, borderBottom: '1px solid ' + BDR, padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/Logo.png" alt="Robin" style={{ width: 28, height: 28, objectFit: 'contain', filter: 'drop-shadow(0 0 8px ' + CORAL + ')' }} />
          <span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 20, fontWeight: 400, color: TEXT }}>Robin</span>
        </a>
        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: TEXT2 }}>
          <span style={{ color: TEAL, fontWeight: 500 }}>Job feed</span>
          <span style={{ cursor: 'pointer' }}>Applications</span>
          <span style={{ cursor: 'pointer' }}>Insights</span>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <img src="/Logo.png" alt="Robin" style={{ width: 36, height: 36, objectFit: 'contain' }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, color: TEXT, marginBottom: 6 }}>{loadingLabel}</div>
            <div style={{ fontSize: 12, color: TEXT2 }}>This takes about 20–30 seconds — Hang Tight...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: 'oklch(0.24 0.06 25)', border: '1px solid oklch(0.35 0.08 25)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>⚠️</div>
            <div style={{ color: 'oklch(0.82 0.10 25)', fontSize: 14 }}>{error}</div>
            <button onClick={() => window.location.href = '/onboarding'}
              style={{ marginTop: 16, background: TEAL, color: D, border: 'none', borderRadius: 100, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Go to onboarding
            </button>
          </div>
        )}

        {/* Feed */}
        {!loading && !error && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 16, fontWeight: 500, color: TEXT }}>Today's matches</span>
                <span style={{ fontSize: 14, color: TEXT2, marginLeft: 8 }}>· {jobs.filter(j => j.score >= minScore).length} jobs shown</span>
              </div>
              {topPicks.length > 0 && (
                <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: 'oklch(0.26 0.06 180)', color: TEAL }}>
                  {topPicks.length} top picks
                </span>
              )}
            </div>

            {/* Top picks bar */}
            {topPicks.length > 0 && (
              <div style={{ background: 'oklch(0.22 0.04 180)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: TEAL, flexShrink: 0 }}>Top picks</span>
                {topPicks.map(job => (
                  <button key={job.id}
                    onClick={() => document.getElementById(`job-${job.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                    style={{ background: TEAL, color: D, border: 'none', borderRadius: 20, padding: '4px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                    {job.company} — {job.title.split(' ').slice(0, 3).join(' ')}
                  </button>
                ))}
              </div>
            )}

            {/* Score filter */}
            <div style={{ background: CARD, border: '1px solid ' + BDR, borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: TEXT }}>Minimum match score</span>
                  <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20,
                    background: minScore >= 8 ? 'oklch(0.28 0.08 145)' : minScore >= 7 ? 'oklch(0.26 0.06 180)' : 'oklch(0.26 0.03 270)',
                    color:      minScore >= 8 ? 'oklch(0.82 0.14 145)' : minScore >= 7 ? TEAL                   : TEXT2,
                  }}>
                    {minScore >= 8 ? 'Top picks only' : minScore >= 7 ? 'Strong match' : minScore >= 6 ? 'Good match' : 'Show all'}
                  </span>
                </div>
                <span style={{ fontSize: 20, fontWeight: 500, color: TEAL }}>{minScore}+</span>
              </div>
              <input type="range" min={5} max={9} step={1} value={minScore} onChange={e => setMinScore(Number(e.target.value))}
                style={{ width: '100%', accentColor: TEAL }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: TEXT3, marginTop: 4 }}>
                <span>Show all</span><span>Good match</span><span>Strong match</span><span>Top picks only</span>
              </div>
              <div style={{ fontSize: 11, color: TEXT3, marginTop: 8 }}>
                {jobs.filter(j => j.score >= minScore).length} of {jobs.length} jobs shown
              </div>
            </div>

            {/* Empty */}
            {jobs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: TEXT2 }}>
                No jobs found. Try updating your profile with a different role.
              </div>
            )}

            {/* Job cards */}
            {jobs.filter(j => j.score >= minScore).map((job) => {
              const sc = scoreColor(job.score)
              return (
                <div key={job.id} id={`job-${job.id}`}
                  style={{ background: CARD, border: '1.5px solid ' + (job.topPick ? TEAL : BDR), borderRadius: 16, padding: 20, marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

                    {/* Logo */}
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: TEAL, flexShrink: 0, overflow: 'hidden' }}>
                      {job.logo ? (
                        <img src={job.logo} alt={job.company} style={{ width: 40, height: 40, objectFit: 'contain' }}
                          onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                      ) : null}
                      <span style={{ display: job.logo ? 'none' : 'flex' }}>{job.company.slice(0, 2).toUpperCase()}</span>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>{job.title}</span>
                        {job.topPick && (
                          <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, background: 'oklch(0.26 0.06 180)', color: TEAL }}>Top pick</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: TEXT2, marginBottom: 10 }}>
                        {job.company} · {job.location}{job.salary !== 'Not listed' ? ` · ${job.salary}` : ''} · {job.type}
                      </div>

                      {/* Gaps */}
                      {Array.isArray(job.gaps) && job.gaps.length > 0 && (
                        <div style={{ background: 'oklch(0.26 0.06 60)', border: '1px solid oklch(0.35 0.08 60)', borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'oklch(0.82 0.12 70)', marginBottom: 4 }}>⚠ Gaps to address</div>
                          {job.gaps.map((gap, i) => (
                            <div key={i} style={{ fontSize: 12, color: 'oklch(0.78 0.10 70)', lineHeight: 1.5 }}>· {gap}</div>
                          ))}
                        </div>
                      )}

                      {/* Strengths */}
                      {Array.isArray(job.strengths) && job.strengths.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          {job.strengths.map((s, i) => (
                            <div key={i} style={{ fontSize: 11, color: 'oklch(0.78 0.14 155)', lineHeight: 1.6 }}>✓ {s}</div>
                          ))}
                        </div>
                      )}

                      {/* Score breakdown */}
                      {job.scores && Object.keys(job.scores).length > 0 && (
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 6 }}>
                          {[['Role', job.scores.title], ['Skills', job.scores.skills], ['Experience', job.scores.experience], ['Location', job.scores.location], ['Company Fit', job.scores.culture]].map(([label, score]) => (
                            <div key={label} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500,
                              background: score >= 8 ? 'oklch(0.28 0.08 145)' : score >= 6 ? 'oklch(0.28 0.06 80)' : 'oklch(0.28 0.06 25)',
                              color:      score >= 8 ? 'oklch(0.82 0.14 145)' : score >= 6 ? 'oklch(0.82 0.10 80)' : 'oklch(0.82 0.08 25)',
                            }}>
                              {label} {score}/10
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Score + button */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: sc.bg, color: sc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>
                        {job.score}
                      </div>
                      {job.score >= 7 ? (
                        <a href={`/apply/${encodeURIComponent(job.id)}`}
                          style={{ background: TEAL, color: D, padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                          Apply →
                        </a>
                      ) : (
                        <a href={job.url} target="_blank" rel="noopener noreferrer"
                          style={{ background: 'transparent', border: '1px solid ' + BDR, color: TEXT2, padding: '6px 14px', borderRadius: 8, fontSize: 12, textDecoration: 'none' }}>
                          Review
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Refresh */}
            <div style={{ textAlign: 'center', paddingTop: 16 }}>
              <button onClick={() => window.location.reload()}
                style={{ background: 'none', border: '1px solid ' + BDR, color: TEXT2, borderRadius: 100, padding: '10px 24px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                Refresh feed
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
