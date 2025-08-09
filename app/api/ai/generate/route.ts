import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = 'AIzaSyA190Cl9-hvJTh-al0ApMAadis0XJlBmoA'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('AI Generation Error:', error)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}