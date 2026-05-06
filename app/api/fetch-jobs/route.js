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

function parseSalaryString(salaryStr) {
  if (!salaryStr) return { min: null, max: null }
  const lower = salaryStr.toLowerCase()
  const numbers = salaryStr.replace(/,/g, '').match(/\d+(\.\d+)?/g)
  if (!numbers || numbers.length === 0) return { min: null, max: null }
  let min = parseFloat(numbers[0])
  let max = numbers.length > 1 ? parseFloat(numbers[1]) : min
  if (lower.includes('hour') || lower.includes('/hr') || lower.includes('per hour')) {
    min = min * 40 * 52; max = max * 40 * 52
  } else if (lower.includes('month') || lower.includes('/mo')) {
    min = min * 12; max = max * 12
  } else if (lower.includes('day') || lower.includes('/day')) {
    min = min * 260; max = max * 260
  } else if (!lower.includes('year') && !lower.includes('annual') && !lower.includes('/yr')) {
    if (min < 500) { min = min * 40 * 52; max = max * 40 * 52 }
    else if (min < 10000) { min = min * 12; max = max * 12 }
  }
  return { min, max }
}

function formatSalary(min, max, currency, rate) {
  if (!min) return 'Not listed'
  const convertedMin = Math.round(min * rate)
  const convertedMax = Math.round((max || min) * rate)
  return `${currency} ${convertedMin.toLocaleString()}–${convertedMax.toLocaleString()} / year`
}

async function expandRole(role) {
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `You are a job search expert. Given a job title, return the original (spelling-corrected) plus 2 adjacent similar titles.

Job title: "${role}"

Return ONLY a JSON array of 3 strings max, no markdown.
Example: ["Financial Manager", "Finance Manager", "FP&A Manager"]`
      }]
    })
    const text = msg.content[0].text.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const expanded = JSON.parse(text)
    return Array.isArray(expanded) ? expanded.slice(0, 3) : [role]
  } catch {
    return [role]
  }
}

async function extractSalaryFromJD(jd) {
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `Read this job description and extract the salary if mentioned.

Rules:
- Convert everything to ANNUAL USD (hourly x40x52, daily x260, monthly x12)
- If salary is NOT clearly mentioned, return null
- Do NOT guess

Return ONLY valid JSON:
{"salary_min": 80000, "salary_max": 100000}
or
{"salary_min": null, "salary_max": null}

Job description:
${jd.slice(0, 1000)}`
      }]
    })
    const text = msg.content[0].text.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    return JSON.parse(text)
  } catch {
    return { salary_min: null, salary_max: null }
  }
}

async function extractJobTypeFromJD(jd) {
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: `What is the employment type in this job description? Return ONLY one of: "Full-time", "Part-time", "Contract", "Internship", or null if unclear. No other text.\n\nJD: ${jd.slice(0, 500)}`
      }]
    })
    const text = msg.content[0].text.trim().replace(/"/g, '')
    const valid = ['Full-time', 'Part-time', 'Contract', 'Internship']
    return valid.includes(text) ? text : null
  } catch {
    return null
  }
}

async function normalizeLocation(raw) {
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 50,
      messages: [{
        role: 'user',
        content: `Convert this location to the shortest form that works with Google Jobs search. Return ONLY the location string, nothing else. No quotes, no explanation.

Rules:
- Two parts maximum, never three
- City + Country ONLY: "London, United Kingdom" or "Sydney, Australia" or "Paris, France"
- Never use abbreviations for countries: "United Kingdom" not "UK", "United States" not "US" or "USA", "Australia" not "AUS"
- No postal codes, no extra words

Examples:
"Sydney, NSW, Australia" -> Sydney, Australia
"London, England, UK" -> London, United Kingdom
"Toronto, ON, Canada" -> Toronto, Canada
"Dubai, UAE" -> Dubai, United Arab Emirates

Location: ${raw}`
      }]
    })
    return msg.content[0].text.trim()
  } catch {
    return raw
  }
}

