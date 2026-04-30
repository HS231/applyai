import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const { title } = await request.json()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `You are a job search expert. A user has typed a job title into a job search app.

User input: "${title}"

Respond with ONLY valid JSON, no markdown, no backticks.

Rules:
1. If the input is gibberish, random letters, or not a real job concept — return: {"gibberish": true}
2. If the input is already a specific, searchable job title (e.g. "Software Engineer", "Financial Analyst") — return: {"exact": true}
3. If the input is vague or too broad (e.g. "finance", "marketing", "tech") — return 3 specific alternatives that would get more job matches, with a short reason for each

For case 3, return:
{
  "suggestions": [
    {"title": "Financial Analyst", "reason": "High volume of postings, matches finance background"},
    {"title": "Investment Analyst", "reason": "Strong demand in Toronto financial sector"},
    {"title": "FP&A Analyst", "reason": "Fast-growing role in corporate finance teams"}
  ]
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

    const data = JSON.parse(text)
    return NextResponse.json(data)

  } catch (error) {
    console.error('Suggest titles error:', error)
    return NextResponse.json({ exact: true }) // Fail gracefully
  }
}