"use client"

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, PlayCircle, PauseCircle } from 'lucide-react'

interface AudioFile {
  id: string
  title: string
  url: string
  duration: string
}

export function AudioSection({ audioFiles }: { audioFiles: AudioFile[] }) {
  const [playing, setPlaying] = useState<string | null>(null)

  const handlePlay = (audioId: string) => {
    if (playing === audioId) {
      setPlaying(null)
    } else {
      setPlaying(audioId)
    }
  }

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${title}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6 font-mj-ghalam">
        المقاطع الصوتية
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {audioFiles.map((audio) => (
          <Card key={audio.id} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg text-white font-dg-mataryah">{audio.title}</h3>
                <span className="text-sm text-white/60">{audio.duration}</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePlay(audio.id)}
                >
                  {playing === audio.id ? (
                    <PauseCircle className="h-8 w-8 text-blue-400" />
                  ) : (
                    <PlayCircle className="h-8 w-8 text-blue-400" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDownload(audio.url, audio.title)}
                >
                  <Download className="h-6 w-6 text-white/60" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}