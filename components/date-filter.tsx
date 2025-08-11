"use client"

import { useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { Calendar } from 'lucide-react'
import { SearchProvider } from "@/context/search-context"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useSearch } from "@/context/search-context"

function CalendarContent() {
  const { results, performSearch } = useSearch()

  useEffect(() => {
    // Load your JSON data and perform initial search
    const loadData = async () => {
      const response = await fetch('/api/martyrs')
      const data = await response.json()
      performSearch(data)
    }
    loadData()
  }, [performSearch])

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <SearchBar />
        <DateFilter />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map(martyr => (
          <motion.div
            key={martyr.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 rounded-lg p-4"
          >
            {/* Martyr card content */}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function DateFilter() {
  const { filters, setFilters } = useSearch()
  const [isOpen, setIsOpen] = useState(false)

  const handleDateChange = (range: { start: Date; end: Date }) => {
    setFilters({ ...filters, dateRange: range })
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="bg-white/10 border-white/20 text-white">
          <Calendar className="mr-2 h-4 w-4" />
          تاريخ الاستشهاد
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        {/* Add your calendar component here */}
      </PopoverContent>
    </Popover>
  )
}

export default function CalendarPage() {
  return (
    <SearchProvider>
      <CalendarContent />
    </SearchProvider>
  )
}