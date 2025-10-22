"use client"

import NextDynamic from "next/dynamic"
import { Suspense, memo } from "react"

// -----------------------------
// Dynamic imports with optimized loading
// -----------------------------
const SharedBackground = NextDynamic(
  () => import("@/components/shared-background").then(m => m.SharedBackground),
  {
    ssr: false,
    loading: () => <BackgroundFallback />,
  }
)

const OptimizedHero = NextDynamic(
  () => import("@/components/optimized-hero").then(m => m.OptimizedHero),
  {
    ssr: false,
    loading: () => <HeroFallback />,
  }
)

const MemoryWallFixed = NextDynamic(
  () => import("@/components/memory-wall-fixed").then(m => m.MemoryWallFixed),
  {
    ssr: false,
    loading: () => <MemoryWallFallback />,
  }
)

// -----------------------------
// Fallback Components (lightweight & reusable)
// -----------------------------
const BackgroundFallback = memo(() => (
  <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-black" />
))
BackgroundFallback.displayName = "BackgroundFallback"

const HeroFallback = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-black">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
      <div className="text-white/70 text-lg font-dg-mataryah">جاري تحميل الصفحة الرئيسية...</div>
    </div>
  </div>
))
HeroFallback.displayName = "HeroFallback"

const MemoryWallFallback = memo(() => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-white text-center">
      <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
      <div className="text-white/70">جاري تحميل جدار الذاكرة...</div>
    </div>
  </div>
))
MemoryWallFallback.displayName = "MemoryWallFallback"

// -----------------------------
// Senior Error Boundary
// -----------------------------
import { Component, ReactNode } from "react"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("Component error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}
// -----------------------------
// Main Home Sections
// -----------------------------
export function HomeSections() {
  return (
    <>
      {/* Shared background */}
      <ErrorBoundary fallback={<BackgroundFallback />}>
        <Suspense fallback={<BackgroundFallback />}>
          <SharedBackground variant="default" />
        </Suspense>
      </ErrorBoundary>

      {/* Hero Section */}
      <ErrorBoundary fallback={<HeroFallback />}>
       <Suspense fallback={<HeroFallback />}>
          <OptimizedHero />
        </Suspense>
      </ErrorBoundary>

      {/* Memory Wall Section (load after Hero for better performance) */}
      <ErrorBoundary
        fallback={
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-red-400 text-xl mb-4">خطأ في تحميل جدار الذاكرة</div>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        }
      >
        <Suspense fallback={<MemoryWallFallback />}>
          <MemoryWallFixed />
        </Suspense>
      </ErrorBoundary>
    </>
  )
}
