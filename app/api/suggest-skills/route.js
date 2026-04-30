import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const { skill } = await request.json()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `You are a career profile assistant. A user typed a skill to add to their profile.

User input: "${skill}"

Respond with ONLY valid JSON, no markdown, no backticks.

Rules:
1. If input is gibberish, random letters, or not a real professional skill — return: {"gibberish": true}
2. If input is already a clear, specific professional skill (e.g. "Python", "Project Management", "Figma", "SQL", "Financial Modelling") — return: {"exact": true, "normalized": "Python"}
   - Use the normalized field to fix capitalisation (e.g. "python" → "Python", "sql" → "SQL", "ms excel" → "Microsoft Excel")
3. If input is vague or could mean multiple skills — return up to 4 specific suggestions:
   {"suggestions": ["Financial Modelling", "Financial Analysis", "FP&A", "Budgeting & Forecasting"]}`,
        },
      ],
    })

    const text = message.content[0].text
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()

    const data = JSON.parse(text)
    return NextResponse.json(data)

  } catch (error) {
    console.error('Suggest skills error:', error)
    return NextResponse.json({ exact: true }) // Fail gracefully
  }
}