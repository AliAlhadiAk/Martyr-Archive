import { NextRequest, NextResponse } from 'next/server'
import { martyrService, type MartyrPersonalInfo, type MartyrFamilyInfo, type MartyrBiography } from '@/lib/martyr-service'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    // Extract basic information
    const name = formData.get('name') as string
    const arabicName = formData.get('arabicName') as string
    const englishName = formData.get('englishName') as string
    const dateOfBirth = formData.get('dateOfBirth') as string
    const placeOfBirth = formData.get('placeOfBirth') as string
    const nationality = formData.get('nationality') as string
    const martyrdomDate = formData.get('martyrdomDate') as string
    const martyrdomPlace = formData.get('martyrdomPlace') as string
    const martyrdomCircumstances = formData.get('martyrdomCircumstances') as string
    
    // Family information
    const fatherName = formData.get('fatherName') as string
    const motherName = formData.get('motherName') as string
    const siblings = (formData.get('siblings') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    const spouse = formData.get('spouse') as string || null
    const children = (formData.get('children') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    
    // Biography information
    const education = formData.get('education') as string
    const occupation = formData.get('occupation') as string
    const achievements = (formData.get('achievements') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    const interests = (formData.get('interests') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    const testament = formData.get('testament') as string
    
    // Tags
    const tags = (formData.get('tags') as string)?.split(',').map(s => s.trim()).filter(Boolean) || []
    
    // Media files
    const profileImage = formData.get('profileImage') as File | null
    const galleryFiles = formData.getAll('gallery') as File[]
    const videoFiles = formData.getAll('videos') as File[]
    const audioFiles = formData.getAll('audio') as File[]
    const documentFiles = formData.getAll('documents') as File[]
    
    // Validation
    if (!name || !arabicName || !englishName || !dateOfBirth || !martyrdomDate) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['name', 'arabicName', 'englishName', 'dateOfBirth', 'martyrdomDate']
      }, { status: 400 })
    }

    // Create martyr data objects
    const personalInfo: Omit<MartyrPersonalInfo, 'age'> = {
      name,
      arabicName,
      englishName,
      dateOfBirth,
      placeOfBirth: placeOfBirth || 'غير محدد',
      nationality: nationality || 'فلسطيني',
      martyrdomDate,
      martyrdomPlace: martyrdomPlace || 'غير محدد',
      martyrdomCircumstances: martyrdomCircumstances || 'غير محدد'
    }

    const familyInfo: MartyrFamilyInfo = {
      fatherName: fatherName || 'غير محدد',
      motherName: motherName || 'غير محدد',
      siblings,
      spouse,
      children
    }

    const biography: MartyrBiography = {
      education: education || 'غير محدد',
      occupation: occupation || 'غير محدد',
      achievements,
      interests,
      testament: testament || 'لا توجد وصية'
    }

    // Create martyr using the service
    const martyr = await martyrService.createMartyr(
      personalInfo,
      familyInfo,
      biography,
      profileImage || undefined,
      galleryFiles.length > 0 ? galleryFiles : undefined,
      videoFiles.length > 0 ? videoFiles : undefined,
      audioFiles.length > 0 ? audioFiles : undefined,
      documentFiles.length > 0 ? documentFiles : undefined,
      tags,
      'admin'
    )

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الشهيد بنجاح',
      martyr: {
        id: martyr.id,
        name: martyr.personalInfo.name,
        age: martyr.personalInfo.age,
        martyrdomDate: martyr.personalInfo.martyrdomDate,
        mediaAssets: {
          profileImage: martyr.mediaAssets.profileImage ? {
            url: martyr.mediaAssets.profileImage.url,
            altText: martyr.mediaAssets.profileImage.altText
          } : null,
          galleryCount: martyr.mediaAssets.gallery.length,
          videosCount: martyr.mediaAssets.videos.length,
          audioCount: martyr.mediaAssets.audio.length,
          documentsCount: martyr.mediaAssets.documents.length
        }
      }
    })

  } catch (error) {
    console.error('Error creating martyr:', error)
    return NextResponse.json({ 
      error: 'Failed to create martyr',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const martyrs = martyrService.getAllMartyrs()
    const stats = martyrService.getStatisticsSummary()
    
    return NextResponse.json({
      martyrs: martyrs.map(martyr => ({
        id: martyr.id,
        name: martyr.personalInfo.name,
        arabicName: martyr.personalInfo.arabicName,
        englishName: martyr.personalInfo.englishName,
        age: martyr.personalInfo.age,
        martyrdomDate: martyr.personalInfo.martyrdomDate,
        placeOfBirth: martyr.personalInfo.placeOfBirth,
        occupation: martyr.biography.occupation,
        profileImage: martyr.mediaAssets.profileImage?.url,
        galleryCount: martyr.mediaAssets.gallery.length,
        audioCount: martyr.mediaAssets.audio.length,
        documentsCount: martyr.mediaAssets.documents.length,
        tags: martyr.metadata.tags,
        status: martyr.metadata.status,
        createdAt: martyr.metadata.createdAt,
        statistics: martyr.statistics
      })),
      statistics: stats,
      totalCount: martyrs.length
    })
  } catch (error) {
    console.error('Error fetching martyrs:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch martyrs',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

