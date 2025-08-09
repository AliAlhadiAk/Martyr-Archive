import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Use the same admin assets file as the source of truth
const ADMIN_ASSETS_FILE = path.join(process.cwd(), 'data', 'admin-assets.json')

// Ensure the data directory exists and initialize admin assets file if it doesn't exist
const initializeAdminAssets = () => {
  const dataDir = path.dirname(ADMIN_ASSETS_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (!fs.existsSync(ADMIN_ASSETS_FILE)) {
    const initialData = {
      fonts: [],
      designs: [],
      posters: [],
      graphics: [],
      videos: [],
      audio: [],
      martyrs: [] // Ensure martyrs array is initialized
    }
    fs.writeFileSync(ADMIN_ASSETS_FILE, JSON.stringify(initialData, null, 2))
  }
}

// Add specific GET route for individual martyrs
export async function GET(req: NextRequest) {
  try {
    initializeAdminAssets()
    const fileContents = fs.readFileSync(ADMIN_ASSETS_FILE, 'utf8')
    const data = JSON.parse(fileContents)
    
    const url = new URL(req.url)
    const idMatch = url.pathname.match(/\/api\/martyrs\/(.+)/)
    
    // Debug logging
    console.log('Request URL:', req.url)
    console.log('URL pathname:', url.pathname)
    console.log('ID Match:', idMatch)
    console.log('Available martyrs:', {
      count: data.martyrs?.length,
      ids: data.martyrs?.map((m: any) => ({ id: m.id, type: typeof m.id }))
    })
    
    if (idMatch) {
      const martyrId = idMatch[1]
      console.log('Looking for martyr ID:', martyrId, 'Type:', typeof martyrId)
      
      // Ensure consistent type comparison and trim any whitespace
      const martyr = data.martyrs?.find((m: any) => 
        String(m.id).trim() === String(martyrId).trim()
      )
      
      console.log('Found martyr:', martyr ? 'Yes' : 'No')
      
      if (!martyr) {
        console.log('Available IDs for comparison:', 
          data.martyrs?.map((m: any) => ({
            id: m.id,
            stringId: String(m.id),
            type: typeof m.id
          }))
        )
        return NextResponse.json(
          { 
            error: 'Martyr not found',
            requestedId: martyrId,
            availableIds: data.martyrs?.map((m: any) => m.id)
          }, 
          { status: 404 }
        )
      }
      
      return NextResponse.json(martyr)
    }
    
    return NextResponse.json({ martyrs: data.martyrs || [] })
  } catch (error) {
    console.error('API Error:', error)
    console.error('Stack:', error.stack)
    return NextResponse.json(
      { error: 'Failed to fetch martyrs', details: error.message }, 
      { status: 500 }
    )
  }
}

// POST, PUT, DELETE methods for martyrs would typically be handled by the admin API,
// but if direct manipulation is needed, they would go here.
// For now, we rely on the /api/admin/assets endpoint for CUD operations.
