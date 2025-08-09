"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Loader2 } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"

interface AudioUploadProps {
  onUploadComplete: (file: { id: string; title: string; url: string; createdAt: string }) => void
}

export function AudioUpload({ onUploadComplete }: AudioUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload-audio', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')
      
      const data = await res.json()
      onUploadComplete(data)
      setFile(null)
      
      toast({
        title: "تم رفع الملف بنجاح",
        description: "تم إضافة الملف الصوتي إلى المكتبة",
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

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-white bg-white/5 border-white/10"
      />
      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-800"
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Upload className="w-4 h-4 mr-2" />
        )}
        رفع الملف الصوتي
      </Button>
    </div>
  )
}