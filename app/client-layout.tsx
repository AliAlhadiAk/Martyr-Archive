"use client"

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
})

interface ClientLayoutProps {
  children: ReactNode
  className: string
}

export function ClientLayout({ children, className }: ClientLayoutProps) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={className}
    >
      <body className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  )
}