"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const quotes = [
  "من دمهم كتب التاريخ",
  "شهداء على طبق القدس",
  "الشهادة حياة لا موت",
  "في القلوب يحيون",
  "أحياء عند ربهم يرزقون",
  "الموت في سبيل الله حياة",
  "شهداء الحق والكرامة",
  "أبطال لا ينسون"
]

interface SharedBackgroundProps {
  variant?: "default" | "calendar" | "media"
}

export function SharedBackground({ variant = "default" }: SharedBackgroundProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const getGradientColors = () => {
    switch (variant) {
      case "calendar":
        return {
          primary: "from-blue-900 via-purple-900 to-black",
          orb1: "from-blue-500/10 via-purple-500/5 to-transparent",
          orb2: "from-purple-500/10 via-red-500/5 to-transparent",
          particles: ["from-blue-400 to-purple-400", "from-purple-400 to-red-400", "from-red-400 to-orange-400"]
        }
      case "media":
        return {
          primary: "from-gray-900 via-purple-900 to-black",
          orb1: "from-purple-500/10 via-pink-500/5 to-transparent",
          orb2: "from-cyan-500/10 via-blue-500/5 to-transparent",
          particles: ["from-purple-400 to-pink-400", "from-cyan-400 to-blue-400", "from-amber-400 to-orange-400"]
        }
      default:
        return {
          primary: "from-blue-900 via-purple-900 to-black",
          orb1: "from-red-500/10 via-orange-500/5 to-transparent",
          orb2: "from-purple-500/10 via-blue-500/5 to-transparent",
          particles: ["from-red-400 to-orange-400", "from-purple-400 to-pink-400", "from-blue-400 to-cyan-400"]
        }
    }
  }

  const colors = getGradientColors()

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Main gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.primary}`} />
      
      {/* Floating quote particles */}
      {quotes.map((quote, index) => (
        <motion.div
          key={index}
          className="absolute text-white/3 text-sm md:text-lg font-bold font-adoody select-none"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            opacity: 0,
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            opacity: [0, 0.05, 0],
          }}
          transition={{
            duration: 25 + Math.random() * 15,
            repeat: Infinity,
            ease: "linear",
            delay: index * 2,
          }}
        >
          {quote}
        </motion.div>
      ))}

      {/* Animated gradient orbs */}
      <motion.div
        className={`absolute w-96 h-96 bg-gradient-to-br ${colors.orb1} rounded-full blur-3xl`}
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          top: "10%",
          right: "10%",
        }}
      />
      
      <motion.div
        className={`absolute w-80 h-80 bg-gradient-to-tr ${colors.orb2} rounded-full blur-3xl`}
        animate={{
          x: [0, -150, 100, 0],
          y: [0, 100, -75, 0],
          scale: [0.8, 1.3, 0.9, 0.8],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          bottom: "15%",
          left: "15%",
        }}
      />

      {/* Floating sparkle particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 bg-gradient-to-r ${colors.particles[i % colors.particles.length]} rounded-full opacity-40`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            scale: [1, 1.5, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Subtle light rays */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent transform rotate-12 translate-y-1/4" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent transform -rotate-12 -translate-y-1/4" />
    </div>
  )
}
