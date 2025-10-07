"use client"

import { useState, useCallback, memo } from "react"
import { Search, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearchMartyrs } from "@/hooks/use-martyrs"

interface SearchResult {
  id: string
  name: string
  age: number
  location: string
  image: string
}

const SearchResultItem = memo(({ result, onSelect }: { result: SearchResult, onSelect: (id: string) => void }) => (
  <div 
    className="flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
    onClick={() => onSelect(result.id)}
  >
    <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-yellow-600 to-red-600 flex-shrink-0">
      <img 
        src={result.image} 
        alt={result.name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-white font-bold font-dg-mataryah truncate">{result.name}</div>
      <div className="text-white/70 text-sm font-entezar5">
        {result.age} سنة • {result.location}
      </div>
    </div>
  </div>
))
SearchResultItem.displayName = 'SearchResultItem'

export const LandingSearch = memo(() => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  
  const { data: searchData, isLoading: isSearchLoading } = useSearchMartyrs(searchQuery, isSearching)
  
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearching(true)
    }
  }, [searchQuery])
  
  const handleClearSearch = useCallback(() => {
    setSearchQuery("")
    setIsSearching(false)
  }, [])
  
  const handleSelectResult = useCallback((id: string) => {
    window.location.href = `/martyr/${id}`
  }, [])
  
  const hasResults = searchData && 'martyrs' in searchData && searchData.martyrs.length > 0
  
  return (
    <div className="relative max-w-2xl mx-auto mb-12 px-4">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
          <Input
            placeholder="ابحث عن شهيد، منطقة، أو تاريخ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/10 backdrop-blur-xl text-white placeholder:text-white/60 border-white/20 pr-12 h-12 sm:h-14 text-base sm:text-lg rounded-xl font-dg-mataryah"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button
          type="submit"
          size="lg"
          className="w-full mt-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white border-0 h-12 sm:h-14 text-base sm:text-lg font-bold rounded-xl font-dg-mataryah"
          disabled={!searchQuery.trim()}
        >
          {isSearchLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              جاري البحث...
            </div>
          ) : (
            'بحث'
          )}
        </Button>
      </form>
      
      {/* Search Results */}
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 max-h-96 overflow-y-auto z-50">
          {isSearchLoading ? (
            <div className="p-6 text-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
              <div className="text-white/70 font-entezar5">جاري البحث...</div>
            </div>
          ) : hasResults ? (
            <div className="p-3">
              <div className="text-white/70 text-sm mb-3 font-dg-mataryah">
                تم العثور على {searchData.martyrs.length} نتيجة
              </div>
              <div className="space-y-2">
                {searchData.martyrs.map((result) => (
                  <SearchResultItem 
                    key={result.id} 
                    result={result} 
                    onSelect={handleSelectResult}
                  />
                ))}
              </div>
            </div>
          ) : searchQuery.trim() && (
            <div className="p-6 text-center">
              <div className="text-white/70 font-entezar5">لم يتم العثور على نتائج</div>
              <div className="text-white/50 text-sm mt-1">جرب البحث بكلمات مختلفة</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})
LandingSearch.displayName = 'LandingSearch'
