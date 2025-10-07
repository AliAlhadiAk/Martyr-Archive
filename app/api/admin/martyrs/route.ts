import { NextRequest, NextResponse } from 'next/server'
import { martyrService, type MartyrPersonalInfo, type MartyrFamilyInfo, type MartyrBiography } from '@/lib/martyr-service'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let formData: FormData | null = null
    let body: any = null

    if (contentType.includes('application/json')) {
      body = await req.json()
    } else {
      formData = await req.formData()
    }
    
    // Extract basic information
    const name = formData ? (formData.get('name') as string) : (body?.name as string)
    const arabicName = formData ? (formData.get('arabicName') as string) : (body?.arabicName as string)
    const englishName = formData ? (formData.get('englishName') as string) : (body?.englishName as string)
    const dateOfBirth = formData ? (formData.get('dateOfBirth') as string) : (body?.dateOfBirth as string)
    const placeOfBirth = formData ? (formData.get('placeOfBirth') as string) : (body?.placeOfBirth as string)
    const nationality = formData ? (formData.get('nationality') as string) : (body?.nationality as string)
    const martyrdomDate = formData ? (formData.get('martyrdomDate') as string) : (body?.martyrdomDate as string)
    const martyrdomPlace = formData ? (formData.get('martyrdomPlace') as string) : (body?.martyrdomPlace as string)
    const martyrdomCircumstances = formData ? (formData.get('martyrdomCircumstances') as string) : (body?.martyrdomCircumstances as string)
    
    // Family information
    const fatherName = formData ? (formData.get('fatherName') as string) : (body?.fatherName as string)
    const motherName = formData ? (formData.get('motherName') as string) : (body?.motherName as string)
    const siblings = formData
      ? ((formData.get('siblings') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [])
      : (Array.isArray(body?.siblings) ? body.siblings : (typeof body?.siblings === 'string' ? body.siblings.split(',').map((s: string) => s.trim()).filter(Boolean) : []))
    const spouse = formData ? ((formData.get('spouse') as string) || null) : (body?.spouse ?? null)
    const children = formData
      ? ((formData.get('children') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [])
      : (Array.isArray(body?.children) ? body.children : (typeof body?.children === 'string' ? body.children.split(',').map((s: string) => s.trim()).filter(Boolean) : []))
    
    // Biography information
    const education = formData ? (formData.get('education') as string) : (body?.education as string)
    const occupation = formData ? (formData.get('occupation') as string) : (body?.occupation as string)
    const achievements = formData
      ? ((formData.get('achievements') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [])
      : (Array.isArray(body?.achievements) ? body.achievements : (typeof body?.achievements === 'string' ? body.achievements.split(',').map((s: string) => s.trim()).filter(Boolean) : []))
    const interests = formData
      ? ((formData.get('interests') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [])
      : (Array.isArray(body?.interests) ? body.interests : (typeof body?.interests === 'string' ? body.interests.split(',').map((s: string) => s.trim()).filter(Boolean) : []))
    const testament = formData ? (formData.get('testament') as string) : (body?.testament as string)
    
    // Tags
    const tags = formData
      ? ((formData.get('tags') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [])
      : (Array.isArray(body?.tags) ? body.tags : (typeof body?.tags === 'string' ? body.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : []))
    
    // Media files
    const profileImage = formData ? (formData.get('profileImage') as File | null) : null
    const galleryFiles = formData ? (formData.getAll('gallery') as File[]) : []
    const videoFiles = formData ? (formData.getAll('videos') as File[]) : []
    const audioFiles = formData ? (formData.getAll('audio') as File[]) : []
    const documentFiles = formData ? (formData.getAll('documents') as File[]) : []
    
    // Validation (relaxed to reduce 400s; only essential fields required)
    if (!name || !martyrdomDate) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['name', 'martyrdomDate']
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
    const martyrs = await martyrService.getAllMartyrs()
    const stats = await martyrService.getStatisticsSummary()
    
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

