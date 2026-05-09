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

COVER LETTER STRUCTURE — follow this exactly:

Opening paragraph:
- State the position you are applying for and where you found it
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
- End with "Sincerely," followed by the candidate name on a new line

STRICT RULES:
1. Start with: Dear Hiring Manager,
2. One page maximum, 4 paragraphs total
3. Professional, confident tone — not stiff
4. Use specific achievements and numbers from the resume
5. Mirror the language from the job description
6. No clichés: no "I am writing to express my interest", no "passionate about", no "great fit"
7. Active voice throughout
8. Plain text only, no markdown
9. End with: Sincerely, then candidate name on the next line
10. No em dashes anywhere. Use commas, periods, or rewrite the sentence instead
11. Do not fabricate any experience, numbers, or achievements not in the resume
12. Do not mention where the job was found or reference any careers portal

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
