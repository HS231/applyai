import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const WEIGHTS = {
  title:      0.25,
  skills:     0.30,
  experience: 0.25,
  location:   0.10,
  culture:    0.10,
}

function calcScore(cats) {
  const raw =
    cats.title      * WEIGHTS.title      +
    cats.skills     * WEIGHTS.skills     +
    cats.experience * WEIGHTS.experience +
    cats.location   * WEIGHTS.location   +
    cats.culture    * WEIGHTS.culture
  return Math.min(10, Math.max(1, Math.round(raw * 10) / 10))
}

async function getExchangeRate(targetCurrency) {
  if (!targetCurrency || targetCurrency === 'USD') return 1
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD')
    const data = await res.json()
    return data.rates?.[targetCurrency] || 1
  } catch {
    return 1
  }
}

function formatSalary(usdMin, usdMax, currency, rate) {
  if (!usdMin) return 'Not listed'
  const min = Math.round(usdMin * rate)
  const max = Math.round((usdMax || usdMin) * rate)
  return `${currency} ${min.toLocaleString()}–${max.toLocaleString()}`
}

const LEGIT_SOURCES = [
  'linkedin', 'indeed', 'glassdoor', 'ziprecruiter', 'monster',
  'lever', 'workday', 'greenhouse', 'smartrecruiters', 'jobvite',
  'icims', 'taleo', 'bamboohr', 'myworkdayjobs', 'careers.',
  'jobs.', 'apply.', 'hiring', 'join.', 'recruit',
]

