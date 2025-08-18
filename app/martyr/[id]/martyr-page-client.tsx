"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Script from 'next/script'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { 
	ArrowLeft, Calendar, MapPin, Heart,
	Play, Pause, Volume2, VolumeX, Share2, Download, User, Bookmark, BookmarkCheck 
} from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { ResponsiveNavbar } from "@/components/responsive-navbar"

const AIDescriptionGenerator = dynamic(
	() => import('@/components/ai-description-generator').then(m => m.AIDescriptionGenerator),
	{
		ssr: false,
		loading: () => (
			<Card className="bg-white/5 border-white/10">
				<CardContent className="p-6 space-y-3">
					<div className="h-5 w-48 bg-white/10 rounded animate-pulse" />
					<div className="h-10 w-full bg-white/10 rounded animate-pulse" />
					<div className="h-24 w-full bg-white/10 rounded animate-pulse" />
					<div className="h-10 w-40 bg-white/10 rounded animate-pulse" />
				</CardContent>
			</Card>
		)
	}
)

interface MartyrPageClientProps {
	martyr: {
		id: string
		name: string
		age: number
		location: string
		martyrdomDate: string
		image: string
		story: string
		testament?: string
		audioUrl?: string
		gallery?: string[]
		timeline?: { date: string; title: string; description?: string }[]
	}
}

type TabKey = 'overview' | 'media' | 'timeline' | 'related'

