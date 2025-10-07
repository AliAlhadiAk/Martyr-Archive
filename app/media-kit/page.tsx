"use client"

import { useState, useEffect, useMemo, useDeferredValue } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { ResponsiveNavbar } from "@/components/responsive-navbar"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Type, Sparkles, Star, Crown, Diamond, Gem, FileText, Eye, Share2, Copy, Check, ImageIcon, Video, Palette, Music, Archive, Layers } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
// Dynamic imports for heavy client-only sections
const SharedBackground = dynamic(() => import("@/components/shared-background").then(m => m.SharedBackground), { ssr: false, loading: () => null })
const AudioSection = dynamic(() => import("@/components/media-kit/audio-section").then(m => m.AudioSection), { ssr: false, loading: () => null })
const VideoSection = dynamic(() => import("@/components/media-kit/video-section").then(m => m.VideoSection), { ssr: false, loading: () => null })

// Define types for fetched assets
interface FontAsset {
  id: number;
  name: string;
  englishName: string;
  fileName: string;
  category: string;
  weight: string;
  size: string;
  formats: string[];
  preview: string;
  description: string;
  downloads: number;
  rating: number;
  premium: boolean;
  gradient: string;
  fontFamily: string;
  downloadUrl: string;
}

interface OtherAsset {
  name: string;
  formats: string[];
  size: string;
  // Add other properties specific to each asset type if needed
  template?: string; // For designs
  duration?: string; // For videos/audio
}

interface MediaAssets {
  fonts: FontAsset[];
  designs: OtherAsset[];
  posters: OtherAsset[];
  graphics: OtherAsset[];
  videos: OtherAsset[];
  audio: OtherAsset[];
}



