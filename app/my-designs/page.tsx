"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ResponsiveNavbar } from "@/components/responsive-navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Share2, Edit, Trash2, Eye, Search, Filter, Grid, List, Plus, Heart, Calendar } from 'lucide-react'
import Link from "next/link"

const myDesigns = [
  {
    id: 1,
    name: "الشهيد أحمد محمد",
    template: "البطاقة الكلاسيكية",
    category: "بطاقات",
    createdAt: "2024-01-15",
    downloads: 23,
    shares: 8,
    preview: "/placeholder.svg?height=300&width=200&text=أحمد+محمد",
    status: "مكتمل"
  },
  {
    id: 2,
    name: "بوستر الذكرى - علي حسن",
    template: "بوستر الذكرى",
    category: "بوسترات",
    createdAt: "2024-01-12",
    downloads: 45,
    shares: 15,
    preview: "/placeholder.svg?height=400&width=300&text=علي+حسن",
    status: "مكتمل"
  },
  {
    id: 3,
    name: "قصة انستغرام - فاطمة أحمد",
    template: "قصة انستغرام",
    category: "وسائل التواصل",
    createdAt: "2024-01-10",
    downloads: 67,
    shares: 32,
    preview: "/placeholder.svg?height=400&width=225&text=فاطمة+أحمد",
    status: "مكتمل"
  },
  {
    id: 4,
    name: "البطاقة الذهبية - محمد علي",
    template: "البطاقة الذهبية",
    category: "بطاقات",
    createdAt: "2024-01-08",
    downloads: 12,
    shares: 4,
    preview: "/placeholder.svg?height=300&width=200&text=محمد+علي",
    status: "مسودة"
  },
  {
    id: 5,
    name: "منشور فيسبوك - سارة محمود",
    template: "منشور فيسبوك",
    category: "وسائل التواصل",
    createdAt: "2024-01-05",
    downloads: 89,
    shares: 43,
    preview: "/placeholder.svg?height=250&width=400&text=سارة+محمود",
    status: "مكتمل"
  },
  {
    id: 6,
    name: "غلاف تويتر - يوسف أحمد",
    template: "غلاف تويتر",
    category: "وسائل التواصل",
    createdAt: "2024-01-03",
    downloads: 34,
    shares: 18,
    preview: "/placeholder.svg?height=200&width=600&text=يوسف+أحمد",
    status: "مكتمل"
  }
]

const categories = ["الكل", "بطاقات", "بوسترات", "وسائل التواصل"]
const statuses = ["الكل", "مكتمل", "مسودة"]
const sortOptions = [
  { label: "الأحدث", value: "newest" },
  { label: "الأقدم", value: "oldest" },
  { label: "الأكثر تحميلاً", value: "downloads" },
  { label: "الأكثر مشاركة", value: "shares" },
  { label: "الاسم", value: "name" }
]

