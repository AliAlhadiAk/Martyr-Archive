"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const quotes = [
  "من دمهم كتب التاريخ",
  "شهداء على طبق القدس",
  "الشهادة حياة لا موت",
  "في القلوب يحيون",
  "أحياء عند ربهم يرزقون"
]

export function ParticleQuotes() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {quotes.map((quote, index) => (
        <motion.div
          key={index}
          className="absolute text-white/5 text-lg font-bold font-adoody"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: [0, 0.1, 0],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {quote}
        </motion.div>
      ))}
    </div>
  )
}
