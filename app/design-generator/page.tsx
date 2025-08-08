"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { ResponsiveNavbar } from "@/components/responsive-navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Download, Palette, Type, ImageIcon, Sparkles, RefreshCw, Save, Share2, Eye, Settings } from 'lucide-react'

const templates = [
  {
    id: 1,
    name: "البطاقة الكلاسيكية",
    category: "بطاقات",
    preview: "/placeholder.svg?height=300&width=200&text=البطاقة+الكلاسيكية",
    description: "تصميم كلاسيكي أنيق للبطاقات التذكارية"
  },
  {
    id: 2,
    name: "البطاقة الذهبية",
    category: "بطاقات",
    preview: "/placeholder.svg?height=300&width=200&text=البطاقة+الذهبية",
    description: "تصميم فاخر بإطار ذهبي"
  },
  {
    id: 3,
    name: "بوستر الذكرى",
    category: "بوسترات",
    preview: "/placeholder.svg?height=400&width=300&text=بوستر+الذكرى",
    description: "بوستر كبير للمناسبات التذكارية"
  },
  {
    id: 4,
    name: "قصة انستغرام",
    category: "وسائل التواصل",
    preview: "/placeholder.svg?height=400&width=225&text=قصة+انستغرام",
    description: "تصميم مخصص لقصص انستغرام"
  },
  {
    id: 5,
    name: "منشور فيسبوك",
    category: "وسائل التواصل",
    preview: "/placeholder.svg?height=250&width=400&text=منشور+فيسبوك",
    description: "تصميم للمنشورات على فيسبوك"
  },
  {
    id: 6,
    name: "غلاف تويتر",
    category: "وسائل التواصل",
    preview: "/placeholder.svg?height=200&width=600&text=غلاف+تويتر",
    description: "غلاف مخصص لحسابات تويتر"
  }
]

const colorSchemes = [
  { name: "الأحمر الكلاسيكي", primary: "#DC2626", secondary: "#991B1B", accent: "#F59E0B" },
  { name: "الذهبي الفاخر", primary: "#F59E0B", secondary: "#D97706", accent: "#DC2626" },
  { name: "الأزرق الهادئ", primary: "#2563EB", secondary: "#1D4ED8", accent: "#F59E0B" },
  { name: "الأخضر الطبيعي", primary: "#059669", secondary: "#047857", accent: "#DC2626" },
  { name: "البنفسجي الملكي", primary: "#7C3AED", secondary: "#6D28D9", accent: "#F59E0B" }
]

const fonts = [
  { name: "عدودي", value: "adoody", preview: "عدودي - للعناوين الرئيسية" },
  { name: "مج غلام", value: "mj-ghalam", preview: "مج غلام - للعناوين الفرعية" },
  { name: "دي جي مطرية", value: "dg-mataryah", preview: "دي جي مطرية - للنصوص العادية" },
  { name: "انتظار الجديد", value: "entezar-new", preview: "انتظار الجديد - للمحتوى" },
  { name: "انتظار", value: "entezar", preview: "انتظار - للأرقام" }
]

