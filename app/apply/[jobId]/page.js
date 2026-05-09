'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

function buildResumeHTML(resumeText) {
  const css = [
    '*{box-sizing:border-box;margin:0;padding:0}',
    'body{font-family:Arial,sans-serif;font-size:10.5pt;line-height:1.35;color:#000;max-width:750px;margin:0 auto;padding:20px 44px}',
    'h1{font-size:14.5pt;font-weight:bold;margin:0 0 2px}',
    '.contact{font-size:10pt;color:#000;margin-bottom:6px;padding-bottom:5px;border-bottom:1.5px solid #000}',
    'h2{font-size:10pt;font-weight:bold;text-transform:uppercase;border-bottom:1px solid #000;padding-bottom:1px;margin:7px 0 3px;letter-spacing:0.5px}',
    '.employer{font-weight:bold;font-style:normal;font-size:10pt;margin:4px 0 0}',
    '.role-line{display:flex;justify-content:space-between;align-items:baseline;margin:1px 0 2px}',
    '.role-title{font-weight:normal;font-style:normal;font-size:10pt}',
    '.role-date{font-size:10pt;font-weight:normal;font-style:normal}',
    'ul{margin:1px 0 3px 0;padding:0;list-style:none}',
    'li{font-size:10pt;line-height:1.35;text-align:justify;padding-left:12px;position:relative;margin-bottom:1px}',
    'li:before{content:"\\2022";position:absolute;left:2px}',
    '.skills-line{font-size:10pt;margin:2px 0 3px;line-height:1.35}',
    'p{margin:2px 0;font-size:10pt;line-height:1.35;text-align:justify}',
    '@media print{',
    'html,body{height:100%}',
    'body{padding:12px 32px;font-size:9.5pt}',
    'h1{font-size:13pt;margin-bottom:1px}',
    '.contact{font-size:9pt;margin-bottom:4px;padding-bottom:4px}',
    'h2{font-size:9pt;margin:5px 0 2px;padding-bottom:1px}',
    '.employer{font-size:9pt;margin:3px 0 0}',
    '.role-title{font-size:9pt}',
    '.role-date{font-size:9pt}',
    'li{font-size:9pt;line-height:1.3;margin-bottom:0}',
    '.skills-line{font-size:9pt;margin:1px 0 2px}',
    'p{font-size:9pt;line-height:1.3;margin:1px 0}',
    'ul{margin:1px 0 2px 0}',
    '@page{margin:0.3cm;size:letter}',
    '}',
  ].join('')

  const rawLines = resumeText.split('\n')
  const nameFromResume = rawLines[0] ? rawLines[0].trim() : ''
  const contactFromResume = rawLines[1] ? rawLines[1].trim() : ''

  let startIdx = 0
  if (nameFromResume && !nameFromResume.includes('@') && !nameFromResume.includes('|')) {
    startIdx = 1
    if (contactFromResume && (contactFromResume.includes('|') || contactFromResume.includes('@') || contactFromResume.toLowerCase().includes('linkedin'))) {
      startIdx = 2
    }
  }

  const lines = rawLines.slice(startIdx)
  const SECTION_HEADERS = [
    'SUMMARY', 'EDUCATION', 'SKILLS', 'EXPERIENCE',
    'COMMUNITY AND LEADERSHIP', 'LEADERSHIP AND COMMUNITY',
    'PROFESSIONAL EXPERIENCE', 'WORK HISTORY',
    'ACHIEVEMENTS', 'CERTIFICATIONS', 'PROJECTS',
    'INTERESTS', 'ADDITIONAL', 'PROFILE',
    'PROFESSIONAL EXPERIENCE AND ENTREPRENEURSHIP',
    'ADDITIONAL VOLUNTEER EXPERIENCE AND INTERESTS'
  ]

  let html = ''
  let inList = false
  let currentSection = ''
  let inSkills = false

  const UL_OPEN = '<ul>'
  const UL_CLOSE = '</ul>'
  const LI_OPEN = '<li>'
  const LI_CLOSE = '</li>'
  const H2_OPEN = '<h2>'
  const H2_CLOSE = '</h2>'

  for (const line of lines) {
    const t = line.trim()
    if (!t) {
      if (inList) { html += UL_CLOSE; inList = false }
      inSkills = false
      continue
    }

    const upperT = t.toUpperCase()
    const isHeader = SECTION_HEADERS.some(function(h) { return upperT === h || upperT.startsWith(h + ':') }) && t.length < 70 && !t.startsWith('-')
    const isBullet = t.startsWith('-') || t.startsWith('\u2022') || t.startsWith('\u00b7')
    const hasPipe = t.includes(' | ')
    const hasYear = /\d{4}/.test(t)

    if (inList && !isBullet) { html += UL_CLOSE; inList = false }

    if (isHeader) {
      currentSection = upperT.split(':')[0].trim()
      inSkills = currentSection === 'SKILLS'
      html += H2_OPEN + t.toUpperCase() + H2_CLOSE
    } else if (inSkills && !isBullet) {
      html += '<p class="skills-line">' + t + '</p>'
    } else if (isBullet) {
      if (!inList) { html += UL_OPEN; inList = true }
      html += LI_OPEN + t.replace(/^[-\u2022\u00b7]\s*/, '') + LI_CLOSE
    } else if (hasPipe) {
      const parts = t.split('|').map(function(s) { return s.trim() })
      if (hasYear) {
        html += '<div class="role-line"><span class="role-title">' + parts[0] + '</span><span class="role-date">' + (parts[1] || '') + '</span></div>'
      } else {
        html += '<div class="employer">' + parts[0] + (parts[1] ? ', ' + parts[1] : '') + '</div>'
      }
    } else if (hasYear && (currentSection === 'EXPERIENCE' || currentSection === 'PROFESSIONAL EXPERIENCE' || currentSection === 'PROFESSIONAL EXPERIENCE AND ENTREPRENEURSHIP' || currentSection === 'EDUCATION')) {
      const match = t.match(/^(.+?)\s{2,}(\d{4}.*)$/) || t.match(/^(.+),\s*(\d{4}.*)$/)
      if (match) {
        html += '<div class="role-line"><span class="role-title">' + match[1].trim() + '</span><span class="role-date">' + match[2].trim() + '</span></div>'
      } else {
        html += '<div class="employer">' + t + '</div>'
      }
    } else {
      html += '<p>' + t + '</p>'
    }
  }
  if (inList) html += UL_CLOSE

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>' + css + '</style></head><body>' +
    '<h1>' + nameFromResume + '</h1>' +
    '<div class="contact">' + contactFromResume + '</div>' +
    html + '</body></html>'
}

