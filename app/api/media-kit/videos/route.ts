import { NextResponse } from 'next/server'
import { listFiles, STORAGE_BUCKETS } from '@/lib/supabase-storage'
import fs from 'fs'
import path from 'path'

const ADMIN_ASSETS_FILE = path.join(process.cwd(), 'data', 'admin-assets.json')

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

export async function GET() {
  try {
    // Get admin assets metadata first
    let adminVideoAssets: any[] = []
    try {
      if (fs.existsSync(ADMIN_ASSETS_FILE)) {
        const adminData = JSON.parse(fs.readFileSync(ADMIN_ASSETS_FILE, 'utf8'))
        adminVideoAssets = adminData.videos || []
      }
    } catch (error) {
      console.error('Error reading admin assets:', error)
    }

    // Get Supabase storage files
    let supabaseFiles: any[] = []
    try {
      supabaseFiles = await listFiles(STORAGE_BUCKETS.VIDEOS)
    } catch (error) {
      console.error('Error listing Supabase files:', error)
      // Continue with just admin assets if Supabase fails
    }

    // Merge admin metadata with Supabase files
    const videoFiles = adminVideoAssets.map(adminAsset => {
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
          thumbnail: adminAsset.thumbnail || "",
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
          thumbnail: adminAsset.thumbnail || "",
          available: adminAsset.localFile || false
        }
      }
    })

    // Add any Supabase files that don't have admin metadata
    supabaseFiles.forEach(supabaseFile => {
      const hasAdminMetadata = adminVideoAssets.some(admin => admin.id === supabaseFile.name)
      
      if (!hasAdminMetadata) {
        // Create basic metadata for files without admin info
        const fileSize = supabaseFile.size || 0
        const estimatedDuration = getVideoDuration(fileSize, 'video/mp4')
        
        videoFiles.push({
          id: supabaseFile.name,
          title: supabaseFile.name.replace(/\.[^.]+$/, ''),
          url: `/api/media-kit/videos/${supabaseFile.name}/download`, // Use download endpoint
          duration: estimatedDuration,
          category: "فيديو تعريفي",
          description: "ملف فيديو متوفر في المكتبة",
          size: `${(fileSize / (1024 * 1024)).toFixed(1)} MB`,
          formats: ["MP4"],
          downloads: 0,
          createdAt: supabaseFile.created_at || new Date().toISOString(),
          premium: false,
          thumbnail: "",
          available: true
        })
      }
    })

    // Sort by creation date (newest first)
    videoFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ videoFiles })
  } catch (error) {
    console.error('Error fetching video files:', error)
    return NextResponse.json({ error: 'Failed to fetch video files' }, { status: 500 })
  }
}
