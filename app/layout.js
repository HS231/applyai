import './globals.css'

export const metadata = {
  title: 'applyAI — Your pocket career coach',
  description: 'Find, match, tailor and apply to jobs in under 3 minutes',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}