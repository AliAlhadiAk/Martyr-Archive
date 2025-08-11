import { NextRequest, NextResponse } from 'next/server'
import { s3Client } from '@/lib/s3-client'
import { PutObjectCommand } from '@aws-sdk/client-s3'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as unknown as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bucket = process.env.AWS_BUCKET_NAME
    const region = process.env.AWS_REGION
    if (!bucket || !region) {
      return NextResponse.json({ error: 'S3 is not configured' }, { status: 500 })
    }

    const originalName = (file as any).name || 'audio.webm'
    const safeName = originalName.replace(/\s+/g, '-').replace(/[^\w\.-]/g, '')
    const key = `audio/${Date.now()}-${safeName}`

    const arrayBuffer = await file.arrayBuffer()
    const body = Buffer.from(arrayBuffer)

    const sse = process.env.AWS_S3_SSE // e.g., 'aws:kms' or 'AES256'
    const sseKmsKeyId = process.env.AWS_S3_KMS_KEY_ID

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: (file as any).type || 'audio/mpeg',
        ...(sse ? { ServerSideEncryption: sse as any } : {}),
        ...(sse === 'aws:kms' && sseKmsKeyId ? { SSEKMSKeyId: sseKmsKeyId } : {}),
      })
    )

    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`
    const payload = {
      id: key,
      title: safeName.replace(/\.[^.]+$/, ''),
      url,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Upload audio error:', error)
    return NextResponse.json({ error: 'Failed to upload audio' }, { status: 500 })
  }
}


