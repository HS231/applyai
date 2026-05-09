import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function detectVertical(jobTitle, jobDescription) {
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 20,
      messages: [{
        role: 'user',
        content: `What is the primary vertical of this job? Return ONLY one word from this list: consulting, finance, tech, marketing, sales, other

Job title: ${jobTitle}
Job description: ${(jobDescription || '').slice(0, 300)}

Examples:
- Management Consultant, Strategy Analyst, Advisory, BCG, McKinsey -> consulting
- Financial Analyst, Investment Banking, Accounting, FP&A -> finance
- Software Engineer, Product Manager, Data Scientist -> tech
- Marketing Manager, Brand Manager, Growth -> marketing
- Account Executive, Sales Manager, Business Development -> sales`
      }]
    })
    const vertical = msg.content[0].text.trim().toLowerCase()
    const valid = ['consulting', 'finance', 'tech', 'marketing', 'sales', 'other']
    return valid.includes(vertical) ? vertical : 'other'
  } catch {
    return 'other'
  }
}

async function getResumeTemplate(vertical) {
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
  } catch {
    return null
  }
}

export async function POST(request) {
  try {
    const { job, profile } = await request.json()

    const experience = (profile.experience || [])
      .map(e => `${e.title} at ${e.company}${e.duration ? ' (' + e.duration + ')' : ''}`)
      .join('\n')

    const resumeText = profile.resume_text || ''

    const vertical = await detectVertical(job.title, job.description)
    const template = await getResumeTemplate(vertical)

    console.log('Detected vertical:', vertical)
    console.log('Template found:', template?.vertical || 'none')

    const templateSection = template
      ? `RESUME TEMPLATE TO FOLLOW (structure, format, and bullet style only — use the USER'S actual experience, not the template person's):
${template.resume_text}`
      : ''

    const [resumeMsg, coverMsg] = await Promise.all([

      anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        messages: [{
          role: 'user',
          content: `You are an expert resume writer. Create a tailored, ATS-optimised resume for this candidate applying to this specific job.

CANDIDATE PROFILE:
Name: ${profile.name || ''}
Email: ${profile.email || ''}
Skills: ${(profile.skills || []).join(', ')}
Experience: ${experience}
Industries: ${(profile.industries || []).join(', ')}

FULL RESUME TEXT (primary source — use ALL specific details, numbers, achievements from here):
${resumeText.slice(0, 3000)}

JOB:
Title: ${job.title}
Company: ${job.company}
Description: ${(job.description || '').slice(0, 800)}
Key strengths: ${(job.strengths || []).join(', ')}

${templateSection}

STRICT RULES:
1. First line: candidate full name only
2. Second line: phone | email | linkedin (extract from resume text)
3. Use EXACTLY these section headers in this order: SUMMARY, EDUCATION, EXPERIENCE, SKILLS, ADDITIONAL INTERESTS
4. For each role under EXPERIENCE format EXACTLY as:
   Company Name | City, Country
   **Job Title | YEAR - YEAR**
   - bullet point starting with action verb
   - bullet point
5. For each entry under EDUCATION format EXACTLY as:
   Institution Name | City, Country
   Degree | YEAR - YEAR
   - achievement or award bullet if present in resume (GPA, rankings, competitions, awards)
   Only include education bullets if there is actual content from the resume
6. ADDITIONAL INTERESTS section: extract community involvement, leadership, volunteering, extracurriculars, hobbies, certifications from the resume. Use bullets where content exists. If nothing found, omit the section.
7. Bullet points MUST follow this style: Action verb + what you did + quantified result + impact
   Example: "Led a team of 3 to develop market entry strategy; delivered recommendations in 6 weeks that influenced USD 2Mn investment decision"
8. Each bullet must be specific, quantified where possible, and outcome-focused
9. SKILLS: comma separated on one line, no bullets
10. SUMMARY: 2-3 lines tailored to this specific role at this company
11. ONE PAGE MAXIMUM — ruthlessly concise:
    - Maximum 3-4 bullets per role
    - Maximum 3 roles if experience is extensive
    - Each bullet maximum 20 words
    - Summary maximum 2 lines
    - Cut least relevant bullets first if over one page
12. Use ONLY actual experience from the resume — never fabricate
13. Mirror JD language and keywords throughout
14. No markdown except ** for bold job titles as shown above
15. No em dashes anywhere
16. No placeholders like [Phone] or [LinkedIn]`
        }]
      }),

      anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `You are an expert cover letter writer following the Rotman Commerce Career Services cover letter guide. Write a professional, tailored cover letter.

CANDIDATE:
Name: ${profile.name || ''}
Full resume text (use specific details, numbers, and achievements from here):
${resumeText.slice(0, 1500)}

JOB:
Title: ${job.title}
Company: ${job.company}
Why they are a good fit: ${(job.strengths || []).join(', ')}
Description: ${(job.description || '').slice(0, 800)}

COVER LETTER STRUCTURE:

Opening paragraph:
- State the position you are applying for
- Summarize your key qualifications that match their needs in 2-3 sentences
- Show enthusiasm for the position and organization
- Demonstrate you have researched the company

Body paragraph 1:
- Elaborate on your most relevant experience with specific numbers and achievements from the resume
- Connect your skills directly to what the employer needs
- Use concrete examples

Body paragraph 2:
- Highlight a second strength or differentiator
- Show knowledge of the organization and industry
- Focus on what you can contribute, not what you will gain

Closing paragraph:
- Thank the employer for considering your application
- Reiterate one key contribution you can make
- Express enthusiasm to discuss your suitability in an interview

STRICT RULES:
1. Start with: Dear Hiring Manager,
2. One page maximum, 4 paragraphs total
3. Professional, confident tone
4. Use specific achievements and numbers from the resume
5. Mirror the language from the job description
6. No clichés: no "I am writing to express my interest", no "passionate about", no "great fit"
7. Active voice throughout
8. Plain text only, no markdown
9. End with: Sincerely, then candidate name on the next line
10. No em dashes anywhere. Use commas, periods, or rewrite the sentence instead
11. Do not fabricate any experience not in the resume
12. Do not mention where the job was found or reference any careers portal`
        }]
      })
    ])

    return NextResponse.json({
      resume: resumeMsg.content[0].text,
      coverLetter: coverMsg.content[0].text,
      vertical,
    })

  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
