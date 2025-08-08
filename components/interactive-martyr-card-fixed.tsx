"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, Calendar, MapPin, Play, Volume2, VolumeX } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

interface Martyr {
  id: number
  name: string
  age: number
  location: string
  date: string
  image: string
  story: string
  testament: string
  audioUrl?: string
}

interface InteractiveMartyrCardFixedProps {
  martyr: Martyr
  index: number
}

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

export function InteractiveMartyrCardFixed({ martyr, index }: InteractiveMartyrCardFixedProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying)
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -10, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <Card className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border-white/20 overflow-hidden h-full hover:border-red-500/30 transition-all duration-300">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Image Section */}
          <div className="relative h-64 overflow-hidden">
            <Image
              src={martyr.image || "/placeholder.svg"}
              alt={martyr.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Audio Button */}
            {martyr.audioUrl && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0 }}
                onClick={toggleAudio}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
              >
                {isAudioPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </motion.button>
            )}

            {/* Overlay Info */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                <Calendar className="w-4 h-4" />
                <span className="font-dg-mataryah">{martyr.date}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <MapPin className="w-4 h-4" />
                <span className="font-dg-mataryah">{martyr.location}</span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2 font-mj-ghalam">
              {martyr.name}
            </h3>
            <div className="text-red-400 text-sm mb-3 font-dg-mataryah">
              العمر: {martyr.age} سنة
            </div>
            <p className="text-white/80 text-sm leading-relaxed mb-4 flex-1 font-entezar-new line-clamp-3">
              {martyr.story}
            </p>
            
            {/* Testament Preview */}
            <div className="bg-white/10 rounded-lg p-3 mb-4">
              <div className="text-yellow-400 text-xs font-bold mb-1 font-dg-mataryah">
                من الوصية
              </div>
              <p className="text-white/90 text-xs leading-relaxed font-entezar-new line-clamp-2">
                {martyr.testament}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link href={`/martyr/${martyr.id}`} className="flex-1">
                <Button
                  className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white text-sm font-dg-mataryah"
                  size="sm"
                >
                  اقرأ السيرة
                </Button>
              </Link>
              {martyr.audioUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                  onClick={toggleAudio}
                >
                  <Play className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
