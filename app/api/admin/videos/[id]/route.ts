import { NextRequest, NextResponse } from 'next/server'
import { s3Client } from '@/lib/s3-client'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'

const ADMIN_ASSETS_FILE = path.join(process.cwd(), 'data', 'admin-assets.json')

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    const bucket = process.env.AWS_BUCKET_NAME
    if (!bucket) {
      return NextResponse.json({ error: 'S3 is not configured' }, { status: 500 })
    }

    // Delete from S3
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: id,
        })
      )
    } catch (error) {
      console.error('Failed to delete from S3:', error)
      // Continue even if S3 deletion fails
    }

    // Remove from admin assets
    try {
      if (fs.existsSync(ADMIN_ASSETS_FILE)) {
        const fileContents = fs.readFileSync(ADMIN_ASSETS_FILE, 'utf8')
        const data = JSON.parse(fileContents)
        
        if (data.videos && Array.isArray(data.videos)) {
          data.videos = data.videos.filter((video: any) => video.id !== id)
          fs.writeFileSync(ADMIN_ASSETS_FILE, JSON.stringify(data, null, 2))
        }
      }
    } catch (error) {
      console.error('Failed to remove from admin assets:', error)
      // Continue even if admin assets update fails
    }

    return NextResponse.json({ success: true, message: 'Video file deleted successfully' })
  } catch (error) {
    console.error('Delete video error:', error)
    return NextResponse.json({ error: 'Failed to delete video file' }, { status: 500 })
  }
}


