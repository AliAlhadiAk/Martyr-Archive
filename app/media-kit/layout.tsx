import { Sparkles } from 'lucide-react'

export default function MediaKitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const links = [
    {
      href: '/media-kit/ai-generator',
      label: 'مولد المحتوى الذكي',
      icon: Sparkles,
    },
  ]

  return <>{children}</>
}