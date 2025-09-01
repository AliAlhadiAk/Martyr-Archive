
import { ResponsiveNavbar } from "@/components/responsive-navbar"
import { HomeSections } from "@/components/home-sections"
import { PerformanceMonitor } from "@/components/performance-monitor"

// Force static generation for better performance
export const dynamic = "force-static"
export const revalidate = 600 // 10 minutes instead of 5 minutes

// Add metadata for better SEO and performance
export const metadata = {
  title: 'الارشيف الرقمي للسعداء - منصة أرشيف رقمية لحفظ وتوثيق سير الشهداء',
  description: 'منصة أرشيف رقمية لحفظ وتوثيق سير الشهداء. نقدّم بطاقات تعريفية، قصصًا موثّقة، وصوتيات ومواد إعلامية يمكن للصحفيين والمصممين استخدامها.',
  keywords: 'شهداء، أرشيف، فلسطين، غزة، توثيق، تاريخ',
  openGraph: {
    title: 'الارشيف الرقمي للسعداء',
    description: 'منصة أرشيف رقمية لحفظ وتوثيق سير الشهداء',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <ResponsiveNavbar />
      <HomeSections />
      <PerformanceMonitor />
    </main>
  )
}
