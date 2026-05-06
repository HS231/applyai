'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    // Reveal animation
    const reveals = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80)
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })
    reveals.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --white: #ffffff;
          --bg: #f6f7f8;
          --text: #1a1a2e;
          --text-mid: #4a4a5a;
          --text-muted: #8a8a9a;
          --accent: #6b5ce7;
          --accent2: #4ecdc4;
          --green: #00c47a;
          --border: rgba(0,0,0,0.07);
          --shadow: 0 2px 8px rgba(0,0,0,0.06), 0 16px 48px rgba(0,0,0,0.08);
        }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; font-weight: 400; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

        /* HEADER */
        .rbn-header { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 48px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
        .rbn-logo { font-family: 'Ubuntu', sans-serif; font-size: 20px; font-weight: 700; color: white; text-decoration: none; display: flex; align-items: center; gap: 8px; }
        .rbn-nav { display: flex; align-items: center; gap: 32px; list-style: none; }
        .rbn-nav a { font-size: 14px; color: rgba(255,255,255,0.75); text-decoration: none; transition: color 0.15s; }
        .rbn-nav a:hover { color: white; }
        .rbn-header-actions { display: flex; align-items: center; gap: 10px; }

        /* BUTTONS */
        .btn { display: inline-flex; align-items: center; padding: 9px 20px; border-radius: 100px; font-size: 14px; font-weight: 500; font-family: 'Inter', sans-serif; text-decoration: none; transition: all 0.15s; cursor: pointer; border: none; }
        .btn-ghost-white { background: rgba(255,255,255,0.15); color: white; border: 1px solid rgba(255,255,255,0.25); }
        .btn-ghost-white:hover { background: rgba(255,255,255,0.25); }
        .btn-white { background: white; color: var(--text); }
        .btn-white:hover { background: rgba(255,255,255,0.9); }
        .btn-filled { background: var(--accent); color: white; }
        .btn-filled:hover { background: #5a4dd6; }
        .btn-lg { padding: 14px 28px; font-size: 15px; border-radius: 100px; }
        .btn-outline-dark { background: transparent; color: var(--text); border: 1.5px solid rgba(0,0,0,0.15); border-radius: 100px; }
        .btn-outline-dark:hover { border-color: var(--text); }

        /* HERO */
        .rbn-hero { min-height: 100vh; background: linear-gradient(135deg, #c8b8f8 0%, #a78bfa 25%, #7c6be8 45%, #4ecdc4 75%, #81e6d9 100%); position: relative; overflow: hidden; display: flex; align-items: center; padding: 80px 48px 60px; }
        .rbn-hero::before { content: ''; position: absolute; bottom: -100px; left: -100px; width: 500px; height: 500px; background: rgba(255,255,255,0.08); border-radius: 50%; pointer-events: none; }
        .rbn-hero::after { content: ''; position: absolute; top: -80px; right: 30%; width: 300px; height: 300px; background: rgba(255,255,255,0.06); border-radius: 50%; pointer-events: none; }
        .rbn-hero-inner { max-width: 1280px; margin: 0 auto; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; position: relative; z-index: 2; }
        .rbn-hero-left h1 { font-family: 'Ubuntu', sans-serif; font-size: clamp(42px, 5.5vw, 72px); font-weight: 700; line-height: 1.08; letter-spacing: -0.03em; color: var(--text); margin-bottom: 20px; }
        .rbn-hero-left p { font-size: 16px; color: rgba(26,26,46,0.7); line-height: 1.65; max-width: 400px; margin-bottom: 36px; font-weight: 400; }
        .rbn-hero-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

        /* HERO CARD */
        .rbn-hero-card { background: white; border-radius: 16px; box-shadow: var(--shadow); overflow: hidden; }
        .rbn-card-header { padding: 20px 24px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .rbn-card-title { font-size: 15px; font-weight: 600; color: var(--text); }
        .rbn-card-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 500; color: var(--green); background: rgba(0,196,122,0.1); padding: 3px 10px; border-radius: 20px; }
        .rbn-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--green); animation: pulse 2s ease infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .rbn-card-body { padding: 20px 24px; }
        .rbn-skill-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
        .rbn-skill-tag { padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; background: #f0f0f8; color: var(--text-mid); }
        .rbn-skill-tag.active { background: rgba(107,92,231,0.1); color: var(--accent); }
        .rbn-card-divider { height: 1px; background: var(--border); margin: 16px 0; }
        .rbn-match-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.04); }
        .rbn-match-row:last-child { border-bottom: none; }
        .rbn-match-info { flex: 1; }
        .rbn-match-title { font-size: 13px; font-weight: 500; color: var(--text); }
        .rbn-match-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
        .rbn-match-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; margin-left: 16px; }
        .rbn-match-score { font-size: 13px; font-weight: 600; color: var(--accent); }
        .rbn-match-bar-wrap { width: 60px; height: 3px; background: rgba(107,92,231,0.15); border-radius: 2px; overflow: hidden; }
        .rbn-match-bar { height: 100%; background: var(--accent); border-radius: 2px; }

        /* MARQUEE */
        .rbn-marquee { overflow: hidden; background: white; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 16px 0; }
        .rbn-marquee-track { display: flex; width: max-content; animation: marquee 28s linear infinite; }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .rbn-marquee-item { display: flex; align-items: center; gap: 24px; padding: 0 24px; font-size: 14px; font-weight: 500; color: var(--text-mid); white-space: nowrap; }
        .rbn-marquee-sep { width: 4px; height: 4px; border-radius: 50%; background: var(--accent); opacity: 0.4; }

        /* HOW IT WORKS */
        .rbn-how { padding: 96px 48px; }
        .rbn-how-inner { max-width: 1280px; margin: 0 auto; }
        .rbn-section-label { font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
        .rbn-section-title { font-family: 'Ubuntu', sans-serif; font-size: clamp(28px, 3.5vw, 44px); font-weight: 700; line-height: 1.15; letter-spacing: -0.02em; color: var(--text); margin-bottom: 16px; }
        .rbn-section-sub { font-size: 16px; color: var(--text-mid); line-height: 1.6; max-width: 520px; margin-bottom: 56px; }
        .rbn-steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .rbn-step-card { background: white; border-radius: 16px; padding: 28px 24px; border: 1px solid var(--border); position: relative; }
        .rbn-step-num { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: var(--accent); opacity: 0.5; margin-bottom: 16px; }
        .rbn-step-icon { font-size: 28px; display: block; margin-bottom: 14px; }
        .rbn-step-title { font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
        .rbn-step-desc { font-size: 14px; color: var(--text-mid); line-height: 1.6; }

        /* FEATURES */
        .rbn-features { padding: 96px 48px; max-width: 1280px; margin: 0 auto; }
        .rbn-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .rbn-feature-card { background: white; border-radius: 16px; padding: 28px 24px; border: 1px solid var(--border); }
        .rbn-feature-icon { font-size: 28px; margin-bottom: 14px; display: block; }
        .rbn-feature-title { font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
        .rbn-feature-desc { font-size: 14px; color: var(--text-mid); line-height: 1.6; }

        /* CTA */
        .rbn-cta { background: linear-gradient(135deg, #7c6be8 0%, #4ecdc4 100%); padding: 96px 48px; text-align: center; position: relative; overflow: hidden; }
        .rbn-cta::before { content: ''; position: absolute; top: -80px; left: -80px; width: 400px; height: 400px; background: rgba(255,255,255,0.06); border-radius: 50%; }
        .rbn-cta::after { content: ''; position: absolute; bottom: -100px; right: -60px; width: 350px; height: 350px; background: rgba(255,255,255,0.06); border-radius: 50%; }
        .rbn-cta h2 { font-family: 'Ubuntu', sans-serif; font-size: clamp(32px, 4vw, 52px); font-weight: 700; color: var(--text); margin-bottom: 16px; letter-spacing: -0.02em; position: relative; }
        .rbn-cta p { font-size: 16px; color: rgba(26,26,46,0.65); margin-bottom: 36px; position: relative; }
        .rbn-cta-actions { display: flex; align-items: center; gap: 12px; justify-content: center; position: relative; }
        .rbn-cta-note { margin-top: 16px; font-size: 13px; color: rgba(26,26,46,0.5); position: relative; }

        /* FOOTER */
        .rbn-footer { background: #111317; padding: 64px 48px 32px; }
        .rbn-footer-inner { max-width: 1280px; margin: 0 auto; }
        .rbn-footer-top { display: grid; grid-template-columns: 220px repeat(3, 1fr); gap: 48px; padding-bottom: 48px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 32px; }
        .rbn-footer-brand-name { font-family: 'Ubuntu', sans-serif; font-size: 18px; font-weight: 700; color: white; margin-bottom: 10px; }
        .rbn-footer-brand p { font-size: 13px; color: rgba(255,255,255,0.35); line-height: 1.65; }
        .rbn-footer-col-title { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 16px; }
        .rbn-footer-col ul { list-style: none; }
        .rbn-footer-col li { margin-bottom: 10px; }
        .rbn-footer-col a { font-size: 13px; color: rgba(255,255,255,0.55); text-decoration: none; transition: color 0.15s; }
        .rbn-footer-col a:hover { color: white; }
        .rbn-footer-bottom { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .rbn-footer-copy { font-size: 13px; color: rgba(255,255,255,0.25); }
        .rbn-footer-legal { display: flex; gap: 24px; list-style: none; }
        .rbn-footer-legal a { font-size: 13px; color: rgba(255,255,255,0.25); text-decoration: none; transition: color 0.15s; }
        .rbn-footer-legal a:hover { color: rgba(255,255,255,0.6); }

        /* REVEAL */
        .reveal { opacity: 0; transform: translateY(16px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }

        @media (max-width: 768px) {
          .rbn-hero-inner { grid-template-columns: 1fr; }
          .rbn-hero-card { display: none; }
          .rbn-steps-grid { grid-template-columns: 1fr 1fr; }
          .rbn-features-grid { grid-template-columns: 1fr; }
          .rbn-footer-top { grid-template-columns: 1fr 1fr; }
          .rbn-header { padding: 0 24px; }
          .rbn-nav { display: none; }
        }
      `}</style>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600&display=swap" rel="stylesheet" />

      {/* HEADER */}
      <header className="rbn-header">
        <a href="/" className="rbn-logo">🐦 Robin</a>
        <ul className="rbn-nav">
          <li><a href="#how">How it works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#about">About</a></li>
        </ul>
        <div className="rbn-header-actions">
          <a href="/onboarding" className="btn btn-white">Get started</a>
        </div>
      </header>

      {/* HERO */}
      <section className="rbn-hero">
        <div className="rbn-hero-inner">
          <div className="rbn-hero-left">
            <h1>Your edge to land<br />the right job</h1>
            <p>Robin reads your resume, extracts your skills, and matches you to real jobs — ranked by how well they actually fit.</p>
            <div className="rbn-hero-actions">
              <a href="/onboarding" className="btn btn-white btn-lg">Upload your resume</a>
              <a href="#how" className="btn btn-ghost-white btn-lg">See how it works</a>
            </div>
          </div>

          <div className="rbn-hero-card">
            <div className="rbn-card-header">
              <div className="rbn-card-title">Top matches for you</div>
              <div className="rbn-card-badge">
                <div className="rbn-badge-dot"></div>
                Live matches
              </div>
            </div>
            <div className="rbn-card-body">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Skills extracted</div>
              <div className="rbn-skill-tags">
                <span className="rbn-skill-tag active">SAP S/4HANA</span>
                <span className="rbn-skill-tag active">GRC Automation</span>
                <span className="rbn-skill-tag active">Strategy</span>
                <span className="rbn-skill-tag">ITGC</span>
                <span className="rbn-skill-tag">Fiori</span>
                <span className="rbn-skill-tag">MBA</span>
              </div>
              <div className="rbn-card-divider"></div>
              {[
                { title: 'Digital Risk SAP Manager', meta: 'EY · Toronto · Hybrid', score: 94 },
                { title: 'Strategic Engagement Manager', meta: 'RBC · Toronto · On-site', score: 88 },
                { title: 'Manager, Strategic Programs', meta: 'Scotiabank · Toronto · Hybrid', score: 82 },
                { title: 'SAP GRC Consultant', meta: 'Deloitte · Toronto · Remote', score: 79 },
              ].map((job, i) => (
                <div className="rbn-match-row" key={i}>
                  <div className="rbn-match-info">
                    <div className="rbn-match-title">{job.title}</div>
                    <div className="rbn-match-meta">{job.meta}</div>
                  </div>
                  <div className="rbn-match-right">
                    <div className="rbn-match-score">{job.score}%</div>
                    <div className="rbn-match-bar-wrap">
                      <div className="rbn-match-bar" style={{ width: job.score + '%' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="rbn-marquee">
        <div className="rbn-marquee-track">
          {['Upload Resume', 'Extract Skills', 'Answer Questions', 'Get Matched', 'Land the Job', 'Find Your Fit', 'Career Clarity', 'Upload Resume', 'Extract Skills', 'Answer Questions', 'Get Matched', 'Land the Job', 'Find Your Fit', 'Career Clarity'].map((item, i) => (
            <div className="rbn-marquee-item" key={i}>
              {item} <span className="rbn-marquee-sep"></span>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="rbn-how" id="how">
        <div className="rbn-how-inner">
          <div className="rbn-section-label reveal">How it works</div>
          <h2 className="rbn-section-title reveal">Four steps to your next role</h2>
          <p className="rbn-section-sub reveal">No manual input. No guesswork. Robin does the heavy lifting.</p>
          <div className="rbn-steps-grid reveal">
            {[
              { num: '01', icon: '📄', title: 'Upload your resume', desc: 'Drop your resume in any format. Robin reads it instantly.' },
              { num: '02', icon: '🔍', title: 'Skills extracted', desc: 'Robin identifies your skills and what makes you stand out, automatically.' },
              { num: '03', icon: '💬', title: 'Quick questions', desc: 'Tell Robin your location, work style, salary range, and priorities.' },
              { num: '04', icon: '✨', title: 'Jobs matched', desc: 'Real jobs ranked by actual fit, not keyword soup.' },
            ].map((step, i) => (
              <div className="rbn-step-card" key={i}>
                <div className="rbn-step-num">{step.num}</div>
                <span className="rbn-step-icon">{step.icon}</span>
                <div className="rbn-step-title">{step.title}</div>
                <div className="rbn-step-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="rbn-features" id="features">
        <div className="rbn-section-label reveal">What Robin does</div>
        <h2 className="rbn-section-title reveal">Built for people serious<br />about their next move</h2>
        <p className="rbn-section-sub reveal">Every feature designed to get you in front of the right opportunities faster.</p>
        <div className="rbn-features-grid reveal">
          {[
            { icon: '🎯', title: 'Fit Score', desc: 'Every job gets a match score based on your actual background, not just keywords.' },
            { icon: '📋', title: 'Real Listings', desc: 'Jobs from real postings across Canada, refreshed daily.' },
            { icon: '⚡', title: 'Instant Extraction', desc: 'No forms. Robin reads your resume and surfaces your skills in seconds.' },
            { icon: '📝', title: 'Tailored Applications', desc: 'One-click resume and cover letter tailored to each job you apply for.' },
            { icon: '💡', title: 'Skill Gap Insights', desc: 'Robin tells you what is missing for roles you want, so you know what to focus on.' },
            { icon: '📍', title: 'Location Aware', desc: 'Filter by city, remote, or hybrid. Robin respects how you work.' },
          ].map((f, i) => (
            <div className="rbn-feature-card" key={i}>
              <span className="rbn-feature-icon">{f.icon}</span>
              <div className="rbn-feature-title">{f.title}</div>
              <div className="rbn-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="rbn-cta" id="cta">
        <h2>Get started with Robin today</h2>
        <p>Upload your resume and find your fit in under two minutes. Free to try.</p>
        <div className="rbn-cta-actions">
          <a href="/onboarding" className="btn btn-white btn-lg">Upload Resume</a>
          <a href="#how" className="btn btn-ghost-white btn-lg">Learn more</a>
        </div>
        <p className="rbn-cta-note">Free · No sign up required · Takes 2 minutes</p>
      </div>

      {/* FOOTER */}
      <footer className="rbn-footer" id="about">
        <div className="rbn-footer-inner">
          <div className="rbn-footer-top">
            <div className="rbn-footer-brand">
              <div className="rbn-footer-brand-name">🐦 Robin</div>
              <p>Your pocket career coach. Built with care in Toronto, Canada.</p>
            </div>
            <div className="rbn-footer-col">
              <div className="rbn-footer-col-title">Product</div>
              <ul>
                <li><a href="#how">How it works</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="/onboarding">Get started</a></li>
              </ul>
            </div>
            <div className="rbn-footer-col">
              <div className="rbn-footer-col-title">Company</div>
              <ul>
                <li><a href="#about">About us</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </div>
            <div className="rbn-footer-col">
              <div className="rbn-footer-col-title">Support</div>
              <ul>
                <li><a href="#">Privacy policy</a></li>
                <li><a href="#">Terms of service</a></li>
              </ul>
            </div>
          </div>
          <div className="rbn-footer-bottom">
            <div className="rbn-footer-copy">© 2026 Robin. All rights reserved.</div>
            <ul className="rbn-footer-legal">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  )
}
