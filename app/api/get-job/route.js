import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { sessionId, jobId } = await request.json()

    const [{ data: job }, { data: profile }] = await Promise.all([
      supabase.from('jobs').select('*').eq('job_id', jobId).single(),
      supabase.from('profiles').select('*').eq('session_id', sessionId).single(),
    ])

    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    return NextResponse.json({ job, profile })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}