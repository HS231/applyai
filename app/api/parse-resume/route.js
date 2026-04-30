import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { extractText } from 'unpdf'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    // 1. Get the uploaded file
    const formData = await request.formData()
    const file = formData.get('resume')

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // 2. Convert to buffer and extract text
    const bytes = await file.arrayBuffer()
    const buffer = new Uint8Array(bytes)

    const { text: rawText } = await extractText(buffer, { mergePages: true })

    if (!rawText || rawText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF' },
        { status: 400 }
      )
    }

    // 3. Send to Claude to extract structured data
    const message = await anthropic.messages.create({
      //model: 'claude-sonnet-4-20250514',
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a resume parser. Extract structured information from this resume.

Return ONLY valid JSON with no explanation, no markdown, no backticks.
Use exactly this structure:

{
  "name": "Full name",
  "email": "email or empty string",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "duration": "e.g. 2021–2024"
    }
  ]
}

Rules:
- skills: 6 to 12 specific skills (tools, languages, frameworks, methodologies)
- experience: most recent first, maximum 5 entries
- If something is not found use empty string or empty array

Resume:
${rawText}`,
        },
      ],
    })

    // 4. Parse Claude's response
    const responseText = message.content[0].text.trim()

    let profileData
    try {
      profileData = JSON.parse(responseText)
    } catch {
      console.error('Claude response was not valid JSON:', responseText)
      return NextResponse.json({
        rawText,
        name: '',
        email: '',
        skills: [],
        experience: [],
      })
    }

    // 5. Return to frontend
    return NextResponse.json({
      rawText,
      name: profileData.name || '',
      email: profileData.email || '',
      skills: Array.isArray(profileData.skills) ? profileData.skills : [],
      experience: Array.isArray(profileData.experience) ? profileData.experience : [],
    })

  } catch (error) {
    console.error('Parse resume error:', error)
    return NextResponse.json(
      { error: 'Failed to parse resume: ' + error.message },
      { status: 500 }
    )
  }
}