'use client'

import { useState, useRef } from 'react'

const PARSE_STEPS = [
  'Reading your resume...',
  'Extracting work experience...',
  'Detecting skills...',
  'Analysing achievements...',
  'Building your profile...',
]

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const YEARS = Array.from({ length: 30 }, (_, k) => new Date().getFullYear() - k)

export default function Step1Resume({ profile, updateProfile, onNext }) {
  const [status, setStatus] = useState('idle')
  const [parseLabel, setParseLabel] = useState(PARSE_STEPS[0])
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState('')
  const [editingExp, setEditingExp] = useState(null)
  const [newSkill, setNewSkill] = useState('')
  const [skillChecking, setSkillChecking] = useState(false)
  const [skillSuggestions, setSkillSuggestions] = useState([])
  const [skillError, setSkillError] = useState('')
  const fileRef = useRef(null)

  async function handleFile(file) {
    if (!file) return
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.')
      return
    }
    setFileName(file.name)
    setStatus('parsing')
    setProgress(0)

    let step = 0
    const interval = setInterval(() => {
      step++
      setProgress(Math.min(step * 18, 85))
      setParseLabel(PARSE_STEPS[Math.min(step, PARSE_STEPS.length - 1)])
    }, 500)

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const res = await fetch('/api/parse-resume', { method: 'POST', body: formData })
      const data = await res.json()

      console.log('Parsed resume data:', data)

      clearInterval(interval)
      setProgress(100)
      setParseLabel('Done!')

      setTimeout(() => {
        updateProfile({
          resumeText: data.rawText || '',
          skills: Array.isArray(data.skills) ? data.skills : [],
          experience: Array.isArray(data.experience) ? data.experience : [],
          name: data.name || '',
          email: data.email || '',
        })
        setStatus('done')
      }, 600)
    } catch (err) {
      clearInterval(interval)
      console.error('Resume parse error:', err)
      setStatus('error')
    }
  }

  function updateExp(i, fields) {
    const updated = [...profile.experience]
    updated[i] = { ...updated[i], ...fields }
    const e = updated[i]
    const start = [e.startMonth, e.startYear].filter(Boolean).join(' ')
    const end = e.endYear === 'Present'
      ? 'Present'
      : [e.endMonth, e.endYear].filter(Boolean).join(' ')
    updated[i].duration = start ? `${start}${end ? ' – ' + end : ''}` : ''
    updateProfile({ experience: updated })
  }

  async function handleAddSkill() {
    const trimmed = newSkill.trim()
    if (!trimmed) return
    if (profile.skills.includes(trimmed)) {
      setSkillError('Already added')
      return
    }

    setSkillChecking(true)
    setSkillSuggestions([])
    setSkillError('')

    try {
      const res = await fetch('/api/suggest-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill: trimmed }),
      })
      const data = await res.json()

      if (data.gibberish) {
        setSkillError("That doesn't look like a skill — try something like \"Python\", \"Project Management\" or \"Figma\"")
      } else if (data.exact) {
        updateProfile({ skills: [...profile.skills, data.normalized || trimmed] })
        setNewSkill('')
      } else if (data.suggestions) {
        setSkillSuggestions(data.suggestions)
      }
    } catch {
      updateProfile({ skills: [...profile.skills, trimmed] })
      setNewSkill('')
    } finally {
      setSkillChecking(false)
    }
  }

  function acceptSuggestion(skill) {
    updateProfile({ skills: [...profile.skills, skill] })
    setSkillSuggestions([])
    setNewSkill('')
    setSkillError('')
  }

  function removeSkill(skill) {
    updateProfile({ skills: profile.skills.filter(s => s !== skill) })
  }

  return (
    <div className="card">
      <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Upload your resume</h2>
      <p style={{ color: 'var(--text-sec)', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
        Our AI will extract your skills, experience and education automatically. PDF only.
      </p>

      {/* Upload zone */}
      <div
        onClick={() => status !== 'parsing' && fileRef.current?.click()}
        style={{
          border: `1.5px dashed ${status === 'done' ? 'var(--teal)' : 'var(--border)'}`,
          borderRadius: 12, padding: '28px 20px', textAlign: 'center',
          background: status === 'done' ? 'var(--teal-light)' : 'var(--bg-secondary)',
          cursor: status === 'parsing' ? 'default' : 'pointer',
          transition: 'all 0.2s', marginBottom: 20,
        }}
      >
        <input ref={fileRef} type="file" accept=".pdf"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])} />

        {status === 'idle' && (
          <>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Drop your resume here</div>
            <div style={{ fontSize: 12, color: 'var(--text-hint)' }}>or click to browse · PDF only</div>
          </>
        )}
        {status === 'parsing' && (
          <>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--purple)', marginBottom: 10 }}>
              {parseLabel}
            </div>
            <div className="progress-track" style={{ maxWidth: 280, margin: '0 auto 6px' }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>{progress}% complete</div>
          </>
        )}
        {status === 'done' && (
          <>
            <div style={{ fontSize: 22, marginBottom: 6 }}>✅</div>
            <div style={{ fontWeight: 500, color: 'var(--teal)', marginBottom: 2 }}>{fileName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>Click to replace</div>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 22, marginBottom: 6 }}>❌</div>
            <div style={{ color: '#791F1F', fontWeight: 500 }}>Something went wrong — try again</div>
          </>
        )}
      </div>

      {/* Parsed results */}
      {status === 'done' && (
        <>
          {/* Experience */}
          {profile.experience.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="field-label" style={{ margin: 0 }}>Work experience detected</label>
                <button
                  onClick={() => updateProfile({
                    experience: [...profile.experience, { title: '', company: '', duration: '', startMonth: '', startYear: '', endMonth: '', endYear: '' }]
                  })}
                  style={{ fontSize: 11, color: 'var(--purple)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}
                >
                  + Add role
                </button>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                {profile.experience.map((exp, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px 14px',
                      borderBottom: i < profile.experience.length - 1 ? '1px solid var(--border)' : 'none',
                      background: editingExp === i ? 'var(--bg-secondary)' : 'white',
                    }}
                  >
                    {editingExp === i ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                        {/* Title */}
                        <input
                          className="input"
                          placeholder="Job title"
                          value={exp.title}
                          onChange={e => updateExp(i, { title: e.target.value })}
                        />

                        {/* Company */}
                        <input
                          className="input"
                          placeholder="Company name"
                          value={exp.company}
                          onChange={e => updateExp(i, { company: e.target.value })}
                        />

                        {/* Start date */}
                        <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>Start date</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          <select className="input" value={exp.startMonth || ''}
                            onChange={e => updateExp(i, { startMonth: e.target.value })}>
                            <option value="">Month</option>
                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                          <select className="input" value={exp.startYear || ''}
                            onChange={e => updateExp(i, { startYear: e.target.value })}>
                            <option value="">Year</option>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>

                        {/* End date */}
                        <div style={{ fontSize: 11, color: 'var(--text-hint)' }}>End date</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                          <select className="input" value={exp.endMonth || ''}
                            onChange={e => updateExp(i, { endMonth: e.target.value })}>
                            <option value="">Month</option>
                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                          <select className="input" value={exp.endYear || ''}
                            onChange={e => updateExp(i, { endYear: e.target.value })}>
                            <option value="">Year / Present</option>
                            <option value="Present">Present</option>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              updateProfile({ experience: profile.experience.filter((_, idx) => idx !== i) })
                              setEditingExp(null)
                            }}
                            style={{ fontSize: 12, color: '#791F1F', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                          >Delete</button>
                          <button
                            onClick={() => setEditingExp(null)}
                            style={{ fontSize: 12, color: 'var(--purple)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}
                          >Done ✓</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{exp.title || 'Untitled role'}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>
                            {exp.company}{exp.duration ? ` · ${exp.duration}` : ''}
                          </div>
                        </div>
                        <button
                          onClick={() => setEditingExp(i)}
                          style={{ fontSize: 11, color: 'var(--text-hint)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px', borderRadius: 6 }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >Edit</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="field-label" style={{ margin: 0 }}>Skills detected</label>
              <span className="badge badge-green">✓ Parsed</span>
            </div>

            {/* Skill chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 10 }}>
              {profile.skills.map(skill => (
                <span key={skill} className="chip">
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--purple-dark)', fontSize: 13, padding: 0, lineHeight: 1 }}
                  >×</button>
                </span>
              ))}
            </div>

            {/* Add skill input */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder="Type a skill to add..."
                value={newSkill}
                onChange={e => {
                  setNewSkill(e.target.value)
                  setSkillError('')
                  setSkillSuggestions([])
                }}
                onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                style={{ flex: 1 }}
              />
              <button
                className="btn-ghost"
                onClick={handleAddSkill}
                disabled={!newSkill.trim() || skillChecking}
                style={{ whiteSpace: 'nowrap', width: 'auto', padding: '0 16px', opacity: skillChecking ? 0.6 : 1 }}
              >
                {skillChecking ? '...' : '+ Add'}
              </button>
            </div>

            {/* Error */}
            {skillError && (
              <div style={{ fontSize: 12, color: '#791F1F', marginTop: 6, background: '#FCEBEB', padding: '6px 10px', borderRadius: 6 }}>
                {skillError}
              </div>
            )}

            {/* Suggestions */}
            {skillSuggestions.length > 0 && (
              <div style={{ marginTop: 8, background: '#EEEDFE', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--purple-dark)', marginBottom: 6 }}>
                  Did you mean one of these?
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {skillSuggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => acceptSuggestion(s)}
                      style={{
                        padding: '4px 12px', borderRadius: 20,
                        background: 'white', border: '1px solid #C5C0F0',
                        fontSize: 12, color: 'var(--purple-dark)',
                        cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    updateProfile({ skills: [...profile.skills, newSkill.trim()] })
                    setNewSkill('')
                    setSkillSuggestions([])
                  }}
                  style={{ fontSize: 11, color: 'var(--text-hint)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginTop: 6, textDecoration: 'underline' }}
                >
                  Add "{newSkill}" anyway
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <button className="btn-primary" onClick={onNext} disabled={status !== 'done'}>
        Continue →
      </button>
      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-hint)', marginTop: 10 }}>
        Your resume is only used to match and tailor applications. Never shared.
      </p>
    </div>
  )
}