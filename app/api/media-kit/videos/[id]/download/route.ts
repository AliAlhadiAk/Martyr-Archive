import { NextRequest, NextResponse } from 'next/server'
import { downloadFile, STORAGE_BUCKETS } from '@/lib/supabase-storage'
import fs from 'fs'
import path from 'path'

const ADMIN_ASSETS_FILE = path.join(process.cwd(), 'data', 'admin-assets.json')

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
        error: 'Local video files cannot be downloaded',
        message: 'This is a fallback file that was saved locally due to Supabase upload failure'
      }, { status: 400 })
    }

    try {
      // Download from Supabase Storage
      const videoBuffer = await downloadFile(STORAGE_BUCKETS.VIDEOS, id)
      
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

      // Set appropriate headers for download
      const headers = new Headers()
      headers.set('Content-Type', 'video/mp4')
      headers.set('Content-Disposition', `attachment; filename="${filename}.mp4"`)
      headers.set('Content-Length', Buffer.byteLength(videoBuffer).toString())
      
      // Add CORS headers
      headers.set('Access-Control-Allow-Origin', '*')
      headers.set('Access-Control-Allow-Methods', 'GET, HEAD')
      headers.set('Access-Control-Allow-Headers', 'Content-Type')
      headers.set('Cache-Control', 'public, max-age=3600')

      // For HEAD requests, return just the headers
      if (request.method === 'HEAD') {
        return new NextResponse(null, {
          status: 200,
          headers,
        })
      }

      // For GET requests, return the file content
      return new NextResponse(videoBuffer, {
        status: 200,
        headers,
      })
    } catch (downloadError) {
      console.error('Failed to download from Supabase:', downloadError)
      
      return NextResponse.json({ 
        error: 'Video file not found or cannot be downloaded',
        message: 'The requested video file is not available in storage'
      }, { status: 404 })
    }
  } catch (error) {
    console.error('Download video error:', error)
    return NextResponse.json({ error: 'Failed to download video file' }, { status: 500 })
  }
}


