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

export async function GET() {
  try {
    initializeAdminAssets()
    const fileContents = fs.readFileSync(ADMIN_ASSETS_FILE, 'utf8')
    const data = JSON.parse(fileContents)
    
    // Return only the martyrs array from the admin assets
    // Ensure it's an array, default to empty if not
    const martyrs = Array.isArray(data.martyrs) ? data.martyrs : [];

    return NextResponse.json({ martyrs })
  } catch (error) {
    console.error('Error reading martyrs data from admin assets:', error)
    return NextResponse.json({ martyrs: [] }, { status: 500 })
  }
}

// POST, PUT, DELETE methods for martyrs would typically be handled by the admin API,
// but if direct manipulation is needed, they would go here.
// For now, we rely on the /api/admin/assets endpoint for CUD operations.
