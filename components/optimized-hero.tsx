"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react"
import Image from "next/image"
import { Search, Heart, Star, Users, Play, Volume2, VolumeX, Sparkles, Download, Camera, Video, FileText, Trophy, Wand2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { useMartyrs } from "@/hooks/use-martyrs"

interface Martyr {
  id: string;
  name: string;
  age: number;
  location: string;
  martyrdomDate: string;
  image: string;
  story: string;
  testament: string;
  audioUrl: string;
}

// Memoized time component to prevent unnecessary re-renders
const TimeDisplay = memo(({ currentTime }: { currentTime: Date }) => (
  <motion.div
    className="text-center mt-8 px-4"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, delay: 1.5 }}
  >
    <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 max-w-sm mx-auto border border-white/20">
      <div className="text-lg sm:text-xl font-bold text-white mb-1 font-entezar2">
        {currentTime.toLocaleTimeString("ar-EG")}
      </div>
      <div className="text-sm text-white/70 font-dg-mataryah">
        {currentTime.toLocaleDateString("ar-EG", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    </div>
  </motion.div>
))

TimeDisplay.displayName = 'TimeDisplay'

// Memoized stats component
const StatsDisplay = memo(({ martyrsCount }: { martyrsCount: number }) => (
  <motion.div
    className="flex justify-center items-center gap-4 sm:gap-8 mb-12 text-white/80 text-sm sm:text-base"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, delay: 1.3 }}
  >
    <div className="text-center">
      <div className="text-xl sm:text-2xl font-bold font-entezar2">
        {martyrsCount.toLocaleString()}
      </div>
      <div className="text-xs sm:text-sm font-dg-mataryah">شهيد</div>
    </div>
    <div className="w-px h-8 sm:h-12 bg-white/20" />
    <div className="text-center">
      <div className="text-xl sm:text-2xl font-bold font-entezar2">156</div>
      <div className="text-xs sm:text-sm font-dg-mataryah">منطقة</div>
    </div>
    <div className="w-px h-8 sm:h-12 bg-white/20" />
    <div className="text-center">
      <div className="text-xl sm:text-2xl font-bold font-entezar2">1,234</div>
      <div className="text-xs sm:text-sm font-dg-mataryah">قصة</div>
    </div>
  </motion.div>
))

StatsDisplay.displayName = 'StatsDisplay'

