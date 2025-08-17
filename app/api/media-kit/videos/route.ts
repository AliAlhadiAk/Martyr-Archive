import { NextResponse } from 'next/server'
import { s3Client } from '@/lib/s3-client'
import { ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
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
    const bucket = process.env.AWS_BUCKET_NAME
    if (!bucket) {
      return NextResponse.json({ error: 'S3 bucket not configured' }, { status: 500 })
    }

    // Get S3 video files
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: 'videos/', // assuming videos are stored in a 'videos' folder
    })

    const response = await s3Client.send(command)
    
    // Get admin assets metadata
    let adminVideoAssets: any[] = []
    try {
      if (fs.existsSync(ADMIN_ASSETS_FILE)) {
        const adminData = JSON.parse(fs.readFileSync(ADMIN_ASSETS_FILE, 'utf8'))
        adminVideoAssets = adminData.videos || []
      }
    } catch (error) {
      console.error('Error reading admin assets:', error)
    }

    // Merge S3 files with admin metadata and generate fresh presigned URLs
    const videoFiles = await Promise.all(
      (response.Contents || []).map(async (file) => {
        const fileName = file.Key?.split('/').pop() || ''
        const fileId = file.Key || ''
        
        // Find matching admin metadata
        const adminAsset = adminVideoAssets.find(asset => asset.id === fileId)
        
        // Generate fresh presigned URL for viewing (expires in 1 hour)
        let presignedUrl = ''
        try {
          const getObjectCommand = new GetObjectCommand({
            Bucket: bucket,
            Key: fileId,
          })
          presignedUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 })
        } catch (error) {
          console.error('Failed to generate presigned URL for:', fileId, error)
        }
        
        if (adminAsset) {
          // Use admin metadata if available
          return {
            id: adminAsset.id,
            title: adminAsset.name,
            url: presignedUrl,
            duration: adminAsset.duration,
            category: adminAsset.category,
            description: adminAsset.description,
            size: adminAsset.size,
            formats: adminAsset.formats,
            downloads: adminAsset.downloads || 0,
            createdAt: adminAsset.createdAt,
            premium: adminAsset.premium || false,
            thumbnail: adminAsset.thumbnail || ""
          }
        } else {
          // Fallback to basic S3 info
          const fileSize = file.Size || 0
          const estimatedDuration = getVideoDuration(fileSize, 'video/mp4')
          
          return {
            id: fileId,
            title: fileName.replace(/\.[^.]+$/, ''),
            url: presignedUrl,
            duration: estimatedDuration,
            category: "فيديو تعريفي",
            description: "ملف فيديو متوفر في المكتبة",
            size: `${(fileSize / (1024 * 1024)).toFixed(1)} MB`,
            formats: ["MP4"],
            downloads: 0,
            createdAt: file.LastModified?.toISOString() || new Date().toISOString(),
            premium: false,
            thumbnail: ""
          }
        }
      })
    )

    // Sort by creation date (newest first)
    videoFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ videoFiles })
  } catch (error) {
    console.error('Error fetching video files:', error)
    return NextResponse.json({ error: 'Failed to fetch video files' }, { status: 500 })
  }
}
