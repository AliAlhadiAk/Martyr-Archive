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

export function useMartyrs() {
  return useQuery<{ martyrs: MartyrApiItem[] } | { error: string }>(
    {
      queryKey: ['martyrs'],
      queryFn: async () => {
        const res = await fetch('/api/martyrs')
        if (!res.ok) throw new Error('Failed to fetch martyrs')
        return res.json()
      },
      staleTime: 60_000,
    }
  )
}




