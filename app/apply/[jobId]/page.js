'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

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
  const body = paras.map(function(p) { return '<p>' + p.replace(/\n/g, '<br>') + '</p>' }).join('')
  return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>' + css + '</style></head><body>' +
    '<div class="header"><div class="cl-name">' + (name || '') + '</div>' +
    '<div class="contact-info">' + contactLine + '</div></div>' +
    '<p class="date">' + today + '</p>' +
    body + '</body></html>'
}

function openPDF(htmlContent) {
  const win = window.open('', '_blank')
  win.document.write(htmlContent)
  win.document.close()
  setTimeout(function() { win.print() }, 800)
}

const FONT_SIZES = [8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24]

function EditorToolbar({ docRef, onRevert }) {
  function exec(cmd, val) {
    const doc = docRef.current
    if (!doc) return
    doc.execCommand(cmd, false, val || null)
    doc.body.focus()
  }

  function applyFontSize(size) {
    const doc = docRef.current
    if (!doc) return
    doc.execCommand('fontSize', false, '7')
    const fontEls = doc.querySelectorAll('font[size="7"]')
    fontEls.forEach(function(f) {
      f.removeAttribute('size')
      f.style.fontSize = size + 'px'
    })
    doc.body.focus()
  }

  const btnStyle = {
    background: 'white',
    border: '1px solid #d0d0d0',
    borderRadius: 5,
    padding: '2px 9px',
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'inherit',
    color: '#1a1a2e',
    height: 24,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 28,
  }

  const divider = (
    <div style={{ width: 1, height: 18, background: '#d0d0d0', margin: '0 2px' }} />
  )

  return (
    <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', background: '#f8f8f8', display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
      <button style={{ ...btnStyle, fontWeight: 'bold' }} title="Bold (Ctrl+B)" onClick={function() { exec('bold') }}>B</button>
      <button style={{ ...btnStyle, fontStyle: 'italic' }} title="Italic (Ctrl+I)" onClick={function() { exec('italic') }}>I</button>
      <button style={{ ...btnStyle, textDecoration: 'underline' }} title="Underline (Ctrl+U)" onClick={function() { exec('underline') }}>U</button>
      {divider}
      <select
        title="Font size"
        onChange={function(e) { applyFontSize(e.target.value) }}
        defaultValue=""
        style={{ height: 24, fontSize: 11, border: '1px solid #d0d0d0', borderRadius: 5, fontFamily: 'inherit', background: 'white', cursor: 'pointer', paddingLeft: 4 }}
      >
        <option value="" disabled>Size</option>
        {FONT_SIZES.map(function(s) { return <option key={s} value={s}>{s}px</option> })}
      </select>
      {divider}
      <button style={btnStyle} title="Bullet list" onClick={function() { exec('insertUnorderedList') }}>• List</button>
      <button style={btnStyle} title="Numbered list" onClick={function() { exec('insertOrderedList') }}>1. List</button>
      {divider}
      <button style={btnStyle} title="Undo (Ctrl+Z)" onClick={function() { exec('undo') }}>↩ Undo</button>
      <button style={btnStyle} title="Redo (Ctrl+Y)" onClick={function() { exec('redo') }}>↪ Redo</button>
      {divider}
      <button
        title="Revert to original"
        onClick={onRevert}
        style={{ ...btnStyle, background: '#FCEBEB', color: '#791F1F', border: '1px solid #f5c6c6' }}
      >
        ↺ Revert
      </button>
      <span style={{ fontSize: 10, color: '#999', marginLeft: 2 }}>Select text first</span>
    </div>
  )
}

