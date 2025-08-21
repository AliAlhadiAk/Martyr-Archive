"use client"

import { useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AudioUpload } from "@/components/admin/audio-upload"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2, Music, Clock, FileText, Download, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from "@/components/ui/use-toast"

interface AudioFile {
  id: string
  title: string
  url: string
  createdAt: string
  duration?: string
  size?: string
  category?: string
  description?: string
  downloads?: number
}

export default function AudioManagementPage() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/media-kit/audio')
        if (!res.ok) return
        const data = await res.json()
        console.log('Raw audio data:', data) // Debug log
        
        const mapped: AudioFile[] = (data.audioFiles ?? []).map((a: any) => {
          console.log('Mapping audio item:', a) // Debug log
          return {
            id: String(a.id), // Ensure id is always a string
            title: a.title,
            url: a.url,
            createdAt: a.createdAt || new Date().toISOString(),
            duration: a.duration,
            size: a.size,
            category: a.category,
            description: a.description,
            downloads: a.downloads || 0,
          }
        })
        
        console.log('Mapped audio files:', mapped) // Debug log
        setAudioFiles(mapped)
      } catch (error) {
        console.error('Failed to load audio files:', error)
        toast({
          title: "خطأ في التحميل",
          description: "فشل في تحميل الملفات الصوتية",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [toast])

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف الصوتي؟')) return

    try {
      const res = await fetch(`/api/admin/audio/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')
      
      setAudioFiles(files => files.filter(file => file.id !== id))
      
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الملف الصوتي",
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
    console.log('handleDownload called with:', { id, title, idType: typeof id }) // Debug log
    
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
      const response = await fetch(`/api/admin/audio/${id}`)
      
      if (!response.ok) {
        throw new Error('Download failed')
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.mp3`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Update download count
      setAudioFiles(files => 
        files.map(file => 
          file.id === id 
            ? { ...file, downloads: (file.downloads || 0) + 1 }
            : file
        )
      )

      toast({
        title: "تم التحميل بنجاح",
        description: "تم بدء تحميل الملف الصوتي",
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
          <Music className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">إدارة الملفات الصوتية</h1>
        </div>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">رفع ملف صوتي جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <AudioUpload onUploadComplete={(file) => {
              setAudioFiles(prev => [...prev, file])
              toast({
                title: "تم الرفع بنجاح",
                description: "تم إضافة الملف الصوتي إلى المكتبة",
              })
            }} />
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">الملفات الصوتية المتوفرة ({audioFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {audioFiles.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <Music className="w-16 h-16 mx-auto mb-4 text-white/40" />
                <p>لا توجد ملفات صوتية متوفرة</p>
                <p className="text-sm text-white/40 mt-2">قم برفع ملف صوتي جديد لبدء الاستخدام</p>
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
                  {audioFiles.filter(file => file && file.id && file.title).map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="text-white/90">
                        <div>
                          <div className="font-medium">{file.title}</div>
                          {file.description && (
                            <div className="text-sm text-white/60 mt-1 line-clamp-2">
                              {file.description}
                            </div>
                          )}
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
                            className="text-blue-400 hover:text-blue-500 hover:bg-blue-500/10"
                            title="تحميل الملف"
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
                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                            title="حذف الملف"
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