export default function StepTracker({ current }) {
  const steps = ['Resume', 'Role & goals', 'Location & salary', 'Work style']

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
      {steps.map((label, i) => {
        const num = i + 1
        const done = num < current
        const active = num === current

        return (
          <div key={num} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
            {/* Circle */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 500,
                background: done ? 'var(--purple)' : active ? 'var(--purple-light)' : 'var(--bg-secondary)',
                border: active ? '1.5px solid var(--purple)' : done ? 'none' : '1px solid var(--border)',
                color: done ? 'white' : active ? 'var(--purple-dark)' : 'var(--text-hint)',
                transition: 'all 0.3s',
                flexShrink: 0,
              }}>
                {done ? '✓' : num}
              </div>
              <span style={{
                fontSize: 10, whiteSpace: 'nowrap',
                color: active ? 'var(--purple-dark)' : 'var(--text-hint)',
                fontWeight: active ? 500 : 400,
              }}>
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 1.5, marginBottom: 18,
                background: done ? 'var(--purple)' : 'var(--border)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}