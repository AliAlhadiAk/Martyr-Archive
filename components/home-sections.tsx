"use client"

import NextDynamic from "next/dynamic"
import { Suspense, memo } from "react"

// Lazy load components with better loading states
const SharedBackground = NextDynamic(() => import("@/components/shared-background").then(m => m.SharedBackground), {
	ssr: false,
	loading: () => (
		<div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-black" />
	),
})

const OptimizedHero = NextDynamic(() => import("@/components/optimized-hero").then(m => m.OptimizedHero), {
	ssr: false,
	loading: () => (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-black">
			<div className="text-center">
				<div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
				<div className="text-white/70 text-lg font-dg-mataryah">جاري تحميل الصفحة الرئيسية...</div>
			</div>
		</div>
	),
})

const MemoryWallFixed = NextDynamic(() => import("@/components/memory-wall-fixed").then(m => m.MemoryWallFixed), {
	ssr: false,
	loading: () => (
		<div className="min-h-screen bg-black flex items-center justify-center">
			<div className="text-white text-center">
				<div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
				<div className="text-white/70">جاري تحميل جدار الذاكرة...</div>
			</div>
		</div>
	),
})

// Error boundary component
const ErrorBoundary = memo(({ children, fallback }: { children: React.ReactNode, fallback: React.ReactNode }) => {
	try {
		return <>{children}</>
	} catch (error) {
		console.error('Component error:', error)
		return <>{fallback}</>
	}
})
ErrorBoundary.displayName = 'ErrorBoundary'

// Loading fallback component
const LoadingFallback = memo(() => (
	<div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center">
		<div className="text-center">
			<div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6" />
			<div className="text-white/70 text-xl font-dg-mataryah">جاري تحميل المحتوى...</div>
		</div>
	</div>
))
LoadingFallback.displayName = 'LoadingFallback'

export function HomeSections() {
  return (
    <>
      <ErrorBoundary fallback={<div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-black" />}>
        <Suspense fallback={<div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-black" />}>
          <SharedBackground variant="default" />
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary fallback={<LoadingFallback />}>
        <Suspense fallback={<LoadingFallback />}>
          <OptimizedHero />
        </Suspense>
      </ErrorBoundary>
      
      <ErrorBoundary fallback={
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
      }>
        <Suspense fallback={
          <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <div className="text-white/70">جاري تحميل جدار الذاكرة...</div>
            </div>
          </div>
        }>
          <MemoryWallFixed />
        </Suspense>
      </ErrorBoundary>
    </>
  )
}




