import { NextResponse } from 'next/server'
import { buildResumeHTML } from '../route'

export async function POST(request) {
  try {
    const { resumeData } = await request.json()
    const resumeHTML = buildResumeHTML(resumeData)
    return NextResponse.json({ resumeHTML })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
