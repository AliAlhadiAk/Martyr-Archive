import { NextResponse } from 'next/server'
import { s3Client } from '@/lib/s3-client'
import { ListBucketsCommand } from '@aws-sdk/client-s3'
import { supabase } from '@/lib/supabase-client'

export async function GET() {
  try {
    const results = {
      s3: { connected: false, buckets: [], error: null },
      supabase: { connected: false, buckets: [], error: null },
      environment: {
        aws: {
          region: process.env.AWS_REGION,
          bucketName: process.env.AWS_BUCKET_NAME,
          hasCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
        },
        supabase: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      }
    }

    // Test S3 connection
    try {
      const command = new ListBucketsCommand({})
      const response = await s3Client.send(command)
      results.s3 = {
        connected: true,
        buckets: response.Buckets?.map(bucket => bucket.Name) || [],
        error: null
      }
    } catch (error) {
      results.s3.error = error instanceof Error ? error.message : 'Unknown S3 error'
    }

    // Test Supabase connection
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets()
      if (error) throw error
      
      results.supabase = {
        connected: true,
        buckets: buckets?.map(bucket => bucket.name) || [],
        error: null
      }
    } catch (error) {
      results.supabase.error = error instanceof Error ? error.message : 'Unknown Supabase error'
    }

    return NextResponse.json({
      success: true,
      message: 'Storage connectivity test completed',
      ...results
    })
  } catch (error) {
    console.error('Storage test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        aws: {
          region: process.env.AWS_REGION,
          bucketName: process.env.AWS_BUCKET_NAME,
          hasCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
        },
        supabase: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      }
    }, { status: 500 })
  }
}


