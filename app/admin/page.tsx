"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ResponsiveNavbar } from "@/components/responsive-navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Upload, Save, Trash2, Edit, Eye, Download, User, Type, Palette, Video, Music, ImageIcon, FileText, Settings, BarChart3, Users, Crown, Shield } from 'lucide-react'

interface AdminAsset {
  id: number
  name: string
  category: string
  preview?: string
  description: string
  downloads: number
  formats: string[]
  size: string
  tags: string[]
  createdAt: string
  createdBy: string
}

interface FontAsset extends AdminAsset {
  englishName: string
  fileName: string
  weight: string
  premium: boolean
  gradient: string
  fontFamily: string
  downloadUrl: string
  rating: number
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("martyrs")
  const [adminAssets, setAdminAssets] = useState<any>({
    fonts: [],
    designs: [],
    posters: [],
    graphics: [],
    videos: [],
    audio: [],
    martyrs: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form states for different asset types
  const [martyrForm, setMartyrForm] = useState({
    name: "",
    age: "",
    location: "",
    martyrdomDate: "",
    story: "",
    testament: "",
    image: null as File | null,
    audio: null as File | null
  })

  const [fontForm, setFontForm] = useState({
    name: "",
    englishName: "",
    fileName: "",
    category: "",
    weight: "",
    description: "",
    premium: false,
    gradient: "",
    fontFamily: "",
    file: null as File | null
  })

  const [designForm, setDesignForm] = useState({
    name: "",
    category: "",
    template: "",
    description: "",
    formats: [] as string[],
    tags: [] as string[],
    file: null as File | null
  })

  const [posterForm, setPosterForm] = useState({
    name: "",
    category: "",
    description: "",
    formats: [] as string[],
    tags: [] as string[],
    file: null as File | null
  })

  const [graphicForm, setGraphicForm] = useState({
    name: "",
    category: "",
    description: "",
    formats: [] as string[],
    tags: [] as string[],
    file: null as File | null
  })

  const [videoForm, setVideoForm] = useState({
    name: "",
    category: "",
    description: "",
    formats: [] as string[],
    tags: [] as string[],
    duration: "",
    file: null as File | null
  })

  const [audioForm, setAudioForm] = useState({
    name: "",
    category: "",
    description: "",
    formats: [] as string[],
    tags: [] as string[],
    duration: "",
    file: null as File | null
  })

  // Load admin assets on component mount
  useEffect(() => {
    loadAdminAssets()
  }, [])

  const loadAdminAssets = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/assets')
      if (response.ok) {
        const data = await response.json()
        // Ensure all properties are arrays
        setAdminAssets({
          fonts: Array.isArray(data.fonts) ? data.fonts : [],
          designs: Array.isArray(data.designs) ? data.designs : [],
          posters: Array.isArray(data.posters) ? data.posters : [],
          graphics: Array.isArray(data.graphics) ? data.graphics : [],
          videos: Array.isArray(data.videos) ? data.videos : [],
          audio: Array.isArray(data.audio) ? data.audio : [],
          martyrs: Array.isArray(data.martyrs) ? data.martyrs : []
        })
      } else {
        // Fallback to default data with proper arrays
        setAdminAssets({
          fonts: [],
          designs: [],
          posters: [],
          graphics: [],
          videos: [],
          audio: [],
          martyrs: []
        })
      }
    } catch (error) {
      console.error('Error loading admin assets:', error)
      // Set default empty arrays on error
      setAdminAssets({
        fonts: [],
        designs: [],
        posters: [],
        graphics: [],
        videos: [],
        audio: [],
        martyrs: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveAsset = async (type: string, formData: any) => {
    setIsSaving(true)
    try {
      let newAsset: any = {
        id: Date.now(),
        downloads: 0,
        createdAt: new Date().toISOString(),
        createdBy: "admin"
      };

      if (type === 'martyrs') {
        newAsset = {
          ...newAsset,
          name: formData.name,
          age: parseInt(formData.age),
          location: formData.location,
          martyrdomDate: formData.martyrdomDate, // Keep martyrdomDate for admin, map to 'date' for public
          story: formData.story,
          testament: formData.testament,
          // For now, use placeholder URLs for image and audio files
          image: formData.image ? `/placeholder.svg?height=400&width=300&text=${encodeURIComponent(formData.name)}` : "/placeholder.svg?height=400&width=300&text=صورة+الشهيد",
          audioUrl: formData.audio ? `/audio/testament-${newAsset.id}.mp3` : "/audio/placeholder.mp3",
        };
      } else if (type === 'fonts') {
        newAsset = {
          ...newAsset,
          name: formData.name,
          englishName: formData.englishName,
          fileName: formData.file ? formData.file.name : formData.fileName, // Use uploaded file name or provided
          category: formData.category,
          weight: formData.weight,
          description: formData.description,
          premium: formData.premium,
          gradient: formData.gradient,
          fontFamily: formData.fontFamily,
          // Add default/placeholder values for fields not directly in form
          size: formData.file ? `${(formData.file.size / (1024 * 1024)).toFixed(1)} MB` : "N/A",
          formats: formData.file ? [formData.file.name.split('.').pop()?.toUpperCase() || "TTF"] : ["TTF"],
          preview: formData.preview || "الشهداء أحياء عند ربهم يرزقون",
          rating: formData.rating || 4.5,
          downloadUrl: formData.file ? `/fonts/${formData.file.name}` : `/fonts/${formData.fileName || 'default.ttf'}`
        };
      } else {
        // Generic handling for other asset types
        newAsset = {
          ...newAsset,
          ...formData,
          // Placeholder for file uploads for other types
          preview: formData.file ? `/placeholder.svg?height=300&width=200&text=${encodeURIComponent(formData.name)}` : formData.preview,
          formats: formData.file ? [formData.file.name.split('.').pop()?.toUpperCase() || "PNG"] : formData.formats,
          size: formData.file ? `${(formData.file.size / (1024 * 1024)).toFixed(1)} MB` : formData.size,
        };
      }

      // Update local state
      setAdminAssets((prev: any) => ({
        ...prev,
        [type]: Array.isArray(prev[type]) ? [...prev[type], newAsset] : [newAsset]
      }))

      // In a real app, this would save to database/API
      await fetch('/api/admin/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, asset: newAsset })
      })

      alert(`تم إضافة ${getAssetTypeName(type)} بنجاح!`)
      resetForm(type)
      // Reload assets after saving to ensure lists are updated
      loadAdminAssets(); 
    } catch (error) {
      console.error('Error saving asset:', error)
      alert('حدث خطأ أثناء الحفظ')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteAsset = async (type: string, id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      setAdminAssets((prev: any) => ({
        ...prev,
        [type]: Array.isArray(prev[type]) ? prev[type].filter((asset: any) => asset.id !== id) : []
      }))

      // In a real app, this would delete from database/API
      await fetch(`/api/admin/assets/${type}/${id}`, {
        method: 'DELETE'
      })

      alert('تم حذف العنصر بنجاح!')
      // Reload assets after deleting to ensure lists are updated
      loadAdminAssets();
    }
  }

  const getAssetTypeName = (type: string) => {
    const names: Record<string, string> = {
      martyrs: "الشهيد",
      fonts: "الخط",
      designs: "التصميم",
      posters: "البوستر",
      graphics: "الجرافيك",
      videos: "الفيديو",
      audio: "الصوت"
    }
    return names[type] || type
  }

  const resetForm = (type: string) => {
    switch (type) {
      case 'martyrs':
        setMartyrForm({
          name: "",
          age: "",
          location: "",
          martyrdomDate: "",
          story: "",
          testament: "",
          image: null,
          audio: null
        })
        break
      case 'fonts':
        setFontForm({
          name: "",
          englishName: "",
          fileName: "",
          category: "",
          weight: "",
          description: "",
          premium: false,
          gradient: "",
          fontFamily: "",
          file: null
        })
        break
      case 'designs':
        setDesignForm({
          name: "",
          category: "",
          template: "",
          description: "",
          formats: [],
          tags: [],
          file: null
        })
        break
      // Add other form resets...
      case 'posters':
        setPosterForm({
          name: "",
          category: "",
          description: "",
          formats: [],
          tags: [],
          file: null
        })
        break
      case 'graphics':
        setGraphicForm({
          name: "",
          category: "",
          description: "",
          formats: [],
          tags: [],
          file: null
        })
        break
      case 'videos':
        setVideoForm({
          name: "",
          category: "",
          description: "",
          formats: [],
          tags: [],
          duration: "",
          file: null
        })
        break
      case 'audio':
        setAudioForm({
          name: "",
          category: "",
          description: "",
          formats: [],
          tags: [],
          duration: "",
          file: null
        })
        break
    }
  }

  const handleFileUpload = (type: string, field: string, file: File) => {
    switch (type) {
      case 'martyrs':
        setMartyrForm(prev => ({ ...prev, [field]: file }))
        break
      case 'fonts':
        setFontForm(prev => ({ ...prev, [field]: file }))
        break
      case 'designs':
        setDesignForm(prev => ({ ...prev, [field]: file }))
        break
      // Add other file upload handlers...
      case 'posters':
        setPosterForm(prev => ({ ...prev, [field]: file }))
        break
      case 'graphics':
        setGraphicForm(prev => ({ ...prev, [field]: file }))
        break
      case 'videos':
        setVideoForm(prev => ({ ...prev, [field]: file }))
        break
      case 'audio':
        setAudioForm(prev => ({ ...prev, [field]: file }))
        break
    }
  }

  if (isLoading) {
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <ResponsiveNavbar />
      
      {/* Admin Header */}
      <section className="pt-24 pb-8 relative overflow-hidden">
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
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold text-white font-adoody">
                  لوحة الإدارة
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-400 font-dg-mataryah">صلاحيات المدير</span>
                </div>
              </div>
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Admin Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-7 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 mb-8">
                <TabsTrigger value="martyrs" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-white/70 font-dg-mataryah">
                  <User className="w-4 h-4 ml-2" />
                  الشهداء
                </TabsTrigger>
                <TabsTrigger value="fonts" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-white/70 font-dg-mataryah">
                  <Type className="w-4 h-4 ml-2" />
                  الخطوط
                </TabsTrigger>
                <TabsTrigger value="designs" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-white/70 font-dg-mataryah">
                  <Palette className="w-4 h-4 ml-2" />
                  التصاميم
                </TabsTrigger>
                <TabsTrigger value="posters" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-white/70 font-dg-mataryah">
                  <ImageIcon className="w-4 h-4 ml-2" />
                  البوسترات
                </TabsTrigger>
                <TabsTrigger value="graphics" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-white/70 font-dg-mataryah">
                  <FileText className="w-4 h-4 ml-2" />
                  الجرافيك
                </TabsTrigger>
                <TabsTrigger value="videos" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-white/70 font-dg-mataryah">
                  <Video className="w-4 h-4 ml-2" />
                  الفيديو
                </TabsTrigger>
                <TabsTrigger value="audio" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-white/70 font-dg-mataryah">
                  <Music className="w-4 h-4 ml-2" />
                  الصوت
                </TabsTrigger>
              </TabsList>

              {/* Martyrs Tab */}
              <TabsContent value="martyrs">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Add Martyr Form */}
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-white font-mj-ghalam flex items-center gap-2">
                        <Plus className="w-6 h-6 text-red-400" />
                        إضافة شهيد جديد
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white/80 font-dg-mataryah">الاسم الكامل</Label>
                          <Input
                            value={martyrForm.name}
                            onChange={(e) => setMartyrForm(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                            placeholder="أدخل اسم الشهيد"
                          />
                        </div>
                        <div>
                          <Label className="text-white/80 font-dg-mataryah">العمر</Label>
                          <Input
                            type="number"
                            value={martyrForm.age}
                            onChange={(e) => setMartyrForm(prev => ({ ...prev, age: e.target.value }))}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                            placeholder="العمر"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white/80 font-dg-mataryah">المنطقة</Label>
                          <Input
                            value={martyrForm.location}
                            onChange={(e) => setMartyrForm(prev => ({ ...prev, location: e.target.value }))}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                            placeholder="المنطقة أو المدينة"
                          />
                        </div>
                        <div>
                          <Label className="text-white/80 font-dg-mataryah">تاريخ الاستشهاد</Label>
                          <Input
                            type="date"
                            value={martyrForm.martyrdomDate}
                            onChange={(e) => setMartyrForm(prev => ({ ...prev, martyrdomDate: e.target.value }))}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-white/80 font-dg-mataryah">قصة الشهيد</Label>
                        <Textarea
                          value={martyrForm.story}
                          onChange={(e) => setMartyrForm(prev => ({ ...prev, story: e.target.value }))}
                          rows={4}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                          placeholder="اكتب قصة الشهيد..."
                        />
                      </div>

                      <div>
                        <Label className="text-white/80 font-dg-mataryah">الوصية</Label>
                        <Textarea
                          value={martyrForm.testament}
                          onChange={(e) => setMartyrForm(prev => ({ ...prev, testament: e.target.value }))}
                          rows={3}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                          placeholder="وصية الشهيد..."
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white/80 font-dg-mataryah">صورة الشهيد</Label>
                          <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload('martyrs', 'image', e.target.files?.[0]!)}
                              className="hidden"
                              id="martyr-image"
                            />
                            <label htmlFor="martyr-image" className="cursor-pointer">
                              <Upload className="w-8 h-8 text-white/60 mx-auto mb-2" />
                              <p className="text-white/80 text-sm font-dg-mataryah">رفع صورة</p>
                            </label>
                          </div>
                        </div>
                        <div>
                          <Label className="text-white/80 font-dg-mataryah">تسجيل صوتي</Label>
                          <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center">
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => handleFileUpload('martyrs', 'audio', e.target.files?.[0]!)}
                              className="hidden"
                              id="martyr-audio"
                            />
                            <label htmlFor="martyr-audio" className="cursor-pointer">
                              <Upload className="w-8 h-8 text-white/60 mx-auto mb-2" />
                              <p className="text-white/80 text-sm font-dg-mataryah">رفع صوت</p>
                            </label>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => saveAsset('martyrs', martyrForm)}
                        disabled={isSaving || !martyrForm.name}
                        className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white py-3 font-bold font-dg-mataryah"
                      >
                        {isSaving ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full ml-2"
                          />
                        ) : (
                          <Save className="w-5 h-5 ml-2" />
                        )}
                        {isSaving ? "جاري الحفظ..." : "حفظ الشهيد"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Martyrs List */}
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-white font-mj-ghalam flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-400" />
                        قائمة الشهداء ({adminAssets.martyrs?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {adminAssets.martyrs?.map((martyr: any) => (
                          <div key={martyr.id} className="bg-white/10 rounded-lg p-4 flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-bold font-mj-ghalam">{martyr.name}</h4>
                              <p className="text-white/70 text-sm font-dg-mataryah">{martyr.location} • {martyr.age} سنة</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-400 hover:bg-red-500/20"
                                onClick={() => deleteAsset('martyrs', martyr.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Fonts Tab */}
              <TabsContent value="fonts">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Add Font Form */}
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-white font-mj-ghalam flex items-center gap-2">
                        <Plus className="w-6 h-6 text-purple-400" />
                        إضافة خط جديد
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white/80 font-dg-mataryah">اسم الخط بالعربية</Label>
                          <Input
                            value={fontForm.name}
                            onChange={(e) => setFontForm(prev => ({ ...prev, name: e.target.value }))}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                            placeholder="مثال: الخط الكوفي"
                          />
                        </div>
                        <div>
                          <Label className="text-white/80 font-dg-mataryah">اسم الخط بالإنجليزية</Label>
                          <Input
                            value={fontForm.englishName}
                            onChange={(e) => setFontForm(prev => ({ ...prev, englishName: e.target.value }))}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                            placeholder="Example: Kufi Font"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white/80 font-dg-mataryah">فئة الخط</Label>
                          <Select value={fontForm.category} onValueChange={(value) => setFontForm(prev => ({ ...prev, category: value }))}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="اختر الفئة" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-white/20">
                              <SelectItem value="العناوين الرئيسية" className="text-white">العناوين الرئيسية</SelectItem>
                              <SelectItem value="العناوين الفرعية" className="text-white">العناوين الفرعية</SelectItem>
                              <SelectItem value="النصوص العادية" className="text-white">النصوص العادية</SelectItem>
                              <SelectItem value="الأرقام والإحصائيات" className="text-white">الأرقام والإحصائيات</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-white/80 font-dg-mataryah">وزن الخط</Label>
                          <Select value={fontForm.weight} onValueChange={(value) => setFontForm(prev => ({ ...prev, weight: value }))}>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="اختر الوزن" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-white/20">
                              <SelectItem value="Light" className="text-white">خفيف</SelectItem>
                              <SelectItem value="Regular" className="text-white">عادي</SelectItem>
                              <SelectItem value="Medium" className="text-white">متوسط</SelectItem>
                              <SelectItem value="Bold" className="text-white">عريض</SelectItem>
                              <SelectItem value="ExtraBold" className="text-white">عريض جداً</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-white/80 font-dg-mataryah">وصف الخط</Label>
                        <Textarea
                          value={fontForm.description}
                          onChange={(e) => setFontForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                          placeholder="وصف مختصر للخط واستخداماته..."
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white/80 font-dg-mataryah">تدرج الألوان</Label>
                          <Input
                            value={fontForm.gradient}
                            onChange={(e) => setFontForm(prev => ({ ...prev, gradient: e.target.value }))}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                            placeholder="from-red-400 to-orange-500"
                          />
                        </div>
                        <div>
                          <Label className="text-white/80 font-dg-mataryah">فئة CSS</Label>
                          <Input
                            value={fontForm.fontFamily}
                            onChange={(e) => setFontForm(prev => ({ ...prev, fontFamily: e.target.value }))}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                            placeholder="font-custom-name"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-white/80 font-dg-mataryah">
                          <input
                            type="checkbox"
                            checked={fontForm.premium}
                            onChange={(e) => setFontForm(prev => ({ ...prev, premium: e.target.checked }))}
                            className="w-4 h-4 text-red-600 bg-white/10 border-white/30 rounded focus:ring-red-500"
                          />
                          خط مميز
                        </label>
                      </div>

                      <div>
                        <Label className="text-white/80 font-dg-mataryah">ملف الخط (TTF/OTF)</Label>
                        <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            accept=".ttf,.otf,.woff,.woff2"
                            onChange={(e) => handleFileUpload('fonts', 'file', e.target.files?.[0]!)}
                            className="hidden"
                            id="font-file"
                          />
                          <label htmlFor="font-file" className="cursor-pointer">
                            <Upload className="w-8 h-8 text-white/60 mx-auto mb-2" />
                            <p className="text-white/80 text-sm font-dg-mataryah">رفع ملف الخط</p>
                          </label>
                        </div>
                      </div>

                      <Button
                        onClick={() => saveAsset('fonts', fontForm)}
                        disabled={isSaving || !fontForm.name || !fontForm.file}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white py-3 font-bold font-dg-mataryah"
                      >
                        {isSaving ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full ml-2"
                          />
                        ) : (
                          <Save className="w-5 h-5 ml-2" />
                        )}
                        {isSaving ? "جاري الحفظ..." : "حفظ الخط"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Fonts List */}
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-white font-mj-ghalam flex items-center gap-2">
                        <Type className="w-6 h-6 text-purple-400" />
                        قائمة الخطوط ({adminAssets.fonts?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {adminAssets.fonts?.map((font: any) => (
                          <div key={font.id} className="bg-white/10 rounded-lg p-4 flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-bold font-mj-ghalam">{font.name}</h4>
                              <p className="text-white/70 text-sm font-dg-mataryah">{font.category} • {font.weight}</p>
                              {font.premium && (
                                <Badge className="bg-amber-600/20 text-amber-300 border-amber-500/30 mt-1">
                                  مميز
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-400 hover:bg-red-500/20"
                                onClick={() => deleteAsset('fonts', font.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Similar structure for other tabs... */}
              <TabsContent value="designs">
                <div className="text-center py-20">
                  <Palette className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4 font-mj-ghalam">إدارة التصاميم</h3>
                  <p className="text-white/70 font-dg-mataryah">قريباً - إضافة وإدارة التصاميم والقوالب</p>
                </div>
              </TabsContent>

              <TabsContent value="posters">
                <div className="text-center py-20">
                  <ImageIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4 font-mj-ghalam">إدارة البوسترات</h3>
                  <p className="text-white/70 font-dg-mataryah">قريباً - إضافة وإدارة البوسترات التذكارية</p>
                </div>
              </TabsContent>

              <TabsContent value="graphics">
                <div className="text-center py-20">
                  <FileText className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4 font-mj-ghalam">إدارة الجرافيك</h3>
                  <p className="text-white/70 font-dg-mataryah">قريباً - إضافة وإدارة العناصر الجرافيكية</p>
                </div>
              </TabsContent>

              <TabsContent value="videos">
                <div className="text-center py-20">
                  <Video className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4 font-mj-ghalam">إدارة الفيديو</h3>
                  <p className="text-white/70 font-dg-mataryah">قريباً - إضافة وإدارة المقاطع المرئية</p>
                </div>
              </TabsContent>

              <TabsContent value="audio">
                <div className="text-center py-20">
                  <Music className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4 font-mj-ghalam">إدارة الصوت</h3>
                  <p className="text-white/70 font-dg-mataryah">قريباً - إضافة وإدارة المقاطع الصوتية</p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