export default function DesignsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("الكل")
  const [selectedStatus, setSelectedStatus] = useState("الكل")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedDesigns, setSelectedDesigns] = useState<number[]>([])

  const filteredDesigns = myDesigns.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.template.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "الكل" || design.category === selectedCategory
    const matchesStatus = selectedStatus === "الكل" || design.status === selectedStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "downloads":
        return b.downloads - a.downloads
      case "shares":
        return b.shares - a.shares
      case "name":
        return a.name.localeCompare(b.name, 'ar')
      default:
        return 0
    }
  })

  const toggleDesignSelection = (id: number) => {
    setSelectedDesigns(prev => 
      prev.includes(id) 
        ? prev.filter(designId => designId !== id)
        : [...prev, id]
    )
  }

  const selectAllDesigns = () => {
    setSelectedDesigns(filteredDesigns.map(d => d.id))
  }

  const clearSelection = () => {
    setSelectedDesigns([])
  }

  const deleteSelected = () => {
    if (confirm(`هل أنت متأكد من حذف ${selectedDesigns.length} تصميم؟`)) {
      // In a real app, this would delete the designs
      alert("تم حذف التصاميم المحددة")
      setSelectedDesigns([])
    }
  }

  const downloadSelected = () => {
    // In a real app, this would download the selected designs
    alert(`جاري تحميل ${selectedDesigns.length} تصميم...`)
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
              التصاميم
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mb-6 rounded-full" />
              <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed font-entezar-new">
                مكتبة التصاميم التذكارية المنظمة حسب القوالب والفئات
              </p>
            
            {/* Stats */}
            <div className="flex justify-center items-center gap-8 mt-8 text-white/70">
              <div className="flex items-center gap-2">
                <Grid className="w-5 h-5 text-blue-400" />
                <span className="font-dg-mataryah">{myDesigns.length} تصميم</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-green-400" />
                <span className="font-dg-mataryah">{myDesigns.reduce((sum, d) => sum + d.downloads, 0)} تحميل</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-400" />
                <span className="font-dg-mataryah">{myDesigns.reduce((sum, d) => sum + d.shares, 0)} مشاركة</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Controls Section */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
                {/* Search */}
                <div className="relative flex-1 w-full sm:w-auto">
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <Input
                    placeholder="ابحث في تصاميمك..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 pr-12 h-12 font-dg-mataryah"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white h-12 font-dg-mataryah">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20">
                      {categories.map(category => (
                        <SelectItem key={category} value={category} className="text-white font-dg-mataryah">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white h-12 font-dg-mataryah">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20">
                      {statuses.map(status => (
                        <SelectItem key={status} value={status} className="text-white font-dg-mataryah">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white h-12 font-dg-mataryah">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20">
                      {sortOptions.map(option => (
                        <SelectItem key={option.value} value={option.value} className="text-white font-dg-mataryah">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* View Mode and Actions */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={`h-12 w-12 ${viewMode === "grid" ? "bg-red-600 hover:bg-red-700" : "border-white/20 text-white hover:bg-white/10 bg-transparent"}`}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={`h-12 w-12 ${viewMode === "list" ? "bg-red-600 hover:bg-red-700" : "border-white/20 text-white hover:bg-white/10 bg-transparent"}`}
                >
                  <List className="w-4 h-4" />
                </Button>
                
                <Link href="/design-generator">
                  <Button className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white h-12 font-dg-mataryah">
                    <Plus className="w-4 h-4 ml-2" />
                    تصميم جديد
                  </Button>
                </Link>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedDesigns.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 pt-4 border-t border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-white font-dg-mataryah">
                      {selectedDesigns.length} تصميم محدد
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAllDesigns}
                      className="text-white hover:bg-white/10 font-dg-mataryah"
                    >
                      تحديد الكل
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                      className="text-white hover:bg-white/10 font-dg-mataryah"
                    >
                      إلغاء التحديد
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={downloadSelected}
                      className="bg-green-600 hover:bg-green-700 text-white font-dg-mataryah"
                    >
                      <Download className="w-4 h-4 ml-2" />
                      تحميل المحدد
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={deleteSelected}
                      className="font-dg-mataryah"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف المحدد
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Designs Section */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          {filteredDesigns.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-2xl font-bold text-white mb-4 font-mj-ghalam">لا توجد تصاميم</h3>
              <p className="text-white/70 mb-8 font-dg-mataryah">
                {searchQuery || selectedCategory !== "الكل" || selectedStatus !== "الكل"
                  ? "لا توجد تصاميم تطابق معايير البحث"
                  : "لم تقم بإنشاء أي تصاميم بعد"
                }
              </p>
              <Link href="/design-generator">
                <Button className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-dg-mataryah">
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء تصميم جديد
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-4"
              }
            >
              {filteredDesigns.map((design, index) => (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {viewMode === "grid" ? (
                    <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:border-red-500/30 transition-all duration-300 group">
                      <CardContent className="p-0">
                        {/* Selection Checkbox */}
                        <div className="absolute top-2 left-2 z-10">
                          <input
                            type="checkbox"
                            checked={selectedDesigns.includes(design.id)}
                            onChange={() => toggleDesignSelection(design.id)}
                            className="w-4 h-4 text-red-600 bg-white/20 border-white/30 rounded focus:ring-red-500"
                          />
                        </div>

                        {/* Preview */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={design.preview || "/placeholder.svg"}
                            alt={design.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          {/* Status Badge */}
                          <div className="absolute top-2 right-2">
                            <Badge className={`${design.status === "مكتمل" ? "bg-green-600" : "bg-yellow-600"} text-white font-dg-mataryah`}>
                              {design.status}
                            </Badge>
                          </div>

                          {/* Quick Actions */}
                          <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-white mb-2 font-mj-ghalam line-clamp-1">
                            {design.name}
                          </h3>
                          <p className="text-white/70 text-sm mb-3 font-dg-mataryah">
                            {design.template} • {design.category}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-white/60 mb-3 font-dg-mataryah">
                            <span>{new Date(design.createdAt).toLocaleDateString('ar-EG')}</span>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                {design.downloads}
                              </span>
                              <span className="flex items-center gap-1">
                                <Share2 className="w-3 h-3" />
                                {design.shares}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button size="sm" className="flex-1 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-dg-mataryah">
                              <Edit className="w-3 h-3 ml-1" />
                              تعديل
                            </Button>
                            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    /* List View */
                    <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:border-red-500/30 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={selectedDesigns.includes(design.id)}
                            onChange={() => toggleDesignSelection(design.id)}
                            className="w-4 h-4 text-red-600 bg-white/20 border-white/30 rounded focus:ring-red-500"
                          />
                          
                          <div className="w-16 h-12 flex-shrink-0 rounded overflow-hidden">
                            <img
                              src={design.preview || "/placeholder.svg"}
                              alt={design.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-white font-mj-ghalam">
                                {design.name}
                              </h3>
                              <Badge className={`${design.status === "مكتمل" ? "bg-green-600" : "bg-yellow-600"} text-white font-dg-mataryah text-xs`}>
                                {design.status}
                              </Badge>
                            </div>
                            <p className="text-white/70 text-sm font-dg-mataryah">
                              {design.template} • {design.category}
                            </p>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-white/60 text-xs font-dg-mataryah mb-1">
                              {new Date(design.createdAt).toLocaleDateString('ar-EG')}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-white/60 font-dg-mataryah">
                              <span className="flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                {design.downloads}
                              </span>
                              <span className="flex items-center gap-1">
                                <Share2 className="w-3 h-3" />
                                {design.shares}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </main>
  )
}
