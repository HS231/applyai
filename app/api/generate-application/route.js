import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const RESUME_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
    background: #fff;
    font-size: 11px;
    line-height: 1.4;
    color: #000000;
  }
  body { margin: 0; padding: 0; }
  h1, h2, h3, h4, h5, h6 {
    font-family: Georgia, 'Times New Roman', serif;
    font-weight: 600;
    color: #000000;
    margin: 0;
    line-height: 1.2;
  }
  h1 { font-size: 18px; margin-bottom: 0.25rem; }
  h2 { font-size: 13px; margin-bottom: 0.5rem; letter-spacing: 0.01em; }
  h3 { font-size: 11.5px; margin-bottom: 0.2rem; }
  p { padding: 0; margin: 0 0 0.4rem 0; font-size: 10.5px; text-align: justify; color: #000000; }
  a { color: #000000; text-decoration: none; }
  ul { list-style: none; margin: 0; padding: 0; }
  *, *::before, *::after { box-sizing: border-box; }

  .wrapper { max-width: 800px; margin: 0 auto; padding: 1.8rem 2rem; }
  @media print {
    .wrapper { padding: 1rem 1.5rem; }
    @page { margin: 0.5cm; size: A4; }
  }

  .header { text-align: center; margin-bottom: 1rem; padding-bottom: 0.7rem; border-bottom: 2px solid #000000; }
  .header h1 { font-size: 18px; color: #000000; margin-bottom: 0.3rem; }
  .contacts { display: flex; flex-wrap: wrap; gap: 0.4rem 1.2rem; font-size: 10px; color: #000; justify-content: center; margin-top: 0.3rem; }

  .section { margin-bottom: 0.9rem; }
  .section-title { font-size: 12px; color: #000000; margin-bottom: 0.4rem; padding-bottom: 0.3rem; border-bottom: 1px solid #000000; }

  .edu-entry { margin-bottom: 0.5rem; }
  .exp-entry { margin-bottom: 0.7rem; }
  .entry-row { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 0.2rem; margin-bottom: 0.1rem; }
  .entry-name { font-size: 11px; color: #000000; font-weight: 600; font-family: Georgia, serif; }
  .entry-date { font-size: 10px; color: #000000; }
  .entry-sub { font-size: 10.5px; color: #000000; font-style: italic; margin-bottom: 0.2rem; }
  .entry-bullets { padding-left: 1.2rem; list-style: disc; margin-top: 0.2rem; }
  .entry-bullets li { font-size: 10px; line-height: 1.5; color: #000000; margin-bottom: 0.2rem; text-align: justify; }

  .skills-section { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem 1.5rem; }
  .skill-group { margin-bottom: 0.3rem; }
  .skill-name { font-size: 10.5px; font-weight: 600; color: #000000; font-family: Georgia, serif; }
  .skill-vals { font-size: 10px; color: #000000; line-height: 1.4; }

  .add-bullets { padding-left: 1.2rem; list-style: disc; }
  .add-bullets li { font-size: 10px; line-height: 1.5; color: #000000; margin-bottom: 0.2rem; text-align: justify; }
</style>
</head>
<body>
<div class="wrapper">

  <header class="header">
    <h1>{{NAME}}</h1>
    <div class="contacts">
      <span>{{PHONE}}</span>
      <span>{{EMAIL}}</span>
      <span>{{LINKEDIN}}</span>
    </div>
  </header>

  <section class="section" id="education">
    <h2 class="section-title">Education</h2>
    {{EDUCATION}}
  </section>

  <section class="section" id="experience">
    <h2 class="section-title">Experience</h2>
    {{EXPERIENCE}}
  </section>

  <section class="section" id="interests">
    <h2 class="section-title">Additional Interests</h2>
    <ul class="add-bullets">
      {{INTERESTS}}
    </ul>
  </section>

  <section class="section" id="skills">
    <h2 class="section-title">Skills</h2>
    <div class="skills-section">
      {{SKILLS}}
    </div>
  </section>

</div>
</body>
</html>`

async function detectVertical(jobTitle, jobDescription) {
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 20,
      messages: [{
        role: 'user',
        content: `What is the primary vertical of this job? Return ONLY one word: consulting, finance, tech, marketing, sales, other

Job title: ${jobTitle}
Job description: ${(jobDescription || '').slice(0, 200)}`
      }]
    })
    const v = msg.content[0].text.trim().toLowerCase()
    return ['consulting','finance','tech','marketing','sales','other'].includes(v) ? v : 'other'
  } catch { return 'other' }
}

async function getTemplateReference(vertical) {
  try {
    const { data } = await supabase
      .from('resume_templates')
      .select('resume_text, vertical')
      .eq('vertical', vertical)
      .single()
    if (data) return data
    const { data: fallback } = await supabase
      .from('resume_templates')
      .select('resume_text, vertical')
      .eq('vertical', 'consulting')
      .single()
    return fallback || null
  } catch { return null }
}

async function extractAllRoles(resumeText) {
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      messages: [{
        role: 'user',
        content: `Read this resume carefully and list every single job role held. This is a structure extraction task — preserve every title exactly as written.

Rules:
- If a person held 3 different titles at the same company, list all 3 as separate entries
- Never merge, combine, or omit any role
- Preserve the exact title as written in the resume
- Order from most recent to oldest

Return ONLY valid JSON, no markdown:
[
  {"company": "Company Name", "title": "Exact Job Title", "dates": "Year - Year"},
  {"company": "Company Name", "title": "Exact Job Title 2", "dates": "Year - Year"}
]

Resume:
${resumeText.slice(0, 3000)}`
      }]
    })
    const raw = msg.content[0].text.trim()
      .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const roles = JSON.parse(raw)
    console.log('Extracted roles:', JSON.stringify(roles))
    return roles
  } catch (e) {
    console.error('Failed to extract roles:', e)
    return []
  }
}

function extractEndYear(dateStr) {
  if (!dateStr) return 0
  const lower = dateStr.toLowerCase()
  if (lower.includes('present')) return 9999
  const years = dateStr.match(/\d{4}/g)
  if (!years) return 0
  return parseInt(years[years.length - 1])
}

export function buildResumeHTML(data) {
  const educationHTML = (data.education || []).map(function(e) {
    return `
    <div class="edu-entry">
      <div class="entry-row">
        <div class="entry-name">${e.institution}</div>
        <div class="entry-date">${e.dates}</div>
      </div>
      <div class="entry-sub">${e.degree}</div>
      ${e.bullets && e.bullets.length > 0 ? `
        <ul class="entry-bullets">
          ${e.bullets.map(function(b) { return '<li>' + b + '</li>' }).join('')}
        </ul>` : ''}
    </div>`
  }).join('')

  const experienceHTML = (data.experience || []).map(function(e) {
    return `
    <div class="exp-entry">
      <div class="entry-row">
        <div class="entry-name">${e.company}</div>
        <div class="entry-date">${e.dates}</div>
      </div>
      <div class="entry-sub">${e.title}${e.description ? ' &bull; ' + e.description : ''}</div>
      ${e.bullets && e.bullets.length > 0 ? `
        <ul class="entry-bullets">
          ${e.bullets.map(function(b) { return '<li>' + b + '</li>' }).join('')}
        </ul>` : ''}
    </div>`
  }).join('')

  const interestsHTML = (data.interests || []).map(function(i) { return '<li>' + i + '</li>' }).join('')

  const skillsHTML = (data.skills || []).map(function(s) {
    return `
    <div class="skill-group">
      <div class="skill-name">${s.category}</div>
      <div class="skill-vals">${s.items.join(' &bull; ')}</div>
    </div>`
  }).join('')

  return RESUME_TEMPLATE
    .replace('{{NAME}}', data.name || '')
    .replace('{{PHONE}}', data.phone || '')
    .replace('{{EMAIL}}', data.email || '')
    .replace('{{LINKEDIN}}', data.linkedin || '')
    .replace('{{EDUCATION}}', educationHTML)
    .replace('{{EXPERIENCE}}', experienceHTML)
    .replace('{{INTERESTS}}', interestsHTML)
    .replace('{{SKILLS}}', skillsHTML)
}

export async function POST(request) {
  try {
    const { job, profile } = await request.json()
    const resumeText = profile.resume_text || ''

    const [vertical, allRoles] = await Promise.all([
      detectVertical(job.title, job.description),
      extractAllRoles(resumeText)
    ])

    const templateRef = await getTemplateReference(vertical)
    console.log('Detected vertical:', vertical)

    const templateNote = templateRef
      ? `Use this resume as inspiration for bullet point style only — use the candidate's actual content:\n${templateRef.resume_text.slice(0, 1000)}`
      : ''

    const rolesListText = allRoles.length > 0
      ? `MANDATORY ROLE LIST — every one of these must appear as a separate entry in the experience array:
${allRoles.map(function(r, i) { return (i+1) + '. ' + r.title + ' at ' + r.company + ' (' + r.dates + ')' }).join('\n')}

Total roles that must appear in experience array: ${allRoles.length}`
      : ''

    const [resumeMsg, coverMsg] = await Promise.all([

      anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `You are an expert resume writer. Your task is to tailor this resume for a specific job while preserving its exact employment structure. Return ONLY valid JSON, no markdown, no backticks.

CANDIDATE RESUME:
${resumeText.slice(0, 3000)}

JOB:
Title: ${job.title}
Company: ${job.company}
Description: ${(job.description || '').slice(0, 600)}
Key strengths match: ${(job.strengths || []).join(', ')}

${rolesListText}

${templateNote}

STRUCTURE PRESERVATION RULES (NON-NEGOTIABLE):
- Preserve all multi-promotion company structures exactly as they appear in the source resume
- If a candidate held multiple roles at the same company, treat each title as a completely separate experience entry
- Never merge, compress, summarize, or omit any role — career progression is strategically important
- Never infer that two roles can be merged just because they are at the same company
- Never delete earlier roles for spacing purposes
- If space is an issue: reduce whitespace, tighten bullet wording, adjust margins BEFORE removing any role
- The source resume is the authoritative source for company structure, titles, promotions, and dates
- The experience array must contain exactly ${allRoles.length} entries matching the mandatory role list above

Return this exact JSON structure:
{
  "name": "Full name from resume",
  "phone": "Phone number",
  "email": "Email address",
  "linkedin": "LinkedIn URL or handle",
  "education": [
    {
      "institution": "University or school name",
      "dates": "Year - Year",
      "degree": "Degree name and location",
      "bullets": ["achievement", "achievement"]
    }
  ],
  "experience": [
    {
      "company": "Company name",
      "dates": "Month Year - Month Year",
      "title": "Job title exactly as in resume",
      "description": "One line company description if relevant, otherwise empty string",
      "bullets": ["Achievement with action verb + what + quantified result", "bullet 2", "bullet 3"]
    }
  ],
  "interests": ["Interest or community achievement as a single sentence"],
  "skills": [
    {
      "category": "Skill category name",
      "items": ["skill1", "skill2", "skill3"]
    }
  ]
}

ADDITIONAL RULES:
1. Use ONLY information from the resume, never fabricate
2. Tailor bullets to match the job description language and requirements
3. Bullet style: Action verb + what you did + quantified result + impact
4. Maximum 3 bullets per experience role
5. Maximum 3 bullets per education entry, only if achievements exist
6. Education bullets: only awards, GPA, competitions, programs
7. Skills: 2 to 4 categories, 4 to 6 items each, relevant to this job
8. Interests: 3 to 5 items from community, leadership, volunteering, awards
9. No em dashes anywhere, use commas or semicolons instead
10. Order experience from most recent to oldest`
        }]
      }),

      anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `You are an expert cover letter writer following the Rotman Commerce Career Services guide. Write a professional, tailored cover letter.

CANDIDATE:
Name: ${profile.name || ''}
Resume: ${resumeText.slice(0, 1500)}

JOB:
Title: ${job.title}
Company: ${job.company}
Why they fit: ${(job.strengths || []).join(', ')}
Description: ${(job.description || '').slice(0, 600)}

STRUCTURE:
Opening: State the position, summarize key qualifications, show enthusiasm and company research.
Body 1: Most relevant experience with specific numbers and achievements.
Body 2: Second differentiator, knowledge of the organization, what you can contribute.
Closing: Thank the employer, reiterate one key contribution, request an interview.

STRICT RULES:
1. Start with: Dear Hiring Manager,
2. Four paragraphs, one page maximum
3. Confident, professional tone
4. Specific achievements and numbers from the resume only
5. Mirror the job description language
6. No cliches: no "I am writing to express my interest", no "passionate about", no "great fit"
7. Active voice throughout
8. Plain text only, no markdown
9. End with: Sincerely, then candidate name on the next line
10. No em dashes anywhere
11. Do not mention where the job was found
12. Never fabricate anything not in the resume`
        }]
      })
    ])

    let resumeData
    try {
      const raw = resumeMsg.content[0].text
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim()
      resumeData = JSON.parse(raw)
    } catch (e) {
      console.error('Failed to parse resume JSON:', e)
      return NextResponse.json({ error: 'Failed to parse resume data' }, { status: 500 })
    }

    // Sort experience by end year descending
    resumeData.experience.sort(function(a, b) {
      return extractEndYear(b.dates) - extractEndYear(a.dates)
    })

    const resumeHTML = buildResumeHTML(resumeData)

    return NextResponse.json({
      resumeHTML,
      resumeData,
      coverLetter: coverMsg.content[0].text,
      vertical,
    })

  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
