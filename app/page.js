import { redirect } from 'next/navigation'

export default function Home() {
  // Root "/" redirects straight to onboarding
  redirect('/onboarding')
}