function getSourcePriority(applyOptions) {
  const PRIORITY_SOURCES = [
    { keywords: ['linkedin'], score: 100 },
    { keywords: ['glassdoor'], score: 90 },
    { keywords: ['indeed'], score: 85 },
    { keywords: ['lever', 'greenhouse', 'workday', 'myworkdayjobs', 'smartrecruiters',
                  'jobvite', 'icims', 'taleo', 'bamboohr', 'ashbyhq', 'rippling',
                  'successfactors', 'oraclecloud', 'recruitee'], score: 80 },
    { keywords: ['careers.', 'jobs.', 'apply.', 'career.', 'work.'], score: 70 },
    { keywords: ['ziprecruiter', 'monster', 'careerbuilder'], score: 50 },
  ]
  if (!applyOptions || applyOptions.length === 0) return 0
  let best = 0
  for (const option of applyOptions) {
    const url = (option.link || '').toLowerCase()
    const title = (option.title || '').toLowerCase()
    for (const source of PRIORITY_SOURCES) {
      if (source.keywords.some(k => url.includes(k) || title.includes(k))) {
        best = Math.max(best, source.score)
      }
    }
  }
  return best
}

function parsePostedDays(postedStr) {
  if (!postedStr) return 999
  const lower = postedStr.toLowerCase()
  if (lower.includes('hour') || lower.includes('just') || lower.includes('today')) return 0
  if (lower.includes('yesterday') || lower === '1 day ago') return 1
  const match = lower.match(/(\d+)\s*(day|week|month)/)
  if (!match) return 999
  const num = parseInt(match[1])
  if (match[2] === 'day') return num
  if (match[2] === 'week') return num * 7
  if (match[2] === 'month') return num * 30
  return 999
}

const STAFFING_AGENCIES = [
  'robert half', 'hays', 'randstad', 'manpower', 'adecco',
  'kelly services', 'staffmark', 'spherion', 'insight global',
  'aston carter', 'kforce', 'teksystems', 'modis', 'apex systems',
]