export function MartyrPageClient({ martyr }: MartyrPageClientProps) {
	const { toast } = useToast()
	const [activeTab, setActiveTab] = useState<TabKey>('overview')
	const [isLiked, setIsLiked] = useState(false)
	const [isBookmarked, setIsBookmarked] = useState(false)
	const [showShare, setShowShare] = useState(false)
	const [description, setDescription] = useState(martyr.story || '')

	const audioRef = useRef<HTMLAudioElement | null>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [duration, setDuration] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)
	const [volume, setVolume] = useState(0.9)
	const [isMuted, setIsMuted] = useState(false)

	const hasAudio = Boolean(martyr.audioUrl)
	const gallery = Array.isArray(martyr.gallery) ? martyr.gallery : []
	const timeline = Array.isArray(martyr.timeline) ? martyr.timeline : []

	const formattedDuration = useMemo(() => formatTime(duration), [duration])
	const formattedCurrentTime = useMemo(() => formatTime(currentTime), [currentTime])
	const progressPercent = useMemo(
		() => (duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0),
		[currentTime, duration]
	)

	useEffect(() => {
		try {
			const raw = localStorage.getItem('bookmarkedMartyrs')
			const set = new Set<string>(raw ? JSON.parse(raw) : [])
			setIsBookmarked(set.has(String(martyr.id)))
		} catch {}
	}, [martyr.id])

	const toggleBookmark = () => {
		try {
			const raw = localStorage.getItem('bookmarkedMartyrs')
			const arr: string[] = raw ? JSON.parse(raw) : []
			const set = new Set(arr)
			const key = String(martyr.id)
			if (set.has(key)) {
				set.delete(key)
				setIsBookmarked(false)
				toast({ title: 'تمت الإزالة من المحفوظات' })
			} else {
				set.add(key)
				setIsBookmarked(true)
				toast({ title: 'تم الحفظ' })
			}
			localStorage.setItem('bookmarkedMartyrs', JSON.stringify([...set]))
		} catch {}
	}

	useEffect(() => {
		const audio = audioRef.current
		if (!audio) return
		const onLoaded = () => setDuration(audio.duration || 0)
		const onTime = () => setCurrentTime(audio.currentTime || 0)
		const onEnded = () => setIsPlaying(false)
		audio.addEventListener('loadedmetadata', onLoaded)
		audio.addEventListener('timeupdate', onTime)
		audio.addEventListener('ended', onEnded)
		return () => {
			audio.removeEventListener('loadedmetadata', onLoaded)
			audio.removeEventListener('timeupdate', onTime)
			audio.removeEventListener('ended', onEnded)
			audio.pause()
		}
	}, [])

	useEffect(() => {
		const audio = audioRef.current
		if (!audio) return
		audio.volume = isMuted ? 0 : volume
	}, [volume, isMuted])

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === ' ') {
				e.preventDefault()
				if (hasAudio) togglePlay()
			}
			if (e.key.toLowerCase() === 'm') {
				e.preventDefault()
				setIsMuted(m => !m)
			}
		}
		window.addEventListener('keydown', onKey)
		return () => window.removeEventListener('keydown', onKey)
	}, [hasAudio])

	const togglePlay = useCallback(() => {
		const audio = audioRef.current
		if (!audio) return
		if (isPlaying) {
			audio.pause()
			setIsPlaying(false)
		} else {
			audio.play().then(() => setIsPlaying(true)).catch(() => {})
		}
	}, [isPlaying])

	const onSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const audio = audioRef.current
		if (!audio || duration <= 0) return
		const pct = Number(e.target.value)
		const newTime = (pct / 100) * duration
		audio.currentTime = newTime
		setCurrentTime(newTime)
	}, [duration])

	const onVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const newVol = Number(e.target.value)
		setVolume(newVol)
		if (newVol > 0 && isMuted) setIsMuted(false)
	}, [isMuted])

	const toggleMute = useCallback(() => setIsMuted(m => !m), [])

	const handleShare = async () => {
		const url = window.location.href
		setShowShare(true)
		if (navigator.share) {
			try {
				await navigator.share({ title: `الشهيد ${martyr.name}`, text: `تعرف على قصة الشهيد ${martyr.name}`, url })
			} catch {}
		} else {
			try {
				await navigator.clipboard.writeText(url)
				toast({ title: 'تم نسخ الرابط' })
			} catch {}
		}
	}

	const handleDownloadAudio = () => {
		if (!martyr.audioUrl) return
		const link = document.createElement('a')
		link.href = martyr.audioUrl
		link.download = `${martyr.name}.mp3`
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	const [related, setRelated] = useState<any[]>([])
	useEffect(() => {
		const load = async () => {
			try {
				const res = await fetch('/api/martyrs', { cache: 'no-store' })
				const json = await res.json()
				const list = Array.isArray(json.martyrs) ? json.martyrs : []
				const rel = list
					.filter((m: any) => String(m.id) !== String(martyr.id))
					.filter((m: any) => !martyr.location || m.location === martyr.location)
					.slice(0, 6)
				setRelated(rel)
			} catch {}
		}
		load()
	}, [martyr.id, martyr.location])

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900">
			<Script id="json-ld-martyr" type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						'@context': 'https://schema.org',
						'@type': 'Person',
						name: martyr.name,
						description: (martyr.story || '').slice(0, 160),
						image: martyr.image,
						address: martyr.location,
						url: typeof window !== 'undefined' ? window.location.href : undefined,
					})
				}}
			/>

			<ResponsiveNavbar />
			<main className="container mx-auto px-4 py-8 pt-24">
				<Link href="/martyrs" className="inline-flex items-center text-white/60 hover:text-white mb-6" aria-label="العودة للقائمة">
					<ArrowLeft className="w-4 h-4 mr-2" />
					العودة للقائمة
				</Link>

				<div className="mb-6 flex flex-wrap gap-2">
					{tabDefs.map((t) => (
						<Button key={t.key} variant={activeTab === t.key ? 'default' : 'ghost'} onClick={() => setActiveTab(t.key)}>
							{t.label}
						</Button>
					))}
					<div className="ml-auto flex gap-2">
						<Button variant="ghost" size="icon" onClick={toggleBookmark} aria-label={isBookmarked ? 'إزالة من المحفوظات' : 'حفظ'}>
							{isBookmarked ? <BookmarkCheck className="w-5 h-5 text-green-400" /> : <Bookmark className="w-5 h-5 text-white/70" />}
						</Button>
						<Button variant="ghost" onClick={handleShare} className="text-white/80" aria-label="مشاركة">
							<Share2 className="w-4 h-4 mr-2" />
							مشاركة
						</Button>
					</div>
				</div>
				
				<motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">
					{(activeTab === 'overview' || activeTab === 'media') && (
						<Card className="bg-white/5 border-white/10 md:sticky md:top-24 self-start">
							<div className="relative aspect-square">
								<Image
									src={martyr.image}
									alt={martyr.name}
									fill
									sizes="(max-width: 768px) 100vw, 50vw"
									className="object-cover rounded-t-lg"
									priority
								/>
							</div>
							<div className="p-6">
								<div className="flex items-center justify-between mb-4">
									<h1 className="text-3xl font-bold text-white font-mj-ghalam">{martyr.name}</h1>
									<div className="flex items-center gap-1">
										<Button variant="ghost" size="icon" onClick={() => setIsLiked(!isLiked)} aria-pressed={isLiked} aria-label={isLiked ? 'إزالة إعجاب' : 'إعجاب'}>
											<Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white/60'}`} />
										</Button>
										<Button variant="ghost" size="icon" onClick={toggleBookmark} aria-label={isBookmarked ? 'إزالة من المحفوظات' : 'حفظ'}>
											{isBookmarked ? <BookmarkCheck className="w-5 h-5 text-green-400" /> : <Bookmark className="w-5 h-5 text-white/70" />}
										</Button>
									</div>
								</div>
								<div className="flex flex-wrap gap-4 text-sm text-white/70 mb-6">
									<span className="flex items-center gap-1"><User className="w-4 h-4" />{martyr.age} سنة</span>
									<span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{martyr.location}</span>
									<span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{martyr.martyrdomDate}</span>
								</div>

								{activeTab === 'overview' && (
									<div className="space-y-6 text-white/85 font-dg-mataryah leading-8">
										<p>{martyr.story}</p>
										{martyr.testament && (
											<>
												<h2 className="text-xl font-semibold text-white mt-6 mb-3 font-mj-ghalam">الوصية</h2>
												<p>{martyr.testament}</p>
											</>
										)}
									</div>
								)}

								{activeTab === 'media' && hasAudio && (
									<div className="mt-4 space-y-4" aria-label="مشغل الصوت">
										<audio ref={audioRef} src={martyr.audioUrl || undefined} preload="metadata" />
										<div className="flex items-center gap-3 text-white/70 text-xs">
											<span className="tabular-nums min-w-[42px] text-right">{formattedCurrentTime}</span>
											<div className="flex-1">
												<input type="range" min={0} max={100} step={0.1} value={progressPercent} onChange={onSeek} className="w-full accent-red-500" aria-label="التقديم" />
											</div>
											<span className="tabular-nums min-w-[42px]">{formattedDuration}</span>
										</div>
										<div className="flex items-center gap-3">
											<Button variant="outline" size="icon" onClick={togglePlay} aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}>
												{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
											</Button>
											<Button variant="ghost" size="icon" onClick={toggleMute} aria-label={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}>
												{isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text:white/70" /> : <Volume2 className="w-5 h-5 text-white/70" />}
											</Button>
											<div className="flex items:center gap-2 w-40">
												<input type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume} onChange={onVolumeChange} className="w-full accent-red-500" aria-label="مستوى الصوت" />
											</div>
											<div className="flex-1" />
											<Button variant="ghost" onClick={handleDownloadAudio} className="text-white/80" aria-label="تحميل الصوت">
												<Download className="w-4 h-4 mr-2" />
												تحميل الصوت
											</Button>
										</div>
									</div>
								)}
							</div>
						</Card>
					)}

					<div className="space-y-6">
						{activeTab === 'overview' && (
							<Card className="bg-white/5 border-white/10">
								<CardContent className="p-6">
									<h2 className="text-xl font-semibold text-white mb-4 font-mj-ghalam">توليد وصف باستخدام الذكاء الاصطناعي</h2>
									<AIDescriptionGenerator
										defaultPrompt={`اسم الشهيد: ${martyr.name}\nالعمر: ${martyr.age}\nالمكان: ${martyr.location}\nالتاريخ: ${martyr.martyrdomDate}`}
										onGenerate={(newDescription) => setDescription(newDescription)}
									/>
									{description && (
										<div className="mt-6">
											<h3 className="text-lg text-white font-mj-ghalam mb-2">الوصف المقترح</h3>
											<p className="text-white/80 font-dg-mataryah leading-8">{description}</p>
										</div>
									)}
								</CardContent>
							</Card>
						)}

						{activeTab === 'media' && (
							<Card className="bg-white/5 border-white/10">
								<CardContent className="p-6 space-y-4">
									<h2 className="text-xl font-semibold text-white font-mj-ghalam">الوسائط</h2>
									{gallery.length > 0 ? (
										<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
											{gallery.map((src, i) => (
												<div key={i} className="relative aspect-square rounded overflow-hidden">
													<Image src={src} alt={`${martyr.name} ${i + 1}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
												</div>
											))}
										</div>
									) : (
										<p className="text-white/60">لا توجد صور إضافية.</p>
									)}
								</CardContent>
							</Card>
						)}

						{activeTab === 'timeline' && (
							<Card className="bg-white/5 border-white/10">
								<CardContent className="p-6 space-y-6">
									<h2 className="text-xl font-semibold text-white font-mj-ghalam">الخط الزمني</h2>
									{timeline.length > 0 ? (
										<div className="space-y-4">
											{timeline.map((item, i) => (
												<div key={i} className="relative pl-6">
													<div className="absolute right-0 top-1.5 w-2 h-2 rounded-full bg-red-500" />
													<div className="text-white/70 text-sm">{item.date}</div>
													<div className="text-white font-mj-ghalam">{item.title}</div>
													{item.description && <div className="text-white/70 text-sm">{item.description}</div>}
												</div>
											))}
										</div>
									) : (
										<p className="text-white/60">لا توجد عناصر في الخط الزمني.</p>
									)}
								</CardContent>
							</Card>
						)}

						{activeTab === 'related' && (
							<Card className="bg-white/5 border-white/10">
								<CardContent className="p-6 space-y-4">
									<h2 className="text-xl font-semibold text:white font-mj-ghalam">شخصيات مرتبطة</h2>
									{related.length > 0 ? (
										<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
											{related.map((m) => (
												<Link key={m.id} href={`/martyr/${m.id}`} className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg overflow-hidden">
													<div className="relative h-32">
														<Image src={m.image || '/placeholder.svg'} alt={m.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
													</div>
													<div className="p-3">
														<div className="text-white font-mj-ghalam">{m.name}</div>
														<div className="text-white/60 text-sm">{m.location}</div>
													</div>
												</Link>
											))}
										</div>
									) : (
										<p className="text-white/60">لا توجد شخصيات مرتبطة للعرض.</p>
									)}
								</CardContent>
							</Card>
						)}

						<div className="flex flex-wrap gap-2">
							<Badge variant="outline" className="text-white/80 border-white/20">الشهيد</Badge>
							<Badge variant="outline" className="text-white/80 border-white/20">الذاكرة</Badge>
							<Badge variant="outline" className="text-white/80 border-white/20">فلسطين</Badge>
						</div>
					</div>
				</motion.div>
			</main>

			<Dialog open={showShare} onOpenChange={setShowShare}>
				<DialogContent className="bg-white/10 border-white/20 text-white">
					<DialogHeader>
						<DialogTitle className="font-mj-ghalam">مشاركة صفحة الشهيد</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="text-white/80 text-sm">امسح رمز QR أو انسخ الرابط لمشاركته مع الآخرين.</div>
						<div className="flex items-center justify-center">
							<img
								src={`https://quickchart.io/qr?text=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&margin=2&size=220`}
								alt="QR"
								className="rounded bg-white"
								width={220}
								height={220}
							/>
						</div>
						<div className="flex gap-2">
							<Button className="flex-1" onClick={async () => {
								try {
									await navigator.clipboard.writeText(window.location.href)
									toast({ title: 'تم نسخ الرابط' })
								} catch {}
							}}>
								نسخ الرابط
							</Button>
							<Button variant="ghost" className="flex-1" onClick={() => setShowShare(false)}>إغلاق</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

const tabDefs: { key: TabKey; label: string }[] = [
	{ key: 'overview', label: 'نظرة عامة' },
	{ key: 'media', label: 'الوسائط' },
	{ key: 'timeline', label: 'الخط الزمني' },
	{ key: 'related', label: 'مرتبط' },
]

function formatTime(totalSeconds: number): string {
	if (!isFinite(totalSeconds) || totalSeconds < 0) return '0:00'
	const minutes = Math.floor(totalSeconds / 60)
	const seconds = Math.floor(totalSeconds % 60)
	return `${minutes}:${String(seconds).padStart(2, '0')}`
}