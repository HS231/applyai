'use client'

import { useEffect, useState } from 'react'

export default function FeedPage() {
  const [minScore, setMinScore] = useState(() => {
  if (typeof window !== 'undefined') {
    return Number(localStorage.getItem('applyai_minscore') || 6)
  }
  return 6
})
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadingLabel, setLoadingLabel] = useState('Finding jobs for you...')

  useEffect(() => {
  localStorage.setItem('applyai_minscore', minScore)
}, [minScore])

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
        if (!sessionId) {
          setError('No profile found. Please complete onboarding first.')
          setLoading(false)
          return
        }

        // Animate loading labels
        let i = 0
        const interval = setInterval(() => {
          i = (i + 1) % LOADING_LABELS.length
          setLoadingLabel(LOADING_LABELS[i])
        }, 1800)

        const res = await fetch('/api/fetch-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        clearInterval(interval)
        const data = await res.json()

        if (data.error) {
          setError(data.error)
        } else {
          setJobs(data.jobs || [])
        }
      } catch (err) {
        setError('Failed to load jobs: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [])

  const topPicks = jobs.filter(j => j.topPick)

  function scoreColor(score) {
    if (score >= 8) return { bg: '#EAF3DE', color: '#27500A' }
    if (score >= 6) return { bg: '#FAEEDA', color: '#633806' }
    return { bg: '#FCEBEB', color: '#791F1F' }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>

      {/* Top bar */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <span style={{ fontSize: 18, fontWeight: 500 }}>apply</span>
          <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--purple)' }}>AI</span>
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-sec)' }}>
          <span style={{ color: 'var(--purple)', fontWeight: 500 }}>Job feed</span>
          <span style={{ cursor: 'pointer' }}>Applications</span>
          <span style={{ cursor: 'pointer' }}>Insights</span>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--purple-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 22,
            }}>
              🔍
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>
              {loadingLabel}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-hint)' }}>
              This takes about 20–30 seconds - Hang Tight...
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{
            background: '#FCEBEB',
            border: '1px solid #F5C6C6',
            borderRadius: 12,
            padding: 20,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>⚠️</div>
            <div style={{ color: '#791F1F', fontSize: 14 }}>{error}</div>
            <button
              className="btn-primary"
              style={{ marginTop: 16, width: 'auto', padding: '10px 24px' }}
              onClick={() => window.location.href = '/onboarding'}
            >
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
                <span style={{ fontSize: 16, fontWeight: 500 }}>Today's matches</span>
                <span style={{ fontSize: 14, color: 'var(--text-sec)', marginLeft: 8 }}>
                  · {jobs.filter(j => j.score >= minScore).length} jobs shown
                </span>
              </div>
              {topPicks.length > 0 && (
                <span className="badge badge-purple">
                  {topPicks.length} top picks
                </span>
              )}
            </div>

            {/* Top picks bar */}
            {topPicks.length > 0 && (
              <div style={{
                background: 'var(--purple-light)',
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--purple-dark)', flexShrink: 0 }}>
                  Top picks
                </span>
                {topPicks.map(job => (
                  <button
                    key={job.id}
                    onClick={() => document.getElementById(`job-${job.id}`)?.scrollIntoView({ behavior: 'smooth' })}
                    style={{
                      background: 'var(--purple)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 20,
                      padding: '4px 12px',
                      fontSize: 11,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {job.company} — {job.title.split(' ').slice(0, 3).join(' ')}
                  </button>
                ))}
              </div>
            )}

            {/* Match score filter */}
<div style={{
  background: 'white',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '14px 18px',
  marginBottom: 16,
}}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
    <div>
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-pri)' }}>
        Minimum match score
      </span>
      <span style={{
        marginLeft: 10, fontSize: 11, fontWeight: 500,
        padding: '2px 8px', borderRadius: 20,
        background: minScore >= 8 ? '#EAF3DE' : minScore >= 7 ? '#EEEDFE' : '#F1EFE8',
        color: minScore >= 8 ? '#27500A' : minScore >= 7 ? '#3C3489' : '#5F5E5A',
      }}>
        {minScore >= 8 ? 'Top picks only' : minScore >= 7 ? 'Strong match' : minScore >= 6 ? 'Good match' : 'Show all'}
      </span>
    </div>
    <span style={{ fontSize: 20, fontWeight: 500, color: 'var(--purple)' }}>
      {minScore}+
    </span>
  </div>
  <input
    type="range"
    min={5}
    max={9}
    step={1}
    value={minScore}
    onChange={e => setMinScore(Number(e.target.value))}
    style={{ width: '100%', accentColor: 'var(--purple)' }}
  />
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-hint)', marginTop: 4 }}>
    <span>Show all</span>
    <span>Good match</span>
    <span>Strong match</span>
    <span>Top picks only</span>
  </div>
  <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 8 }}>
    {jobs.filter(j => j.score >= minScore).length} of {jobs.length} jobs shown
  </div>
