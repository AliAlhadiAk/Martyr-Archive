import { NextRequest, NextResponse } from 'next/server'
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

export async function GET() {
  try {
    initializeAdminAssets()
    const fileContents = fs.readFileSync(ADMIN_ASSETS_FILE, 'utf8')
    const data = JSON.parse(fileContents)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error reading admin assets:', error)
    return NextResponse.json({ 
      fonts: [], 
      designs: [], 
      posters: [], 
      graphics: [], 
      videos: [], 
      audio: [],
      martyrs: []
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeAdminAssets()
    const { type, asset } = await request.json()
    
    // Read current data
    const fileContents = fs.readFileSync(ADMIN_ASSETS_FILE, 'utf8')
    const data = JSON.parse(fileContents)
    
    // Add new asset to the appropriate category
    if (!data[type]) {
      data[type] = []
    }
    
    data[type].push(asset)
    
    // Write back to file
    fs.writeFileSync(ADMIN_ASSETS_FILE, JSON.stringify(data, null, 2))
    
    return NextResponse.json({ success: true, asset })
  } catch (error) {
    console.error('Error saving admin asset:', error)
    return NextResponse.json({ success: false, error: 'Failed to save asset' }, { status: 500 })
  }
}