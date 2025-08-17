"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Loader2, Video, X } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface VideoUploadProps {
  onUploadComplete: (file: { 
    id: string; 
    title: string; 
    url: string; 
    createdAt: string; 
    duration: string;
    size: string;
    category: string;
    description: string;
    thumbnail?: string;
  }) => void
}

export function VideoUpload({ onUploadComplete }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('فيديو تعريفي')
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    
    if (selectedFile) {
      // Auto-generate title from filename
      const fileName = selectedFile.name.replace(/\.[^.]+$/, '')
      setTitle(fileName)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('description', description)
      formData.append('category', category)

      const res = await fetch('/api/admin/upload-video', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')
      
      const data = await res.json()
      onUploadComplete(data)
      setFile(null)
      setTitle('')
      setDescription('')
      setCategory('فيديو تعريفي')
      
      toast({
        title: "تم رفع الملف بنجاح",
        description: `تم إضافة "${data.title}" إلى المكتبة`,
      })
    } catch (error) {
      console.error('Upload failed:', error)
      toast({
        title: "فشل رفع الملف",
        description: "حدث خطأ أثناء رفع الملف. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setFile(null)
    setTitle('')
    setDescription('')
    setCategory('فيديو تعريفي')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getVideoDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const url = URL.createObjectURL(file)
      
      video.addEventListener('loadedmetadata', () => {
        const duration = video.duration
        const minutes = Math.floor(duration / 60)
        const seconds = Math.floor(duration % 60)
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`)
        URL.revokeObjectURL(url)
      })
      
      video.addEventListener('error', () => {
        resolve('غير محدد')
        URL.revokeObjectURL(url)
      })
      
      video.src = url
    })
  }

  const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const url = URL.createObjectURL(file)
      
      video.addEventListener('loadeddata', () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (ctx) {
          canvas.width = 320
          canvas.height = 180
          ctx.drawImage(video, 0, 0, 320, 180)
          
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8)
          resolve(thumbnailUrl)
        } else {
          resolve('')
        }
        
        URL.revokeObjectURL(url)
      })
      
      video.addEventListener('error', () => {
        resolve('')
        URL.revokeObjectURL(url)
      })
      
      video.src = url
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="text-white bg-white/5 border-white/10"
        />
        
        {file && (
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center gap-3">
              <Video className="w-8 h-8 text-green-400" />
              <div className="flex-1">
                <div className="text-white font-medium">{file.name}</div>
                <div className="text-white/60 text-sm">
                  {formatFileSize(file.size)} • {file.type || 'video/mp4'}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Input
          placeholder="عنوان الفيديو (مطلوب)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-white bg-white/5 border-white/10"
        />
        
        <Textarea
          placeholder="وصف الفيديو (اختياري)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="text-white bg-white/5 border-white/10 min-h-[80px]"
        />
        
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
        >
          <option value="فيديو تعريفي">فيديو تعريفي</option>
          <option value="فيديو تعليمي">فيديو تعليمي</option>
          <option value="فيديو ترفيهي">فيديو ترفيهي</option>
          <option value="فيديو إخباري">فيديو إخباري</option>
          <option value="فيديو دعائي">فيديو دعائي</option>
        </select>
        
        <Button
          onClick={handleUpload}
          disabled={!file || !title || uploading}
          className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              جاري الرفع...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              رفع ملف الفيديو
            </>
          )}
        </Button>
      </div>

      <div className="text-xs text-white/50 text-center">
        يدعم ملفات الفيديو: MP4, MOV, AVI, WebM
      </div>
    </div>
  )
}


