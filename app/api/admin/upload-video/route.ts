import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, STORAGE_BUCKETS } from '@/lib/supabase-storage'
import fs from 'fs'
import path from 'path'

const ADMIN_ASSETS_FILE = path.join(process.cwd(), 'data', 'admin-assets.json')

// Ensure the data directory exists
const ensureDataDirectory = () => {
  const dataDir = path.dirname(ADMIN_ASSETS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Initialize admin assets file if it doesn't exist
const initializeAdminAssets = () => {
  ensureDataDirectory()
  if (!fs.existsSync(ADMIN_ASSETS_FILE)) {
    const initialData = {
      fonts: [],
      designs: [],
      posters: [],
      graphics: [],
      videos: [],
      audio: [],
      martyrs: []
    }
    fs.writeFileSync(ADMIN_ASSETS_FILE, JSON.stringify(initialData, null, 2))
  }
}

// Function to get video duration (approximate based on file size)
const getVideoDuration = (fileSize: number, format: string): string => {
  // Rough estimation: MP4 ~50MB per minute, MOV ~100MB per minute
  const bytesPerMinute = format.includes('mov') ? 100 * 1024 * 1024 : 50 * 1024 * 1024
  const minutes = Math.round(fileSize / bytesPerMinute)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (hours > 0) {
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}`
  }
  return `${remainingMinutes}:00`
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as unknown as File | null
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'File must be a video file' }, { status: 400 })
    }

    // Validate file size (500MB limit for videos)
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large', 
        message: `File size must be less than 500MB. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB` 
      }, { status: 400 })
    }

    try {
      // Try Supabase upload first
      const result = await uploadFile(file, {
        name: file.name,
        size: file.size,
        type: file.type,
        bucket: STORAGE_BUCKETS.VIDEOS
      })

      const duration = getVideoDuration(file.size, file.type)
      
      // Create video asset metadata
      const videoAsset = {
        id: result.key,
        name: title,
        category: category || "فيديو تعريفي",
        preview: "/placeholder.svg?height=300&width=400&text=فيديو+تعريفي",
        description: description || "فيديو تم رفعه من لوحة الإدارة",
        downloads: 0,
        formats: [file.type || 'video/mp4'],
        size: result.size,
        duration: duration,
        tags: ["فيديو", "مرفوع"],
        createdAt: new Date().toISOString(),
        createdBy: "admin",
        url: result.url,
        thumbnail: "" // Will be generated later if needed
      }

      // Save to admin assets
      try {
        initializeAdminAssets()
        const fileContents = fs.readFileSync(ADMIN_ASSETS_FILE, 'utf8')
        const data = JSON.parse(fileContents)
        
        if (!data.videos) {
          data.videos = []
        }
        
        data.videos.push(videoAsset)
        
        fs.writeFileSync(ADMIN_ASSETS_FILE, JSON.stringify(data, null, 2))
      } catch (error) {
        console.error('Failed to save to admin assets:', error)
        // Continue even if saving to admin assets fails
      }

      const payload = {
        id: result.key,
        title: title,
        url: result.url,
        duration,
        size: result.size,
        category: category || "فيديو تعريفي",
        description: description || "فيديو تم رفعه من لوحة الإدارة",
        createdAt: new Date().toISOString(),
      }

      return NextResponse.json(payload)
    } catch (uploadError) {
      console.error('Supabase upload error:', uploadError)
      
      // Fallback: Create a placeholder entry with local file info
      const fallbackId = `local-${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      const duration = getVideoDuration(file.size, file.type)
      
      const fallbackAsset = {
        id: fallbackId,
        name: title,
        category: category || "فيديو تعريفي",
        preview: "/placeholder.svg?height=300&width=400&text=فيديو+تعريفي",
        description: description || "فيديو (رفع محلي - Supabase غير متاح)",
        downloads: 0,
        formats: [file.type || 'video/mp4'],
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        duration: duration,
        tags: ["فيديو", "مرفوع", "محلي"],
        createdAt: new Date().toISOString(),
        createdBy: "admin",
        url: `/video/${fallbackId}`,
        thumbnail: "",
        localFile: true
      }

      // Save fallback asset
      try {
        initializeAdminAssets()
        const fileContents = fs.readFileSync(ADMIN_ASSETS_FILE, 'utf8')
        const data = JSON.parse(fileContents)
        
        if (!data.videos) {
          data.videos = []
        }
        
        data.videos.push(fallbackAsset)
        
        fs.writeFileSync(ADMIN_ASSETS_FILE, JSON.stringify(data, null, 2))
      } catch (error) {
        console.error('Failed to save fallback asset:', error)
      }

      return NextResponse.json({
        id: fallbackId,
        title: title,
        url: fallbackAsset.url,
        duration,
        size: fallbackAsset.size,
        category: category || "فيديو تعريفي",
        description: description || "فيديو (رفع محلي - Supabase غير متاح)",
        createdAt: fallbackAsset.createdAt,
        fallback: true,
        message: 'File saved locally due to Supabase upload failure'
      })
    }
  } catch (error) {
    console.error('Upload video error:', error)
    return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 })
  }
}
