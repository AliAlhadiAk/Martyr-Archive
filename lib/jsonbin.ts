import 'server-only'

const JSONBIN_URL = process.env.JSONBIN_URL
const JSONBIN_KEY = process.env.JSONBIN_KEY

function assertEnv() {
  if (!JSONBIN_URL) throw new Error('Missing JSONBIN_URL env var')
  if (!JSONBIN_KEY) throw new Error('Missing JSONBIN_KEY env var')
}

function normalizeBaseUrl(rawUrl: string): string {
  // Accept either base or '/latest' in env; normalize to base (no /latest)
  return rawUrl.endsWith('/latest') ? rawUrl.slice(0, -('/latest'.length)) : rawUrl
}

function latestUrl(rawUrl: string): string {
  const base = normalizeBaseUrl(rawUrl)
  return `${base}/latest`
}

export async function fetchData<T = any>(): Promise<T> {
  assertEnv()
  const res = await fetch(`${latestUrl(JSONBIN_URL as string)}`, {
    method: 'GET',
    headers: {
      'X-Master-Key': JSONBIN_KEY as string,
      'Accept': 'application/json',
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`JSONBin fetch failed: ${res.status} ${res.statusText} ${body}`)
  }
  const json = await res.json()
  return (json && (json.record ?? json)) as T
}

export async function updateData<T = any>(newData: T): Promise<T> {
  assertEnv()
  const res = await fetch(`${normalizeBaseUrl(JSONBIN_URL as string)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_KEY as string,
      'Accept': 'application/json',
    },
    body: JSON.stringify(newData),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`JSONBin update failed: ${res.status} ${res.statusText} ${body}`)
  }
  const json = await res.json()
  return (json && (json.record ?? json)) as T
}

