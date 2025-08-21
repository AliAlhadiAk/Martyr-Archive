#!/usr/bin/env node

/**
 * Migration script to transfer files from S3 to Supabase Storage
 * Run with: node scripts/migrate-s3-to-supabase.js
 */

const fs = require('fs')
const path = require('path')
const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const bucket = process.env.AWS_BUCKET_NAME

if (!bucket) {
  console.error('Missing AWS_BUCKET_NAME environment variable')
  process.exit(1)
}

// Storage bucket mapping
const STORAGE_BUCKETS = {
  'images/': 'images',
  'audio/': 'audio',
  'videos/': 'videos',
  'fonts/': 'fonts',
  'documents/': 'documents'
}

async function listS3Objects(prefix = '') {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: 1000
    })
    
    const response = await s3Client.send(command)
    return response.Contents || []
  } catch (error) {
    console.error(`Error listing S3 objects with prefix ${prefix}:`, error)
    return []
  }
}

async function downloadS3Object(key) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    })
    
    const response = await s3Client.send(command)
    return response.Body
  } catch (error) {
    console.error(`Error downloading S3 object ${key}:`, error)
    return null
  }
}

async function uploadToSupabase(fileBuffer, key, contentType) {
  try {
    // Determine bucket from key prefix
    const prefix = Object.keys(STORAGE_BUCKETS).find(p => key.startsWith(p))
    const bucketName = prefix ? STORAGE_BUCKETS[prefix] : 'documents'
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(key, fileBuffer, {
        contentType,
        upsert: false
      })
    
    if (error) {
      throw error
    }
    
    return data
  } catch (error) {
    console.error(`Error uploading to Supabase:`, error)
    return null
  }
}

async function migrateFiles() {
  console.log('Starting S3 to Supabase migration...')
  console.log(`Source S3 bucket: ${bucket}`)
  console.log(`Target Supabase project: ${supabaseUrl}`)
  
  let totalFiles = 0
  let migratedFiles = 0
  let failedFiles = 0
  
  // Migrate each bucket type
  for (const [prefix, bucketName] of Object.entries(STORAGE_BUCKETS)) {
    console.log(`\nMigrating ${prefix} files to ${bucketName} bucket...`)
    
    const objects = await listS3Objects(prefix)
    console.log(`Found ${objects.length} files in ${prefix}`)
    
    for (const obj of objects) {
      totalFiles++
      const key = obj.Key
      
      try {
        console.log(`Migrating: ${key}`)
        
        // Download from S3
        const fileBuffer = await downloadS3Object(key)
        if (!fileBuffer) {
          console.error(`Failed to download: ${key}`)
          failedFiles++
          continue
        }
        
        // Upload to Supabase
        const contentType = obj.ContentType || 'application/octet-stream'
        const result = await uploadToSupabase(fileBuffer, key, contentType)
        
        if (result) {
          console.log(`✓ Migrated: ${key}`)
          migratedFiles++
        } else {
          console.error(`✗ Failed to upload: ${key}`)
          failedFiles++
        }
        
        // Add small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`Error migrating ${key}:`, error.message)
        failedFiles++
      }
    }
  }
  
  console.log('\n=== Migration Summary ===')
  console.log(`Total files: ${totalFiles}`)
  console.log(`Successfully migrated: ${migratedFiles}`)
  console.log(`Failed: ${failedFiles}`)
  console.log(`Success rate: ${((migratedFiles / totalFiles) * 100).toFixed(1)}%`)
}

// Run migration
migrateFiles().catch(console.error)

