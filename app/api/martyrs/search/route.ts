import { NextRequest, NextResponse } from 'next/server'
import { martyrService } from '@/lib/martyr-service'

// Cache search results for better performance
export const revalidate = 120 // 2 minutes

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    
    if (!query || query.length < 2) {
      return NextResponse.json({ 
        martyrs: [],
        total: 0,
        returned: 0,
        query: query || ''
      })
    }
    
    const allMartyrs = await martyrService.getAllMartyrs()
    
    // Search through martyrs
    const searchResults = allMartyrs.filter(martyr => 
      martyr.personalInfo.name.toLowerCase().includes(query.toLowerCase()) ||
      martyr.personalInfo.englishName.toLowerCase().includes(query.toLowerCase()) ||
      martyr.biography.occupation.toLowerCase().includes(query.toLowerCase()) ||
      martyr.personalInfo.placeOfBirth.toLowerCase().includes(query.toLowerCase()) ||
      martyr.personalInfo.martyrdomPlace.toLowerCase().includes(query.toLowerCase()) ||
      martyr.metadata.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
    
    // Limit results to prevent overwhelming response
    const limitedResults = searchResults.slice(0, 20)
    
    const list = limitedResults.map((m) => ({
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
    
    const response = NextResponse.json({ 
      martyrs: list,
      total: allMartyrs.length,
      returned: list.length,
      query,
      searchResults: searchResults.length
    })
    
    // Set cache headers for search results
    response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300')
    
    return response
  } catch (error: any) {
    console.error('Search API Error:', error)
    return NextResponse.json(
      { error: 'Failed to search martyrs', details: error.message },
      { status: 500 }
    )
  }
}
