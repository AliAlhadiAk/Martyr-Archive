import { NextRequest, NextResponse } from 'next/server'
import { STORAGE_BUCKETS, downloadFile, deleteFile } from '@/lib/supabase-storage'
import fs from 'fs'
import path from 'path'

const ADMIN_ASSETS_FILE = path.join(process.cwd(), 'data', 'admin-assets.json')

// GET - Download video file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    // Check if it's a local file (fallback from upload)
    if (id.startsWith('local-')) {
      return NextResponse.json({ 
        error: 'Local video files cannot be downloaded via API',
        message: 'This is a fallback file that was saved locally due to Supabase upload failure'
      }, { status: 400 })
    }

    try {
      // Download from Supabase Storage
      const videoBlob = await downloadFile(STORAGE_BUCKETS.VIDEOS, id)
      
      // Get file info from admin assets for proper filename
      let filename = id
      if (fs.existsSync(ADMIN_ASSETS_FILE)) {
        const fileContents = fs.readFileSync(ADMIN_ASSETS_FILE, 'utf8')
        const data = JSON.parse(fileContents)
        const videoAsset = data.videos?.find((video: any) => video.id === id)
        if (videoAsset?.name) {
          filename = videoAsset.name
        }
      }

      // Return the video file as a downloadable response
      return new NextResponse(videoBlob, {
        headers: {
          'Content-Type': 'video/mp4', // Default, can be enhanced
          'Content-Disposition': `attachment; filename="${filename}.mp4"`,
          'Cache-Control': 'public, max-age=3600'
        }
      })
    } catch (downloadError) {
      console.error('Failed to download from Supabase:', downloadError)
      
      // Fallback: Check if we have the file locally or provide error
      return NextResponse.json({ 
        error: 'Video file not found or cannot be downloaded',
        message: 'The requested video file is not available in storage'
      }, { status: 404 })
    }
  } catch (error) {
    console.error('Get video error:', error)
    return NextResponse.json({ error: 'Failed to retrieve video file' }, { status: 500 })
  }
}

// DELETE - Remove video file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    // Delete from Supabase Storage (if not a local file)
    if (!id.startsWith('local-')) {
      try {
        const deleted = await deleteFile(STORAGE_BUCKETS.VIDEOS, id)
        if (!deleted) {
          console.warn(`Failed to delete video ${id} from Supabase`)
        }
      } catch (error) {
        console.error('Failed to delete from Supabase:', error)
        // Continue even if Supabase deletion fails
      }
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


