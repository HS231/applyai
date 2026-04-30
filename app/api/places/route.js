import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const input = searchParams.get('input')

    if (!input || input.length < 2) {
      return NextResponse.json({ predictions: [] })
    }

    const apiKey = process.env.GOOGLE_PLACES_KEY
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=(cities)&key=${apiKey}`

    const res = await fetch(url)
    const data = await res.json()

    return NextResponse.json({
      predictions: (data.predictions || []).map(p => p.description)
    })

  } catch (error) {
    console.error('Places proxy error:', error)
    return NextResponse.json({ predictions: [] })
  }
}