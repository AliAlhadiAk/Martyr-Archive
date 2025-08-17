import { NextRequest, NextResponse } from 'next/server'
import { s3Client } from '@/lib/s3-client'
import { GetObjectCommand } from '@aws-sdk/client-s3'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'Audio ID is required' }, { status: 400 })
    }

    const bucket = process.env.AWS_BUCKET_NAME
    if (!bucket) {
      return NextResponse.json({ error: 'S3 is not configured' }, { status: 500 })
    }

    // Get the audio file from S3
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: id,
    })

    const response = await s3Client.send(command)
    
    if (!response.Body) {
      return NextResponse.json({ error: 'Audio file not found' }, { status: 404 })
    }

    // Extract filename from the S3 key
    const filename = id.split('/').pop() || 'audio.mp3'
    
    // Set appropriate headers for download
    const headers = new Headers()
    headers.set('Content-Type', response.ContentType || 'audio/mpeg')
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    if (response.ContentLength) {
      headers.set('Content-Length', response.ContentLength.toString())
    }
    
    // Add CORS headers
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
    headers.set('Cache-Control', 'no-cache')

    // For HEAD requests, return just the headers
    if (request.method === 'HEAD') {
      return new NextResponse(null, {
        status: 200,
        headers,
      })
    }

    // For GET requests, return the file content
    // Convert the readable stream to a response
    const readableStream = response.Body as any
    
    return new NextResponse(readableStream, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Download audio error:', error)
    
    // Check if it's a specific S3 error
    if (error && typeof error === 'object' && 'name' in error) {
      if (error.name === 'NoSuchKey') {
        return NextResponse.json({ error: 'Audio file not found' }, { status: 404 })
      }
      if (error.name === 'AccessDenied') {
        return NextResponse.json({ error: 'Access denied to audio file' }, { status: 403 })
      }
    }
    
    return NextResponse.json({ error: 'Failed to download audio file' }, { status: 500 })
  }
}
