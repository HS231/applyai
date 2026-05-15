'use client'

import { useEffect, useRef, useState } from 'react'

const robinLogo = '/Logo.png'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .robin-root {
    --radius: 0.75rem;
    --background: oklch(0.16 0.02 270);
    --foreground: oklch(0.96 0.01 90);
    --card: oklch(0.20 0.025 270);
    --card-foreground: oklch(0.96 0.01 90);
    --primary: oklch(0.96 0.01 90);
    --primary-foreground: oklch(0.16 0.02 270);
    --secondary: oklch(0.26 0.03 270);
    --secondary-foreground: oklch(0.96 0.01 90);
    --muted: oklch(0.24 0.025 270);
    --muted-foreground: oklch(0.70 0.02 90);
    --accent: oklch(0.72 0.15 180);
    --accent-foreground: oklch(0.16 0.02 240);
    --border: oklch(1 0 0 / 8%);
    --input: oklch(1 0 0 / 12%);
    --cream: oklch(0.96 0.025 85);
    --coral: oklch(0.74 0.14 185);
    --ember: oklch(0.58 0.13 220);
    --font-display: "Instrument Serif", "Times New Roman", serif;
    --font-sans: "Inter", system-ui, sans-serif;
    --font-mono: "JetBrains Mono", ui-monospace, monospace;
    --gradient-aurora: radial-gradient(at 20% 30%, oklch(0.70 0.16 180 / 0.45), transparent 55%),
                       radial-gradient(at 80% 25%, oklch(0.58 0.15 215 / 0.45), transparent 55%),
                       radial-gradient(at 70% 80%, oklch(0.62 0.14 165 / 0.40), transparent 55%),
                       radial-gradient(at 10% 90%, oklch(0.48 0.12 235 / 0.45), transparent 60%);
    --gradient-text: linear-gradient(135deg, oklch(0.96 0.02 180), oklch(0.78 0.14 190));
    --shadow-elegant: 0 30px 80px -20px oklch(0 0 0 / 0.6), 0 8px 30px -10px oklch(0 0 0 / 0.4);
    --shadow-glow: 0 0 60px oklch(0.72 0.16 185 / 0.35);

    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .robin-root *, .robin-root *::before, .robin-root *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .robin-root ::selection { background: var(--coral); color: var(--background); }

  /* Layout */
  .r-fixed { position: fixed; }
  .r-relative { position: relative; }
  .r-absolute { position: absolute; }
  .r-isolate { isolation: isolate; }
  .r-inset-0 { inset: 0; }
  .r-inset-x-0 { left: 0; right: 0; }
  .r-top-0 { top: 0; }
  .r-z-50 { z-index: 50; }
  .r-z-10 { z-index: 10; }
  .r-z-n10 { z-index: -10; }
  .r-overflow-hidden { overflow: hidden; }
  .r-overflow-x-hidden { overflow-x: hidden; }

  /* Flexbox */
  .r-flex { display: flex; }
  .r-inline-flex { display: inline-flex; }
  .r-items-center { align-items: center; }
  .r-justify-center { justify-content: center; }
  .r-justify-between { justify-content: space-between; }
  .r-flex-wrap { flex-wrap: wrap; }
  .r-flex-col { flex-direction: column; }
  .r-gap-1 { gap: 0.25rem; }
  .r-gap-1h { gap: 0.375rem; }
  .r-gap-2 { gap: 0.5rem; }
  .r-gap-2h { gap: 0.625rem; }
  .r-gap-3 { gap: 0.75rem; }
  .r-gap-4 { gap: 1rem; }
  .r-gap-6 { gap: 1.5rem; }
  .r-gap-9 { gap: 2.25rem; }
  .r-gap-12 { gap: 3rem; }
  .r-gap-16 { gap: 4rem; }

  /* Grid */
  .r-grid { display: grid; }
  .r-grid-1 { grid-template-columns: 1fr; }
  .r-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .r-grid-cols-hero { grid-template-columns: 1.1fr 0.9fr; }
  .r-grid-cols-how { grid-template-columns: 0.45fr 0.55fr; }
  .r-grid-steps { grid-template-columns: repeat(2, 1fr); }
  .r-grid-feats { grid-template-columns: repeat(3, 1fr); }
  .r-grid-footer { grid-template-columns: 1.4fr 1fr 1fr 1fr; }
  .r-gap-px { gap: 1px; }

  /* Sizing */
  .r-w-full { width: 100%; }
  .r-w-max { width: max-content; }
  .r-w-9 { width: 2.25rem; }
  .r-h-9 { height: 2.25rem; }
  .r-w-8 { width: 2rem; }
  .r-h-8 { height: 2rem; }
  .r-w-16 { width: 4rem; }
  .r-h-px { height: 1px; }
  .r-h-3px { height: 3px; }
  .r-min-h-screen { min-height: 100svh; }
  .r-max-w-1400 { max-width: 1400px; }
  .r-max-w-1100 { max-width: 1100px; }
  .r-max-w-md { max-width: 28rem; }
  .r-max-w-sm { max-width: 24rem; }
  .r-max-w-xs { max-width: 20rem; }
  .r-max-w-3xl { max-width: 48rem; }
  .r-mx-auto { margin-left: auto; margin-right: auto; }
  .r-min-w-0 { min-width: 0; }

  /* Spacing */
  .r-px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
  .r-px-7 { padding-left: 1.75rem; padding-right: 1.75rem; }
  .r-px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
  .r-px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
  .r-px-2h { padding-left: 0.625rem; padding-right: 0.625rem; }
  .r-py-4 { padding-top: 1rem; padding-bottom: 1rem; }
  .r-py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
  .r-py-2h { padding-top: 0.625rem; padding-bottom: 0.625rem; }
  .r-py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
  .r-py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
  .r-py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
  .r-py-32 { padding-top: 8rem; padding-bottom: 8rem; }
  .r-py-24 { padding-top: 6rem; padding-bottom: 6rem; }
  .r-pb-20 { padding-bottom: 5rem; }
  .r-pt-32 { padding-top: 8rem; }
  .r-pt-20 { padding-top: 5rem; }
  .r-pb-16 { padding-bottom: 4rem; }
  .r-pb-10 { padding-bottom: 2.5rem; }
  .r-pt-10 { padding-top: 2.5rem; }
  .r-p-8 { padding: 2rem; }
  .r-p-6 { padding: 1.5rem; }
  .r-p-4 { padding: 1rem; }
  .r-px-10 { padding-left: 2.5rem; padding-right: 2.5rem; }
  .r-h-16 { height: 4rem; }
  .r-h-24 { width: 6rem; height: 6rem; }

  .r-mt-2 { margin-top: 0.5rem; }
  .r-mt-3 { margin-top: 0.75rem; }
  .r-mt-4 { margin-top: 1rem; }
  .r-mt-5 { margin-top: 1.25rem; }
  .r-mt-6 { margin-top: 1.5rem; }
  .r-mt-8 { margin-top: 2rem; }
  .r-mt-10 { margin-top: 2.5rem; }
  .r-mt-16 { margin-top: 4rem; }
  .r-my-5 { margin-top: 1.25rem; margin-bottom: 1.25rem; }
  .r-mb-0h { margin-bottom: 0.125rem; }

  /* Typography */
  .r-text-hero { font-size: clamp(3rem, 8vw, 7.5rem); line-height: 0.95; letter-spacing: -0.03em; }
  .r-text-section { font-size: clamp(2.5rem, 5vw, 4.5rem); line-height: 1; letter-spacing: -0.02em; }
  .r-text-manifesto { font-size: clamp(2rem, 4.2vw, 3.75rem); line-height: 1.1; letter-spacing: -0.015em; }
  .r-text-cta { font-size: clamp(2.5rem, 6vw, 5.5rem); line-height: 1; letter-spacing: -0.02em; }
  .r-text-wordmark { font-size: clamp(5rem, 18vw, 16rem); line-height: 0.85; letter-spacing: -0.04em; }
  .r-text-2xl { font-size: 1.5rem; letter-spacing: -0.01em; }
  .r-text-3xl { font-size: 1.875rem; letter-spacing: -0.01em; }
  .r-text-base { font-size: 1rem; line-height: 1.625; }
  .r-text-sm { font-size: 0.875rem; }
  .r-text-xs { font-size: 0.75rem; }
  .r-text-10 { font-size: 0.625rem; }
  .r-text-11 { font-size: 0.6875rem; }
  .r-leading-relaxed { line-height: 1.625; }
  .r-tracking-tight { letter-spacing: -0.025em; }
  .r-tracking-wide { letter-spacing: 0.22em; }
  .r-tracking-wider { letter-spacing: 0.2em; }
  .r-tracking-widest { letter-spacing: 0.18em; }
  .r-uppercase { text-transform: uppercase; }
  .r-truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .r-whitespace-nowrap { white-space: nowrap; }
  .r-tabular { font-variant-numeric: tabular-nums; }
  .r-select-none { user-select: none; }
  .r-text-center { text-align: center; }

  .r-font-display { font-family: var(--font-display); font-weight: 400; letter-spacing: -0.02em; }
  .r-font-mono { font-family: var(--font-mono); }
  .r-font-medium { font-weight: 500; }
  .r-font-semibold { font-weight: 600; }
  .r-italic { font-style: italic; }

  /* Colors */
  .r-bg-background { background-color: var(--background); }
  .r-bg-card { background-color: var(--card); }
  .r-bg-secondary { background-color: var(--secondary); }
  .r-bg-border { background-color: var(--border); }
  .r-bg-foreground { background-color: var(--foreground); }
  .r-bg-black-4 { background-color: oklch(0 0 0 / 0.04); }
  .r-bg-black-6 { background-color: oklch(0 0 0 / 0.06); }
  .r-bg-cream { background: var(--cream); }
  .r-bg-card-40 { background-color: oklch(0.20 0.025 270 / 0.4); }

  .r-text-foreground { color: var(--foreground); }
  .r-text-muted { color: var(--muted-foreground); }
  .r-text-coral { color: var(--coral); }
  .r-text-background { color: var(--background); }
  .r-text-black-50 { color: oklch(0 0 0 / 0.5); }
  .r-text-black-55 { color: oklch(0 0 0 / 0.55); }
  .r-text-foreground-80 { color: oklch(0.96 0.01 90 / 0.8); }
  .r-text-foreground-6 { color: oklch(0.96 0.01 90 / 0.06); }

  .r-border-border { border: 1px solid var(--border); }
  .r-border-t { border-top: 1px solid var(--border); }
  .r-border-y { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
  .r-border-black-5 { border: 1px solid oklch(0 0 0 / 0.05); }
  .r-border-t-black-5 { border-top: 1px solid oklch(0 0 0 / 0.05); }

  /* Gradient text */
  .r-text-gradient {
    background: var(--gradient-text);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  /* Rounded */
  .r-rounded-full { border-radius: 9999px; }
  .r-rounded-lg { border-radius: 0.75rem; }
  .r-rounded-md { border-radius: 0.5rem; }
  .r-rounded-2xl { border-radius: 1.5rem; }
  .r-rounded-2rem { border-radius: 2rem; }

  /* Shadow */
  .r-shadow-elegant { box-shadow: var(--shadow-elegant); }
  .r-ring-1 { box-shadow: 0 0 0 1px oklch(0 0 0 / 0.05); }

  /* Special bg */
  .r-bg-coral-15 { background-color: oklch(0.74 0.14 185 / 0.15); }
  .r-ring-coral { box-shadow: 0 0 0 1px oklch(0.74 0.14 185 / 0.25); }
  .r-bg-coral-30 { background-color: oklch(0.74 0.14 185 / 0); }
  .r-bg-coral-glow { background: radial-gradient(at 0 0, oklch(0.74 0.14 185 / 0.4), transparent 60%); }
  .r-from-coral { background: linear-gradient(to right, var(--coral), var(--ember)); }
  .r-blur-md { filter: blur(6px); }
  .r-blur-2xl { filter: blur(24px); }
  .r-blur-aurora { filter: blur(60px); }
  .r-opacity-0 { opacity: 0; }
  .r-opacity-6 { opacity: 0.06; }

  /* Transitions */
  .r-transition { transition: all 0.15s; }
  .r-transition-colors { transition: color 0.15s, background-color 0.15s; }
  .r-hover-up:hover { transform: translateY(-2px); }
  .r-hover-up-sm:hover { transform: translateY(-1px); }
  .r-hover-tx:hover .r-arrow { transform: translateX(4px); }
  .r-hover-secondary:hover { background-color: var(--secondary); }
  .r-hover-text:hover { color: var(--foreground); }
  .r-group:hover .r-group-opacity { opacity: 1; }
  .r-group-opacity { opacity: 0; transition: opacity 0.15s; }
  .r-group:hover .r-group-hover-bg { background-color: oklch(0 0 0 / 0.04); }
  .r-arrow { transition: transform 0.15s; display: inline-block; }

  /* Animations */
  .r-aurora { background: var(--gradient-aurora); filter: blur(60px); }
  .r-aurora-shift { animation: r-aurora-shift 18s ease-in-out infinite alternate; }
  @keyframes r-aurora-shift {
    0%   { transform: translate3d(0,0,0) scale(1); }
    50%  { transform: translate3d(-3%,2%,0) scale(1.05); }
    100% { transform: translate3d(2%,-2%,0) scale(1.08); }
  }

  .r-float { animation: r-floaty 9s ease-in-out infinite; }
  @keyframes r-floaty {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-12px); }
  }

  .r-marquee { animation: r-marquee 40s linear infinite; }
  @keyframes r-marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  .r-reveal { opacity: 0; transform: translateY(20px); transition: opacity .8s cubic-bezier(.2,.8,.2,1), transform .8s cubic-bezier(.2,.8,.2,1); }
  .r-reveal.in { opacity: 1; transform: translateY(0); }

  .r-pulse-dot { width: 6px; height: 6px; border-radius: 9999px; background: var(--coral); animation: r-pulse 1.6s ease-in-out infinite; }
  @keyframes r-pulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.85);} }

  /* Grain overlay */
  .r-grain::before {
    content: "";
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
    opacity: 0.08; mix-blend-mode: overlay; pointer-events: none; z-index: 1;
  }

  /* Nav scrolled */
  .r-nav-hidden { pointer-events: none; transform: translateY(-4px); opacity: 0; }
  .r-nav-visible { opacity: 1; }

  /* Hairline */
  .r-hairline { background: linear-gradient(90deg, transparent, oklch(1 0 0 / 0.18), transparent); }

  /* Space-y */
  .r-space-y > * + * { margin-top: 0.25rem; }

  @media (max-width: 768px) {
    .r-grid-cols-hero { grid-template-columns: 1fr; }
    .r-grid-cols-how { grid-template-columns: 1fr; }
    .r-grid-steps { grid-template-columns: 1fr; }
    .r-grid-feats { grid-template-columns: 1fr; }
    .r-grid-footer { grid-template-columns: repeat(2, 1fr); }
    .r-hidden-mobile { display: none; }
    .r-py-32 { padding-top: 5rem; padding-bottom: 5rem; }
    .r-py-24 { padding-top: 4rem; padding-bottom: 4rem; }
    .r-pt-32 { padding-top: 6rem; }
    .r-px-10 { padding-left: 1.5rem; padding-right: 1.5rem; }
  }
