"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ResponsiveNavbar } from "@/components/responsive-navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, MapPin, Heart, Play, Pause, Volume2, Share2, Download, User } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
//import martyrData from '@/data/martyrs.json'

interface Martyr {
  id: string
  name: string
  age: number
  location: string
  martyrdomDate: string
  image: string
  story: string
  testament: string
  audioUrl?: string
}

export default function MartyrPage() {
  const params = useParams()
  const [martyr, setMartyr] = useState<Martyr | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const martyrId = params.id as string
    const foundMartyr = martyrData.martyrs.find(m => m.id === martyrId)
    
    if (foundMartyr) {
      setMartyr({
        id: foundMartyr.id,
        name: foundMartyr.name,
        age: foundMartyr.age,
        location: foundMartyr.location,
        martyrdomDate: foundMartyr.martyrdomDate,
        image: foundMartyr.image,
        story: foundMartyr.story,
        testament: foundMartyr.testament,
        audioUrl: foundMartyr.audioUrl
      })
    }
    setLoading(false)
  }, [params.id])

  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `الشهيد ${martyr?.name}`,
        text: `تعرف على قصة الشهيد ${martyr?.name}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("تم نسخ الرابط!")
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full"
        />
      </main>
    )
  }

  if (!martyr) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <ResponsiveNavbar />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 font-mj-ghalam">الشهيد غير موجود</h1>
            <p className="text-white/70 mb-8 font-dg-mataryah">لم يتم العثور على الشهيد المطلوب</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-dg-mataryah">
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <ResponsiveNavbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link href="/">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent font-dg-mataryah">
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
          </motion.div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-600 via-orange-500 to-red-600">
                <div className="absolute inset-4 rounded-xl overflow-hidden">
                  <Image
                    src={martyr.image || "/placeholder.svg"}
                    alt={martyr.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Audio Button */}
                {martyr.audioUrl && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
                    onClick={toggleAudio}
                    className="absolute top-6 right-6 w-14 h-14 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors backdrop-blur-sm"
                  >
                    {isAudioPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </motion.button>
                )}

                {/* Badge */}
                <div className="absolute bottom-6 left-6 right-6 text-center">
                  <Badge className="bg-red-600/90 text-white px-4 py-2 text-lg font-bold font-adoody">
                    شهيد في سبيل الله
                  </Badge>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="flex-1 border-white/30 text-white hover:bg-white/10 bg-transparent font-dg-mataryah"
                >
                  <Share2 className="w-4 h-4 ml-2" />
                  مشاركة
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-white/30 text-white hover:bg-white/10 bg-transparent font-dg-mataryah"
                >
                  <Download className="w-4 h-4 ml-2" />
                  تحميل الصورة
                </Button>
              </div>
            </motion.div>

            {/* Content Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Header */}
              <div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-mj-ghalam">
                  الشهيد {martyr.name}
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-700 rounded-full mb-6" />
                
                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                    <CardContent className="p-4 text-center">
                      <User className="w-6 h-6 text-red-400 mx-auto mb-2" />
                      <div className="text-white/60 text-sm font-dg-mataryah">العمر</div>
                      <div className="text-white text-xl font-bold font-entezar">{martyr.age} سنة</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                    <CardContent className="p-4 text-center">
                      <MapPin className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-white/60 text-sm font-dg-mataryah">المنطقة</div>
                      <div className="text-white text-xl font-bold font-entezar">{martyr.location}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-white/60 text-sm font-dg-mataryah">تاريخ الاستشهاد</div>
                    <div className="text-white text-xl font-bold font-entezar">
                      {new Date(martyr.martyrdomDate).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Story */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-4 font-mj-ghalam flex items-center gap-2">
                    <Heart className="w-6 h-6 text-red-500" />
                    قصة الشهيد
                  </h3>
                  <p className="text-white/90 leading-relaxed text-lg font-entezar-new">
                    {martyr.story}
                  </p>
                </CardContent>
              </Card>

              {/* Testament */}
              {martyr.testament && (
                <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border-yellow-500/20">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-4 font-mj-ghalam">
                      الوصية
                    </h3>
                    <blockquote className="text-white/90 leading-relaxed text-lg italic font-entezar-new border-r-4 border-yellow-500 pr-4">
                      "{martyr.testament}"
                    </blockquote>
                    {martyr.audioUrl && (
                      <div className="mt-4">
                        <Button
                          onClick={toggleAudio}
                          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-dg-mataryah"
                        >
                          <Volume2 className="w-4 h-4 ml-2" />
                          {isAudioPlaying ? "إيقاف التسجيل" : "استمع للوصية"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Martyrs */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4 font-mj-ghalam">
              شهداء آخرون من {martyr.location}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {martyrData.martyrs
              .filter(m => m.location === martyr.location && m.id !== martyr.id)
              .slice(0, 3)
              .map((relatedMartyr, index) => (
                <motion.div
                  key={relatedMartyr.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link href={`/martyr/${relatedMartyr.id}`}>
                    <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:border-red-500/30 transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-0">
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={relatedMartyr.image || "/placeholder.svg"}
                            alt={relatedMartyr.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-bold font-mj-ghalam">{relatedMartyr.name}</h3>
                            <p className="text-white/70 text-sm font-dg-mataryah">{relatedMartyr.age} سنة</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
          </div>
        </div>
      </section>
    </main>
  )
}
