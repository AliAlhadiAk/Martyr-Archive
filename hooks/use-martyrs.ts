"use client"

import { useQuery } from '@tanstack/react-query'

export interface MartyrApiItem {
  id: string | number
  name: string
  age?: number | string
  location?: string
  martyrdomDate?: string
  date?: string
  image?: string
  story?: string
  testament?: string
  audioUrl?: string
  [key: string]: any
}

export interface MartyrsResponse {
  martyrs: MartyrApiItem[]
  total: number
  returned: number
  cached?: boolean
}

export function useMartyrs(limit?: number) {
  return useQuery<MartyrsResponse | { error: string }>(
    {
      queryKey: ['martyrs', limit],
      queryFn: async () => {
        const url = limit ? `/api/martyrs?limit=${limit}` : '/api/martyrs'
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch martyrs')
        return res.json()
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  )
}

// Hook specifically for landing page - uses optimized API
export function useLandingMartyrs() {
  return useQuery<MartyrsResponse | { error: string }>(
    {
      queryKey: ['landing-martyrs'],
      queryFn: async () => {
        const res = await fetch('/api/martyrs/landing')
        if (!res.ok) throw new Error('Failed to fetch landing martyrs')
        return res.json()
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes for landing page
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  )
}

// Hook for search functionality
export function useSearchMartyrs(query: string, enabled: boolean = false) {
  return useQuery<MartyrsResponse | { error: string }>(
    {
      queryKey: ['search-martyrs', query],
      queryFn: async () => {
        const res = await fetch(`/api/martyrs/search?q=${encodeURIComponent(query)}`)
        if (!res.ok) throw new Error('Failed to search martyrs')
        return res.json()
      },
      enabled: enabled && query.length > 2,
      staleTime: 2 * 60 * 1000, // 2 minutes for search results
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  )
}