`

function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const els = root.querySelectorAll('.r-reveal')
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in'), i * 70)
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.12 })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
  return ref
}

export default function RobinLanding() {
  const ref = useReveal()
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <main ref={ref} className="robin-root r-overflow-x-hidden">
        <Header />
        <Hero />
        <Marquee />
        <HowItWorks />
        <Features />
        <Manifesto />
        <CTA />
        <Footer />
      </main>
    </>
  )
}

function Header() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header className="r-fixed r-inset-x-0 r-top-0 r-z-50">
      <div className="r-mx-auto r-max-w-1400 r-flex r-h-16 r-items-center r-justify-between r-px-6 r-px-10">
        <a href="/" className="r-flex r-items-center r-gap-2h r-font-display r-text-2xl r-text-foreground" style={{textDecoration:'none'}}>
          <span className="r-relative r-inline-flex r-w-9 r-h-9 r-items-center r-justify-center">
            <span aria-hidden className="r-absolute r-inset-0 r-rounded-full r-blur-md" style={{background:'oklch(0.74 0.14 185 / 0.3)'}} />
            <img src={robinLogo} alt="Robin" className="r-relative r-w-9 r-h-9" style={{objectFit:'contain',filter:'drop-shadow(0 0 12px var(--coral))'}} />
          </span>
          Robin
        </a>
        <nav className={'r-hidden-mobile r-flex r-items-center r-gap-9 r-text-sm r-text-muted r-transition ' + (scrolled ? 'r-nav-hidden' : 'r-nav-visible')} aria-hidden={scrolled}>
          <a href="#how" className="r-transition-colors r-hover-text r-text-muted" style={{textDecoration:'none'}}>How it works</a>
          <a href="#features" className="r-transition-colors r-hover-text r-text-muted" style={{textDecoration:'none'}}>Features</a>
          <a href="#manifesto" className="r-transition-colors r-hover-text r-text-muted" style={{textDecoration:'none'}}>Manifesto</a>
        </nav>
        <a href="/onboarding" className="r-flex r-items-center r-gap-2 r-rounded-full r-bg-foreground r-px-5 r-py-2h r-text-sm r-font-medium r-text-background r-transition r-hover-up-sm" style={{textDecoration:'none'}}>
          Upload resume <span className="r-arrow">→</span>
        </a>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="r-grain r-relative r-isolate r-flex r-min-h-screen r-items-center r-overflow-hidden r-px-6 r-pb-20 r-pt-32 r-px-10">
      <div aria-hidden className="r-aurora r-aurora-shift r-absolute r-inset-0 r-z-n10" />
      <div aria-hidden className="r-absolute r-inset-0 r-z-n10" style={{background:'radial-gradient(ellipse at top, transparent 30%, var(--background) 85%)'}} />
      <div aria-hidden className="r-absolute r-inset-0 r-z-n10 r-opacity-6" style={{backgroundImage:'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',backgroundSize:'64px 64px',maskImage:'radial-gradient(ellipse at center, black 30%, transparent 75%)'}} />
      <div className="r-relative r-mx-auto r-grid r-grid-cols-hero r-w-full r-max-w-1400 r-items-center r-gap-16">
        <div>
          <h1 className="r-reveal r-font-display r-text-hero r-text-foreground">
            The right job<br />
            is <em className="r-text-gradient r-italic">a click</em><br />
            away.
          </h1>
          <p className="r-reveal r-mt-8 r-max-w-md r-text-base r-text-muted">
            Robin reads your resume, extracts your skills, and matches you to real jobs, ranked by how well they <em className="r-font-display r-text-foreground">actually fit</em>.
          </p>
          <div className="r-reveal r-mt-10 r-flex r-flex-wrap r-items-center r-gap-3">
            <a href="/onboarding" className="r-flex r-items-center r-gap-3 r-rounded-full r-bg-foreground r-px-7 r-py-4 r-text-sm r-font-medium r-text-background r-transition r-hover-up-sm" style={{textDecoration:'none',boxShadow:'var(--shadow-glow)'}}>
              Upload your resume <span className="r-arrow">→</span>
            </a>
            <a href="#how" className="r-flex r-items-center r-gap-2 r-rounded-full r-border-border r-px-7 r-py-4 r-text-sm r-font-medium r-text-foreground r-transition-colors r-hover-secondary" style={{textDecoration:'none'}}>
              See how it works
            </a>
          </div>
        </div>
        <HeroCard />
      </div>
    </section>
  )
}

function HeroCard() {
  const matches = [
    { title: 'Digital Risk SAP Manager', meta: 'EY · Toronto · Hybrid', score: 94 },
    { title: 'Strategic Engagement Manager', meta: 'RBC · Toronto · On-site', score: 88 },
    { title: 'Manager, Strategic Programs', meta: 'Scotiabank · Toronto · Hybrid', score: 82 },
    { title: 'SAP GRC Consultant', meta: 'Deloitte · Toronto · Remote', score: 79 },
  ]
  const skills = [
    { label: 'SAP S/4HANA', on: true }, { label: 'GRC Automation', on: true },
    { label: 'Strategy', on: true }, { label: 'ITGC', on: false },
    { label: 'Fiori', on: false }, { label: 'MBA', on: false },
  ]
  return (
    <div className="r-reveal r-relative">
      <div aria-hidden className="r-absolute r-blur-2xl r-z-n10" style={{inset:'-1.5rem',borderRadius:'2rem',background:'radial-gradient(at 0 0, oklch(0.74 0.14 185 / 0.4), transparent 60%)'}} />
      <div className="r-float r-relative r-overflow-hidden r-rounded-2xl r-shadow-elegant r-ring-1" style={{background:'var(--cream)',color:'oklch(0.16 0.02 270)'}}>
        <div className="r-p-6" style={{paddingBottom:'1.25rem'}}>
          <p className="r-font-mono r-text-10 r-uppercase r-tracking-widest r-text-black-50">Skills extracted</p>
          <div className="r-mt-3 r-flex r-flex-wrap r-gap-1h">
            {skills.map(s => (
              <span key={s.label} className={'r-rounded-md r-px-2h r-py-1 r-text-xs r-font-medium ' + (s.on ? 'r-bg-coral-15 r-text-coral r-ring-coral' : 'r-bg-black-4 r-text-black-55')} style={{boxShadow: s.on ? '0 0 0 1px oklch(0.74 0.14 185 / 0.25)' : '0 0 0 1px oklch(0 0 0 / 0.05)'}}>
                {s.label}
              </span>
            ))}
          </div>
          <div className="r-my-5 r-h-px" style={{background:'oklch(0 0 0 / 0.05)'}} />
          <div className="r-space-y">
            {matches.map((m, i) => (
              <div key={i} className="r-group r-flex r-items-center r-justify-between r-gap-4 r-rounded-lg r-px-2 r-py-3 r-transition-colors r-group-hover-bg">
                <div className="r-min-w-0">
                  <div className="r-truncate r-text-sm r-font-medium">{m.title}</div>
                  <div className="r-mb-0h r-truncate r-text-xs r-text-black-50">{m.meta}</div>
                </div>
                <div className="r-flex r-flex-col r-items-center r-gap-1">
                  <div className="r-font-mono r-text-sm r-font-semibold r-text-coral r-tabular">{m.score}%</div>
                  <div className="r-w-16 r-h-3px r-overflow-hidden r-rounded-full r-bg-black-6">
                    <div className="r-h-full r-rounded-full" style={{width:`${m.score}%`,background:'linear-gradient(to right, var(--coral), var(--ember))'}} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="r-flex r-items-center r-justify-between r-border-t-black-5 r-px-6 r-py-4">
          <span className="r-font-mono r-text-10 r-uppercase r-tracking-widest r-text-black-50">128 jobs scanned</span>
          <a href="/feed" className="r-text-xs r-font-medium r-text-foreground" style={{textDecoration:'none',color:'oklch(0.16 0.02 270)'}}>View all →</a>
        </div>
      </div>
    </div>
  )
}

function Marquee() {
  const items = ['Upload Resume','Extract Skills','Answer Questions','Get Matched','Land the Job','Find Your Fit','Career Clarity']
  const all = [...items,...items,...items]
  return (
    <div className="r-relative r-border-y r-bg-background r-py-6">
      <div className="r-flex r-w-max r-marquee r-gap-12 r-whitespace-nowrap">
        {all.map((t,i) => (
          <div key={i} className="r-flex r-items-center r-gap-12 r-font-display r-text-2xl r-text-muted">
            <span>{t}</span>
            <span aria-hidden className="r-text-coral">✦</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HowItWorks() {
  const steps = [
    { num:'01', title:'Upload your resume', desc:'Drop a PDF, doc, or paste a link. Robin reads it instantly, no forms.' },
    { num:'02', title:'Skills extracted', desc:'Robin identifies your strengths and what makes you stand out, automatically.' },
    { num:'03', title:'Quick questions', desc:'Tell Robin your location, work style, salary range, and what matters most.' },
    { num:'04', title:'Jobs matched', desc:'Real listings ranked by genuine fit, not keyword soup, not noise.' },
  ]
  return (
    <section id="how" className="r-relative r-px-6 r-px-10 r-py-32">
      <div className="r-mx-auto r-max-w-1400">
        <div className="r-grid r-grid-cols-how r-gap-12">
          <div>
            <div className="r-reveal r-font-mono r-text-xs r-uppercase r-tracking-wide r-text-coral">How it works</div>
            <h2 className="r-reveal r-mt-6 r-font-display r-text-section r-text-foreground">
              Four steps<br />to your <em className="r-text-gradient r-italic">next role</em>.
            </h2>
            <p className="r-reveal r-mt-6 r-max-w-sm r-text-base r-text-muted">
              No manual input. No guesswork. Robin does the heavy lifting so you can focus on the conversation that matters.
            </p>
          </div>
          <div className="r-grid r-grid-steps r-gap-px r-overflow-hidden r-rounded-2xl r-border-border r-bg-border">
            {steps.map(s => (
              <div key={s.num} className="r-reveal r-group r-relative r-overflow-hidden r-bg-card r-p-8 r-transition-colors r-hover-secondary">
                <div className="r-font-mono r-text-xs r-tracking-wide r-text-coral">{s.num}</div>
                <div className="r-mt-8 r-font-display r-text-2xl r-text-foreground">{s.title}</div>
                <p className="r-mt-3 r-text-sm r-text-muted r-leading-relaxed">{s.desc}</p>
                <div aria-hidden className="r-absolute r-blur-2xl r-transition" style={{bottom:'-1.5rem',right:'-1.5rem',width:'6rem',height:'6rem',borderRadius:'9999px',background:'oklch(0.74 0.14 185 / 0)'}} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Features() {
  const feats = [
    { kbd:'Fit', title:'Fit Score', desc:'Every job gets a match score based on your actual background, not just keywords.' },
    { kbd:'Live', title:'Real Listings', desc:'Jobs from real postings across Canada, refreshed every day.' },
    { kbd:'AI', title:'Instant Extraction', desc:'Robin reads your resume and surfaces your skills in seconds, zero forms.' },
    { kbd:'1-Tap', title:'Tailored Applications', desc:'One-click resume and cover letter, custom-tuned to each job you apply for.' },
    { kbd:'Gap', title:'Skill Gap Insights', desc:"Robin tells you what's missing for the roles you want, so you know what to learn next." },
    { kbd:'Geo', title:'Location Aware', desc:'Filter by city, remote, or hybrid. Robin respects how you actually want to work.' },
  ]
  return (
    <section id="features" className="r-relative r-px-6 r-px-10 r-py-32">
      <div className="r-mx-auto r-max-w-1400">
        <div className="r-reveal r-font-mono r-text-xs r-uppercase r-tracking-wide r-text-coral">Built for the move</div>
        <h2 className="r-reveal r-mt-6 r-max-w-3xl r-font-display r-text-section r-text-foreground">
          Designed for people who are <em className="r-text-gradient r-italic">serious</em> about their next chapter.
        </h2>
        <div className="r-mt-16 r-grid r-grid-feats r-gap-px r-overflow-hidden r-rounded-2xl r-border-border r-bg-border">
          {feats.map(f => (
            <article key={f.title} className="r-reveal r-group r-relative r-bg-card r-p-8 r-transition-colors r-hover-secondary">
              <div className="r-inline-flex r-items-center r-rounded-md r-border-border r-px-2 r-py-1 r-font-mono r-text-10 r-uppercase r-tracking-widest r-text-muted" style={{background:'oklch(0.16 0.02 270 / 0.6)'}}>{f.kbd}</div>
              <h3 className="r-mt-8 r-font-display r-text-3xl r-text-foreground r-tracking-tight">{f.title}</h3>
              <p className="r-mt-3 r-text-sm r-text-muted r-leading-relaxed">{f.desc}</p>
              <div className="r-mt-8 r-flex r-items-center r-gap-2 r-text-xs r-text-coral r-group-opacity">Learn more <span>→</span></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Manifesto() {
  return (
    <section id="manifesto" className="r-relative r-px-6 r-px-10 r-py-32">
      <div className="r-mx-auto r-max-w-1100 r-text-center">
        <div className="r-reveal r-font-mono r-text-xs r-uppercase r-tracking-wide r-text-coral">Manifesto</div>
        <p className="r-reveal r-mx-auto r-mt-10 r-font-display r-text-manifesto r-text-foreground">
          Job hunting is broken.{' '}
          <span className="r-text-muted">Endless tabs. Keyword games. Applications that disappear into the void.{' '}</span>
          Robin is the friend who reads every posting for you, and only sends back the ones that <em className="r-italic">actually fit</em>.
        </p>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="r-relative r-px-6 r-px-10 r-py-32">
      <div className="r-grain r-relative r-isolate r-mx-auto r-max-w-1400 r-overflow-hidden r-rounded-2rem r-border-border r-px-6 r-px-10 r-py-24 r-text-center">
        <div aria-hidden className="r-aurora r-aurora-shift r-absolute r-inset-0 r-z-n10" />
        <div aria-hidden className="r-absolute r-inset-0 r-z-n10" style={{background:'radial-gradient(ellipse at center, transparent 30%, var(--background) 90%)'}} />
        <h2 className="r-font-display r-text-cta r-text-foreground">
          Find the role that <em className="r-text-gradient r-italic">fits.</em>
        </h2>
        <p className="r-mx-auto r-mt-6 r-max-w-md r-text-base r-text-muted">Upload your resume and meet your matches in under two minutes.</p>
        <div className="r-mt-10 r-flex r-flex-wrap r-items-center r-justify-center r-gap-3">
          <a href="/onboarding" className="r-flex r-items-center r-gap-3 r-rounded-full r-bg-foreground r-px-7 r-py-4 r-text-sm r-font-medium r-text-background r-transition r-hover-up-sm" style={{textDecoration:'none',boxShadow:'var(--shadow-glow)'}}>
            Upload your resume <span className="r-arrow">→</span>
          </a>
          <a href="#how" className="r-flex r-items-center r-gap-2 r-rounded-full r-border-border r-bg-card-40 r-px-7 r-py-4 r-text-sm r-font-medium r-text-foreground r-transition-colors r-hover-secondary" style={{textDecoration:'none',backdropFilter:'blur(8px)'}}>
            How it works
          </a>
        </div>
        <p className="r-mt-6 r-font-mono r-text-11 r-uppercase r-tracking-wider r-text-muted">Free · No sign-up · 2 minutes</p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="r-relative r-border-t r-px-6 r-px-10 r-pb-10 r-pt-20">
      <div className="r-mx-auto r-max-w-1400">
        <div className="r-grid r-grid-footer r-gap-6 r-pb-16">
          <div>
            <div className="r-flex r-items-center r-gap-2h r-font-display r-text-2xl r-text-foreground">
              <img src={robinLogo} alt="Robin" className="r-w-8 r-h-8" style={{objectFit:'contain',filter:'drop-shadow(0 0 10px var(--coral))'}} />
              Robin
            </div>
            <p className="r-mt-4 r-max-w-xs r-text-sm r-text-muted">Your pocket career coach. Built with care in Toronto, Canada.</p>
          </div>
          <FooterCol title="Product" links={[['How it works','#how'],['Features','#features'],['Get started','/onboarding']]} />
          <FooterCol title="Company" links={[['Manifesto','#manifesto'],['Contact','#']]} />
          <FooterCol title="Legal" links={[['Privacy','#'],['Terms','#']]} />
        </div>
        <div aria-hidden className="r-select-none r-overflow-hidden r-border-t" style={{paddingTop:'2.5rem'}}>
          <div className="r-font-display r-text-wordmark r-text-foreground-6">Robin.</div>
        </div>
        <div className="r-flex r-flex-wrap r-items-center r-justify-between r-gap-4 r-text-xs r-text-muted" style={{marginTop:'1.5rem'}}>
          <span>© {new Date().getFullYear()} Robin. All rights reserved.</span>
          <span className="r-font-mono r-uppercase r-tracking-wider">Made in Toronto · v1.0</span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }) {
  return (
    <div>
      <div className="r-font-mono r-text-10 r-uppercase r-tracking-widest r-text-muted">{title}</div>
      <ul className="r-mt-5" style={{listStyle:'none',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} className="r-text-sm r-text-foreground-80 r-transition-colors r-hover-text" style={{textDecoration:'none'}}>{label}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
