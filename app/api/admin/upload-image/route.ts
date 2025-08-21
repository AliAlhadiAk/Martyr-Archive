import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, STORAGE_BUCKETS } from '@/lib/supabase-storage'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as unknown as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    try {
      // Upload to Supabase Storage
      const result = await uploadFile(file, {
        name: file.name,
        size: file.size,
        type: file.type,
        bucket: STORAGE_BUCKETS.IMAGES
      })

      return NextResponse.json(result)
    } catch (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }
  } catch (error) {
    console.error('Upload image error:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}


