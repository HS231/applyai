'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import StepTracker from '@/components/StepTracker'
import Step1Resume from '@/components/onboarding/Step1Resume'
import Step2Role from '@/components/onboarding/Step2Role'
import Step3Location from '@/components/onboarding/Step3Location'
import Step4WorkStyle from '@/components/onboarding/Step4WorkStyle'
import StepDone from '@/components/onboarding/StepDone'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState({
    // Step 1
    resumeText: '',
    skills: [],
    experience: [],
    // Step 2
    targetRole: '',
    seniority: '',
    industries: [],
    // Step 3
    location: '',
    workArrangement: 'remote',
    salaryMin: 80000,
    currency: 'CAD',
    // Step 4
    companySize: '',
    urgency: '',
    digestFrequency: 'daily',
  })

  function updateProfile(fields) {
    setProfile(prev => ({ ...prev, ...fields }))
  }

  function next() { setStep(s => s + 1) }
  function back() { setStep(s => s - 1) }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}><img src="/Logo.png" alt="Robin" style={{ width: 32, height: 32, objectFit: 'contain', filter: 'drop-shadow(0 0 8px oklch(0.74 0.14 185))' }} /><span style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, fontWeight: 400, color: 'oklch(0.96 0.01 90)' }}>Robin</span></a>
        </div>

        {/* Step tracker */}
        {step <= 4 && <StepTracker current={step} />}

        {/* Steps */}
        {step === 1 && (
          <Step1Resume
            profile={profile}
            updateProfile={updateProfile}
            onNext={next}
          />
        )}
        {step === 2 && (
          <Step2Role
            profile={profile}
            updateProfile={updateProfile}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 3 && (
          <Step3Location
            profile={profile}
            updateProfile={updateProfile}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 4 && (
          <Step4WorkStyle
            profile={profile}
            updateProfile={updateProfile}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 5 && (
          <StepDone profile={profile} />
        )}
      </div>
    </div>
  )
}