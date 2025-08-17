import { NextRequest, NextResponse } from 'next/server'
import { s3Client } from '@/lib/s3-client'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
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

    const bucket = process.env.AWS_BUCKET_NAME
    const region = process.env.AWS_REGION
    if (!bucket || !region) {
      return NextResponse.json({ error: 'S3 is not configured' }, { status: 500 })
    }

    const originalName = (file as any).name || 'video.mp4'
    const safeName = originalName.replace(/\s+/g, '-').replace(/[^\w\.-]/g, '')
    const key = `videos/${Date.now()}-${safeName}`

    const arrayBuffer = await file.arrayBuffer()
    const body = Buffer.from(arrayBuffer)

    const sse = process.env.AWS_S3_SSE
    const sseKmsKeyId = process.env.AWS_S3_KMS_KEY_ID

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: (file as any).type || 'video/mp4',
        ...(sse ? { ServerSideEncryption: sse as any } : {}),
        ...(sse === 'aws:kms' && sseKmsKeyId ? { SSEKMSKeyId: sseKmsKeyId } : {}),
      })
    )

    const fileSize = (file as any).size || 0
    const duration = getVideoDuration(fileSize, (file as any).type || 'video/mp4')
    
    // Generate presigned URL for viewing (expires in 1 hour)
    const presignedUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: 3600 }
    )
    
    // Create video asset metadata
    const videoAsset = {
      id: key,
      name: title,
      category: category || "فيديو تعريفي",
      preview: "/placeholder.svg?height=300&width=400&text=فيديو+تعريفي",
      description: description || "فيديو تم رفعه من لوحة الإدارة",
      downloads: 0,
      formats: [(file as any).type || 'video/mp4'],
      size: `${(fileSize / (1024 * 1024)).toFixed(1)} MB`,
      duration: duration,
      tags: ["فيديو", "مرفوع"],
      createdAt: new Date().toISOString(),
      createdBy: "admin",
      url: presignedUrl,
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
      id: key,
      title: title,
      url: presignedUrl,
      duration,
      size: `${(fileSize / (1024 * 1024)).toFixed(1)} MB`,
      category: category || "فيديو تعريفي",
      description: description || "فيديو تم رفعه من لوحة الإدارة",
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Upload video error:', error)
    return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 })
  }
}
