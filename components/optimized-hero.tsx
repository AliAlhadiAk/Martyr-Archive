"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { Search, Heart, Star, Users, Play, Volume2, VolumeX } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
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

export function OptimizedHero() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const { data, isLoading, error } = useMartyrs()
  const martyrs: Martyr[] = useMemo(() => {
    const list = (data && 'martyrs' in data ? data.martyrs : []) as any[]
    return list.map((m) => ({
      id: String(m.id),
      name: m.name,
      age: Number(m.age ?? 0),
      location: m.location ?? '',
      martyrdomDate: m.martyrdomDate || m.date || '',
      image: m.image || '/placeholder.svg',
      story: m.story || '',
      testament: m.testament || '',
      audioUrl: m.audioUrl || ''
    }))
  }, [data])
  const featuredMartyr: Martyr | null = martyrs.length > 0 ? martyrs[0] : null

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // fetching handled by useMartyrs

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      console.log("Searching for:", searchQuery)
      // In a real app, you'd filter the martyrs based on searchQuery here
    },
    [searchQuery],
  )

  const toggleAudio = useCallback(() => {
    setIsAudioPlaying((prev) => !prev)
  }, [])

  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-black">
        <div className="text-white text-2xl">Loading martyrs...</div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-black">
        <div className="text-red-500 text-2xl">Error loading data</div>
      </section>
    )
  }

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-black">
      {/* Background Effects */}
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

          {/* Search */}
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
                  {/* Image Section */}
                  <div className="relative">
                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-yellow-600 via-orange-500 to-red-600">
                      <div className="absolute inset-4 rounded-lg overflow-hidden">
                        <Image
                          src={featuredMartyr.image || "/placeholder.svg"}
                          alt={featuredMartyr.name}
                          fill
                          className="object-cover"
                          priority
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
                    
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-yellow-400 text-sm font-bold mb-2 font-dg-mataryah">
                        الوصية
                      </div>
                      <p className="text-white/90 text-sm leading-relaxed font-entezar5">
                        {featuredMartyr.testament}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white flex-1 h-12 font-dg-mataryah"
                        onClick={() => window.location.href = `/martyr/${featuredMartyr.id}`}
                      >
                        اقرأ السيرة كاملة
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 bg-transparent h-12 px-6 font-dg-mataryah"
                        onClick={toggleAudio}
                      >
                        <Play className="w-4 h-4 ml-2" />
                        استمع للوصية
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <motion.div
            className="flex justify-center items-center gap-4 sm:gap-8 mb-12 text-white/80 text-sm sm:text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.3 }}
          >
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold font-entezar2">
                {martyrs.length}
              </div>
              <div className="text-xs sm:text-sm font-dg-mataryah">
                شهيد
              </div>
            </div>
            <div className="w-px h-8 sm:h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold font-entezar2">
                156
              </div>
              <div className="text-xs sm:text-sm font-dg-mataryah">
                منطقة
              </div>
            </div>
            <div className="w-px h-8 sm:h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold font-entezar2">
                1,234
              </div>
              <div className="text-xs sm:text-sm font-dg-mataryah">
                قصة
              </div>
            </div>
          </motion.div>
        </div>

        {/* Time Display */}
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
      </div>
    </section>
  )
}