function EditableIframe({ srcDoc, editMode, iframeRef, docRef }) {
  useEffect(function() {
    if (!editMode) return
    const iframe = iframeRef.current
    if (!iframe) return

    function init() {
      const doc = iframe.contentDocument || iframe.contentWindow.document
      docRef.current = doc
      doc.body.contentEditable = 'true'
      doc.body.style.outline = 'none'
      doc.body.style.cursor = 'text'
      doc.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
          if (e.key === 'b') { e.preventDefault(); doc.execCommand('bold') }
          if (e.key === 'i') { e.preventDefault(); doc.execCommand('italic') }
          if (e.key === 'u') { e.preventDefault(); doc.execCommand('underline') }
          if (e.key === 'z') { e.preventDefault(); doc.execCommand('undo') }
          if (e.key === 'y') { e.preventDefault(); doc.execCommand('redo') }
        }
      })
      doc.body.focus()
    }

    if (iframe.contentDocument && iframe.contentDocument.body) {
      init()
    } else {
      iframe.onload = init
    }
  }, [editMode, srcDoc])

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcDoc}
      style={{
        flex: 1,
        border: 'none',
        width: '100%',
        minHeight: 620,
        outline: 'none',
      }}
      title="Document Preview"
    />
  )
}

export default function ApplyPage() {
  const { jobId } = useParams()
  const router = useRouter()

  const [job, setJob] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [resumeHTML, setResumeHTML] = useState('')
  const [originalResumeHTML, setOriginalResumeHTML] = useState('')
  const [coverHTML, setCoverHTML] = useState('')
  const [originalCoverHTML, setOriginalCoverHTML] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [error, setError] = useState('')
  const [resumeEditMode, setResumeEditMode] = useState(false)
  const [coverEditMode, setCoverEditMode] = useState(false)

  const resumeIframeRef = useRef(null)
  const resumeDocRef = useRef(null)
  const coverIframeRef = useRef(null)
  const coverDocRef = useRef(null)

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
    setResumeHTML('')
    setOriginalResumeHTML('')
    setCoverHTML('')
    setOriginalCoverHTML('')
    setCoverLetter('')
    setResumeEditMode(false)
    setCoverEditMode(false)
    try {
      const res = await fetch('/api/generate-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job: j || job, profile: p || profile }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setResumeHTML(data.resumeHTML || '')
      setOriginalResumeHTML(data.resumeHTML || '')
      setCoverLetter(data.coverLetter || '')
      const ch = buildCoverLetterHTML(data.coverLetter || '', p ? p.name : profile && profile.name, p ? p.resume_text : profile && profile.resume_text)
      setCoverHTML(ch)
      setOriginalCoverHTML(ch)
    } catch(e) {
      setError('Failed to generate')
    } finally {
      setGenerating(false)
    }
  }

  function saveAndExitResume() {
    const iframe = resumeIframeRef.current
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow.document
      setResumeHTML(doc.documentElement.outerHTML)
      doc.body.contentEditable = 'false'
    }
    setResumeEditMode(false)
  }

  function saveAndExitCover() {
    const iframe = coverIframeRef.current
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow.document
      setCoverHTML(doc.documentElement.outerHTML)
      doc.body.contentEditable = 'false'
    }
    setCoverEditMode(false)
  }

 function revertResume() {
  const iframe = resumeIframeRef.current
  if (iframe) {
    const doc = iframe.contentDocument || iframe.contentWindow.document
    doc.open()
    doc.write(originalResumeHTML)
    doc.close()
    doc.body.contentEditable = 'true'
    doc.body.style.outline = 'none'
    doc.body.style.cursor = 'text'
    resumeDocRef.current = doc
  }
}

