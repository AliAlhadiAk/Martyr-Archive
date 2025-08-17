import { NextResponse } from 'next/server'
import { s3Client } from '@/lib/s3-client'
import { ListBucketsCommand } from '@aws-sdk/client-s3'

export async function GET() {
  try {
    // Test S3 connection by listing buckets
    const command = new ListBucketsCommand({})
    const response = await s3Client.send(command)
    
    return NextResponse.json({
      success: true,
      message: 'S3 connection successful',
      buckets: response.Buckets?.map(bucket => bucket.Name) || [],
      region: process.env.AWS_REGION,
      bucketName: process.env.AWS_BUCKET_NAME,
      hasCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
    })
  } catch (error) {
    console.error('S3 test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      region: process.env.AWS_REGION,
      bucketName: process.env.AWS_BUCKET_NAME,
      hasCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
    }, { status: 500 })
  }
}


