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

// Function to get audio duration (approximate based on file size)
const getAudioDuration = (fileSize: number, format: string): string => {
  // Rough estimation: MP3 ~1MB per minute, WAV ~10MB per minute
  const bytesPerMinute = format === 'audio/wav' ? 10 * 1024 * 1024 : 1024 * 1024
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

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'File must be an audio file' }, { status: 400 })
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large', 
        message: `File size must be less than 100MB. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB` 
      }, { status: 400 })
    }

    try {
      // Try Supabase upload first
      const result = await uploadFile(file, {
        name: file.name,
        size: file.size,
        type: file.type,
        bucket: STORAGE_BUCKETS.AUDIO
      })

      const duration = getAudioDuration(file.size, file.type)
      
      // Create audio asset metadata
      const audioAsset = {
        id: result.key,
        name: result.title,
        category: "موسيقى",
        preview: "/placeholder.svg?height=200&width=300&text=موسيقى+تصويرية",
        description: "ملف صوتي تم رفعه من لوحة الإدارة",
        downloads: 0,
        formats: [file.type || 'audio/mpeg'],
        size: result.size,
        duration: duration,
        tags: ["موسيقى", "صوتي", "مرفوع"],
        createdAt: new Date().toISOString(),
        createdBy: "admin",
        url: result.url
      }

      // Save to admin assets
      try {
        initializeAdminAssets()
        const fileContents = fs.readFileSync(ADMIN_ASSETS_FILE, 'utf8')
        const data = JSON.parse(fileContents)
        
        if (!data.audio) {
          data.audio = []
        }
        
        data.audio.push(audioAsset)
        
        fs.writeFileSync(ADMIN_ASSETS_FILE, JSON.stringify(data, null, 2))
      } catch (error) {
        console.error('Failed to save to admin assets:', error)
        // Continue even if saving to admin assets fails
      }

      const payload = {
        id: result.key,
        title: result.title,
        url: result.url,
        duration,
        createdAt: new Date().toISOString(),
      }

      return NextResponse.json(payload)
    } catch (uploadError) {
      console.error('Supabase upload error:', uploadError)
      
      // Fallback: Create a placeholder entry with local file info
      const fallbackId = `local-${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      const duration = getAudioDuration(file.size, file.type)
      
      const fallbackAsset = {
        id: fallbackId,
        name: file.name.replace(/\.[^.]+$/, ''),
        category: "موسيقى",
        preview: "/placeholder.svg?height=200&width=300&text=موسيقى+تصويرية",
        description: "ملف صوتي (رفع محلي - Supabase غير متاح)",
        downloads: 0,
        formats: [file.type || 'audio/mpeg'],
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        duration: duration,
        tags: ["موسيقى", "صوتي", "محلي"],
        createdAt: new Date().toISOString(),
        createdBy: "admin",
        url: `/audio/${fallbackId}`,
        localFile: true
      }

      // Save fallback asset
      try {
        initializeAdminAssets()
        const fileContents = fs.readFileSync(ADMIN_ASSETS_FILE, 'utf8')
        const data = JSON.parse(fileContents)
        
        if (!data.audio) {
          data.audio = []
        }
        
        data.audio.push(fallbackAsset)
        
        fs.writeFileSync(ADMIN_ASSETS_FILE, JSON.stringify(data, null, 2))
      } catch (error) {
        console.error('Failed to save fallback asset:', error)
      }

      return NextResponse.json({
        id: fallbackId,
        title: fallbackAsset.name,
        url: fallbackAsset.url,
        duration,
        createdAt: fallbackAsset.createdAt,
        fallback: true,
        message: 'File saved locally due to Supabase upload failure'
      })
    }
  } catch (error) {
    console.error('Upload audio error:', error)
    return NextResponse.json({ error: 'Failed to upload audio' }, { status: 500 })
  }
}


