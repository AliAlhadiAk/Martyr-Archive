"use client"

import { useEffect, useState, memo } from 'react'

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage?: number
  timestamp: number
}

const PerformanceMonitor = memo(() => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true)
    }

    // Measure page load time
    const loadTime = performance.now()
    
    // Measure render time
    const renderStart = performance.now()
    
    // Simulate render completion
    const renderComplete = () => {
      const renderTime = performance.now() - renderStart
      
      const performanceMetrics: PerformanceMetrics = {
        loadTime: Math.round(loadTime),
        renderTime: Math.round(renderTime),
        timestamp: Date.now()
      }
      
      setMetrics(performanceMetrics)
    }
    
    // Wait for next tick to measure render
    setTimeout(renderComplete, 0)
  }, [])

  if (!isVisible || !metrics) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-xl text-white p-4 rounded-lg border border-white/20 text-xs font-mono z-50">
      <div className="mb-2 font-bold">Performance Monitor</div>
      <div className="space-y-1">
        <div>Load: {metrics.loadTime}ms</div>
        <div>Render: {metrics.renderTime}ms</div>
        <div>Total: {metrics.loadTime + metrics.renderTime}ms</div>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-1 right-1 text-white/60 hover:text-white text-xs"
      >
        ×
      </button>
    </div>
  )
})

PerformanceMonitor.displayName = 'PerformanceMonitor'

export { PerformanceMonitor }
