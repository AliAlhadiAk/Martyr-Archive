"use client"

import { useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AudioUpload } from "@/components/admin/audio-upload"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AudioFile {
  id: string
  title: string
  url: string
  createdAt: string
}

export default function AudioManagementPage() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/media-kit/audio')
        if (!res.ok) return
        const data = await res.json()
        const mapped: AudioFile[] = (data.audioFiles ?? []).map((a: any) => ({
          id: a.id,
          title: a.title,
          url: a.url,
          createdAt: new Date().toISOString(),
        }))
        setAudioFiles(mapped)
      } catch {}
    }
    load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف الصوتي؟')) return

    try {
      const res = await fetch(`/api/admin/audio/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete')
      
      setAudioFiles(files => files.filter(file => file.id !== id))
    } catch (error) {
      console.error('Delete failed:', error)
    }
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
            }} />
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">الملفات الصوتية المتوفرة</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">العنوان</TableHead>
                  <TableHead className="text-white">تاريخ الرفع</TableHead>
                  <TableHead className="text-white w-24">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audioFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="text-white/90">{file.title}</TableCell>
                    <TableCell className="text-white/70">
                      {new Date(file.createdAt).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(file.id)}
                        className="text-red-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}