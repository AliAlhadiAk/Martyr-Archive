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
      return NextResponse.json({ error: 'Audio ID is required' }, { status: 400 })
    }

    // Check if it's a local file (fallback from upload)
    if (id.startsWith('local-')) {
      return NextResponse.json({ 
        error: 'Local audio files cannot be downloaded',
        message: 'This is a fallback file that was saved locally due to Supabase upload failure'
      }, { status: 400 })
    }

    try {
      // Download from Supabase Storage
      const audioBuffer = await downloadFile(STORAGE_BUCKETS.AUDIO, id)
      
      // Get file info from admin assets for proper filename
      let filename = id
      if (fs.existsSync(ADMIN_ASSETS_FILE)) {
        const fileContents = fs.readFileSync(ADMIN_ASSETS_FILE, 'utf8')
        const data = JSON.parse(fileContents)
        const audioAsset = data.audio?.find((audio: any) => audio.id === id)
        if (audioAsset?.name) {
          filename = audioAsset.name
        }
      }

      // Set appropriate headers for download
      const headers = new Headers()
      headers.set('Content-Type', 'audio/mpeg')
      headers.set('Content-Disposition', `attachment; filename="${filename}.mp3"`)
      headers.set('Content-Length', Buffer.byteLength(audioBuffer).toString())
      
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
      return new NextResponse(audioBuffer, {
        status: 200,
        headers,
      })
    } catch (downloadError) {
      console.error('Failed to download from Supabase:', downloadError)
      
      return NextResponse.json({ 
        error: 'Audio file not found or cannot be downloaded',
        message: 'The requested audio file is not available in storage'
      }, { status: 404 })
    }
  } catch (error) {
    console.error('Download audio error:', error)
    return NextResponse.json({ error: 'Failed to download audio file' }, { status: 500 })
  }
}