function buildCoverLetterHTML(text, name, resumeText) {
  const lines = (resumeText || '').split('\n')
  const contactLine = lines[1] ? lines[1].trim() : ''

  const css = [
    'body{font-family:Arial,sans-serif;font-size:10pt;line-height:1.6;color:#000;max-width:700px;margin:0 auto;padding:48px;text-align:justify}',
    '.header{margin-bottom:20px;padding-bottom:8px;border-bottom:1px solid #000}',
    '.cl-name{font-weight:bold;font-size:11pt}',
    '.contact-info{font-size:9pt;color:#333;margin-top:2px}',
    'p{margin-bottom:14px;text-align:justify}',
    '.date{margin-bottom:20px;margin-top:16px;font-size:10pt}',
    '@media print{body{padding:36px}@page{margin:0.5cm;size:letter}}',
  ].join('')

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const paras = text.split('\n\n').map(function(p) { return p.trim() }).filter(Boolean)
  const BR = '<br>'
  const body = paras.map(function(p) { return '<p>' + p.replace(/\n/g, BR) + '</p>' }).join('')

  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>' + css + '</style></head><body>' +
    '<div class="header"><div class="cl-name">' + (name || '') + '</div>' +
    '<div class="contact-info">' + contactLine + '</div></div>' +
    '<p class="date">' + today + '</p>' +
    body +
    '</body></html>'
}

function removeSectionByKeyword(win, keyword) {
  const allH2 = win.document.querySelectorAll('h2')
  let targetHeader = null
  allH2.forEach(function(h) {
    if (h.textContent.toUpperCase().includes(keyword)) targetHeader = h
  })
  if (!targetHeader) return
  const toRemove = [targetHeader]
  let node = targetHeader.nextSibling
  while (node) {
    if (node.tagName === 'H2') break
    toRemove.push(node)
    node = node.nextSibling
  }
  toRemove.forEach(function(n) { if (n.parentNode) n.parentNode.removeChild(n) })
}

