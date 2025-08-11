"use client"

import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { searchItems, SearchableItem } from '@/lib/search'
import { useDebounce } from '@/hooks/use-debounce'

interface SearchContextType {
  query: string
  filters: { [key: string]: any }
  results: SearchableItem[]
  setQuery: (query: string) => void
  setFilters: (filters: { [key: string]: any }) => void
  performSearch: (items: SearchableItem[]) => void
}

const SearchContext = createContext<SearchContextType | null>(null)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({})
  const [results, setResults] = useState<SearchableItem[]>([])
  const debouncedQuery = useDebounce(query, 300)

  const performSearch = useCallback((items: SearchableItem[]) => {
    const searchResults = searchItems(items, debouncedQuery, filters)
    setResults(searchResults)
  }, [debouncedQuery, filters])

  const value = useMemo(() => ({
    query,
    filters,
    results,
    setQuery,
    setFilters,
    performSearch
  }), [query, filters, results, performSearch])

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => {
  const context = useContext(SearchContext)
  if (!context) throw new Error('useSearch must be used within SearchProvider')
  return context
}