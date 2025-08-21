import { NextRequest, NextResponse } from 'next/server'
import { martyrService } from '@/lib/martyr-service'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const martyr = martyrService.getMartyrById(String(id))
    if (!martyr) {
      return NextResponse.json({ error: 'Martyr not found', requestedId: id }, { status: 404 })
    }

    const response = {
      id: martyr.id,
      // Flatten key info for existing client
      name: martyr.personalInfo.name,
      age: martyr.personalInfo.age,
      location: martyr.personalInfo.martyrdomPlace || martyr.personalInfo.placeOfBirth,
      martyrdomDate: martyr.personalInfo.martyrdomDate,
      image: martyr.mediaAssets.profileImage?.url || "/placeholder.svg?height=400&width=300&text=صورة+الشهيد",
      story: '',
      testament: martyr.biography.testament,
      audioUrl: martyr.mediaAssets.audio[0]?.url,
      // Provide rich structured data for advanced page use
      personalInfo: martyr.personalInfo,
      familyInfo: martyr.familyInfo,
      biography: martyr.biography,
      mediaAssets: martyr.mediaAssets,
      metadata: martyr.metadata,
      statistics: martyr.statistics,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch martyr', details: error.message }, 
      { status: 500 }
    )
  }
}

