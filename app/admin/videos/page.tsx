"use client"

import { useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoUpload } from "@/components/admin/video-upload"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2, Video, Clock, FileText, Download, Calendar, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from "@/components/ui/use-toast"

interface VideoFile {
  id: string
  title: string
  url: string
  createdAt: string
  duration?: string
  size?: string
  category?: string
  description?: string
  downloads?: number
  thumbnail?: string
}

export default function VideoManagementPage() {
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/media-kit/videos')
        if (!res.ok) return
        const data = await res.json()
        const mapped: VideoFile[] = (data.videoFiles ?? []).map((v: any) => ({
          id: v.id,
          title: v.title,
          url: v.url,
          createdAt: v.createdAt || new Date().toISOString(),
          duration: v.duration,
          size: v.size,
          category: v.category,
          description: v.description,
          downloads: v.downloads || 0,
          thumbnail: v.thumbnail,
        }))
        setVideoFiles(mapped)
      } catch (error) {
        console.error('Failed to load video files:', error)
        toast({
          title: "خطأ في التحميل",
          description: "فشل في تحميل ملفات الفيديو",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [toast])

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف ملف الفيديو هذا؟')) return

    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')
      
      setVideoFiles(files => files.filter(file => file.id !== id))
      
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف ملف الفيديو",
      })
    } catch (error) {
      console.error('Delete failed:', error)
      toast({
        title: "فشل الحذف",
        description: "حدث خطأ أثناء حذف الملف",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async (id: string, title: string) => {
    try {
      // Ensure id is a string
      if (typeof id !== 'string') {
        console.error('Invalid ID type:', typeof id, id)
        toast({
          title: "خطأ في المعرف",
          description: "معرف الملف غير صحيح",
          variant: "destructive",
        })
        return
      }

      // Check if it's a local file (fallback)
      if (id.startsWith('local-')) {
        toast({
          title: "لا يمكن التحميل",
          description: "هذا الملف محفوظ محلياً ولا يمكن تحميله",
          variant: "destructive",
        })
        return
      }

      // Download the file
      const response = await fetch(`/api/admin/videos/${id}`)
      
      if (!response.ok) {
        throw new Error('Download failed')
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Update download count
      setVideoFiles(files => 
        files.map(file => 
          file.id === id 
            ? { ...file, downloads: (file.downloads || 0) + 1 }
            : file
        )
      )

      toast({
        title: "تم التحميل بنجاح",
        description: "تم بدء تحميل ملف الفيديو",
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-SA')
    } catch {
      return 'غير محدد'
    }
  }

  const formatFileSize = (sizeString?: string) => {
    if (!sizeString) return 'غير محدد'
    return sizeString
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-white/60">جاري التحميل...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <Video className="w-6 h-6 text-green-400" />
          <h1 className="text-2xl font-bold text-white">إدارة ملفات الفيديو</h1>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">رفع ملف فيديو جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <VideoUpload onUploadComplete={(file) => {
              setVideoFiles(prev => [...prev, file])
              toast({
                title: "تم الرفع بنجاح",
                description: "تم إضافة ملف الفيديو إلى المكتبة",
              })
            }} />
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">ملفات الفيديو المتوفرة ({videoFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {videoFiles.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <Video className="w-16 h-16 mx-auto mb-4 text-white/40" />
                <p>لا توجد ملفات فيديو متوفرة</p>
                <p className="text-sm text-white/40 mt-2">قم برفع ملف فيديو جديد لبدء الاستخدام</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">العنوان</TableHead>
                    <TableHead className="text-white">المدة</TableHead>
                    <TableHead className="text-white">الحجم</TableHead>
                    <TableHead className="text-white">التصنيف</TableHead>
                    <TableHead className="text-white">التحميلات</TableHead>
                    <TableHead className="text-white">تاريخ الرفع</TableHead>
                    <TableHead className="text-white w-24">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videoFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="text-white/90">
                        <div className="flex items-center gap-3">
                          {file.thumbnail && (
                            <div className="w-16 h-12 bg-white/10 rounded overflow-hidden">
                              <img 
                                src={file.thumbnail} 
                                alt={file.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{file.title}</div>
                            {file.description && (
                              <div className="text-sm text-white/60 mt-1 line-clamp-2">
                                {file.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/70">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{file.duration || 'غير محدد'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/70">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{formatFileSize(file.size)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/70">
                        {file.category ? (
                          <Badge variant="outline" className="text-white/80 border-white/20">
                            {file.category}
                          </Badge>
                        ) : (
                          <span className="text-white/40">غير محدد</span>
                        )}
                      </TableCell>
                      <TableCell className="text-white/70">
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          <span>{file.downloads}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/70">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(file.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(file.url, '_blank')}
                            title="معاينة الفيديو"
                            className="text-blue-400 hover:text-blue-500 hover:bg-blue-500/10"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (file.id) {
                                handleDownload(file.id, file.title)
                              } else {
                                console.error('File ID is missing:', file)
                                toast({
                                  title: "خطأ في المعرف",
                                  description: "معرف الملف مفقود",
                                  variant: "destructive",
                                })
                              }
                            }}
                            title="تحميل الفيديو"
                            className="text-green-400 hover:text-green-500 hover:bg-green-500/10"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (file.id) {
                                handleDelete(file.id)
                              } else {
                                console.error('File ID is missing:', file)
                                toast({
                                  title: "خطأ في المعرف",
                                  description: "معرف الملف مفقود",
                                  variant: "destructive",
                                })
                              }
                            }}
                            title="حذف الفيديو"
                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