</div>
            {/* Empty state */}
            {jobs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-sec)' }}>
                No jobs found. Try updating your profile with a different role.
              </div>
            )}

            {/* Job cards */}
            {jobs.filter(j => j.score >= minScore).map((job) => {
              const sc = scoreColor(job.score)
              return (
                <div
                  key={job.id}
                  id={`job-${job.id}`}
                  className="card"
                  style={{
                    marginBottom: 12,
                    border: job.topPick
                      ? '1.5px solid var(--purple)'
                      : '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>

                    {/* Company logo */}
<div style={{
  width: 40, height: 40, borderRadius: 8,
  background: 'var(--purple-light)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 13, fontWeight: 500, color: 'var(--purple-dark)',
  flexShrink: 0, overflow: 'hidden',
}}>
  {job.logo ? (
    <img
      src={job.logo}
      alt={job.company}
      style={{ width: 40, height: 40, objectFit: 'contain' }}
      onError={e => {
        e.target.style.display = 'none'
        e.target.nextSibling.style.display = 'flex'
      }}
    />
  ) : null}
  <span style={{ display: job.logo ? 'none' : 'flex' }}>
    {job.company.slice(0, 2).toUpperCase()}
  </span>
</div>

                    {/* Job info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                        <span style={{ fontSize: 15, fontWeight: 500 }}>{job.title}</span>
                        {job.topPick && (
                          <span className="badge badge-purple">Top pick</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-sec)', marginBottom: 8 }}>
                        {job.company} · {job.location} {job.salary !== 'Not listed' ? `· ${job.salary}` : ''} · {job.type}
                      </div>

                      {/* GAPS FIRST */}
                      {Array.isArray(job.gaps) && job.gaps.length > 0 && (
                        <div style={{
                          background: '#FAEEDA',
                          borderRadius: 8,
                          padding: '8px 12px',
                          marginBottom: 8,
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 500, color: '#633806', marginBottom: 4 }}>
                            ⚠ Gaps to address
                          </div>
                          {job.gaps.map((gap, i) => (
                            <div key={i} style={{ fontSize: 12, color: '#633806', lineHeight: 1.5 }}>
                              · {gap}
                            </div>
                          ))}
                        </div>
                      )}

                  

                      {/* Strengths */}
                      {Array.isArray(job.strengths) && job.strengths.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          {job.strengths.map((s, i) => (
                            <div key={i} style={{ fontSize: 11, color: '#27500A', lineHeight: 1.5 }}>
                              ✓ {s}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Rubric breakdown */}
                      {job.scores && Object.keys(job.scores).length > 0 && (
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
                          {[
                            ['Role',      job.scores.title],
                            ['Skills',     job.scores.skills],
                            ['Experience', job.scores.experience],
                            ['Location',   job.scores.location],
                            ['Company Fit',    job.scores.culture],
                          ].map(([label, score]) => (
                            <div key={label} style={{
                              fontSize: 10,
                              padding: '2px 8px',
                              borderRadius: 20,
                              background: score >= 8 ? '#EAF3DE' : score >= 6 ? '#FAEEDA' : '#FCEBEB',
                              color:      score >= 8 ? '#27500A' : score >= 6 ? '#633806' : '#791F1F',
                              fontWeight: 500,
                            }}>
                              {label} {score}/10
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Score + button */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: sc.bg, color: sc.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 500,
                      }}>
                        {job.score}
                      </div>
                      {job.score >= 7 ? (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: 'var(--purple)',
                            color: 'white',
                            padding: '6px 14px',
                            borderRadius: 8,
                            fontSize: 12,
                            fontWeight: 500,
                            textDecoration: 'none',
                          }}
                        >
                          Apply →
                        </a>
                      ) : (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            color: 'var(--text-sec)',
                            padding: '6px 14px',
                            borderRadius: 8,
                            fontSize: 12,
                            textDecoration: 'none',
                          }}
                        >
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
              <button
                className="btn-ghost"
                onClick={() => window.location.reload()}
              >
                Refresh feed
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}