export async function POST(request) {
  try {
    const body = await request.json()
    const { sessionId } = body

    console.log('=== FETCH JOBS CALLED ===')
    console.log('Session ID:', sessionId)

    // 1. Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // 2. Get live exchange rate
    const userCurrency = profile.currency || 'USD'
    const exchangeRate = await getExchangeRate(userCurrency)

    // 3. Search for each role separately and merge
    const roles = (profile.target_role || '').split(',').map(r => r.trim()).filter(Boolean)
    let rawJobs = []

    for (const role of roles) {
      try {
        const locationTerm = profile.work_arrangement === 'remote'
          ? 'remote'
          : profile.location?.split(',')[0] || ''

        const roleQuery = encodeURIComponent(
          `${role} ${profile.seniority || ''} ${locationTerm}`.trim()
        )

        const res = await fetch(
          `https://jsearch.p.rapidapi.com/search?query=${roleQuery}&page=1&num_pages=5&date_posted=month&location=${encodeURIComponent(profile.location || '')}&radius=200`,
          {
            headers: {
              'x-rapidapi-host': 'jsearch.p.rapidapi.com',
              'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            },
          }
        )
        const data = await res.json()
        const jobs = data.data || []
        console.log(`Jobs for "${role}":`, jobs.length)

        // Deduplicate by job_id
        const existingIds = new Set(rawJobs.map(j => j.job_id))
        const newOnes = jobs.filter(j => !existingIds.has(j.job_id))
        rawJobs = [...rawJobs, ...newOnes]
      } catch (err) {
        console.error(`Search failed for role "${role}":`, err)
      }
    }

    console.log('Total jobs after all searches:', rawJobs.length)

    if (rawJobs.length === 0) {
      return NextResponse.json({ jobs: [] })
    }

    // 4. Filter by legitimate sources
    const filteredBySource = rawJobs.filter(job => {
      const url = (job.job_apply_link || '').toLowerCase()
      const publisher = (job.job_publisher || '').toLowerCase()
      return LEGIT_SOURCES.some(source =>
        url.includes(source) || publisher.includes(source)
      )
    })
    const sourceFiltered = filteredBySource.length >= 3 ? filteredBySource : rawJobs

    // 5. Filter by work arrangement
    let filteredJobs = sourceFiltered
    if (profile.work_arrangement === 'remote') {
      const remoteOnly = sourceFiltered.filter(j =>
        j.job_is_remote ||
        (j.job_description || '').toLowerCase().includes('remote') ||
        (j.job_title || '').toLowerCase().includes('remote')
      )
      filteredJobs = remoteOnly.length >= 3 ? remoteOnly : sourceFiltered
    }

    console.log('Jobs after filtering:', filteredJobs.length)

    // 6. Check cache in Supabase
    const jobIds = filteredJobs.slice(0, 20).map(j => j.job_id)
    const { data: existingJobs } = await supabase
      .from('jobs')
      .select('*')
      .in('job_id', jobIds)

    const existingJobMap = {}
    existingJobs?.forEach(j => { existingJobMap[j.job_id] = j })

    // 7. Score each job
    const scoredJobs = await Promise.all(
      filteredJobs.slice(0, 20).map(async (job) => {

        const requiredSkills = job.job_required_skills || []
        const experienceInfo = job.job_required_experience?.no_experience_required
          ? 'No experience required'
          : job.job_required_experience?.required_experience_in_months
          ? `${Math.round(job.job_required_experience.required_experience_in_months / 12)}+ years required`
          : 'Not specified'
        const educationInfo = job.job_required_education?.degree_level || 'Not specified'

        if (existingJobMap[job.job_id]) {
          const cached = existingJobMap[job.job_id]
          const convertedSalary = job.job_min_salary
            ? formatSalary(job.job_min_salary, job.job_max_salary, userCurrency, exchangeRate)
            : cached.salary
          return {
            id:          cached.job_id,
            title:       cached.title,
            company:     cached.company,
            logo:        job.employer_logo || null,
            publisher:   job.job_publisher || '',
            location:    cached.location,
            salary:      convertedSalary,
            type:        cached.job_type,
            url:         cached.url,
            description: cached.description,
            scores:      cached.scores || {},
            score:       Number(cached.score),
            reason:      cached.reason,
            strengths:   Array.isArray(cached.strengths) ? cached.strengths : [],
            gaps:        Array.isArray(cached.gaps) ? cached.gaps : [],
            topPick:     cached.top_pick,
            isRemote:    job.job_is_remote || false,
          }
        }

        try {
          const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 500,
            messages: [
              {
                role: 'user',
                content: `You are a career coach scoring a job match. Score each category 1-10. Return ONLY valid JSON with no markdown, no backticks, no explanation.

CANDIDATE:
- Target role: ${profile.target_role}
- Seniority: ${profile.seniority}
- Skills: ${(profile.skills || []).join(', ')}
- Experience: ${(profile.experience || []).map(e => `${e.title} at ${e.company}`).join(', ')}
- Industries of interest: ${(profile.industries || []).join(', ')}
- Location preference: ${profile.location}
- Work arrangement: ${profile.work_arrangement}
- Company size preference: ${profile.company_size}

JOB:
- Title: ${job.job_title}
- Company: ${job.employer_name}
- Location: ${job.job_city || 'Remote'}, ${job.job_country || ''}
- Remote: ${job.job_is_remote ? 'Yes' : 'No'}
- Type: ${job.job_employment_type || 'Full-time'}
- Required skills: ${requiredSkills.length > 0 ? requiredSkills.join(', ') : 'See description'}
- Required experience: ${experienceInfo}
- Required education: ${educationInfo}
- Qualifications: ${(job.job_highlights?.Qualifications || []).slice(0, 5).join(' | ')}
- Description: ${(job.job_description || '').slice(0, 500)}

RUBRIC — score each 1 to 10:
1. title (25%): Does job title and seniority match candidate target? Exact match=10, adjacent=7, different function=2
2. skills (30%): Compare candidate skills against required skills. What % does candidate have? 100%=10, 70%=7, 40%=4, 20%=2
3. experience (25%): Does candidate meet required experience? Met=9-10, close=6-8, under=3-5, far off=1-2
4. location (10%): Candidate wants "${profile.work_arrangement}" in "${profile.location}". Job remote: ${job.job_is_remote}. Match=10, partial=6, mismatch=2
5. culture (10%): Does company size and type match preference? Match=10, one tier off=6, two tiers off=3

For gaps: list ONLY concrete missing requirements from JD not in candidate profile.
For strengths: list specific matches between candidate and JD requirements.

{
  "title": 8,
  "skills": 7,
  "experience": 9,
  "location": 10,
  "culture": 7,
  "reason": "One sentence summary of fit",
  "strengths": ["Candidate has X which matches required skill Y"],
  "gaps": ["Missing: X from required skills", "Requires Y degree not listed in profile"]
}`,
              },
            ],
          })

          const text = message.content[0].text
            .trim()
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim()

          const cats = JSON.parse(text)
          const finalScore = calcScore(cats)

          const convertedSalary = job.job_min_salary
            ? formatSalary(job.job_min_salary, job.job_max_salary, userCurrency, exchangeRate)
            : job.job_salary_period
            ? `${userCurrency} ${Math.round((job.job_salary_min || 0) * exchangeRate).toLocaleString()}–${Math.round((job.job_salary_max || 0) * exchangeRate).toLocaleString()} / ${job.job_salary_period}`
            : 'Not listed'

          return {
            id:          job.job_id,
            title:       job.job_title,
            company:     job.employer_name,
            logo:        job.employer_logo || null,
            publisher:   job.job_publisher || '',
            location:    job.job_city ? `${job.job_city}, ${job.job_country}` : 'Remote',
            salary:      convertedSalary,
            type:        job.job_employment_type || 'Full-time',
            url:         job.job_apply_link,
            posted:      job.job_posted_at_datetime_utc,
            description: (job.job_description || '').slice(0, 300),
            isRemote:    job.job_is_remote || false,
            scores: {
              title:      cats.title,
              skills:     cats.skills,
              experience: cats.experience,
              location:   cats.location,
              culture:    cats.culture,
            },
            score:     finalScore,
            reason:    cats.reason || '',
            strengths: cats.strengths || [],
            gaps:      cats.gaps || [],
            topPick:   finalScore >= 8.0,
          }
        } catch (err) {
          console.error('Scoring error for job:', job.job_title, err)
          return null
        }
      })
    )

    // 8. Filter nulls, sort by score
    const validJobs = scoredJobs
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)

    // 9. Save new jobs to Supabase
    const newJobs = validJobs.filter(j => !existingJobMap[j.id])
    if (newJobs.length > 0) {
      await supabase.from('jobs').upsert(
        newJobs.map((job) => ({
          job_id:      job.id,
          session_id:  sessionId,
          title:       job.title,
          company:     job.company,
          location:    job.location,
          salary:      job.salary,
          job_type:    job.type,
          url:         job.url,
          description: job.description,
          scores:      job.scores,
          score:       job.score,
          reason:      job.reason,
          strengths:   job.strengths,
          gaps:        job.gaps,
          top_pick:    job.topPick,
          posted_at:   job.posted,
        })),
        { onConflict: 'job_id' }
      )
    }

    return NextResponse.json({ jobs: validJobs })

  } catch (error) {
    console.error('Fetch jobs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs: ' + error.message },
      { status: 500 }
    )
  }
}