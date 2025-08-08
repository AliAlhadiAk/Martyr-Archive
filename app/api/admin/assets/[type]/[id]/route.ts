import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const ADMIN_ASSETS_FILE = path.join(process.cwd(), 'data', 'admin-assets.json')

export async function DELETE(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const { type, id } = params
    
    // Read current data
    const fileContents = fs.readFileSync(ADMIN_ASSETS_FILE, 'utf8')
    const data = JSON.parse(fileContents)
    
    // Remove asset from the appropriate category
    if (data[type]) {
      data[type] = data[type].filter((asset: any) => asset.id !== parseInt(id))
    }
    
    // Write back to file
    fs.writeFileSync(ADMIN_ASSETS_FILE, JSON.stringify(data, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting admin asset:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete asset' }, { status: 500 })
  }
}
