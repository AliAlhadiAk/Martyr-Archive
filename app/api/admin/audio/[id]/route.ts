import { NextRequest, NextResponse } from 'next/server'
import { STORAGE_BUCKETS, downloadFile, deleteFile } from '@/lib/supabase-storage'
import fs from 'fs'
import path from 'path'

const ADMIN_ASSETS_FILE = path.join(process.cwd(), 'data', 'admin-assets.json')

// GET - Download audio file
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
        error: 'Local audio files cannot be downloaded via API',
        message: 'This is a fallback file that was saved locally due to Supabase upload failure'
      }, { status: 400 })
    }

    try {
      // Download from Supabase Storage
      const audioBlob = await downloadFile(STORAGE_BUCKETS.AUDIO, id)
      
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

      // Return the audio file as a downloadable response
      return new NextResponse(audioBlob, {
        headers: {
          'Content-Type': 'audio/mpeg', // Default, can be enhanced
          'Content-Disposition': `attachment; filename="${filename}.mp3"`,
          'Cache-Control': 'public, max-age=3600'
        }
      })
    } catch (downloadError) {
      console.error('Failed to download from Supabase:', downloadError)
      
      // Fallback: Check if we have the file locally or provide error
      return NextResponse.json({ 
        error: 'Audio file not found or cannot be downloaded',
        message: 'The requested audio file is not available in storage'
      }, { status: 404 })
    }
  } catch (error) {
    console.error('Get audio error:', error)
    return NextResponse.json({ error: 'Failed to retrieve audio file' }, { status: 500 })
  }
}

// DELETE - Remove audio file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Audio ID is required' }, { status: 400 })
    }

    // Delete from Supabase Storage (if not a local file)
    if (!id.startsWith('local-')) {
      try {
        const deleted = await deleteFile(STORAGE_BUCKETS.AUDIO, id)
        if (!deleted) {
          console.warn(`Failed to delete audio ${id} from Supabase`)
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
        
        if (data.audio && Array.isArray(data.audio)) {
          data.audio = data.audio.filter((audio: any) => audio.id !== id)
          fs.writeFileSync(ADMIN_ASSETS_FILE, JSON.stringify(data, null, 2))
        }
      }
    } catch (error) {
      console.error('Failed to remove from admin assets:', error)
      // Continue even if admin assets update fails
    }

    return NextResponse.json({ success: true, message: 'Audio file deleted successfully' })
  } catch (error) {
    console.error('Delete audio error:', error)
    return NextResponse.json({ error: 'Failed to delete audio file' }, { status: 500 })
  }
}



