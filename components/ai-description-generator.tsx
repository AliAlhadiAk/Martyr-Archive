"use client"

import { useState, useCallback, memo } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Sparkles, Loader2, Copy, Check } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

// Memoize the generated content card
const GeneratedContent = memo(({ text, onCopy, copied }: { 
  text: string
  onCopy: () => void
  copied: boolean 
}) => (
  <Card className="p-4 bg-white/5 border-white/10">
    <div className="prose prose-invert max-w-none">
      <div className="whitespace-pre-wrap text-white/90 font-dg-mataryah text-lg leading-relaxed">
        {text}
      </div>
    </div>
    <Button
      variant="ghost"
      size="lg"
      onClick={onCopy}
      className="mt-4 text-lg"
    >
      {copied ? (
        <Check className="w-5 h-5 mr-2" />
      ) : (
        <Copy className="w-5 h-5 mr-2" />
      )}
      {copied ? 'تم النسخ' : 'نسخ النص'}
    </Button>
  </Card>
))

GeneratedContent.displayName = 'GeneratedContent'

export function AIDescriptionGenerator({ onGenerate, defaultPrompt }: { 
  onGenerate: (text: string) => void
  defaultPrompt?: string 
}) {
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState(defaultPrompt || '')
  const [generatedText, setGeneratedText] = useState('')
  const [copied, setCopied] = useState(false)

  // Debounce prompt changes
  const debouncedPrompt = useDebounce(prompt, 500)

  const generateDescription = useCallback(async () => {
    if (!debouncedPrompt.trim()) return
    
    try {
      setLoading(true)
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `Create an engaging social media post description about this martyr. 
                  The post should be respectful, impactful, and suitable for social sharing.
                  Make it concise but meaningful. Use the following details: ${debouncedPrompt}` 
        })
      })
      
      if (!res.ok) throw new Error('Generation failed')
      
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (text) {
        setGeneratedText(text)
        onGenerate(text)
      }
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setLoading(false)
    }
  }, [debouncedPrompt, onGenerate])

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(generatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [generatedText])

  return (
    <div className="space-y-4 w-full max-w-3xl mx-auto">
      <div className="relative">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="اكتب تفاصيل المنشور..."
          className="h-32 md:h-40 resize-none bg-white/5 border-white/10 text-white placeholder:text-white/50 text-base md:text-lg"
          dir="rtl"
        />
      </div>
      
      <Button
        onClick={generateDescription}
        disabled={loading || !prompt.trim()}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white text-base md:text-lg py-4 md:py-6"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2" />
        )}
        توليد وصف المنشور
      </Button>

      {generatedText && (
        <GeneratedContent 
          text={generatedText}
          onCopy={copyToClipboard}
          copied={copied}
        />
      )}
    </div>
  )
}