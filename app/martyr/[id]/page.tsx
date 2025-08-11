import type { Metadata } from 'next'
import { MartyrPageClient } from './martyr-page-client'

async function getMartyr(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  const res = await fetch(`${baseUrl}/api/martyrs/${id}`, {
    cache: 'force-cache',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!res.ok) return null
  return res.json()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const martyr = await getMartyr(id)
  
  return {
    title: martyr ? `الشهيد ${martyr.name}` : 'الشهيد غير موجود',
    description: martyr?.story?.substring(0, 160) ?? '',
    openGraph: {
      images: martyr?.image ? [martyr.image] : [],
    },
  }
}

export default async function MartyrPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const martyr = await getMartyr(id)

  if (!martyr) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1>الشهيد غير موجود</h1>
      </div>
    )
  }

  return <MartyrPageClient martyr={martyr} />
}
