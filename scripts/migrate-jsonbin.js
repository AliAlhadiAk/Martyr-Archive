/* eslint-disable */
const fs = require('fs')
const path = require('path')

async function main() {
  const JSONBIN_URL = process.env.JSONBIN_URL
  const JSONBIN_KEY = process.env.JSONBIN_KEY
  if (!JSONBIN_URL || !JSONBIN_KEY) {
    console.error('Missing JSONBIN_URL or JSONBIN_KEY')
    process.exit(1)
  }

  const filePath = path.join(process.cwd(), 'data', 'martyrrs.json')
  if (!fs.existsSync(filePath)) {
    console.error(`Local file not found: ${filePath}`)
    process.exit(1)
  }

  const raw = fs.readFileSync(filePath, 'utf8')
  let json
  try { json = JSON.parse(raw) } catch (e) {
    console.error('Invalid JSON in local file')
    process.exit(1)
  }

  const res = await fetch(JSONBIN_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_KEY,
    },
    body: JSON.stringify(json),
  })
  if (!res.ok) {
    console.error('JSONBin update failed:', res.status, res.statusText)
    process.exit(1)
  }
  const out = await res.json()
  console.log('Migration complete. JSONBin response:', JSON.stringify(out).slice(0, 200) + '...')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})





