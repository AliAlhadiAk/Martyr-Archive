import { NextRequest, NextResponse } from 'next/server'
import { s3Client } from '@/lib/s3-client'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bucket = process.env.AWS_BUCKET_NAME
    const region = process.env.AWS_REGION
    if (!bucket || !region) {
      return NextResponse.json({ error: 'S3 is not configured' }, { status: 500 })
    }

    const key = decodeURIComponent(params.id)

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete audio error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete audio' }, { status: 500 })
  }
}