async function getAudioFiles() {
  const res = await fetch(`/api/media-kit/audio`, { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json()
  return data.audioFiles
}

async function getVideoFiles() {
  const res = await fetch(`/api/media-kit/videos`, { cache: 'no-store' })
  if (!res.ok) return []
  const data = await res.json()
  return data.videoFiles
}

export default function MediaKitPage() {
  const prefersReducedMotion = useReducedMotion()
  const [selectedCategory, setSelectedCategory] = useState("fonts")
  const [selectedFont, setSelectedFont] = useState<number | null>(null)
  const [downloadingItem, setDownloadingItem] = useState<string | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [previewText, setPreviewText] = useState("الشهداء أحياء عند ربهم يرزقون")
  const deferredPreview = useDeferredValue(previewText)
  const [mediaData, setMediaData] = useState<MediaAssets>({
    fonts: [],
    designs: [],
    posters: [],
    graphics: [],
    videos: [],
    audio: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [audioFiles, setAudioFiles] = useState<any[]>([])
  const [videoFiles, setVideoFiles] = useState<any[]>([])
  const [categoryCounts, setCategoryCounts] = useState({
    fonts: 0,
    logos: 0,
    templates: 0,
    graphics: 0,
    videos: 0,
    audio: 0
  })

  // Media categories with dynamic counts
  const mediaCategories = [
    {
      id: "fonts",
      name: "الخطوط العربية",
      icon: Type,
      color: "from-purple-500 to-pink-500",
      count: categoryCounts.fonts,
      description: "مجموعة حصرية من أفخم الخطوط العربية"
    },
    {
      id: "logos",
      name: "الشعارات والهويات",
      icon: Diamond,
      color: "from-blue-500 to-cyan-500",
      count: categoryCounts.logos,
      description: "شعارات وهويات بصرية متكاملة"
    },
    {
      id: "templates",
      name: "القوالب التصميمية",
      icon: Layers,
      color: "from-green-500 to-emerald-500",
      count: categoryCounts.templates,
      description: "قوالب جاهزة للبطاقات والبوسترات"
    },
    {
      id: "graphics",
      name: "العناصر الجرافيكية",
      icon: Palette,
      color: "from-orange-500 to-red-500",
      count: categoryCounts.graphics,
      description: "أيقونات وعناصر تصميمية متنوعة"
    },
    {
      id: "videos",
      name: "المقاطع المرئية",
      icon: Video,
      color: "from-indigo-500 to-purple-500",
      count: categoryCounts.videos,
      description: "فيديوهات تعريفية وخلفيات متحركة"
    },
    {
      id: "audio",
      name: "المقاطع الصوتية",
      icon: Music,
      color: "from-teal-500 to-blue-500",
      count: categoryCounts.audio,
      description: "تسجيلات صوتية وموسيقى تصويرية"
    }
  ]

  // Function to update category counts
  const updateCategoryCounts = (mediaAssets: MediaAssets, audioFilesList: any[]) => {
    setCategoryCounts({
      fonts: mediaAssets.fonts.length,
      logos: mediaAssets.designs.length, // logos are stored in designs
      templates: mediaAssets.posters.length, // templates are stored in posters
      graphics: mediaAssets.graphics.length,
      videos: mediaAssets.videos.length,
      audio: audioFilesList.length
    })
  }

  // Fetch all data in parallel and commit state once
  useEffect(() => {
    let active = true
    setIsLoading(true)
    ;(async () => {
      try {
        const [assetsRes, audioList, videoList] = await Promise.all([
          fetch('/api/admin/assets', { cache: 'no-store' }),
          getAudioFiles(),
          getVideoFiles(),
        ])

        let mappedData: MediaAssets = { fonts: [], designs: [], posters: [], graphics: [], videos: [], audio: [] }
        if (assetsRes.ok) {
          const data = await assetsRes.json()
          mappedData = {
            fonts: Array.isArray(data.fonts) ? data.fonts.map((font: any) => ({
              id: font.id,
              name: font.name,
              englishName: font.englishName,
              fileName: font.fileName,
              category: font.category,
              weight: font.weight,
              size: font.size || "N/A",
              formats: font.formats || ["TTF"],
              preview: font.preview || "الشهداء أحياء عند ربهم يرزقون",
              description: font.description,
              downloads: font.downloads || 0,
              rating: font.rating || 4.5,
              premium: font.premium,
              gradient: font.gradient,
              fontFamily: font.fontFamily,
              downloadUrl: font.downloadUrl || `/fonts/${font.fileName}`
            })) : [],
            designs: Array.isArray(data.designs) ? data.designs : [],
            posters: Array.isArray(data.posters) ? data.posters : [],
            graphics: Array.isArray(data.graphics) ? data.graphics : [],
            videos: Array.isArray(data.videos) ? data.videos : [],
            audio: Array.isArray(data.audio) ? data.audio : []
          }
        }

        if (!active) return
        setMediaData(mappedData)
        setAudioFiles(Array.isArray(audioList) ? audioList : [])
        setVideoFiles(Array.isArray(videoList) ? videoList : [])
        updateCategoryCounts(mappedData, Array.isArray(audioList) ? audioList : [])
      } catch (e) {
        console.error('Failed loading media kit data', e)
        if (!active) return
        setMediaData({ fonts: [], designs: [], posters: [], graphics: [], videos: [], audio: [] })
        setAudioFiles([])
        setVideoFiles([])
      } finally {
        if (active) setIsLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  const downloadFont = async (font: FontAsset) => {
    setDownloadingItem(`font-${font.id}`)
    
    try {
      // Create a download link
      const link = document.createElement('a')
      link.href = font.downloadUrl
      link.download = font.fileName
      link.click()
      
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloadingItem(null)
    }
  }

  const downloadItem = async (itemId: string) => {
    setDownloadingItem(itemId)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setDownloadingItem(null)
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(type)
    setTimeout(() => setCopiedText(null), 2000)
  }

  // Memoize derived categories with counts
  const categoriesWithCounts = useMemo(() => mediaCategories.map(category => ({
    ...category,
    count: (mediaData[category.id as keyof MediaAssets] as any[])?.length || 0
  })), [mediaData])

  useEffect(() => {
    // Show dialog after a short delay
    const timer = setTimeout(() => setShowDialog(true), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full"
        />
      </main>
    )
  }

  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-900/95 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white font-mj-ghalam">
              <Sparkles className="w-5 h-5 inline-block mr-2 text-blue-400" />
              جرب قوة الذكاء الاصطناعي
            </DialogTitle>
            <DialogDescription className="text-white/90 font-dg-mataryah">
              اكتشف أداتنا الجديدة لتوليد أوصاف مؤثرة ومحترفة لمنشورات الشهداء. استخدم الذكاء الاصطناعي لإنشاء محتوى يليق بتضحياتهم.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Link href="/media-kit/ai-generator">
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white"
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                جرب الآن
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      <main className="min-h-screen bg-black text-white overflow-x-hidden">
        <ResponsiveNavbar />
        <div className="hidden sm:block">
          <SharedBackground variant="media" />
        </div>
        
        {/* Hero Section */}
        <section className="pt-24 pb-20 relative z-10">        
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-center mb-20"
            >
              {/* Premium Logo/Icon */}
              <motion.div
                className="inline-flex items-center gap-4 mb-12"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl blur-xl opacity-50" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-red-600 via-orange-600 to-red-700 rounded-3xl flex items-center justify-center shadow-2xl">
                    <Archive className="w-10 h-10 text-white" />
                    <motion.div
                      className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center"
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    >
                      <Crown className="w-3 h-3 text-white" />
                    </motion.div>
                  </div>
                </div>
                
                <div className="text-left">
                  <motion.h1
                    className="text-4xl md:text-7xl lg:text-9xl font-bold text-white font-adoody"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                  >
                    عدّة الإعلام
                  </motion.h1>
                  <div className="flex items-center gap-3 mt-3">
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Diamond className="w-6 h-6 text-red-400" />
                    </motion.div>
                    <span className="text-lg md:text-2xl text-red-300 font-dg-mataryah">مجموعة الأصول الإعلامية الشاملة</span>
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.7, 1, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-orange-400" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                className="w-40 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 mx-auto mb-12 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: 160 }}
                transition={{ duration: 2, delay: 0.5 }}
              />
              
              <motion.p
                className="text-lg md:text-2xl text-white/80 max-w-5xl mx-auto leading-relaxed font-entezar5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
              >
                مجموعة شاملة من الأصول الإعلامية عالية الجودة لإنشاء محتوى تذكاري يليق بذكرى الشهداء الأبطال
              </motion.p>

              {/* Premium Stats */}
              <motion.div
                className="flex flex-wrap justify-center items-center gap-6 md:gap-12 mt-16"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1 }}
              >
                {[
                  { icon: Download, label: "تحميل", value: "125K+", color: "from-green-400 to-emerald-500" },
                  { icon: Star, label: "تقييم", value: "4.9", color: "from-yellow-400 to-amber-500" },
                  { icon: Gem, label: "أصل رقمي", value: "117", color: "from-red-400 to-orange-500" },
                  { icon: Type, label: "خط عربي", value: mediaData.fonts.length.toString(), color: "from-blue-400 to-cyan-500" }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center group cursor-pointer"
                    whileHover={{ scale: 1.1, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xl transition-all duration-300`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-white font-entezar2">{stat.value}</div>
                    <div className="text-white/60 text-xs md:text-sm font-dg-mataryah">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="pb-12 relative z-10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-5xl font-bold text-white font-mj-ghalam mb-6">
                فئات الأصول الإعلامية
              </h2>
              <p className="text-xl text-white/60 max-w-3xl mx-auto font-dg-mataryah">
                اختر من مجموعة متنوعة من الأصول الإعلامية عالية الجودة
              </p>
            </motion.div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16">
              {categoriesWithCounts.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 50, rotateX: 10 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    y: -10,
                    scale: 1.02
                  }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Card className={`bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl overflow-hidden transition-all duration-300 ${
                    selectedCategory === category.id ? 'ring-2 ring-red-500/50 bg-white/20' : 'hover:bg-white/15'
                  }`}>
                    <CardContent className="p-6 sm:p-8 text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                        <category.icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 font-mj-ghalam">
                        {category.name}
                      </h3>
                      
                      <p className="text-white/70 text-xs sm:text-sm mb-4 font-dg-mataryah leading-relaxed">
                        {category.description}
                      </p>
                      
                      <Badge className={`bg-gradient-to-r ${category.color} bg-opacity-20 text-white border-0 font-dg-mataryah`}>
                        {category.count} عنصر
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="pb-20 relative z-10">
          <div className="container mx-auto px-4">
            <AnimatePresence mode="wait">
              {selectedCategory === "fonts" ? (
                <motion.div
                  key="fonts"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Font Preview Input */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto mb-16"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur-2xl" />
                      <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20">
                        <label className="block text-white font-bold mb-4 font-dg-mataryah text-lg">
                          جرب النص الخاص بك:
                        </label>
                        <input
                          type="text"
                          value={previewText}
                          onChange={(e) => setPreviewText(e.target.value)}
                          className="w-full bg-white/10 border border-white/30 rounded-2xl px-6 py-4 text-white text-xl font-dg-mataryah focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-300"
                          placeholder="اكتب النص الذي تريد معاينته..."
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Fonts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                    {mediaData.fonts.map((font, index) => (
                      <motion.div
                        key={font.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.8, 
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 100
                        }}
                        whileHover={{ 
                          y: -10,
                          scale: 1.02
                        }}
                        className="group"
                      >
                        <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                          <CardHeader className="pb-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <CardTitle className={`text-2xl font-bold bg-gradient-to-r ${font.gradient} bg-clip-text text-transparent font-mj-ghalam`}>
                                    {font.name}
                                  </CardTitle>
                                  {font.premium && (
                                    <motion.div
                                      animate={{
                                        rotate: [0, 360],
                                        scale: [1, 1.1, 1],
                                      }}
                                      transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                      }}
                                    >
                                      <Crown className="w-5 h-5 text-amber-400" />
                                    </motion.div>
                                  )}
                                </div>
                                <p className="text-white/60 text-sm font-dg-mataryah mb-1">{font.englishName}</p>
                                <Badge className={`bg-gradient-to-r ${font.gradient} bg-opacity-20 text-white border-0 font-dg-mataryah`}>
                                  {font.category}
                                </Badge>
                              </div>
                              
                              <div className="text-right">
                                <div className="flex items-center gap-1 mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <motion.div
                                      key={i}
                                      initial={{ opacity: 0, scale: 0 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: i * 0.1 }}
                                    >
                                      <Star className={`w-4 h-4 ${i < Math.floor(font.rating) ? 'text-amber-400 fill-current' : 'text-white/30'}`} />
                                    </motion.div>
                                  ))}
                                  <span className="text-white text-sm font-entezar2 ml-2">{font.rating}</span>
                                </div>
                                <div className="text-white/60 text-xs font-dg-mataryah">
                                  {font.downloads.toLocaleString()} تحميل
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-6">
                            {/* Font Preview */}
                            <div className="relative">
                              <div className={`absolute inset-0 bg-gradient-to-r ${font.gradient} rounded-2xl blur-xl opacity-10`} />
                              <div className="relative bg-black/30 backdrop-blur-xl rounded-2xl p-8 border border-white/10 min-h-[120px] flex items-center justify-center">
                                <motion.p
                                  className={`text-3xl text-center text-white leading-relaxed ${font.fontFamily}`}
                                  key={deferredPreview}
                                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                                  animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                                  transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
                                >
                                  {deferredPreview}
                                </motion.p>
                              </div>
                            </div>
                            
                            {/* Font Details */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                              <div className="bg-white/10 rounded-xl p-4">
                                <div className="text-white/60 text-xs font-dg-mataryah mb-1">الوزن</div>
                                <div className="text-white font-semibold font-entezar2">{font.weight}</div>
                              </div>
                              <div className="bg-white/10 rounded-xl p-4">
                                <div className="text-white/60 text-xs font-dg-mataryah mb-1">الحجم</div>
                                <div className="text-white font-semibold font-entezar2">{font.size}</div>
                              </div>
                            </div>
                            
                            {/* Available Formats */}
                            <div>
                              <div className="text-white/60 text-sm font-dg-mataryah mb-3">التنسيقات المتاحة:</div>
                              <div className="flex flex-wrap gap-2">
                                {font.formats.map((format, formatIndex) => (
                                  <motion.div
                                    key={format}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: formatIndex * 0.1 }}
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    <Badge className="bg-white/10 text-white/80 hover:bg-white/20 transition-colors font-dg-mataryah">
                                      {format}
                                    </Badge>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Description */}
                            <p className="text-white/70 text-sm leading-relaxed font-entezar5">
                              {font.description}
                            </p>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 sm:gap-3 pt-4">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => downloadFont(font)}
                                disabled={downloadingItem === `font-${font.id}`}
                                className={`flex-1 bg-gradient-to-r ${font.gradient} hover:shadow-2xl text-white py-4 rounded-2xl font-bold font-dg-mataryah transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden`}
                              >
                                {downloadingItem === `font-${font.id}` ? (
                                  <>
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    />
                                    جاري التحميل...
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-5 h-5" />
                                    تحميل مجاني
                                  </>
                                )}
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedFont(selectedFont === font.id ? null : font.id)}
                                className="bg-white/10 hover:bg-white/20 text-white p-3 sm:p-4 rounded-2xl transition-all duration-300"
                              >
                                <Eye className="w-5 h-5" />
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => copyToClipboard(font.name, `font-${font.id}`)}
                                className="bg-white/10 hover:bg-white/20 text-white p-3 sm:p-4 rounded-2xl transition-all duration-300"
                              >
                                {copiedText === `font-${font.id}` ? (
                                  <Check className="w-5 h-5 text-green-400" />
                                ) : (
                                  <Copy className="w-5 h-5" />
                                )}
                              </motion.button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : selectedCategory === "audio" ? (
                <motion.div
                  key="audio"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center mb-12">
                    <h3 className="text-4xl font-bold text-white mb-4 font-mj-ghalam">
                      المقاطع الصوتية
                    </h3>
                    <p className="text-xl text-white/60 font-dg-mataryah">
                      تسجيلات صوتية وموسيقى تصويرية عالية الجودة
                    </p>
                  </div>

                  <AudioSection audioFiles={audioFiles} />
                </motion.div>
              ) : selectedCategory === "videos" ? (
                <motion.div
                  key="videos"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center mb-12">
                    <h3 className="text-4xl font-bold text-white mb-4 font-mj-ghalam">
                      ملفات الفيديو
                    </h3>
                    <p className="text-xl text-white/60 font-dg-mataryah">
                      مقاطع فيديو عالية الجودة ومحتوى مرئي متنوع
                    </p>
                  </div>

                  <VideoSection videoFiles={videoFiles} />
                </motion.div>
              ) : (
                /* Other Categories */
                <motion.div
                  key={selectedCategory}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center mb-12">
                    <h3 className="text-4xl font-bold text-white mb-4 font-mj-ghalam">
                      {mediaCategories.find(cat => cat.id === selectedCategory)?.name}
                    </h3>
                    <p className="text-xl text-white/60 font-dg-mataryah">
                      {mediaCategories.find(cat => cat.id === selectedCategory)?.description}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mediaData[selectedCategory as keyof MediaAssets]?.map((asset, index) => (
                      <motion.div
                        key={asset.name}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                      >
                        <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl hover:bg-white/15 transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="text-lg font-bold text-white font-mj-ghalam flex-1">
                                {asset.name}
                              </h4>
                              <Badge className="bg-red-600/20 text-red-300 border-red-500/30 font-dg-mataryah">
                                {asset.size}
                              </Badge>
                            </div>
                            
                            <div className="mb-4">
                              <div className="text-white/60 text-sm font-dg-mataryah mb-2">التنسيقات:</div>
                              <div className="flex flex-wrap gap-2">
                                {asset.formats.map((format) => (
                                  <Badge key={format} className="bg-white/10 text-white/80 font-dg-mataryah">
                                    {format}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => downloadItem(`${selectedCategory}-${index}`)}
                                disabled={downloadingItem === `${selectedCategory}-${index}`}
                                className="flex-1 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white py-3 rounded-xl font-bold font-dg-mataryah transition-all duration-300 flex items-center justify-center gap-2"
                              >
                                {downloadingItem === `${selectedCategory}-${index}` ? (
                                  <>
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                    />
                                    تحميل...
                                  </>
                                ) : (
                                  <>
                                    <Download className="w-4 h-4" />
                                    تحميل
                                  </>
                                )}
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-all duration-300"
                              >
                                <Share2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Premium CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-center mt-20"
            >
              <div className="relative max-w-4xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/20">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Gem className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <h3 className="text-4xl font-bold text-white font-mj-ghalam mb-6">
                    مجموعة كاملة من الأصول الإعلامية
                  </h3>
                  
                  <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed font-dg-mataryah">
                    احصل على جميع الأصول في حزمة واحدة مع تحديثات مجانية مدى الحياة
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:shadow-2xl text-white px-12 py-4 rounded-2xl font-bold text-lg font-dg-mataryah transition-all duration-300 relative overflow-hidden"
                    >
                      <Download className="w-6 h-6 ml-2 inline" />
                      تحميل المجموعة الكاملة
                      
                      {/* Button animation */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 4,
                        }}
                      />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white/10 hover:bg-white/20 text-white px-12 py-4 rounded-2xl font-bold text-lg font-dg-mataryah transition-all duration-300"
                    >
                      <Share2 className="w-6 h-6 ml-2 inline" />
                      مشاركة المجموعة
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>


      </main>
    </>
  )
}
