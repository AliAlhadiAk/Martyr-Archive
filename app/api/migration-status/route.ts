import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function GET() {
  try {
    // Check Supabase connection
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to connect to Supabase',
        error: bucketsError.message
      }, { status: 500 })
    }

    // Check each required bucket
    const requiredBuckets = ['images', 'audio', 'videos', 'fonts', 'documents']
    const bucketStatus = {}
    
    for (const bucketName of requiredBuckets) {
      try {
        const { data: files, error } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1 })
        
        bucketStatus[bucketName] = {
          exists: true,
          fileCount: files?.length || 0,
          error: error?.message || null
        }
      } catch (err) {
        bucketStatus[bucketName] = {
          exists: false,
          fileCount: 0,
          error: err.message
        }
      }
    }

    // Check environment variables
    const envStatus = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      awsBucket: !!process.env.AWS_BUCKET_NAME,
      awsRegion: !!process.env.AWS_REGION
    }

    return NextResponse.json({
      status: 'success',
      supabase: {
        connected: true,
        buckets: bucketStatus
      },
      environment: envStatus,
      migration: {
        ready: envStatus.supabaseUrl && envStatus.supabaseAnonKey && envStatus.supabaseServiceKey,
        hasLegacyS3: envStatus.awsBucket && envStatus.awsRegion
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check migration status',
      error: error.message
    }, { status: 500 })
  }
}


