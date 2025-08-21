import { Storage } from '@google-cloud/storage'
import path from 'path'
import fs from 'fs'

// Buckets we use (create these in your GCP project or let code create them)
export const STORAGE_BUCKETS = {
  IMAGES: 'images',
  AUDIO: 'audio',
  VIDEOS: 'videos',
  DOCUMENTS: 'documents',
} as const

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS]

// Resolve service account credentials directly from app dir (no env)
const keyFilename = path.join(process.cwd(), 'steam-canto-461415-s4-49cb45451bdf.json')

const storage = new Storage({
  credentials: process.env.GOOGLE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT)
    : undefined,
})

// Derive project-scoped unique bucket names
let projectId = 'local-project'
try {
  const credRaw = fs.readFileSync(keyFilename, 'utf8')
  const cred = JSON.parse(credRaw)
  if (cred?.project_id) projectId = cred.project_id
} catch {}

function getPhysicalBucketName(bucket: StorageBucket): string {
  return `${projectId}-${bucket}`
}

export interface UploadResult {
  id: string
  url: string
  key: string
  title: string
  size: string
  createdAt: string
}

export interface FileMetadata {
  name: string
  size: number
  type: string
  bucket: StorageBucket
}

/**
 * Ensure a storage bucket exists, create if it doesn't
 */
async function ensureBucketExists(bucketName: string): Promise<boolean> {
  try {
    const bucket = storage.bucket(getPhysicalBucketName(bucketName as StorageBucket))
    const [exists] = await bucket.exists()
    if (!exists) {
      await storage.createBucket(bucket.name, { location: 'US', uniformBucketLevelAccess: true })
      console.log(`Created bucket: ${bucket.name}`)
    }
    return true
  } catch (error) {
    console.warn(`Skipping bucket existence check due to error for ${bucketName}:`, error)
    return true
  }
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File | Buffer,
  metadata: FileMetadata,
  options?: { 
    cacheControl?: string
    upsert?: boolean 
  }
): Promise<UploadResult> {
  const { name, size, type, bucket } = metadata

  const bucketReady = await ensureBucketExists(bucket)
  if (!bucketReady) {
    throw new Error(`Storage bucket '${bucket}' is not available`)
  }

  const timestamp = Date.now()
  const safeName = name.replace(/\s+/g, '-').replace(/[^\w\.-]/g, '')
  const key = `${timestamp}-${safeName}`

  const targetBucket = storage.bucket(getPhysicalBucketName(bucket))
  const gcsFile = targetBucket.file(key)

  try {
    const buffer: Buffer = Buffer.isBuffer(file)
      ? file
      : Buffer.from(await (file as File).arrayBuffer())

    await gcsFile.save(buffer, {
      contentType: type,
      resumable: false,
      public: true as any,
      metadata: {
        cacheControl: options?.cacheControl || 'public, max-age=3600',
      },
    })

    // Make public (if not already)
    try { await gcsFile.makePublic() } catch {}

    const publicUrl = `https://storage.googleapis.com/${targetBucket.name}/${encodeURIComponent(key)}`

    return {
      id: key,
      url: publicUrl,
      key,
      title: safeName.replace(/\.[^.]+$/, ''),
      size: `${(buffer.length / (1024 * 1024)).toFixed(1)} MB`,
      createdAt: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error('GCS upload error:', error)
    const message = (error && (error.message || error.error || String(error))) || 'Unknown error'
    throw new Error(`Failed to upload file: ${message}`)
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(bucket: StorageBucket, key: string): Promise<boolean> {
  try {
    await storage.bucket(getPhysicalBucketName(bucket)).file(key).delete({ ignoreNotFound: true })
    return true
  } catch (error) {
    console.error('GCS delete error:', error)
    return false
  }
}

/**
 * Get a signed URL for private files (if needed)
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const [url] = await storage
      .bucket(getPhysicalBucketName(bucket))
      .file(key)
      .getSignedUrl({ action: 'read', expires: Date.now() + expiresIn * 1000 })
    return url
  } catch (error) {
    console.error('GCS signed URL error:', error)
    throw new Error('Failed to generate signed URL')
  }
}

/**
 * List files in a bucket
 */
export async function listFiles(
  bucket: StorageBucket,
  dirPath?: string
): Promise<{ name: string; id: string; size?: number; created_at: string }[]> {
  try {
    const [files] = await storage.bucket(getPhysicalBucketName(bucket)).getFiles({ prefix: dirPath || '' })
    return files.map((f) => ({ name: f.name, id: f.name, size: undefined, created_at: '' }))
  } catch (error) {
    console.error('GCS list error:', error)
    return []
  }
}

/**
 * Download a file from Supabase Storage
 */
export async function downloadFile(bucket: StorageBucket, key: string): Promise<Buffer> {
  try {
    const [data] = await storage.bucket(getPhysicalBucketName(bucket)).file(key).download()
    return data
  } catch (error) {
    console.error('GCS download error:', error)
    throw new Error('Failed to download file')
  }
}
