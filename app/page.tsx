import { ResponsiveNavbar } from "@/components/responsive-navbar"
import { SharedBackground } from "@/components/shared-background"
import { OptimizedHero } from "@/components/optimized-hero"
import { MemoryWallFixed } from "@/components/memory-wall-fixed"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <ResponsiveNavbar />
      <SharedBackground variant="default" />
      <OptimizedHero />
      <MemoryWallFixed />
    </main>
  )
}
