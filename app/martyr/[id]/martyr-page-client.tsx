"use client"

import { useState } from 'react'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, Calendar, MapPin, Heart, 
  Play, Pause, Volume2, Share2, Download, User 
} from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { ResponsiveNavbar } from "@/components/responsive-navbar"
import { AIDescriptionGenerator } from '@/components/ai-description-generator'

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
  }
}

export function MartyrPageClient({ martyr }: MartyrPageClientProps) {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [description, setDescription] = useState(martyr.story || '')

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `الشهيد ${martyr.name}`,
          text: `تعرف على قصة الشهيد ${martyr.name}`,
          url: window.location.href
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("تم نسخ الرابط!")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <ResponsiveNavbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <Link href="/martyrs" className="inline-flex items-center text-white/60 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          العودة للقائمة
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-8"
        >
          <Card className="bg-white/5 border-white/10">
            <div className="relative aspect-square">
              <Image
                src={martyr.image}
                alt={martyr.name}
                fill
                className="object-cover rounded-t-lg"
                priority
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-white font-mj-ghalam">
                  {martyr.name}
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white/60'}`} />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-white/60 mb-6">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {martyr.age} سنة
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {martyr.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {martyr.martyrdomDate}
                </span>
              </div>

              <div className="space-y-6 text-white/80 font-dg-mataryah">
                <p>{martyr.story}</p>
                {martyr.testament && (
                  <>
                    <h2 className="text-xl font-semibold text-white mt-6 mb-3 font-mj-ghalam">
                      الوصية
                    </h2>
                    <p>{martyr.testament}</p>
                  </>
                )}
              </div>

              {martyr.audioUrl && (
                <div className="mt-6 flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                  >
                    {isAudioPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <div className="flex-1 h-1 bg-white/10 rounded-full">
                    <div className="h-full w-1/3 bg-white rounded-full" />
                  </div>
                  <Volume2 className="w-4 h-4 text-white/60" />
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button variant="default" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  مشاركة
                </Button>
                {martyr.audioUrl && (
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    تحميل الصوت
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="max-w-3xl mx-auto mt-8 p-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4 font-mj-ghalam">
                توليد وصف باستخدام الذكاء الاصطناعي
              </h2>
              <AIDescriptionGenerator
                defaultPrompt={`اسم الشهيد: ${martyr.name}
                  العمر: ${martyr.age}
                  المكان: ${martyr.location}
                  التاريخ: ${martyr.martyrdomDate}`}
                onGenerate={(newDescription) => setDescription(newDescription)}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}