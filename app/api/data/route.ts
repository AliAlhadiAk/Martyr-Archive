import { NextRequest, NextResponse } from 'next/server'
import { fetchData, updateData } from '@/lib/jsonbin'

export async function GET() {
  try {
    const data = await fetchData()
    return NextResponse.json(data, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const data = await updateData(body)
    return NextResponse.json(data, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update' }, { status: 500 })
  }
}




