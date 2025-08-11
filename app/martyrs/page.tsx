"use client"

import { useState, useMemo } from "react"
import { useMartyrs } from "@/hooks/use-martyrs"
import { useDebounce } from "@/hooks/use-debounce"
import { motion } from "framer-motion"
import { ResponsiveNavbar } from "@/components/responsive-navbar"
import { InteractiveMartyrCardFixed } from "@/components/interactive-martyr-card-fixed"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Users, MapPin, Calendar, SortAsc, SortDesc, Grid, List } from 'lucide-react'

// Define Martyr type to match the expected structure from the API
interface Martyr {
  id: number
  name: string
  age: number
  location: string
  date: string
  image: string
  story: string
  testament: string
  audioUrl: string
}

export default function MartyrsPage() {
  const { data, isLoading, error } = useMartyrs()
  const martyrs: Martyr[] = useMemo(() => {
    const list = (data && 'martyrs' in data ? data.martyrs : []) as any[]
    return Array.isArray(list)
      ? list.map((martyr: any) => ({
          id: Number(martyr.id),
          name: martyr.name,
          age: Number(martyr.age ?? 0),
          location: martyr.location ?? '',
          date: martyr.martyrdomDate || martyr.date || '',
          image: martyr.image || "/placeholder.svg?height=400&width=300&text=صورة+الشهيد",
          story: martyr.story || '',
          testament: martyr.testament || '',
          audioUrl: martyr.audioUrl || "/audio/placeholder.mp3",
        }))
      : []
  }, [data])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedAgeRange, setSelectedAgeRange] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Fetch martyrs via API is now handled in parent components or a shared hook

  const locations = useMemo(() => [...new Set(martyrs.map(m => m.location))].sort(), [martyrs])
  const ageRanges = [
    { label: "جميع الأعمار", value: "all" },
    { label: "أقل من 20", value: "under-20" },
    { label: "20-30", value: "20-30" },
    { label: "30-40", value: "30-40" },
    { label: "أكثر من 40", value: "over-40" }
  ]

  const filteredAndSortedMartyrs = useMemo(() => {
    let filtered = martyrs.filter(martyr => {
      const matchesSearch = debouncedSearchQuery === '' ||
        martyr.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        martyr.location?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        martyr.story?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      
      const matchesLocation = selectedLocation === "all" || martyr.location === selectedLocation
      
      const matchesAge = selectedAgeRange === "all" || 
        (selectedAgeRange === "under-20" && martyr.age < 20) ||
        (selectedAgeRange === "20-30" && martyr.age >= 20 && martyr.age <= 30) ||
        (selectedAgeRange === "30-40" && martyr.age >= 30 && martyr.age <= 40) ||
        (selectedAgeRange === "over-40" && martyr.age > 40)
      
      return matchesSearch && matchesLocation && matchesAge
    })

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name, 'ar')
          break
        case "age":
          comparison = a.age - b.age
          break
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case "location":
          comparison = a.location.localeCompare(b.location, 'ar')
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [martyrs, debouncedSearchQuery, selectedLocation, selectedAgeRange, sortBy, sortOrder])

  const totalPages = Math.ceil(filteredAndSortedMartyrs.length / itemsPerPage)
  const paginatedMartyrs = filteredAndSortedMartyrs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedLocation("all")
    setSelectedAgeRange("all")
    setSortBy("name")
    setSortOrder("asc")
    setCurrentPage(1)
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

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-red-500">فشل تحميل البيانات</div>
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
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-adoody">
              بطاقات الشهداء
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mb-6 rounded-full" />
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed font-entezar-new">
              تصفح مجموعة شاملة من قصص وسير الشهداء الأبطال
            </p>
            
            {/* Stats */}
            <div className="flex justify-center items-center gap-8 mt-8 text-white/70">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-red-400" />
                <span className="font-dg-mataryah">{martyrs.length} شهيد</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span className="font-dg-mataryah">{locations.length} منطقة</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-400" />
                <span className="font-dg-mataryah">{filteredAndSortedMartyrs.length} نتيجة</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 w-full lg:w-auto">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <Input
                  placeholder="ابحث عن شهيد، منطقة، أو كلمة في القصة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60 pr-12 h-12 font-dg-mataryah"
                />
              </div>

              {/* Location Filter */}
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full lg:w-48 bg-white/10 border-white/20 text-white h-12 font-dg-mataryah">
                  <SelectValue placeholder="اختر المنطقة" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  <SelectItem value="all" className="text-white font-dg-mataryah">جميع المناطق</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location} className="text-white font-dg-mataryah">
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Age Filter */}
              <Select value={selectedAgeRange} onValueChange={setSelectedAgeRange}>
                <SelectTrigger className="w-full lg:w-48 bg-white/10 border-white/20 text-white h-12 font-dg-mataryah">
                  <SelectValue placeholder="اختر العمر" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/20">
                  {ageRanges.map(range => (
                    <SelectItem key={range.value} value={range.value} className="text-white font-dg-mataryah">
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full lg:w-40 bg-white/10 border-white/20 text-white h-12 font-dg-mataryah">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    <SelectItem value="name" className="text-white font-dg-mataryah">الاسم</SelectItem>
                    <SelectItem value="age" className="text-white font-dg-mataryah">العمر</SelectItem>
                    <SelectItem value="date" className="text-white font-dg-mataryah">التاريخ</SelectItem>
                    <SelectItem value="location" className="text-white font-dg-mataryah">المنطقة</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent h-12 w-12"
                >
                  {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
              </div>

              {/* View Mode */}
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
              </div>

              {/* Reset Filters */}
              <Button
                onClick={resetFilters}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent h-12 font-dg-mataryah"
              >
                <Filter className="w-4 h-4 ml-2" />
                إعادة تعيين
              </Button>
            </div>

            {/* Active Filters */}
            {(searchQuery || selectedLocation !== "all" || selectedAgeRange !== "all") && (
              <div className="flex flex-wrap gap-2 mt-4">
                {searchQuery && (
                  <Badge variant="secondary" className="bg-red-600/20 text-red-300 font-dg-mataryah">
                    البحث: {searchQuery}
                  </Badge>
                )}
                {selectedLocation !== "all" && (
                  <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 font-dg-mataryah">
                    المنطقة: {selectedLocation}
                  </Badge>
                )}
                {selectedAgeRange !== "all" && (
                  <Badge variant="secondary" className="bg-green-600/20 text-green-300 font-dg-mataryah">
                    العمر: {ageRanges.find(r => r.value === selectedAgeRange)?.label}
                  </Badge>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          {paginatedMartyrs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">😔</div>
              <h3 className="text-2xl font-bold text-white mb-4 font-mj-ghalam">لا توجد نتائج</h3>
              <p className="text-white/70 mb-8 font-dg-mataryah">جرب تغيير معايير البحث أو الفلترة</p>
              <Button onClick={resetFilters} className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-dg-mataryah">
                إعادة تعيين الفلاتر
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Results Grid/List */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className={viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" 
                  : "space-y-6"
                }
              >
                {paginatedMartyrs.map((martyr, index) => (
                  <motion.div
                    key={martyr.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    {viewMode === "grid" ? (
                      <InteractiveMartyrCardFixed martyr={martyr} index={index} />
                    ) : (
                      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 flex gap-6">
                        <div className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={martyr.image || "/placeholder.svg"}
                            alt={martyr.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2 font-mj-ghalam">{martyr.name}</h3>
                          <div className="flex gap-4 text-sm text-white/70 mb-3 font-dg-mataryah">
                            <span>{martyr.age} سنة</span>
                            <span>{martyr.location}</span>
                            <span>{new Date(martyr.date).toLocaleDateString('ar-EG')}</span>
                          </div>
                          <p className="text-white/80 text-sm leading-relaxed mb-4 font-entezar-new line-clamp-2">
                            {martyr.story}
                          </p>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-dg-mataryah"
                            onClick={() => window.location.href = `/martyr/${martyr.id}`}
                          >
                            اقرأ المزيد
                          </Button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex justify-center items-center gap-2 mt-12"
                >
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent font-dg-mataryah"
                  >
                    السابق
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className={page === currentPage 
                        ? "bg-red-600 hover:bg-red-700 text-white font-dg-mataryah" 
                        : "border-white/20 text-white hover:bg-white/10 bg-transparent font-dg-mataryah"
                      }
                    >
                      {page}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent font-dg-mataryah"
                  >
                    التالي
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
