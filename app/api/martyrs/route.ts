import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
// If you have this service, keep it:
import { martyrService } from '@/services/martyrService' // adjust path if needed

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// In-memory cache (resets on server restart)
let cachedMartyrs: any[] | null = null
let lastFetch = 0
const CACHE_TTL = 60 * 1000 // 1 minute

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit')
    const now = Date.now()

    // Return from cache if recent
    if (cachedMartyrs && now - lastFetch < CACHE_TTL) {
      const list = limit
        ? cachedMartyrs.slice(0, parseInt(limit))
        : cachedMartyrs

      return NextResponse.json({
        martyrs: list,
        total: cachedMartyrs.length,
        returned: list.length,
        cached: true
      })
    }

    // Prefer fetching via service if available
    let allMartyrs: any[]

    if (typeof martyrService?.getAllMartyrs === 'function') {
      allMartyrs = await martyrService.getAllMartyrs()
    } else {
      // fallback to Supabase direct fetch
      const { data, error } = await supabase
        .from('martyrs')
        .select('*')
        .order('martyrdom_date', { ascending: false })

      if (error) throw error
      allMartyrs = data ?? []
    }

    const list = allMartyrs.map((m: any) => ({
      id: m.id,
      name: m.personalInfo?.name || m.name,
      age: m.personalInfo?.age || m.age,
      location:
        m.personalInfo?.martyrdomPlace ||
        m.location ||
        m.personalInfo?.placeOfBirth,
      martyrdomDate: m.personalInfo?.martyrdomDate || m.martyrdom_date,
      image:
        m.mediaAssets?.profileImage?.url ||
        m.image_url ||
        '/placeholder.svg?height=400&width=300&text=صورة+الشهيد',
      story: m.biography?.occupation || m.story || '',
      testament: m.biography?.testament || m.testament || '',
      audioUrl: m.mediaAssets?.audio?.[0]?.url || m.audio_url || '',
      tags: m.tags || [],
    }))

    // Cache and return
    cachedMartyrs = list
    lastFetch = now

    const finalList = limit ? list.slice(0, parseInt(limit)) : list

    return NextResponse.json({
      martyrs: finalList,
      total: list.length,
      returned: finalList.length
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch martyrs', details: error.message },
      { status: 500 }
    )
  }
}
