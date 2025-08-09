"use client"

import dynamic from 'next/dynamic'
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveNavbar } from "@/components/responsive-navbar"
import { SharedBackground } from "@/components/shared-background"
import { Sparkles, TextQuote } from 'lucide-react'

// Lazy load the AI Description Generator
const AIDescriptionGenerator = dynamic(
  () => import('@/components/ai-description-generator').then(mod => mod.AIDescriptionGenerator),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="h-32 bg-white/5 rounded-lg mb-4" />
        <div className="h-10 bg-white/5 rounded-lg w-full" />
      </div>
    ),
    ssr: false
  }
)

export default function AIGeneratorPage() {
  return (
    <div className="min-h-screen">
      <ResponsiveNavbar />
      <SharedBackground variant="alt" />
      
      <main className="container mx-auto px-4 py-8 pt-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-8">
            <TextQuote className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white font-mj-ghalam">
              مولد وصف المنشورات
            </h1>
          </div>

          <Card className="bg-white/5 border-white/10 mb-8">
            <CardContent className="p-6 [&_*]:text-white">
              <p className="text-lg mb-4 font-dg-mataryah opacity-90">
                هذه الأداة تساعدك في إنشاء وصف احترافي ومؤثر لمنشوراتك عن الشهداء. أدخل المعلومات الأساسية وسيقوم الذكاء الاصطناعي بإنشاء وصف مناسب.
              </p>
              <ul className="text-lg list-disc list-inside space-y-2 font-dg-mataryah mb-6 opacity-90">
                <li>يمكنك إدخال معلومات مثل الاسم والعمر والمكان</li>
                <li>سيتم إنشاء وصف يحترم مكانة الشهيد وتضحياته</li>
                <li>يمكنك تعديل النص الناتج حسب احتياجاتك</li>
              </ul>
              <AIDescriptionGenerator
                onGenerate={(text) => {
                  console.log('Generated:', text)
                }}
                defaultPrompt={`اسم الشهيد:
العمر:
المكان:
تاريخ الاستشهاد:
معلومات إضافية:`}
              />
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}