import './globals.css'

export const metadata = {
  title: 'Robin — Your pocket career coach',
  description: 'Find, match, tailor and apply to jobs in under 3 minutes',
}

const LOVABLE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --radius: 0.75rem;
    --background: oklch(0.16 0.02 270);
    --foreground: oklch(0.96 0.01 90);
    --card: oklch(0.20 0.025 270);
    --card-foreground: oklch(0.96 0.01 90);
    --popover: oklch(0.20 0.025 270);
    --popover-foreground: oklch(0.96 0.01 90);
    --primary: oklch(0.96 0.01 90);
    --primary-foreground: oklch(0.16 0.02 270);
    --secondary: oklch(0.26 0.03 270);
    --secondary-foreground: oklch(0.96 0.01 90);
    --muted: oklch(0.24 0.025 270);
    --muted-foreground: oklch(0.70 0.02 90);
    --lv-accent: oklch(0.72 0.15 180);
    --lv-accent-foreground: oklch(0.16 0.02 240);
    --border: oklch(1 0 0 / 8%);
    --input: oklch(1 0 0 / 12%);
    --ring: oklch(0.72 0.15 180);
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

    --accent:       oklch(0.72 0.15 180);
    --accent-dark:  oklch(0.62 0.15 180);
    --accent-light: oklch(0.26 0.03 270);
    --purple:       oklch(0.72 0.15 180);
    --purple-dark:  oklch(0.62 0.15 180);
    --purple-light: oklch(0.26 0.03 270);
    --teal:         oklch(0.74 0.14 185);
    --teal-light:   oklch(0.26 0.03 270);
    --text-pri:     oklch(0.96 0.01 90);
    --text-sec:     oklch(0.70 0.02 90);
    --text-hint:    oklch(0.55 0.02 90);
    --border:       oklch(1 0 0 / 8%);
    --bg-page:      oklch(0.16 0.02 270);
    --bg-card:      oklch(0.20 0.025 270);
    --bg-secondary: oklch(0.26 0.03 270);
    --bg-input:     oklch(1 0 0 / 12%);
    --shadow-sm:    0 1px 3px oklch(0 0 0 / 0.3), 0 4px 12px oklch(0 0 0 / 0.2);
    --shadow:       0 2px 8px oklch(0 0 0 / 0.3), 0 16px 48px oklch(0 0 0 / 0.2);
    --green:        oklch(0.74 0.14 185);
    --green-light:  oklch(0.26 0.03 270);
    --amber:        oklch(0.74 0.14 50);
    --amber-light:  oklch(0.26 0.03 270);
  }

  html { scroll-behavior: smooth; }

  body {
    background-color: oklch(0.16 0.02 270) !important;
    background-image: none !important;
    color: oklch(0.96 0.01 90) !important;
    font-family: "Instrument Serif", "Inter", system-ui, sans-serif !important;
    font-feature-settings: "ss01", "cv11";
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }

  /* Make all text visible */
  h1, h2, h3, h4, h5, h6 {
    color: oklch(0.96 0.01 90) !important;
    font-family: "Instrument Serif", "Times New Roman", serif !important;
  }

  p, span, div, label, li, a {
    font-family: "Inter", system-ui, sans-serif;
  }

  /* Force visibility on muted text */
  [style*="color: var(--text-sec)"],
  [style*="color:var(--text-sec)"] {
    color: oklch(0.70 0.02 90) !important;
  }

  [style*="color: var(--text-hint)"],
  [style*="color:var(--text-hint)"] {
    color: oklch(0.55 0.02 90) !important;
  }

  ::selection { background: var(--coral); color: var(--background); }

  /* Cards */
  .card {
    background: oklch(0.20 0.025 270) !important;
    border: 1px solid oklch(1 0 0 / 8%) !important;
    color: oklch(0.96 0.01 90) !important;
  }

  /* Inputs */
  .input {
    background: oklch(1 0 0 / 8%) !important;
    border: 1px solid oklch(1 0 0 / 12%) !important;
    color: oklch(0.96 0.01 90) !important;
  }
  .input::placeholder { color: oklch(0.50 0.02 90) !important; }

  /* Buttons */
  .btn-primary {
    background: oklch(0.72 0.15 180) !important;
    color: oklch(0.16 0.02 270) !important;
    font-family: "Inter", system-ui, sans-serif !important;
  }
  .btn-primary:hover { background: oklch(0.62 0.15 180) !important; }

  .btn-ghost {
    background: oklch(1 0 0 / 6%) !important;
    border: 1px solid oklch(1 0 0 / 8%) !important;
    color: oklch(0.70 0.02 90) !important;
    font-family: "Inter", system-ui, sans-serif !important;
  }
  .btn-ghost:hover { background: oklch(1 0 0 / 12%) !important; }

  /* Choice buttons */
  .choice-btn {
    background: oklch(1 0 0 / 4%) !important;
    border: 1px solid oklch(1 0 0 / 8%) !important;
    color: oklch(0.80 0.02 90) !important;
    font-family: "Inter", system-ui, sans-serif !important;
  }
  .choice-btn:hover {
    border-color: oklch(0.72 0.15 180) !important;
    background: oklch(0.26 0.03 270) !important;
  }
  .choice-btn.selected {
    border-color: oklch(0.72 0.15 180) !important;
    background: oklch(0.26 0.03 270) !important;
    color: oklch(0.96 0.01 90) !important;
  }

  /* Chips, badges */
  .chip {
    background: oklch(0.26 0.03 270) !important;
    color: oklch(0.72 0.15 180) !important;
  }

  .badge-purple {
    background: oklch(0.26 0.03 270) !important;
    color: oklch(0.72 0.15 180) !important;
  }

  .badge-green {
    background: oklch(0.26 0.03 270) !important;
    color: oklch(0.74 0.14 185) !important;
  }

  .badge-amber {
    background: oklch(0.26 0.03 270) !important;
    color: oklch(0.74 0.14 50) !important;
  }

  /* Labels and hints */
  .field-label { color: oklch(0.55 0.02 90) !important; }

  /* Progress */
  .progress-track { background: oklch(1 0 0 / 10%) !important; }
  .progress-fill  { background: oklch(0.72 0.15 180) !important; }

  /* Navbars and top bars — keep them dark */
  [style*="background: white"],
  [style*="background:white"],
  [style*="background-color: white"],
  [style*="background-color:white"] {
    background: oklch(0.20 0.025 270) !important;
    border-color: oklch(1 0 0 / 8%) !important;
    color: oklch(0.96 0.01 90) !important;
  }

  /* Dropdowns */
  [style*="background: #F8F7F4"],
  [style*="background:#F8F7F4"],
  [style*="background: var(--bg-page)"] {
    background: oklch(0.16 0.02 270) !important;
  }

  /* Lovable animations */
  .aurora { background: var(--gradient-aurora); filter: blur(60px); }
  .aurora-shift { animation: aurora-shift 18s ease-in-out infinite alternate; }
  @keyframes aurora-shift {
    0%   { transform: translate3d(0,0,0) scale(1); }
    50%  { transform: translate3d(-3%,2%,0) scale(1.05); }
    100% { transform: translate3d(2%,-2%,0) scale(1.08); }
  }
  .float-slow { animation: floaty 9s ease-in-out infinite; }
  @keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  .marquee-track { animation: marquee 40s linear infinite; }
  @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  .reveal { opacity:0; transform:translateY(20px); transition:opacity .8s cubic-bezier(.2,.8,.2,1),transform .8s cubic-bezier(.2,.8,.2,1); }
  .reveal.in { opacity:1; transform:translateY(0); }
  .text-gradient { background:var(--gradient-text); -webkit-background-clip:text; background-clip:text; color:transparent; }
  .font-display { font-family:var(--font-display); font-weight:400; letter-spacing:-0.02em; }
  .font-mono { font-family:var(--font-mono); }
  .glass { background:oklch(1 0 0 / 0.04); backdrop-filter:blur(20px); border:1px solid oklch(1 0 0 / 0.08); }
  .grain::before { content:""; position:absolute; inset:0; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E"); opacity:0.08; mix-blend-mode:overlay; pointer-events:none; z-index:1; }
`

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: LOVABLE_STYLES }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
