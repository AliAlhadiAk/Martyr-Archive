"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { InteractiveMartyrCardFixed } from "./interactive-martyr-card-fixed"
import { Plus, Heart, Users, Calendar } from 'lucide-react'
// Removed: import martyrData from '@/data/martyrs.json'
import Link from "next/link"
import { useMemo } from "react"
import { useMartyrs } from "@/hooks/use-martyrs"

interface Martyr {
  id: string
  name: string
  age: number
  location: string
  martyrdomDate: string
  image: string
  story: string
  testament: string
  audioUrl: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const titleVariants = {
  hidden: { opacity: 0, y: -50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
}

export function MemoryWallFixed() {
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

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-900 via-black to-gray-900 relative overflow-hidden flex items-center justify-center min-h-screen">
        <div className="text-white text-2xl">Loading memory wall...</div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-900 via-black to-gray-900 relative overflow-hidden flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-2xl">Error loading memory wall</div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated Background */}
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
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Title Section */}
        <motion.div
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent font-adoody"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            جدار الذاكرة
          </motion.h2>
          <motion.div
            className="w-32 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mb-8 rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 128 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <motion.p
            className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed font-entezar-new"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            كل شهيد قصة، وكل قصة درس، وكل درس أمل في غد أفضل
          </motion.p>

          {/* Stats */}
          <motion.div
            className="flex justify-center items-center gap-8 mt-8 text-white/70"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="font-dg-mataryah">{martyrs.length} شهيد</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="font-dg-mataryah">156 منطقة</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-400" />
              <span className="font-dg-mataryah">1,234 قصة</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
        >
          {martyrs.map((martyr, index) => (
            <InteractiveMartyrCardFixed key={martyr.id} martyr={martyr} index={index} />
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 max-w-4xl mx-auto border border-white/20 shadow-2xl">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4, type: "spring", bounce: 0.4 }}
              className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Plus className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h3
              className="text-4xl md:text-5xl font-bold text-white mb-6 font-mj-ghalam"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              شارك قصة شهيد
            </motion.h3>
            <motion.p
              className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed font-dg-mataryah"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              لديك قصة شهيد تريد مشاركتها؟ ساعدنا في بناء أكبر أرشيف للشهداء وحفظ ذكراهم للأجيال القادمة
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/admin">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-8 py-4 text-lg font-bold relative overflow-hidden font-dg-mataryah"
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="relative z-10">إدارة الأرشيف</span>
                  </Button>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/martyrs">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent backdrop-blur-sm font-dg-mataryah"
                  >
                    تصفح جميع الشهداء
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
