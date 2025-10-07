import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Simple in-memory cache (reset on server restart)
let cachedMartyrs: any[] | null = null
let lastFetch = 0
const CACHE_TTL = 60 * 1000 // 1 minute

export async function GET(req: NextRequest) {
  try {
    const now = Date.now()
    if (cachedMartyrs && now - lastFetch < CACHE_TTL) {
      return NextResponse.json({ martyrs: cachedMartyrs })
    }

    const { data, error } = await supabase
      .from('martyrs')
      .select('*')
      .order('martyrdom_date', { ascending: false })

    if (error) throw error

    const list = (data ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      age: m.age,
      location: m.location,
      martyrdomDate: m.martyrdom_date,
      image: m.image_url || "/placeholder.svg?height=400&width=300&text=صورة+الشهيد",
      story: m.story || '',
      testament: m.testament || '',
      audioUrl: m.audio_url || '',
      tags: m.tags || [],
    }))

    cachedMartyrs = list
    lastFetch = now

    return NextResponse.json({ martyrs: list })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch martyrs', details: error.message },
      { status: 500 }
    )
  }
}