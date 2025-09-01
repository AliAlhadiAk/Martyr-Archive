import { NextRequest, NextResponse } from 'next/server'
import { martyrService } from '@/lib/martyr-service'

// Cache this route for better performance
export const revalidate = 300 // 5 minutes

export async function GET(req: NextRequest) {
  try {
    const allMartyrs = await martyrService.getAllMartyrs()
    
    // Only return 5 martyrs for the landing page
    const landingMartyrs = allMartyrs.slice(0, 5)
    
    const list = landingMartyrs.map((m) => ({
      id: m.id,
      name: m.personalInfo.name,
      age: m.personalInfo.age,
      location: m.personalInfo.martyrdomPlace || m.personalInfo.placeOfBirth,
      martyrdomDate: m.personalInfo.martyrdomDate,
      image: m.mediaAssets.profileImage?.url || "/placeholder.svg?height=400&width=300&text=صورة+الشهيد",
      story: m.biography.occupation || '',
      testament: m.biography.testament,
      audioUrl: m.mediaAssets.audio[0]?.url,
    }))
    
    // Add cache headers for better performance
    const response = NextResponse.json({ 
      martyrs: list,
      total: allMartyrs.length,
      returned: list.length,
      cached: true
    })
    
    // Set cache headers
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    response.headers.set('CDN-Cache-Control', 'public, max-age=300')
    
    return response
  } catch (error: any) {
    console.error('Landing API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch landing martyrs', details: error.message },
      { status: 500 }
    )
  }
}
