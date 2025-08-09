import { NextResponse } from 'next/server'
import { s3Client } from '@/lib/s3-client'
import { ListObjectsV2Command } from '@aws-sdk/client-s3'

export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: 'audio/', // assuming audios are stored in an 'audio' folder
    })

    const response = await s3Client.send(command)
    
    const audioFiles = response.Contents?.map(file => ({
      id: file.Key,
      title: file.Key?.split('/').pop()?.replace('.mp3', '') || '',
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`,
      duration: '00:00' // You'll need to store this metadata separately or extract it
    })) || []

    return NextResponse.json({ audioFiles })
  } catch (error) {
    console.error('Error fetching audio files:', error)
    return NextResponse.json({ error: 'Failed to fetch audio files' }, { status: 500 })
  }
}