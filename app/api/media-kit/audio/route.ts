import { NextResponse } from 'next/server'
import { listFiles, STORAGE_BUCKETS } from '@/lib/supabase-storage'
import fs from 'fs'
import path from 'path'

const ADMIN_ASSETS_FILE = path.join(process.cwd(), 'data', 'admin-assets.json')

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

export async function GET() {
  try {
    // Get admin assets metadata first
    let adminAudioAssets: any[] = []
    try {
      if (fs.existsSync(ADMIN_ASSETS_FILE)) {
        const adminData = JSON.parse(fs.readFileSync(ADMIN_ASSETS_FILE, 'utf8'))
        adminAudioAssets = adminData.audio || []
      }
    } catch (error) {
      console.error('Error reading admin assets:', error)
    }

    // Get Supabase storage files
    let supabaseFiles: any[] = []
    try {
      supabaseFiles = await listFiles(STORAGE_BUCKETS.AUDIO)
    } catch (error) {
      console.error('Error listing Supabase files:', error)
      // Continue with just admin assets if Supabase fails
    }

    // Merge admin metadata with Supabase files
    const audioFiles = adminAudioAssets.map(adminAsset => {
      // Check if file exists in Supabase storage
      const supabaseFile = supabaseFiles.find(file => file.name === adminAsset.id)
      
      if (supabaseFile) {
        // File exists in Supabase, use admin metadata with Supabase URL
        return {
          id: adminAsset.id,
          title: adminAsset.name,
          url: adminAsset.url, // This should be the Supabase public URL
          duration: adminAsset.duration,
          category: adminAsset.category,
          description: adminAsset.description,
          size: adminAsset.size,
          formats: adminAsset.formats,
          downloads: adminAsset.downloads || 0,
          createdAt: adminAsset.createdAt,
          premium: adminAsset.premium || false,
          available: true
        }
      } else {
        // File not found in Supabase (might be local fallback)
        return {
          id: adminAsset.id,
          title: adminAsset.name,
          url: adminAsset.url,
          duration: adminAsset.duration,
          category: adminAsset.category,
          description: adminAsset.description,
          size: adminAsset.size,
          formats: adminAsset.formats,
          downloads: adminAsset.downloads || 0,
          createdAt: adminAsset.createdAt,
          premium: adminAsset.premium || false,
          available: adminAsset.localFile || false
        }
      }
    })

    // Add any Supabase files that don't have admin metadata
    supabaseFiles.forEach(supabaseFile => {
      const hasAdminMetadata = adminAudioAssets.some(admin => admin.id === supabaseFile.name)
      
      if (!hasAdminMetadata) {
        // Create basic metadata for files without admin info
        const fileSize = supabaseFile.size || 0
        const estimatedDuration = getAudioDuration(fileSize, 'audio/mpeg')
        
        audioFiles.push({
          id: supabaseFile.name,
          title: supabaseFile.name.replace(/\.[^.]+$/, ''),
          url: `/api/media-kit/audio/${supabaseFile.name}/download`, // Use download endpoint
          duration: estimatedDuration,
          category: "موسيقى",
          description: "ملف صوتي متوفر في المكتبة",
          size: `${(fileSize / (1024 * 1024)).toFixed(1)} MB`,
          formats: ["MP3"],
          downloads: 0,
          createdAt: supabaseFile.created_at || new Date().toISOString(),
          premium: false,
          available: true
        })
      }
    })

    // Sort by creation date (newest first)
    audioFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ audioFiles })
  } catch (error) {
    console.error('Error fetching audio files:', error)
    return NextResponse.json({ error: 'Failed to fetch audio files' }, { status: 500 })
  }
}