export default function DesignGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [selectedColorScheme, setSelectedColorScheme] = useState(colorSchemes[0])
  const [selectedFont, setSelectedFont] = useState(fonts[0])
  const [designData, setDesignData] = useState({
    name: "",
    age: "",
    location: "",
    date: "",
    quote: "",
    image: null as File | null
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedDesign, setGeneratedDesign] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleInputChange = (field: string, value: string) => {
    setDesignData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDesignData(prev => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateDesign = async () => {
    setIsGenerating(true)
    
    // Simulate design generation
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // In a real app, this would generate the actual design
    setGeneratedDesign(`/placeholder.svg?height=400&width=300&text=${encodeURIComponent(designData.name || 'تصميم جديد')}`)
    setIsGenerating(false)
  }

  const downloadDesign = () => {
    if (generatedDesign) {
      const link = document.createElement('a')
      link.href = generatedDesign
      link.download = `${designData.name || 'تصميم'}-تذكاري.png`
      link.click()
    }
  }

  const shareDesign = () => {
    if (navigator.share && generatedDesign) {
      navigator.share({
        title: `تصميم تذكاري للشهيد ${designData.name}`,
        text: `تصميم تذكاري مخصص للشهيد ${designData.name}`,
        url: generatedDesign
      })
    } else {
      alert("تم نسخ الرابط!")
    }
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
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-adoody">
              مولّد التصميم
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mb-6 rounded-full" />
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed font-entezar-new">
              أنشئ تصاميم تذكارية مخصصة للشهداء باستخدام أدوات التصميم المتقدمة
            </p>
          </motion.div>
        </div>
      </section>

      {/* Design Generator */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Controls Panel */}
            <div className="lg:col-span-1 space-y-6">
              {/* Template Selection */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white font-mj-ghalam flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      اختر القالب
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {templates.map(template => (
                        <motion.button
                          key={template.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedTemplate(template)}
                          className={`relative p-2 rounded-lg border-2 transition-all ${
                            selectedTemplate.id === template.id
                              ? 'border-red-500 bg-red-500/20'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <img
                            src={template.preview || "/placeholder.svg"}
                            alt={template.name}
                            className="w-full h-20 object-cover rounded"
                          />
                          <div className="text-white text-xs mt-1 font-dg-mataryah text-center">
                            {template.name}
                          </div>
                          {selectedTemplate.id === template.id && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Design Data */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white font-mj-ghalam flex items-center gap-2">
                      <Type className="w-5 h-5" />
                      معلومات التصميم
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-white/80 font-dg-mataryah">اسم الشهيد</Label>
                      <Input
                        value={designData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="أدخل اسم الشهيد"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white/80 font-dg-mataryah">العمر</Label>
                        <Input
                          value={designData.age}
                          onChange={(e) => handleInputChange('age', e.target.value)}
                          placeholder="العمر"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                        />
                      </div>
                      <div>
                        <Label className="text-white/80 font-dg-mataryah">المنطقة</Label>
                        <Input
                          value={designData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="المنطقة"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white/80 font-dg-mataryah">تاريخ الاستشهاد</Label>
                      <Input
                        type="date"
                        value={designData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                      />
                    </div>

                    <div>
                      <Label className="text-white/80 font-dg-mataryah">اقتباس أو وصية</Label>
                      <Textarea
                        value={designData.quote}
                        onChange={(e) => handleInputChange('quote', e.target.value)}
                        placeholder="أدخل اقتباساً أو وصية..."
                        rows={3}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                      />
                    </div>

                    <div>
                      <Label className="text-white/80 font-dg-mataryah">صورة الشهيد</Label>
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-white/40 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="design-image-upload"
                        />
                        <label htmlFor="design-image-upload" className="cursor-pointer">
                          {imagePreview ? (
                            <img src={imagePreview || "/placeholder.svg"} alt="معاينة" className="w-20 h-20 object-cover rounded mx-auto mb-2" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-white/60 mx-auto mb-2" />
                          )}
                          <p className="text-white/80 text-sm font-dg-mataryah">
                            {imagePreview ? "تغيير الصورة" : "اضغط لرفع صورة"}
                          </p>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Style Options */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white font-mj-ghalam flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      خيارات التصميم
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Color Scheme */}
                    <div>
                      <Label className="text-white/80 font-dg-mataryah mb-3 block">نظام الألوان</Label>
                      <div className="space-y-2">
                        {colorSchemes.map(scheme => (
                          <button
                            key={scheme.name}
                            onClick={() => setSelectedColorScheme(scheme)}
                            className={`w-full p-3 rounded-lg border-2 transition-all ${
                              selectedColorScheme.name === scheme.name
                                ? 'border-red-500 bg-red-500/20'
                                : 'border-white/20 hover:border-white/40'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex gap-1">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: scheme.primary }}></div>
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: scheme.secondary }}></div>
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: scheme.accent }}></div>
                              </div>
                              <span className="text-white text-sm font-dg-mataryah">{scheme.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Selection */}
                    <div>
                      <Label className="text-white/80 font-dg-mataryah">الخط المستخدم</Label>
                      <Select value={selectedFont.value} onValueChange={(value) => setSelectedFont(fonts.find(f => f.value === value) || fonts[0])}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white font-dg-mataryah">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-white/20">
                          {fonts.map(font => (
                            <SelectItem key={font.value} value={font.value} className="text-white font-dg-mataryah">
                              {font.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Preview and Generation */}
            <div className="lg:col-span-2 space-y-6">
              {/* Preview */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-white font-mj-ghalam flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        معاينة التصميم
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          onClick={generateDesign}
                          disabled={isGenerating || !designData.name}
                          className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-dg-mataryah"
                        >
                          {isGenerating ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full ml-2"
                            />
                          ) : (
                            <Sparkles className="w-4 h-4 ml-2" />
                          )}
                          {isGenerating ? "جاري التوليد..." : "توليد التصميم"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white/5 rounded-xl p-8 min-h-[500px] flex items-center justify-center">
                      {generatedDesign ? (
                        <div className="text-center">
                          <img
                            src={generatedDesign || "/placeholder.svg"}
                            alt="التصميم المولد"
                            className="max-w-full max-h-96 mx-auto rounded-lg shadow-2xl"
                          />
                          <div className="flex justify-center gap-4 mt-6">
                            <Button
                              onClick={downloadDesign}
                              className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white font-dg-mataryah"
                            >
                              <Download className="w-4 h-4 ml-2" />
                              تحميل
                            </Button>
                            <Button
                              onClick={shareDesign}
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10 bg-transparent font-dg-mataryah"
                            >
                              <Share2 className="w-4 h-4 ml-2" />
                              مشاركة
                            </Button>
                            <Button
                              onClick={() => setGeneratedDesign(null)}
                              variant="outline"
                              className="border-white/20 text-white hover:bg-white/10 bg-transparent font-dg-mataryah"
                            >
                              <RefreshCw className="w-4 h-4 ml-2" />
                              تصميم جديد
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-32 h-32 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-16 h-16 text-white/40" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-4 font-mj-ghalam">
                            {isGenerating ? "جاري توليد التصميم..." : "ابدأ بإنشاء تصميمك"}
                          </h3>
                          <p className="text-white/70 font-dg-mataryah">
                            {isGenerating 
                              ? "يرجى الانتظار بينما نقوم بإنشاء تصميم مخصص لك"
                              : "املأ المعلومات المطلوبة واضغط على 'توليد التصميم'"
                            }
                          </p>
                          {isGenerating && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mt-4"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Designs */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white font-mj-ghalam">
                      التصاميم الحديثة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="relative group cursor-pointer">
                          <img
                            src={`/placeholder.svg?height=200&width=150&text=تصميم+${i}`}
                            alt={`تصميم ${i}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
