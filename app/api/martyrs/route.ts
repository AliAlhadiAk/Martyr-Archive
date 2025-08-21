import { NextRequest, NextResponse } from 'next/server'
import { martyrService } from '@/lib/martyr-service'

export async function GET(req: NextRequest) {
  try {
    const martyrs = martyrService.getAllMartyrs()
    const list = martyrs.map((m) => ({
      id: m.id,
      name: m.personalInfo.name,
      age: m.personalInfo.age,
      location: m.personalInfo.martyrdomPlace || m.personalInfo.placeOfBirth,
      martyrdomDate: m.personalInfo.martyrdomDate,
      image: m.mediaAssets.profileImage?.url || "/placeholder.svg?height=400&width=300&text=صورة+الشهيد",
      story: '',
      testament: m.biography.testament,
      audioUrl: m.mediaAssets.audio[0]?.url,
    }))
    return NextResponse.json({ martyrs: list })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch martyrs', details: error.message },
      { status: 500 }
    )
  }
}

// POST, PUT, DELETE methods for martyrs would typically be handled by the admin API,
// but if direct manipulation is needed, they would go here.
// For now, we rely on the /api/admin/assets endpoint for CUD operations.