export default function ApplyPage() {
  const { jobId } = useParams()
  const router = useRouter()

  const [job, setJob] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [resume, setResume] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [error, setError] = useState('')

  useEffect(function() {
    async function load() {
      try {
        const sessionId = localStorage.getItem('applyai_session')
        if (!sessionId) { router.push('/onboarding'); return }
        const res = await fetch('/api/get-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, jobId: decodeURIComponent(jobId) }),
        })
        const data = await res.json()
        if (data.error) { setError(data.error); setLoading(false); return }
        setJob(data.job)
        setProfile(data.profile)
        setLoading(false)
        generate(data.job, data.profile)
      } catch(e) {
        setError('Failed to load job')
        setLoading(false)
      }
    }
    load()
  }, [jobId])

  async function generate(j, p) {
    setGenerating(true)
    setResume('')
    setCoverLetter('')
    try {
      const res = await fetch('/api/generate-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job: j || job, profile: p || profile }),
      })
      const data = await res.json()
      setResume(data.resume || '')
      setCoverLetter(data.coverLetter || '')
    } catch(e) {
      setError('Failed to generate')
    } finally {
      setGenerating(false)
    }
  }

  function downloadPDF(htmlContent) {
    const win = window.open('', '_blank')
    win.document.write(htmlContent)
    win.document.close()
    setTimeout(function() {
      const body = win.document.body
      const pageH = win.screen.height
      if (body.scrollHeight > pageH) {
        removeSectionByKeyword(win, 'COMMUNITY')
        removeSectionByKeyword(win, 'LEADERSHIP')
      }
      if (body.scrollHeight > pageH) {
        removeSectionByKeyword(win, 'SKILLS')
      }
      win.print()
    }, 800)
  }

  function scoreColor(score) {
    if (score >= 8) return { bg: '#EAF3DE', color: '#27500A' }
    if (score >= 6) return { bg: '#FAEEDA', color: '#633806' }
    return { bg: '#FCEBEB', color: '#791F1F' }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>⏳</div>
        <div style={{ fontSize: 14, color: 'var(--text-sec)' }}>Loading...</div>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#791F1F', textAlign: 'center' }}>{error}</div>
    </div>
  )

  const sc = job ? scoreColor(job.score) : {}
  const resumeHTML = resume ? buildResumeHTML(resume) : ''
  const coverHTML = coverLetter ? buildCoverLetterHTML(coverLetter, profile && profile.name, profile && profile.resume_text) : ''

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>

      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={function() { router.push('/feed') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sec)', fontSize: 13, fontFamily: 'inherit' }}>
            Back
          </button>
          <a href="/" style={{ fontFamily: 'Ubuntu, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>
            🐦 Robin
          </a>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={function() { generate() }}
            disabled={generating}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 100, padding: '6px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', opacity: generating ? 0.5 : 1, color: 'var(--text-sec)' }}
          >
            {generating ? 'Generating...' : 'Regenerate'}
          </button>
          <a
            href={job && job.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: 'var(--accent)', color: 'white', padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}
          >
            Open Application
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px' }}>

        {job && (
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {job.logo
                ? <img src={job.logo} alt={job.company} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'contain', border: '1px solid var(--border)' }} />
                : <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--accent-dark)' }}>{(job.company || 'JO').slice(0, 2).toUpperCase()}</div>
              }
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>Applying to {job.company}</div>
                <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 2 }}>{job.title} · {job.location}{job.salary !== 'Not listed' ? ' · ' + job.salary : ''}</div>
              </div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: sc.bg, color: sc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>{job.score}</div>
          </div>
        )}

        {generating && (
          <div style={{ background: 'var(--accent-light)', borderRadius: 16, padding: '20px', marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent-dark)', marginBottom: 4 }}>Tailoring your application...</div>
            <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>Matching your experience to the job description and writing your cover letter. About 20 seconds.</div>
          </div>
        )}

        {!generating && (resume || coverLetter) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Tailored Resume</span>
                  <span style={{ marginLeft: 8, fontSize: 11, background: 'var(--accent-light)', color: 'var(--accent-dark)', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>Ready to send</span>
                </div>
                <button onClick={function() { downloadPDF(resumeHTML) }} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 100, padding: '6px 14px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Download PDF</button>
              </div>
              <textarea value={resume} onChange={function(e) { setResume(e.target.value) }} style={{ flex: 1, border: 'none', outline: 'none', padding: '16px', fontSize: 11, lineHeight: 1.6, fontFamily: 'Arial, sans-serif', resize: 'none', minHeight: 620, background: 'white', boxSizing: 'border-box', width: '100%' }} />
            </div>

            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Cover Letter</span>
                  <span style={{ marginLeft: 8, fontSize: 11, background: 'var(--accent-light)', color: 'var(--accent-dark)', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>Generated</span>
                </div>
                <button onClick={function() { downloadPDF(coverHTML) }} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 100, padding: '6px 14px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Download PDF</button>
              </div>
              <textarea value={coverLetter} onChange={function(e) { setCoverLetter(e.target.value) }} style={{ flex: 1, border: 'none', outline: 'none', padding: '16px', fontSize: 11, lineHeight: 1.6, fontFamily: 'Arial, sans-serif', resize: 'none', minHeight: 620, background: 'white', boxSizing: 'border-box', width: '100%' }} />
            </div>

          </div>
        )}

        {!generating && (resume || coverLetter) && (
          <div style={{ marginTop: 20, textAlign: 'center', paddingBottom: 40 }}>
            <a
              href={job && job.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', background: 'var(--accent)', color: 'white', padding: '14px 48px', borderRadius: 100, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}
            >
              Confirm and Open Application
            </a>
            <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 8 }}>Opens the job application in a new tab</div>
          </div>
        )}

      </div>
    </div>
  )
}
