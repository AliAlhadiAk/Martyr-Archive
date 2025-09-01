/* eslint-disable */
// Node >=18 required (global fetch). This script appends a martyr to JSONBin.
// Load env from .env.local or .env if present
try { require('dotenv').config({ path: '.env.local' }) } catch {}
try { require('dotenv').config() } catch {}

const JSONBIN_URL = process.env.JSONBIN_URL
const JSONBIN_KEY = process.env.JSONBIN_KEY

function assertEnv() {
  if (!JSONBIN_URL) throw new Error('Missing JSONBIN_URL')
  if (!JSONBIN_KEY) throw new Error('Missing JSONBIN_KEY')
}

function normalizeBaseUrl(rawUrl) {
  return rawUrl.endsWith('/latest') ? rawUrl.slice(0, -('/latest'.length)) : rawUrl
}

function latestUrl(rawUrl) {
  return `${normalizeBaseUrl(rawUrl)}/latest`
}

async function fetchData() {
  assertEnv()
  const res = await fetch(latestUrl(JSONBIN_URL), {
    headers: { 'X-Master-Key': JSONBIN_KEY, 'Accept': 'application/json' },
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`Fetch failed: ${res.status} ${res.statusText} ${t}`)
  }
  const json = await res.json()
  return json && (json.record ?? json)
}

async function updateData(newData) {
  assertEnv()
  const res = await fetch(normalizeBaseUrl(JSONBIN_URL), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Master-Key': JSONBIN_KEY,
      'Accept': 'application/json',
    },
    body: JSON.stringify(newData),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`Update failed: ${res.status} ${res.statusText} ${t}`)
  }
  return res.json()
}

function buildNewMartyr() {
  // Minimal example; extend as needed
  const now = new Date().toISOString()
  return {
    id: `martyr_${Date.now()}_${Math.floor(Math.random()*1000)}`,
    personalInfo: {
      name: 'علي',
      arabicName: 'علي',
      englishName: 'Ali',
      dateOfBirth: '1990-01-01',
      placeOfBirth: 'غزة',
      nationality: 'فلسطيني',
      martyrdomDate: '2025-09-01',
      martyrdomPlace: 'غزة',
      martyrdomCircumstances: 'غير محدد',
      age: 0,
    },
    familyInfo: { fatherName: '', motherName: '', siblings: [], spouse: null, children: [] },
    biography: { education: '', occupation: '', achievements: [], interests: [], testament: '' },
    mediaAssets: { profileImage: null, gallery: [], videos: [], audio: [], documents: [] },
    metadata: { createdAt: now, updatedAt: now, createdBy: 'script', status: 'active', tags: [], priority: 'medium', verificationStatus: 'pending' },
    statistics: { views: 0, downloads: 0, shares: 0, memorialCandles: 0 },
  }
}

async function main() {
  const current = await fetchData()
  if (!current || !Array.isArray(current.martyrs)) {
    throw new Error('Current JSON does not have martyrs array')
  }
  const newMartyr = buildNewMartyr()
  current.martyrs.push(newMartyr)
  const updated = await updateData(current)
  console.log('Appended martyr:', newMartyr.id)
  console.log('JSONBin response (truncated):', JSON.stringify(updated).slice(0, 200) + '...')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


