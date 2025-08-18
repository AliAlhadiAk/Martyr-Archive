import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { MartyrPageClient } from './martyr-page-client'

export const revalidate = 300

async function getBaseUrl(): Promise<string> {
	const hdrs = headers()
	const proto = hdrs.get('x-forwarded-proto') ?? 'http'
	const host = hdrs.get('host') ?? 'localhost:3000'
	return `${proto}://${host}`
}

async function getMartyr(id: string) {
	const baseUrl = process.env.NEXT_PUBLIC_API_URL || (await getBaseUrl())
	const res = await fetch(`${baseUrl}/api/martyrs/${id}`, {
		next: { revalidate },
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