function revertCover() {
  const iframe = coverIframeRef.current
  if (iframe) {
    const doc = iframe.contentDocument || iframe.contentWindow.document
    doc.open()
    doc.write(originalCoverHTML)
    doc.close()
    doc.body.contentEditable = 'true'
    doc.body.style.outline = 'none'
    doc.body.style.cursor = 'text'
    coverDocRef.current = doc
  }
}

  function downloadResumePDF() {
    const iframe = resumeIframeRef.current
    if (iframe && resumeEditMode) {
      const doc = iframe.contentDocument || iframe.contentWindow.document
      openPDF(doc.documentElement.outerHTML)
    } else {
      openPDF(resumeHTML)
    }
  }

  function downloadCoverPDF() {
    const iframe = coverIframeRef.current
    if (iframe && coverEditMode) {
      const doc = iframe.contentDocument || iframe.contentWindow.document
      openPDF(doc.documentElement.outerHTML)
    } else {
      openPDF(coverHTML)
    }
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

  const panelHeaderStyle = {
    padding: '10px 16px',
    borderBottom: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }

  const editBtnStyle = {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: 100,
    padding: '5px 14px',
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'inherit',
    color: 'var(--text-sec)',
  }

  const doneBtnStyle = {
    background: '#EAF3DE',
    border: 'none',
    borderRadius: 100,
    padding: '5px 14px',
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'inherit',
    color: '#27500A',
    fontWeight: 500,
  }

  const downloadBtnStyle = {
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    borderRadius: 100,
    padding: '5px 14px',
    fontSize: 11,
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: 500,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>

      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={function() { router.push('/feed') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-sec)', fontSize: 13, fontFamily: 'inherit' }}>Back</button>
          <a href="/" style={{ fontFamily: 'Ubuntu, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>🐦 Robin</a>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={function() { generate() }} disabled={generating} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 100, padding: '6px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', opacity: generating ? 0.5 : 1, color: 'var(--text-sec)' }}>
            {generating ? 'Generating...' : 'Regenerate'}
          </button>
          <a href={job && job.url} target="_blank" rel="noopener noreferrer" style={{ background: 'var(--accent)', color: 'white', padding: '8px 20px', borderRadius: 100, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
            Open Application
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '20px 16px' }}>

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
            <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>Matching your experience to the job and writing your cover letter. About 20 seconds.</div>
          </div>
        )}

        {!generating && (resumeHTML || coverHTML) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* RESUME PANEL */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
              <div style={panelHeaderStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Tailored Resume</span>
                  <span style={{ fontSize: 11, background: 'var(--accent-light)', color: 'var(--accent-dark)', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>Ready to send</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!resumeEditMode
                    ? <button style={editBtnStyle} onClick={function() { setResumeEditMode(true) }}>Edit</button>
                    : <button style={doneBtnStyle} onClick={saveAndExitResume}>Done Editing</button>
                  }
                  <button style={downloadBtnStyle} onClick={downloadResumePDF}>Download PDF</button>
                </div>
              </div>
              {resumeEditMode && (
                <EditorToolbar docRef={resumeDocRef} onRevert={revertResume} />
              )}
              <EditableIframe
                srcDoc={resumeHTML}
                editMode={resumeEditMode}
                iframeRef={resumeIframeRef}
                docRef={resumeDocRef}
              />
            </div>

            {/* COVER LETTER PANEL */}
            <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-sm)' }}>
              <div style={panelHeaderStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Cover Letter</span>
                  <span style={{ fontSize: 11, background: 'var(--accent-light)', color: 'var(--accent-dark)', padding: '2px 8px', borderRadius: 20, fontWeight: 500 }}>Generated</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!coverEditMode
                    ? <button style={editBtnStyle} onClick={function() { setCoverEditMode(true) }}>Edit</button>
                    : <button style={doneBtnStyle} onClick={saveAndExitCover}>Done Editing</button>
                  }
                  <button style={downloadBtnStyle} onClick={downloadCoverPDF}>Download PDF</button>
                </div>
              </div>
              {coverEditMode && (
                <EditorToolbar docRef={coverDocRef} onRevert={revertCover} />
              )}
              <EditableIframe
                srcDoc={coverHTML}
                editMode={coverEditMode}
                iframeRef={coverIframeRef}
                docRef={coverDocRef}
              />
            </div>

          </div>
        )}

        {!generating && (resumeHTML || coverHTML) && (
          <div style={{ marginTop: 20, textAlign: 'center', paddingBottom: 40 }}>
            <a href={job && job.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: 'var(--accent)', color: 'white', padding: '14px 48px', borderRadius: 100, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Confirm and Open Application
            </a>
            <div style={{ fontSize: 11, color: 'var(--text-hint)', marginTop: 8 }}>Opens the job application in a new tab</div>
          </div>
        )}

      </div>
    </div>
  )
}
