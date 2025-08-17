import React from 'react'
import { Music, LayoutDashboard, Users, Image, FileText, Video } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const links = [
    {
      href: '/admin',
      label: 'لوحة التحكم',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/martyrs',
      label: 'الشهداء',
      icon: Users,
    },
    {
      href: '/admin/media',
      label: 'الوسائط',
      icon: Image,
    },
    {
      href: '/admin/audio',
      label: 'الملفات الصوتية',
      icon: Music,
    },
    {
      href: '/admin/videos',
      label: 'ملفات الفيديو',
      icon: Video,
    },
    {
      href: '/admin/posts',
      label: 'المنشورات',
      icon: FileText,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Your existing navigation component */}
      <main>{children}</main>
    </div>
  )
}