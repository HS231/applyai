import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request) {
  try {
    const { job, profile } = await request.json()

    const experience = (profile.experience || [])
      .map(e => `${e.title} at ${e.company}${e.duration ? ' (' + e.duration + ')' : ''}`)
      .join('\n')

    const resumeText = profile.resume_text || ''

    const [resumeMsg, coverMsg] = await Promise.all([

      anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `You are an expert resume writer trained in Rotman School of Management resume standards. Create a tailored, ATS-optimised, one-page resume.

CANDIDATE PROFILE:
Name: ${profile.name || ''}
Email: ${profile.email || ''}
Skills: ${(profile.skills || []).join(', ')}
Experience: ${experience}
Industries: ${(profile.industries || []).join(', ')}

FULL RESUME TEXT (this is your primary source — use ALL specific details, numbers, achievements, and exact wording from here):
${resumeText.slice(0, 3000)}

JOB THEY ARE APPLYING TO:
Title: ${job.title}
Company: ${job.company}
Description: ${(job.description || '').slice(0, 1200)}
Key strengths match: ${(job.strengths || []).join(', ')}
Gaps to address: ${(job.gaps || []).join(', ')}

STRICT FORMATTING RULES:
1. First line: candidate full name only
2. Second line: phone | email | linkedin (extract all three from the resume text above — use exact values)
3. Blank line after contact
4. Use EXACTLY these section headers in EXACTLY this order (uppercase):
   SUMMARY
   EDUCATION
   SKILLS
   EXPERIENCE
   COMMUNITY AND LEADERSHIP
5. For each role under EXPERIENCE and EDUCATION format EXACTLY like:
   Company Name | City, Country
   Job Title | YEAR – YEAR
   - bullet using real achievement from resume
   - bullet using real achievement from resume
6. Bullets start with - (dash space)
7. SKILLS: comma separated on one line, no bullets
8. SUMMARY: 2-3 lines tailored to ${job.company} role, use specific background from resume
9. COMMUNITY AND LEADERSHIP: use the actual community involvement from the resume — never use placeholders
10. One page max — 3-4 bullets per role, be concise
11. Use ONLY actual data from the resume — never use placeholders like [Phone] or [LinkedIn URL]
12. Mirror JD language and keywords throughout
13. Preserve all specific numbers and achievements from the original (20%, $4B, 1000+, etc.)
14. ATS compliant — no tables, no columns, no special characters except dash bullets
15. No markdown, no asterisks, no hash symbols

Output the resume now. Start with candidate name on line 1.`
        }]
      }),

      anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: `You are an expert cover letter writer. Write a compelling, personalised cover letter.

CANDIDATE:
Name: ${profile.name || ''}
Full resume text (use specific details and achievements from here):
${resumeText.slice(0, 1500)}

JOB:
Title: ${job.title}
Company: ${job.company}
Why they are a good fit: ${(job.strengths || []).join(', ')}
Description: ${(job.description || '').slice(0, 800)}

RULES:
1. Strong specific hook about this company and role — never "I am writing to express my interest"
2. Paragraph 1 (2-3 sentences): Why this specific role at this specific company excites them
3. Paragraph 2 (3-4 sentences): Most relevant experience with specific achievements and numbers from resume
4. Paragraph 3 (2-3 sentences): A specific differentiator that addresses the role
5. Closing (1-2 sentences): Confident warm call to action
6. Tone: Confident, human, conversational
7. Under 350 words
8. No clichés: no "great fit", no "passionate about", no "I believe", no "I am excited to"
9. Plain text only — no markdown
10. Start with: Dear Hiring Manager,
11. Do not include name at the end

Write the cover letter now.`
        }]
      })
    ])

    return NextResponse.json({
      resume: resumeMsg.content[0].text,
      coverLetter: coverMsg.content[0].text,
    })

  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
