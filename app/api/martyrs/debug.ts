import fs from 'fs'
import path from 'path'

const ADMIN_ASSETS_FILE = path.join(process.cwd(), 'data', 'admin-assets.json')

export function debugMartyrsData(martyrId?: string) {
  try {
    const fileContents = fs.readFileSync(ADMIN_ASSETS_FILE, 'utf8')
    const data = JSON.parse(fileContents)
    
    if (martyrId) {
      const martyr = data.martyrs?.find((m: any) => m.id.toString() === martyrId)
      console.log('Looking for martyr:', {
        requestedId: martyrId,
        found: !!martyr,
        martyrDetails: martyr,
        idType: typeof martyrId,
        availableIds: data.martyrs?.map((m: any) => ({
          id: m.id,
          idType: typeof m.id
        }))
      })
    } else {
      console.log('All martyrs:', {
        totalMartyrs: data.martyrs?.length,
        sampleMartyr: data.martyrs?.[0],
        availableIds: data.martyrs?.map((m: { id: string | number }) => m.id)
      })
    }
  } catch (error) {
    console.error('Error reading file:', error)
  }
}

// Run this to debug:
// debugMartyrsData()