export async function POST(request) {
  try {
    const body = await request.json()
    const { sessionId } = body

    console.log('=== FETCH JOBS CALLED ===')

    // 1. Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('session_id', sessionId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // 2. Exchange rate
    const userCurrency = profile.currency || 'USD'
    const exchangeRate = await getExchangeRate(userCurrency)

    // 3. Normalize location using Claude
    let locationTerm = ''
    if (profile.work_arrangement !== 'remote' && profile.location) {
      locationTerm = await normalizeLocation(profile.location)
    }
    console.log('Location being sent to SerpAPI:', locationTerm)
    const location = encodeURIComponent(locationTerm)

    // 4. Expand roles
    const inputRoles = (profile.target_role || '').split(',').map(r => r.trim()).filter(Boolean)
    const expandedArrays = await Promise.all(inputRoles.map(r => expandRole(r)))
    const allRoles = [...new Set(expandedArrays.flat())]
    console.log('All roles to search:', allRoles)

    // 5. Search SerpAPI
    let rawJobs = []
    for (const role of allRoles) {
      try {
        const q = encodeURIComponent(role)
        const countryToGL = {
  'australia': 'au',
  'united kingdom': 'gb',
  'canada': 'ca',
  'india': 'in',
  'germany': 'de',
  'france': 'fr',
  'singapore': 'sg',
}
const locationLower = locationTerm.toLowerCase()
const gl = Object.entries(countryToGL).find(([country]) => locationLower.includes(country))?.[1] || 'us'

const res = await fetch(
  `https://serpapi.com/search.json?engine=google_jobs&q=${q}&location=${location}&hl=en&gl=${gl}&api_key=${process.env.SERPAPI_KEY}`,
)
        const data = await res.json()
        const jobs = data.jobs_results || []
        console.log(`Jobs for "${role}":`, jobs.length)
        const existingIds = new Set(rawJobs.map(j => j.job_id))
        const newOnes = jobs.filter(j => !existingIds.has(j.job_id))
        rawJobs = [...rawJobs, ...newOnes]
      } catch (err) {
        console.error(`Search failed for "${role}":`, err)
      }
    }

    console.log('Total raw jobs:', rawJobs.length)
    if (rawJobs.length === 0) return NextResponse.json({ jobs: [] })

    // 6. Filter staffing agencies
    const noStaffing = rawJobs.filter(job => {
      const employer = (job.company_name || '').toLowerCase()
      return !STAFFING_AGENCIES.some(agency => employer.includes(agency))
    })
    let filteredJobs = noStaffing.length >= 3 ? noStaffing : rawJobs

    // 7. Filter remote
    if (profile.work_arrangement === 'remote') {
      const remoteOnly = filteredJobs.filter(j =>
        j.detected_extensions?.work_from_home ||
        (j.description || '').toLowerCase().includes('remote') ||
        (j.title || '').toLowerCase().includes('remote')
      )
      filteredJobs = remoteOnly.length >= 3 ? remoteOnly : filteredJobs
    }

    // 8. Sort by source priority then date
    filteredJobs.sort((a, b) => {
      const aPriority = getSourcePriority(a.apply_options)
      const bPriority = getSourcePriority(b.apply_options)
      if (bPriority !== aPriority) return bPriority - aPriority
      return parsePostedDays(a.detected_extensions?.posted_at) - parsePostedDays(b.detected_extensions?.posted_at)
    })

    console.log('Jobs after filtering:', filteredJobs.length)

    // 9. Check cache
    const jobIds = filteredJobs.slice(0, 20).map(j => j.job_id)
    const { data: existingJobs } = await supabase.from('jobs').select('*').in('job_id', jobIds)
    const existingJobMap = {}
    existingJobs?.forEach(j => { existingJobMap[j.job_id] = j })

    // 10. Score jobs
    const scoredJobs = await Promise.all(
      filteredJobs.slice(0, 20).map(async (job) => {
        const jd = job.description || ''
        const salaryStr = job.detected_extensions?.salary || ''
        const scheduleType = job.detected_extensions?.schedule_type || null
        const isRemote = job.detected_extensions?.work_from_home || false
        const postedAt = job.detected_extensions?.posted_at || ''
        const applyUrl = job.apply_options?.[0]?.link || job.share_link || ''
        const logo = job.thumbnail || null
        const publisher = job.apply_options?.[0]?.title || ''
        const qualifications = job.job_highlights?.find(h => h.title === 'Qualifications')?.items || []
        const responsibilities = job.job_highlights?.find(h => h.title === 'Responsibilities')?.items || []

        let { min: salaryMin, max: salaryMax } = parseSalaryString(salaryStr)
        if (!salaryMin && jd) {
          const extracted = await extractSalaryFromJD(jd)
          salaryMin = extracted.salary_min || null
          salaryMax = extracted.salary_max || null
        }

        let jobType = scheduleType
        if (!jobType && jd) jobType = await extractJobTypeFromJD(jd)
        jobType = jobType || 'Full-time'

        const convertedSalary = formatSalary(salaryMin, salaryMax, userCurrency, exchangeRate)

        if (existingJobMap[job.job_id]) {
          const cached = existingJobMap[job.job_id]
          return {
            id: cached.job_id, title: cached.title, company: cached.company,
            logo, publisher, location: cached.location,
            salary: convertedSalary !== 'Not listed' ? convertedSalary : cached.salary,
            type: jobType, url: cached.url, description: cached.description,
            scores: cached.scores || {}, score: Number(cached.score),
            reason: cached.reason,
            strengths: Array.isArray(cached.strengths) ? cached.strengths : [],
            gaps: Array.isArray(cached.gaps) ? cached.gaps : [],
            topPick: cached.top_pick, isRemote, posted: postedAt,
          }
        }

        try {
          const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 500,
            messages: [{
              role: 'user',
              content: `You are a career coach scoring a job match. Score each category 1-10. Return ONLY valid JSON, no markdown.

CANDIDATE:
- Target role: ${profile.target_role}
- Seniority: ${profile.seniority}
- Skills: ${(profile.skills || []).join(', ')}
- Experience: ${(profile.experience || []).map(e => `${e.title} at ${e.company}`).join(', ')}
- Industries: ${(profile.industries || []).join(', ')}
- Location: ${profile.location}
- Work arrangement: ${profile.work_arrangement}
- Company size preference: ${profile.company_size}

JOB:
- Title: ${job.title}
- Company: ${job.company_name}
- Location: ${job.location}
- Remote: ${isRemote ? 'Yes' : 'No'}
- Type: ${jobType}
- Salary: ${convertedSalary}
- Qualifications: ${qualifications.slice(0, 5).join(' | ')}
- Responsibilities: ${responsibilities.slice(0, 3).join(' | ')}
- Description: ${jd.slice(0, 500)}

RUBRIC:
1. title (25%): Exact=10, adjacent=7, different function=2
2. skills (30%): 100%=10, 70%=7, 40%=4, 20%=2
3. experience (25%): Met=9-10, close=6-8, under=3-5, far=1-2
4. location (10%): Match=10, partial=6, mismatch=2
5. culture (10%): Match=10, one tier off=6, two tiers=3

{"title":8,"skills":7,"experience":9,"location":10,"culture":7,"reason":"One sentence","strengths":["match"],"gaps":["gap"]}`
            }]
          })

          const text = message.content[0].text
            .trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
          const cats = JSON.parse(text)
          const finalScore = calcScore(cats)

          return {
            id: job.job_id, title: job.title, company: job.company_name,
            logo, publisher, location: job.location,
            salary: convertedSalary, type: jobType, url: applyUrl,
            posted: postedAt, description: jd.slice(0, 300), isRemote,
            scores: { title: cats.title, skills: cats.skills, experience: cats.experience, location: cats.location, culture: cats.culture },
            score: finalScore, reason: cats.reason || '',
            strengths: cats.strengths || [], gaps: cats.gaps || [],
            topPick: finalScore >= 8.0,
          }
        } catch (err) {
          console.error('Scoring error:', job.title, err)
          return null
        }
      })
    )

    // 11. Sort final results
    const validJobs = scoredJobs.filter(Boolean).sort((a, b) => {
      const aPriority = getSourcePriority(filteredJobs.find(j => j.job_id === a.id)?.apply_options || [])
      const bPriority = getSourcePriority(filteredJobs.find(j => j.job_id === b.id)?.apply_options || [])
      const aFinal = (a.score * 0.6) + (aPriority / 100 * 4)
      const bFinal = (b.score * 0.6) + (bPriority / 100 * 4)
      return bFinal - aFinal
    })

    // 12. Save to Supabase
    const newJobs = validJobs.filter(j => !existingJobMap[j.id])
    if (newJobs.length > 0) {
      await supabase.from('jobs').upsert(
        newJobs.map((job) => ({
          job_id: job.id, session_id: sessionId,
          title: job.title, company: job.company, location: job.location,
          salary: job.salary, job_type: job.type, url: job.url,
          description: job.description, scores: job.scores, score: job.score,
          reason: job.reason, strengths: job.strengths, gaps: job.gaps,
          top_pick: job.topPick, posted_at: job.posted,
        })),
        { onConflict: 'job_id' }
      )
    }

    return NextResponse.json({ jobs: validJobs })

  } catch (error) {
    console.error('Fetch jobs error:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs: ' + error.message }, { status: 500 })
  }
}
