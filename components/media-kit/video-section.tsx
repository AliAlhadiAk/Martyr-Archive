"use client"

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, PlayCircle, PauseCircle, Link as LinkIcon, Video, Clock, FileText, Star, Eye } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface VideoFile {
  id: string
  title: string
  url: string
  duration: string
  category?: string
  description?: string
  size?: string
  formats?: string[]
  downloads?: number
  createdAt?: string
  premium?: boolean
  thumbnail?: string
}

export function VideoSection({ videoFiles }: { videoFiles: VideoFile[] }) {
  const [playing, setPlaying] = useState<string | null>(null)
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})
  const { toast } = useToast()

  const handlePlay = (videoId: string, url: string) => {
    const current = videoRefs.current[videoId]
    // Pause others
    Object.entries(videoRefs.current).forEach(([id, el]) => {
      if (id !== videoId && el) {
        el.pause()
      }
    })

    if (!current) return
    if (playing === videoId && !current.paused) {
      current.pause()
      setPlaying(null)
    } else {
      current.play().catch(() => {})
      setPlaying(videoId)
    }
  }

  const handleDownload = async (videoId: string, title: string) => {
    try {
      // Use the download API endpoint
      const downloadUrl = `/api/media-kit/videos/${encodeURIComponent(videoId)}/download`
      
      // Create a temporary link element and trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${title}.mp4`
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "تم التحميل بنجاح",
        description: "تم تحميل ملف الفيديو",
      })
    } catch (error) {
      console.error('Download failed:', error)
      toast({
        title: "فشل التحميل",
        description: "حدث خطأ أثناء تحميل الملف",
        variant: "destructive",
      })
    }
  }

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: "تم نسخ الرابط",
        description: "تم نسخ رابط الفيديو إلى الحافظة",
      })
    } catch (error) {
      toast({
        title: "فشل نسخ الرابط",
        description: "حدث خطأ أثناء نسخ الرابط",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-SA')
    } catch {
      return 'غير محدد'
    }
  }

  if (videoFiles.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white mb-6 font-mj-ghalam">
          ملفات الفيديو
        </h2>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <Video className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 text-lg">لا توجد ملفات فيديو متوفرة حالياً</p>
            <p className="text-white/40 text-sm mt-2">سيتم إضافة ملفات فيديو قريباً</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Additional safety check
  if (!Array.isArray(videoFiles)) {
    console.error('videoFiles is not an array:', videoFiles)
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white mb-6 font-mj-ghalam">
          ملفات الفيديو
        </h2>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center">
            <Video className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 text-lg">خطأ في تحميل ملفات الفيديو</p>
            <p className="text-white/40 text-sm mt-2">يرجى تحديث الصفحة والمحاولة مرة أخرى</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6 font-mj-ghalam">
        ملفات الفيديو
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videoFiles.map((video) => (
          <Card key={video.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-white font-dg-mataryah line-clamp-2">
                    {video.title}
                  </CardTitle>
                  {video.premium && (
                    <Badge className="mt-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      مميز
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-white/60 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{video.duration}</span>
                </div>
              </div>
              
              {video.category && (
                <Badge variant="outline" className="text-white/80 border-white/20">
                  {video.category}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="pt-0">
              {/* Video Thumbnail/Preview */}
              <div className="relative mb-3 bg-black/30 rounded-lg overflow-hidden aspect-video">
                {video.thumbnail ? (
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-16 h-16 text-white/40" />
                  </div>
                )}
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlay(video.id, video.url)}
                    className="w-16 h-16 bg-white/20 hover:bg-white/30 text-white"
                  >
                    {playing === video.id ? (
                      <PauseCircle className="w-8 h-8" />
                    ) : (
                      <PlayCircle className="w-8 h-8" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Hidden video element for playback */}
              <video
                ref={(el) => {
                  videoRefs.current[video.id] = el
                }}
                src={video.url}
                onEnded={() => setPlaying((p) => (p === video.id ? null : p))}
                className="hidden"
                controls={false}
                preload="metadata"
              />

              {video.description && (
                <p className="text-white/70 text-sm mb-3 line-clamp-2">
                  {video.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-white/60 text-xs mb-3">
                {video.size && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>{video.size}</span>
                  </div>
                )}
                {video.downloads !== undefined && (
                  <div className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    <span>{video.downloads}</span>
                  </div>
                )}
                {video.createdAt && (
                  <div className="flex items-center gap-1">
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePlay(video.id, video.url)}
                  className="hover:bg-white/10"
                >
                  {playing === video.id ? (
                    <PauseCircle className="h-8 w-8 text-green-400" />
                  ) : (
                    <PlayCircle className="h-8 w-8 text-green-400" />
                  )}
                </Button>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyLink(video.url)}
                    title="نسخ الرابط"
                    className="hover:bg-white/10"
                  >
                    <LinkIcon className="h-6 w-6 text-white/60" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(video.id, video.title)}
                    title="تحميل"
                    className="hover:bg-white/10"
                  >
                    <Download className="h-6 w-6 text-white/60" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(video.url, '_blank')}
                    title="معاينة"
                    className="hover:bg-white/10"
                  >
                    <Eye className="h-6 w-6 text-white/60" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


