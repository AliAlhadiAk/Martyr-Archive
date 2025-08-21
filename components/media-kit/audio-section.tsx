"use client"

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, PlayCircle, PauseCircle, Link as LinkIcon, Volume2 } from 'lucide-react'

interface AudioFile {
  id: string
  title: string
  url: string
  duration: string
}

export function AudioSection({ audioFiles }: { audioFiles: AudioFile[] }) {
  const [playing, setPlaying] = useState<string | null>(null)
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})
  const [progress, setProgress] = useState<Record<string, number>>({})

  const handlePlay = (audioId: string, url: string) => {
    const current = audioRefs.current[audioId]
    // Pause others
    Object.entries(audioRefs.current).forEach(([id, el]) => {
      if (id !== audioId && el) {
        el.pause()
      }
    })

    if (!current) return
    if (playing === audioId && !current.paused) {
      current.pause()
      setPlaying(null)
    } else {
      current.play().catch(() => {})
      setPlaying(audioId)
    }
  }

  const handleDownload = async (id: string, title: string) => {
    try {
      // Use the proper download endpoint
      const response = await fetch(`/api/media-kit/audio/${id}/download`)
      
      if (!response.ok) {
        throw new Error('Download failed')
      }

      // Create blob and download
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${title}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)

      // Show success message (you can add toast here if needed)
      console.log(`Downloaded: ${title}`)
    } catch (error) {
      console.error('Download failed:', error)
      // Show error message (you can add toast here if needed)
    }
  }

  const copyLink = async (url: string) => {
    await navigator.clipboard.writeText(url)
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

              <audio
                ref={(el) => {
                  audioRefs.current[audio.id] = el
                }}
                src={audio.url}
                onTimeUpdate={(e) => {
                  const el = e.currentTarget
                  if (!el.duration) return
                  setProgress((p) => ({ ...p, [audio.id]: (el.currentTime / el.duration) * 100 }))
                }}
                onEnded={() => setPlaying((p) => (p === audio.id ? null : p))}
                className="hidden"
              />

              <div className="mt-3 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  style={{ width: `${Math.min(100, Math.max(0, progress[audio.id] ?? 0)).toFixed(2)}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-4 gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePlay(audio.id, audio.url)}
                >
                  {playing === audio.id ? (
                    <PauseCircle className="h-8 w-8 text-blue-400" />
                  ) : (
                    <PlayCircle className="h-8 w-8 text-blue-400" />
                  )}
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyLink(audio.url)}
                    title="نسخ الرابط"
                  >
                    <LinkIcon className="h-6 w-6 text-white/60" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(audio.id, audio.title)}
                    title="تحميل"
                  >
                    <Download className="h-6 w-6 text-white/60" />
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