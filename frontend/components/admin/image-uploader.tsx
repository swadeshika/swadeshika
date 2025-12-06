"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"

// Single-image uploader with client-side preview.
// - Designed for primary product image selection
// - Emits selected File and a preview URL to parent via onChange
// - No backend upload here; parent decides when/where to upload
interface ImageUploaderProps {
  label?: string
  onChange: (file: File | null, previewUrl: string | null) => void
  initialUrl?: string
}

export function ImageUploader({ label = "Upload image", onChange, initialUrl }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(initialUrl || null)
  const [manualUrl, setManualUrl] = useState("")

  // Programmatically open hidden file input
  const pick = () => inputRef.current?.click()
  // Generate preview URL and lift file to parent
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onChange(file, url)
  }
  
  const handleManualUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value
      setManualUrl(url)
      setPreview(url)
      onChange(null, url) // No file, just URL
  }

  // Clear current selection and preview
  const clear = () => {
    setPreview(null)
    setManualUrl("")
    if (inputRef.current) inputRef.current.value = ""
    onChange(null, null)
  }

  return (
    <div className="space-y-3">
      {/* Trigger button */}
      <div className="flex gap-2">
          <Button type="button" variant="outline" className="border-2 border-[#E8DCC8]" onClick={pick}>{label}</Button>
          <input
              type="text"
              placeholder="Or enter image URL"
              value={manualUrl}
              onChange={handleManualUrlChange}
              className="flex-1 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-[#E8DCC8] focus-visible:ring-[#2D5F3F]"
          />
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handle} />
      {preview && (
        // Preview card with a persistent Remove button (no hover dependency)
        <div className="rounded-md border-2 border-[#E8DCC8] overflow-hidden bg-white relative">
          <img src={preview} alt="preview" className="w-full h-40 object-cover" />
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 right-2 px-2 py-1 text-xs rounded-md bg-white/95 border-2 border-[#E8DCC8]"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  )
}