// AI Description Generator Component
const AIDescriptionGenerator = memo(() => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedText, setGeneratedText] = useState("")
  const [inputPrompt, setInputPrompt] = useState("")

  const generateDescription = useCallback(async () => {
    if (!inputPrompt.trim()) return
    
    setIsGenerating(true)
    try {
      // Simulate AI generation (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000))
      setGeneratedText(`تم إنتاج وصف ذكي للشهيد بناءً على: "${inputPrompt}"\n\nهذا وصف تم إنشاؤه بالذكاء الاصطناعي يحتوي على تفاصيل مؤثرة ومناسبة لمنصات التواصل الاجتماعي والإعلام.`)
    } catch (error) {
      console.error('Error generating description:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [inputPrompt])

  return (
    <motion.div
      className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-purple-400/30 max-w-4xl mx-auto mb-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 1.4 }}
    >
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
          <h3 className="text-2xl sm:text-3xl font-bold text-white font-mj-ghalam">
            مولّد الوصف بالذكاء الاصطناعي
          </h3>
          <Wand2 className="w-6 h-6 text-purple-400 animate-bounce" />
        </div>
        <p className="text-white/80 text-sm sm:text-base font-entezar5">
          أداة مجانية لإنتاج أوصاف مؤثرة ومناسبة للشهداء لاستخدامها في الإعلام ومنصات التواصل
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="اكتب معلومات أساسية عن الشهيد (الاسم، العمر، المنطقة، إلخ)..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            className="bg-white/10 backdrop-blur-xl text-white placeholder:text-white/60 border-white/20 h-12 text-base rounded-xl font-dg-mataryah flex-1"
            disabled={isGenerating}
          />
          <Button
            onClick={generateDescription}
            disabled={isGenerating || !inputPrompt.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 px-6 text-base font-bold rounded-xl font-dg-mataryah min-w-[140px]"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                جاري الإنتاج...
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 ml-2" />
                إنتاج الوصف
              </>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {generatedText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/10 rounded-xl p-4 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-yellow-400 text-sm font-bold font-dg-mataryah">
                  الوصف المُنتج:
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white/70 hover:text-white hover:bg-white/10 h-8 px-3"
                  onClick={() => navigator.clipboard.writeText(generatedText)}
                >
                  نسخ النص
                </Button>
              </div>
              <p className="text-white/90 text-sm leading-relaxed font-entezar5 whitespace-pre-line">
                {generatedText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
})

AIDescriptionGenerator.displayName = 'AIDescriptionGenerator'

// Free Templates Section
const FreeTemplatesSection = memo(() => {
  const templates = useMemo(() => [
    {
      icon: <Camera className="w-8 h-8 text-blue-400" />,
      title: "قوالب تصميم",
      description: "قوالب جاهزة لبطاقات الشهداء وبوسترات الذكرى",
      color: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-400/30"
    },
    {
      icon: <Video className="w-8 h-8 text-red-400" />,
      title: "قوالب فيديو",
      description: "قوالب متحركة لمقاطع فيديو تذكارية",
      color: "from-red-500/20 to-orange-500/20",
      border: "border-red-400/30"
    },
    {
      icon: <FileText className="w-8 h-8 text-green-400" />,
      title: "قوالب القصص",
      description: "تنسيقات احترافية لعرض سير الشهداء",
      color: "from-green-500/20 to-emerald-500/20",
      border: "border-green-400/30"
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-400" />,
      title: "قوالب الإنجازات",
      description: "عرض بطولات ومواقف الشهداء بشكل مميز",
      color: "from-yellow-500/20 to-amber-500/20",
      border: "border-yellow-400/30"
    }
  ], [])

  return (
    <motion.div
      className="max-w-6xl mx-auto mb-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 1.2 }}
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-mj-ghalam">
          قوالب مجانية احترافية
        </h3>
        <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full mb-4" />
        <p className="text-white/80 text-sm sm:text-base font-entezar5 max-w-2xl mx-auto">
          قوالب تصميم مجانية جاهزة للتحميل والاستخدام المباشر للصحفيين والمصممين
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {templates.map((template, index) => (
          <motion.div
            key={template.title}
            className={`bg-gradient-to-br ${template.color} backdrop-blur-xl rounded-xl p-6 border ${template.border} hover:scale-105 transition-all duration-300 cursor-pointer group`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.3 + index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div className="text-center">
              <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                {template.icon}
              </div>
              <h4 className="text-white font-bold text-lg mb-2 font-dg-mataryah">
                {template.title}
              </h4>
              <p className="text-white/70 text-sm font-entezar5 leading-relaxed">
                {template.description}
              </p>
              <div className="mt-4">
                <Button
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-0 h-8 px-4 text-xs rounded-lg font-dg-mataryah group-hover:bg-white/30 transition-all duration-300"
                >
                  <Download className="w-3 h-3 ml-1" />
                  تحميل مجاني
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
        <Button
          size="lg"
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white h-12 px-8 text-base font-bold rounded-xl font-dg-mataryah"
        >
          عرض جميع القوالب
        </Button>
      </div>
    </motion.div>
  )
})

FreeTemplatesSection.displayName = 'FreeTemplatesSection'

export function OptimizedHero() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const timeRef = useRef<NodeJS.Timeout>()
  
  const { data, isLoading, error } = useMartyrs()
  
  // Memoize martyrs array with better error handling
  const martyrs: Martyr[] = useMemo(() => {
    if (!data || !('martyrs' in data) || !Array.isArray(data.martyrs)) {
      return []
    }
    
    return data.martyrs.map((m: any) => ({
      id: String(m.id || Math.random().toString(36).substr(2, 9)),
      name: m.name || 'غير محدد',
      age: Number(m.age) || 0,
      location: m.location || 'غير محدد',
      martyrdomDate: m.martyrdomDate || m.date || '',
      image: m.image || '/placeholder.svg',
      story: m.story || '',
      testament: m.testament || '',
      audioUrl: m.audioUrl || ''
    }))
  }, [data])
  
  // Memoize featured martyr
  const featuredMartyr: Martyr | null = useMemo(() => {
    return martyrs.length > 0 ? martyrs[0] : null
  }, [martyrs])

  // Optimized time update with cleanup
  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date())
    timeRef.current = setInterval(updateTime, 1000)
    
    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current)
      }
    }
  }, [])

  // Memoized search handler
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (searchQuery.trim()) {
        console.log("Searching for:", searchQuery)
        // Implement actual search logic here
      }
    },
    [searchQuery],
  )

  // Memoized audio toggle
  const toggleAudio = useCallback(() => {
    setIsAudioPlaying(prev => !prev)
    // Implement actual audio control here
  }, [])

  // Loading state with skeleton
  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-black">
        <div className="text-white text-2xl font-dg-mataryah">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            جاري تحميل الشهداء...
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-black">
        <div className="text-center">
          <div className="text-red-400 text-2xl mb-4 font-dg-mataryah">خطأ في تحميل البيانات</div>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white font-dg-mataryah"
          >
            إعادة المحاولة
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-black">
      {/* Optimized background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Main Content */}
        <div className="text-center mb-16">
          <motion.h1
            className="text-4xl sm:text-6xl lg:text-8xl font-bold text-white mb-6 leading-tight font-adoody"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            الارشيف الرقمي للسعداء
          </motion.h1>
          
          <motion.div
            className="w-24 sm:w-32 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mb-6 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "8rem" }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
          
          <motion.p
            className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed px-4 font-entezar5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            منصة أرشيف رقمية لحفظ وتوثيق سير الشهداء. نقدّم بطاقات تعريفية، قصصًا موثّقة، وصوتيات ومواد إعلامية يمكن للصحفيين والمصممين استخدامها. هدفنا إبقاء الذاكرة حيّة وتقديم محتوى موثوق وسهل المشاركة.
          </motion.p>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <div className="bg-white/10 rounded-xl p-4 text-white/90 font-dg-mataryah">بطاقات الشهداء مع معلومات وصور</div>
            <div className="bg-white/10 rounded-xl p-4 text-white/90 font-dg-mataryah">رزنامة الاستشهاد حسب اليوم والشهر</div>
            <div className="bg-white/10 rounded-xl p-4 text-white/90 font-dg-mataryah">عدّة إعلام ومولّد وصف بالذكاء الاصطناعي</div>
          </motion.div>

          {/* Optimized Search */}
          <motion.form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mb-12 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <Input
                placeholder="ابحث عن شهيد، منطقة، أو تاريخ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 backdrop-blur-xl text-white placeholder:text-white/60 border-white/20 pr-12 h-12 sm:h-14 text-base sm:text-lg rounded-xl font-dg-mataryah"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white border-0 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg font-bold rounded-xl font-dg-mataryah"
            >
              بحث
            </Button>
          </motion.form>

          {/* AI Description Generator - NEW FEATURE */}
          <AIDescriptionGenerator />

          {/* Free Templates Section - NEW FEATURE */}
          <FreeTemplatesSection />

          {/* Martyr of the Day */}
          {featuredMartyr && (
            <motion.div
              className="max-w-4xl mx-auto mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1 }}
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/20">
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 font-mj-ghalam">
                    شهيد اليوم
                  </h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full" />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Optimized Image Section */}
                  <div className="relative">
                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-yellow-600 via-orange-500 to-red-600">
                      <div className="absolute inset-4 rounded-lg overflow-hidden">
                        <Image
                          src={featuredMartyr.image}
                          alt={featuredMartyr.name}
                          fill
                          className="object-cover"
                          priority
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-center">
                        <div className="text-yellow-400 text-lg font-bold mb-1 font-adoody">
                          شهداء على طبق القدس
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-mj-ghalam">
                        الشهيد {featuredMartyr.name}
                      </h3>
                      <p className="text-white/80 text-sm sm:text-base leading-relaxed font-entezar5">
                        {featuredMartyr.story}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-yellow-400 text-sm font-bold mb-1 font-dg-mataryah">
                          العمر
                        </div>
                        <div className="text-white text-lg font-bold font-entezar2">
                          {featuredMartyr.age} سنة
                        </div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <div className="text-yellow-400 text-sm font-bold mb-1 font-dg-mataryah">
                          المنطقة
                        </div>
                        <div className="text-white text-lg font-bold font-entezar2">
                          {featuredMartyr.location}
                        </div>
                      </div>
                    </div>
                    
                    {featuredMartyr.testament && (
                      <div className="bg-white/10 rounded-lg p-4">
                        <div className="text-yellow-400 text-sm font-bold mb-2 font-dg-mataryah">
                          الوصية
                        </div>
                        <p className="text-white/90 text-sm leading-relaxed font-entezar5">
                          {featuredMartyr.testament}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white flex-1 h-12 font-dg-mataryah"
                        onClick={() => window.location.href = `/martyr/${featuredMartyr.id}`}
                      >
                        اقرأ السيرة كاملة
                      </Button>
                      {featuredMartyr.audioUrl && (
                        <Button
                          variant="outline"
                          className="border-white/30 text-white hover:bg-white/10 bg-transparent h-12 px-6 font-dg-mataryah"
                          onClick={toggleAudio}
                        >
                          {isAudioPlaying ? (
                            <Volume2 className="w-4 h-4 ml-2" />
                          ) : (
                            <Play className="w-4 h-4 ml-2" />
                          )}
                          استمع للوصية
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Memoized Stats */}
          <StatsDisplay martyrsCount={martyrs.length} />
        </div>

        {/* Memoized Time Display */}
        <TimeDisplay currentTime={currentTime} />
      </div>
    </section>
  )
}
