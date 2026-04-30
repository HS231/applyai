import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const body = await request.json()

    // Generate a simple session ID if none exists
    const sessionId = body.sessionId || crypto.randomUUID()

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        session_id:       sessionId,
        name:             body.name || '',
        email:            body.email || '',
        target_role:      body.targetRole || '',
        seniority:        body.seniority || '',
        industries:       body.industries || [],
        location:         body.location || '',
        work_arrangement: body.workArrangement || '',
        salary_min:       body.salaryMin || 0,
        currency:         body.currency || 'CAD',
        company_size:     body.companySize || '',
        urgency:          body.urgency || '',
        digest_frequency: body.digestFrequency || 'daily',
        skills:           body.skills || [],
        experience:       body.experience || [],
        resume_text:      body.resumeText || '',
      }, {
        onConflict: 'session_id'
      })
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, sessionId, data })

  } catch (error) {
    console.error('Save profile error:', error)
    return NextResponse.json(
      { error: 'Failed to save profile: ' + error.message },
      { status: 500 }
    )
  }
}